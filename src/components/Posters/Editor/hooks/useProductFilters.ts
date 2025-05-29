import { useState, useMemo } from 'react';
import { type Product } from '../../../../data/products';

export interface ExtendedProduct extends Product {
  ean?: string;
  stockSucursal?: number;
}

export interface FilterState {
  descripcion: string;
  categoria: string;
  subCategoria: string;
  sku: string;
  ean: string;
  precioMin: string;
  precioMax: string;
  stockMin: string;
}

export const useProductFilters = (extendedProducts: ExtendedProduct[]) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    descripcion: '',
    categoria: '',
    subCategoria: '',
    sku: '',
    ean: '',
    precioMin: '',
    precioMax: '',
    stockMin: ''
  });

  // Obtener opciones únicas para los filtros
  const categoriasUnicas = useMemo(() => {
    const categorias = Array.from(new Set(extendedProducts.map(p => p.category)));
    return categorias.sort();
  }, [extendedProducts]);

  const subCategoriasUnicas = useMemo(() => {
    const subCategorias = Array.from(new Set(
      extendedProducts
        .map(p => p.subCategory)
        .filter((subCategory): subCategory is string => Boolean(subCategory)) // Type guard
    ));
    return subCategorias.sort();
  }, [extendedProducts]);

  // Función para generar EAN de ejemplo
  const generateEAN = (productId: string): string => {
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash).toString().padStart(13, '0').slice(0, 13);
  };

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

  // Función para limpiar filtros
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
  };

  // Función para actualizar filtro específico
  const updateFilter = (key: keyof FilterState, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    // Estados
    globalFilter,
    setGlobalFilter,
    activeFilters,
    setActiveFilters,
    showAdvancedFilters,
    setShowAdvancedFilters,
    
    // Datos computados
    filteredData,
    categoriasUnicas,
    subCategoriasUnicas,
    
    // Funciones
    handleClearFilters,
    updateFilter,
    generateEAN
  };
}; 