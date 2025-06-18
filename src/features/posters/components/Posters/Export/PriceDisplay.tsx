import React from 'react';

interface PriceDisplayProps {
  originalPrice: number;
  promotion?: {
    discount: string;
  };
  financing?: {
    logo: string;
    bank: string;
    plan: string;
  }[];
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  originalPrice,
  promotion,
  financing
}) => {
  const calculateFinalPrice = () => {
    if (!promotion) return originalPrice;
    const discountMatch = promotion.discount.match(/(\d+)/);
    if (!discountMatch) return originalPrice;
    const discountPercent = parseInt(discountMatch[0]);
    return originalPrice * (1 - discountPercent / 100);
  };

  const finalPrice = calculateFinalPrice();
  const hasDiscount = promotion && finalPrice !== originalPrice;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      flex: 1,
      marginTop: '20px',
      fontFamily: 'VAG Rounded BT, VAG Rounded Std, Arial Rounded MT Bold, Arial Black, sans-serif'
    }}>
      {/* Precio tachado */}
      {hasDiscount && (
        <div style={{
          fontSize: '50px',
          color: '#6B7280',
          textDecoration: 'line-through',
          textDecorationThickness: '1.5px',
          opacity: 0.8,
          marginBottom: '16px',
          fontWeight: '400'
        }}>
          ${originalPrice.toLocaleString()}
        </div>
      )}

      {/* Badge de descuento */}
      {promotion && (
        <div style={{
          backgroundColor: '#DC2626',
          color: '#FBBF24',
          padding: '8px 40px',
          borderRadius: '9999px',
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '16px',
          letterSpacing: '0.5px'
        }}>
          {promotion.discount}
        </div>
      )}

      {/* Precio final */}
      <div style={{
        fontSize: '90px',
        fontWeight: 900,
        lineHeight: '1',
        marginTop: '16px'
      }}>
        ${finalPrice.toLocaleString()}
      </div>

      {/* Información de financiación */}
      {financing && financing.length > 0 && (
        <div style={{
          backgroundColor: '#4F46E5',
          color: 'white',
          padding: '12px 32px',
          borderRadius: '9999px',
          fontSize: '24px',
          fontWeight: 500,
          marginTop: '24px'
        }}>
          {financing[0].plan}
        </div>
      )}
    </div>
  );
}; 