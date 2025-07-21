// =====================================
// TEMPLATE FILTERS - BuilderV3
// =====================================

import React from 'react';
import { Search, Filter, Grid, List, Plus } from 'lucide-react';
import { TemplateFiltersProps } from './types';

export const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onTemplateCreate
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Búsqueda */}
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtros y controles */}
        <div className="flex items-center space-x-4">
          {/* Filtro de categoría */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label} ({category.count})
                </option>
              ))}
            </select>
          </div>

          {/* Ordenamiento */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="updated">Más recientes</option>
            <option value="name">Nombre A-Z</option>
            <option value="created">Fecha de creación</option>
            <option value="usage">Más usadas</option>
          </select>

          {/* Vista */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
              title="Vista de cuadrícula"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
              title="Vista de lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Nuevo template - CTA principal */}
          <button
            onClick={onTemplateCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Plantilla</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 