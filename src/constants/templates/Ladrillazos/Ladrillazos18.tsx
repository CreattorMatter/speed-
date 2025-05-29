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
  
  // Procesar todas las financiaciones disponibles
  const financiacionesValidas = financiacion && financiacion.length > 0 ? financiacion : [];
  
  // Obtener bancos únicos para mostrar todos los logos
  const bancosUnicos = [...new Set(financiacionesValidas.map(fin => fin.bank))];
  
  // Crear array de todas las opciones de cuotas
  const opcionesCuotas = financiacionesValidas.map(fin => {
    const cuotas = parseInt(fin.plan.split(' ')[0]) || 6;
    const cuotasPorMes = Math.round((Number(precioBase) || 0) / cuotas);
    return {
      cuotas,
      cuotasPorMes,
      texto: fin.plan || `${cuotas} CUOTAS SIN INTERÉS`,
      bank: fin.bank
    };
  });

  // Deduplicar opciones de cuotas idénticas (mismo número de cuotas Y mismo monto)
  const opcionesUnicas = opcionesCuotas.reduce((acc, current) => {
    const existe = acc.find(item => 
      item.cuotas === current.cuotas && 
      item.cuotasPorMes === current.cuotasPorMes
    );
    if (!existe) {
      acc.push(current);
    }
    return acc;
  }, [] as typeof opcionesCuotas).sort((a, b) => a.cuotas - b.cuotas); // Ordenar de menor a mayor número de cuotas
  
  // Si no hay financiaciones, usar valores por defecto
  const opcionesFinal = opcionesUnicas.length > 0 ? opcionesUnicas : [{
    cuotas: 6,
    cuotasPorMes: Math.round((Number(precioBase) || 0) / 6) || 216667,
    texto: "6 CUOTAS SIN INTERÉS",
    bank: "visa"
  }];

  // Obtener icono real de la financiación
  const getBankLogo = (bank: string) => {
    const bankName = bank?.toLowerCase();
    if (bankName?.includes('cencosud')) {
      return '/images/banks/cencosud.png';
    } else if (bankName?.includes('cencopay')) {
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
    } else if (bankName?.includes('cencosud')) {
      return 'CENCOSUD';
    } else if (bankName?.includes('cencopay')) {
      return 'CENCOPAY';
    }
    return 'VISA CRÉDITO';
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div
        className={`transition-transform duration-300 ease-in-out w-full ${
          small ? "scale-[0.65] max-w-[95vw] sm:max-w-[450px]" : "scale-100 max-w-[90vw] sm:max-w-[700px] lg:max-w-[800px]"
        }`}
      >
        <div className={`border-2 border-black font-sans w-full bg-white overflow-hidden ${
          small ? "max-h-[85vh] sm:max-h-[500px]" : "max-h-[90vh] sm:max-h-[700px] lg:max-h-[750px]"
        }`}>
          {/* Header con imagen de ladrillo LADRILLAZOS - SIN texto superpuesto */}
          <div 
            className={`relative w-full ${
              small ? "h-[50px] xs:h-[60px] sm:h-[80px]" : "h-[80px] sm:h-[100px] lg:h-[120px]"
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
            small ? "text-xs xs:text-sm mt-1 xs:mt-2" : "text-sm sm:text-base lg:text-lg mt-2 sm:mt-3"
          }`}>
            <span className="break-words">{nombre || "MacBook Pro M3 Pro 14\""}</span>
          </div>
          
          {/* Logos de financiación dinámicos - TODOS los bancos únicos seleccionados */}
          <div className={`flex justify-end gap-1 px-2 xs:px-3 ${small ? "mt-1" : "mt-1 sm:mt-2"}`}>
            {bancosUnicos.map((bank, index) => (
              <div key={`${bank}-${index}`} className={` flex items-center justify-center ${
                small ? "px-1.5 xs:px-2 py-0.5 xs:py-1" : "px-2 sm:px-3 py-1 sm:py-2"
              }`}>
                <img 
                  src={getBankLogoUrl(bank)} 
                  alt={`Logo ${bank}`} 
                  className={small ? "h-3 xs:h-4 w-auto" : "h-4 sm:h-5 w-auto"}
                  onError={(e) => {
                    // Fallback si no se puede cargar la imagen
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
            {/* Si no hay financiaciones, mostrar logo por defecto */}
            {bancosUnicos.length === 0 && (
              <div className={`bg-blue-600 rounded font-bold flex items-center justify-center ${
                small ? "px-1.5 xs:px-2 py-0.5 xs:py-1" : "px-2 sm:px-3 py-1 sm:py-2"
              }`}>
                <img 
                  src={getBankLogoUrl('visa')} 
                  alt="Logo financiación" 
                  className={small ? "h-3 xs:h-4 w-auto" : "h-4 sm:h-5 w-auto"}
                />
              </div>
            )}
          </div>
          
          {/* Layout principal responsive */}
          <div className={`flex items-center justify-between px-2 xs:px-3 sm:px-4 ${
            small ? "mt-1 xs:mt-2" : "mt-2 sm:mt-3 lg:mt-4"
          }`}>
            {/* Columna izquierda: AHORA y ANTES */}
            <div className={`text-center flex-shrink-0 ${
              small ? "w-12 xs:w-14 sm:w-16" : "w-20 sm:w-24 lg:w-28"
            }`}>
              {/* AHORA */}
              <div className={small ? "mb-1 xs:mb-2" : "mb-2 sm:mb-3 lg:mb-4"}>
                <div className={`font-bold text-black ${
                  small ? "text-xxs xs:text-xs" : "text-xs sm:text-sm lg:text-base"
                }`}>AHORA</div>
                <div className={`font-bold text-black ${
                  small ? "text-lg xs:text-xl sm:text-2xl mt-0.5 xs:mt-1" : "text-2xl sm:text-3xl lg:text-4xl mt-1 sm:mt-2"
                }`}>$</div>
                <div className={`font-bold text-black leading-tight ${
                  small ? "text-xxs xs:text-xs mt-0.5 xs:mt-1" : "text-xs sm:text-sm mt-1 sm:mt-2"
                }`}>
                  <div>PRECIO</div>
                  <div>CONTADO</div>
                </div>
              </div>
              
              {/* ANTES */}
              <div className="text-center">
                <div className={`font-bold text-black ${
                  small ? "text-xxs xs:text-xs" : "text-xs sm:text-sm lg:text-base"
                }`}>ANTES</div>
                <div className={`font-bold text-black line-through ${
                  small ? "text-xs xs:text-sm mt-0.5 xs:mt-1" : "text-sm sm:text-base lg:text-lg mt-1 sm:mt-2"
                }`}>
                  ${Number(precioAntes).toLocaleString('es-AR')}
                </div>
              </div>
            </div>
            
            {/* Columna central: Precio principal */}
            <div className={`text-center flex-1 ${
              small ? "mx-1 xs:mx-2" : "mx-2 sm:mx-3 lg:mx-4"
            }`}>
              <div className={`font-bold text-gray-500 leading-none ${
                small ? "text-base xs:text-lg sm:text-xl" : "text-xl sm:text-2xl lg:text-4xl"
              }`}>
                <span className="break-all">
                  {Number(precioBase).toLocaleString('es-AR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
            </div>
            
            {/* Columna derecha: TODAS las opciones de cuotas ordenadas */}
            <div className={`text-right flex-shrink-0 ${
              small ? "w-20 xs:w-22 sm:w-24" : "w-28 sm:w-32 lg:w-36"
            }`}>
              {opcionesFinal.map((opcion, index) => (
                <div key={`cuota-${opcion.cuotas}-${index}`} className={`${index > 0 ? 'mt-2' : ''}`}>
                  <div className={`font-bold text-black leading-tight ${
                    small ? "text-xxs xs:text-xs" : "text-xs sm:text-sm"
                  }`}>
                    <span className="break-words">{opcion.texto}</span>
                  </div>
                  <div className={`font-bold text-black ${
                    small ? "text-xs xs:text-sm mt-0.5 xs:mt-1" : "text-sm sm:text-base lg:text-lg mt-1 sm:mt-2"
                  }`}>
                    ${Number(opcion.cuotasPorMes).toLocaleString('es-AR')}<sup className={`align-super ${
                      small ? "text-xxs xs:text-xs" : "text-xs sm:text-sm"
                    }`}>00</sup>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Información de financiación detallada */}
          <div className={`px-2 xs:px-3 space-y-0.5 ${
            small ? "mt-1 xs:mt-2 text-xxs xs:text-xs" : "mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm"
          }`}>
            <div className="text-right space-y-0.5">
              <div className="break-words"><span className="font-bold">PRECIO TOTAL FINANCIADO:</span> ${Number(precioBase).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="break-words"><span className="font-bold">TASA EFECTIVA ANUAL:</span> 0,00%</div>
              <div className="break-words"><span className="font-bold">TASA NOMINAL ANUAL:</span> 0,00%</div>
              <div className="break-words"><span className="font-bold">COSTO FINANCIERO TOTAL (CFT):</span> 0,00%</div>
            </div>
            <div className="text-right mt-1">
              <div className={`font-bold text-black ${
                small ? "text-xs xs:text-sm" : "text-sm sm:text-base lg:text-lg"
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