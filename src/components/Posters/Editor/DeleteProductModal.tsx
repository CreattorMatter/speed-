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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Eliminar Producto
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Alert */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">¿Estás seguro?</p>
            <p>Esta acción eliminará el producto de la selección actual. No podrás deshacerla.</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Producto a eliminar:</span>
            {productNumber && totalProducts && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {productNumber} de {totalProducts}
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Nombre:</span>
              <span className="text-sm font-medium text-gray-900 truncate ml-2" title={product.name}>
                {product.name}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">SKU:</span>
              <span className="text-sm font-medium text-gray-900">
                {product.sku || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Precio:</span>
              <span className="text-sm font-medium text-green-600">
                ${product.price}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Categoría:</span>
              <span className="text-sm font-medium text-gray-900">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}; 