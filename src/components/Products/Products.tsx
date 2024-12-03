import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, Plus, X } from 'lucide-react';
import { products } from '../../data/products';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface ProductsProps {
  onBack: () => void;
}

export default function Products({ onBack }: ProductsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map(product => product.category));
    return Array.from(uniqueCategories).sort();
  }, []);

  // Función de filtrado combinada
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Volver al inicio</span>
            </motion.button>

            <span className="absolute left-1/2 -translate-x-1/2 text-white font-light text-2xl tracking-tight">
              Speed<span className="font-medium">+</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar por nombre, SKU o categoría..."
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 
                         text-white placeholder-white/50 focus:outline-none focus:ring-2 
                         focus:ring-purple-500/50 transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-white/50" />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-2.5 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg 
                         hover:bg-white/20 transition-colors duration-200"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {selectedCategory || 'Filtrar por Categoría'}
                </span>
              </motion.button>

              {/* Dropdown de categorías */}
              {showCategoryFilter && (
                <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-lg border 
                              border-white/20 rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setShowCategoryFilter(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                    >
                      Todas las categorías
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryFilter(false);
                        }}
                        className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 
                       to-indigo-500 text-white rounded-lg hover:from-purple-600 
                       hover:to-indigo-600 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nuevo Producto</span>
            </motion.button>
          </div>
        </div>

        {/* Contador de resultados y filtro activo */}
        <div className="flex items-center gap-4 mb-6 text-white/60">
          <span>
            {filteredProducts.length === products.length
              ? `${products.length} productos`
              : `${filteredProducts.length} de ${products.length} productos`}
          </span>
          {selectedCategory && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
              <span>{selectedCategory}</span>
              <button
                onClick={() => setSelectedCategory('')}
                className="hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="popLayout">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 
                           overflow-hidden group"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-medium">{product.name}</h3>
                        <span className="text-white/60 text-sm">SKU: {product.sku}</span>
                      </div>
                      <span className="text-white font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                        {product.category}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-white/60 hover:text-white text-sm"
                      >
                        Ver detalles
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-white/60 text-lg">
                No se encontraron productos que coincidan con "{searchTerm}"
              </div>
              <button
                onClick={() => handleSearch('')}
                className="mt-4 text-purple-400 hover:text-purple-300"
              >
                Limpiar búsqueda
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 