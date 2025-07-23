// =====================================
// TEMPLATE CARD - BuilderV3 REDESIGNED
// =====================================

import React, { useState } from 'react';
import { Star, Clock, Eye, Copy, Trash2, ArrowRight, Loader2, Calendar, Layers, Sparkles } from 'lucide-react';
import { TemplateCardProps } from './types';
import { ImageWithFallback } from './ImageWithFallback';

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
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  
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
        group relative bg-white rounded-2xl shadow-sm border border-gray-200/80 
        hover:shadow-2xl hover:shadow-gray-500/10 hover:-translate-y-2 
        transition-all duration-300 cursor-pointer overflow-hidden
        ${isHovered ? 'ring-2 ring-blue-500/20 border-blue-200' : ''}
      `}
      onClick={() => onTemplateClick(template)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Borde gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
      
      {/* Header con badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex flex-wrap gap-2">
          {isFeatured && (
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg backdrop-blur-sm">
              <Star className="w-3 h-3 fill-current" />
              <span>Destacada</span>
            </div>
          )}
          {isRecent && (
            <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              <span>Reciente</span>
            </div>
          )}
        </div>
        
        {/* Dimensiones */}
        <div className="bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
          {template.canvas.width} × {template.canvas.height}
        </div>
      </div>

      {/* Thumbnail mejorado */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <ImageWithFallback
          template={template}
          size="large"
          aspectRatio="card"
          lazy={true}
          onLoad={() => setThumbnailLoaded(true)}
          className="group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay de acciones */}
        <div className={`
          absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent
          opacity-0 group-hover:opacity-100 transition-all duration-300
          flex items-center justify-center
        `}>
          <div className="flex space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTemplatePreview(template, e);
              }}
              className="bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 p-4 rounded-2xl transition-all duration-200 hover:scale-110 shadow-xl hover:shadow-blue-500/25 group/btn"
              title="Vista previa"
            >
              <Eye className="w-5 h-5 group-hover/btn:text-blue-600 transition-colors" />
            </button>
            
            {userRole === 'admin' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTemplateDuplicate(template, e);
                  }}
                  className="bg-white/95 backdrop-blur-sm hover:bg-white text-gray-700 p-4 rounded-2xl transition-all duration-200 hover:scale-110 shadow-xl hover:shadow-green-500/25 group/btn"
                  title="Duplicar"
                  disabled={isDuplicating}
                >
                  {isDuplicating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Copy className="w-5 h-5 group-hover/btn:text-green-600 transition-colors" />
                  )}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTemplateDelete(template, e);
                  }}
                  className="bg-red-500/95 backdrop-blur-sm hover:bg-red-500 text-white p-4 rounded-2xl transition-all duration-200 hover:scale-110 shadow-xl hover:shadow-red-500/25"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Título y descripción */}
        <div className="mb-5">
          <h3 className="font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors text-xl">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {template.description || 'Plantilla sin descripción disponible'}
          </p>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap gap-2">
              {template.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="inline-flex items-center bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                  +{template.tags.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metadatos con iconos */}
        <div className="space-y-3 mb-6 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-2.5 h-2.5 text-blue-600" />
            </div>
            <span>Actualizada {formatDate(template.updatedAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
              <Layers className="w-2.5 h-2.5 text-purple-600" />
            </div>
            <span>{template.defaultComponents.length} elementos</span>
          </div>
        </div>

        {/* Botón de acción principal */}
        <button 
          className={`
            w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 
            hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 
            text-white py-4 px-6 rounded-2xl font-bold text-sm
            transition-all duration-300 flex items-center justify-center space-x-3 
            shadow-lg hover:shadow-2xl hover:shadow-blue-500/25
            transform ${isHovered ? 'scale-105' : 'scale-100'}
            focus:outline-none focus:ring-4 focus:ring-blue-500/20
          `}
          onClick={(e) => {
            e.stopPropagation();
            onTemplateClick(template);
          }}
        >
          <span>Usar plantilla</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}; 