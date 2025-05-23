// Plantilla 16: Promociones Especiales
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

const Ladrillazos16: React.FC<MockupProps> = ({
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
          small ? "scale-[0.6] max-w-[400px]" : "scale-100 max-w-[600px]"
        } w-full`}
      >
        <div className="border-2 border-black font-sans w-full bg-white">
          {/* Header con imagen de ladrillo LADRILLAZOS */}
          <div 
            className="text-white text-xl font-bold text-center py-3 relative"
            style={{
              backgroundImage: "url('/images/templates/ladrillazo-header.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
            <div className="relative z-10">LADRILLAZOS</div>
          </div>
          
          {/* Promoción 2da unidad prominente */}
          <div className="bg-yellow-400 text-black text-lg font-extrabold text-center py-3">
            {porcentaje || "50"}% DESC. EN LA 2DA UNIDAD
          </div>
          
          {/* Descripción del producto */}
          <div className="text-center text-lg font-bold mt-4 px-2 leading-tight text-gray-600">
            {nombre || "DESCRIPCIÓN PRODUCTO"}
          </div>
          
          {/* Precio unitario */}
          <div className="text-center mt-6">
            <div className="font-bold text-sm text-black">PRECIO 1RA UNIDAD</div>
            <div className="text-5xl font-extrabold text-black mt-2">
              ${precioActual || "000"}
            </div>
          </div>
          
          {/* Precio segunda unidad */}
          <div className="text-center mt-4">
            <div className="font-bold text-sm text-black">PRECIO 2DA UNIDAD</div>
            <div className="text-3xl font-extrabold text-red-600 mt-1">
              ${Math.round((Number(precioActual) || 999) * (1 - (Number(porcentaje) || 50) / 100))}
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

export default Ladrillazos16; 


