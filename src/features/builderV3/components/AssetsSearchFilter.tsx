// =====================================
// ASSETS SEARCH & FILTER - BuilderV3
// =====================================

import React from 'react';
import { Search } from 'lucide-react';

interface AssetsSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  className?: string;
}

export const AssetsSearchFilter: React.FC<AssetsSearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
  className = ''
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar assets..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {searchTerm && (
        <button
          onClick={handleSearchClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          title="Limpiar búsqueda"
        >
          ×
        </button>
      )}
    </div>
  );
}; 