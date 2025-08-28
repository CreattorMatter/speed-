// =====================================
// COMPONENTS PANEL V3 - MODULARIZED COMPONENT
// =====================================

import React, { useEffect } from 'react';
import { Grid, Star } from 'lucide-react';
import {
  ComponentsPanelV3Props,
  SearchBar,
  CategoryFilter,
  ViewToggle,
  FavoritesSection,
  ComponentsList,
  useComponentsPanelState,
  useComponentsPanelActions,
  categoryConfig
} from './ComponentsPanel';

export const ComponentsPanelV3: React.FC<ComponentsPanelV3Props> = ({
  componentsLibrary,
  searchTerm: externalSearchTerm,
  onSearchChange,
  selectedCategory: externalSelectedCategory,
  onCategoryChange,
  onComponentDragStart,
  favorites: externalFavorites,
  onToggleFavorite
}) => {
  
  // =====================
  // STATE MANAGEMENT
  // =====================
  
  const {
    state,
    searchTerm,
    selectedCategory,
    favorites,
    filteredComponents,
    componentsByCategory,
    setViewMode,
    setHoveredComponent,
    setInternalSearchTerm,
    setInternalSelectedCategory,
    toggleCategory,
    toggleInternalFavorite
  } = useComponentsPanelState({
    componentsLibrary,
    searchTerm: externalSearchTerm,
    selectedCategory: externalSelectedCategory,
    favorites: externalFavorites
  });

  // =====================
  // ACTIONS
  // =====================
  
  const {
    handleSearchChange,
    handleCategoryChange,
    handleDragStart,
    handleFavoriteToggle
  } = useComponentsPanelActions({
    onSearchChange,
    onCategoryChange,
    onToggleFavorite,
    onComponentDragStart,
    setInternalSearchTerm,
    setInternalSelectedCategory,
    toggleInternalFavorite,
    toggleCategory,
    setViewMode,
    setHoveredComponent
  });

  // =====================
  // FAVORITES HANDLING
  // =====================
  
  // Inicializar favoritos desde props o localStorage
  useEffect(() => {
    if (favorites && favorites.length > 0) {
      // Si hay favoritos en props, úsalos
      state.setInternalFavorites(favorites);
    } else {
      // Si no, cargar desde localStorage
      const savedFavorites = localStorage.getItem('builderV3-component-favorites');
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);
          state.setInternalFavorites(parsed);
        } catch (error) {
          console.error('Error parsing saved favorites:', error);
        }
      }
    }
  }, [favorites, state]);

  // =====================
  // RENDER
  // =====================

  return (
    <div className="w-full bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Grid className="w-5 h-5 mr-2 text-blue-600" />
            Componentes
          </h2>
          
          <ViewToggle
            viewMode={state.viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Enhanced Search */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* Category Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          categoryConfig={categoryConfig}
        />
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-2 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {filteredComponents.length} componente{filteredComponents.length !== 1 ? 's' : ''}
          </span>
          {favorites.length > 0 && (
            <span className="flex items-center text-yellow-600">
              <Star size={14} className="mr-1" fill="currentColor" />
              {favorites.length} favorito{favorites.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && selectedCategory === 'all' && (
        <FavoritesSection
          favorites={favorites}
          filteredComponents={filteredComponents}
          viewMode={state.viewMode}
          hoveredComponent={state.hoveredComponent}
          onDragStart={handleDragStart}
          onToggleFavorite={handleFavoriteToggle}
          onMouseEnter={setHoveredComponent}
          onMouseLeave={() => setHoveredComponent(null)}
        />
      )}

      {/* Components List */}
      <div className="flex-1 overflow-y-auto">
        <ComponentsList
          componentsByCategory={componentsByCategory}
          viewMode={state.viewMode}
          expandedCategories={state.expandedCategories}
          hoveredComponent={state.hoveredComponent}
          favorites={favorites}
          categoryConfig={categoryConfig}
          onDragStart={handleDragStart}
          onToggleCategory={toggleCategory}
          onToggleFavorite={handleFavoriteToggle}
          onMouseEnter={setHoveredComponent}
          onMouseLeave={() => setHoveredComponent(null)}
        />
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>SPID Builder V3</span>
          <span>🚀 {Object.keys(componentsLibrary).length} categorías</span>
        </div>
      </div>
    </div>
  );
}; 