// Plantilla 12: Variante de COMBO DTO
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

const Ladrillazos12: React.FC<MockupProps> = ({
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
          
          {/* PromociÃ³n 3x2 prominente */}
          <div className="bg-yellow-400 text-black text-3xl font-extrabold text-center py-4">
            3X2
          </div>
          
          {/* DescripciÃ³n del producto */}
          <div className="text-center text-lg font-bold mt-4 px-2 leading-tight text-gray-600">
            {nombre || "DESCRIPCIÃ“N PRODUCTO"}
          </div>
          
          {/* Precio unitario */}
          <div className="text-center mt-6">
            <div className="font-bold text-sm text-black">PRECIO UNITARIO</div>
            <div className="text-5xl font-extrabold text-black mt-2">
              ${precioActual || "000"}
            </div>
          </div>
          
          {/* ExplicaciÃ³n de la promociÃ³n */}
          <div className="bg-red-500 text-white text-sm font-bold text-center py-2 mx-4 mt-6">
            LLEVÃS 3 PRODUCTOS Y PAGÃS SOLO 2
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

export default Ladrillazos12; 






