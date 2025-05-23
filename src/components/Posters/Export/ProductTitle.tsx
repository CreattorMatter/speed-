import React from 'react';

interface ProductTitleProps {
  productName: string;
}

export const ProductTitle: React.FC<ProductTitleProps> = ({
  productName
}) => {
  return (
    <h1 style={{
      fontSize: '56px',
      fontWeight: 900,
      textAlign: 'center',
      textTransform: 'uppercase',
      marginTop: '120px',
      marginBottom: '40px',
      padding: '0 32px',
      lineHeight: '1.1',
      fontFamily: 'VAG Rounded BT, VAG Rounded Std, Arial Rounded MT Bold, Arial Black, sans-serif'
    }}>
      {productName}
    </h1>
  );
}; 