// =====================================
// COMPONENTS PANEL TYPES - BuilderV3
// =====================================

import { ComponentTypeV3, ComponentCategoryV3, ComponentsLibraryV3 } from '../../types';

export interface ComponentsPanelV3Props {
  componentsLibrary: ComponentsLibraryV3;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  selectedCategory?: ComponentCategoryV3 | 'all' | 'favorites';
  onCategoryChange?: (category: ComponentCategoryV3 | 'all' | 'favorites') => void;
  onComponentDragStart: (componentType: ComponentTypeV3) => void;
  favorites?: ComponentTypeV3[];
  onToggleFavorite?: (componentType: ComponentTypeV3) => void;
}

export interface ComponentsPanelState {
  viewMode: 'grid' | 'list';
  expandedCategories: Set<ComponentCategoryV3>;
  hoveredComponent: ComponentTypeV3 | null;
  internalSearchTerm: string;
  internalSelectedCategory: ComponentCategoryV3 | 'all' | 'favorites';
  internalFavorites: ComponentTypeV3[];
}

export interface ComponentItem {
  type: ComponentTypeV3;
  name: string;
  description: string;
  tags: string[];
  category: ComponentCategoryV3;
  isProOnly?: boolean;
}

export interface CategoryConfig {
  icon: any;
  color: string;
  borderColor: string;
}

export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export interface CategoryFilterProps {
  selectedCategory: ComponentCategoryV3 | 'all' | 'favorites';
  onCategoryChange: (category: ComponentCategoryV3 | 'all' | 'favorites') => void;
  categoryConfig: Record<ComponentCategoryV3, CategoryConfig>;
}

export interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export interface ComponentItemProps {
  component: ComponentItem;
  viewMode: 'grid' | 'list';
  isFavorite: boolean;
  isHovered: boolean;
  onDragStart: (e: React.DragEvent, componentType: ComponentTypeV3) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggleFavorite: (e: React.MouseEvent, componentType: ComponentTypeV3) => void;
}

export interface CategoryHeaderProps {
  category: ComponentCategoryV3;
  categoryConfig: CategoryConfig;
  componentsCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export interface ComponentsListProps {
  componentsByCategory: Record<ComponentCategoryV3, ComponentItem[]>;
  viewMode: 'grid' | 'list';
  expandedCategories: Set<ComponentCategoryV3>;
  hoveredComponent: ComponentTypeV3 | null;
  favorites: ComponentTypeV3[];
  categoryConfig: Record<ComponentCategoryV3, CategoryConfig>;
  onDragStart: (e: React.DragEvent, componentType: ComponentTypeV3) => void;
  onToggleCategory: (category: ComponentCategoryV3) => void;
  onToggleFavorite: (e: React.MouseEvent, componentType: ComponentTypeV3) => void;
  onMouseEnter: (componentType: ComponentTypeV3) => void;
  onMouseLeave: () => void;
}

export interface FavoritesSectionProps {
  favorites: ComponentTypeV3[];
  filteredComponents: ComponentItem[];
  viewMode: 'grid' | 'list';
  hoveredComponent: ComponentTypeV3 | null;
  onDragStart: (e: React.DragEvent, componentType: ComponentTypeV3) => void;
  onToggleFavorite: (e: React.MouseEvent, componentType: ComponentTypeV3) => void;
  onMouseEnter: (componentType: ComponentTypeV3) => void;
  onMouseLeave: () => void;
}

export interface ComponentsPanelActions {
  handleSearchChange: (term: string) => void;
  handleCategoryChange: (category: ComponentCategoryV3 | 'all' | 'favorites') => void;
  handleToggleFavorite: (componentType: ComponentTypeV3) => void;
  handleDragStart: (e: React.DragEvent, componentType: ComponentTypeV3) => void;
  toggleCategory: (category: ComponentCategoryV3) => void;
  handleFavoriteToggle: (e: React.MouseEvent, componentType: ComponentTypeV3) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setHoveredComponent: (component: ComponentTypeV3 | null) => void;
} 