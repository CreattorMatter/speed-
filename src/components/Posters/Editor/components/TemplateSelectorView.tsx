import React from 'react';
import { type Product } from '../../../../data/products';
import { type TemplateModel } from '../../../../constants/posters/templates';
import { ProductPreview } from './ProductPreview';

interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  plan: string;
}

interface PlantillaComponentProps {
  small?: boolean;
  nombre?: string;
  precioActual?: string;
  porcentaje?: string;
  sap?: string;
  fechasDesde?: string;
  fechasHasta?: string;
  origen?: string;
  precioSinImpuestos?: string;
  financiacion?: FinancingOption[];
  productos?: Product[];
  titulo?: string;
  [key: string]: unknown;
}

interface TemplateSelectorViewProps {
  filteredModelos: TemplateModel[];
  templateComponents: Record<string, React.ComponentType<PlantillaComponentProps>>;
  onSelectModelo: (modeloId: string) => void;
  generateTemplateProps: (product: Product) => PlantillaComponentProps;
  getPromoTypeFromModelId: (modelId: string) => string;
  refreshKey: number;
  exampleProduct?: Product;
  showInfoMessage?: boolean;
}

export const TemplateSelectorView: React.FC<TemplateSelectorViewProps> = ({
  filteredModelos,
  templateComponents,
  onSelectModelo,
  generateTemplateProps,
  getPromoTypeFromModelId,
  refreshKey,
  exampleProduct = {
    id: 'example-product',
    name: 'Producto de Ejemplo',
    price: 99999,
    sku: 'EJ001',
    category: 'Ejemplo',
    description: 'Producto de ejemplo para vista previa',
    imageUrl: '/images/placeholder-product.jpg'
  },
  showInfoMessage = true
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 p-3 xs:p-4 sm:p-6">
      {/* Mensaje informativo */}
      {showInfoMessage && (
        <div className="col-span-full mb-3 xs:mb-4 p-2 xs:p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs xs:text-sm text-blue-700 text-center">
            <span className="font-medium">Vista previa de plantillas:</span> Haz click en cualquier plantilla para verla en detalle
          </p>
        </div>
      )}
      
      {filteredModelos.map((modelo: TemplateModel) => {
        const Component = templateComponents[modelo.componentPath];

        return (
          <div
            key={modelo.id}
            className="cursor-pointer border rounded-lg hover:border-indigo-400 hover:shadow-md transition-all duration-300
                      bg-white hover:bg-gray-50 relative overflow-hidden"
            onClick={() => onSelectModelo(modelo.id)}
            title={`${getPromoTypeFromModelId(modelo.id)} - Click para seleccionar`}
          >
            {/* Contenedor de la plantilla */}
            <div className="w-full h-[200px] xs:h-[240px] sm:h-[280px] flex items-center justify-center p-2 xs:p-3 overflow-hidden">
              {Component && typeof Component === "function" ? (
                <div className="max-w-full max-h-full transform scale-[0.45] xs:scale-[0.5] sm:scale-[0.55]">
                  <ProductPreview
                    product={exampleProduct}
                    templateComponent={Component}
                    templateProps={generateTemplateProps(exampleProduct)}
                    refreshKey={refreshKey}
                    className="w-full h-full"
                    scale="w-full h-full"
                  />
                </div>
              ) : (
                <div className="text-red-500 text-xs xs:text-sm text-center">
                  Error al cargar componente: {modelo.componentPath}
                  <br />
                  <small>Component: {Component ? 'exists' : 'missing'}</small>
                </div>
              )}
            </div>
            
            {/* Etiqueta del modelo */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs text-center py-1.5 xs:py-2 px-2">
              {getPromoTypeFromModelId(modelo.id)}
            </div>
          </div>
        );
      })}
    </div>
  );
}; 