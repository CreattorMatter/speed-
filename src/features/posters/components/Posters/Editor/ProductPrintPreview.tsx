import React from 'react';
import { Trash2, Printer } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { type ProductoParaImprimir } from '../../../types/index';
import { eliminarProductoParaImprimir } from '../../../store/features/poster/posterSlice';
import { AppDispatch } from '../../../store';

interface ProductPrintPreviewProps {
  producto: ProductoParaImprimir;
  index: number;
  onRemove: (idUnico: string) => void;
}

export const ProductPrintPreview: React.FC<ProductPrintPreviewProps> = ({
  producto,
  index,
  onRemove
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Calcular el aspect ratio basado en las dimensiones físicas
  const aspectRatio = producto.dimensionesFisicas.ancho / producto.dimensionesFisicas.alto;
  
  // Determinar el estilo del contenedor de preview basado en el aspect ratio
  const getPreviewStyle = () => {
    const baseHeight = 120; // Altura base en px
    const baseWidth = baseHeight * aspectRatio;
    
    return {
      width: `${Math.min(baseWidth, 200)}px`, // Máximo 200px de ancho
      height: `${baseHeight}px`,
      aspectRatio: aspectRatio
    };
  };

  const handleRemove = () => {
    onRemove(producto.idUnico);
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow relative group">
      {/* Botón de eliminar */}
      <button
        onClick={handleRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
        title="Eliminar producto"
      >
        <Trash2 size={14} />
      </button>

      {/* Número de ítem */}
      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
        {index + 1}
      </div>

      {/* Preview del producto escalado */}
      <div 
        className="bg-gray-50 rounded border flex items-center justify-center mb-2 overflow-hidden"
        style={getPreviewStyle()}
      >
        <div className="text-center p-2 scale-75 transform-origin-center">
          <img
            src={producto.product.imageUrl}
            alt={producto.product.name}
            className="w-12 h-12 object-cover rounded mx-auto mb-1"
          />
          <div className="text-xs text-gray-700 font-medium line-clamp-2">
            {producto.product.name}
          </div>
          <div className="text-xs text-blue-600 font-semibold">
            ${producto.product.price.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Información del producto */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-800 truncate" title={producto.product.name}>
          {producto.product.name}
        </div>
        
        <div className="text-xs text-gray-600">
          <div>Plantilla: {producto.plantillaSeleccionada}</div>
          <div>Modelo: {producto.modeloSeleccionado}</div>
          <div>
            Tamaño: {producto.dimensionesFisicas.ancho}×{producto.dimensionesFisicas.alto} {producto.dimensionesFisicas.unidad}
          </div>
        </div>

        {/* Empresa y promoción si están disponibles */}
        {producto.empresa && (
          <div className="text-xs text-purple-600">
            {producto.empresa.name}
          </div>
        )}
        
        {producto.promotion && (
          <div className="text-xs text-green-600">
            {producto.promotion.title}
          </div>
        )}
      </div>
    </div>
  );
}; 