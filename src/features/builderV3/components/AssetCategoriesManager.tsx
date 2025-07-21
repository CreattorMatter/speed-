// =====================================
// ASSET CATEGORIES MANAGER - BuilderV3
// =====================================

import React, { useState } from 'react';
import { FolderPlus, Check, X } from 'lucide-react';

export interface AssetCategory {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface AssetCategoriesManagerProps {
  categories: AssetCategory[];
  setCategories: React.Dispatch<React.SetStateAction<AssetCategory[]>>;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  totalAssets: number;
}

export const AssetCategoriesManager: React.FC<AssetCategoriesManagerProps> = ({
  categories,
  setCategories,
  selectedCategory,
  setSelectedCategory,
  totalAssets
}) => {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // =====================
  // CATEGORY MANAGEMENT
  // =====================

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: AssetCategory = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
        name: newCategoryName.trim(),
        color: 'bg-indigo-100 text-indigo-800',
        count: 0
      };
      
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  const handleCancelNewCategory = () => {
    setShowNewCategory(false);
    setNewCategoryName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateCategory();
    } else if (e.key === 'Escape') {
      handleCancelNewCategory();
    }
  };

  return (
    <div className="p-3 border-b border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700">Categorías</span>
        <button
          onClick={() => setShowNewCategory(true)}
          className="text-xs text-blue-600 hover:text-blue-800"
          title="Crear nueva categoría"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-1">
        {/* Categoría "Todos" */}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`w-full text-left px-2 py-1 text-sm rounded ${
            selectedCategory === 'all' 
              ? 'bg-blue-100 text-blue-800' 
              : 'hover:bg-gray-100'
          }`}
        >
          Todos ({totalAssets})
        </button>
        
        {/* Categorías dinámicas */}
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`w-full text-left px-2 py-1 text-sm rounded flex items-center justify-between ${
              selectedCategory === category.id 
                ? 'bg-blue-100 text-blue-800' 
                : 'hover:bg-gray-100'
            }`}
          >
            <span>{category.name}</span>
            <span className={`text-xs px-1 py-0.5 rounded ${category.color}`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>
      
      {/* Formulario para nueva categoría */}
      {showNewCategory && (
        <div className="mt-2 p-2 border border-gray-200 rounded">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Nombre categoría"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <button
              onClick={handleCreateCategory}
              className="text-green-600 hover:text-green-800 p-1"
              title="Crear categoría"
              disabled={!newCategoryName.trim()}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelNewCategory}
              className="text-gray-600 hover:text-gray-800 p-1"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 