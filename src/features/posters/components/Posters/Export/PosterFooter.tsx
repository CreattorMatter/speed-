import React from 'react';

interface PosterFooterProps {
  product: {
    name: string;
    id?: string;
  };
  origin?: string;
  points?: string;
  barcode?: string;
}

export const PosterFooter: React.FC<PosterFooterProps> = ({
  product,
  origin = 'ARGENTINA',
  points = '49',
  barcode
}) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://speed-plus.com/product/${product.id || product.name}`;

  return (
    <>
      {/* Información inferior */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        right: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        fontFamily: 'VAG Rounded BT, VAG Rounded Std, Arial Rounded MT Bold, Arial Black, sans-serif'
      }}>
        {/* Información del producto */}
        <div>
          <div style={{
            fontSize: '18px',
            fontWeight: 500,
            marginBottom: '8px'
          }}>
            Origen: {origin}
          </div>
          {barcode && (
            <div style={{
              fontSize: '18px'
            }}>
              SKU: {barcode}
            </div>
          )}
        </div>

        {/* QR Code */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}>
          <img
            src={qrUrl}
            alt="QR Code"
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'white',
              borderRadius: '4px'
            }}
          />
          <div style={{
            fontSize: '12px',
            color: '#6B7280',
            textAlign: 'right',
            marginTop: '4px'
          }}>
            Escanea para más info
          </div>
        </div>
      </div>

      {/* Puntos */}
      <div style={{
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'VAG Rounded BT, VAG Rounded Std, Arial Rounded MT Bold, Arial Black, sans-serif'
      }}>
        {points} pts
      </div>
    </>
  );
}; 