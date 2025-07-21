// =====================================
// COMPONENTS PANEL EXPORTS - BuilderV3
// =====================================

export { SearchBar } from './SearchBar';
export { CategoryFilter } from './CategoryFilter';
export { ViewToggle } from './ViewToggle';
export { ComponentItem } from './ComponentItem';
export { CategoryHeader } from './CategoryHeader';
export { FavoritesSection } from './FavoritesSection';
export { ComponentsList } from './ComponentsList';

export { useComponentsPanelState } from './useComponentsPanelState';
export { useComponentsPanelActions } from './useComponentsPanelActions';

export { categoryConfig, getComponentIcon } from './categoryConfig';

export type {
  ComponentsPanelV3Props,
  ComponentsPanelState,
  ComponentItem as ComponentItemType,
  CategoryConfig,
  SearchBarProps,
  CategoryFilterProps,
  ViewToggleProps,
  ComponentItemProps,
  CategoryHeaderProps,
  ComponentsListProps,
  FavoritesSectionProps,
  ComponentsPanelActions
} from './types'; 