import React from 'react';
import { type TemplateV3 as PosterTemplate } from '../../../../../features/builderV3/types';
import { type Product } from '../../../../../data/products';
import { type EditedProduct } from '../../../../../store/features/poster/posterSlice';
import { BuilderTemplateRenderer } from './Renderers/BuilderTemplateRenderer';

interface PrintContainerProps {
  templates: { product: Product; template: PosterTemplate }[];
  productChanges: Record<string, EditedProduct>;
}

export const PrintContainer = React.forwardRef<HTMLDivElement, PrintContainerProps>(({ templates, productChanges }, ref) => {
  if (!templates || templates.length === 0) {
    return null;
  }

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

        // Calcular la escala para que quepa en A4 - CORREGIDO
        const scaleX = (isLandscape ? A4_HEIGHT_MM : A4_WIDTH_MM) / templateWidthMM;
        const scaleY = (isLandscape ? A4_WIDTH_MM : A4_HEIGHT_MM) / templateHeightMM;
        const scale = Math.min(scaleX, scaleY, 1) * 0.9; // 0.9 para dejar un margen más generoso

        return (
          <div key={`${product.id}-${index}`} className="page-break">
            <div 
              className="renderer-print-container" 
              style={{ 
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                width: `${template.canvas.width}px`,
                height: `${template.canvas.height}px`,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <BuilderTemplateRenderer
                template={template}
                components={template.defaultComponents}
                product={product}
                productChanges={productChanges}
                enableInlineEdit={false}
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
              page-break-after: always;
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