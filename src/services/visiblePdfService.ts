import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image-more';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { type TemplateV3 } from '../features/builderV3/types';
import { type ProductoReal } from '../types/product';
import { type EditedProduct } from '../store/features/poster/posterSlice';
import { BuilderTemplateRenderer } from '../features/posters/components/Posters/Editor/Renderers/BuilderTemplateRenderer';
import { TemplateV3Schema, ProductSchema } from '../lib/validationSchemas';

/**
 * 🚀 NUEVO SERVICIO PDF CON RENDERIZADO VISIBLE
 * 
 * Este enfoque soluciona los problemas de html2canvas:
 * - Renderiza en el DOM visible (mejor compatibilidad)
 * - Usa dom-to-image-more (más confiable)
 * - Implementa overlay temporal no intrusivo
 * - Fallback a Print API si falla
 */
export class VisiblePdfService {
  
  static async generatePdfFromTemplates(
    templates: TemplateV3[],
    products: ProductoReal[],
    productChanges: Record<string, EditedProduct>,
    financingCuotas: number = 0,
    discountPercent: number = 0
  ): Promise<Blob> {
    if (templates.length === 0) {
      throw new Error('No hay templates para generar PDF');
    }

    // Validate the first template to get dimensions
    const firstTemplateValidation = TemplateV3Schema.safeParse(templates[0]);
    if (!firstTemplateValidation.success) {
      console.error('Validation error for first template:', firstTemplateValidation.error);
      throw new Error('El formato del primer template es inválido.');
    }

    // 📐 Definir dimensiones A4 en píxeles (a 96 DPI, que es el estándar de jsPDF para 'px')
    const A4_WIDTH_PX = 1123; // Landscape width
    const A4_HEIGHT_PX = 794; // Landscape height

    // Crear PDF en formato A4 estándar
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: 'a4'
    });

    // Procesar cada template
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const product = products[i % products.length];
      
      // Validate each template and product
      const templateValidation = TemplateV3Schema.safeParse(template);
      const productValidation = ProductSchema.safeParse(product);

      if (!templateValidation.success) {
        throw new Error(`El formato del template ${i + 1} es inválido.`);
      }
      if (!productValidation.success) {
        throw new Error(`Los datos del producto para el template ${i + 1} son inválidos.`);
      }
      
      try {
        // Capturar template con renderizado visible
        const canvas = await this.renderTemplateVisible(
          template, 
          product, 
          productChanges, 
          financingCuotas, 
          discountPercent
        );
        
        // 📐 Calcular el factor de escala para ajustar el template al A4 preservando el aspect ratio
        const templateWidth = template.canvas.width;
        const templateHeight = template.canvas.height;
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
        
        // Convertir canvas a imagen y agregar al PDF
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
        
      } catch (error) {
        console.error(`❌ Error procesando template ${i + 1}:`, error);
        throw new Error(`Error en template ${i + 1}: ${error.message}`);
      }
    }

    // Generar PDF final
    const pdfBlob = pdf.output('blob');
    
    return pdfBlob;
  }

  private static async renderTemplateVisible(
    template: TemplateV3,
    product: ProductoReal,
    productChanges: Record<string, EditedProduct>,
    financingCuotas: number,
    discountPercent: number
  ): Promise<HTMLCanvasElement> {
    
    return new Promise((resolve, reject) => {
      const templateWidth = template?.canvas?.width || (template as any)?.width || 1240;
      const templateHeight = template?.canvas?.height || (template as any)?.height || 1754;

      // Crear overlay temporal no intrusivo
      const overlay = this.createRenderOverlay(templateWidth, templateHeight);
      document.body.appendChild(overlay);

      // Crear contenedor para el template
      const container = overlay.querySelector('#pdf-render-container') as HTMLElement;
      
      // Crear React root
      const root = createRoot(container);
      
      // Renderizar template
      const templateElement = React.createElement(BuilderTemplateRenderer, {
        template,
        components: template?.defaultComponents || [],
        product,
        productChanges,
        financingCuotas,
        discountPercent,
        enableInlineEdit: false,
        isPdfCapture: true // Modo especial para PDF
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
          
          // Capturar con dom-to-image (más confiable que html2canvas)
          const dataUrl = await domtoimage.toPng(container, {
            width: templateWidth,
            height: templateHeight,
            style: {
              transform: 'scale(1)',
              transformOrigin: 'top left'
            },
            quality: 1.0,
            pixelRatio: 2, // Alta calidad
            bgcolor: '#ffffff' // 🎨 Forzar fondo blanco para eliminar artefactos
          });

          // Convertir a canvas
          const canvas = document.createElement('canvas');
          canvas.width = templateWidth * 2; // Por pixelRatio
          canvas.height = templateHeight * 2;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('No se pudo crear contexto 2D');
          }

          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            
            // Redimensionar a tamaño final
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = templateWidth;
            finalCanvas.height = templateHeight;
            const finalCtx = finalCanvas.getContext('2d');
            
            if (finalCtx) {
              finalCtx.drawImage(canvas, 0, 0, templateWidth, templateHeight);
            }
            
            // Limpiar
            root.unmount();
            document.body.removeChild(overlay);
            resolve(finalCanvas);
          };
          
          img.onerror = () => {
            root.unmount();
            document.body.removeChild(overlay);
            reject(new Error('Error cargando imagen capturada'));
          };
          
          img.src = dataUrl;
          
        } catch (error) {
          console.error('❌ Error en captura:', error);
          
          // Limpiar en caso de error
          try {
            root.unmount();
            document.body.removeChild(overlay);
          } catch {}
          
          reject(error);
        }
      });
    });
  }

  private static createRenderOverlay(width: number, height: number): HTMLElement {
    // Crear un contenedor padre invisible y fuera de la pantalla.
    const overlay = document.createElement('div');
    overlay.id = 'pdf-render-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: ${width}px;
      height: ${height}px;
      opacity: 0;
      pointer-events: none;
      z-index: -1;
    `;

    // El contenedor del template es ahora el propio overlay.
    const container = document.createElement('div');
    container.id = 'pdf-render-container';
    container.style.cssText = `
      width: 100%;
      height: 100%;
      background: transparent;
      overflow: visible;
    `;
    overlay.appendChild(container);

    return overlay;
  }

  /**
   * 🔄 FALLBACK: Print API
   * Si dom-to-image falla, usar la API de impresión nativa
   */
  static async generatePdfWithPrintAPI(
    templates: TemplateV3[],
    products: ProductoReal[],
    productChanges: Record<string, EditedProduct>,
    financingCuotas: number = 0,
    discountPercent: number = 0
  ): Promise<void> {
    
    // Crear ventana temporal para impresión
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('No se pudo abrir ventana de impresión');
    }

    try {
      // Construir HTML para impresión
      let printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cartel PDF</title>
          <style>
            @page { margin: 0; size: auto; }
            body { margin: 0; padding: 0; }
            .page { page-break-after: always; }
            .page:last-child { page-break-after: avoid; }
          </style>
        </head>
        <body>
      `;

      // Renderizar cada template como página
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        const product = products[i % products.length];
        
        printHTML += `<div class="page" id="page-${i}">`;
        // Aquí renderizaríamos el template como HTML puro
        printHTML += `<h1>Template ${i + 1}: ${product?.name || 'Producto'}</h1>`;
        printHTML += `</div>`;
      }

      printHTML += `</body></html>`;

      // Escribir contenido y abrir diálogo de impresión
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

    } catch (error) {
      printWindow.close();
      throw error;
    }
  }
}
