import React from "react";

interface MockupProps {
  small?: boolean;
  nombre?: string;
  precioAnterior?: string;
  precioActual?: string;
  porcentaje?: string;
  sap?: string;
  fechasDesde?: string;
  fechasHasta?: string;
  origen?: string;
}

const Ladrillazos2: React.FC<MockupProps> = ({
  small,
  nombre,
  precioAnterior,
  precioActual,
  porcentaje,
  sap,
  fechasDesde,
  fechasHasta,
  origen,
}) => {
  return (
    <div className={`relative ${small ? "w-[300px] h-[200px]" : "w-[400px] h-[300px]"} bg-red-600 rounded-lg p-4 flex flex-col justify-between`}>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/ladrillazos-bg.jpg')] bg-cover opacity-20 rounded-lg" />
      
      <div className="relative z-10">
        <div className="text-white font-bold text-2xl mb-2">LADRILLAZOS</div>
        <div className="text-white font-medium text-lg">{nombre || "Producto"}</div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-white text-red-600 font-bold text-lg px-3 py-1 rounded-full mb-2">
          ANTES ${precioAnterior || "0"}
        </div>
        <div className="bg-yellow-400 text-black font-bold text-3xl px-4 py-2 rounded-md">
          AHORA ${precioActual || "0"}
        </div>
        {porcentaje && (
          <div className="absolute -right-2 -top-10 bg-yellow-400 text-black font-bold text-xl p-2 rounded-full transform rotate-12">
            {porcentaje}% OFF
          </div>
        )}
      </div>
      
      <div className="relative z-10 text-white text-xs">
        <div>SAP: {sap || "000000"}</div>
        <div>Válido: {fechasDesde || "00/00"} al {fechasHasta || "00/00"}</div>
        <div>{origen || "Origen: Argentina"}</div>
      </div>
    </div>
  );
};

export default Ladrillazos2;
