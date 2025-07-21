// =====================================
// SEARCH BAR - ComponentsPanel
// =====================================

import React from 'react';
import { Search } from 'lucide-react';
import { SearchBarProps } from './types';

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Buscar componentes..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  );
}; 