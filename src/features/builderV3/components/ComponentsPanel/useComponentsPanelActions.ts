// =====================================
// COMPONENTS PANEL ACTIONS HOOK - BuilderV3
// =====================================

import { useCallback } from 'react';
import { ComponentsPanelV3Props, ComponentsPanelActions } from './types';
import { ComponentTypeV3, ComponentCategoryV3 } from '../../types';

interface UseComponentsPanelActionsProps {
  // External handlers
  onSearchChange?: ComponentsPanelV3Props['onSearchChange'];
  onCategoryChange?: ComponentsPanelV3Props['onCategoryChange'];
  onToggleFavorite?: ComponentsPanelV3Props['onToggleFavorite'];
  onComponentDragStart: ComponentsPanelV3Props['onComponentDragStart'];
  
  // Internal setters
  setInternalSearchTerm: (term: string) => void;
  setInternalSelectedCategory: (category: ComponentCategoryV3 | 'all' | 'favorites') => void;
  toggleInternalFavorite: (componentType: ComponentTypeV3) => void;
  toggleCategory: (category: ComponentCategoryV3) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setHoveredComponent: (component: ComponentTypeV3 | null) => void;
}

export const useComponentsPanelActions = ({
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
}: UseComponentsPanelActionsProps): ComponentsPanelActions => {

  // =====================
  // SEARCH HANDLING
  // =====================
  
  const handleSearchChange = useCallback((term: string) => {
    if (onSearchChange) {
      onSearchChange(term);
    } else {
      setInternalSearchTerm(term);
    }
  }, [onSearchChange, setInternalSearchTerm]);

  // =====================
  // CATEGORY HANDLING
  // =====================
  
  const handleCategoryChange = useCallback((category: ComponentCategoryV3 | 'all' | 'favorites') => {
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      setInternalSelectedCategory(category);
    }
  }, [onCategoryChange, setInternalSelectedCategory]);

  // =====================
  // FAVORITES HANDLING
  // =====================
  
  const handleToggleFavorite = useCallback((componentType: ComponentTypeV3) => {
    if (onToggleFavorite) {
      onToggleFavorite(componentType);
    } else {
      toggleInternalFavorite(componentType);
    }
  }, [onToggleFavorite, toggleInternalFavorite]);

  const handleFavoriteToggle = useCallback((e: React.MouseEvent, componentType: ComponentTypeV3) => {
    e.stopPropagation();
    e.preventDefault();
    handleToggleFavorite(componentType);
  }, [handleToggleFavorite]);

  // =====================
  // DRAG & DROP HANDLING
  // =====================
  
  const handleDragStart = useCallback((e: React.DragEvent, componentType: ComponentTypeV3) => {
    e.dataTransfer.setData('application/component-type', componentType);
    e.dataTransfer.effectAllowed = 'copy';
    onComponentDragStart(componentType);
  }, [onComponentDragStart]);

  return {
    handleSearchChange,
    handleCategoryChange,
    handleToggleFavorite,
    handleDragStart,
    toggleCategory,
    handleFavoriteToggle,
    setViewMode,
    setHoveredComponent
  };
}; 