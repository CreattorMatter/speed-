// Plantilla 9: Variante de ANTES/AHORA con DTO
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

const Ladrillazos9: React.FC<MockupProps> = ({
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
              backgroundImage: "url('/images/templates/ladrillazo-header.jpg?v=3')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
            
          </div>
          
          {/* Descripción del producto */}
          <div className="text-center text-lg font-bold mt-4 px-2 leading-tight text-gray-600">
            {nombre || "DESCRIPCIÓN PRODUCTO"}
          </div>
          
          {/* Precios AHORA y ANTES para flooring */}
          <div className="mt-6">
            {/* AHORA - precio por m² */}
            <div className="text-center mb-4">
              <div className="font-bold text-sm text-black mb-1">AHORA PRECIO X M²</div>
              <div className="text-4xl font-extrabold text-black">
                ${precioActual || "000"}<sup className="text-lg align-super">00</sup>
              </div>
            </div>
            
            {/* AHORA - precio por caja */}
            <div className="text-center mb-4">
              <div className="font-bold text-sm text-black mb-1">AHORA PRECIO X CAJA</div>
              <div className="text-3xl font-extrabold text-black">
                ${(Number(precioActual) || 999) * 2}
              </div>
            </div>
            
            {/* ANTES - lado derecho */}
            <div className="flex justify-end px-8">
              <div className="text-center mr-8">
                <div className="font-bold text-sm text-black mb-1">ANTES X M²</div>
                <div className="text-lg font-bold text-black line-through">
                  ${Math.round((Number(precioActual) || 999) * 1.25)}<sup className="text-sm align-super">00</sup>
                </div>
              </div>
              
              <div className="text-center">
                <div className="font-bold text-sm text-black mb-1">ANTES X CAJA</div>
                <div className="text-lg font-bold text-black line-through">
                  ${Math.round((Number(precioActual) || 999) * 2.5)}
                </div>
              </div>
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

export default Ladrillazos9; 




