import React from "react";
import { getLadrillazoHeaderUrl } from "../../../utils/imageUtils";

// Definimos la interfaz para las opciones de financiación
interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  cardImage: string;
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

const Ladrillazos1: React.FC<MockupProps> = ({
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
        className={`transition-transform duration-300 ease-in-out w-full ${
          small ? "scale-[0.6] max-w-[95vw] sm:max-w-[400px]" : "scale-100 max-w-[90vw] sm:max-w-[600px]"
        }`}
      >
        <div className="border-2 border-black font-sans w-full bg-white overflow-hidden">
          {/* Header con imagen de ladrillo LADRILLAZOS */}
          <div 
            className={`text-white text-xl font-bold text-center py-0 relative w-full ${
              small ? "h-[120px] xs:h-[140px] sm:h-[160px]" : "h-[160px] sm:h-[180px] lg:h-[200px]"
            }`}
            style={{
              backgroundImage: `url('${getLadrillazoHeaderUrl()}')`,
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
          </div>
          
          {/* Descripción del producto */}
          <div className={`text-center font-bold px-2 leading-tight text-gray-600 ${
            small ? "text-sm xs:text-base mt-2 xs:mt-3" : "text-base sm:text-lg mt-3 sm:mt-4"
          }`}>
            <span className="break-words">{nombre || "DESCRIPCIÓN PRODUCTO"}</span>
          </div>
          
          {/* Símbolo de peso y precio principal */}
          <div className={`flex items-start justify-center px-4 ${
            small ? "mt-3 xs:mt-4" : "mt-4 sm:mt-6"
          }`}>
            <div className="flex items-start flex-wrap justify-center">
              <div className={`font-bold text-black mr-2 ${
                small ? "text-2xl xs:text-3xl" : "text-3xl sm:text-4xl"
              }`}>$</div>
              <div className={`font-bold text-gray-500 leading-none ${
                small ? "text-3xl xs:text-4xl" : "text-4xl sm:text-5xl"
              }`}>
                <span className="break-all">{precioActual || "999999.99"}</span>
              </div>
            </div>
          </div>
          
          {/* Etiqueta PRECIO CONTADO */}
          <div className="text-center mt-2">
            <div className="text-sm font-bold text-black">
              PRECIO CONTADO
            </div>
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
            NO ACUMULABLE CON OTRAS PROMOCIONES Y/O DESCUENTOS
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ladrillazos1;






