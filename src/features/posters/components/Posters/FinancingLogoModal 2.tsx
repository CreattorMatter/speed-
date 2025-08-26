import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { FINANCING_OPTIONS } from '../../../../constants/posters/financingOptions';

// ==========================================
// INTERFAZ DEL MODAL DE LOGOS DE FINANCIACIÓN
// ==========================================

export interface FinancingLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bank: string, logo: string, plan: string) => void;
}

// ==========================================
// MODAL DE SELECCIÓN DE LOGOS DE FINANCIACIÓN
// ==========================================

export const FinancingLogoModal: React.FC<FinancingLogoModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect 
}) => {
  const [selectedOption, setSelectedOption] = useState<{
    bank: string;
    logo: string;
    plan: string;
  } | null>(null);



  const handleSelect = (bank: string, logo: string, plan: string) => {
    setSelectedOption({ bank, logo, plan });
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onSelect(selectedOption.bank, selectedOption.logo, selectedOption.plan);
      onClose();
      setSelectedOption(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedOption(null);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm z-[99999]"
            onClick={handleCancel}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    💳 Seleccionar Logo
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Elige el logo que aparecerá en tu cartel
                  </p>
                </div>
                <button 
                  onClick={handleCancel} 
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {FINANCING_OPTIONS.map((option) => (
                    <div 
                      key={option.bank}
                      onClick={() => handleSelect(option.bank, option.logo, option.bank)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105
                        ${selectedOption?.bank === option.bank
                          ? 'border-green-500 bg-green-50 shadow-lg'
                          : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                        }
                      `}
                    >
                      {/* Logo */}
                      <div className="aspect-[3/2] bg-white rounded-lg p-3 flex items-center justify-center">
                        <img 
                          src={option.logo} 
                          alt={option.bank}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      
                      {/* Bank Name */}
                      <div className="mt-2 text-center text-sm font-medium text-gray-700">
                        {option.bank}
                      </div>

                      {/* Selection Indicator */}
                      {selectedOption?.bank === option.bank && (
                        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Instructions */}
                <div className="mt-6 p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-blue-700 text-sm">
                    💳 Selecciona el logo que aparecerá en tu cartel
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedOption}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-all
                    ${selectedOption
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {selectedOption ? 'Aplicar Logo' : 'Selecciona un logo'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FinancingLogoModal;