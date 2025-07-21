// =====================================
// FAVORITES SECTION - ComponentsPanel
// =====================================

import React from 'react';
import { Star } from 'lucide-react';
import { FavoritesSectionProps } from './types';
import { ComponentItem } from './ComponentItem';

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  favorites,
  filteredComponents,
  viewMode,
  hoveredComponent,
  onDragStart,
  onToggleFavorite,
  onMouseEnter,
  onMouseLeave
}) => {
  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
        <Star className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" />
        Favoritos
      </h3>
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 gap-2' : 'gap-2'}`}>
        {favorites.slice(0, 4).map(favoriteType => {
          const component = filteredComponents.find(c => c.type === favoriteType);
          if (!component) return null;
          
          const isFavorite = favorites.includes(component.type);
          const isHovered = hoveredComponent === component.type;
          
          return (
            <ComponentItem
              key={component.type}
              component={component}
              viewMode={viewMode}
              isFavorite={isFavorite}
              isHovered={isHovered}
              onDragStart={onDragStart}
              onMouseEnter={() => onMouseEnter(component.type)}
              onMouseLeave={onMouseLeave}
              onToggleFavorite={onToggleFavorite}
            />
          );
        })}
      </div>
      {favorites.length > 4 && (
        <p className="text-xs text-gray-500 mt-2">
          +{favorites.length - 4} más en favoritos
        </p>
      )}
    </div>
  );
}; 