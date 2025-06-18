import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutTemplate } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';


import { selectIsTemplateModalOpen, selectSelectedTemplate, setIsTemplateModalOpen, setSelectedTemplate } from '@/store/features/poster/posterSlice';
import { AppDispatch } from '@/store';
import { POSTER_TEMPLATES } from '@/constants/templates';

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-auto p-2 xs:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-xs xs:max-w-sm sm:max-w-lg lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-auto">
              {/* Header */}
              <div className="p-3 xs:p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-800 truncate">Seleccionar Plantilla</h2>
                <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 p-1 ml-2 flex-shrink-0">
                  <X className="w-4 h-4 xs:w-5 xs:h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-3 xs:p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 max-h-[50vh] xs:max-h-[60vh] overflow-y-auto p-1">
                  {POSTER_TEMPLATES.map((template: { id: string; name: string; description: string }) => (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-3 xs:p-4 rounded-lg border transition-all text-left
                        ${selectedTemplate === template.id 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-2 xs:gap-3 mb-1 xs:mb-2">
                        <div className="p-1.5 xs:p-2 bg-indigo-100 rounded-lg">
                          <LayoutTemplate className="w-4 h-4 xs:w-5 xs:h-5 text-indigo-600" />
                        </div>
                        <h3 className="text-sm xs:text-base font-medium text-gray-900 truncate">{template.name}</h3>
                      </div>
                      <p className="text-xs xs:text-sm text-gray-500 line-clamp-2">{template.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 