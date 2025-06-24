// =====================================
// CONFIRM EXIT MODAL - BUILDER V3
// =====================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Save, X } from 'lucide-react';

interface ConfirmExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndExit: () => void;
  onExitWithoutSaving: () => void;
  templateName?: string;
  destinationText?: string;
}

export const ConfirmExitModal: React.FC<ConfirmExitModalProps> = ({
  isOpen,
  onClose,
  onSaveAndExit,
  onExitWithoutSaving,
  templateName = 'la plantilla',
  destinationText = 'la librería de plantillas'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl p-6 max-w-md mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  ¿Guardar cambios?
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                Tienes cambios sin guardar en <strong>{templateName}</strong>.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">
                ¿Quieres guardar los cambios antes de volver a {destinationText}?
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={onSaveAndExit}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                <span>Guardar y continuar</span>
              </button>

              <button
                onClick={onExitWithoutSaving}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Salir sin guardar
              </button>

              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 