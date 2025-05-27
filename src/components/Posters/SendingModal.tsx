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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {step === 'selection' && 'Seleccionar sucursales'}
                  {(step === 'sending' || step === 'complete') && 'Enviando a sucursales'}
                </h3>
                {(step === 'selection' || step === 'complete') && (
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            {step === 'selection' && (
              <div className="grid grid-cols-5 gap-6">
                {/* Columna izquierda: Selección */}
                <div className="col-span-3 border-r border-gray-200 p-6 space-y-6">
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
                <div className="col-span-2 p-6 bg-gray-50">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Resumen del envío</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Carteles:</span>
                        <span className="font-medium">{productsCount}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sucursales:</span>
                        <span className="font-medium">{selectedLocations.length}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Impresora:</span>
                        <span className="font-medium">
                          {selectedPrinter ? PRINTERS.find(p => p.id === selectedPrinter)?.name : 'No seleccionada'}
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <button
                        onClick={handleStartSending}
                        disabled={selectedLocations.length === 0 || !selectedPrinter}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Enviar carteles
                      </button>
                      
                      <button
                        onClick={handleClose}
                        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progreso de envío */}
            {(step === 'sending' || step === 'complete') && (
              <SendingProgress
                locations={locationOptions.filter(loc => selectedLocations.includes(loc.id))}
                sentLocations={sentLocations}
                currentLocation={currentLocation}
                isComplete={step === 'complete'}
              />
            )}

            {/* Footer para pantalla de progreso */}
            {step === 'sending' && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar envío
                </button>
              </div>
            )}

            {step === 'complete' && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-center">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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