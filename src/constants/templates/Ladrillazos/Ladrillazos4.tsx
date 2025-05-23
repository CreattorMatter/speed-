import React from "react";

interface MockupProps {
  small?: boolean;
  categoria?: string;
  porcentaje?: string;
  condiciones?: string;
  fechasDesde?: string;
  fechasHasta?: string;
  origen?: string;
}

const Ladrillazos4: React.FC<MockupProps> = ({
  small,
  categoria,
  porcentaje,
  condiciones,
  fechasDesde,
  fechasHasta,
  origen,
}) => {
  return (
    <div className={`relative ${small ? "w-[300px] h-[200px]" : "w-[400px] h-[300px]"} bg-red-600 rounded-lg p-4 flex flex-col justify-between`}>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/ladrillazos-bg.jpg')] bg-cover opacity-20 rounded-lg" />
      
      <div className="relative z-10">
        <div className="text-white font-bold text-2xl mb-2">LADRILLAZOS</div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-white text-red-600 font-bold text-xl px-3 py-1 rounded-md mb-2">
          {categoria || "CATEGORÍA"}
        </div>
        <div className="bg-yellow-400 text-black font-bold text-4xl px-4 py-3 rounded-md">
          {porcentaje || "20"}% OFF
        </div>
        {condiciones && (
          <div className="mt-2 text-white text-center font-medium">
            {condiciones}
          </div>
        )}
      </div>
      
      <div className="relative z-10 text-white text-xs">
        <div>Válido: {fechasDesde || "00/00"} al {fechasHasta || "00/00"}</div>
        <div>{origen || "Origen: Argentina"}</div>
      </div>
    </div>
  );
};

export default Ladrillazos4;


