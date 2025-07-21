// =====================================
// TEMPLATE GRID - BuilderV3
// =====================================

import React from 'react';
import { Edit, Plus } from 'lucide-react';
import { TemplateGridProps } from './types';
import { TemplateCard } from './TemplateCard';

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  onTemplateClick,
  onTemplatePreview,
  onTemplateDuplicate,
  onTemplateDelete,
  family,
  userRole,
  isDuplicating
}) => {
  
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Edit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron plantillas
          </h3>
          <p className="text-gray-500 mb-6">
            Intenta con diferentes términos de búsqueda o crea una nueva plantilla.
          </p>
          <button
            onClick={() => onTemplateClick({ id: 'new' } as any)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Nueva Plantilla</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          family={family}
          onTemplateClick={onTemplateClick}
          onTemplatePreview={onTemplatePreview}
          onTemplateDuplicate={onTemplateDuplicate}
          onTemplateDelete={onTemplateDelete}
          userRole={userRole}
          isDuplicating={isDuplicating}
        />
      ))}
    </div>
  );
}; 