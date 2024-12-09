import React from 'react';
import { Product } from '../../types/product';
import { Company } from '../../data/companies';
import { Promotion } from '../../types/promotion';
import { PaperFormat } from '../../types/builder';

// Convertir mm a píxeles (96 DPI)
const MM_TO_PX = 3.7795275591;

interface PosterPreviewProps {
  product: Product;
  promotion?: Promotion;
  company?: Company;
  showTopLogo?: boolean;
  paperFormat: PaperFormat;
  isLandscape?: boolean;
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({
  product,
  promotion,
  company,
  showTopLogo = true,
  paperFormat,
  isLandscape = false,
}) => {
  const getPageDimensions = () => {
    const width = parseFloat(paperFormat.width) * MM_TO_PX;
    const height = parseFloat(paperFormat.height) * MM_TO_PX;
    return isLandscape ? { width: height, height: width } : { width, height };
  };

  const dimensions = getPageDimensions();

  // Calcular el factor de escala para ajustar al contenedor
  const calculateScale = () => {
    const containerHeight = 800; // Altura máxima del contenedor
    const containerWidth = 600;  // Ancho máximo del contenedor
    const scaleHeight = containerHeight / dimensions.height;
    const scaleWidth = containerWidth / dimensions.width;
    return Math.min(scaleHeight, scaleWidth, 1); // No ampliar si es más pequeño
  };

  const scale = calculateScale();

  return (
    <div className="flex items-center justify-center w-full min-h-[800px] bg-gray-100 p-8">
      <div 
        className="bg-white shadow-xl relative"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          margin: 'auto'
        }}
      >
        {/* Contenido del poster */}
        <div className="absolute inset-0 p-8">
          {/* Logo de la empresa */}
          {showTopLogo && company && (
            <div className="absolute top-8 left-8 w-32">
              <img 
                src={company.logo} 
                alt={company.name} 
                className="w-full h-auto object-contain"
              />
            </div>
          )}

          {/* Información del producto */}
          <div className="flex flex-col items-center justify-center h-full">
            {/* SKU y Marca */}
            <div className="w-full flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-600">{product.sku}</div>
                <div className="text-xl font-bold">{product.brand}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{product.packUnit}</div>
                <div className="text-sm font-medium">{product.pricePerUnit}</div>
              </div>
            </div>

            {/* Imagen del producto */}
            <div className="relative w-2/3 aspect-square mb-4">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Nombre y precio */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <div className="text-4xl font-bold text-indigo-600">
                ${product.price.toLocaleString()}
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-3 gap-4 text-center w-full">
              <div>
                <div className="text-sm text-gray-600">Puntos</div>
                <div className="text-lg font-bold text-green-600">{product.points}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Origen</div>
                <div className="text-lg font-medium">{product.origin}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Código</div>
                <div className="font-mono text-sm">{product.barcode}</div>
              </div>
            </div>

            {/* Promoción */}
            {promotion && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg w-full">
                <div className="text-lg font-bold text-indigo-600 mb-1">
                  {promotion.title}
                </div>
                <div className="text-sm text-indigo-700">
                  {promotion.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 