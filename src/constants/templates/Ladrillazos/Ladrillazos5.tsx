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

const Ladrillazos5: React.FC<MockupProps> = ({
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
            ANTES/AHORA con DTO
          </div>
          
          {/* Porcentaje de descuento prominente */}
          <div className="bg-yellow-300 text-black text-2xl font-bold text-center py-3">
            {porcentaje || "20"}% DE DESCUENTO
          </div>
          
          {/* Descripción del producto */}
          <div className="text-center text-base font-bold mt-3 px-2 leading-tight">
            {nombre || "Producto de ejemplo"}
          </div>
          
          {/* Precios lado a lado */}
          <div className="flex justify-center items-center mt-4 px-3 gap-8">
            <div className="text-center">
              <div className="font-bold text-sm text-gray-600">ANTES</div>
              <div className="text-xl font-bold text-gray-500 line-through">
                ${Math.round((Number(precioActual) || 999) * (1 + (Number(porcentaje) || 20) / 100))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-sm text-red-600">AHORA</div>
              <div className="text-3xl font-extrabold text-red-600">
                ${precioActual || "999"}<sup className="text-lg align-super ml-1">00</sup>
              </div>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="text-xs text-center mt-4 px-2 space-y-1">
            <div>
              <span className="font-bold">Válido:</span> {fechasDesde || "15/05/2025"} al {fechasHasta || "18/05/2025"}
            </div>
            <div>
              <span className="font-bold">SAP:</span> {sap || "SKU123"} | 
              <span className="font-bold"> Origen:</span> {origen || "ARG"}
            </div>
            {precioSinImpuestos && (
              <div className="text-gray-600">
                Precio sin impuestos nacionales: ${precioSinImpuestos}
              </div>
            )}
          </div>
          
          {/* Financiación */}
          {financiacion && financiacion.length > 0 && (
            <div className="bg-blue-50 p-2 mt-2 text-xs">
              <div className="font-bold text-center mb-1">FINANCIACIÓN DISPONIBLE</div>
              {financiacion.slice(0, 2).map((f, index) => (
                <div key={index} className="text-center">
                  {f.cardName} - {f.plan}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ladrillazos5; 