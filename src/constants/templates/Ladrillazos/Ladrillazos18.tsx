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
          small ? "scale-[0.65] max-w-[450px]" : "scale-100 max-w-[800px]"
        } w-full`}
      >
        <div className={`border-2 border-black font-sans w-full bg-white ${
          small ? "min-w-[400px] max-h-[500px]" : "min-w-[650px] max-h-[750px]"
        } overflow-hidden`}>
          {/* Header con imagen de ladrillo LADRILLAZOS - SIN texto superpuesto */}
          <div 
            className={`relative ${
              small ? "min-h-[80px]" : "min-h-[140px]"
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
          <div className={`text-center font-bold px-3 leading-tight text-gray-700 ${
            small ? "text-sm mt-2" : "text-lg mt-3"
          }`}>
            {nombre || "MacBook Pro M3 Pro 14\""}
          </div>
          
          {/* Logo de financiación dinámico */}
          <div className={`flex justify-end px-3 ${small ? "mt-1" : "mt-2"}`}>
            <div className={`bg-blue-600 text-white rounded font-bold flex items-center gap-1 ${
              small ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
            }`}>
              <img 
                src={getBankLogoUrl(financiacionActiva?.bank || 'visa')} 
                alt="Bank Logo" 
                className={small ? "h-3 w-auto" : "h-4 w-auto"}
                onError={(e) => {
                  // Fallback si no se puede cargar la imagen
                  e.currentTarget.style.display = 'none';
                }}
              />
              {getBankText(financiacionActiva?.bank || 'visa')}
            </div>
          </div>
          
          {/* Layout principal responsive */}
          <div className={`flex items-center justify-between px-4 ${
            small ? "mt-2" : "mt-4"
          }`}>
            {/* Columna izquierda: AHORA y ANTES */}
            <div className={`text-center flex-shrink-0 ${
              small ? "w-20" : "w-32"
            }`}>
              {/* AHORA */}
              <div className={small ? "mb-2" : "mb-4"}>
                <div className={`font-bold text-black ${
                  small ? "text-sm" : "text-lg"
                }`}>AHORA</div>
                <div className={`font-bold text-black ${
                  small ? "text-3xl mt-1" : "text-6xl mt-2"
                }`}>$</div>
                <div className={`font-bold text-black ${
                  small ? "text-xs mt-1" : "text-sm mt-2"
                }`}>PRECIO</div>
                <div className={`font-bold text-black ${
                  small ? "text-xs" : "text-sm"
                }`}>CONTADO</div>
              </div>
              
              {/* ANTES */}
              <div className="text-center">
                <div className={`font-bold text-black ${
                  small ? "text-sm" : "text-lg"
                }`}>ANTES</div>
                <div className={`font-bold text-black line-through ${
                  small ? "text-sm mt-1" : "text-xl mt-2"
                }`}>
                  ${Number(precioAntes).toLocaleString('es-AR')}
                </div>
              </div>
            </div>
            
            {/* Columna central: Precio principal */}
            <div className={`text-center flex-1 ${
              small ? "mx-2" : "mx-6"
            }`}>
              <div className={`font-bold text-gray-500 leading-none ${
                small ? "text-2xl" : "text-6xl"
              }`}>
                {Number(precioBase).toLocaleString('es-AR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </div>
            </div>
            
            {/* Columna derecha: Cuotas */}
            <div className={`text-right flex-shrink-0 ${
              small ? "w-24" : "w-40"
            }`}>
              <div className={`font-bold text-black leading-tight ${
                small ? "text-xs" : "text-sm"
              }`}>
                {cuotasTexto}
              </div>
              <div className={`font-bold text-black ${
                small ? "text-sm mt-1" : "text-2xl mt-2"
              }`}>
                ${Number(cuotasPorMes).toLocaleString('es-AR')}<sup className={`align-super ${
                  small ? "text-xs" : "text-sm"
                }`}>00</sup>
              </div>
            </div>
          </div>
          
          {/* Información de financiación detallada */}
          <div className={`px-3 space-y-0.5 ${
            small ? "mt-2 text-xs" : "mt-4 text-sm"
          }`}>
            <div className="text-right">
              <div><span className="font-bold">PRECIO TOTAL FINANCIADO:</span> ${Number(precioBase).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div><span className="font-bold">TASA EFECTIVA ANUAL:</span> 0,00%</div>
              <div><span className="font-bold">TASA NOMINAL ANUAL:</span> 0,00%</div>
              <div><span className="font-bold">COSTO FINANCIERO TOTAL (CFT):</span> 0,00%</div>
            </div>
            <div className="text-right mt-1">
              <div className={`font-bold text-black ${
                small ? "text-sm" : "text-xl"
              }`}>CFT: 0,00%</div>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className={`flex justify-between px-3 font-bold ${
            small ? "text-xs mt-2" : "text-sm mt-3"
          }`}>
            <div>{fechasDesde || "15/05/2025"}-{fechasHasta || "18/05/2025"}</div>
            <div>SAP-TEC-{sap || "001"}</div>
            <div>ORIGEN: {origen || "ARG"}</div>
          </div>
          
          {/* Pie de página */}
          <div className={`text-center text-gray-700 px-2 leading-tight ${
            small ? "text-xs mt-1 mb-2" : "text-sm mt-2 mb-3"
          }`}>
            PRECIO SIN IMPUESTOS NACIONALES: ${Number(precioSinImpuestos || "1078999.99").toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
            NO ACUMULABLE CON OTRAS PROMOCIONES Y/O DESCUENTOS
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ladrillazos18; 




