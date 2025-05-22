import React from "react";

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
}

const Ladrillazos3: React.FC<MockupProps> = ({
  small,
  nombre,
  precioActual,
  precioCombo,
  cantidadCombo = 2,
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
          UNIDAD ${precioActual || "0"}
        </div>
        <div className="bg-yellow-400 text-black font-bold text-3xl px-4 py-2 rounded-md">
          LLEVANDO {cantidadCombo} x ${precioCombo || "0"}
        </div>
        {porcentaje && (
          <div className="absolute -right-2 -top-10 bg-yellow-400 text-black font-bold text-xl p-2 rounded-full transform rotate-12">
            {porcentaje}% OFF
          </div>
        )}
      </div>
      
      <div className="relative z-10 text-white text-xs">
        <div>SAP: {sap || "000000"}</div>
        <div>Vu00e1lido: {fechasDesde || "00/00"} al {fechasHasta || "00/00"}</div>
        <div>{origen || "Origen: Argentina"}</div>
      </div>
    </div>
  );
};

export default Ladrillazos3;
