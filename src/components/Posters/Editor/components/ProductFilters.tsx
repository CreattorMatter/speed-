import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Tag,
  Package,
  Hash,
  DollarSign,
  Warehouse
} from 'lucide-react';
import { type FilterState } from '../hooks/useProductFilters';

interface ProductFiltersProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  activeFilters: FilterState;
  updateFilter: (key: keyof FilterState, value: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  categoriasUnicas: string[];
  subCategoriasUnicas: string[];
  onClearFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  globalFilter,
  setGlobalFilter,
  activeFilters,
  updateFilter,
  showAdvancedFilters,
  setShowAdvancedFilters,
  categoriasUnicas,
  subCategoriasUnicas,
  onClearFilters
}) => {
  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      {/* Búsqueda global y controles principales */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showAdvancedFilters 
                ? 'bg-indigo-500 text-white border-indigo-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Limpiar
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t border-gray-200"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Tag className="w-4 h-4 inline mr-1" />
                Descripción
              </label>
              <input
                type="text"
                value={activeFilters.descripcion}
                onChange={(e) => updateFilter('descripcion', e.target.value)}
                placeholder="Filtrar por descripción"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Package className="w-4 h-4 inline mr-1" />
                Categoría
              </label>
              <select
                value={activeFilters.categoria}
                onChange={(e) => updateFilter('categoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">Todas las categorías</option>
                {categoriasUnicas.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Hash className="w-4 h-4 inline mr-1" />
                Subcategoría
              </label>
              <select
                value={activeFilters.subCategoria}
                onChange={(e) => updateFilter('subCategoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">Todas las subcategorías</option>
                {subCategoriasUnicas.map((subCategoria) => (
                  <option key={subCategoria} value={subCategoria}>
                    {subCategoria}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Hash className="w-4 h-4 inline mr-1" />
                SKU
              </label>
              <input
                type="text"
                value={activeFilters.sku}
                onChange={(e) => updateFilter('sku', e.target.value)}
                placeholder="Filtrar por SKU"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Hash className="w-4 h-4 inline mr-1" />
                EAN
              </label>
              <input
                type="text"
                value={activeFilters.ean}
                onChange={(e) => updateFilter('ean', e.target.value)}
                placeholder="Filtrar por EAN"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Precio Min
              </label>
              <input
                type="number"
                value={activeFilters.precioMin}
                onChange={(e) => updateFilter('precioMin', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Precio Max
              </label>
              <input
                type="number"
                value={activeFilters.precioMax}
                onChange={(e) => updateFilter('precioMax', e.target.value)}
                placeholder="999999"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Warehouse className="w-4 h-4 inline mr-1" />
                Stock Min
              </label>
              <input
                type="number"
                value={activeFilters.stockMin}
                onChange={(e) => updateFilter('stockMin', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 