// =====================================
// COMPONENTS PANEL STATE HOOK - BuilderV3
// =====================================

import { useState, useMemo, useCallback } from 'react';
import { ComponentsPanelV3Props, ComponentsPanelState, ComponentItem } from './types';
import { ComponentTypeV3, ComponentCategoryV3 } from '../../types';

interface UseComponentsPanelStateProps {
  componentsLibrary: ComponentsPanelV3Props['componentsLibrary'];
  searchTerm?: string;
  selectedCategory?: ComponentCategoryV3 | 'all' | 'favorites';
  favorites?: ComponentTypeV3[];
}

export const useComponentsPanelState = ({
  componentsLibrary,
  searchTerm: externalSearchTerm,
  selectedCategory: externalSelectedCategory,
  favorites: externalFavorites
}: UseComponentsPanelStateProps) => {
  
  // =====================
  // INTERNAL STATE
  // =====================
  
  const [state, setState] = useState<ComponentsPanelState>({
    viewMode: 'grid',
    expandedCategories: new Set(['Texto y Datos', 'Imágenes y Media']),
    hoveredComponent: null,
    internalSearchTerm: '',
    internalSelectedCategory: 'all',
    internalFavorites: []
  });

  // =====================
  // COMPUTED VALUES
  // =====================
  
  // Usar valores externos o internos
  const searchTerm = externalSearchTerm ?? state.internalSearchTerm;
  const selectedCategory = externalSelectedCategory ?? state.internalSelectedCategory;
  const favorites = externalFavorites ?? state.internalFavorites;

  // =====================
  // FILTERED COMPONENTS
  // =====================
  
  const filteredComponents = useMemo((): ComponentItem[] => {
    // Verificar que componentsLibrary esté definido
    if (!componentsLibrary || typeof componentsLibrary !== 'object') {
      return [];
    }

    const allComponents = Object.entries(componentsLibrary).flatMap(([category, components]) => {
      // Verificar que components sea un array
      if (!Array.isArray(components)) {
        return [];
      }
      
      return components
        .filter(comp => comp && typeof comp === 'object') // Filtrar valores null/undefined
        .map(comp => ({ ...comp, category: category as ComponentCategoryV3 }));
    });

    return allComponents.filter(component => {
      // Ensure component has required properties with safe checks
      if (!component || 
          !component.name || 
          typeof component.name !== 'string' || 
          !component.description || 
          typeof component.description !== 'string' || 
          !Array.isArray(component.tags)) {
        return false;
      }

      // Filter by search term with safe toLowerCase calls
      const matchesSearch = !searchTerm || searchTerm === '' || 
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.tags.some((tag: any) => 
          tag && 
          typeof tag === 'string' && 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Filter by category and favorites
      let matchesCategory = true;
      
      if (selectedCategory === 'favorites') {
        matchesCategory = favorites.includes(component.type);
      } else if (selectedCategory !== 'all') {
        matchesCategory = component.category === selectedCategory;
      }

      return matchesSearch && matchesCategory;
    });
  }, [componentsLibrary, searchTerm, selectedCategory, favorites]);

  // =====================
  // COMPONENTS BY CATEGORY
  // =====================
  
  const componentsByCategory = useMemo(() => {
    return filteredComponents.reduce((acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = [];
      }
      acc[component.category].push(component);
      return acc;
    }, {} as Record<ComponentCategoryV3, ComponentItem[]>);
  }, [filteredComponents]);

  // =====================
  // STATE UPDATERS
  // =====================
  
  const updateState = useCallback((updates: Partial<ComponentsPanelState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setViewMode = useCallback((viewMode: 'grid' | 'list') => {
    updateState({ viewMode });
  }, [updateState]);

  const setHoveredComponent = useCallback((hoveredComponent: ComponentTypeV3 | null) => {
    updateState({ hoveredComponent });
  }, [updateState]);

  const setInternalSearchTerm = useCallback((internalSearchTerm: string) => {
    updateState({ internalSearchTerm });
  }, [updateState]);

  const setInternalSelectedCategory = useCallback((internalSelectedCategory: ComponentCategoryV3 | 'all' | 'favorites') => {
    updateState({ internalSelectedCategory });
  }, [updateState]);

  const setInternalFavorites = useCallback((internalFavorites: ComponentTypeV3[]) => {
    updateState({ internalFavorites });
  }, [updateState]);

  const toggleCategory = useCallback((category: ComponentCategoryV3) => {
    setState(prev => {
      const newExpandedCategories = new Set(prev.expandedCategories);
      if (newExpandedCategories.has(category)) {
        newExpandedCategories.delete(category);
      } else {
        newExpandedCategories.add(category);
      }
      return {
        ...prev,
        expandedCategories: newExpandedCategories
      };
    });
  }, []);

  const toggleInternalFavorite = useCallback((componentType: ComponentTypeV3) => {
    setState(prev => {
      const newFavorites = prev.internalFavorites.includes(componentType)
        ? prev.internalFavorites.filter(type => type !== componentType)
        : [...prev.internalFavorites, componentType];
      
      return {
        ...prev,
        internalFavorites: newFavorites
      };
    });
  }, []);

  return {
    // State
    state,
    
    // Computed values
    searchTerm,
    selectedCategory,
    favorites,
    filteredComponents,
    componentsByCategory,
    
    // State updaters
    setViewMode,
    setHoveredComponent,
    setInternalSearchTerm,
    setInternalSelectedCategory,
    setInternalFavorites,
    toggleCategory,
    toggleInternalFavorite
  };
}; 