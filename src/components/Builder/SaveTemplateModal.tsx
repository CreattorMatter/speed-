import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Loader2, Package, Upload, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  previewImage: string;
  isSaving: boolean;
  savingStep: 'idle' | 'generating' | 'uploading';
}

export function SaveTemplateModal({ 
  isOpen, 
  onClose, 
  onSave, 
  previewImage,
  isSaving,
  savingStep 
}: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, description);
  };

  const getSavingStepIcon = () => {
    switch (savingStep) {
      case 'generating':
        return <Package className="w-8 h-8 text-indigo-600" />;
      case 'uploading':
        return <Upload className="w-8 h-8 text-indigo-600" />;
      default:
        return null;
    }
  };

  const getSavingStepText = () => {
    switch (savingStep) {
      case 'generating':
        return 'Preparando plantilla...';
      case 'uploading':
        return 'Guardando plantilla...';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-start p-4 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Guardar plantilla
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={isSaving}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                disabled={isSaving}
              />
            </div>

            {previewImage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vista previa
                </label>
                <div className="relative">
                  <motion.div
                    className="relative overflow-hidden rounded-lg"
                    initial={false}
                    animate={isSaving ? { opacity: 0.5 } : { opacity: 1 }}
                  >
                    <img
                      src={previewImage}
                      alt="Vista previa de la plantilla"
                      className="w-full h-48 object-contain border rounded-lg"
                    />
                  </motion.div>
                  
                  <AnimatePresence>
                    {isSaving && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="bg-white/90 p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
                          <motion.div
                            animate={{
                              rotate: savingStep === 'uploading' ? 360 : 0,
                              scale: [1, 1.1, 1]
                            }}
                            transition={{
                              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                              scale: { duration: 1, repeat: Infinity }
                            }}
                          >
                            {getSavingStepIcon()}
                          </motion.div>
                          <div className="flex flex-col items-center gap-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: savingStep === 'uploading' ? '100%' : '50%' }}
                              className="h-1 bg-indigo-600 rounded-full"
                              style={{ width: '150px' }}
                              transition={{ duration: 1 }}
                            />
                            <span className="text-sm font-medium text-gray-600">
                              {getSavingStepText()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <motion.button
                type="submit"
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md ${
                  isSaving 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                whileHover={!isSaving ? { scale: 1.02 } : {}}
                whileTap={!isSaving ? { scale: 0.98 } : {}}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {getSavingStepText()}
                  </>
                ) : (
                  'Guardar plantilla'
                )}
              </motion.button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 