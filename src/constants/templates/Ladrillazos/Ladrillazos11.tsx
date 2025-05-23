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

const Ladrillazos11: React.FC<MockupProps> = ({
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
          {/* Encabezado LADRILLAZOS */}
          <div className="bg-black text-white text-xl font-bold text-center py-3">
            LADRILLAZOS
          </div>
          
          {/* Tipo de promoción */}
          <div className="bg-gray-200 text-black text-sm font-bold text-center py-1">
            COMBO DTO
          </div>
          
          {/* Descripción del producto */}
          <div className="text-center text-lg font-bold mt-3 px-2 leading-tight">
            {nombre || "Producto de ejemplo"}
          </div>
          
          {/* Precio unitario */}
          <div className="text-center mt-4">
            <div className="font-bold text-sm">PRECIO UNITARIO</div>
            <div className="text-xl font-bold">
              ${precioActual || "999"}<sup className="text-sm align-super">00</sup>
            </div>
          </div>
          
          {/* Combo principal */}
          <div className="bg-yellow-300 text-black text-center py-4 mt-3">
            <div className="text-2xl font-extrabold">
              LLEVANDO 2 x 
            </div>
            <div className="text-3xl font-extrabold">
              ${Math.round((Number(precioActual) || 999) * 0.8)}
              <sup className="text-lg align-super">00</sup>
            </div>
          </div>
          
          {/* Porcentaje de descuento */}
          <div className="bg-red-600 text-white text-xl font-bold text-center py-2">
            {porcentaje || "20"}% DE DESCUENTO
          </div>
          
          {/* Información adicional */}
          <div className="text-xs text-center mt-3 px-2 space-y-1">
            <div>
              <span className="font-bold">SAP:</span> {sap || "SKU123"}
            </div>
            <div>
              <span className="font-bold">Válido:</span> {fechasDesde || "15/05/2025"} - {fechasHasta || "18/05/2025"}
            </div>
            <div>
              <span className="font-bold">Origen:</span> {origen || "ARG"}
            </div>
            {precioSinImpuestos && (
              <div className="text-gray-600">
                Sin imp. nac.: ${precioSinImpuestos}
              </div>
            )}
          </div>
          
          {/* Financiación */}
          {financiacion && financiacion.length > 0 && (
            <div className="bg-blue-50 p-2 mt-2 text-xs text-center">
              <div className="font-bold">FINANCIACIÓN</div>
              <div>{financiacion[0]?.cardName}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ladrillazos11; 