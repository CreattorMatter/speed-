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
  precioCombo?: string;
  cantidadCombo?: number;
  porcentaje?: string;
  sap?: string;
  fechasDesde?: string;
  fechasHasta?: string;
  origen?: string;
  precioSinImpuestos?: string;
  financiacion?: FinancingOption[];
}

const Ladrillazos3: React.FC<MockupProps> = ({
  small,
  nombre,
  precioActual,
  precioCombo, // eslint-disable-line @typescript-eslint/no-unused-vars
  cantidadCombo = 2, // eslint-disable-line @typescript-eslint/no-unused-vars
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
        <div className="border-2 border-black font-sans w-full bg-white min-w-[500px]">
          {/* Header con imagen de ladrillo LADRILLAZOS */}
          <div 
            className="text-white text-xl font-bold text-center py-8 relative min-h-[100px]"
            style={{
              backgroundImage: "url('/images/templates/ladrillazo-header.jpg?v=3')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
          </div>
          
          {/* COMBO prominente */}
          <div className="text-center mt-6">
            <div className="text-6xl font-extrabold text-black leading-none">
              COMBO
            </div>
          </div>
          
          {/* Descripción del producto */}
          <div className="text-center text-lg font-bold mt-4 px-2 leading-tight text-gray-600">
            {nombre || "DESCRIPCIÓN PRODUCTO"}
          </div>
          
          {/* Precio principal */}
          <div className="flex items-start justify-center mt-6 px-4">
            <div className="flex items-start flex-wrap justify-center">
              <div className="text-4xl font-bold text-black mr-2">$</div>
              <div className="text-5xl font-bold text-gray-500 leading-none break-all">
                {precioActual || "999999.99"}
              </div>
            </div>
          </div>
          
          {/* Etiqueta PRECIO COMBO */}
          <div className="text-center mt-2">
            <div className="text-sm font-bold text-black">
              PRECIO COMBO
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

export default Ladrillazos3;




