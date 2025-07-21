// =====================================
// TEMPLATE CARD - BuilderV3
// =====================================

import React from 'react';
import { Star, Clock, Eye, Copy, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { TemplateCardProps } from './types';
import { BuilderTemplateRenderer } from '../../../posters/components/Posters/Editor/Renderers/BuilderTemplateRenderer';

export const TemplateCard: React.FC<TemplateCardProps> = ({
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
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer overflow-hidden"
      onClick={() => onTemplateClick(template)}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {template.thumbnail ? (
          <img 
            src={template.thumbnail} 
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-200">
            {/* Marco tipo tablet con sombra */}
            <div className="w-40 h-32 bg-gray-800 rounded-lg p-2 shadow-2xl transform rotate-1 group-hover:rotate-0 transition-transform duration-300">
              <div className="w-full h-full bg-white rounded-md overflow-hidden shadow-inner relative">
                {/* Indicador de encendido */}
                <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                
                {/* Vista previa de la plantilla */}
                <div className="w-full h-full bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                  <div 
                    className="absolute inset-0 scale-[0.8] origin-center flex items-center justify-center"
                    style={{ filter: 'brightness(0.9)' }}
                  >
                    <BuilderTemplateRenderer
                      template={template}
                      components={template.defaultComponents}
                      isPreview={true}
                      scale={0.15}
                    />
                  </div>
                  
                  {/* Overlay con información */}
                  <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-60 text-white text-center py-1 rounded text-[0.5rem] font-bold">
                    {template.name.substring(0, 12)}...
                  </div>
                </div>
              </div>
            </div>
            
            {/* Elementos decorativos */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full opacity-70 animate-pulse"></div>
            <div className="absolute bottom-3 right-3 w-1 h-1 bg-green-400 rounded-full opacity-80"></div>
          </div>
        )}
        
        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
            <button
              onClick={(e) => onTemplatePreview(template, e)}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-lg transition-colors"
              title="Vista previa"
            >
              <Eye className="w-4 h-4" />
            </button>
            {userRole === 'admin' && (
              <>
                <button
                  onClick={(e) => onTemplateDuplicate(template, e)}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-lg transition-colors"
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
                  className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white p-2 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex space-x-2">
          {family.featuredTemplates.includes(template.id) && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>Destacada</span>
            </div>
          )}
          {template.lastUsed && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Reciente</span>
            </div>
          )}
        </div>

        {/* Dimensiones */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {template.canvas.width} × {template.canvas.height}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  +{template.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metadatos */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            Actualizada {formatDate(template.updatedAt)}
          </div>
          <div className="flex items-center space-x-1">
            <span>{template.defaultComponents.length}</span>
            <span>elementos</span>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="mt-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
            <span>Usar plantilla</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}; 