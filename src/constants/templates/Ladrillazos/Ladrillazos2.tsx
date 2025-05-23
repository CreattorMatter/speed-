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

const Ladrillazos2: React.FC<MockupProps> = ({
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
          
          {/* Caja naranja con descripción producto */}
          <div className="bg-red-500 text-white text-lg font-bold text-center py-2 mx-4 mt-4">
            {nombre || "DESCRIPCIÓN PRODUCTO"}
          </div>
          
          {/* Precio principal con elementos destacados */}
          <div className="flex items-start justify-center mt-6 px-4">
            <div className="flex items-start">
              <div className="text-4xl font-bold text-black mr-4">$</div>
              <div className="text-6xl font-bold leading-none">
                <span className="text-red-500">{precioActual?.slice(0, 3) || "000"}</span>
                <span className="text-yellow-400 text-3xl align-super">00</span>
              </div>
              <div className="text-xl font-bold text-black ml-4 mt-6">
                ${precioActual || "000"}
              </div>
            </div>
          </div>
          
          {/* Etiquetas de precio */}
          <div className="flex justify-between px-8 mt-4">
            <div className="text-center">
              <div className="text-sm font-bold text-black">PRECIO REGULAR</div>
              <div className="text-sm font-bold text-black">X METRO²</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-black">PRECIO REGULAR POR CAJA</div>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="flex justify-between px-3 text-xs font-bold mt-6">
            <div>{fechasDesde || "23/05/2025"}-{fechasHasta || "23/05/2025"}</div>
            <div className="bg-red-500 text-white px-2 py-1">SAP:{sap || "00000000"}</div>
            <div className="bg-red-500 text-white px-2 py-1">ORIGEN: {origen || "XXXXXXX"}</div>
          </div>
          
          {/* Pie de página */}
          <div className="text-center text-xs text-gray-700 mt-2 mb-2 px-2 leading-tight">
            PRECIO SIN IMPUESTOS NACIONALES: <span className="bg-red-500 text-white px-1">${precioSinImpuestos || "0000,00"}</span><br />
            NO ACUMULABLE CON OTRAS PROMOCIONES Y/O DESCUENTOS
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ladrillazos2;


