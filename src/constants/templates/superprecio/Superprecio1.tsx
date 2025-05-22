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

const Superprecio1: React.FC<MockupProps> = ({
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
          <div className="bg-red-600 text-yellow-300 text-2xl font-bold text-center py-2">
            descuentos
          </div>
          <div className="bg-yellow-300 text-black text-lg font-bold text-center py-2">
            {porcentaje}% DE DESCUENTO
          </div>
          <div className="text-center text-base font-bold mt-2 px-2 leading-tight">
            {nombre}
          </div>
          <div className="flex justify-between text-sm mt-2 px-3">
            <div className="text-left leading-tight">
              <div className="font-bold">AHORA</div>
              <div className="text-xs">PRECIO CON DESCUENTO</div>
              <div className="mt-2 font-bold text-sm">ANTES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold">
                ${precioActual}<sup className="text-sm align-super ml-1">00</sup>
              </div>
              <div className="text-base text-gray-800">
                <s>${Number(precioActual) * (1 - Number(porcentaje) / 100)}</s>
              </div>
            </div>
            <div className="text-right text-xs leading-tight">
              {financiacion && financiacion.length > 0 ? (
                <>
                  <div className="font-bold text-xs">
                    {/* Extraer el nu00famero de cuotas del plan (ej: '3 cuotas sin interu00e9s' -> 3) */}
                    HASTA {Math.max(...financiacion.map(f => parseInt(f.plan.split(' ')[0])))} CUOTAS
                  </div>
                  <div className="text-xs">SIN INTERÉS</div>
                  <div className="mt-1 flex justify-end gap-1 flex-wrap">
                    {/* Filtrar tarjetas u00fanicas por cardImage */}
                    {[...new Map(financiacion.map(item => [item.cardImage, item])).values()].map((opcion, index) => (
                      <img
                        key={index}
                        src={opcion.cardImage}
                        alt={opcion.cardName}
                        className="w-6 h-4 mb-1"
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div>3 CUOTAS FIJAS</div>
                  <div className="font-bold">SIN INTERÉS</div>
                  <div>TARJETAS BANCARIAS</div>
                  <div className="mt-1 flex justify-end gap-1 flex-wrap">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                      alt="Visa"
                      className="w-6 h-4"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                      alt="Mastercard"
                      className="w-6 h-4"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between px-3 text-xs font-bold mt-2">
            <div>{fechasDesde} - {fechasHasta}</div>
            <div>SAP:{sap}</div>
            <div>ORIGEN: {origen}</div>
          </div>
          <div className="text-center text-[10px] text-gray-700 mt-1 mb-2 px-2 leading-tight">
            PRECIO SIN IMPUESTOS NACIONALES: ${precioSinImpuestos}<br />
            NO ACUMULABLE CON OTRAS PROMOCIONES
          </div>
        </div>
      </div>
    </div>
  );
};

export default Superprecio1;
