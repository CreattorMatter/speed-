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
  pricePerUnit?: string;
  points?: string;
  origin?: string;
  barcode?: string;
  size?: {
    id: string;
    name: string;
  };
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({ 
  product,
  promotion,
  company,
  pricePerUnit = '',
  points = '',
  origin = 'ARGENTINA',
  barcode = '7790895000782',
  size
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

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto relative overflow-hidden" style={{ fontFamily: 'VAG Rounded Std, Arial Rounded MT Bold, Arial, sans-serif' }}>
      {/* Logo de fondo translúcido */}
      {company && company.logo && (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <img 
            src={company.logo}
            alt={company.name}
            className="w-2/3 object-contain"
          />
        </div>
      )}

      <div className="space-y-6 text-center relative">
        {/* Logo superior izquierdo */}
        {company && company.logo && (
          <div className="absolute left-0 top-0">
            <img 
              src={company.logo}
              alt={company.name}
              className="h-24 w-auto object-contain"
            />
          </div>
        )}

        {/* Nombre y descripción del producto */}
        <div className="space-y-2">
          <div className="text-4xl font-black text-black tracking-tight leading-tight uppercase">
            {product.name.toLowerCase()}
          </div>
          <div className="text-xl font-medium text-gray-600">
            {product.description.toLowerCase()}
          </div>
        </div>

        {/* Banner de promoción */}
        {promotion?.type === 'second-70' && (
          <div className="bg-red-600 text-white py-2 px-4 rounded-lg">
            <div className="text-2xl font-black">
              2da UNIDAD
            </div>
            <div className="text-4xl font-black">
              70% OFF
            </div>
            <div className="text-sm mt-1 font-medium">
              En la compra de 2 unidades iguales
            </div>
          </div>
        )}

        <div className="flex justify-between items-start">
          {/* Precios */}
          <div className="flex-1 space-y-2">
            {promotion && (
              <div className="flex items-center justify-center gap-4">
                {promotion.type === 'second-70' ? (
                  <div className="flex flex-col items-center">
                    <div className="text-3xl text-gray-500 line-through font-black">
                      ${(product.price * 2).toLocaleString('es-AR')}
                    </div>
                    <div className="flex flex-col gap-1 text-lg">
                      <div>1ra unidad ${product.price.toLocaleString('es-AR')}</div>
                      <div className="text-red-600 font-bold">
                        2da unidad ${priceInfo.secondUnitPrice?.toLocaleString('es-AR')}
                      </div>
                      <div className="text-sm text-gray-600">
                        *Válido en la compra de dos unidades iguales
                      </div>
                    </div>
                    <div className="text-xl font-bold mt-2">
                      Precio por unidad: ${priceInfo.unitPrice.toLocaleString('es-AR')}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl text-gray-500 line-through font-black">
                      ${product.price.toLocaleString('es-AR')}
                    </div>
                    <div className="bg-red-600 text-white px-4 py-1 rounded-full text-xl font-black">
                      {promotion.discount}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Precio Final */}
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-black">$</span>
              <span className="text-[100px] leading-none font-black tracking-tighter" style={{ letterSpacing: '-0.05em' }}>
                {Math.round(priceInfo.finalPrice).toLocaleString('es-AR')}
              </span>
            </div>

            {promotion?.type === 'second-70' && (
              <div className="text-2xl font-bold text-green-600">
                ¡Ahorrás ${priceInfo.savedAmount.toLocaleString('es-AR')}!
              </div>
            )}
          </div>

          {/* Información de la promoción */}
          {promotion && (
            <div className="w-48 text-left space-y-2 text-xs text-gray-600">
              {/* Banco y tarjeta */}
              {promotion.bank && (
                <div>
                  <p className="font-medium">{promotion.bank}</p>
                  {promotion.cardType && (
                    <p>{promotion.cardType}</p>
                  )}
                </div>
              )}

              {/* Condiciones */}
              {promotion.conditions && promotion.conditions.length > 0 && (
                <div>
                  <p className="font-medium">Condiciones:</p>
                  <ul className="space-y-0.5">
                    {promotion.conditions.map((condition, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vigencia */}
              {promotion.startDate && promotion.endDate && (
                <div>
                  <p className="font-medium">Vigencia:</p>
                  <p>Del {new Date(promotion.startDate).toLocaleDateString()}</p>
                  <p>al {new Date(promotion.endDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
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