import React from 'react';
import { type TemplateV3, type DraggableComponentV3 } from '../../../../../features/builderV3/types';
import { type ProductoReal } from '../../../../../types/product';
import { type EditedProduct } from '../../../../../store/features/poster/posterSlice';
import { BuilderTemplateRenderer } from './Renderers/BuilderTemplateRenderer';

interface PrintContainerProps {
  templates: { product?: ProductoReal; template: TemplateV3 }[]; // 🆕 Product ahora es opcional
  productChanges: Record<string, EditedProduct>;
  financingCuotas?: number; // 🆕 Para cálculos de financiación en impresión
  discountPercent?: number; // 🆕 Para cálculos de descuento en impresión
  componentModifications?: Record<string, Partial<DraggableComponentV3>>; // 🆕 Modificaciones de componentes (imágenes dinámicas)
}

export const PrintContainer = React.forwardRef<HTMLDivElement, PrintContainerProps>(({ templates, productChanges, financingCuotas = 0, discountPercent = 0, componentModifications = {} }, ref) => {
  if (!templates || templates.length === 0) {
    return null;
  }

  // Función para aplicar modificaciones a los componentes (igual que en PreviewAreaV3)
  const getModifiedComponents = (components: DraggableComponentV3[]): DraggableComponentV3[] => {
    return components.map(component => {
      const modifications = componentModifications[component.id];
      if (modifications) {
        return {
          ...component,
          ...modifications,
          content: {
            ...component.content,
            ...modifications.content
          }
        };
      }
      return component;
    });
  };

  // Dimensiones de A4 en mm para el cálculo de la escala
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;

  return (
    <div ref={ref} className="print-only">
      {templates.map(({ product, template }, index) => {
        const isLandscape = template.canvas.width > template.canvas.height;
        
        // Convertir dimensiones de la plantilla de px a mm (asumiendo 96 DPI)
        const templateWidthMM = template.canvas.width * (25.4 / 96);
        const templateHeightMM = template.canvas.height * (25.4 / 96);

        // Calcular la escala para que quepa en A4 - SIN márgenes extra
        const scaleX = (isLandscape ? A4_HEIGHT_MM : A4_WIDTH_MM) / templateWidthMM;
        const scaleY = (isLandscape ? A4_WIDTH_MM : A4_HEIGHT_MM) / templateHeightMM;
        const scale = Math.min(scaleX, scaleY, 1); // Sin factor de margen extra

        // 🆕 Generar key único que funcione con o sin producto
        const itemKey = product ? `${product.id}-${index}` : `template-${index}`;

        return (
          <div key={itemKey} className="page-break">
            <div 
              className="renderer-print-container" 
              style={{ 
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                width: `${template.canvas.width}px`,
                height: `${template.canvas.height}px`,
                maxWidth: '100%',
                maxHeight: '100%',
                margin: '0',
                padding: '0'
              }}
            >
              <BuilderTemplateRenderer
                template={template}
                components={getModifiedComponents(template.defaultComponents || [])}
                product={product} // 🆕 Ahora puede ser undefined para plantillas sin productos
                productChanges={productChanges}
                enableInlineEdit={false}
                financingCuotas={financingCuotas}
                discountPercent={discountPercent}
                isPdfCapture={true} // 🆕 Modo impresión - unificar fechas iguales
              />
            </div>
          </div>
        );
      })}
      <style type="text/css">
        {`
          @media print {
            .print-only {
              display: block !important;
            }
            .page-break {
              page-break-after: auto;
              page-break-inside: avoid;
            }
            /* Solo hacer salto de página entre elementos, no después del último */
            .page-break:not(:last-child) {
              page-break-after: always;
            }
            .page-break:last-child {
              page-break-after: avoid;
            }
          }
          @media screen {
            .print-only {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
});

PrintContainer.displayName = 'PrintContainer'; 