import React from "react";
import { Product } from "../../../types/product";

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
  titulo?: string;
  porcentaje?: string;
  sap?: string;
  fechasDesde?: string;
  fechasHasta?: string;
  origen?: string;
  precioSinImpuestos?: string;
  financiacion?: FinancingOption[];
  productos: Product[];
}

const MultiProductos: React.FC<MockupProps> = ({
  small = false,
  titulo = 'Ofertas Especiales',
  porcentaje = '20',
  sap = '001',
  fechasDesde = '15/05/2025',
  fechasHasta = '18/05/2025',
  origen = 'ARG',
  precioSinImpuestos = '$0.00',
  financiacion = [],
  productos = []
}) => {
  // Convertir a array si no lo es
  const productosArray = Array.isArray(productos) ? productos : [productos];
  
  // Logging para debug
  console.log('MultiProductos recibiendo productos:', productosArray);
  console.log('Cantidad de productos recibidos:', productosArray.length);
  
  // Si no hay productos, no mostrar nada
  if (productosArray.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {/* Mostrar un cartel individual para cada producto */}
      {productosArray.map((producto, index) => (
        <div 
          key={index} 
          className={`border border-gray-300 bg-white shadow-md ${
            small ? 'w-[200px] transform scale-90' : 'w-[350px]'
          }`}
        >
          {/* Encabezado del cartel */}
          <div className="bg-red-600 text-yellow-300 text-xl font-bold text-center py-2">
            {titulo}
          </div>
          
          {/* Porcentaje de descuento */}
          <div className="bg-yellow-300 text-black text-xl font-bold text-center py-2">
            {porcentaje}% DESCUENTO
          </div>
          
          {/* Contenido del producto */}
          <div className="p-4">
            {/* Nombre del producto */}
            <div className="text-center font-bold text-lg mb-2">
              {producto.name}
            </div>
            
            {/* Imagen del producto */}
            <div className="w-full h-40 bg-gray-100 flex items-center justify-center mb-3 rounded overflow-hidden">
              {producto.imageUrl ? (
                <img src={producto.imageUrl} alt={producto.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-gray-400">Sin imagen</div>
              )}
            </div>
            
            {/* Precios */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-sm font-bold">AHORA</div>
                <div className="text-2xl font-bold text-red-600">
                  ${producto.price}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">ANTES</div>
                <div className="text-lg line-through">
                  ${Math.round(producto.price * (1 + parseInt(porcentaje) / 100))}
                </div>
              </div>
            </div>
            
            {/* Pie del cartel con fechas, SAP, etc. */}
            <div className="mt-4 border-t border-gray-200 pt-2">
              <div className="flex justify-between text-xs">
                <div>{fechasDesde} - {fechasHasta}</div>
                <div>SAP-TEC: {sap}</div>
                <div>ORIGEN: {origen}</div>
              </div>
              <div className="text-center text-[8px] mt-1">
                PRECIO SIN IMPUESTOS NACIONALES {precioSinImpuestos}
                <br/>NO ACUMULABLE CON OTRAS PROMOCIONES
              </div>
              
              {/* Logos de tarjetas */}
              <div className="flex justify-end mt-1">
                <img src="https://via.placeholder.com/20x10" alt="Visa" className="w-6 h-4" />
                <img src="https://via.placeholder.com/20x10" alt="Mastercard" className="w-6 h-4 ml-1" />
              </div>
            </div>
          </div>
          
          {/* Financiación */}
          {financiacion && financiacion.length > 0 && (
            <div className="bg-gray-200 p-2">
              <div className="text-xs font-bold mb-1">FINANCIACIÓN:</div>
              {financiacion.map((opcion, index) => (
                <div key={index} className="text-[8px]">
                  {typeof opcion === 'string' ? opcion : opcion.plan || opcion.toString()}
                </div>
              ))}
            </div>
          )}
          
          {/* Información adicional */}
          <div className="bg-gray-100 p-2 text-[8px] text-center">
            PRECIOS EXPRESADOS EN PESOS ARGENTINOS
          </div>
        </div>
      ))}
    </div>
  );
};

export default MultiProductos;
