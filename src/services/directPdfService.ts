import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BuilderTemplateRenderer } from '../features/posters/components/Posters/Editor/Renderers/BuilderTemplateRenderer';
import { type TemplateV3 } from '../features/builderV3/types';
import { type ProductoReal } from '../types/product';
import { type EditedProduct } from '../store/features/poster/posterSlice';
import { TemplateV3Schema, ProductSchema } from '../lib/validationSchemas';

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
    
    if (!templates || templates.length === 0) {
      throw new Error('No hay templates para generar PDF');
    }
    
    try {
      // 📐 Definir dimensiones A4 en píxeles (a 96 DPI, que es el estándar de jsPDF para 'px')
      const A4_WIDTH_PX = 1123; // Landscape width
      const A4_HEIGHT_PX = 794; // Landscape height

      // Crear PDF en formato A4 estándar
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: 'a4',
      });
      
      // Procesar cada template individualmente
      for (let i = 0; i < templates.length; i++) {
        const { product, template } = templates[i];

        // Validate each template and product
        const templateValidation = TemplateV3Schema.safeParse(template);
        const productValidation = ProductSchema.safeParse(product);

        if (!templateValidation.success) {
          throw new Error(`Fallback: El formato del template ${i + 1} es inválido.`);
        }
        if (!productValidation.success) {
          throw new Error(`Fallback: Los datos del producto para el template ${i + 1} son inválidos.`);
        }
        
        // Crear un canvas temporal para renderizar el template
        const canvas = await this.renderTemplateToCanvas(
          template,
          product,
          productChanges,
          financingCuotas,
          discountPercent
        );
        
        // Convertir canvas a imagen
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        // 📐 Calcular el factor de escala para ajustar el template al A4 preservando el aspect ratio
        const templateWidth = canvas.width;
        const templateHeight = canvas.height;
        const widthRatio = A4_WIDTH_PX / templateWidth;
        const heightRatio = A4_HEIGHT_PX / templateHeight;
        const scaleFactor = Math.min(widthRatio, heightRatio) * 1.01; // 放大到 101% 以更好地填充页面

        const scaledWidth = templateWidth * scaleFactor;
        const scaledHeight = templateHeight * scaleFactor;

        // Centrar la imagen en la página A4
        const x = ((A4_WIDTH_PX - scaledWidth) / 2) + 1; // +1px 偏移以完美居中
        const y = (A4_HEIGHT_PX - scaledHeight) / 2;

        // Añadir página al PDF (excepto la primera)
        if (i > 0) {
          pdf.addPage();
        }

        // Agregar imagen escalada y centrada al PDF
        pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight);
      }
      
      
      // Generar blob final
      const blob = pdf.output('blob');
      const filename = `cartel-${Date.now()}.pdf`;
      
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
      outerContainer.style.backgroundColor = 'transparent';
      outerContainer.style.overflow = 'visible';
      outerContainer.style.zIndex = '-1000';

      const tempContainer = document.createElement('div');
      tempContainer.style.width = `${templateWidth}px`;
      tempContainer.style.height = `${templateHeight}px`;
      tempContainer.style.overflow = 'visible';
      tempContainer.style.backgroundColor = 'transparent';

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
      
      // Esperar a que las fuentes estén listas y el layout se estabilice
      const ensureStableRender = async () => {
        try {
          if (document.fonts && typeof document.fonts.ready?.then === 'function') {
            await document.fonts.ready;
            // Esperar dos frames para asegurar que el navegador ha pintado los cambios
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          }
        } catch (fontError) {
          // Silently ignore font errors and continue
        }
      };

      // Ejecutar la captura después de asegurar el renderizado estable
      ensureStableRender().then(async () => {
        try {
          
          
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
            backgroundColor: '#ffffff', // 🎨 Forzar fondo blanco para eliminar artefactos
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
            // Silently ignore cleanup errors
          }
          
          reject(error);
        }
      });
    });
  }
}