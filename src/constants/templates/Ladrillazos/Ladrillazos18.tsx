// Plantilla 18: Promociones Especiales
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
          
          {/* Porcentaje de descuento */}
          <div className="bg-yellow-300 text-black text-xl font-bold text-center py-2">
            {porcentaje || "20"}% DE DESCUENTO
          </div>
          
          {/* Descripción del producto */}
          <div className="text-center text-lg font-bold mt-3 px-2 leading-tight text-gray-600">
            {nombre || "DESCRIPCIÓN PRODUCTO"}
          </div>
          
          {/* Logo Cencopay */}
          <div className="flex justify-end px-4 mt-2">
            <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
              cencopay CRÉDITO
            </div>
          </div>
          
          {/* Precios AHORA y ANTES */}
          <div className="flex justify-between items-center mt-4 px-8">
            <div className="text-center">
              <div className="font-bold text-sm text-black">AHORA</div>
              <div className="font-bold text-sm text-black">PRECIO</div>
              <div className="font-bold text-sm text-black">CON DESCUENTO</div>
              <div className="text-3xl font-extrabold text-black mt-2">
                ${precioActual || "000"}
              </div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-sm text-black">ANTES</div>
              <div className="text-xl font-bold text-black line-through mt-4">
                ${Math.round((Number(precioActual) || 999) * (1 + (Number(porcentaje) || 20) / 100))}
              </div>
            </div>
          </div>
          
          {/* Cuotas sin intereses */}
          <div className="text-center mt-4">
            <div className="text-sm font-bold text-black">12 CUOTAS SIN INTERESES</div>
            <div className="text-2xl font-bold text-black">
              ${Math.round((Number(precioActual) || 999) / 12)}
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

export default Ladrillazos18; 