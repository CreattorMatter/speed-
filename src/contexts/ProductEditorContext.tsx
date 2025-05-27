import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product } from '../data/products';
import { useProductChanges, EditedProduct } from '../hooks/useProductChanges';

interface ProductEditorContextType {
  // Estado de productos
  selectedProducts: Product[];
  setSelectedProducts: (products: Product[]) => void;
  
  // Funciones de manipulación
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  removeAllProducts: () => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  
  // Estado de edición
  editedProducts: EditedProduct[];
  hasChanges: boolean;
  clearChanges: () => void;
  
  // Getters
  getProduct: (productId: string) => Product | undefined;
  getEditedProduct: (productId: string) => EditedProduct | null;
}

const ProductEditorContext = createContext<ProductEditorContextType | undefined>(undefined);

interface ProductEditorProviderProps {
  children: ReactNode;
}

export const ProductEditorProvider: React.FC<ProductEditorProviderProps> = ({ children }) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  
  // Hook de tracking de cambios
  const { 
    trackChange, 
    getEditedProduct, 
    hasChanges, 
    getAllEditedProducts, 
    clearChanges 
  } = useProductChanges();

  const addProduct = useCallback((product: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const removeAllProducts = useCallback(() => {
    setSelectedProducts([]);
    clearChanges();
  }, [clearChanges]);

  const updateProduct = useCallback((productId: string, updates: Partial<Product>) => {
    setSelectedProducts(prev => 
      prev.map(product => {
        if (product.id === productId) {
          const updatedProduct = { ...product, ...updates };
          
          // Trackear cambios para cada campo actualizado
          Object.entries(updates).forEach(([field, newValue]) => {
            const originalValue = product[field as keyof Product];
            if (originalValue !== newValue) {
              trackChange(productId, field, originalValue as string | number, newValue as string | number, product);
            }
          });
          
          return updatedProduct;
        }
        return product;
      })
    );
  }, [trackChange]);

  const getProduct = useCallback((productId: string) => {
    return selectedProducts.find(p => p.id === productId);
  }, [selectedProducts]);

  const contextValue: ProductEditorContextType = {
    selectedProducts,
    setSelectedProducts,
    addProduct,
    removeProduct,
    removeAllProducts,
    updateProduct,
    editedProducts: getAllEditedProducts(),
    hasChanges: hasChanges(),
    clearChanges,
    getProduct,
    getEditedProduct
  };

  return (
    <ProductEditorContext.Provider value={contextValue}>
      {children}
    </ProductEditorContext.Provider>
  );
};

export const useProductEditor = (): ProductEditorContextType => {
  const context = useContext(ProductEditorContext);
  if (!context) {
    throw new Error('useProductEditor must be used within a ProductEditorProvider');
  }
  return context;
}; 