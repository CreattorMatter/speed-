﻿// Plantilla 15: Promociones Especiales
import React from "react";
import { getLadrillazoHeaderUrl } from "../../../utils/imageUtils";

interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  plan: string;
}

interface MockupProps {
  small?: boolean;
  nombre?: string;
  precioActual?: string;
  porcentaje?: string;
  sap?: string;
  fechasDesde?: string;
  fechasHasta?: string;
  origen?: string;
  precioSinImpuestos?: string;
  financiacion?: FinancingOption[];
}

const Ladrillazos15: React.FC<MockupProps> = ({
  small,
  nombre,
  precioActual,
  porcentaje,
  sap,
  fechasDesde,
  fechasHasta,
  origen,
  precioSinImpuestos,
  financiacion // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div
        className={`transition-transform duration-300 ease-in-out ${
          small ? "scale-[0.6] max-w-[400px]" : "scale-100 max-w-[600px]"
        } w-full`}
      >
        <div className="border-2 border-black font-sans w-full bg-white">
          {/* Header con imagen de ladrillo LADRILLAZOS */}
          <div 
            className="text-white text-xl font-bold text-center py-4 relative min-h-[60px]"
            style={{
              backgroundImage: `url('${getLadrillazoHeaderUrl()}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
            
          </div>
          
          {/* Porcentaje de descuento prominente */}
          <div className="bg-orange-400 text-black text-3xl font-bold text-center py-4">
            {porcentaje || "25"}% DE DESCUENTO
          </div>
          
          {/* DescripciÃ³n del producto */}
          <div className="text-center text-lg font-bold mt-4 px-2 leading-tight text-gray-600">
            {nombre || "DESCRIPCIÃ“N PRODUCTO"}
          </div>
          
          {/* Precio con descuento */}
          <div className="text-center mt-6">
            <div className="font-bold text-sm text-black">PRECIO CON DESCUENTO</div>
            <div className="text-6xl font-extrabold text-black mt-2">
              ${precioActual || "000"}
            </div>
          </div>
          
          {/* VÃ¡lido para toda la categorÃ­a */}
          <div className="bg-red-500 text-white text-sm font-bold text-center py-2 mx-4 mt-6">
            VÃLIDO PARA TODA LA CATEGORÃA
          </div>
          
          {/* InformaciÃ³n adicional */}
          <div className="flex justify-between px-3 text-xs font-bold mt-6">
            <div>{fechasDesde || "23/05/2025"}-{fechasHasta || "23/05/2025"}</div>
            <div>SAP:{sap || "00000000"}</div>
            <div>ORIGEN: {origen || "XXXXXXX"}</div>
          </div>
          
          {/* Pie de pÃ¡gina */}
          <div className="text-center text-xs text-gray-700 mt-2 mb-2 px-2 leading-tight">
            PRECIO SIN IMPUESTOS NACIONALES: ${precioSinImpuestos || "0000,00"}<br />
            NO ACUMULABLE CON OTRAS PROMOCIONES Y/O DESCUENTOS
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ladrillazos15; 






