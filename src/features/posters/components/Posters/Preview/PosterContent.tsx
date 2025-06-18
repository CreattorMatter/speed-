import React from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface PosterContentProps {
  product?: Product;
  category?: string;
  company?: {
    id: string;
    name: string;
    logo: string;
  };
  showTopLogo?: boolean;
  hideGrid?: boolean;
  roundedFontStyle: React.CSSProperties;
}

export const PosterContent: React.FC<PosterContentProps> = ({
  product,
  category,
  company,
  showTopLogo = true,
  hideGrid = false,
  roundedFontStyle
}) => {
  const renderContent = () => {
    if (category) {
      return (
        <div className="flex flex-col items-center h-full justify-center text-center p-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 rounded-lg shadow-lg transform rotate-1">
            <h1 className="text-6xl font-bold mb-4" style={roundedFontStyle}>
              OFERTAS
            </h1>
            <h2 className="text-4xl font-bold" style={roundedFontStyle}>
              {category.toUpperCase()}
            </h2>
          </div>
        </div>
      );
    }

    if (product) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: '60%' }}
            />
          </div>
          <div className="px-4 pb-4">
            <h2 className="text-2xl font-bold text-center text-gray-800" style={roundedFontStyle}>
              {product.name}
            </h2>
            {product.description && (
              <p className="text-sm text-center text-gray-600 mt-2">
                {product.description}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-2">Selecciona un producto o categoría</h3>
          <p className="text-sm">para generar el cartel</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-full w-full bg-white">
      {showTopLogo && company?.logo && (
        <div className="absolute top-4 left-4 z-10">
          <img
            src={company.logo}
            alt={company.name}
            className="h-16 w-auto object-contain"
          />
        </div>
      )}

      {!hideGrid && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      )}

      {renderContent()}
    </div>
  );
}; 