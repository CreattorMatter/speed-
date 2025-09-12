import { supabase } from '../lib/supabaseClient';
import { DirectPdfService } from './directPdfService';
import { VisiblePdfService } from './visiblePdfService';
import { getCurrentUserPermissions } from './rbacService';

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
    
    const CHUNK_SIZE = 10; // Process 10 products at a time
    const useChunking = templates.length > CHUNK_SIZE;

    try {
      console.log(`📤 Iniciando envío. Modo chunking: ${useChunking}`);

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

      if (sendError) throw new Error(`Error creando envío: ${sendError.message}`);
      console.log('✅ Registro de envío creado:', sendData.id);

      let finalPdfBlob: Blob;

      if (useChunking) {
        // --- LÓGICA DE CHUNKING ---
        console.log(`📦 Procesando ${templates.length} templates en lotes de ${CHUNK_SIZE}`);
        const chunkUrls: string[] = [];
        const tempFolder = `temp/${sendData.id}`;

        for (let i = 0; i < templates.length; i += CHUNK_SIZE) {
          const chunk = templates.slice(i, i + CHUNK_SIZE);
          const chunkProducts = chunk.map(t => t.product);
          console.log(`🔄 Procesando lote ${i / CHUNK_SIZE + 1}...`);

          const chunkPdfBlob = await VisiblePdfService.generatePdfFromTemplates(
            chunk.map(c => c.template),
            chunkProducts,
            productChanges,
            financingCuotas,
            discountPercent
          );

          const chunkFileName = `${tempFolder}/chunk-${i / CHUNK_SIZE}.pdf`;
          const { error: uploadError } = await supabase.storage
            .from('posters')
            .upload(chunkFileName, chunkPdfBlob, { contentType: 'application/pdf' });

          if (uploadError) throw new Error(`Error subiendo lote: ${uploadError.message}`);
          chunkUrls.push(chunkFileName);
        }

        console.log('✨ Todos los lotes subidos, invocando al unificador...');
        const { error: mergeError } = await supabase.functions.invoke('pdf-merger', {
          body: { 
            pdfUrls: chunkUrls,
            finalPath: `merged/${sendData.id}.pdf`
          },
        });

        if (mergeError) throw new Error(`Error uniendo PDFs: ${mergeError.message}`);

        console.log('✅ PDF final unido en el servidor. Descargándolo para envío...');
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from('posters')
          .download(`merged/${sendData.id}.pdf`);
        
        if (downloadError) throw new Error(`Error descargando PDF final: ${downloadError.message}`);
        finalPdfBlob = downloadData;

      } else {
        // --- LÓGICA ORIGINAL (SIN CHUNKING) ---
        console.log('🖼️ Generando PDF único en el cliente...');
        try {
          finalPdfBlob = await VisiblePdfService.generatePdfFromTemplates(
            templates.map(t => t.template.template), // Correctly access the nested template object
            templates.map(t => t.product),
            productChanges,
            financingCuotas,
            discountPercent
          );
        } catch (error) {
          console.warn('⚠️ Fallback: Error con renderizado visible, intentando con servicio directo:', error);
          const pdfResult = await DirectPdfService.generatePdfFromTemplates(
            templates.map(t => ({ product: t.product, template: t.template.template })), // Correctly access the nested template object
            productChanges,
            financingCuotas,
            discountPercent
          );
          finalPdfBlob = pdfResult.blob;
        }
      }

      console.log('✅ PDF final listo para distribuir:', finalPdfBlob.size, 'bytes');

      // 3. Subir y crear registros para cada grupo
      const sendItems: PosterSendItem[] = [];

      for (const group of groups) {
        const filename = `${sendData.id}/${group.id}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('posters')
          .upload(filename, finalPdfBlob, { contentType: 'application/pdf', upsert: false });

        if (uploadError) throw new Error(`Error subiendo PDF para ${group.name}: ${uploadError.message}`);

        const { data: itemData, error: itemError } = await supabase
          .from('poster_send_items')
          .insert({ send_id: sendData.id, group_id: group.id, group_name: group.name, pdf_url: `posters/${filename}`, pdf_filename: `cartel-${Date.now()}.pdf`, status: 'sent' })
          .select().single();

        if (itemError) throw new Error(`Error creando registro para ${group.name}: ${itemError.message}`);
        sendItems.push(itemData);
      }

      // 4. Marcar envío como completado
      await supabase.from('poster_sends').update({ status: 'sent' }).eq('id', sendData.id);

      console.log('🎉 Envío completado exitosamente');
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
   * Filtra por grupos del usuario si no tiene permisos para ver todos
   */
  static async getReceivedPosters(): Promise<PosterSendItem[]> {
    try {
      // Obtener permisos del usuario actual
      const userPermissions = await getCurrentUserPermissions();
      const canViewAll = userPermissions.hasPermission('group:view_all') || 
                        userPermissions.hasPermission('admin:system');

      let query = supabase
        .from('poster_send_items')
        .select(`
          *,
          poster_sends!inner (
            template_name,
            products_count,
            created_at,
            target_groups
          )
        `);

      // Si no puede ver todos, filtrar por grupos del usuario
      if (!canViewAll && userPermissions.groups.length > 0) {
        const userGroupIds = userPermissions.groups.map(g => g.id);
        console.log('🔒 Filtrando por grupos del usuario:', userGroupIds);
        // Filtrar elementos que fueron enviados a alguno de los grupos del usuario
        query = query.overlaps('poster_sends.target_groups', userGroupIds);
      } else if (!canViewAll) {
        console.log('🔒 Usuario sin grupos - sin elementos recibidos');
        return []; // Usuario sin grupos no puede ver nada
      }

      const { data: items, error: itemsError } = await query.order('created_at', { ascending: false });

      if (itemsError) {
        console.error('❌ Error obteniendo recibidos:', itemsError);
        throw new Error(`Error obteniendo recibidos: ${itemsError.message}`);
      }

      console.log(`📥 Elementos recibidos obtenidos: ${(items || []).length}`);
      return items || [];

    } catch (error) {
      console.error('❌ Error en getReceivedPosters:', error);
      throw error;
    }
  }

  // 🔒 Control de estado para prevenir descargas duplicadas
  private static downloadingFiles = new Set<string>();
  private static readonly DOWNLOAD_TIMEOUT = 30000; // 30 segundos
  private static readonly MAX_RETRIES = 3;

  /**
   * Descarga un PDF desde Supabase Storage con control robusto de errores
   */
  static async downloadPDF(pdfUrl: string, filename: string): Promise<void> {
    const downloadKey = `${pdfUrl}-${filename}`;
    
    // 🚫 Prevenir descargas duplicadas
    if (this.downloadingFiles.has(downloadKey)) {
      console.warn('⚠️ Descarga ya en progreso para:', filename);
      throw new Error('Descarga ya en progreso. Por favor espere.');
    }

    this.downloadingFiles.add(downloadKey);
    
    try {
      console.log('📥 Iniciando descarga PDF:', pdfUrl);
      console.log('📁 Filename:', filename);

      // 🔄 Implementar reintentos con backoff exponencial
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
        try {
          console.log(`🔄 Intento ${attempt}/${this.MAX_RETRIES}`);
          
          // ⏱️ Implementar timeout para la descarga
          const downloadPromise = this.performDownload(pdfUrl, filename);
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: La descarga tardó demasiado')), this.DOWNLOAD_TIMEOUT);
          });
          
          await Promise.race([downloadPromise, timeoutPromise]);
          
          console.log('✅ PDF descargado exitosamente:', filename);
          
          // Marcar como descargado si es un item recibido
          await this.markAsDownloaded(pdfUrl);
          
          return; // Éxito, salir del bucle de reintentos
          
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Error desconocido');
          console.warn(`⚠️ Intento ${attempt} falló:`, lastError.message);
          
          // Si no es el último intento, esperar antes de reintentar
          if (attempt < this.MAX_RETRIES) {
            const delay = Math.pow(2, attempt - 1) * 1000; // Backoff exponencial: 1s, 2s, 4s
            console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // Si llegamos aquí, todos los intentos fallaron
      throw new Error(`Error después de ${this.MAX_RETRIES} intentos: ${lastError?.message || 'Error desconocido'}`);
      
    } finally {
      // 🧹 Siempre limpiar el estado de descarga
      this.downloadingFiles.delete(downloadKey);
    }
  }

  /**
   * Realiza la descarga real del PDF
   */
  private static async performDownload(pdfUrl: string, filename: string): Promise<void> {
    // Limpiar la URL del PDF para obtener solo el path
    const cleanPath = pdfUrl.replace('posters/', '');
    console.log('🔗 Clean path:', cleanPath);

    const { data, error } = await supabase.storage
      .from('posters')
      .download(cleanPath);

    if (error) {
      console.error('❌ Error descargando PDF:', error);
      throw new Error(`Error descargando PDF: ${error.message}`);
    }

    if (!data) {
      throw new Error('No se recibieron datos del PDF');
    }

    console.log('📦 Datos recibidos, tamaño:', data.size, 'bytes');

    // Validar que el archivo no esté vacío
    if (data.size === 0) {
      throw new Error('El archivo PDF está vacío');
    }

    // Crear blob y descargar
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    console.log('🔗 Blob URL creada:', url);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    console.log('🖱️ Iniciando descarga...');
    
    // 🎯 Mejorar la descarga con verificación
    return new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        try {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          URL.revokeObjectURL(url);
          console.log('🧹 Limpieza completada');
        } catch (cleanupError) {
          console.warn('⚠️ Error en limpieza:', cleanupError);
        }
      };
      
      // Configurar timeout para la descarga
      const downloadTimeout = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout: La descarga no se completó'));
      }, 10000); // 10 segundos para la descarga del archivo
      
      try {
        link.click();
        
        // Resolver después de un breve delay para permitir que la descarga inicie
        setTimeout(() => {
          clearTimeout(downloadTimeout);
          cleanup();
          resolve();
        }, 500);
        
      } catch (clickError) {
        clearTimeout(downloadTimeout);
        cleanup();
        reject(new Error(`Error iniciando descarga: ${clickError}`));
      }
    });
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
