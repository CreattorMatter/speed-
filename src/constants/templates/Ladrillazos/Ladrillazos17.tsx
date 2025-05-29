// Plantilla 17: Promociones Especiales
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

const Ladrillazos17: React.FC<MockupProps> = ({
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
            className={`text-white text-xl font-bold text-center py-4 relative w-full ${
              small ? "h-[40px] xs:h-[50px] sm:h-[60px]" : "h-[50px] sm:h-[60px] lg:h-[70px]"
            }`}
            style={{
              backgroundImage: `url('${getLadrillazoHeaderUrl()}')`,
              backgroundSize: "cover",
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
          
          {/* Layout principal: AHORA a la izquierda, precio en el centro, ANTES a la derecha */}
          <div className="flex items-center justify-between px-6 mt-6">
            {/* AHORA - Lado izquierdo */}
            <div className="text-left">
              <div className="text-xl font-bold text-black">AHORA</div>
              <div className="text-6xl font-bold text-black mt-2">$</div>
              <div className="text-sm font-bold text-black mt-2">PRECIO</div>
              <div className="text-sm font-bold text-black">CONTADO</div>
            </div>
            
            {/* Precio principal - Centro - PRECIO MAS GRANDE */}
            <div className="text-center flex-1 mx-8">
              <div className="text-9xl font-bold text-gray-500 leading-none">
                {Number(precioActual || "449999").toLocaleString('es-AR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                }).replace(',', '.')}
              </div>
            </div>
            
            {/* ANTES - Lado derecho */}
            <div className="text-right">
              <div className="text-lg font-bold text-black">ANTES</div>
              <div className="text-2xl font-bold text-black line-through mt-4">
                ${Math.round((Number(precioActual) || 999) * 1.25) || "000"}
              </div>
            </div>
          </div>
          
          {/* Logo Cencopay arriba de las cuotas sin intereses */}
          <div className={`flex justify-center px-4 ${
            small ? "mt-4 xs:mt-6" : "mt-6"
          }`}>
            <div className={`bg-blue-600 rounded font-bold flex items-center justify-center ${
              small ? "px-2 py-0.5" : "px-3 py-1"
            }`}>
              <img 
                src={getBankLogoUrl('cencopay')} 
                alt="Logo Cencopay" 
                className={small ? "h-3 w-auto" : "h-4 w-auto"}
                onError={(e) => {
                  // Fallback si no se puede cargar la imagen
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          
          {/* Cuotas sin intereses */}
          <div className="text-center mt-2">
            <div className="text-sm font-bold text-black">6 cuotas sin interés</div>
            <div className="text-3xl font-bold text-black mt-1">
              $75.000<sup className="text-lg align-super">00</sup>
            </div>
          </div>
          
          {/* Información de financiación detallada - lado derecho */}
          <div className="bg-gray-100 p-3 mt-4 mx-4 text-xs">
            <div className="text-left space-y-1">
              <div><span className="font-bold">PRECIO TOTAL FINANCIADO:</span> ${precioActual || "0"}</div>
              <div><span className="font-bold">TASA EFECTIVA ANUAL:</span> 0,00%</div>
              <div><span className="font-bold">TASA NOMINAL ANUAL:</span> 0,00%</div>
              <div><span className="font-bold">COSTO FINANCIERO TOTAL (CFT):</span> 0,00%</div>
            </div>
            <div className="text-center mt-2">
              <div className="text-2xl font-bold text-black">CFT: 0,00%</div>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="flex justify-between px-3 text-xs font-bold mt-4">
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

export default Ladrillazos17; 






