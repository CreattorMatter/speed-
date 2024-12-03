import React from 'react';

interface CategoryPosterPreviewProps {
  category: string;
  promotion?: {
    discount: string;
  };
  points?: string;
  origin?: string;
  barcode?: string;
}

export const CategoryPosterPreview: React.FC<CategoryPosterPreviewProps> = ({ 
  category,
  promotion,
  points = '',
  origin = 'ARGENTINA',
  barcode = '7790895000782'
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto font-sans">
      <div className="space-y-6 text-center">
        {/* Nombre de la categoría */}
        <div className="text-5xl font-bold text-black tracking-tight leading-tight uppercase">
          {category}
        </div>

        {/* Descuento */}
        {promotion && (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <div className="bg-red-600 text-white px-6 py-2 rounded-full text-4xl font-bold">
                {promotion.discount}
              </div>
            </div>
            
            <div className="text-3xl font-bold text-gray-800">
              EN TODOS LOS PRODUCTOS
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-4 text-gray-800 mt-8">
          <div className="space-y-1 text-left">
            <div className="text-base font-medium">
              ORIGEN: {origin}
            </div>
          </div>
          <div className="text-right">
            {points && (
              <div className="text-base font-bold">
                SUMÁ {points} PUNTOS JUMBO MÁS
              </div>
            )}
          </div>
        </div>

        {/* Código de barras y QR */}
        <div className="flex justify-between items-end mt-6">
          <div className="text-base text-left">
            {barcode}
          </div>
          <div className="flex items-center gap-2">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://speed-plus.com/category/${category}`}
              alt="QR Code"
              className="w-16 h-16 rounded bg-white"
            />
            <span className="text-xs text-gray-500 text-left">
              más información<br />de la categoría
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 