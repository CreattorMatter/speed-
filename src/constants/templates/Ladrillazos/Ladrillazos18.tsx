// Plantilla 18: ANTES/AHORA CUOTAS
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

const Ladrillazos18: React.FC<MockupProps> = ({
  small,
  nombre,
  precioActual,
  porcentaje,
  sap,
  fechasDesde,
  fechasHasta,
  origen,
  precioSinImpuestos,
  financiacion
}) => {
  // Calcular valores con fallbacks apropiados
  const precioBase = precioActual || "1299999.99";
  const precioAntes = Math.round((Number(precioBase) || 0) * (1 + (Number(porcentaje) || 20) / 100)) || "1560000";
  
  // Información de financiación dinámica
  const financiacionActiva = financiacion && financiacion.length > 0 ? financiacion[0] : null;
  const cuotasTexto = financiacionActiva?.plan || "6 CUOTAS CON INTERÉS";
  const cuotasPorMes = financiacionActiva ? 
    Math.round((Number(precioBase) || 0) / parseInt(financiacionActiva.plan.split(' ')[0]) || 6) :
    Math.round((Number(precioBase) || 0) / 6) || "216667";
  
  // Obtener icono real de la financiación
  const getBankLogo = (bank: string) => {
    const bankName = bank?.toLowerCase();
    if (bankName?.includes('cencopay') || bankName?.includes('cencosud')) {
      return '/images/banks/cencopay.png';
    } else if (bankName?.includes('visa')) {
      return '/images/banks/visa-logo.png';
    } else if (bankName?.includes('mastercard')) {
      return '/images/banks/mastercard-logo.png';
    } else if (bankName?.includes('american') || bankName?.includes('amex')) {
      return '/images/banks/amex-logo.png';
    } else if (bankName?.includes('nacion')) {
      return '/images/banks/banco-nacion-logo.png';
    }
    return '/images/banks/visa-logo.png'; // default
  };

  const getBankText = (bank: string) => {
    const bankName = bank?.toLowerCase();
    if (bankName?.includes('visa')) {
      return 'VISA CRÉDITO';
    } else if (bankName?.includes('mastercard')) {
      return 'MASTERCARD';
    } else if (bankName?.includes('cencopay') || bankName?.includes('cencosud')) {
      return 'CENCOPAY';
    }
    return 'VISA CRÉDITO';
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div
        className={`transition-transform duration-300 ease-in-out ${
          small ? "scale-[0.65] max-w-[300px] xs:max-w-[350px] sm:max-w-[450px]" : "scale-100 max-w-[600px] sm:max-w-[700px] lg:max-w-[800px]"
        } w-full`}
      >
        <div className={`border-2 border-black font-sans w-full bg-white ${
          small ? "min-w-[280px] xs:min-w-[320px] sm:min-w-[400px] max-h-[400px] xs:max-h-[450px] sm:max-h-[500px]" : "min-w-[500px] sm:min-w-[600px] lg:min-w-[650px] max-h-[600px] sm:max-h-[700px] lg:max-h-[750px]"
        } overflow-hidden rounded-responsive`}>
          {/* Header con imagen de ladrillo LADRILLAZOS - SIN texto superpuesto */}
          <div 
            className={`relative ${
              small ? "min-h-[60px] xs:min-h-[70px] sm:min-h-[80px]" : "min-h-[100px] sm:min-h-[120px] lg:min-h-[140px]"
            }`}
            style={{
              backgroundImage: `url('${getLadrillazoHeaderUrl()}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
            {/* Sin texto superpuesto - la imagen ya contiene el texto LADRILLAZOS */}
          </div>
          
          {/* Descripción del producto */}
          <div className={`text-center font-bold px-2 xs:px-3 leading-tight text-gray-700 ${
            small ? "text-xs xs:text-sm mt-1 xs:mt-2" : "text-base sm:text-lg lg:text-xl mt-2 sm:mt-3"
          }`}>
            {nombre || "MacBook Pro M3 Pro 14\""}
          </div>
          
          {/* Logo de financiación dinámico */}
          <div className={`flex justify-end px-2 xs:px-3 ${small ? "mt-1" : "mt-1 sm:mt-2"}`}>
            <div className={`bg-blue-600 text-white rounded font-bold flex items-center gap-1 ${
              small ? "px-1.5 xs:px-2 py-0.5 xs:py-1 text-xxs xs:text-xs" : "px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
            }`}>
              <img 
                src={getBankLogoUrl(financiacionActiva?.bank || 'visa')} 
                alt="Bank Logo" 
                className={small ? "h-2 xs:h-3 w-auto" : "h-3 sm:h-4 w-auto"}
                onError={(e) => {
                  // Fallback si no se puede cargar la imagen
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="truncate">{getBankText(financiacionActiva?.bank || 'visa')}</span>
            </div>
          </div>
          
          {/* Layout principal responsive */}
          <div className={`flex items-center justify-between px-2 xs:px-3 sm:px-4 ${
            small ? "mt-1 xs:mt-2" : "mt-2 sm:mt-3 lg:mt-4"
          }`}>
            {/* Columna izquierda: AHORA y ANTES */}
            <div className={`text-center flex-shrink-0 ${
              small ? "w-16 xs:w-18 sm:w-20" : "w-24 sm:w-28 lg:w-32"
            }`}>
              {/* AHORA */}
              <div className={small ? "mb-1 xs:mb-2" : "mb-2 sm:mb-3 lg:mb-4"}>
                <div className={`font-bold text-black ${
                  small ? "text-xs xs:text-sm" : "text-sm sm:text-base lg:text-lg"
                }`}>AHORA</div>
                <div className={`font-bold text-black ${
                  small ? "text-xl xs:text-2xl sm:text-3xl mt-0.5 xs:mt-1" : "text-3xl sm:text-4xl lg:text-6xl mt-1 sm:mt-2"
                }`}>$</div>
                <div className={`font-bold text-black ${
                  small ? "text-xxs xs:text-xs mt-0.5 xs:mt-1" : "text-xs sm:text-sm mt-1 sm:mt-2"
                }`}>PRECIO</div>
                <div className={`font-bold text-black ${
                  small ? "text-xxs xs:text-xs" : "text-xs sm:text-sm"
                }`}>CONTADO</div>
              </div>
              
              {/* ANTES */}
              <div className="text-center">
                <div className={`font-bold text-black ${
                  small ? "text-xs xs:text-sm" : "text-sm sm:text-base lg:text-lg"
                }`}>ANTES</div>
                <div className={`font-bold text-black line-through ${
                  small ? "text-xs xs:text-sm mt-0.5 xs:mt-1" : "text-base sm:text-lg lg:text-xl mt-1 sm:mt-2"
                }`}>
                  ${Number(precioAntes).toLocaleString('es-AR')}
                </div>
              </div>
            </div>
            
            {/* Columna central: Precio principal */}
            <div className={`text-center flex-1 ${
              small ? "mx-1 xs:mx-2" : "mx-3 sm:mx-4 lg:mx-6"
            }`}>
              <div className={`font-bold text-gray-500 leading-none break-words ${
                small ? "text-lg xs:text-xl sm:text-2xl" : "text-2xl sm:text-4xl lg:text-6xl"
              }`}>
                {Number(precioBase).toLocaleString('es-AR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </div>
            </div>
            
            {/* Columna derecha: Cuotas */}
            <div className={`text-right flex-shrink-0 ${
              small ? "w-20 xs:w-22 sm:w-24" : "w-28 sm:w-32 lg:w-40"
            }`}>
              <div className={`font-bold text-black leading-tight ${
                small ? "text-xxs xs:text-xs" : "text-xs sm:text-sm"
              }`}>
                <span className="break-words">{cuotasTexto}</span>
              </div>
              <div className={`font-bold text-black ${
                small ? "text-xs xs:text-sm mt-0.5 xs:mt-1" : "text-lg sm:text-xl lg:text-2xl mt-1 sm:mt-2"
              }`}>
                ${Number(cuotasPorMes).toLocaleString('es-AR')}<sup className={`align-super ${
                  small ? "text-xxs xs:text-xs" : "text-xs sm:text-sm"
                }`}>00</sup>
              </div>
            </div>
          </div>
          
          {/* Información de financiación detallada */}
          <div className={`px-2 xs:px-3 space-y-0.5 ${
            small ? "mt-1 xs:mt-2 text-xxs xs:text-xs" : "mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm"
          }`}>
            <div className="text-right space-y-0.5">
              <div className="break-words"><span className="font-bold">PRECIO TOTAL FINANCIADO:</span> ${Number(precioBase).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div><span className="font-bold">TASA EFECTIVA ANUAL:</span> 0,00%</div>
              <div><span className="font-bold">TASA NOMINAL ANUAL:</span> 0,00%</div>
              <div><span className="font-bold">COSTO FINANCIERO TOTAL (CFT):</span> 0,00%</div>
            </div>
            <div className="text-right mt-1">
              <div className={`font-bold text-black ${
                small ? "text-xs xs:text-sm" : "text-base sm:text-lg lg:text-xl"
              }`}>CFT: 0,00%</div>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className={`flex flex-col xs:flex-row justify-between px-2 xs:px-3 font-bold gap-1 xs:gap-0 ${
            small ? "text-xxs xs:text-xs mt-1 xs:mt-2" : "text-xs sm:text-sm mt-2 sm:mt-3"
          }`}>
            <div className="truncate">{fechasDesde || "15/05/2025"}-{fechasHasta || "18/05/2025"}</div>
            <div className="truncate">SAP-TEC-{sap || "001"}</div>
            <div className="truncate">ORIGEN: {origen || "ARG"}</div>
          </div>
          
          {/* Pie de página */}
          <div className={`text-center text-gray-700 px-2 leading-tight ${
            small ? "text-xxs xs:text-xs mt-1 mb-1 xs:mb-2" : "text-xs sm:text-sm mt-2 mb-2 sm:mb-3"
          }`}>
            <div className="break-words">PRECIO SIN IMPUESTOS NACIONALES: ${Number(precioSinImpuestos || "1078999.99").toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="break-words">NO ACUMULABLE CON OTRAS PROMOCIONES Y/O DESCUENTOS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ladrillazos18; 




