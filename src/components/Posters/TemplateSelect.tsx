import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutTemplate } from 'lucide-react';
import { POSTER_TEMPLATES } from '../../constants/templates';

interface TemplateSelectProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (templateId: string) => void;
}

export const TemplateSelect: React.FC<TemplateSelectProps> = ({
  isOpen,
  onClose,
  value,
  onChange
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-x-0 top-[5%] mx-auto max-w-2xl bg-white rounded-xl shadow-2xl z-50 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <LayoutTemplate className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Seleccionar Plantilla</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Grid de plantillas */}
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {POSTER_TEMPLATES.map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onChange(template.id);
                    onClose();
                  }}
                  className={`p-4 rounded-lg border transition-all text-left
                    ${value === template.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 