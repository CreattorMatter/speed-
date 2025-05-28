import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Product } from '../../../data/products';

interface DeleteProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onConfirm: () => void;
  onCancel: () => void;
  productNumber?: number;
  totalProducts?: number;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  product,
  onConfirm,
  onCancel,
  productNumber,
  totalProducts
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 xs:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xs xs:max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 xs:p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 xs:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 xs:w-10 xs:h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-4 h-4 xs:w-5 xs:h-5 text-red-600" />
            </div>
            <h3 className="text-base xs:text-lg font-semibold text-gray-900 truncate">
              Eliminar Producto
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 xs:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Cerrar"
          >
            <X className="w-4 h-4 xs:w-5 xs:h-5 text-gray-500" />
          </button>
        </div>

        {/* Alert */}
        <div className="flex items-start gap-2 xs:gap-3 p-3 xs:p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-3 xs:mb-4">
          <AlertTriangle className="w-4 h-4 xs:w-5 xs:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs xs:text-sm text-yellow-800">
            <p className="font-medium mb-1">¿Estás seguro?</p>
            <p>Esta acción eliminará el producto de la selección actual. No podrás deshacerla.</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-gray-50 rounded-lg p-3 xs:p-4 mb-4 xs:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs xs:text-sm font-medium text-gray-700">Producto a eliminar:</span>
            {productNumber && totalProducts && (
              <span className="text-xxs xs:text-xs bg-blue-100 text-blue-800 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded">
                {productNumber} de {totalProducts}
              </span>
            )}
          </div>
          
          <div className="space-y-1.5 xs:space-y-2">
            <div className="flex justify-between">
              <span className="text-xs xs:text-sm text-gray-600">Nombre:</span>
              <span className="text-xs xs:text-sm font-medium text-gray-900 truncate ml-2 max-w-[60%]" title={product.name}>
                {product.name}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs xs:text-sm text-gray-600">SKU:</span>
              <span className="text-xs xs:text-sm font-medium text-gray-900">
                {product.sku || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs xs:text-sm text-gray-600">Precio:</span>
              <span className="text-xs xs:text-sm font-medium text-green-600">
                ${product.price}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs xs:text-sm text-gray-600">Categoría:</span>
              <span className="text-xs xs:text-sm font-medium text-gray-900 truncate max-w-[60%]">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-3 xs:px-4 py-2 xs:py-2.5 bg-gray-100 text-gray-700 text-sm xs:text-base rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-3 xs:px-4 py-2 xs:py-2.5 bg-red-500 text-white text-sm xs:text-base rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-1.5 xs:gap-2"
          >
            <Trash2 className="w-3 h-3 xs:w-4 xs:h-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}; 