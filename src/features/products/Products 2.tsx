import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, Plus, X, CheckSquare, Square, Trash2, FileText, CheckCircle } from 'lucide-react';
import { getProducts } from '../../services/productService';
import AddProductModal from './AddProductModal';
import { Product } from '../../types';
import { ProductDetails } from './ProductDetails';
import { HeaderProvider } from '../../components/shared/HeaderProvider';
import { Header } from '../../components/shared/Header';
import { useNavigate } from 'react-router-dom';

interface ProductsProps {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
}

// Función para normalizar texto (eliminar tildes y caracteres especiales)
const normalizeText = (text: string): string => {
  return text.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
    .replace(/[^a-zA-Z0-9\s-_.,]/g, "") // Solo permitir alfanuméricos, espacios y algunos símbolos
    .trim();
};

// Agregar un componente Tooltip
const DisabledTooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 
                    bg-gray-900 text-white text-xs rounded-lg p-2 
                    shadow-lg pointer-events-none
                    transform -translate-x-1/2 left-1/2">
        <div className="text-center">
          Función no disponible
          <br />
          Contacte al administrador
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 
                      border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
};

export default function Products({ onBack, onLogout, userEmail, userName }: ProductsProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await getProducts();
        setLocalProducts(productsData);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        // Manejar el error, por ejemplo, mostrando un mensaje al usuario
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = new Set(localProducts.map(product => product.category));
    return Array.from(uniqueCategories).sort();
  }, [localProducts]);

  // Función de filtrado combinada
  const filteredProducts = useMemo(() => {
    return localProducts.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, localProducts]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Función para verificar duplicados
  const checkDuplicates = (newProducts: Product | Product[]) => {
    const productsToCheck = Array.isArray(newProducts) ? newProducts : [newProducts];
    const duplicates = productsToCheck.filter(newProduct => 
      localProducts.some(existingProduct => 
        existingProduct.sku === newProduct.sku ||
        (existingProduct.name.toLowerCase() === newProduct.name.toLowerCase() &&
         existingProduct.category.toLowerCase() === newProduct.category.toLowerCase())
      )
    );

    return duplicates;
  };

  // Función actualizada para agregar productos
  const handleAddProduct = (product: Product | Product[]) => {
    const duplicates = checkDuplicates(product);
    
    if (duplicates.length > 0) {
      const isMultiple = Array.isArray(product);
      const totalProducts = isMultiple ? (product as Product[]).length : 1;
      const duplicateCount = duplicates.length;
      
      if (isMultiple && duplicateCount < totalProducts) {
        // Algunos productos son duplicados
        const confirmMessage = `Se encontraron ${duplicateCount} productos duplicados de ${totalProducts}.\n\n` +
          `Productos duplicados:\n${duplicates.map(p => `- ${p.name} (${p.sku})`).join('\n')}\n\n` +
          '¿Deseas importar solo los productos no duplicados?';
        
        if (window.confirm(confirmMessage)) {
          const uniqueProducts = (product as Product[]).filter(p => 
            !duplicates.some(d => d.sku === p.sku)
          );
          const newIds = uniqueProducts.map(p => p.id);
          setLocalProducts(prev => [...prev, ...uniqueProducts]);
          setRecentlyAdded(new Set(newIds));
          setTimeout(() => setRecentlyAdded(new Set()), 5000);
        }
      } else {
        // Todos los productos son duplicados o es un solo producto duplicado
        const message = isMultiple 
          ? 'Todos los productos ya existen en el catálogo.'
          : `El producto "${duplicates[0].name}" ya existe en el catálogo.`;
        alert(message);
      }
    } else {
      // No hay duplicados, proceder normalmente
      if (Array.isArray(product)) {
        const newIds = product.map(p => p.id);
        setLocalProducts(prev => [...prev, ...product]);
        setRecentlyAdded(new Set(newIds));
        setTimeout(() => setRecentlyAdded(new Set()), 5000);
      } else {
        setLocalProducts(prev => [...prev, product]);
        setRecentlyAdded(new Set([product.id]));
        setTimeout(() => setRecentlyAdded(new Set()), 5000);
      }
    }
    setIsAddModalOpen(false);
  };

  // Función para manejar la selección de productos
  const handleSelect = (productId: string) => {
    setSelectedProducts(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(productId)) {
        newSelection.delete(productId);
      } else {
        newSelection.add(productId);
      }
      return newSelection;
    });
  };

  // Función para seleccionar/deseleccionar todos
  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Función para eliminar productos seleccionados
  const handleDeleteSelected = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedProducts.size} productos?`)) {
      setLocalProducts(prev => 
        prev.filter(product => !selectedProducts.has(product.id))
      );
      setSelectedProducts(new Set());
    }
  };

  // Función para eliminar un producto individual desde el modal de detalles
  const handleDeleteProduct = (id: string) => {
    setLocalProducts(prev => prev.filter(product => product.id !== id));
    setSelectedProduct(null);
  };

  // Función para actualizar un producto
  const handleUpdateProduct = (updatedProduct: Product) => {
    setLocalProducts(prev => 
      prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setSelectedProduct(null);
  };

  // Función para exportar productos seleccionados a CSV
  const handleExportCSV = () => {
    const selectedProductsData = filteredProducts.filter(p => selectedProducts.has(p.id));
    const csv = [
      // Encabezados normalizados
      ['SKU', 'Nombre', 'Precio', 'Categoria', 'URL de Imagen'].join(','),
      // Datos normalizados
      ...selectedProductsData.map(p => [
        normalizeText(p.sku),
        `"${normalizeText(p.name)}"`, // Envolvemos en comillas para manejar comas en el nombre
        p.price,
        normalizeText(p.category),
        p.imageUrl
      ].join(','))
    ].join('\n');

    // Agregar BOM para que Excel reconozca correctamente los caracteres
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `productos_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Liberar memoria
  };

  const handleAddProductClick = () => {
    // No hacer nada - botón deshabilitado
  };

  return (
    <HeaderProvider userEmail={userEmail} userName={userName}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
        <Header onBack={onBack} onLogout={onLogout} userName={userName} onGoToAdmin={() => navigate('/administration')} />
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

              <DisabledTooltip>
                <motion.button
                  whileHover={{ scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500/50 
                           text-gray-400 rounded-lg cursor-not-allowed
                           border border-gray-600/30 transition-colors"
                  disabled={true}
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Nuevo Producto</span>
                </motion.button>
              </DisabledTooltip>
            </div>
          </div>

          {/* Toolbar con selección */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg 
                         hover:bg-white/20 transition-colors"
              >
                {selectedProducts.size === filteredProducts.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">
                  {selectedProducts.size === 0
                    ? 'Seleccionar Todos'
                    : selectedProducts.size === filteredProducts.length
                    ? 'Deseleccionar Todos'
                    : `${selectedProducts.size} seleccionados`}
                </span>
              </motion.button>

              {selectedProducts.size > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-white/60">
                    {selectedProducts.size} productos seleccionados
                  </span>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 
                               rounded-lg hover:bg-emerald-500/20"
                    >
                      <FileText className="w-5 h-5" />
                      <span className="hidden sm:inline">Exportar CSV</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 
                               rounded-lg hover:bg-red-500/20"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contador de resultados y filtro activo */}
          <div className="flex items-center gap-4 mb-6 text-white/60">
            <span>
              {filteredProducts.length === localProducts.length
                ? `${localProducts.length} productos`
                : `${filteredProducts.length} de ${localProducts.length} productos`}
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
                    className={`bg-white/10 backdrop-blur-md rounded-lg border 
                             overflow-hidden group relative
                             ${selectedProducts.has(product.id) 
                               ? 'border-purple-500' 
                               : recentlyAdded.has(product.id)
                               ? 'border-emerald-500'
                               : 'border-white/20'}`}
                  >
                    {/* Indicador de producto recién agregado */}
                    {recentlyAdded.has(product.id) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-2 left-2 z-10 bg-emerald-500/20 p-1 rounded-full"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </motion.div>
                    )}

                    {/* Checkbox de selección */}
                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                      <button
                        onClick={() => handleSelect(product.id)}
                        className="p-1 bg-black/50 rounded-lg backdrop-blur-sm"
                      >
                        {selectedProducts.has(product.id) ? (
                          <CheckSquare className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Square className="w-5 h-5 text-white/60" />
                        )}
                      </button>
                    </div>

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
                          onClick={() => setSelectedProduct(product)}
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

          {selectedProduct && (
            <ProductDetails
              product={selectedProduct}
              isOpen={!!selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct}
              categories={categories}
            />
          )}
        </div>

        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddProduct={handleAddProduct}
        />
      </div>
    </HeaderProvider>
  );
} 