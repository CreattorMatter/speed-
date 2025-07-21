// =====================================
// CATEGORY FILTER - ComponentsPanel
// =====================================

import React from 'react';
import { Filter } from 'lucide-react';
import { CategoryFilterProps } from './types';

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  categoryConfig
}) => {
  return (
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value as any)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
      >
        <option value="all">Todas las categorías</option>
        <option value="favorites">Favoritos</option>
        {Object.keys(categoryConfig).map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}; 