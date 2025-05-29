import React from 'react';
import { RefreshCw, Check } from 'lucide-react';

interface ModalFooterProps {
  selectedCount: number;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  selectedCount,
  isLoading,
  onClose,
  onConfirm
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-indigo-600">{selectedCount}</span> productos seleccionados
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={selectedCount === 0 || isLoading}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedCount === 0 || isLoading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Confirmar ({selectedCount})
            </>
          )}
        </button>
      </div>
    </div>
  );
}; 