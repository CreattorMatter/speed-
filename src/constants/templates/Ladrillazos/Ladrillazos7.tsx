import React from "react";

interface MockupProps {
  small?: boolean;
  nombre?: string;
  precioActual?: string;
  porcentaje?: string;
  sap?: string;
  fechasDesde?: string;
  fechasHasta?: string;
  origen?: string;
}

const Ladrillazos7: React.FC<MockupProps> = ({
  small,
  nombre,
  precioActual,
  porcentaje,
  sap,
  fechasDesde,
  fechasHasta,
  origen,
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
          
          {/* Producto */}
          <div className="text-center text-lg font-bold mt-2 px-2">
            {nombre || "Producto de ejemplo"}
          </div>
          
          {/* Precios horizontales */}
          <div className="flex justify-between items-center mt-4 px-4">
            <div className="text-center">
              <div className="font-bold text-sm">ANTES</div>
              <div className="text-lg font-bold line-through text-gray-500">
                ${Math.round((Number(precioActual) || 999) * 1.25)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-sm text-red-600">AHORA</div>
              <div className="text-3xl font-extrabold text-red-600">
                ${precioActual || "999"}
              </div>
            </div>
          </div>
          
          {/* Descuento */}
          <div className="bg-yellow-300 text-black text-xl font-bold text-center py-2 mt-3">
            {porcentaje || "20"}% OFF
          </div>
          
          {/* Info */}
          <div className="text-xs text-center mt-2 px-2">
            <div>SAP: {sap || "SKU123"}</div>
            <div>{fechasDesde || "15/05"} - {fechasHasta || "18/05"}</div>
            <div>{origen || "ARG"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ladrillazos7; 


