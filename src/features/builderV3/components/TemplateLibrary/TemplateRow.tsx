// =====================================
// TEMPLATE ROW - BuilderV3 REDESIGNED
// =====================================

import React, { useState } from 'react';
import { Star, Eye, Copy, Trash2, ArrowRight, Loader2, Calendar, Layers, Sparkles } from 'lucide-react';
import { TemplateRowProps } from './types';
import { ImageWithFallback } from './ImageWithFallback';

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
  const [isHovered, setIsHovered] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isFeatured = family.featuredTemplates.includes(template.id);
  const isRecent = template.lastUsed && 
    (new Date().getTime() - template.lastUsed.getTime()) < 7 * 24 * 60 * 60 * 1000; // 7 días

  return (
    <div
      className={`
        group relative bg-white border border-gray-200/80 hover:bg-gray-50/50
        hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5
        transition-all duration-200 cursor-pointer rounded-xl overflow-hidden
        ${isHovered ? 'ring-2 ring-blue-500/10' : ''}
      `}
      onClick={() => onTemplateClick(template)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 flex items-center space-x-4">
        {/* Thumbnail optimizado */}
        <div className="flex-shrink-0">
          <ImageWithFallback
            template={template}
            size="small"
            aspectRatio="card"
            lazy={true}
            className="w-16 h-12 rounded-lg shadow-sm border border-gray-200"
          />
        </div>

        {/* Información principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Título con badges inline */}
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {template.name}
                </h3>
                
                {/* Badges compactos */}
                {isFeatured && (
                  <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    <Star className="w-3 h-3 fill-current mr-1" />
                    <span>Destacada</span>
                  </div>
                )}
                {isRecent && (
                  <div className="inline-flex items-center bg-gradient-to-r from-green-400 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    <Sparkles className="w-3 h-3 mr-1" />
                    <span>Reciente</span>
                  </div>
                )}
              </div>
              
              {/* Descripción */}
              <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                {template.description || 'Plantilla sin descripción'}
              </p>
              
              {/* Tags compactos */}
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {template.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag}
                      className="inline-flex items-center bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Metadatos con iconos */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(template.updatedAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Layers className="w-3 h-3" />
                  <span>{template.defaultComponents.length} elementos</span>
                </div>
              </div>
            </div>

            {/* Panel derecho con dimensiones y acciones */}
            <div className="flex items-center space-x-4">
              {/* Dimensiones */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {template.canvas.width} × {template.canvas.height}
                </div>
                <div className="text-xs text-gray-500">
                  pixels
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTemplatePreview(template, e);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Vista previa"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                {userRole === 'admin' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateDuplicate(template, e);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateDelete(template, e);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                
                {/* Indicador de acción principal */}
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 