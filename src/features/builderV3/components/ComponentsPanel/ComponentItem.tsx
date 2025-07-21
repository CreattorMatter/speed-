// =====================================
// COMPONENT ITEM - ComponentsPanel
// =====================================

import React from 'react';
import { Star, StarOff } from 'lucide-react';
import { ComponentItemProps } from './types';
import { getComponentIcon } from './categoryConfig';

export const ComponentItem: React.FC<ComponentItemProps> = ({
  component,
  viewMode,
  isFavorite,
  isHovered,
  onDragStart,
  onMouseEnter,
  onMouseLeave,
  onToggleFavorite
}) => {
  // Safety checks for component properties
  const componentName = component?.name || 'Unnamed Component';
  const componentDescription = component?.description || 'No description available';
  const componentTags = Array.isArray(component?.tags) ? component.tags : [];
  const componentType = component?.type || 'unknown';

  if (viewMode === 'grid') {
    return (
      <div
        className={`
          relative group bg-white rounded-lg border-2 border-gray-200 
          hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-grab
          ${isHovered ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        `}
        draggable
        onDragStart={(e) => onDragStart(e, componentType)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Component Preview */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{getComponentIcon(componentType)}</span>
            <button
              onClick={(e) => onToggleFavorite(e, componentType)}
              className={`p-1 rounded transition-colors ${
                isFavorite 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {isFavorite ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
            </button>
          </div>
          
          <h4 className="font-medium text-sm text-gray-900 mb-1 leading-tight">
            {componentName}
          </h4>
          
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {componentDescription}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {componentTags.slice(0, 2).map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {componentTags.length > 2 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{componentTags.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
              Arrastrar al canvas
            </span>
          </div>
        )}

        {/* Pro Badge */}
        {component?.isProOnly && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded">
            PRO
          </div>
        )}
      </div>
    );
  } else {
    // List view
    return (
      <div
        className={`
          flex items-center p-3 bg-white rounded-lg border border-gray-200 
          hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-grab
          ${isHovered ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        `}
        draggable
        onDragStart={(e) => onDragStart(e, componentType)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <span className="text-xl mr-3">{getComponentIcon(componentType)}</span>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {componentName}
            </h4>
            <div className="flex items-center space-x-1 ml-2">
              {component?.isProOnly && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded">
                  PRO
                </span>
              )}
              <button
                onClick={(e) => onToggleFavorite(e, componentType)}
                className={`p-1 rounded transition-colors ${
                  isFavorite 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isFavorite ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 truncate">
            {componentDescription}
          </p>
          
          <div className="flex flex-wrap gap-1 mt-1">
            {componentTags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {componentTags.length > 3 && (
              <span className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                +{componentTags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}; 