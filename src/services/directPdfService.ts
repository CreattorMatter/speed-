import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BuilderTemplateRenderer } from '../features/posters/components/Posters/Editor/Renderers/BuilderTemplateRenderer';
import { type TemplateV3 } from '../features/builderV3/types';
import { type ProductoReal } from '../types/product';
import { type EditedProduct } from '../store/features/poster/posterSlice';

/**
 * Servicio de PDF que renderiza directamente cada template sin transformaciones CSS
 */
export class DirectPdfService {
  
  /**
   * Genera PDF capturando cada template directamente sin escalado CSS
   */
  static async generatePdfFromTemplates(
    templates: { product: ProductoReal; template: TemplateV3 }[],
    productChanges: Record<string, EditedProduct>,
    financingCuotas: number = 0,
    discountPercent: number = 0
  ): Promise<{
    blob: Blob;
    size: number;
    filename: string;
  }> {
    console.log('🎯 Iniciando generación PDF directa...');
    
    if (!templates || templates.length === 0) {
      throw new Error('No hay templates para generar PDF');
    }
    
    try {
      let pdf: jsPDF | null = null;
      
      // Procesar cada template individualmente
      for (let i = 0; i < templates.length; i++) {
        const { product, template } = templates[i];
        console.log(`🖼️ Procesando template ${i + 1}/${templates.length} para producto: ${product.name}`);
        
        // Crear un canvas temporal para renderizar el template
        const canvas = await this.renderTemplateToCanvas(
          template,
          product,
          productChanges,
          financingCuotas,
          discountPercent
        );
        
        console.log(`📐 Canvas generado: ${canvas.width}x${canvas.height}px`);
        
        // Convertir canvas a imagen
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Usar EXACTAMENTE el tamaño y orientación del canvas renderizado
        const pageWidthPx = canvas.width;
        const pageHeightPx = canvas.height;
        const isLandscape = pageWidthPx > pageHeightPx;
        const orientation = isLandscape ? 'landscape' : 'portrait';

        if (!pdf) {
          // Crear PDF A4 con la primera página
          pdf = new jsPDF({
            orientation,
            unit: 'px',
            format: [pageWidthPx, pageHeightPx]
          });
          console.log(`📄 PDF inicializado (${orientation}) con formato ${pageWidthPx}x${pageHeightPx}px`);
        } else {
          // Agregar nueva página con el mismo tamaño exacto
          pdf.addPage([pageWidthPx, pageHeightPx], orientation as any);
          console.log(`📄 Página agregada (${orientation}) con formato ${pageWidthPx}x${pageHeightPx}px`);
        }

        // Agregar imagen 1:1 al PDF (sin reescalar ni márgenes)
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthPx, pageHeightPx);
        console.log(`✅ Template ${i + 1} agregado al PDF`);
      }
      
      if (!pdf) {
        throw new Error('No se pudo generar el PDF');
      }
      
      // Generar blob final
      const blob = pdf.output('blob');
      const filename = `cartel-${Date.now()}.pdf`;
      
      console.log(`🎉 PDF generado exitosamente: ${filename} (${blob.size} bytes)`);
      
      return {
        blob,
        size: blob.size,
        filename
      };
      
    } catch (error) {
      console.error('❌ Error generando PDF directo:', error);
      throw error;
    }
  }
  
  /**
   * Renderiza un template individual a canvas sin transformaciones CSS
   */
  private static async renderTemplateToCanvas(
    template: TemplateV3,
    product: ProductoReal,
    productChanges: Record<string, EditedProduct>,
    financingCuotas: number,
    discountPercent: number
  ): Promise<HTMLCanvasElement> {
    
    return new Promise((resolve, reject) => {
      // Dimensiones seguras de la plantilla (fallbacks si falta canvas)
      const templateWidth = (template as any)?.canvas?.width || (template as any)?.width || 1240;
      const templateHeight = (template as any)?.canvas?.height || (template as any)?.height || 1754;
      // Crear contenedor temporal con overscan para evitar cortes de borde
      const overscan = 24; // px de margen extra alrededor para captura
      const outerContainer = document.createElement('div');
      outerContainer.id = 'pdf-capture-root';
      outerContainer.style.position = 'absolute';
      outerContainer.style.top = '-9999px'; // Volver a offscreen
      outerContainer.style.left = '-9999px';
      outerContainer.style.width = `${templateWidth + overscan * 2}px`;
      outerContainer.style.height = `${templateHeight + overscan * 2}px`;
      outerContainer.style.padding = `${overscan}px`;
      outerContainer.style.boxSizing = 'content-box';
      outerContainer.style.backgroundColor = 'white';
      outerContainer.style.overflow = 'visible';
      outerContainer.style.zIndex = '-1000';

      const tempContainer = document.createElement('div');
      tempContainer.style.width = `${templateWidth}px`;
      tempContainer.style.height = `${templateHeight}px`;
      tempContainer.style.overflow = 'visible';
      tempContainer.style.backgroundColor = 'white';

      outerContainer.appendChild(tempContainer);
      document.body.appendChild(outerContainer);
      
      // Crear root de React
      const root = ReactDOM.createRoot(tempContainer);
      
      // Renderizar el template
      const templateElement = React.createElement(BuilderTemplateRenderer, {
        template,
        components: (template as any)?.defaultComponents || (template as any)?.components || [],
        product,
        productChanges,
        enableInlineEdit: false,
        financingCuotas,
        discountPercent,
        isPdfCapture: true
      });
      
      root.render(templateElement);
      
      // Esperar a que se renderice y luego capturar (más tiempo para debugging)
      setTimeout(async () => {
        try {
          console.log(`🎨 Capturando template de ${templateWidth}x${templateHeight}px`);
          
          // Asegurar que las fuentes estén listas para evitar reflow y recortes de texto
          try {
            if ((document as any).fonts && typeof (document as any).fonts.ready?.then === 'function') {
              await (document as any).fonts.ready;
              // Esperar un frame extra para layout estable
              await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
            }
          } catch {
            // Si no hay soporte para document.fonts, continuar de todas formas
          }
          
          // Verificación básica del contenedor
          if (outerContainer.children.length === 0) {
            throw new Error('El contenedor de captura está vacío');
          }

          // Capturar con html2canvas - configuración optimizada
          const scaleFactor = Math.max(2, (typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1));
          const fullCanvas = await html2canvas(outerContainer, {
            scale: scaleFactor,
            useCORS: true,
            allowTaint: true,
            backgroundColor: 'white',
            logging: false,
            width: templateWidth + overscan * 2,
            height: templateHeight + overscan * 2,
            windowWidth: templateWidth + overscan * 2,
            windowHeight: templateHeight + overscan * 2,
            imageTimeout: 15000,
            removeContainer: false,
            // Mejora de renderizado de texto/HTML complejo
            foreignObjectRendering: true,
            scrollX: 0,
            scrollY: 0
          });
          
          // Recortar la zona central (sin overscan) para evitar bordes blancos/cortes
          const cropX = overscan * scaleFactor;
          const cropY = overscan * scaleFactor;
          const cropW = templateWidth * scaleFactor;
          const cropH = templateHeight * scaleFactor;
          const canvas = document.createElement('canvas');
          canvas.width = cropW;
          canvas.height = cropH;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('No se pudo obtener contexto 2D para recorte');
          ctx.drawImage(fullCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

          console.log(`✅ Canvas capturado: ${canvas.width}x${canvas.height}px (recortado de ${fullCanvas.width}x${fullCanvas.height})`);
          
          // Limpiar
          root.unmount();
          document.body.removeChild(outerContainer);
          
          resolve(canvas);
          
        } catch (error) {
          console.error('❌ Error capturando template:', error);
          
          // Limpiar en caso de error
          try {
            root.unmount();
            if (document.body.contains(outerContainer)) {
              document.body.removeChild(outerContainer);
            }
          } catch (cleanupError) {
            console.warn('⚠️ Error en cleanup:', cleanupError);
          }
          
          reject(error);
        }
      }, 1000); // Tiempo optimizado para producción
    });
  }
}