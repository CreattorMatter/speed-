import React from 'react';
import { X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';

// Importar selectores y acciones de Redux
import {
  selectIsProductSelectorOpen,
  setIsProductSelectorOpen,
  toggleProductSelection,
  selectSelectedProducts,
  selectSelectedCategory,
} from '../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../store';

import { type ProductoReal } from '../../types/product';

interface ProductSelectorModalProps {
  products: ProductoReal[];
  onSelectProduct: (productId: string) => void;
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  products,
  onSelectProduct
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Obtener estado de Redux
  const isOpen = useSelector(selectIsProductSelectorOpen);
  const selectedProductIds = useSelector(selectSelectedProducts);
  const selectedCategory = useSelector(selectSelectedCategory);

  const handleClose = () => {
    dispatch(setIsProductSelectorOpen(false));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl w-[800px] max-h-[80vh] border border-white/20">
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <h2 className="text-xl font-medium text-white">
            Seleccionar Productos {selectedCategory ? `- ${selectedCategory}` : ''}
          </h2>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => (
              <div
                key={product.sku.toString()}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors
                  ${selectedProductIds.includes(product.sku.toString())
                    ? 'bg-white/20 border-white/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                onClick={() => onSelectProduct(product.sku.toString())}
              >
                <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center">
                  {/* Placeholder para imagen - ProductoReal no tiene imageUrl */}
                  <div className="text-white/40 text-xs text-center">
                    {product.marcaTexto || 'IMG'}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{product.descripcion}</h3>
                  <p className="text-white/60 text-sm">
                    {product.marcaTexto} • {product.seccion} • SKU: {product.sku}
                  </p>
                  <p className="text-white/80 mt-1">
                    ${product.precio?.toLocaleString('es-AR') || 'Precio no disponible'}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${selectedProductIds.includes(product.sku.toString())
                    ? 'border-white bg-white/20'
                    : 'border-white/30'
                  }`}
                >
                  {selectedProductIds.includes(product.sku.toString()) && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 