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

const FeriaDescuento2: React.FC<MockupProps> = ({
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
          
          {/* Porcentaje de descuento - Estilo grande */}
          <div className="bg-yellow-300 py-4">
            <div className="text-center">
              <span className="text-6xl font-black">{porcentaje}</span>
              <span className="text-3xl font-bold">%</span>
            </div>
            <div className="text-center text-2xl font-bold">
              DESCUENTO
            </div>
          </div>
          
          {/* Descripciu00f3n de categoru00eda */}
          <div className="text-center text-xl font-bold mt-4 px-2 leading-tight">
            DESCRIPCIu00d3N CATEGORu00cdA
          </div>
          
          {/* Informaciu00f3n adicional */}
          <div className="flex justify-between px-3 text-xs font-bold mt-6">
            <div>{fechasDesde} - {fechasHasta}</div>
            <div>SAP: {sap}</div>
            <div>ORIGEN: {origen}</div>
          </div>
          
          {/* Pie de pu00e1gina */}
          <div className="text-center text-[10px] text-gray-700 mt-2 mb-2 px-2 leading-tight">
            DESCUENTO APLICA CATEGORu00cdA
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeriaDescuento2;
