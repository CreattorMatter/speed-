import { supabase } from '../lib/supabaseClient';
import { DirectPdfService } from './directPdfService';
import { VisiblePdfService } from './visiblePdfService';

export interface PosterSend {
  id: string;
  template_name: string;
  template_id?: string;
  products_count: number;
  created_by: string;
  created_at: string;
  status: 'sent' | 'failed' | 'pending';
}

export interface PosterSendItem {
  id: string;
  send_id: string;
  group_id: string;
  group_name: string;
  pdf_url: string;
  pdf_filename: string;
  created_at: string;
  downloaded_at?: string;
  status: 'sent' | 'downloaded' | 'failed';
}

export interface SendToBranchesRequest {
  templateName: string;
  templateId?: string;
  productsCount: number;
  groups: Array<{ id: string; name: string }>;
  selectedProducts: string[];
  templates: any[]; // Array de templates con productos
  productChanges: Record<string, any>;
  financingCuotas?: number;
  discountPercent?: number;
}

export class PosterSendService {
  /**
   * Envía un cartel a múltiples sucursales/grupos
   */
  static async sendToBranches(request: SendToBranchesRequest): Promise<PosterSend> {
    const { templateName, templateId, productsCount, groups, templates, productChanges, financingCuotas = 0, discountPercent = 0 } = request;
    
    // Extraer productos de los templates
    const products = templates.map(template => template.product).filter(Boolean);

    try {
      console.log('📤 Iniciando envío real a sucursales:', {
        template: templateName,
        groups: groups.length,
        products: productsCount
      });

      // 1. Crear registro principal de envío
      const { data: sendData, error: sendError } = await supabase
        .from('poster_sends')
        .insert({
          template_name: templateName,
          template_id: templateId,
          products_count: productsCount,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'pending'
        })
        .select()
        .single();

      if (sendError) {
        console.error('❌ Error creando registro de envío:', sendError);
        throw new Error(`Error creando envío: ${sendError.message}`);
      }

      console.log('✅ Registro de envío creado:', sendData.id);

      // 2. Generar PDF usando el nuevo servicio de renderizado visible
      console.log('🖼️ Generando PDF del cartel con nuevo servicio visible...');
      
      let pdfBlob: Blob;
      let filename: string;
      let size: number;
      
      try {
        // Intentar con el nuevo servicio de renderizado visible
        pdfBlob = await VisiblePdfService.generatePdfFromTemplates(
          templates,
          products,
          productChanges,
          financingCuotas,
          discountPercent
        );
        filename = `cartel-${Date.now()}.pdf`;
        size = pdfBlob.size;
        console.log('✅ PDF generado con renderizado visible exitosamente');
      } catch (error) {
        console.warn('⚠️ Fallback: Error con renderizado visible, intentando con servicio directo:', error);
        
        // Fallback al servicio anterior
        const pdfResult = await DirectPdfService.generatePdfFromTemplates(
          templates,
          productChanges,
          financingCuotas,
          discountPercent
        );
        pdfBlob = pdfResult.blob;
        filename = pdfResult.filename;
        size = pdfResult.size;
        console.log('✅ PDF generado con servicio directo (fallback)');
      }

      console.log('✅ PDF generado:', filename, 'Tamaño:', size);

      // 3. Subir y crear registros para cada grupo
      const sendItems: PosterSendItem[] = [];

      for (const group of groups) {
        try {
          console.log(`📁 Subiendo PDF para grupo: ${group.name}`);

          // Subir PDF a Storage 
          const filename = `${sendData.id}/${group.id}.pdf`;
          const uploadBlob = pdfBlob;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('posters')
            .upload(filename, uploadBlob, {
              contentType: 'application/pdf',
              upsert: false
            });

          if (uploadError) {
            console.error(`❌ Error subiendo PDF para ${group.name}:`, uploadError);
            throw new Error(`Error subiendo PDF para ${group.name}: ${uploadError.message}`);
          }

          console.log(`✅ PDF subido para ${group.name}:`, uploadData.path);

          // Crear registro del item enviado
          const { data: itemData, error: itemError } = await supabase
            .from('poster_send_items')
            .insert({
              send_id: sendData.id,
              group_id: group.id,
              group_name: group.name,
              pdf_url: `posters/${filename}`,
              pdf_filename: `cartel-${Date.now()}.pdf`,
              status: 'sent'
            })
            .select()
            .single();

          if (itemError) {
            console.error(`❌ Error creando item para ${group.name}:`, itemError);
            throw new Error(`Error creando registro para ${group.name}: ${itemError.message}`);
          }

          sendItems.push(itemData);
          console.log(`✅ Item creado para ${group.name}:`, itemData.id);

        } catch (error) {
          console.error(`❌ Error procesando grupo ${group.name}:`, error);
          // Marcar el envío como fallido
          await supabase
            .from('poster_sends')
            .update({ status: 'failed' })
            .eq('id', sendData.id);
          throw error;
        }
      }

      // 4. Marcar envío como completado
      const { error: updateError } = await supabase
        .from('poster_sends')
        .update({ status: 'sent' })
        .eq('id', sendData.id);

      if (updateError) {
        console.warn('⚠️ Error actualizando status de envío:', updateError);
      }

      console.log('🎉 Envío completado exitosamente:', {
        sendId: sendData.id,
        itemsCreated: sendItems.length,
        groups: groups.map(g => g.name)
      });

      return sendData;

    } catch (error) {
      console.error('❌ Error en envío a sucursales:', error);
      throw error;
    }
  }

