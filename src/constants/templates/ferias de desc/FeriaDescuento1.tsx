import React from "react";

// Definimos la interfaz para las opciones de financiaciu00f3n
interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  cardImage: string;
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

const FeriaDescuento1: React.FC<MockupProps> = ({
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
  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div
        className={`transition-transform duration-300 ease-in-out ${
          small ? "scale-[0.6] max-w-[400px]" : "scale-100 max-w-[400px]"
        } w-full`}
      >
        <div className="border-2 border-black font-sans w-full bg-white">
          {/* Encabezado */}
          <div className="bg-red-600 text-yellow-300 text-2xl font-bold text-center py-2">
            Feria de descuentos
          </div>
          
          {/* Porcentaje de descuento */}
          <div className="bg-yellow-300 text-black text-3xl font-bold text-center py-3">
            COMBO
          </div>
          
          {/* Descripciu00f3n del producto */}
          <div className="text-center text-base font-bold mt-3 px-2 leading-tight">
            DESCRIPCIu00d3N + DESCRIPCIu00d3N
          </div>
          
          {/* Informaciu00f3n de precio */}
          <div className="flex justify-center items-center mt-4 px-3">
            <div className="text-center">
              <div className="text-3xl font-extrabold">
                ${precioActual}<sup className="text-lg align-super ml-1">00</sup>
              </div>
            </div>
          </div>
          
          {/* Informaciu00f3n adicional */}
          <div className="flex justify-between px-3 text-xs font-bold mt-4">
            <div>{fechasDesde} - {fechasHasta}</div>
            <div>SAP: {sap}</div>
            <div>ORIGEN: {origen}</div>
          </div>
          
          {/* Pie de pu00e1gina */}
          <div className="text-center text-[10px] text-gray-700 mt-2 mb-2 px-2 leading-tight">
            PRECIO SIN IMPUESTOS NACIONALES: ${precioSinImpuestos}<br />
            NO ACUMULABLE CON OTRAS PROMOCIONES
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeriaDescuento1;
