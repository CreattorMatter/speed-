import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';

// Importar selectores y acciones de Redux
import {
  selectIsFinancingModalOpen,
  selectSelectedFinancing,
  setIsFinancingModalOpen,
  setSelectedFinancing,
} from '../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../store';

import { FinancingCard } from './Financing/FinancingCard';

interface FinancingModalProps {
  // Ya no necesita props, todo viene de Redux
}

export interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  cardImage: string;
  plan: string;
}

const FINANCING_OPTIONS = [
  {
    bank: 'American Express',
    logo: '/images/banks/amex-logo.png',
    cards: [{ name: 'American Express', image: '/images/banks/amex-logo.png', plans: ['3 cuotas sin interés', '6 cuotas sin interés'] }]
  },
  {
    bank: 'Banco Nación',
    logo: '/images/banks/banco-nacion-logo.png',
    cards: [{ name: 'Banco Nación', image: '/images/banks/banco-nacion-logo.png', plans: ['3 cuotas sin interés', '12 cuotas sin Interés'] }]
  },
  {
    bank: 'Visa',
    logo: '/images/banks/visa-logo.png',
    cards: [{ name: 'Visa', image: '/images/banks/visa-logo.png', plans: ['6 cuotas con interés', '12 cuotas con Interés'] }]
  },
  {
    bank: 'Mastercard',
    logo: '/images/banks/mastercard-logo.png',
    cards: [{ name: 'Mastercard', image: '/images/banks/mastercard-logo.png', plans: ['6 cuotas con interés', '12 cuotas con Interés'] }]
  },
  {
    bank: 'Cencosud',
    logo: '/images/banks/cencosud.png',
    cards: [{ name: 'Tarjeta Cencosud', image: '/images/banks/cencosud.png', plans: ['6 cuotas sin interés', '12 cuotas sin interés', '18 cuotas sin Interés'] }]
  },
  {
    bank: 'CencoPay',
    logo: '/images/banks/cencopay.png',
    cards: [{ name: 'CencoPay', image: '/images/banks/cencopay.png', plans: ['6 cuotas sin interés', '12 cuotas sin interés', '18 cuotas sin Interés'] }]
  }
];

export const FinancingModal: React.FC<FinancingModalProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Obtener estado de Redux
  const isOpen = useSelector(selectIsFinancingModalOpen);
  const currentSelectedFinancing = useSelector(selectSelectedFinancing);
  
  const [selectedOptions, setSelectedOptions] = useState<FinancingOption[]>(currentSelectedFinancing);

  // Sincronizar con Redux cuando cambie el estado global
  React.useEffect(() => {
    setSelectedOptions(currentSelectedFinancing);
  }, [currentSelectedFinancing]);

  const handleSelect = (bank: string, logo: string, card: { name: string, image: string }, plan: string) => {
    const option: FinancingOption = {
      bank,
      logo,
      cardName: card.name,
      cardImage: card.image,
      plan
    };

    setSelectedOptions(prev => {
      const exists = prev.some(opt => 
        opt.bank === bank && opt.cardName === card.name && opt.plan === plan
      );

      if (exists) {
        return prev.filter(opt => 
          !(opt.bank === bank && opt.cardName === card.name && opt.plan === plan)
        );
      }

      return [...prev, option];
    });
  };

  const handleConfirm = () => {
    if (selectedOptions.length > 0) {
      dispatch(setSelectedFinancing(selectedOptions));
      dispatch(setIsFinancingModalOpen(false));
      setSelectedOptions([]);
    }
  };

  const handleClose = () => {
    setSelectedOptions(currentSelectedFinancing); // Restaurar al estado original
    dispatch(setIsFinancingModalOpen(false));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-auto p-2 xs:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-xs xs:max-w-sm sm:max-w-lg lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-auto">
              {/* Header */}
              <div className="p-3 xs:p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-800 truncate">Opciones de Financiación</h2>
                <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 p-1 ml-2 flex-shrink-0">
                  <X className="w-4 h-4 xs:w-5 xs:h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 max-h-[50vh] xs:max-h-[60vh] overflow-y-auto p-1">
                  {FINANCING_OPTIONS.map((option) => (
                    <FinancingCard
                      key={option.bank}
                      bank={option.bank}
                      logo={option.logo}
                      cards={option.cards}
                      selectedOptions={selectedOptions}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>

                {/* Selected Options Summary */}
                {selectedOptions.length > 0 && (
                  <div className="border-t border-gray-200 pt-3 xs:pt-4">
                    <h4 className="text-xs xs:text-sm font-medium text-gray-900 mb-1 xs:mb-2">
                      Opciones seleccionadas ({selectedOptions.length}):
                    </h4>
                    <div className="space-y-0.5 xs:space-y-1 max-h-20 xs:max-h-24 overflow-y-auto">
                      {selectedOptions.map((option, index) => (
                        <div key={index} className="text-xxs xs:text-xs text-gray-600">
                          • {option.bank} - {option.plan}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 pt-3 xs:pt-4 border-t border-gray-200">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-3 xs:px-4 py-2 xs:py-3 text-sm xs:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={selectedOptions.length === 0}
                    className="flex-1 px-3 xs:px-4 py-2 xs:py-3 text-sm xs:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirmar ({selectedOptions.length})
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 