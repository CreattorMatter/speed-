// Plantilla 10: Variante de ANTES/AHORA con DTO
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

const Ladrillazos10: React.FC<MockupProps> = ({
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
          
          {/* DescripciÃ³n del producto */}
          <div className="text-center text-lg font-bold mt-4 px-2 leading-tight text-gray-600">
            {nombre || "DESCRIPCIÃ“N PRODUCTO"}
          </div>
          
          {/* Logo Cencopay */}
          <div className="flex justify-end px-4 mt-2">
            <div className="bg-blue-600 rounded font-bold flex items-center justify-center px-3 py-1">
              <img 
                src={getBankLogoUrl('cencopay')} 
                alt="Logo Cencopay" 
                className="h-4 w-auto"
                onError={(e) => {
                  // Fallback si no se puede cargar la imagen
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          
          {/* Precios principales para flooring */}
          <div className="mt-4 px-4">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-black">$</div>
                <div className="text-sm font-bold text-black mt-2">PRECIO</div>
                <div className="text-sm font-bold text-black">REGULAR X MÂ²</div>
              </div>
              
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-500 leading-none">
                  {precioActual?.padStart(3, '0') || "000"}
                </div>
                <div className="text-4xl font-bold text-yellow-400 -mt-2">
                  00
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-bold text-black">12 CUOTAS SIN INTERESES</div>
                <div className="text-2xl font-bold text-black mt-1">
                  ${Math.round((Number(precioActual) || 999) / 12)}<sup className="text-sm align-super">00</sup>
                </div>
              </div>
            </div>
          </div>
          
          {/* InformaciÃ³n de financiaciÃ³n */}
          <div className="bg-gray-100 p-2 mt-4 text-xs text-center">
            <div className="font-bold">PRECIO TOTAL FINANCIADO: ${precioActual || "999"}</div>
            <div>TASA EFECTIVA ANUAL: 0,00%</div>
            <div className="text-lg font-bold mt-1">CFT: 0,00%</div>
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

export default Ladrillazos10; 






