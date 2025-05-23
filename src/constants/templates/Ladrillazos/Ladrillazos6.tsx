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

const Ladrillazos6: React.FC<MockupProps> = ({
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
          small ? "scale-[0.6] max-w-[400px]" : "scale-100 max-w-[600px]"
        } w-full`}
      >
        <div className="border-2 border-black font-sans w-full bg-white">
          {/* Header con imagen de ladrillo LADRILLAZOS */}
          <div 
            className="text-white text-xl font-bold text-center py-4 relative min-h-[60px]"
            style={{
              backgroundImage: "url('/images/templates/ladrillazo-header.jpg?v=3?v=3')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
            
          </div>
          
          {/* Descripción del producto */}
          <div className="text-center text-lg font-bold mt-3 px-2 leading-tight">
            {nombre || "Producto de ejemplo"}
          </div>
          
          {/* Precio ANTES */}
          <div className="text-center mt-4">
            <div className="font-bold text-sm text-gray-600">ANTES</div>
            <div className="text-xl font-bold text-gray-500 line-through">
              ${Math.round((Number(precioActual) || 999) * (1 + (Number(porcentaje) || 20) / 100))}
            </div>
          </div>
          
          {/* Precio AHORA - Muy prominente */}
          <div className="text-center mt-2">
            <div className="font-bold text-lg text-red-600">AHORA</div>
            <div className="text-5xl font-extrabold text-red-600 leading-none">
              ${precioActual || "999"}
              <sup className="text-2xl align-super ml-1">00</sup>
            </div>
          </div>
          
          {/* Porcentaje de descuento */}
          <div className="bg-yellow-300 text-black text-xl font-bold text-center py-2 mt-3">
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
          
          {/* Financiación compacta */}
          {financiacion && financiacion.length > 0 && (
            <div className="bg-blue-100 p-1 mt-2 text-xs text-center">
              <div className="font-bold">FINANCIACIÓN</div>
              <div>{financiacion[0]?.cardName} - {financiacion[0]?.plan}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ladrillazos6; 





