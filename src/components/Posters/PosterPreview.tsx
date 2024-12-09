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
  compact = false
}) => {
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
      <div className="relative">
        {/* Fondo A4 */}
        <div 
          className="bg-white shadow-xl relative" 
          style={{ 
            width: '210mm', 
            height: '297mm',
            backgroundImage: `
              linear-gradient(to right, #f0f0f0 1px, transparent 1px),
              linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
            `,
            backgroundSize: '10mm 10mm',
          }}
        >
          {/* Etiqueta A4 */}
          <div className="absolute -top-6 left-0 flex items-center gap-2 text-gray-500 text-sm">
            <span className="bg-gray-200 px-2 py-1 rounded-md font-medium">A4</span>
            <span>210mm × 297mm</span>
          </div>

          {/* Cartel */}
          <div className="absolute inset-0 flex justify-center items-center">
            {compact ? (
              <div className="transform scale-[0.85]">
                <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden z-0 w-[900px] h-[200px] flex">
                  {/* Logo en modo lista */}
                  {company?.logo && showTopLogo && (
                    <div className="w-[200px] p-4 flex items-center justify-center border-r border-gray-100">
                      <img 
                        src={company.logo}
                        alt={company.name}
                        className="h-full w-auto object-contain"
                      />
                    </div>
                  )}

                  {/* Contenido en modo lista */}
                  <div className="flex-1 p-4 flex justify-between items-center">
                    <div className="flex-1 px-6" style={roundedFontStyle}>
                      <h1 className="text-2xl font-black text-black leading-none">
                        {product.name.toLowerCase()}
                      </h1>
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-2xl text-gray-400 line-through">
                          ${product.price.toLocaleString('es-AR')}
                        </span>
                        {promotion && (
                          <div className="bg-red-600 text-center text-white px-4 py-1 rounded-full text-lg font-bold">
                            {promotion.discount}
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className="text-4xl font-black text-black" style={roundedFontStyle}>
                          ${Math.round(priceInfo.finalPrice).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">SKU: {barcode}</div>
                        <img src={qrUrl} alt="QR Code" className="w-16 h-16" />
                      </div>
                      <div className="text-sm" style={roundedFontStyle}>
                        <div className="font-medium">ORIGEN: {origin}</div>
                        {points && <div className="font-bold">SUMÁ {points} PUNTOS</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="transform scale-[0.85]">
                <div className="bg-white p-2 rounded-lg shadow-2xl w-[900px] h-[600px] relative overflow-hidden">
                  {/* Logo de fondo translúcido */}
                  {company?.logo && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-5">
                      <img 
                        src={company.logo}
                        alt={company.name}
                        className="w-2/3 object-contain"
                      />
                    </div>
                  )}

                  <div className="space-y-4 text-center relative h-full" style={roundedFontStyle}>
                    {/* Reservamos el espacio para el logo siempre, esté visible o no */}
                    <div className="h-20">
                      {showTopLogo && company?.logo && (
                        <div className="absolute left-1 top-1">
                          <img 
                            src={company.logo}
                            alt={company.name}
                            className="h-24 w-auto object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Nombre del producto */}
                    <div className="text-5xl font-bold text-black tracking-tight leading-tight uppercase mt-28 text-center">
                      {product.name}
                    </div>

                    {/* Descuento y Condiciones */}
                    {promotion && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <div className="bg-red-600 text-white px-6 py-2 rounded-full text-3xl font-bold">
                            {promotion.discount}
                          </div>
                        </div>

                        {/* Condiciones y vigencia */}
                        <div className="text-right absolute top-40 right-10">
                          {promotion.conditions && promotion.conditions.length > 0 && (
                            <div className="text-[14px]" style={roundedFontStyle}>
                              <span className="text-gray-600">Condiciones:</span><br />
                              {promotion.conditions.map((condition, index) => (
                                <div key={index}>• {condition}</div>
                              ))}
                            </div>
                          )}
                          {(promotion.startDate || promotion.endDate) && (
                            <div className="text-[14px] mt-2" style={roundedFontStyle}>
                              <span className="text-gray-600">Vigencia:</span><br />
                              {promotion.startDate && <div>Del {new Date(promotion.startDate).toLocaleDateString()}</div>}
                              {promotion.endDate && <div>al {new Date(promotion.endDate).toLocaleDateString()}</div>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sección de precios - Movemos arriba antes de la información adicional */}
                    <div className="flex-grow flex flex-col items-center justify-center -mt-0">
                      {/* Precio tachado y descuento */}
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-[50px] text-gray-400 line-through">
                          ${product.price.toLocaleString('es-AR')}
                        </span>
                      </div>

                      {/* Precio Final */}
                      <span className="text-[110px] font-black leading-none mb-4" 
                            style={{ 
                              ...roundedFontStyle,
                              letterSpacing: '-0.01em'
                            }}>
                        ${Math.round(priceInfo.finalPrice).toLocaleString('es-AR')}
                      </span>
                    </div>

                    {/* Información adicional */}
                    <div className="grid grid-cols-2 gap-4 text-gray-800 mt-4">
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
                    <div className="flex justify-between items-end mt-4">
                      <div className="text-base text-left">
                        SKU: {barcode}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 