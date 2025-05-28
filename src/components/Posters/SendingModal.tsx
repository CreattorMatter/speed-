import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PrinterIcon, Printer } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';

// Importar selectores y acciones de Redux
import {
  selectIsSendingModalOpen,
  selectSelectedProducts,
  setIsSendingModalOpen,
} from '../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../store';

import { LocationSelection } from './Sending/LocationSelection';
import { PrinterSelection } from './Sending/PrinterSelection';
import { SendingProgress } from './Sending/SendingProgress';
import { getSucursalesPorEmpresa, Sucursal } from '../../lib/supabaseClient-sucursalesCartelFisico';

interface SendingModalProps {
  empresaId: number;
}

type SendingStep = 'selection' | 'sending' | 'complete';

const PRINTERS = [
  {
    id: 'hp-laser',
    name: 'HP Color LaserJet',
    type: 'laser',
    formats: ['A4', 'Carta'],
    status: 'Disponible',
    icon: <PrinterIcon className="w-6 h-6 text-blue-600" />
  },
  {
    id: 'brother-a3',
    name: 'Brother HL-L8360CDW',
    type: 'a3',
    formats: ['A3'],
    status: 'Disponible',
    icon: <Printer className="w-6 h-6 text-purple-600" />
  }
];

export const SendingModal: React.FC<SendingModalProps> = ({
  empresaId
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Obtener estado de Redux
  const isOpen = useSelector(selectIsSendingModalOpen);
  const selectedProductIds = useSelector(selectSelectedProducts);
  const productsCount = selectedProductIds.length;

  const [sentLocations, setSentLocations] = useState<Set<string>>(new Set());
  const [currentLocation, setCurrentLocation] = useState<number>(0);
  const [step, setStep] = useState<SendingStep>('selection');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);

  const locationOptions = sucursales.map(s => ({
    id: s.id.toString(),
    name: s.nombre,
    region: s.region,
    direccion: s.direccion,
    email: s.email
  }));

  // Handler para cerrar el modal
  const handleClose = () => {
    dispatch(setIsSendingModalOpen(false));
  };

  // Reset y carga de datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setSentLocations(new Set());
      setCurrentLocation(0);
      setStep('selection');
      setSelectedLocations([]);
      setSelectedPrinter('');
      
      const loadSucursales = async () => {
        try {
          setLoading(true);
          const data = await getSucursalesPorEmpresa(empresaId);
          setSucursales(data);
        } catch (error) {
          console.error('Error al cargar sucursales:', error);
        } finally {
          setLoading(false);
        }
      };

      loadSucursales();
    }
  }, [isOpen, empresaId]);

  // Proceso de envío
  useEffect(() => {
    if (step === 'sending') {
      const interval = setInterval(() => {
        setCurrentLocation(prev => {
          if (prev < selectedLocations.length) {
            setSentLocations(current => new Set([...current, selectedLocations[prev]]));
            return prev + 1;
          }
          clearInterval(interval);
          setStep('complete');
          return prev;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [step, selectedLocations]);

  const handleStartSending = () => {
    if (selectedLocations.length === 0) {
      alert('Por favor seleccione al menos una sucursal');
      return;
    }
    if (!selectedPrinter) {
      alert('Por favor seleccione una impresora');
      return;
    }
    setStep('sending');
  };

  const handleCancel = () => {
    setStep('selection');
    setSentLocations(new Set());
    setCurrentLocation(0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (step === 'complete' && e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 xs:p-3 sm:p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-[95vw] xs:max-w-[90vw] sm:max-w-[85vw] lg:max-w-5xl xl:max-w-6xl h-[95vh] xs:h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3 xs:p-4 sm:p-5 lg:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-sm xs:text-base sm:text-lg font-medium text-gray-900 truncate">
                  {step === 'selection' && 'Seleccionar sucursales'}
                  {(step === 'sending' || step === 'complete') && 'Enviando a sucursales'}
                </h3>
                {(step === 'selection' || step === 'complete') && (
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors p-1 ml-2 flex-shrink-0"
                  >
                    <X className="w-4 h-4 xs:w-5 xs:h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            {step === 'selection' && (
              <div className="flex-1 flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6 overflow-hidden">
                {/* Columna izquierda: Selección */}
                <div className="lg:col-span-3 lg:border-r border-gray-200 p-3 xs:p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
                  <LocationSelection
                    locations={locationOptions}
                    selectedLocations={selectedLocations}
                    onSelectionChange={setSelectedLocations}
                    loading={loading}
                  />

                  <PrinterSelection
                    printers={PRINTERS}
                    selectedPrinter={selectedPrinter}
                    onPrinterSelect={setSelectedPrinter}
                  />
                </div>

                {/* Columna derecha: Resumen */}
                <div className="lg:col-span-2 p-3 xs:p-4 sm:p-5 lg:p-6 bg-gray-50 overflow-y-auto">
                  <div className="space-y-3 xs:space-y-4">
                    <h4 className="text-sm xs:text-base sm:text-lg font-medium text-gray-900">Resumen del envío</h4>
                    
                    <div className="space-y-2 xs:space-y-3">
                      <div className="flex justify-between text-xs xs:text-sm sm:text-base">
                        <span className="text-gray-600">Productos:</span>
                        <span className="font-medium">{productsCount}</span>
                      </div>
                      <div className="flex justify-between text-xs xs:text-sm sm:text-base">
                        <span className="text-gray-600">Sucursales:</span>
                        <span className="font-medium">{selectedLocations.length}</span>
                      </div>
                      <div className="flex justify-between text-xs xs:text-sm sm:text-base">
                        <span className="text-gray-600">Impresora:</span>
                        <span className="font-medium text-xs xs:text-sm truncate ml-2">
                          {selectedPrinter ? PRINTERS.find(p => p.id === selectedPrinter)?.name : 'No seleccionada'}
                        </span>
                      </div>
                    </div>

                    {selectedLocations.length > 0 && (
                      <div className="mt-4 xs:mt-6">
                        <h5 className="text-xs xs:text-sm sm:text-base font-medium text-gray-900 mb-2 xs:mb-3">Sucursales seleccionadas:</h5>
                        <div className="space-y-1 xs:space-y-2 max-h-24 xs:max-h-32 sm:max-h-40 overflow-y-auto">
                          {selectedLocations.map(locationId => {
                            const location = locationOptions.find(l => l.id === locationId);
                            return (
                              <div key={locationId} className="text-xs xs:text-sm text-gray-600 p-1.5 xs:p-2 bg-white rounded border">
                                <div className="font-medium truncate">{location?.name}</div>
                                <div className="text-xxs xs:text-xs text-gray-500 truncate">{location?.region}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 xs:pt-6 border-t border-gray-200">
                      <button
                        onClick={handleStartSending}
                        disabled={selectedLocations.length === 0 || !selectedPrinter}
                        className="w-full px-3 xs:px-4 py-2 xs:py-3 bg-indigo-600 text-white text-xs xs:text-sm sm:text-base font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Enviar a {selectedLocations.length} sucursal{selectedLocations.length !== 1 ? 'es' : ''}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progreso de envío */}
            {(step === 'sending' || step === 'complete') && (
              <div className="flex-1 p-3 xs:p-4 sm:p-5 lg:p-6 overflow-y-auto">
                <SendingProgress
                  locations={locationOptions.filter(loc => selectedLocations.includes(loc.id))}
                  sentLocations={sentLocations}
                  currentLocation={currentLocation}
                  isComplete={step === 'complete'}
                />
              </div>
            )}

            {/* Footer para pantalla de progreso */}
            {step === 'sending' && (
              <div className="px-3 xs:px-4 sm:px-5 lg:px-6 py-3 xs:py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  onClick={handleCancel}
                  className="px-3 xs:px-4 py-2 text-xs xs:text-sm sm:text-base text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar envío
                </button>
              </div>
            )}

            {step === 'complete' && (
              <div className="px-3 xs:px-4 sm:px-5 lg:px-6 py-3 xs:py-4 border-t border-gray-200 bg-gray-50 text-center flex-shrink-0">
                <button
                  onClick={handleClose}
                  className="px-4 xs:px-6 py-2 xs:py-3 bg-green-600 text-white text-xs xs:text-sm sm:text-base font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 