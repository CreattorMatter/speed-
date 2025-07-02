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

  return (
    <div ref={ref} className="print-only">
      {templates.map(({ product, template }, index) => (
        <div key={`${product.id}-${index}`} className="page-break">
          <BuilderTemplateRenderer
            template={template}
            components={template.defaultComponents}
            product={product}
            productChanges={productChanges}
            enableInlineEdit={false} // La edición no está habilitada en la impresión
          />
        </div>
      ))}
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