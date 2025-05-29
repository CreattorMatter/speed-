import React from 'react';
import { type Product } from '../../../../data/products';

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

interface ProductPreviewProps {
  product: Product;
  templateComponent: React.ComponentType<PlantillaComponentProps> | null;
  templateProps: PlantillaComponentProps;
  refreshKey?: number;
  className?: string;
  scale?: string;
  plantillaFamily?: string;
  modeloSeleccionado?: string | null;
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({
  product,
  templateComponent: Component,
  templateProps,
  refreshKey = 0,
  className = "w-full h-full flex items-center justify-center",
  scale,
  plantillaFamily,
  modeloSeleccionado
}) => {
  if (!Component || typeof Component !== "function") {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-bold text-red-600 mb-4">
          Error al cargar plantilla
        </h3>
        <div className="text-left text-gray-600 space-y-2">
          <p><span className="font-medium">Producto:</span> {product.name}</p>
          <p><span className="font-medium">Plantilla:</span> {plantillaFamily || 'No definida'}</p>
          <p><span className="font-medium">Modelo:</span> {modeloSeleccionado || 'Ninguno'}</p>
          <p><span className="font-medium">SKU:</span> {product.sku}</p>
          <p><span className="font-medium">Precio:</span> ${product.price}</p>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">Sugerencia:</span> Verifica que hayas seleccionado una plantilla válida.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={scale || "w-full h-full"}>
        <Component 
          key={`${product.id}-${refreshKey}`}
          {...templateProps} 
        />
      </div>
    </div>
  );
}; 