import React from "react";

// Definimos la interfaz para las opciones de financiación
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

const Ladrillazos1: React.FC<MockupProps> = ({
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
          <div className="bg-yellow-300 text-black text-xl font-bold text-center py-2">
            {porcentaje}% DESCUENTO
          </div>
          
          {/* Descripción del producto */}
          <div className="text-center text-base font-bold mt-2 px-2 leading-tight">
            DESCRIPCIÓN PRODUCTO
          </div>
          
          {/* Información de precio */}
          <div className="flex justify-between items-center mt-2 px-3">
            <div className="text-left">
              <div className="font-bold text-sm">AHORA</div>
              <div className="text-2xl font-extrabold mt-1">
                ${precioActual}<sup className="text-sm align-super ml-1">00</sup>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-sm">ANTES</div>
              <div className="text-lg text-gray-800">
                <s>${Number(precioActual) * (1 + Number(porcentaje) / 100)}</s>
              </div>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="flex justify-between px-3 text-xs font-bold mt-4">
            <div>{fechasDesde} - {fechasHasta}</div>
            <div>SAP: {sap}</div>
            <div>ORIGEN: {origen}</div>
          </div>
          
          {/* Pie de página */}
          <div className="text-center text-[10px] text-gray-700 mt-2 mb-2 px-2 leading-tight">
            PRECIO SIN IMPUESTOS NACIONALES: ${precioSinImpuestos}<br />
            NO ACUMULABLE CON OTRAS PROMOCIONES
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ladrillazos1;
