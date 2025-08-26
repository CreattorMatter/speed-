import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image-more';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { TemplateV3, ProductoReal, EditedProduct } from '../types';
import { BuilderTemplateRenderer } from '../features/posters/components/Posters/Editor/Renderers/BuilderTemplateRenderer';

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
    console.log('🚀 [NUEVO PDF] Iniciando generación con renderizado visible...');
    
    if (templates.length === 0) {
      throw new Error('No hay templates para generar PDF');
    }

    // Usar dimensiones del primer template para el PDF
    const templateWidth = templates[0]?.canvas?.width || (templates[0] as any)?.width || 1240;
    const templateHeight = templates[0]?.canvas?.height || (templates[0] as any)?.height || 1754;
    
    console.log(`📐 Dimensiones PDF: ${templateWidth}x${templateHeight}px`);

    // Crear PDF con dimensiones exactas
    const pdf = new jsPDF({
      orientation: templateWidth > templateHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [templateWidth, templateHeight]
    });

    // Procesar cada template
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const product = products[i % products.length];
      
      console.log(`🖼️ [${i + 1}/${templates.length}] Procesando: ${product?.name || 'Producto'}`);
      
      try {
        // Capturar template con renderizado visible
        const canvas = await this.renderTemplateVisible(
          template, 
          product, 
          productChanges, 
          financingCuotas, 
          discountPercent
        );
        
        // Añadir página al PDF (excepto la primera)
        if (i > 0) {
          pdf.addPage([templateWidth, templateHeight], templateWidth > templateHeight ? 'landscape' : 'portrait');
        }
        
        // Convertir canvas a imagen y agregar al PDF
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', 0, 0, templateWidth, templateHeight);
        
        console.log(`✅ Template ${i + 1} agregado al PDF`);
        
      } catch (error) {
        console.error(`❌ Error procesando template ${i + 1}:`, error);
        throw new Error(`Error en template ${i + 1}: ${error.message}`);
      }
    }

    // Generar PDF final
    const pdfBlob = pdf.output('blob');
    const pdfSize = Math.round(pdfBlob.size / 1024);
    console.log(`🎉 PDF generado exitosamente: ${pdfSize}KB`);
    
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
      
      console.log(`🎨 Renderizando visible: ${templateWidth}x${templateHeight}px`);

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
        components: template?.defaultComponents || template?.components || [],
        product,
        productChanges,
        enableInlineEdit: false,
        financingCuotas,
        discountPercent,
        isPdfCapture: true // Modo especial para PDF
      });

      root.render(templateElement);

      // Esperar renderizado y capturar
      setTimeout(async () => {
        try {
          console.log('📸 Capturando con dom-to-image...');
          
          // Capturar con dom-to-image (más confiable que html2canvas)
          const dataUrl = await domtoimage.toPng(container, {
            width: templateWidth,
            height: templateHeight,
            style: {
              transform: 'scale(1)',
              transformOrigin: 'top left'
            },
            quality: 1.0,
            pixelRatio: 2 // Alta calidad
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
            
            console.log('✅ Captura completada exitosamente');
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
      }, 1500); // Dar tiempo suficiente para renderizado
    });
  }

  private static createRenderOverlay(width: number, height: number): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'pdf-render-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      background: rgba(0, 0, 0, 0.8);
      padding: 20px;
      border-radius: 8px;
      pointer-events: none;
      opacity: 0.9;
    `;

    // Mensaje de estado
    const message = document.createElement('div');
    message.style.cssText = `
      color: white;
      text-align: center;
      margin-bottom: 10px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
    `;
    message.textContent = '📄 Generando PDF...';
    overlay.appendChild(message);

    // Contenedor del template
    const container = document.createElement('div');
    container.id = 'pdf-render-container';
    container.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      background: white;
      overflow: visible;
      transform: scale(0.3);
      transform-origin: top left;
      border: 1px solid #ccc;
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
    console.log('🖨️ [FALLBACK] Usando Print API nativa...');
    
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
