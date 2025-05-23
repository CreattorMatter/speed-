// Plantilla 14: Variante de COMBO DTO
import React from "react";

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

const Ladrillazos14: React.FC<MockupProps> = ({
  small,
  nombre,
  precioActual,
  porcentaje, // eslint-disable-line @typescript-eslint/no-unused-vars
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
          small ? "scale-[0.6] max-w-[400px]" : "scale-100 max-w-[400px]"
        } w-full`}
      >
        <div className="border-2 border-black font-sans w-full bg-white">
          {/* Header negro LADRILLAZOS */}
          <div className="bg-black text-white text-xl font-bold text-center py-3">
            LADRILLAZOS
          </div>
          
          {/* Promoción 3x2 prominente */}
          <div className="bg-green-500 text-white text-2xl font-extrabold text-center py-3">
            3X2 COMBINABLE
          </div>
          
          {/* Descripción del producto */}
          <div className="text-center text-lg font-bold mt-4 px-2 leading-tight text-gray-600">
            {nombre || "DESCRIPCIÓN PRODUCTO"}
          </div>
          
          {/* Precio unitario */}
          <div className="text-center mt-6">
            <div className="font-bold text-sm text-black">PRECIO UNITARIO</div>
            <div className="text-5xl font-extrabold text-black mt-2">
              ${precioActual || "000"}
            </div>
          </div>
          
          {/* Explicación de la promoción */}
          <div className="bg-yellow-400 text-black text-sm font-bold text-center py-2 mx-4 mt-6">
            COMBINA PRODUCTOS DE DIFERENTES CATEGORÍAS
          </div>
          
          {/* Información adicional */}
          <div className="flex justify-between px-3 text-xs font-bold mt-6">
            <div>{fechasDesde || "23/05/2025"}-{fechasHasta || "23/05/2025"}</div>
            <div>SAP:{sap || "00000000"}</div>
            <div>ORIGEN: {origen || "XXXXXXX"}</div>
          </div>
          
          {/* Pie de página */}
          <div className="text-center text-xs text-gray-700 mt-2 mb-2 px-2 leading-tight">
            PRECIO SIN IMPUESTOS NACIONALES: ${precioSinImpuestos || "0000,00"}<br />
            ACUMULABLE CON OTRAS PROMOCIONES Y/O DESCUENTOS
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ladrillazos14; 