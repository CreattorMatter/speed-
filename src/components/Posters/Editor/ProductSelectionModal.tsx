import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products, type Product } from '../../../data/products';
import { useProductFilters, type ExtendedProduct } from './hooks/useProductFilters';
import { useProductSelection } from './hooks/useProductSelection';
import { useProductTable } from './hooks/useProductTable';
import { ModalHeader } from './components/ModalHeader';
import { ProductFilters } from './components/ProductFilters';
import { ProductTable } from './components/ProductTable';
import { PaginationControls } from './components/PaginationControls';
import { ModalFooter } from './components/ModalFooter';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedProducts: Product[]) => void;
  initialSelectedProducts?: Product[];
  title?: string;
  maxSelection?: number;
}

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedProducts = [],
  title = "Seleccionar Productos",
  maxSelection
}) => {
  // Función para generar EAN de ejemplo
  function generateEAN(productId: string): string {
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash).toString().padStart(13, '0').slice(0, 13);
  }

  // Datos extendidos de productos (simular datos reales)
  const extendedProducts: ExtendedProduct[] = useMemo(() => {
    return products.map(product => ({
      ...product,
      ean: generateEAN(product.id),
      stockSucursal: Math.floor(Math.random() * 1000) + 1
    }));
  }, []);

  // Hooks personalizados
  const filterHook = useProductFilters(extendedProducts);
  const selectionHook = useProductSelection(initialSelectedProducts, maxSelection);
  
  const tableHook = useProductTable(
    filterHook.filteredData,
    selectionHook.selectedRows,
    filterHook.globalFilter,
    selectionHook.toggleProductSelection,
    selectionHook.togglePageSelection,
    selectionHook.isPageFullySelected,
    selectionHook.isPagePartiallySelected
  );

  // Función para confirmar selección
  const handleConfirm = () => {
    selectionHook.handleConfirm(extendedProducts, onConfirm, onClose);
  };

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
          <ModalHeader
            title={title}
            selectedCount={selectionHook.selectedCount}
            totalProducts={filterHook.filteredData.length}
            onClose={onClose}
          />

          {/* Filtros */}
          <ProductFilters
            globalFilter={filterHook.globalFilter}
            setGlobalFilter={filterHook.setGlobalFilter}
            activeFilters={filterHook.activeFilters}
            updateFilter={filterHook.updateFilter}
            showAdvancedFilters={filterHook.showAdvancedFilters}
            setShowAdvancedFilters={filterHook.setShowAdvancedFilters}
            categoriasUnicas={filterHook.categoriasUnicas}
            subCategoriasUnicas={filterHook.subCategoriasUnicas}
            onClearFilters={filterHook.handleClearFilters}
          />

          {/* Tabla */}
          <ProductTable
            table={tableHook.table}
            selectedRows={selectionHook.selectedRows}
          />

          {/* Paginación */}
          <PaginationControls table={tableHook.table} />

          {/* Footer */}
          <ModalFooter
            selectedCount={selectionHook.selectedCount}
            isLoading={selectionHook.isLoading}
            onClose={onClose}
            onConfirm={handleConfirm}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 