// =====================================
// COMPONENTS LIST - ComponentsPanel
// =====================================

import React from 'react';
import { Search } from 'lucide-react';
import { ComponentsListProps } from './types';
import { CategoryHeader } from './CategoryHeader';
import { ComponentItem } from './ComponentItem';

export const ComponentsList: React.FC<ComponentsListProps> = ({
  componentsByCategory,
  viewMode,
  expandedCategories,
  hoveredComponent,
  favorites,
  categoryConfig,
  onDragStart,
  onToggleCategory,
  onToggleFavorite,
  onMouseEnter,
  onMouseLeave
}) => {
  
  if (Object.entries(componentsByCategory).length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-sm">No se encontraron componentes</p>
        <p className="text-xs mt-1">Intenta cambiar el término de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {Object.entries(componentsByCategory).map(([category, components]) => {
        const categoryKey = category as keyof typeof categoryConfig;
        const categoryInfo = categoryConfig[categoryKey];
        const isExpanded = expandedCategories.has(categoryKey);

        return (
          <div key={category} className="space-y-2">
            {/* Category Header */}
            <CategoryHeader
              category={categoryKey}
              categoryConfig={categoryInfo}
              componentsCount={components.length}
              isExpanded={isExpanded}
              onToggle={() => onToggleCategory(categoryKey)}
            />

            {/* Components Grid/List */}
            {isExpanded && (
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-2 gap-3' 
                  : 'space-y-2'
                }
              `}>
                {components.map(component => {
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
            )}
          </div>
        );
      })}
    </div>
  );
}; 