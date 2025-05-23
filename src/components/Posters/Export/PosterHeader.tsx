import React from 'react';

interface PosterHeaderProps {
  company?: {
    logo: string;
    name: string;
  };
  financing?: {
    logo: string;
    bank: string;
    plan: string;
  }[];
}

export const PosterHeader: React.FC<PosterHeaderProps> = ({
  company,
  financing
}) => {
  return (
    <>
      {/* Logo de la empresa */}
      {company?.logo && (
        <img
          src={company.logo}
          alt={company.name}
          style={{
            position: 'absolute',
            left: '24px',
            top: '24px',
            height: '90px',
            width: 'auto'
          }}
        />
      )}

      {/* Logos de bancos/financiación */}
      {financing && financing.length > 0 && (
        <div style={{
          position: 'absolute',
          right: '24px',
          top: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}>
          {financing.slice(0, 3).map((finance, index) => (
            <img
              key={index}
              src={finance.logo}
              alt={finance.bank}
              style={{
                width: '120px',
                height: 'auto',
                objectFit: 'contain',
                marginBottom: index < financing.length - 1 ? '8px' : '0'
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}; 