  /**
   * Obtiene los envíos realizados por el usuario actual
   */
  static async getSentPosters(): Promise<Array<PosterSend & { items: PosterSendItem[] }>> {
    try {
      const { data: sends, error: sendsError } = await supabase
        .from('poster_sends')
        .select(`
          *,
          poster_send_items (*)
        `)
        .order('created_at', { ascending: false });

      if (sendsError) {
        console.error('❌ Error obteniendo envíos:', sendsError);
        throw new Error(`Error obteniendo envíos: ${sendsError.message}`);
      }

      return (sends || []).map((send: any) => ({
        ...send,
        items: send.poster_send_items || []
      }));

    } catch (error) {
      console.error('❌ Error en getSentPosters:', error);
      throw error;
    }
  }

  /**
   * Obtiene los carteles recibidos para el usuario actual (según sus grupos)
   */
  static async getReceivedPosters(): Promise<PosterSendItem[]> {
    try {
      const { data: items, error: itemsError } = await supabase
        .from('poster_send_items')
        .select(`
          *,
          poster_sends!inner (
            template_name,
            products_count,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (itemsError) {
        console.error('❌ Error obteniendo recibidos:', itemsError);
        throw new Error(`Error obteniendo recibidos: ${itemsError.message}`);
      }

      return items || [];

    } catch (error) {
      console.error('❌ Error en getReceivedPosters:', error);
      throw error;
    }
  }

  /**
   * Descarga un PDF desde Supabase Storage
   */
  static async downloadPDF(pdfUrl: string, filename: string): Promise<void> {
    try {
      console.log('📥 Descargando PDF:', pdfUrl);

      const { data, error } = await supabase.storage
        .from('posters')
        .download(pdfUrl.replace('posters/', ''));

      if (error) {
        console.error('❌ Error descargando PDF:', error);
        throw new Error(`Error descargando PDF: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se recibieron datos del PDF');
      }

      // Crear blob y descargar
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ PDF descargado exitosamente:', filename);

      // Marcar como descargado si es un item recibido
      await this.markAsDownloaded(pdfUrl);

    } catch (error) {
      console.error('❌ Error en downloadPDF:', error);
      throw error;
    }
  }

  /**
   * Marca un item como descargado
   */
  private static async markAsDownloaded(pdfUrl: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('poster_send_items')
        .update({ 
          downloaded_at: new Date().toISOString(),
          status: 'downloaded'
        })
        .eq('pdf_url', pdfUrl);

      if (error) {
        console.warn('⚠️ Error marcando como descargado:', error);
        // No lanzar error, es solo para tracking
      }
    } catch (error) {
      console.warn('⚠️ Error en markAsDownloaded:', error);
    }
  }

  /**
   * Obtiene la URL pública de un PDF (para preview si fuera necesario)
   */
  static async getPDFPublicUrl(pdfUrl: string): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from('posters')
        .getPublicUrl(pdfUrl.replace('posters/', ''));

      return data.publicUrl;
    } catch (error) {
      console.error('❌ Error obteniendo URL pública:', error);
      return null;
    }
  }
}
