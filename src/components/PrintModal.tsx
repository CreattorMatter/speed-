import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, CheckCircle } from 'lucide-react';
import { PlantillaReciente } from '../types/plantilla';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: PlantillaReciente;
  onPrint: (id: string) => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  activity,
  onPrint
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    
    // Simular impresión
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsPrinting(false);
    setShowSuccess(true);
    
    // Llamar a onPrint para actualizar el estado
    onPrint(activity.id);
    
    // Cerrar el modal después de mostrar el mensaje de éxito
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl p-4 sm:p-6 max-w-lg w-full mx-2 sm:mx-4 relative 
                   max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-900">Imprimir Cartel</h3>
          <p className="text-sm text-gray-500 mt-1">{activity.nombre}</p>
        </div>

        {/* Vista previa del cartel mejorada */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="aspect-[4/3] bg-white rounded-lg shadow-inner border border-gray-200 p-8">
            <div className="h-full border-2 border-dashed border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-8">
                <img 
                  src={activity.empresa.logo} 
                  alt={activity.empresa.nombre}
                  className="h-12 object-contain"
                />
                <div className="text-right">
                  <div className="text-sm text-gray-500">Cantidad:</div>
                  <div className="text-xl font-bold text-gray-900">{activity.cantidad} unidades</div>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h4 className="text-2xl font-bold text-gray-900">{activity.nombre}</h4>
                <p className="text-lg text-gray-700">{activity.sucursal}</p>
                <div className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                  {activity.tipo.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            disabled={isPrinting}
          >
            Cancelar
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                     flex items-center gap-2 relative"
          >
            {isPrinting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Imprimiendo...</span>
              </div>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </>
            )}
          </button>
        </div>

        {/* Mensaje de éxito */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute inset-0 flex items-center justify-center bg-white rounded-xl"
            >
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900">¡Cartel impreso!</h3>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}; 