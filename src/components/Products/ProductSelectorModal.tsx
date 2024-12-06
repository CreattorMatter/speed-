import React from 'react';
import { X } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProducts: string[];
  onSelectProduct: (productId: string) => void;
  category?: string;
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProducts,
  onSelectProduct,
  category
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl w-[800px] max-h-[80vh] border border-white/20">
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <h2 className="text-xl font-medium text-white">
            Seleccionar Productos {category ? `- ${category}` : ''}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors
                  ${selectedProducts.includes(product.id)
                    ? 'bg-white/20 border-white/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                onClick={() => onSelectProduct(product.id)}
              >
                <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{product.name}</h3>
                  <p className="text-white/60 text-sm">{product.description}</p>
                  <p className="text-white/80 mt-1">${product.price.toLocaleString('es-AR')}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${selectedProducts.includes(product.id)
                    ? 'border-white bg-white/20'
                    : 'border-white/30'
                  }`}
                >
                  {selectedProducts.includes(product.id) && (
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