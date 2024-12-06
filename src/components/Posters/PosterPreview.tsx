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
    bank?: string;
    cardType?: string;
    conditions?: string[];
    startDate?: string;
    endDate?: string;
    type?: 'percentage' | '2x1' | '3x2' | 'second-70';
    title?: string;
    description?: string;
  };
  company?: {
    id: string;
    name: string;
    logo: string;
  };
  showTopLogo?: boolean;
  pricePerUnit?: string;
  points?: string;
  origin?: string;
  barcode?: string;
  size?: {
    id: string;
    name: string;
  };
  compact?: boolean;
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({ 
  product,
  promotion,
  company,
  showTopLogo = true,
  pricePerUnit = '',
  points = '',
  origin = 'ARGENTINA',
  barcode = '7790895000782',
  size,
  compact = false
}) => {
  const isCenefa = size?.id.includes('cenefa');
  const isFleje = size?.id === 'fleje';

  // Calcular el precio con descuento
  const calculatePrice = () => {
    if (!promotion) return {
      finalPrice: product.price,
      unitPrice: product.price,
      totalUnits: 1,
      savedAmount: 0,
      secondUnitPrice: 0
    };

    switch (promotion.type) {
      case 'second-70':
        const secondUnitPrice = product.price * 0.3; // 70% de descuento en la segunda unidad
        return {
          finalPrice: product.price + secondUnitPrice,
          unitPrice: (product.price + secondUnitPrice) / 2,
          totalUnits: 2,
          savedAmount: product.price * 0.7,
          secondUnitPrice
        };
      case '2x1':
        return {
          finalPrice: product.price,
          unitPrice: product.price / 2,
          totalUnits: 2,
          savedAmount: product.price
        };
      case '3x2':
        return {
          finalPrice: product.price * 2,
          unitPrice: (product.price * 2) / 3,
          totalUnits: 3,
          savedAmount: product.price
        };
      default:
        // Descuento porcentual normal
        const discountMatch = promotion.discount.match(/(\d+)/);
        if (!discountMatch) return {
          finalPrice: product.price,
          unitPrice: product.price,
          totalUnits: 1,
          savedAmount: 0
        };
        
        const discountPercent = parseInt(discountMatch[0]);
        const finalPrice = product.price * (1 - discountPercent / 100);
        return {
          finalPrice,
          unitPrice: finalPrice,
          totalUnits: 1,
          savedAmount: product.price - finalPrice
        };
    }
  };

  const priceInfo = calculatePrice();

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://speed-plus.com/product/${product.id}`;

  const roundedFontStyle = { 
    fontFamily: 'VAG Rounded BT, VAG Rounded Std, Arial Rounded MT Bold, Arial Black, sans-serif'
  };

  return (
    <div>
      {/* Resto del componente existente */}
      <div className={`${compact ? 'flex gap-4 items-center' : ''}`}>
        <div className={`relative bg-white rounded-lg shadow-xl overflow-hidden
                      ${compact ? 'w-full' : 'w-[900px] h-[500px]'}`}
          style={{
            width: compact ? '100%' : '800px',
            height: compact ? 'auto' : '500px',
            padding: '1.5 rem',
            border: '1px solid #e5e7eb',
            ...roundedFontStyle
          }}
        >
          <div className="relative z-10 flex flex-col h-full">
            {/* Logo de fondo translúcido */}
            {company?.logo && (
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <img 
                  src={company.logo}
                  alt={company.name}
                  className="w-2/3 h-auto object-contain opacity-5"
                />
              </div>
            )}

            {/* Logo superior izquierdo */}
            {company?.logo && showTopLogo && (
              <div className="absolute top-6 left-6 z-20">
                <img 
                  src={company.logo}
                  alt={company.name}
                  className="h-24 w-auto object-contain"
                />
              </div>
            )}

            {/* Resto del contenido con z-index mayor */}
            <div className="relative z-10">
              {/* Nombre del producto */}
              <div className="text-center mb-4 mt-4">
                <h1 className="text-[50px] font-black text-black leading-none" 
                    style={roundedFontStyle}>
                  {product.name.toLowerCase()}
                </h1>
                <p className="text-[22px] text-gray-600 mt-1" 
                   style={roundedFontStyle}>
                  {product.description.toLowerCase()}
                </p>
              </div>

              {/* Condiciones y vigencia */}
              <div className="text-right absolute top-40 right-10">
                <div className="text-[14px]" style={roundedFontStyle}>
                  <span className="text-gray-600">Condiciones:</span><br />
                  • Válido solo los jueves
                </div>
                <div className="text-[14px]" style={roundedFontStyle}>
                  <span className="text-gray-600">Vigencia:</span><br />
                  Del {promotion?.startDate}<br />
                  al {promotion?.endDate}
                </div>
              </div>

              {/* Sección de precios */}
              <div className="flex-grow flex flex-col items-center justify-center -mt-0">
                {/* Precio tachado y descuento */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[50px] text-gray-400 line-through" 
                        style={roundedFontStyle}>
                    ${product.price.toLocaleString('es-AR')}
                  </span>
                  <div className="bg-red-600 text-white px-6 py-1.5 rounded-full text-[18px] font-bold"
                       style={roundedFontStyle}>
                    Hasta {promotion?.discount}
                  </div>
                </div>

                {/* Precio Final */}
                <span className="text-[110px] font-black leading-none mb-8" 
                      style={{ 
                        ...roundedFontStyle,
                        letterSpacing: '-0.01em'
                      }}>
                  ${Math.round(priceInfo.finalPrice).toLocaleString('es-AR')}
                </span>
              </div>

              {/* Footer - En la parte inferior */}
              <div className="flex justify-between items-end absolute bottom-39 left-8 right-8">
                {/* Columna izquierda */}
                <div className="flex flex-col gap-1">
                  <div className="text-[16px] font-bold" style={roundedFontStyle}>
                    PRECIO X LITRO ${pricePerUnit}
                  </div>
                  <div className="text-[16px]" style={roundedFontStyle}>
                    {barcode}
                  </div>
                  <div className="text-[16px] font-bold" style={roundedFontStyle}>
                    ORIGEN: {origin}
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="flex items-end gap-20">
                  <div className="text-[16px] font-bold" style={roundedFontStyle}>
                    SUMÁ {points} PUNTOS JUMBO MÁS
                  </div>
                  <div className="flex items-end gap-2">
                    <img 
                      src={qrUrl}
                      alt="QR Code"
                      className="w-[60px] h-[60px]"
                    />
                    <span className="text-gray-600 text-[11px] mb-1" style={roundedFontStyle}>
                      más información<br />del producto
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 