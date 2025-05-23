import React from 'react';
import { PosterHeader } from './Export/PosterHeader';
import { ProductTitle } from './Export/ProductTitle';
import { PriceDisplay } from './Export/PriceDisplay';
import { PosterFooter } from './Export/PosterFooter';

interface ExportPosterProps {
  product: {
    name: string;
    price: number;
    id?: string;
  };
  promotion?: {
    discount: string;
    conditions?: string[];
    startDate?: string;
    endDate?: string;
  };
  company?: {
    logo: string;
    name: string;
  };
  points?: string;
  origin?: string;
  barcode?: string;
  financing?: {
    logo: string;
    bank: string;
    plan: string;
  }[];
}

export const ExportPoster: React.FC<ExportPosterProps> = ({
  product,
  promotion,
  company,
  points = '49',
  origin = 'ARGENTINA',
  barcode,
  financing
}) => {
  const containerStyle = {
    width: '900px',
    height: '600px',
    backgroundColor: 'white',
    position: 'relative' as const,
    fontFamily: 'VAG Rounded BT, VAG Rounded Std, Arial Rounded MT Bold, Arial Black, sans-serif',
    overflow: 'hidden',
    padding: '24px'
  };

  return (
    <div style={containerStyle}>
      {/* Marca de agua de fondo */}
      {company?.logo && (
        <img
          src={company.logo}
          alt=""
          style={{
            position: 'absolute',
            width: '120%',
            height: '120%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-30deg)',
            opacity: 0.05,
            objectFit: 'contain',
            filter: 'grayscale(100%)',
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* Header con logos */}
      <PosterHeader
        company={company}
        financing={financing}
      />

      {/* Condiciones y vigencia */}
      {promotion && (promotion.conditions || promotion.startDate || promotion.endDate) && (
        <div style={{
          position: 'absolute',
          right: '24px',
          top: '160px',
          textAlign: 'right',
          fontFamily: 'VAG Rounded BT, VAG Rounded Std, Arial Rounded MT Bold, Arial Black, sans-serif'
        }}>
          {promotion.conditions && promotion.conditions.length > 0 && (
            <>
              <div style={{
                fontSize: '16px',
                marginBottom: '4px',
                fontWeight: 600
              }}>
                Condiciones:
              </div>
              {promotion.conditions.map((condition, index) => (
                <div key={index} style={{
                  fontSize: '14px',
                  marginBottom: '2px'
                }}>
                  • {condition}
                </div>
              ))}
            </>
          )}
          
          {(promotion.startDate || promotion.endDate) && (
            <div style={{ marginTop: '12px' }}>
              <div style={{
                fontSize: '16px',
                marginBottom: '4px',
                fontWeight: 600
              }}>
                Vigencia:
              </div>
              <div style={{ fontSize: '14px' }}>
                {promotion.startDate && promotion.endDate
                  ? `${promotion.startDate} - ${promotion.endDate}`
                  : promotion.startDate || promotion.endDate
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* Título del producto */}
      <ProductTitle productName={product.name} />

      {/* Display de precios */}
      <PriceDisplay
        originalPrice={product.price}
        promotion={promotion}
        financing={financing}
      />

      {/* Footer con información adicional */}
      <PosterFooter
        product={product}
        origin={origin}
        points={points}
        barcode={barcode}
      />
    </div>
  );
}; 