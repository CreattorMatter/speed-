import React from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface PosterPreviewProps {
  product: Product;
  promotion?: {
    discount: string;
  };
  pricePerUnit?: string;
  points?: string;
  origin?: string;
  barcode?: string;
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({ 
  product,
  promotion,
  pricePerUnit = '',
  points = '',
  origin = 'ARGENTINA',
  barcode = '7790895000782'
}) => {
  // Calcular el precio con descuento
  const getDiscountedPrice = () => {
    if (!promotion) return product.price;
    
    const discountMatch = promotion.discount.match(/(\d+)/);
    if (!discountMatch) return product.price;
    
    const discountPercent = parseInt(discountMatch[0]);
    return product.price * (1 - discountPercent / 100);
  };

  const finalPrice = getDiscountedPrice();

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://speed-plus.com/product/${product.id}`;

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto font-sans">
      <div className="space-y-6 text-center">
        {/* Solo el nombre del producto */}
        <div className="text-4xl font-bold text-black tracking-tight leading-tight">
          {product.name.toLowerCase()}
        </div>

        {/* Precios */}
        <div className="space-y-2">
          {promotion && (
            <div className="flex items-center justify-center gap-4">
              <div className="text-3xl text-gray-500 line-through font-bold">
                ${product.price.toLocaleString('es-AR')}
              </div>
              <div className="bg-red-600 text-white px-4 py-1 rounded-full text-2xl font-bold">
                {promotion.discount}
              </div>
            </div>
          )}
          
          {/* Precio Final */}
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-bold">$</span>
            <span className="text-[120px] leading-none font-bold tracking-tighter">
              {Math.round(finalPrice).toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-4 text-gray-800 mt-4">
          <div className="space-y-1 text-left">
            {pricePerUnit && (
              <div className="text-base font-medium">
                PRECIO X LITRO ${pricePerUnit}
              </div>
            )}
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
              src={qrUrl}
              alt="QR Code"
              className="w-16 h-16 rounded bg-white"
            />
            <span className="text-xs text-gray-500 text-left">
              más información<br />del producto
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 