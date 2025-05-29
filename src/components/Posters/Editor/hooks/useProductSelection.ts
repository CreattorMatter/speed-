import { useState, useCallback, useEffect } from 'react';
import { type Product } from '../../../../data/products';
import { type ExtendedProduct } from './useProductFilters';

export const useProductSelection = (
  initialSelectedProducts: Product[] = [],
  maxSelection?: number
) => {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  // Función para alternar selección de un producto individual
  const toggleProductSelection = useCallback((productId: string) => {
    setSelectedRows(prev => {
      const isSelected = prev[productId];
      const newSelected = { ...prev };
      
      if (isSelected) {
        delete newSelected[productId];
      } else {
        // Verificar límite de selección si existe
        if (maxSelection && Object.keys(newSelected).length >= maxSelection) {
          return prev; // No permitir más selecciones
        }
        newSelected[productId] = true;
      }
      
      return newSelected;
    });
  }, [maxSelection]);

  // Función para seleccionar/deseleccionar todos los productos de una página
  const togglePageSelection = useCallback((currentPageData: ExtendedProduct[]) => {
    setSelectedRows(prev => {
      const newSelected = { ...prev };
      const allSelected = currentPageData.length > 0 && currentPageData.every(product => prev[product.id]);
      
      if (allSelected) {
        // Deseleccionar todos los de la página actual
        currentPageData.forEach(product => {
          delete newSelected[product.id];
        });
      } else {
        // Seleccionar todos los de la página actual (respetando el límite)
        currentPageData.forEach(product => {
          if (!maxSelection || Object.keys(newSelected).length < maxSelection) {
            newSelected[product.id] = true;
          }
        });
      }
      
      return newSelected;
    });
  }, [maxSelection]);

  // Función para limpiar toda la selección
  const clearSelection = useCallback(() => {
    setSelectedRows({});
  }, []);

  // Función para obtener productos seleccionados
  const getSelectedProducts = useCallback((allProducts: ExtendedProduct[]): Product[] => {
    return Object.keys(selectedRows)
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean) as Product[];
  }, [selectedRows]);

  // Verificar si una página está completamente seleccionada
  const isPageFullySelected = useCallback((currentPageData: ExtendedProduct[]): boolean => {
    return currentPageData.length > 0 && currentPageData.every(product => selectedRows[product.id]);
  }, [selectedRows]);

  // Verificar si una página tiene algún producto seleccionado
  const isPagePartiallySelected = useCallback((currentPageData: ExtendedProduct[]): boolean => {
    return currentPageData.some(product => selectedRows[product.id]);
  }, [selectedRows]);

  // Verificar si se puede seleccionar más productos
  const canSelectMore = useCallback((): boolean => {
    if (!maxSelection) return true;
    return Object.keys(selectedRows).length < maxSelection;
  }, [selectedRows, maxSelection]);

  // Función de confirmación con loading
  const handleConfirm = useCallback(async (
    allProducts: ExtendedProduct[],
    onConfirm: (selectedProducts: Product[]) => void,
    onClose: () => void
  ) => {
    setIsLoading(true);
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const selectedProducts = getSelectedProducts(allProducts);
    onConfirm(selectedProducts);
    setIsLoading(false);
    onClose();
  }, [getSelectedProducts]);

  const selectedCount = Object.keys(selectedRows).length;

  return {
    // Estados
    selectedRows,
    setSelectedRows,
    isLoading,
    selectedCount,
    
    // Funciones
    toggleProductSelection,
    togglePageSelection,
    clearSelection,
    getSelectedProducts,
    handleConfirm,
    
    // Verificaciones
    isPageFullySelected,
    isPagePartiallySelected,
    canSelectMore
  };
}; 