/// <reference types="https://deno.land/x/deno/cli/types/dts/lib.deno.d.ts" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib@^1.17.1';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { pdfUrls, finalPath } = await req.json();

    if (!pdfUrls || !Array.isArray(pdfUrls) || pdfUrls.length === 0) {
      throw new Error('pdfUrls array is required.');
    }
    if (!finalPath) {
      throw new Error('finalPath is required.');
    }

    const dbBranch = Deno.env.get('SUPABASE_DB_BRANCH') ?? Deno.env.get('DB_BRANCH');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: {
            ...(dbBranch ? { 'X-Connection-Branch': dbBranch } : {})
          }
        }
      }
    );

    const mergedPdf = await PDFDocument.create();

    for (const url of pdfUrls) {
      const { data, error } = await supabaseAdmin.storage.from('posters').download(url);
      if (error) throw new Error(`Failed to download ${url}: ${error.message}`);

      const pdfBytes = await data.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();

    // Upload the final merged PDF
    const { error: uploadError } = await supabaseAdmin.storage
      .from('posters')
      .upload(finalPath, mergedPdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      throw new Error(`Failed to upload merged PDF: ${uploadError.message}`);
    }

    // Optional: Clean up the chunked PDFs
    await supabaseAdmin.storage.from('posters').remove(pdfUrls);

    return new Response(JSON.stringify({ success: true, path: finalPath }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
