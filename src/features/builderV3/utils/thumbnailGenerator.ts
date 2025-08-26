// =====================================
// THUMBNAIL GENERATOR V3 - Canvas to JPG
// =====================================

import domToImage from 'dom-to-image-improved';
import { supabase } from '../../../lib/supabaseClient';
import type { TemplateV3 } from '../types';

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  scale?: number;
  backgroundColor?: string;
}

export interface ThumbnailResult {
  url: string;
  width: number;
  height: number;
  size: number;
}

/**
 * 🎯 GENERAR THUMBNAIL DESDE CANVAS
 * Captura el canvas actual y lo convierte en JPG thumbnail
 */
export const generateThumbnailFromCanvas = async (
  canvasElement: HTMLElement,
  templateId: string,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> => {
  const {
    width = 800,        // 🎯 ANCHURA AUMENTADA A 800px
    height = 500,       // 🎯 ALTURA MANTENIDA EN 500px
    quality = 0.85,
    scale = 1,
    backgroundColor = '#ffffff'
  } = options;

  try {
    console.log('🖼️ Generando thumbnail para plantilla:', templateId);

    // =====================
    // OBTENER DIMENSIONES REALES DEL CANVAS
    // =====================
    
    const rect = canvasElement.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(canvasElement);
    
    // Detectar si el canvas está escalado por zoom
    const actualWidth = parseInt(computedStyle.width) || rect.width;
    const actualHeight = parseInt(computedStyle.height) || rect.height;
    
    console.log('📐 Dimensiones para captura:', { 
      actualWidth, 
      actualHeight, 
      rectWidth: rect.width, 
      rectHeight: rect.height,
      hasComponents: canvasElement.children.length,
      backgroundColor: backgroundColor
    });

    // =====================
    // CAPTURAR CANVAS COMO IMAGEN - CONFIGURACIÓN MEJORADA
    // =====================
    
    // Temporalmente resetear transformaciones del canvas para captura limpia
    const originalTransform = canvasElement.style.transform;
    const originalZoom = canvasElement.style.zoom;
    const originalScale = canvasElement.style.scale;
    
    // Resetear todas las transformaciones que puedan afectar la captura
    canvasElement.style.transform = 'none';
    canvasElement.style.zoom = '1';
    canvasElement.style.scale = '1';
    
    // Forzar el tamaño real del canvas para la captura
    const originalWidth = canvasElement.style.width;
    const originalHeight = canvasElement.style.height;
    
    // Quitar estilos visuales que desalinean (sombra/borde) para una captura centrada
    const originalBoxShadow = (canvasElement.style as any).boxShadow;
    const originalBorder = canvasElement.style.border;
    const originalMargin = canvasElement.style.margin;
    const originalLeft = canvasElement.style.left;
    const originalTop = canvasElement.style.top;
    canvasElement.style.boxShadow = 'none';
    canvasElement.style.border = 'none';
    canvasElement.style.margin = '0';
    canvasElement.style.left = '0';
    canvasElement.style.top = '0';

    // Obtener dimensiones informativas del template (no forzar px para evitar distorsión)
    const templateWidth = parseInt(canvasElement.getAttribute('data-template-width') || '0');
    const templateHeight = parseInt(canvasElement.getAttribute('data-template-height') || '0');
    
    console.log('🎯 Capturando canvas con dimensiones:', {
      width: canvasElement.style.width,
      height: canvasElement.style.height,
      templateWidth,
      templateHeight
    });
    
    // Esperar un momento para que se apliquen los estilos
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Ocultar overlays (regla, grilla, guías, selección) para una captura limpia
    const hiddenOverlays: HTMLElement[] = [];
    canvasElement.querySelectorAll('[data-overlay]')?.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl && htmlEl.style) {
        hiddenOverlays.push(htmlEl);
        htmlEl.style.display = 'none';
      }
    });

    // Envolver el canvas en un contenedor temporal centrado para la captura
    const wrapper = document.createElement('div');
    const parent = canvasElement.parentElement as HTMLElement;
    const originalNext = canvasElement.nextSibling;
    parent?.insertBefore(wrapper, canvasElement);
    wrapper.appendChild(canvasElement);
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.backgroundColor = backgroundColor;
    // El wrapper debe tener al menos el tamaño del canvas renderizado
    wrapper.style.width = `${rect.width}px`;
    wrapper.style.height = `${rect.height}px`;

    // Usar dom-to-image más robusto con scroll fix: convertir el wrapper completo, no solo viewport
    const dataUrl = await domToImage.toJpeg(wrapper, {
      quality,
      bgcolor: backgroundColor,
      cacheBust: true
    } as any);
    
    // Restaurar DOM y estilos originales
    if (originalNext) {
      parent?.insertBefore(canvasElement, originalNext);
    } else {
      parent?.appendChild(canvasElement);
    }
    wrapper.remove();
    canvasElement.style.transform = originalTransform;
    canvasElement.style.zoom = originalZoom;
    canvasElement.style.scale = originalScale;
    canvasElement.style.width = originalWidth;
    canvasElement.style.height = originalHeight;
    canvasElement.style.boxShadow = originalBoxShadow || '';
    canvasElement.style.border = originalBorder || '';
    canvasElement.style.margin = originalMargin || '';
    canvasElement.style.left = originalLeft || '';
    canvasElement.style.top = originalTop || '';

    // Restaurar overlays ocultos
    hiddenOverlays.forEach(el => (el.style.display = ''));

    // =====================
    // REDIMENSIONAR PARA THUMBNAIL
    // =====================
    
    const thumbnailCanvas = await resizeImageToThumbnail(dataUrl, width, height);
    
    // =====================
    // CONVERTIR A BLOB JPG
    // =====================
    
    const blob = await new Promise<Blob>((resolve, reject) => {
      thumbnailCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Error al crear blob JPG'));
        },
        'image/jpeg',
        quality
      );
    });

    // =====================
    // SUBIR A SUPABASE STORAGE
    // =====================
    
    const fileName = `template-${templateId}-${Date.now()}.jpg`;
    const filePath = `thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, blob, {
        upsert: true,
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      throw new Error(`Error al subir thumbnail: ${uploadError.message}`);
    }

    // =====================
    // OBTENER URL PÚBLICA
    // =====================
    
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      throw new Error('No se pudo obtener la URL del thumbnail');
    }

    console.log('✅ Thumbnail generado exitosamente:', urlData.publicUrl);

    return {
      url: urlData.publicUrl,
      width,
      height,
      size: blob.size
    };

  } catch (error) {
    console.error('❌ Error generando thumbnail:', error);
    throw error;
  }
};

/**
 * 🎨 REDIMENSIONAR IMAGEN PARA THUMBNAIL
 * Mantiene aspect ratio y centra la imagen
 */
const resizeImageToThumbnail = async (
  dataUrl: string, 
  targetWidth: number, 
  targetHeight: number
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('No se pudo crear contexto de canvas'));
        return;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Rellenar con fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calcular dimensiones manteniendo aspect ratio (con margen de seguridad)
      const sourceRatio = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;
      
      let drawWidth = targetWidth;
      let drawHeight = targetHeight;
      let drawX = 0;
      let drawY = 0;
      // Márgenes de seguridad: solo vertical para que el header no quede al ras
      const verticalPad = 0.06;   // 6% arriba/abajo
      const horizontalPad = 0;    // 0% izquierda/derecha

      if (sourceRatio > targetRatio) {
        // Imagen más ancha, ajustar por altura con padding vertical
        drawHeight = targetHeight * (1 - verticalPad * 2);
        drawWidth = drawHeight * sourceRatio;
        drawX = (targetWidth - drawWidth) / 2;
        drawY = (targetHeight - drawHeight) / 2;
      } else {
        // Imagen más alta, ajustar por ancho sin padding horizontal
        drawWidth = targetWidth * (1 - horizontalPad * 2); // horizontalPad=0 → ancho completo
        drawHeight = drawWidth / sourceRatio;
        drawX = (targetWidth - drawWidth) / 2;
        drawY = (targetHeight - drawHeight) / 2;
      }

      // Dibujar imagen redimensionada y centrada
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      
      resolve(canvas);
    };

    img.onerror = () => {
      reject(new Error('Error al cargar imagen para redimensionar'));
    };

    img.src = dataUrl;
  });
};

/**
 * 🗑️ ELIMINAR THUMBNAIL ANTERIOR
 * Limpia thumbnails viejos de Supabase Storage
 */
export const deleteThumbnail = async (thumbnailUrl: string): Promise<void> => {
  try {
    if (!thumbnailUrl.includes('supabase')) {
      console.log('⚠️ Thumbnail no está en Supabase, saltando eliminación');
      return;
    }

    // Extraer path del thumbnail desde la URL
    const urlParts = thumbnailUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `thumbnails/${fileName}`;

    const { error } = await supabase.storage
      .from('assets')
      .remove([filePath]);

    if (error) {
      console.warn('⚠️ Error eliminando thumbnail anterior:', error.message);
    } else {
      console.log('🗑️ Thumbnail anterior eliminado:', filePath);
    }
  } catch (error) {
    console.warn('⚠️ Error en eliminación de thumbnail:', error);
  }
};

/**
 * 🔍 ENCONTRAR ELEMENTO CANVAS
 * Busca el elemento canvas principal del BuilderV3
 */
export const findCanvasElement = (): HTMLElement | null => {
  // Intentar encontrar el canvas por diferentes selectores
  const selectors = [
    '[data-canvas="builderv3"]',
    '[data-testid="canvas-container"]',
    '.builder-canvas',
    '.canvas-container .relative.mx-auto.my-8', // Selector específico de CanvasEditorV3
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      // Verificar que el elemento tenga contenido renderizado
      const hasContent = element.children.length > 0 || element.innerHTML.trim().length > 0;
      if (hasContent) {
        console.log('📍 Canvas encontrado con selector:', selector);
        return element;
      }
    }
  }

  // Búsqueda alternativa: buscar por clase y atributos específicos
  const alternativeElements = document.querySelectorAll('.relative.mx-auto.my-8');
  for (const element of alternativeElements) {
    const htmlElement = element as HTMLElement;
    // Verificar si tiene estilos que indican que es un canvas
    const styles = window.getComputedStyle(htmlElement);
    if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      console.log('📍 Canvas encontrado por búsqueda alternativa');
      return htmlElement;
    }
  }

  console.warn('⚠️ No se encontró elemento canvas para thumbnail');
  return null;
};

/**
 * 🚀 GENERAR THUMBNAIL AUTOMÁTICO
 * Función principal que busca el canvas y genera el thumbnail
 */
export const generateThumbnailAutomatic = async (
  templateId: string,
  options?: ThumbnailOptions
): Promise<ThumbnailResult | null> => {
  try {
    const canvasElement = findCanvasElement();
    
    if (!canvasElement) {
      console.warn('⚠️ No se puede generar thumbnail: canvas no encontrado');
      return null;
    }

    // Validar que el canvas tenga dimensiones válidas
    const rect = canvasElement.getBoundingClientRect();
    if (rect.width < 50 || rect.height < 50) {
      console.warn('⚠️ Canvas demasiado pequeño para thumbnail:', { width: rect.width, height: rect.height });
      return null;
    }

    console.log('📐 Dimensiones del canvas:', { 
      width: rect.width, 
      height: rect.height,
      components: canvasElement.children.length 
    });

    // Esperar más tiempo para asegurar que el canvas esté completamente renderizado
    console.log('⏳ Esperando renderizado completo del canvas...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar que el canvas tenga contenido antes de capturar
    const hasVisibleContent = canvasElement.querySelector('[data-component-id]');
    if (!hasVisibleContent) {
      console.warn('⚠️ No se encontraron componentes visibles en el canvas');
    } else {
      console.log('✅ Canvas con componentes detectado, procediendo con captura');
    }

    const result = await generateThumbnailFromCanvas(canvasElement, templateId, options);
    
    console.log('🎉 Thumbnail generado automáticamente:', result.url);
    return result;

  } catch (error) {
    console.error('❌ Error en generación automática de thumbnail:', error);
    return null;
  }
};

/**
 * 📊 GENERAR MÚLTIPLES TAMAÑOS
 * Genera thumbnails en diferentes resoluciones
 */
export const generateThumbnailSizes = async (
  canvasElement: HTMLElement,
  templateId: string
): Promise<{ small: ThumbnailResult; medium: ThumbnailResult; large: ThumbnailResult }> => {
  const [small, medium, large] = await Promise.all([
    generateThumbnailFromCanvas(canvasElement, `${templateId}-small`, {
      width: 150,
      height: 188,
      quality: 0.7
    }),
    generateThumbnailFromCanvas(canvasElement, `${templateId}-medium`, {
      width: 300,
      height: 375,
      quality: 0.8
    }),
    generateThumbnailFromCanvas(canvasElement, `${templateId}-large`, {
      width: 600,
      height: 750,
      quality: 0.9
    })
  ]);

  return { small, medium, large };
};

/**
 * 🔧 GENERAR THUMBNAILS MASIVAMENTE PARA PLANTILLAS EXISTENTES
 * Útil para generar thumbnails para plantillas que fueron creadas antes del sistema
 */
export const generateThumbnailsForExistingTemplates = async (): Promise<void> => {
  console.log('🚀 INICIANDO GENERACIÓN MASIVA DE THUMBNAILS');
  console.log('=================================================');

  try {
    // Importar dinámicamente los servicios para evitar dependencias circulares
    const { templatesV3Service } = await import('../../../services/builderV3Service');
    
    // Obtener todas las plantillas de la base de datos
    const allTemplates = await templatesV3Service.getAll();
    console.log(`📋 Plantillas encontradas: ${allTemplates.length}`);
    
    // Filtrar plantillas sin thumbnail
    const templatesWithoutThumbnail = allTemplates.filter(template => !template.thumbnail);
    console.log(`🔍 Plantillas sin thumbnail: ${templatesWithoutThumbnail.length}`);
    
    if (templatesWithoutThumbnail.length === 0) {
      console.log('✅ Todas las plantillas ya tienen thumbnail!');
      return;
    }

    // ====================================================
    // GENERAR THUMBNAILS PLACEHOLDER PARA PLANTILLAS SIN CANVAS
    // ====================================================
    
    let successCount = 0;
    let errorCount = 0;

    for (const template of templatesWithoutThumbnail) {
      try {
        console.log(`🎨 Generando thumbnail placeholder para: ${template.name}`);
        
        // Crear un canvas virtual con los componentes de la plantilla
        const placeholderThumbnail = await generatePlaceholderThumbnail(template);
        
        if (placeholderThumbnail) {
          // Actualizar la plantilla con el nuevo thumbnail
          await templatesV3Service.update(template.id, {
            thumbnail: placeholderThumbnail.url,
            updatedAt: new Date()
          });
          
          console.log(`✅ Thumbnail generado para: ${template.name}`);
          successCount++;
        } else {
          console.warn(`⚠️ No se pudo generar thumbnail para: ${template.name}`);
          errorCount++;
        }
        
        // Esperar un momento entre generaciones para no sobrecargar
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error generando thumbnail para ${template.name}:`, error);
        errorCount++;
      }
    }

    console.log('=================================================');
    console.log('🎉 GENERACIÓN MASIVA COMPLETADA');
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📊 Total procesadas: ${templatesWithoutThumbnail.length}`);
    
  } catch (error) {
    console.error('❌ Error en generación masiva de thumbnails:', error);
  }
};

/**
 * 🎨 GENERAR THUMBNAIL PLACEHOLDER
 * Crea un thumbnail sintético basado en los componentes de la plantilla
 */
const generatePlaceholderThumbnail = async (template: TemplateV3): Promise<ThumbnailResult | null> => {
  try {
    // Crear un canvas virtual en memoria
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No se pudo crear contexto de canvas');
    }

    // Configurar dimensiones del thumbnail
    const thumbnailWidth = 800;
    const thumbnailHeight = 500;
    canvas.width = thumbnailWidth;
    canvas.height = thumbnailHeight;

    // Fondo de la plantilla
    const backgroundColor = template.canvas?.backgroundColor || '#ffffff';
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, thumbnailWidth, thumbnailHeight);

    // Agregar un gradiente sutil
    const gradient = ctx.createLinearGradient(0, 0, thumbnailWidth, thumbnailHeight);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)'); // blue-500 muy sutil
    gradient.addColorStop(1, 'rgba(147, 51, 234, 0.05)'); // purple-600 muy sutil
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, thumbnailWidth, thumbnailHeight);

    // Agregar información de la plantilla
    ctx.fillStyle = '#1f2937'; // gray-800
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(template.name, thumbnailWidth / 2, 60);

    // Información adicional
    ctx.fillStyle = '#6b7280'; // gray-500
    ctx.font = '16px Arial, sans-serif';
    const componentCount = template.defaultComponents?.length || 0;
    ctx.fillText(`${componentCount} elementos`, thumbnailWidth / 2, 90);

    // Dimensiones del canvas
    const canvasInfo = `${template.canvas?.width || 0} × ${template.canvas?.height || 0} px`;
    ctx.fillText(canvasInfo, thumbnailWidth / 2, 115);

    // Agregar elementos visuales representativos
    ctx.strokeStyle = '#e5e7eb'; // gray-200
    ctx.lineWidth = 2;
    
    // Rectángulos representando componentes
    const componentAreas = Math.min(componentCount, 6); // Máximo 6 rectángulos
    for (let i = 0; i < componentAreas; i++) {
      const x = 100 + (i % 3) * 200;
      const y = 180 + Math.floor(i / 3) * 120;
      const width = 150;
      const height = 80;
      
      ctx.fillStyle = `rgba(59, 130, 246, ${0.1 + (i * 0.05)})`; // blue con opacidad variable
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
    }

    // Agregar etiqueta del tipo de familia si está disponible
    if (template.familyType) {
      ctx.fillStyle = '#3b82f6'; // blue-500
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(template.familyType, thumbnailWidth / 2, thumbnailHeight - 30);
    }

    // Convertir a blob JPG
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Error al crear blob JPG'));
        },
        'image/jpeg',
        0.85
      );
    });

    // Subir a Supabase Storage
    const fileName = `template-${template.id}-placeholder-${Date.now()}.jpg`;
    const filePath = `thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, blob, {
        upsert: true,
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      throw new Error(`Error al subir thumbnail placeholder: ${uploadError.message}`);
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      throw new Error('No se pudo obtener la URL del thumbnail placeholder');
    }

    return {
      url: urlData.publicUrl,
      width: thumbnailWidth,
      height: thumbnailHeight,
      size: blob.size
    };

  } catch (error) {
    console.error('❌ Error generando thumbnail placeholder:', error);
    return null;
  }
};

