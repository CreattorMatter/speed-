import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Package, Send, Printer, PrinterIcon } from 'lucide-react';
import { LocationSelect } from './LocationSelect';
import { getSucursalesPorEmpresa, Sucursal } from '../../lib/supabaseClient-sucursalesCartelFisico';

interface SendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productsCount: number;
  company: string;
  empresaId: number;
}

type SendingStep = 'selection' | 'preparing' | 'sending' | 'complete';

const PRINTERS = [
  {
    id: 'hp-laser',
    name: 'HP Color LaserJet',
    type: 'laser',
    formats: ['A4', 'Carta'],
    icon: <PrinterIcon className="w-6 h-6 text-blue-600" />
  },
  {
    id: 'brother-a3',
    name: 'Brother HL-L8360CDW',
    type: 'a3',
    formats: ['A3'],
    icon: <Printer className="w-6 h-6 text-purple-600" />
  },
  {
    id: 'hp-plotter',
    name: 'HP DesignJet',
    type: 'plotter',
    formats: ['Plotter'],
    icon: <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18M19 3v18M5 3v18"/>
    </svg>
  },
  {
    id: 'brother-thermal',
    name: 'Brother QL-820NWB',
    type: 'termica',
    formats: ['Etiquetas'],
    icon: <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
      <path d="M8 14h8"/>
    </svg>
  }
];

export const SendingModal: React.FC<SendingModalProps> = ({
  isOpen,
  onClose,
  productsCount,
  company,
  empresaId
}) => {
  console.log('SendingModal props:', { isOpen, company, empresaId });
  
  const [sentLocations, setSentLocations] = useState<Set<string>>(new Set());
  const [currentLocation, setCurrentLocation] = useState<number>(0);
  const [step, setStep] = useState<SendingStep>('selection');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      console.log('Modal abierto, empresaId:', empresaId);
      // Resetear estados
      setSentLocations(new Set());
      setCurrentLocation(0);
      setStep('selection');
      setSelectedLocations([]);
      setSelectedPrinter('');
      
      // Cargar sucursales
      const loadSucursales = async () => {
        try {
          console.log('Iniciando carga de sucursales...');
          setLoading(true);
          const data = await getSucursalesPorEmpresa(empresaId);
          console.log('Sucursales cargadas:', data);
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

  useEffect(() => {
    if (step === 'preparing') {
      // Solo preparación por 1 segundo y luego directo a envío
      const preparingTimeout = setTimeout(() => {
        setStep('sending');
        // Iniciar el envío inmediatamente
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
        }, 500);

        return () => clearInterval(interval);
      }, 1000);

      return () => {
        clearTimeout(preparingTimeout);
      };
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
    setStep('preparing');
  };

  const handleCancel = () => {
    setStep('selection');
    setSentLocations(new Set());
    setCurrentLocation(0);
  };

  const renderSelectionStep = () => {
    if (step !== 'selection') return null;

    // Convertir las sucursales al formato que espera LocationSelect
    const locationOptions = sucursales.map(s => ({
      id: s.id.toString(),
      name: s.nombre,
      region: s.region,
      direccion: s.direccion
    }));

    return (
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar Sucursales
          </label>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <LocationSelect
              value={selectedLocations}
              onChange={setSelectedLocations}
              locations={locationOptions}
              disabled={false}
              isMulti={true}
              className="bg-white border-gray-300"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seleccionar Impresora
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PRINTERS.map((printer) => (
              <button
                key={printer.id}
                onClick={() => setSelectedPrinter(printer.id)}
                className={`flex items-center p-3 border rounded-lg transition-colors ${
                  selectedPrinter === printer.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="mr-3">
                  {printer.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{printer.name}</div>
                  <div className="text-sm text-gray-500">{printer.formats.join(', ')}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleStartSending}
            disabled={selectedLocations.length === 0 || !selectedPrinter}
            className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${(selectedLocations.length === 0 || !selectedPrinter)
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
          >
            Comenzar envío
          </button>
        </div>
      </div>
    );
  };

  const renderPreparationStep = () => {
    if (step === 'selection' || step === 'sending' || step === 'complete') return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center p-12 space-y-6"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 flex items-center justify-center bg-indigo-100 rounded-full"
        >
          <Package className="w-10 h-10 text-indigo-600" />
        </motion.div>
        <h3 className="text-xl font-medium text-gray-900">
          Preparando envío...
        </h3>
        <p className="text-sm text-gray-500">
          {productsCount} {productsCount === 1 ? 'cartel' : 'carteles'} seleccionados
        </p>
        <button
          onClick={handleCancel}
          className="mt-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancelar
        </button>
      </motion.div>
    );
  };

  const renderLocationsList = () => {
    if (step !== 'sending' && step === 'complete') return null;

    const selectedLocationDetails = sucursales.filter(loc => 
      selectedLocations.includes(loc.id.toString())
    );

    return (
      <div className="p-6 max-h-[400px] overflow-y-auto">
        <div className="space-y-4">
          {selectedLocationDetails.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{location.nombre}</h4>
                <p className="text-sm text-gray-500">{location.region}</p>
                <p className="text-sm text-gray-600 mt-1">{location.direccion}</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center ml-4">
                {sentLocations.has(location.id.toString()) ? (
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (step === 'complete' && e.target === e.currentTarget) {
      onClose();
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
            className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {step === 'selection' && 'Seleccionar sucursales'}
                  {step === 'preparing' && 'Preparando envío'}
                  {(step === 'sending' || step === 'complete') && 'Enviando a sucursales'}
                </h3>
                {(step === 'selection' || step === 'complete') && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            {renderSelectionStep()}
            {renderPreparationStep()}
            {renderLocationsList()}

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {step === 'selection' && `${selectedLocations.length} sucursales seleccionadas`}
                  {step === 'complete'
                    ? 'Envío completado'
                    : step === 'sending'
                    ? `Enviando a ${currentLocation + 1} de ${selectedLocations.length} sucursales...`
                    : 'Preparando envío...'}
                </div>
                {step === 'complete' && (
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