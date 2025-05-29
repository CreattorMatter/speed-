import React from 'react';
import { X, Package } from 'lucide-react';

interface ModalHeaderProps {
  title: string;
  selectedCount: number;
  totalProducts: number;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  selectedCount,
  totalProducts,
  onClose
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">
            {selectedCount} de {totalProducts} productos seleccionados
          </p>
        </div>
      </div>
      
      <button
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}; 