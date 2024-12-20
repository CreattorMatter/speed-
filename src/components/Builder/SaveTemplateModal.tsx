import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Loader2, Package, Upload, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, isPublic: boolean) => void;
  previewImage: string;
  isSaving: boolean;
  savingStep: 'idle' | 'generating' | 'uploading';
}

export function SaveTemplateModal({ isOpen, onClose, onSave, previewImage, isSaving, savingStep }: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, description, isPublic);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-start p-4 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Guardar Plantilla
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
            {/* Vista previa */}
            {previewImage && (
              <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden">
                <img 
                  src={previewImage} 
                  alt="Vista previa de la plantilla"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Campos del formulario */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre de la plantilla
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Ingresa un nombre para la plantilla"
                  required
                  disabled={isSaving}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción (opcional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe tu plantilla"
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={isSaving}
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                  Hacer esta plantilla pública
                </label>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSaving || !name.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Guardar Plantilla
                  </>
                )}
              </button>
            </div>

            {/* Indicador de progreso */}
            {isSaving && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {savingStep === 'generating' ? 'Generando vista previa...' : 'Subiendo plantilla...'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {savingStep === 'generating' ? '50%' : '100%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: savingStep === 'generating' ? '50%' : '100%' }}
                  />
                </div>
              </div>
            )}
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 