/**
 * 🗑️ ELIMINAR THUMBNAIL ANTERIOR
 * Elimina un thumbnail del Storage cuando se actualiza la plantilla
 */
export const deletePreviousThumbnail = async (thumbnailUrl: string): Promise<void> => {
  if (!thumbnailUrl) return;

  try {
    // Extraer el path del thumbnail desde la URL
    const urlParts = thumbnailUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `thumbnails/${fileName}`;

    console.log(`🗑️ Eliminando thumbnail anterior: ${filePath}`);

    const { error } = await supabase.storage
      .from('assets')
      .remove([filePath]);

    if (error) {
      console.error('❌ Error eliminando thumbnail anterior:', error);
      // No fallar la operación por este error
    } else {
      console.log('✅ Thumbnail anterior eliminado exitosamente');
    }
  } catch (error) {
    console.error('❌ Error en deletePreviousThumbnail:', error);
    // No fallar la operación por este error
  }
};

/**
 * 🔍 DIAGNÓSTICO PROFUNDO DE THUMBNAILS
 * Analiza toda la cadena: Storage → Base de datos → UI
 */
export const diagnosticThumbnailSystem = async (): Promise<void> => {
  console.log('🔬 INICIANDO DIAGNÓSTICO PROFUNDO DEL SISTEMA DE THUMBNAILS');
  console.log('==============================================================');

  try {
    // PASO 1: Verificar Storage de Supabase
    console.log('\n📂 PASO 1: Verificando archivos en Supabase Storage...');
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('assets')
      .list('thumbnails');

    if (storageError) {
      console.error('❌ Error accediendo a Storage:', storageError);
      return;
    }

    console.log(`✅ Archivos en Storage/thumbnails: ${storageFiles?.length || 0}`);
    storageFiles?.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name} (${Math.round(file.metadata?.size / 1024 || 0)} KB)`);
    });

    // PASO 2: Verificar Base de Datos
    console.log('\n🗄️ PASO 2: Verificando campos thumbnail en base de datos...');
    const { templatesV3Service } = await import('../../../services/builderV3Service');
    const allTemplates = await templatesV3Service.getAll();
    
    console.log(`📋 Total plantillas en BD: ${allTemplates.length}`);
    
    const templatesWithThumbnail = allTemplates.filter(t => t.thumbnail);
    const templatesWithoutThumbnail = allTemplates.filter(t => !t.thumbnail);
    
    console.log(`✅ Con thumbnail: ${templatesWithThumbnail.length}`);
    console.log(`❌ Sin thumbnail: ${templatesWithoutThumbnail.length}`);

    // Mostrar detalles de las plantillas
    console.log('\n📊 DETALLES DE PLANTILLAS:');
    allTemplates.forEach((template, index) => {
      const hasThumb = !!template.thumbnail;
      const thumbUrl = template.thumbnail ? 
        (template.thumbnail.length > 60 ? template.thumbnail.substring(0, 60) + '...' : template.thumbnail) 
        : 'N/A';
      
      console.log(`   ${index + 1}. "${template.name}" - Thumbnail: ${hasThumb ? '✅' : '❌'}`);
      if (hasThumb) {
        console.log(`      URL: ${thumbUrl}`);
      }
    });

    // PASO 3: Verificar URLs públicas accesibles
    console.log('\n🌐 PASO 3: Verificando accesibilidad de URLs...');
    
    for (const template of templatesWithThumbnail.slice(0, 3)) { // Solo verificar las primeras 3
      try {
        console.log(`\n🔍 Verificando "${template.name}":`);
        console.log(`   URL: ${template.thumbnail}`);
        
        const response = await fetch(template.thumbnail, { method: 'HEAD' });
        const accessible = response.ok;
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        console.log(`   Accesible: ${accessible ? '✅' : '❌'} (${response.status})`);
        console.log(`   Tipo: ${contentType || 'N/A'}`);
        console.log(`   Tamaño: ${contentLength ? Math.round(parseInt(contentLength) / 1024) + ' KB' : 'N/A'}`);
        
        if (!accessible) {
          console.warn(`   ⚠️ URL no accesible: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error(`   ❌ Error verificando URL:`, error);
      }
    }

    // PASO 4: Verificar componente UI actual
    console.log('\n🎨 PASO 4: Verificando estado del componente UI...');
    
    // Buscar instancias de ImageWithFallback en el DOM
    const imageComponents = document.querySelectorAll('[data-component="image-fallback"]');
    console.log(`📱 Componentes ImageWithFallback encontrados: ${imageComponents.length}`);
    
    // Verificar TemplateCards
    const templateCards = document.querySelectorAll('[data-testid="template-card"]');
    console.log(`🃏 TemplateCards encontradas: ${templateCards.length}`);

    // PASO 5: Simular carga de imagen
    console.log('\n🧪 PASO 5: Simulando carga de imagen...');
    
    if (templatesWithThumbnail.length > 0) {
      const testTemplate = templatesWithThumbnail[0];
      const testUrl = testTemplate.thumbnail;
      
      try {
        const img = new Image();
        const loadPromise = new Promise<boolean>((resolve) => {
          img.onload = () => {
            console.log(`✅ Imagen carga correctamente:`);
            console.log(`   Dimensiones: ${img.naturalWidth}x${img.naturalHeight}`);
            resolve(true);
          };
          img.onerror = () => {
            console.log(`❌ Error cargando imagen`);
            resolve(false);
          };
        });
        
        img.src = testUrl;
        const loaded = await loadPromise;
        
        if (loaded) {
          console.log(`🎉 La imagen se puede cargar sin problemas!`);
        }
      } catch (error) {
        console.error(`❌ Error en simulación:`, error);
      }
    }

    // PASO 6: Verificar configuración de Supabase
    console.log('\n⚙️ PASO 6: Verificando configuración...');
    
    try {
      // Verificar que el bucket sea público
      const { data: bucketInfo } = await supabase.storage.getBucket('assets');
      console.log(`📦 Bucket 'assets' configuración:`, {
        public: bucketInfo?.public,
        allowedMimeTypes: bucketInfo?.allowed_mime_types
      });
    } catch (error) {
      console.error(`❌ Error verificando bucket:`, error);
    }

    console.log('\n==============================================================');
    console.log('🎯 RESUMEN DEL DIAGNÓSTICO:');
    console.log(`📂 Archivos en Storage: ${storageFiles?.length || 0}`);
    console.log(`🗄️ Plantillas con thumbnail en BD: ${templatesWithThumbnail.length}/${allTemplates.length}`);
    console.log(`🌐 Verificación de URLs: Ver logs arriba`);
    console.log('==============================================================');

    // RECOMENDACIONES
    console.log('\n💡 RECOMENDACIONES BASADAS EN EL DIAGNÓSTICO:');
    
    if (storageFiles && storageFiles.length > templatesWithThumbnail.length) {
      console.log('⚠️ HAY MÁS ARCHIVOS EN STORAGE QUE THUMBNAILS EN BD');
      console.log('   → Algunos thumbnails no se actualizaron en la base de datos');
      console.log('   → Ejecutar: await fixMissingThumbnailReferences()');
    }
    
    if (templatesWithThumbnail.length === 0 && storageFiles && storageFiles.length > 0) {
      console.log('🚨 PROBLEMA CRÍTICO: Archivos en Storage pero ninguna referencia en BD');
      console.log('   → Las plantillas no tienen el campo thumbnail actualizado');
    }

    if (templatesWithThumbnail.length > 0) {
      console.log('✅ Hay plantillas con thumbnails, verificar por qué no se muestran en UI');
      console.log('   → Revisar debug logs del componente ImageWithFallback');
      console.log('   → Verificar que las plantillas se estén re-renderizando');
    }

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
};

