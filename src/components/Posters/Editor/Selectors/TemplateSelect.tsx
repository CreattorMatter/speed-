import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutTemplate } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';

// Importar selectores y acciones de Redux
import {
  selectIsTemplateModalOpen,
  selectSelectedTemplate,
  setIsTemplateModalOpen,
  setSelectedTemplate,
} from '../../../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../../../store';

import { POSTER_TEMPLATES } from '../../../../constants/templates';

interface TemplateSelectProps {
  // Ya no necesita props, todo viene de Redux
}

export const TemplateSelect: React.FC<TemplateSelectProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Obtener estado de Redux
  const isOpen = useSelector(selectIsTemplateModalOpen);
  const selectedTemplate = useSelector(selectSelectedTemplate);

  const handleClose = () => {
    dispatch(setIsTemplateModalOpen(false));
  };

  const handleTemplateSelect = (templateId: string) => {
    dispatch(setSelectedTemplate(templateId));
    dispatch(setIsTemplateModalOpen(false));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Grid de plantillas */}
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {POSTER_TEMPLATES.map((template: { id: string; name: string; description: string }) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`p-4 rounded-lg border transition-all text-left
                    ${selectedTemplate === template.id 
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