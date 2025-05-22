import React from 'react';

interface MockupProps {
  small?: boolean;
}

const Superprecio: React.FC<MockupProps> = ({ small }) => (
<>
<title>Cartel de Descuentos</title>
  <style jsx>{`
    .promo-banner {
      width: 650px;
      background: #fff;
      border: 2px solid #000;
      font-family: Arial, Helvetica, sans-serif;
      padding: 0;
      margin: 0 auto;
    }
    .header {
      background: #ed2126;
      color: #fff;
      font-size: 2.5rem;
      padding: 16px 0 8px 24px;
      font-weight: bold;
      position: relative;
      text-align: center;
    }
    .header .discount {
      color: #ffe33a;
    }
    .sub-header {
      background: #ffe33a;
      color: #1c1c1c;
      font-size: 2rem;
      font-weight: bold;
      text-align: center;
      padding: 6px 0;
      letter-spacing: 2px;
    }
    .product-title {
      text-align: center;
      font-size: 1.3rem;
      font-weight: bold;
      margin: 18px 0 12px 0;
      letter-spacing: 1px;
    }
    .content-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 0 20px 0 35px;
    }
    .left {
      text-align: left;
      width: 130px;
      margin-top: 10px;
    }
    .now-label {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 22px;
    }
    .now-title {
      font-size: 13px;
    }
    .now-sub {
      font-size: 11px;
      font-weight: normal;
    }
    .before-label {
      margin-top: 30px;
      font-size: 17px;
      font-weight: bold;
    }
    .before-price {
      margin-left: 6px;
      font-size: 30px;
      color: #222;
    }
    .center {
      flex: 1;
      text-align: center;
    }
    .main-price {
      font-size: 4.5rem;
      font-weight: bold;
      color: #000;
      line-height: 1.1;
      letter-spacing: 2px;
    }
    .main-price sup {
      font-size: 1.5rem;
      vertical-align: super;
      margin-left: 1px;
    }
    .right {
      text-align: right;
      width: 160px;
      margin-top: 5px;
      font-size: 16px;
    }
    .installments {
      font-size: 17px;
    }
    .card-icon {
      width: 32px;
      height: 20px;
      margin: 3px 2px;
      vertical-align: middle;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
      padding: 16px 28px 3px 28px;
      font-size: 15px;
      font-weight: bold;
    }
    .footer-details {
      text-align: center;
      font-size: 14px;
      color: #232323;
      margin: 5px 10px 14px 10px;
      font-weight: normal;
    }
  `}</style>

  <div className="promo-banner">
    <div className="header">
      <span className="title">Feria de <span className="discount">descuentos</span></span>
    </div>
    <div className="sub-header">
      <span>00% DE DESCUENTOS</span>
    </div>
    <div className="product-title">
      TANQUE CLASICO 300LTS ETERNIT
    </div>
    <div className="content-row">
      <div className="left">
        <div className="now-label">
          <span className="now-title">AHORA</span><br />
          <span className="now-sub">PRECIO<br />CON DESCUENTO</span>
        </div>
        <div className="before-label">
          <span>ANTES</span>
        </div>
      </div>
      <div className="center">
        <span className="main-price">$xxx.xxx<sup>00</sup></span>
        <span className="before-price">$<s>128.665</s></span>
      </div>
      <div className="right">
        <div className="installments">
          3 CUOTAS FIJAS<br />
          <b>SIN INTERES</b><br />
          <span style={{ fontSize: '15px' }}>TARJETAS BANCARIAS</span><br />
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="card-icon" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="card-icon" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fb/Cabal-logo.svg" alt="Cabal" className="card-icon" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Diners_Club_Logo3.svg" alt="Diners" className="card-icon" />
        </div>
      </div>
    </div>
    <div className="footer-row">
      <div>
        15/05/2025-18/05/2025
      </div>
      <div>
        SAP:1063055
      </div>
      <div>
        ORIGEN: ARGENTINA
      </div>
    </div>
    <div className="footer-details">
      PRECIO SIN IMPUESTOS NACIONALES: $ 44.723,14
      <br />
      NO ACUMULABLE CON OTRAS PROMOCIONES Y/O DESCUENTOS
    </div>
  </div>
</>

);

export default Superprecio;