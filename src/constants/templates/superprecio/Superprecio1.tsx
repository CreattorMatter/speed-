import React from 'react';

interface MockupProps {
  small?: boolean;
}

const Superprecio1: React.FC<MockupProps> = () =>  (
    <div className="w-[650px] bg-white border-2 border-black font-sans mx-auto">
      <div className="bg-red-600 text-white text-[2.5rem] py-4 px-6 font-bold text-center">
        Feria de <span className="text-yellow-400">descuentos</span>
      </div>
      <div className="bg-yellow-300 text-black text-2xl font-bold text-center py-2 tracking-wider">
        00% DE DESCUENTO
      </div>
      <div className="text-center text-xl font-bold my-4 tracking-wide">
        TANQUE CLÁSICO 300LTS ETERNIT
      </div>
      <div className="flex justify-between px-5">
        <div className="text-left w-[130px] mt-2">
          <div className="text-sm font-bold mb-5">
            <div>AHORA</div>
            <div className="text-xs font-normal">PRECIO<br />CON DESCUENTO</div>
          </div>
          <div className="text-lg font-bold mt-4">ANTES</div>
        </div>
  
        <div className="flex-1 text-center">
          <div className="text-[3rem] font-extrabold tracking-wide">$xxx.xxx<sup className="text-lg align-super ml-1">00</sup></div>
          <div className="text-[1.5rem] text-gray-800"><s>$128.665</s></div>
        </div>
  
        <div className="text-right w-[160px] mt-2 text-sm">
          <div className="text-base">
            3 CUOTAS FIJAS<br />
            <b>SIN INTERÉS</b><br />
            <span className="text-sm">TARJETAS BANCARIAS</span><br />
          </div>
          <div className="mt-2 flex justify-end gap-1 flex-wrap">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="w-8 h-5" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="w-8 h-5" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fb/Cabal-logo.svg" alt="Cabal" className="w-8 h-5" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Diners_Club_Logo3.svg" alt="Diners" className="w-8 h-5" />
          </div>
        </div>
      </div>
  
      <div className="flex justify-between px-7 py-4 text-sm font-bold">
        <div>15/05/2025-18/05/2025</div>
        <div>SAP:1063055</div>
        <div>ORIGEN: ARGENTINA</div>
      </div>
      <div className="text-center text-sm text-gray-700 mb-4">
        PRECIO SIN IMPUESTOS NACIONALES: $ 44.723,14<br />
        NO ACUMULABLE CON OTRAS PROMOCIONES Y/O DESCUENTOS
      </div>
    </div>
  );
  
  export default Superprecio1;