/**
 * 🔧 REPARAR REFERENCIAS DE THUMBNAILS FALTANTES
 * Asocia archivos de Storage con plantillas que no tienen thumbnail en BD
 */
export const fixMissingThumbnailReferences = async (): Promise<void> => {
  console.log('🔧 REPARANDO REFERENCIAS DE THUMBNAILS FALTANTES');
  console.log('================================================');

  try {
    // 1. Obtener archivos de Storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('assets')
      .list('thumbnails');

    if (storageError || !storageFiles) {
      console.error('❌ Error accediendo a Storage:', storageError);
      return;
    }

    // 2. Obtener plantillas sin thumbnail
    const { templatesV3Service } = await import('../../../services/builderV3Service');
    const allTemplates = await templatesV3Service.getAll();
    const templatesWithoutThumbnail = allTemplates.filter(t => !t.thumbnail);

    console.log(`📂 Archivos en Storage: ${storageFiles.length}`);
    console.log(`📋 Plantillas sin thumbnail: ${templatesWithoutThumbnail.length}`);

    // 3. Intentar asociar archivos con plantillas
    let fixedCount = 0;

    for (const template of templatesWithoutThumbnail) {
      // Buscar archivo que contenga el ID de la plantilla
      const matchingFile = storageFiles.find(file => 
        file.name.includes(template.id) || 
        file.name.includes(template.name.toLowerCase().replace(/\s+/g, '-'))
      );

      if (matchingFile) {
        // Generar URL pública
        const { data: urlData } = supabase.storage
          .from('assets')
          .getPublicUrl(`thumbnails/${matchingFile.name}`);

        if (urlData.publicUrl) {
          // Actualizar plantilla con thumbnail
          await templatesV3Service.update(template.id, {
            thumbnail: urlData.publicUrl,
            updatedAt: new Date()
          });

          console.log(`✅ Asociado "${template.name}" → ${matchingFile.name}`);
          fixedCount++;
        }
      }
    }

    console.log('================================================');
    console.log(`🎉 REPARACIÓN COMPLETADA: ${fixedCount} referencias corregidas`);

  } catch (error) {
    console.error('❌ Error en reparación:', error);
  }
};

