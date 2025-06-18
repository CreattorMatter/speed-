import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  SortAsc, 
  SortDesc,
  Package,
  Tag,
  DollarSign,
  Hash,
  Warehouse,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  ShoppingCart
} from 'lucide-react';
import { 
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState
} from '@tanstack/react-table';
import { Product } from '@/types/product';
import { products } from '@/data/products';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedProducts: Product[]) => void;
  initialSelectedProducts?: Product[];
  title?: string;
  maxSelection?: number;
}

interface ExtendedProduct extends Product {
  ean?: string;
  stockSucursal?: number;
}

const columnHelper = createColumnHelper<ExtendedProduct>();

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedProducts = [],
  title = "Seleccionar Productos",
  maxSelection
}) => {
  // Estados del modal
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50
  });
  const [isLoading, setIsLoading] = useState(false);

  // Estados de filtros avanzados
  const [activeFilters, setActiveFilters] = useState({
    descripcion: '',
    categoria: '',
    subCategoria: '',
    sku: '',
    ean: '',
    precioMin: '',
    precioMax: '',
    stockMin: ''
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Datos extendidos de productos (simular datos reales)
  const extendedProducts: ExtendedProduct[] = useMemo(() => {
    return products.map(product => ({
      ...product,
      ean: generateEAN(product.id),
      stockSucursal: Math.floor(Math.random() * 1000) + 1
    }));
  }, []);

  // Obtener opciones únicas para los filtros
  const categoriasUnicas = useMemo(() => {
    const categorias = Array.from(new Set(extendedProducts.map(p => p.category)));
    return categorias.sort();
  }, [extendedProducts]);

  const subCategoriasUnicas = useMemo(() => {
    const subCategorias = Array.from(new Set(
      extendedProducts
        .map(p => p.subCategory)
        .filter(Boolean) // Filtrar valores undefined/null
    ));
    return subCategorias.sort();
  }, [extendedProducts]);

  function generateEAN(productId: string): string {
    // Generar EAN de ejemplo basado en el ID del producto
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash).toString().padStart(13, '0').slice(0, 13);
  }

  // Inicializar selección con productos iniciales
  useEffect(() => {
    if (initialSelectedProducts.length > 0) {
      const initialSelection = initialSelectedProducts.reduce((acc, product) => {
        acc[product.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setSelectedRows(initialSelection);
    }
  }, [initialSelectedProducts]);

  // Columnas de la tabla
  const columns = useMemo<ColumnDef<ExtendedProduct, any>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => {
        const currentPageData = table.getRowModel().rows.map(row => row.original);
        const allSelected = currentPageData.length > 0 && currentPageData.every(product => selectedRows[product.id]);
        const someSelected = currentPageData.some(product => selectedRows[product.id]);
        
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newSelected = { ...selectedRows };
                
                if (allSelected) {
                  // Deseleccionar todos los de la página actual
                  currentPageData.forEach(product => {
                    delete newSelected[product.id];
                  });
                } else {
                  // Seleccionar todos los de la página actual
                  currentPageData.forEach(product => {
                    newSelected[product.id] = true;
                  });
                }
                
                setSelectedRows(newSelected);
              }}
              className="w-5 h-5 flex items-center justify-center border-2 border-gray-300 rounded transition-colors hover:border-indigo-500"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : someSelected ? (
                <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <span className="text-xs text-gray-500">Todo</span>
          </div>
        );
      },
      cell: ({ row }) => (
        <button
          onClick={() => {
            const isSelected = selectedRows[row.original.id];
            const newSelected = { ...selectedRows };
            
            if (isSelected) {
              delete newSelected[row.original.id];
            } else {
              newSelected[row.original.id] = true;
            }
            
            setSelectedRows(newSelected);
          }}
          className="w-5 h-5 flex items-center justify-center border-2 border-gray-300 rounded transition-colors hover:border-indigo-500"
        >
          {selectedRows[row.original.id] ? (
            <CheckSquare className="w-4 h-4 text-indigo-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      ),
      size: 50,
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'name',
      header: 'Descripción',
      cell: ({ getValue, row }) => (
        <div className="min-w-0">
          <div className="font-medium text-gray-900 truncate" title={getValue() as string}>
            {getValue() as string}
          </div>
          <div className="text-sm text-gray-500 truncate" title={row.original.description}>
            {row.original.description}
          </div>
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-gray-700">{getValue() as string}</span>
      ),
      size: 120,
    },
    {
      accessorKey: 'subCategory',
      header: 'Subcategoría',
      cell: ({ getValue }) => {
        const subCategory = getValue() as string;
        return subCategory ? (
          <span className="text-sm text-gray-600">{subCategory}</span>
        ) : (
          <span className="text-sm text-gray-400 italic">Sin subcategoría</span>
        );
      },
      size: 150,
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ getValue }) => (
        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          {getValue() as string}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: 'ean',
      header: 'EAN',
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-gray-600">{getValue() as string}</span>
      ),
      size: 120,
    },
    {
      accessorKey: 'price',
      header: 'Precio',
      cell: ({ getValue }) => (
        <span className="font-semibold text-green-600">
          ${(getValue() as number)?.toLocaleString()}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: 'stockSucursal',
      header: 'Stock',
      cell: ({ getValue }) => {
        const stock = (getValue() as number) || 0;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-medium ${stock > 50 ? 'text-green-600' : stock > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {stock}
            </span>
            <div className={`w-2 h-2 rounded-full ${stock > 50 ? 'bg-green-500' : stock > 10 ? 'bg-yellow-500' : 'bg-red-500'}`} />
          </div>
        );
      },
      size: 80,
    },
  ], [selectedRows, maxSelection]);

  // Datos filtrados
  const filteredData = useMemo(() => {
    return extendedProducts.filter(product => {
      // Filtros avanzados
      if (activeFilters.descripcion && !product.name.toLowerCase().includes(activeFilters.descripcion.toLowerCase())) {
        return false;
      }
      if (activeFilters.categoria && product.category !== activeFilters.categoria) {
        return false;
      }
      if (activeFilters.subCategoria && product.subCategory !== activeFilters.subCategoria) {
        return false;
      }
      if (activeFilters.sku && !product.sku?.toLowerCase().includes(activeFilters.sku.toLowerCase())) {
        return false;
      }
      if (activeFilters.ean && !product.ean?.includes(activeFilters.ean)) {
        return false;
      }
      if (activeFilters.precioMin && product.price < parseFloat(activeFilters.precioMin)) {
        return false;
      }
      if (activeFilters.precioMax && product.price > parseFloat(activeFilters.precioMax)) {
        return false;
      }
      if (activeFilters.stockMin && (product.stockSucursal || 0) < parseInt(activeFilters.stockMin)) {
        return false;
      }
      
      return true;
    });
  }, [extendedProducts, activeFilters]);

  // Configuración de la tabla
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  // Handlers
  const handleConfirm = useCallback(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      const selectedProducts = Object.keys(selectedRows)
        .map(id => extendedProducts.find(p => p.id === id))
        .filter(Boolean) as Product[];
      
      onConfirm(selectedProducts);
      setIsLoading(false);
      onClose();
    }, 500);
  }, [selectedRows, extendedProducts, onConfirm, onClose]);

  const handleClearFilters = () => {
    setActiveFilters({
      descripcion: '',
      categoria: '',
      subCategoria: '',
      sku: '',
      ean: '',
      precioMin: '',
      precioMax: '',
      stockMin: ''
    });
    setGlobalFilter('');
    setColumnFilters([]);
  };

  const selectedCount = Object.keys(selectedRows).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">
                  {selectedCount} de {filteredData.length} productos seleccionados
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filtros */}
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
                  onClick={handleClearFilters}
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
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, descripcion: e.target.value }))}
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
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, categoria: e.target.value }))}
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
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, subCategoria: e.target.value }))}
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
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, sku: e.target.value }))}
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
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, ean: e.target.value }))}
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
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, precioMin: e.target.value }))}
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
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, precioMax: e.target.value }))}
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
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, stockMin: e.target.value }))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tabla */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center gap-2 ${
                              header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-700' : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <div className="flex flex-col">
                                {header.column.getIsSorted() === 'asc' ? (
                                  <SortAsc className="w-3 h-3 text-indigo-600" />
                                ) : header.column.getIsSorted() === 'desc' ? (
                                  <SortDesc className="w-3 h-3 text-indigo-600" />
                                ) : (
                                  <div className="w-3 h-3 text-gray-400">
                                    <SortAsc className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedRows[row.original.id] ? 'bg-indigo-50' : ''
                    } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 whitespace-nowrap text-sm"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </span>
              <span>|</span>
              <span>
                {table.getFilteredRowModel().rows.length} productos
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Primera
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Última
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-indigo-600">{selectedCount}</span> productos seleccionados
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedCount === 0 || isLoading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedCount === 0 || isLoading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmar ({selectedCount})
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 