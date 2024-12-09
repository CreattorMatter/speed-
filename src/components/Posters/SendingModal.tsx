import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Package, Send } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  region: string;
}

interface SendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  productsCount: number;
}

type SendingStep = 'preparing' | 'packing' | 'sending' | 'complete';

export const SendingModal: React.FC<SendingModalProps> = ({
  isOpen,
  onClose,
  locations,
  productsCount
}) => {
  const [sentLocations, setSentLocations] = useState<Set<string>>(new Set());
  const [currentLocation, setCurrentLocation] = useState<number>(0);
  const [step, setStep] = useState<SendingStep>('preparing');

  useEffect(() => {
    if (isOpen) {
      // Resetear estados
      setSentLocations(new Set());
      setCurrentLocation(0);
      setStep('preparing');

      // Secuencia de animación
      const preparingTimeout = setTimeout(() => setStep('packing'), 2000);
      const packingTimeout = setTimeout(() => setStep('sending'), 4000);
      
      // Comenzar envío a sucursales después de empaquetar
      const sendingTimeout = setTimeout(() => {
        const interval = setInterval(() => {
          setCurrentLocation(prev => {
            if (prev < locations.length) {
              setSentLocations(current => new Set([...current, locations[prev].id]));
              return prev + 1;
            }
            clearInterval(interval);
            setStep('complete');
            return prev;
          });
        }, 1000);

        return () => clearInterval(interval);
      }, 6000);

      return () => {
        clearTimeout(preparingTimeout);
        clearTimeout(packingTimeout);
        clearTimeout(sendingTimeout);
      };
    }
  }, [isOpen, locations]);

  const isComplete = step === 'complete';

  const renderPreparationStep = () => {
    if (step === 'sending' || step === 'complete') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center p-12 space-y-6"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: step === 'packing' ? [0, 360] : 0
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 flex items-center justify-center bg-indigo-100 rounded-full"
        >
          {step === 'preparing' ? (
            <Package className="w-10 h-10 text-indigo-600" />
          ) : (
            <Send className="w-10 h-10 text-indigo-600" />
          )}
        </motion.div>
        <h3 className="text-xl font-medium text-gray-900">
          {step === 'preparing' ? 'Preparando envío...' : 'Empaquetando carteles...'}
        </h3>
        <p className="text-sm text-gray-500">
          {productsCount} {productsCount === 1 ? 'cartel' : 'carteles'} seleccionados
        </p>
      </motion.div>
    );
  };

  const renderLocationsList = () => {
    if (step !== 'sending' && step !== 'complete') return null;

    return (
      <div className="p-6 max-h-[400px] overflow-y-auto">
        <div className="space-y-4">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
            >
              <div>
                <h4 className="font-medium text-gray-900">{location.name}</h4>
                <p className="text-sm text-gray-500">{location.region}</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                {sentLocations.has(location.id) ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="bg-green-100 p-2 rounded-full"
                  >
                    <Check className="w-4 h-4 text-green-600" />
                  </motion.div>
                ) : currentLocation === index ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5 text-indigo-600" />
                  </motion.div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {step === 'preparing' && 'Preparando envío'}
                  {step === 'packing' && 'Empaquetando carteles'}
                  {(step === 'sending' || step === 'complete') && 'Enviando a sucursales'}
                </h3>
                <button
                  onClick={onClose}
                  disabled={!isComplete}
                  className={`text-gray-400 hover:text-gray-500 ${!isComplete && 'opacity-50 cursor-not-allowed'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            {renderPreparationStep()}
            {renderLocationsList()}

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {step === 'complete'
                    ? 'Envío completado'
                    : step === 'sending'
                    ? `Enviando a ${currentLocation + 1} de ${locations.length} sucursales...`
                    : 'Preparando envío...'}
                </div>
                {isComplete && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={onClose}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                             transition-colors text-sm font-medium"
                  >
                    Cerrar
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 