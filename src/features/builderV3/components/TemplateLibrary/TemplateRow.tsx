// =====================================
// TEMPLATE ROW - BuilderV3
// =====================================

import React from 'react';
import { Star, Eye, Copy, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { TemplateRowProps } from './types';
import { BuilderTemplateRenderer } from '../../../posters/components/Posters/Editor/Renderers/BuilderTemplateRenderer';

export const TemplateRow: React.FC<TemplateRowProps> = ({
  template,
  family,
  onTemplateClick,
  onTemplatePreview,
  onTemplateDuplicate,
  onTemplateDelete,
  userRole,
  isDuplicating
}) => {
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div
      className="bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onTemplateClick(template)}
    >
      <div className="p-4 flex items-center space-x-4">
        {/* Thumbnail pequeño */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {template.thumbnail ? (
            <img 
              src={template.thumbnail} 
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
              {/* Marco tipo smartphone pequeño */}
              <div className="w-8 h-10 bg-gray-800 rounded-md p-0.5 shadow-lg">
                <div className="w-full h-full bg-white rounded-sm overflow-hidden relative">
                  {/* Vista previa mini */}
                  <div className="w-full h-full bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center">
                    <div 
                      className="scale-[0.3] origin-center"
                      style={{ filter: 'brightness(0.8)' }}
                    >
                      <BuilderTemplateRenderer
                        template={template}
                        components={template.defaultComponents}
                        isPreview={true}
                        scale={0.08}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-1">{template.description}</p>
              
              {/* Tags en línea */}
              {template.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.tags.slice(0, 2).map(tag => (
                    <span 
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right text-sm text-gray-500">
              <div>{template.canvas.width} × {template.canvas.height}</div>
              <div className="mt-1">{formatDate(template.updatedAt)}</div>
              <div className="mt-1">{template.defaultComponents.length} elementos</div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          {family.featuredTemplates.includes(template.id) && (
            <Star className="w-4 h-4 text-yellow-500" />
          )}
          
          <button
            onClick={(e) => onTemplatePreview(template, e)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Vista previa"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {userRole === 'admin' && (
            <>
              <button
                onClick={(e) => onTemplateDuplicate(template, e)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Duplicar"
                disabled={isDuplicating}
              >
                {isDuplicating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={(e) => onTemplateDelete(template, e)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}; 