/**
 * 🚨 FUNCIÓN DE EMERGENCIA - LIMPIAR ARCHIVOS DUPLICADOS
 * Elimina archivos duplicados del bucle infinito
 */
export const emergencyCleanupDuplicates = async (): Promise<void> => {
  console.log('🚨 INICIANDO LIMPIEZA DE EMERGENCIA');
  console.log('=================================');

  try {
    // Listar todos los archivos en thumbnails
    const { data: files, error } = await supabase.storage
      .from('assets')
      .list('thumbnails');

    if (error) {
      console.error('❌ Error listando archivos:', error);
      return;
    }

    if (!files) {
      console.log('ℹ️ No hay archivos para limpiar');
      return;
    }

    console.log(`📂 Total archivos encontrados: ${files.length}`);

    // Agrupar archivos por ID de plantilla para detectar duplicados
    const filesByTemplate = new Map<string, typeof files>();
    
    files.forEach(file => {
      // Extraer ID de plantilla del nombre del archivo
      const match = file.name.match(/template-([^-]+)-/);
      if (match) {
        const templateId = match[1];
        if (!filesByTemplate.has(templateId)) {
          filesByTemplate.set(templateId, []);
        }
        filesByTemplate.get(templateId)!.push(file);
      }
    });

    console.log(`🔍 Plantillas con archivos: ${filesByTemplate.size}`);

    // Identificar y limpiar duplicados
    let totalDeleted = 0;
    const filesToDelete: string[] = [];

    for (const [templateId, templateFiles] of filesByTemplate.entries()) {
      if (templateFiles.length > 1) {
        console.log(`⚠️ Plantilla ${templateId} tiene ${templateFiles.length} archivos duplicados`);
        
        // Ordenar por fecha de creación (más reciente primero)
        templateFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // Mantener solo el más reciente, eliminar el resto
        const toDelete = templateFiles.slice(1);
        toDelete.forEach(file => {
          filesToDelete.push(`thumbnails/${file.name}`);
          console.log(`🗑️ Marcado para eliminar: ${file.name}`);
        });
        
        totalDeleted += toDelete.length;
      }
    }

    // Eliminar archivos en lotes para evitar sobrecargar
    if (filesToDelete.length > 0) {
      console.log(`🧹 Eliminando ${filesToDelete.length} archivos duplicados...`);
      
      // Eliminar en lotes de 10
      const batchSize = 10;
      for (let i = 0; i < filesToDelete.length; i += batchSize) {
        const batch = filesToDelete.slice(i, i + batchSize);
        
        const { error: deleteError } = await supabase.storage
          .from('assets')
          .remove(batch);

        if (deleteError) {
          console.error(`❌ Error eliminando lote ${i}-${i + batch.length}:`, deleteError);
        } else {
          console.log(`✅ Eliminado lote ${i + 1}-${Math.min(i + batchSize, filesToDelete.length)}`);
        }

        // Esperar un poco entre lotes
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log('=================================');
    console.log(`🎉 LIMPIEZA COMPLETADA`);
    console.log(`🗑️ Archivos eliminados: ${totalDeleted}`);
    console.log(`📂 Archivos restantes: ${files.length - totalDeleted}`);

  } catch (error) {
    console.error('❌ Error en limpieza de emergencia:', error);
  }
};

// =====================================
// DOCUMENTACIÓN Y USO
// =====================================

/**
 * 📖 CÓMO USAR EL SISTEMA DE THUMBNAILS
 * 
 * Este sistema automáticamente genera thumbnails JPG cuando se guarda una plantilla.
 * 
 * CONFIGURACIÓN AUTOMÁTICA:
 * - Se integra automáticamente con el botón "Guardar" en ToolbarV3
 * - Genera thumbnails de 800x500px por defecto
 * - Guarda automáticamente en Supabase Storage bucket 'assets'
 * - Actualiza el campo 'thumbnail' en la base de datos
 * 
 * GENERACIÓN MASIVA PARA PLANTILLAS EXISTENTES:
 * - Ejecuta generateThumbnailsForExistingTemplates() en la consola
 * - Genera thumbnails placeholder para plantillas sin thumbnail
 * - Procesa todas las plantillas automáticamente
 * 
 * REQUISITOS:
 * - El canvas debe tener el atributo data-canvas="builderv3"
 * - Supabase debe estar configurado con el bucket 'assets'
 * - La dependencia 'dom-to-image-improved' debe estar instalada
 * 
 * PERSONALIZACIÓN:
 * - Modificar las opciones en saveTemplate() para cambiar resolución/calidad
 * - Usar generateThumbnailSizes() para múltiples resoluciones
 * - Ajustar selectors en findCanvasElement() si cambias la estructura del DOM
 * 
 * EJEMPLO DE USO MANUAL:
 * ```typescript
 * import { generateThumbnailAutomatic } from './thumbnailGenerator';
 * 
 * const result = await generateThumbnailAutomatic('template-123', {
 *   width: 600,      // Anchura personalizada
 *   height: 750,     // Altura personalizada
 *   quality: 0.9     // Calidad alta
 * });
 * 
 * if (result) {
 *   console.log('Thumbnail URL:', result.url);
 * }
 * ```
 * 
 * GENERACIÓN MASIVA:
 * ```typescript
 * import { generateThumbnailsForExistingTemplates } from './thumbnailGenerator';
 * 
 * // Generar thumbnails para todas las plantillas existentes sin thumbnail
 * await generateThumbnailsForExistingTemplates();
 * ```
 * 
 * ESTRUCTURA DE CARPETAS EN SUPABASE:
 * assets/
 * ├── thumbnails/
 * │   ├── template-123-1234567890.jpg
 * │   ├── template-456-placeholder-1234567891.jpg
 * │   └── ...
 * └── captures/
 *     └── ... (otros archivos de imágenes)
 */

console.log('🎨 Thumbnail Generator V3 cargado - Genera automáticamente JPG al guardar plantillas');

// =====================================
// EXPORTAR FUNCIÓN GLOBAL PARA CONSOLA
// =====================================

// Exportar función global para fácil acceso desde consola del navegador
(window as any).generateThumbnailsForExistingTemplates = generateThumbnailsForExistingTemplates;
(window as any).diagnosticThumbnailSystem = diagnosticThumbnailSystem;
(window as any).fixMissingThumbnailReferences = fixMissingThumbnailReferences;
(window as any).emergencyCleanupDuplicates = emergencyCleanupDuplicates; 