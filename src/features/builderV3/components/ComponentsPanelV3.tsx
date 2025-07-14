// =====================================
// COMPONENTS PANEL V3 - ENHANCED COMPONENT
// =====================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Grid,
  List,
  Filter,
  Star,
  StarOff,
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  Zap,
  Type,
  Image,
  DollarSign,
  Calendar,
  Shapes,
  Box,
  QrCode,
  Hash,
  Package
} from 'lucide-react';
import { ComponentTypeV3, ComponentCategoryV3, ComponentsLibraryV3 } from '../types';

interface ComponentsPanelV3Props {
  componentsLibrary: ComponentsLibraryV3;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  selectedCategory?: ComponentCategoryV3 | 'all' | 'favorites';
  onCategoryChange?: (category: ComponentCategoryV3 | 'all' | 'favorites') => void;
  onComponentDragStart: (componentType: ComponentTypeV3) => void;
  favorites?: ComponentTypeV3[];
  onToggleFavorite?: (componentType: ComponentTypeV3) => void;
}

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
  // Estado interno cuando no se proporcionan props externas
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<ComponentCategoryV3 | 'all' | 'favorites'>('all');
  const [internalFavorites, setInternalFavorites] = useState<ComponentTypeV3[]>([]);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCategories, setExpandedCategories] = useState<Set<ComponentCategoryV3>>(
    new Set(['Texto y Datos', 'Imagen de Header', 'Imagen de Footer', 'Imagen de Fondo', 'Imágenes y Media'])
  );
  const [hoveredComponent, setHoveredComponent] = useState<ComponentTypeV3| null>(null);

  // Usar valores externos o internos
  const searchTerm = externalSearchTerm ?? internalSearchTerm;
  const selectedCategory = externalSelectedCategory ?? internalSelectedCategory;
  const favorites = externalFavorites ?? internalFavorites;

  // Funciones de manejo
  const handleSearchChange = useCallback((term: string) => {
    if (onSearchChange) {
      onSearchChange(term);
    } else {
      setInternalSearchTerm(term);
    }
  }, [onSearchChange]);

  const handleCategoryChange = useCallback((category: ComponentCategoryV3 | 'all' | 'favorites') => {
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      setInternalSelectedCategory(category);
    }
  }, [onCategoryChange]);

  const handleToggleFavorite = useCallback((componentType: ComponentTypeV3) => {
    if (onToggleFavorite) {
      onToggleFavorite(componentType);
    } else {
      setInternalFavorites(prev => {
        if (prev.includes(componentType)) {
          return prev.filter(type => type !== componentType);
        } else {
          return [...prev, componentType];
        }
      });
    }
  }, [onToggleFavorite]);

  // =====================
  // CATEGORY CONFIGURATION ACTUALIZADA
  // =====================

  const categoryConfig = {
    'Texto y Datos': {
      icon: Type,
      color: 'bg-blue-100 text-blue-800',
      borderColor: 'border-blue-200'
    },
    'Imagen de Header': {
      icon: Image,
      color: 'bg-purple-100 text-purple-800',
      borderColor: 'border-purple-200'
    },
    'Imagen de Footer': {
      icon: Image,
      color: 'bg-indigo-100 text-indigo-800',
      borderColor: 'border-indigo-200'
    },
    'Imagen de Fondo': {
      icon: Image,
      color: 'bg-violet-100 text-violet-800',
      borderColor: 'border-violet-200'
    },
    'Imágenes y Media': {
      icon: Image,
      color: 'bg-pink-100 text-pink-800',
      borderColor: 'border-pink-200'
    },
    'QR y Enlaces': {
      icon: QrCode,
      color: 'bg-cyan-100 text-cyan-800',
      borderColor: 'border-cyan-200'
    },
    'Fechas y Períodos': {
      icon: Calendar,
      color: 'bg-orange-100 text-orange-800',
      borderColor: 'border-orange-200'
    },
    'Elementos Decorativos': {
      icon: Shapes,
      color: 'bg-teal-100 text-teal-800',
      borderColor: 'border-teal-200'
    },
    'Contenedores y Layout': {
      icon: Box,
      color: 'bg-gray-100 text-gray-800',
      borderColor: 'border-gray-200'
    }
  };

  // =====================
  // FILTERED COMPONENTS
  // =====================

  const filteredComponents = useMemo(() => {
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

  // Group filtered components by category
  const componentsByCategory = useMemo(() => {
    return filteredComponents.reduce((acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = [];
      }
      acc[component.category].push(component);
      return acc;
    }, {} as Record<ComponentCategoryV3, typeof filteredComponents>);
  }, [filteredComponents]);

  // =====================
  // EVENT HANDLERS
  // =====================

  const handleDragStart = useCallback((e: React.DragEvent, componentType: ComponentTypeV3) => {
    e.dataTransfer.setData('application/component-type', componentType);
    e.dataTransfer.effectAllowed = 'copy';
    onComponentDragStart(componentType);
  }, [onComponentDragStart]);

  const toggleCategory = useCallback((category: ComponentCategoryV3) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const handleFavoriteToggle = useCallback((e: React.MouseEvent, componentType: ComponentTypeV3) => {
    e.stopPropagation();
    e.preventDefault();
    handleToggleFavorite(componentType);
  }, [handleToggleFavorite]);

  // =====================
  // COMPONENT ICONS ACTUALIZADOS
  // =====================

  const getComponentIcon = (componentType: ComponentTypeV3): string => {
    if (componentType.includes('text') || componentType.includes('field-product')) return '📝';
    if (componentType.includes('price') || componentType.includes('discount')) return '💰';
    if (componentType === 'image-header') return '🏷️';
    if (componentType === 'image-footer') return '📋';
    if (componentType === 'image-background') return '🖼️';
    if (componentType.includes('image')) return '🖼️';
    if (componentType.includes('qr')) return '📱';
    if (componentType.includes('date')) return '📅';
    if (componentType.includes('financing') || componentType.includes('installment')) return '💳';
    if (componentType.includes('shape')) return '⬜';
    if (componentType.includes('container')) return '📦';
    return '🧩';
  };

  // =====================
  // RENDER COMPONENT ITEM
  // =====================

  const renderComponentItem = (component: any) => {
    // Safety checks for component properties
    const componentName = component?.name || 'Unnamed Component';
    const componentDescription = component?.description || 'No description available';
    const componentTags = Array.isArray(component?.tags) ? component.tags : [];
    const componentType = component?.type || 'unknown';
    
    const isFavorite = favorites.includes(componentType);
    const isHovered = hoveredComponent === componentType;

    if (viewMode === 'grid') {
      return (
        <div
          key={componentType}
          className={`
            relative group bg-white rounded-lg border-2 border-gray-200 
            hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-grab
            ${isHovered ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          `}
          draggable
          onDragStart={(e) => handleDragStart(e, componentType)}
          onMouseEnter={() => setHoveredComponent(componentType)}
          onMouseLeave={() => setHoveredComponent(null)}
        >
          {/* Component Preview */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{getComponentIcon(componentType)}</span>
              <button
                onClick={(e) => handleFavoriteToggle(e, componentType)}
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
      return (
        <div
          key={componentType}
          className={`
            flex items-center p-3 bg-white rounded-lg border border-gray-200 
            hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-grab
            ${isHovered ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          `}
          draggable
          onDragStart={(e) => handleDragStart(e, componentType)}
          onMouseEnter={() => setHoveredComponent(componentType)}
          onMouseLeave={() => setHoveredComponent(null)}
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
                  onClick={(e) => handleFavoriteToggle(e, componentType)}
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

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Grid className="w-5 h-5 mr-2 text-blue-600" />
            Componentes
          </h2>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Vista de grilla"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Vista de lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Enhanced Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar componentes..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value as ComponentCategoryV3 | 'all')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
          >
            <option value="all">Todas las categorías</option>
            {Object.keys(categoryConfig).map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
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
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Star className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" />
            Favoritos
          </h3>
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 gap-2' : 'gap-2'}`}>
            {favorites.slice(0, 4).map(favoriteType => {
              const component = filteredComponents.find(c => c.type === favoriteType);
              return component ? renderComponentItem(component) : null;
            })}
          </div>
          {favorites.length > 4 && (
            <p className="text-xs text-gray-500 mt-2">
              +{favorites.length - 4} más en favoritos
            </p>
          )}
        </div>
      )}

      {/* Components List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(componentsByCategory).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No se encontraron componentes</p>
            <p className="text-xs mt-1">Intenta cambiar el término de búsqueda</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {Object.entries(componentsByCategory).map(([category, components]) => {
              const categoryInfo = categoryConfig[category as ComponentCategoryV3];
              const isExpanded = expandedCategories.has(category as ComponentCategoryV3);
              const IconComponent = categoryInfo.icon;

              return (
                <div key={category} className="space-y-2">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category as ComponentCategoryV3)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all
                      ${categoryInfo.borderColor} ${categoryInfo.color}
                      hover:shadow-md
                    `}
                  >
                    <div className="flex items-center">
                      <IconComponent className="w-4 h-4 mr-2" />
                      <span className="font-medium text-sm">{category}</span>
                      <span className="ml-2 bg-white bg-opacity-70 px-2 py-1 rounded text-xs">
                        {components.length}
                      </span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {/* Components Grid/List */}
                  {isExpanded && (
                    <div className={`
                      ${viewMode === 'grid' 
                        ? 'grid grid-cols-2 gap-3' 
                        : 'space-y-2'
                      }
                    `}>
                      {components.map(renderComponentItem)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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