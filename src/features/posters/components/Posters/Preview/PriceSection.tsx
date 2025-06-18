import React from 'react';

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

  return (
    <div className="absolute bottom-32 left-8 right-8">
      {/* Precio original */}
      {promotion && discountAmount > 0 && (
        <div 
          className="text-red-500 line-through text-2xl font-bold mb-2"
          style={roundedFontStyle}
        >
          ${originalPrice.toFixed(2)}
        </div>
      )}

      {/* Precio final */}
      <div 
        className="text-green-600 text-5xl font-black"
        style={roundedFontStyle}
      >
        ${finalPrice.toFixed(2)}
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