import React from 'react';
import { motion } from 'framer-motion';
import { PosterTemplateData } from '../../../../../../services/posterTemplateService';
import { CheckCircle } from 'lucide-react';
import { ImageWithFallback } from '../../../../../builderV3/components/TemplateLibrary/ImageWithFallback';

interface TemplateGridProps {
  templates: PosterTemplateData[];
  selectedTemplate: PosterTemplateData | null;
  onTemplateSelect: (template: PosterTemplateData) => void;
  isLoading: boolean;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg">Cargando plantillas...</p>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">No hay plantillas disponibles</p>
          <p className="text-sm mt-2">Prueba seleccionando otra familia o ajustando los filtros.</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="p-4 sm:p-6 h-full w-full overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {templates.map((template) => (
          <motion.div
            variants={itemVariants}
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className={`cursor-pointer group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
              selectedTemplate?.id === template.id
                ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                : 'border-gray-200 hover:border-blue-400'
            }`}
          >
            <div className="relative aspect-w-4 aspect-h-3 overflow-hidden">
              {/* 🖼️ THUMBNAIL MEJORADO - Reutilizando componente de BuilderV3 */}
              <div className="group-hover:scale-105 transition-transform duration-300">
                <ImageWithFallback
                  template={template.template}
                  aspectRatio="card"
                  size="medium"
                  className="w-full h-full rounded-none"
                  lazy={true}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {selectedTemplate?.id === template.id && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-12 h-12 text-white opacity-90" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 truncate" title={template.name}>
                {template.name}
              </h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}; 