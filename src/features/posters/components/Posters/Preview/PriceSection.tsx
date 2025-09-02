import React from 'react';
import AutoFitText from '../../../../../components/shared/AutoFitText';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Promotion {
  discount: string;
  bank?: string;
  cardType?: string;
  type?: 'percentage' | '2x1' | '3x2' | 'second-70';
}

interface PriceSectionProps {
  product?: Product;
  promotion?: Promotion;
  roundedFontStyle: React.CSSProperties;
}

export const PriceSection: React.FC<PriceSectionProps> = ({
  product,
  promotion,
  roundedFontStyle
}) => {
  if (!product) return null;

  const originalPrice = product.price;
  let finalPrice = originalPrice;
  let discountAmount = 0;

  // Calcular precio con descuento
  if (promotion && promotion.discount) {
    if (promotion.type === 'percentage') {
      const percentOff = parseFloat(promotion.discount.replace('%', ''));
      discountAmount = (originalPrice * percentOff) / 100;
      finalPrice = originalPrice - discountAmount;
    } else if (promotion.type === 'second-70') {
      // Lógica para segunda unidad 70% off (simplificada)
      finalPrice = originalPrice * 0.85; // Precio promedio
    }
  }

  const formatARS = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  return (
    <div className="absolute bottom-32 left-8 right-8">
      {/* Precio original con AutoFitText */}
      {promotion && discountAmount > 0 && (
        <div 
          className="text-red-500 line-through font-bold mb-2"
          style={{
            ...roundedFontStyle,
            height: '60px', // Altura más pequeña para precio tachado
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <AutoFitText
            text={formatARS(originalPrice)}
            style={{
              width: '100%',
              height: '100%',
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#ef4444', // text-red-500
              textDecoration: 'line-through',
              ...roundedFontStyle
            }}
            baseFontSize={24} // Tamaño base equivalente a text-2xl
            minFontSize={16}
            maxFontSize={48}
          />
        </div>
      )}

      {/* Precio final con AutoFitText */}
      <div 
        className="text-green-600 font-black"
        style={{ 
          ...roundedFontStyle,
          height: '120px', // Altura fija para que AutoFitText tenga referencia
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <AutoFitText
          text={formatARS(finalPrice)}
          style={{
            width: '100%',
            height: '100%',
            textAlign: 'center',
            fontWeight: 'black',
            color: '#16a34a', // text-green-600
            ...roundedFontStyle
          }}
          baseFontSize={48} // Tamaño base equivalente a text-5xl
          minFontSize={24}
          maxFontSize={120}
        />
      </div>

      {/* Información de promoción */}
      {promotion && (
        <div className="mt-2">
          <div 
            className="text-blue-600 text-lg font-bold"
            style={roundedFontStyle}
          >
            {promotion.discount}
            {promotion.bank && ` con ${promotion.bank}`}
            {promotion.cardType && ` ${promotion.cardType}`}
          </div>
        </div>
      )}
    </div>
  );
}; 