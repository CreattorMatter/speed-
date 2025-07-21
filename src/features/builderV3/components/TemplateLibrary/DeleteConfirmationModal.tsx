// =====================================
// DELETE CONFIRMATION MODAL - BuilderV3
// =====================================

import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeleteConfirmationModalProps } from './types';

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  template,
  onConfirm,
  onCancel,
  isDeleting
}) => {
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!template) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Eliminar Plantilla
                  </h3>
                  <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {template.description || 'Sin descripción'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {template.defaultComponents.length} componentes
                  </span>
                  <span>
                    Actualizada {formatDate(template.updatedAt)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro de que quieres eliminar esta plantilla? 
                Esta acción eliminará permanentemente la plantilla y todos sus componentes.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 