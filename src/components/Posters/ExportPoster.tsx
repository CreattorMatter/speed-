import React from 'react';

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
  // Estilos específicos para la exportación
  const styles = {
    container: {
      width: '900px',
      height: '600px',
      backgroundColor: 'white',
      position: 'relative' as const,
      fontFamily: 'VAG Rounded BT, VAG Rounded Std, Arial Rounded MT Bold, Arial Black, sans-serif',
      overflow: 'hidden',
      padding: '24px'
    },
    logo: {
      position: 'absolute' as const,
      left: '24px',
      top: '24px',
      height: '90px',
      width: 'auto'
    },
    watermark: {
      position: 'absolute' as const,
      width: '120%',
      height: '120%',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-30deg)',
      opacity: 0.05,
      objectFit: 'contain' as const,
      filter: 'grayscale(100%)',
      mixBlendMode: 'multiply' as const
    },
    title: {
      fontSize: '56px',
      fontWeight: 900,
      textAlign: 'center' as const,
      textTransform: 'uppercase' as const,
      marginTop: '120px',
      marginBottom: '40px',
      padding: '0 32px',
      lineHeight: '1.1'
    },
    priceSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      flex: 1,
      marginTop: '20px'
    },
    strikePrice: {
      fontSize: '50px',
      color: '#6B7280',
      textDecoration: 'line-through',
      textDecorationThickness: '1.5px',
      opacity: 0.8,
      marginBottom: '16px',
      fontWeight: '400'
    },
    discount: {
      backgroundColor: '#DC2626',
      color: '#FBBF24',
      padding: '8px 40px',
      borderRadius: '9999px',
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '16px',
      letterSpacing: '0.5px'
    },
    finalPrice: {
      fontSize: '90px',
      fontWeight: 900,
      lineHeight: '1',
      marginTop: '16px'
    },
    financing: {
      backgroundColor: '#4F46E5',
      color: 'white',
      padding: '12px 32px',
      borderRadius: '9999px',
      fontSize: '24px',
      fontWeight: 500,
      marginTop: '24px'
    },
    bottomSection: {
      position: 'absolute',
      bottom: '24px',
      left: '24px',
      right: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    },
    origin: {
      fontSize: '18px',
      fontWeight: 500,
      marginBottom: '8px'
    },
    sku: {
      fontSize: '18px'
    },
    points: {
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'right' as const,
      position: 'absolute',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    qr: {
      width: '64px',
      height: '64px',
      backgroundColor: 'white',
      borderRadius: '4px',
      marginLeft: 'auto'
    },
    qrText: {
      fontSize: '12px',
      color: '#6B7280',
      textAlign: 'left' as const,
      marginLeft: '8px'
    },
    bankSection: {
      position: 'absolute' as const,
      right: '24px',
      top: '24px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end'
    },
    bankLogo: {
      width: '120px',
      height: 'auto',
      objectFit: 'contain' as const
    },
    conditions: {
      position: 'absolute',
      right: '24px',
      top: '160px',
      textAlign: 'right' as const
    },
    conditionsTitle: {
      fontSize: '16px',
      marginBottom: '4px',
      fontWeight: 600
    },
    conditionItem: {
      fontSize: '14px',
      marginBottom: '2px'
    },
    vigencia: {
      marginTop: '12px'
    }
  };

  // Calcular precio con descuento
  const calculateFinalPrice = () => {
    if (!promotion) return product.price;
    const discountMatch = promotion.discount.match(/(\d+)/);
    if (!discountMatch) return product.price;
    const discountPercent = parseInt(discountMatch[0]);
    return product.price * (1 - discountPercent / 100);
  };

  const finalPrice = calculateFinalPrice();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://speed-plus.com/product/${barcode || 'default'}`;

  return (
    <div style={styles.container}>
      {/* Logo y marca de agua */}
      {company?.logo && (
        <>
          <img src={company.logo} alt={company.name} style={styles.logo} />
          <img src={company.logo} alt={company.name} style={styles.watermark} />
        </>
      )}

      {/* Título del producto */}
      <div style={styles.title}>{product.name}</div>

      {/* Sección de precios */}
      <div style={styles.priceSection}>
        <div style={styles.strikePrice}>
          ${product.price.toLocaleString('es-AR')}
        </div>

        {promotion && (
          <div style={styles.discount}>
            {promotion.discount}
          </div>
        )}

        <div style={styles.finalPrice}>
          ${Math.round(finalPrice).toLocaleString('es-AR')}
        </div>

        {financing && financing.length > 0 && (
          <div style={styles.financing}>
            12 cuotas con 10% interés
          </div>
        )}
      </div>

      {/* Sección inferior */}
      <div style={styles.bottomSection}>
        <div>
          <div style={styles.origin}>ORIGEN: {origin}</div>
          <div style={styles.sku}>SKU: {barcode}</div>
        </div>
      </div>

      <div style={styles.points}>
        SUMÁ {points} PUNTOS JUMBO MÁS
      </div>

      <div style={{ position: 'absolute', right: '24px', bottom: '24px', display: 'flex', alignItems: 'center' }}>
        <img src={qrUrl} alt="QR Code" style={styles.qr} />
        <span style={styles.qrText}>
          más información<br />del producto
        </span>
      </div>

      {/* Sección del banco y condiciones */}
      {financing && financing.length > 0 && (
        <>
          <div style={styles.bankSection}>
            <img 
              src={financing[0].logo}
              alt={financing[0].bank}
              style={styles.bankLogo}
            />
          </div>
          {promotion && (
            <div style={styles.conditions}>
              <div style={styles.conditionsTitle}>Condiciones:</div>
              {promotion.conditions?.map((condition, index) => (
                <div key={index} style={styles.conditionItem}>• {condition}</div>
              ))}
              {(promotion.startDate || promotion.endDate) && (
                <div style={styles.vigencia}>
                  <div style={styles.conditionsTitle}>Vigencia:</div>
                  <div style={styles.conditionItem}>
                    Del {new Date(promotion.startDate || '').toLocaleDateString()}
                    <br />
                    al {new Date(promotion.endDate || '').toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}; 