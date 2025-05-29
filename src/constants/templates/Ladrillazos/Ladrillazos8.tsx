// Plantilla 8: Variante de ANTES/AHORA con DTO
import React from "react";
import { getLadrillazoHeaderUrl, getBankLogoUrl } from "../../../utils/imageUtils";

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

const Ladrillazos8: React.FC<MockupProps> = ({
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
            className="text-white text-xl font-bold text-center py-12 relative min-h-[150px]"
            style={{
              backgroundImage: `url('${getLadrillazoHeaderUrl()}')`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
          </div>
          
          {/* DescripciÃ³n del producto */}
          <div className="text-center text-lg font-bold mt-4 px-2 leading-tight text-gray-600">
            {nombre || "DESCRIPCIÃ“N PRODUCTO"}
          </div>
          
          {/* Logo Cencopay */}
          <div className="flex justify-center px-4 mt-4">
            <div className="bg-blue-600 rounded font-bold flex items-center justify-center px-4 py-2">
              <img 
                src={getBankLogoUrl('cencopay')} 
                alt="Logo Cencopay" 
                className="h-6 w-auto"
                onError={(e) => {
                  // Fallback si no se puede cargar la imagen
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          
          {/* Precio contado */}
          <div className="text-center mt-4">
            <div className="font-bold text-sm text-black">PRECIO CONTADO</div>
            <div className="text-4xl font-extrabold text-black mt-2">
              ${precioActual || "000"}
            </div>
          </div>
          
          {/* Cuotas sin intereses */}
          <div className="text-center mt-4">
            <div className="text-sm font-bold text-black">12 CUOTAS FIJAS SIN INTERÃ‰S</div>
            <div className="text-3xl font-extrabold text-black mt-2">
              ${Math.round((Number(precioActual) || 999) / 12)}<sup className="text-lg align-super">00</sup>
            </div>
          </div>
          
          {/* InformaciÃ³n de financiaciÃ³n */}
          <div className="bg-gray-100 p-2 mt-4 text-xs text-center">
            <div className="font-bold">PRECIO TOTAL FINANCIADO: ${precioActual || "999"}</div>
            <div>TASA EFECTIVA ANUAL: 0,00%</div>
            <div>CFT: 0,00%</div>
          </div>
          
          {/* InformaciÃ³n adicional */}
          <div className="flex justify-between px-3 text-xs font-bold mt-4">
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

export default Ladrillazos8; 






