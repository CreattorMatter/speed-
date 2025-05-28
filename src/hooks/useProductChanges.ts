import { useState, useCallback } from 'react';
import { Product } from '../data/products';

export interface ProductChange {
  productId: string;
  field: string;
  originalValue: string | number;
  newValue: string | number;
  timestamp: Date;
}

export interface EditedProduct extends Product {
  changes: ProductChange[];
  isEdited: boolean;
}

export const useProductChanges = () => {
  const [editedProducts, setEditedProducts] = useState<Map<string, EditedProduct>>(new Map());

  const trackChange = useCallback((
    productId: string,
    field: string,
    originalValue: string | number,
    newValue: string | number,
    baseProduct: Product
  ) => {
    console.log('trackChange llamado:', {
      productId,
      field,
      originalValue,
      newValue,
      baseProduct: baseProduct.name
    });

    // No trackear si el valor no cambió realmente
    if (originalValue === newValue) {
      console.log('trackChange: Valor no cambió, no se trackea');
      return;
    }

    setEditedProducts(prev => {
      const updated = new Map(prev);
      const existing = updated.get(productId);
      
      const change: ProductChange = {
        productId,
        field,
        originalValue,
        newValue,
        timestamp: new Date()
      };

      if (existing) {
        // Actualizar producto existente
        const updatedProduct = {
          ...existing,
          [field]: newValue,
          changes: [...existing.changes.filter(c => c.field !== field), change],
          isEdited: true
        };
        updated.set(productId, updatedProduct);
        console.log('trackChange: Producto existente actualizado:', {
          productId,
          totalChanges: updatedProduct.changes.length,
          changes: updatedProduct.changes
        });
      } else {
        // Crear nuevo producto editado
        const newEditedProduct: EditedProduct = {
          ...baseProduct,
          [field]: newValue,
          changes: [change],
          isEdited: true
        };
        updated.set(productId, newEditedProduct);
        console.log('trackChange: Nuevo producto editado creado:', {
          productId,
          totalChanges: newEditedProduct.changes.length,
          changes: newEditedProduct.changes
        });
      }

      console.log('trackChange: Estado actualizado, total productos editados:', updated.size);
      
      // Disparar evento personalizado para notificar cambios
      const event = new CustomEvent('productChanged', {
        detail: {
          productId,
          field,
          originalValue,
          newValue,
          totalEditedProducts: updated.size
        }
      });
      window.dispatchEvent(event);
      console.log('trackChange: Evento productChanged disparado');
      
      return updated;
    });
  }, []);

  const getEditedProduct = useCallback((productId: string): EditedProduct | null => {
    const result = editedProducts.get(productId) || null;
    console.log(`getEditedProduct(${productId}):`, {
      found: !!result,
      changesCount: result?.changes.length || 0
    });
    return result;
  }, [editedProducts]);

  const hasChanges = useCallback(() => {
    const result = editedProducts.size > 0;
    console.log('hasChanges():', {
      result,
      totalEditedProducts: editedProducts.size,
      productIds: Array.from(editedProducts.keys())
    });
    return result;
  }, [editedProducts]);

  const getAllEditedProducts = useCallback(() => {
    const result = Array.from(editedProducts.values());
    console.log('getAllEditedProducts():', {
      count: result.length,
      products: result.map(p => ({
        id: p.id,
        name: p.name,
        changesCount: p.changes.length
      }))
    });
    return result;
  }, [editedProducts]);

  const clearChanges = useCallback(() => {
    console.log('clearChanges: Limpiando todos los cambios');
    setEditedProducts(new Map());
    
    // Disparar evento de cambio
    const event = new CustomEvent('productChanged', {
      detail: { action: 'clearAll' }
    });
    window.dispatchEvent(event);
    console.log('clearChanges: Evento productChanged disparado');
  }, []);

  const removeProductChanges = useCallback((productId: string) => {
    console.log(`removeProductChanges: Eliminando cambios para producto ${productId}`);
    setEditedProducts(prev => {
      const updated = new Map(prev);
      const existed = updated.has(productId);
      updated.delete(productId);
      console.log(`removeProductChanges: Producto ${productId} ${existed ? 'eliminado' : 'no existía'}`);
      
      // Disparar evento de cambio
      const event = new CustomEvent('productChanged', {
        detail: { 
          action: 'removeProduct',
          productId,
          totalEditedProducts: updated.size
        }
      });
      window.dispatchEvent(event);
      console.log('removeProductChanges: Evento productChanged disparado');
      
      return updated;
    });
  }, []);

  // Función helper para verificar si un producto específico tiene cambios
  const hasProductChanges = useCallback((productId: string): boolean => {
    const editedProduct = editedProducts.get(productId);
    const result = editedProduct !== null && editedProduct !== undefined && editedProduct.changes.length > 0;
    console.log(`hasProductChanges(${productId}):`, {
      result,
      editedProduct: !!editedProduct,
      changesCount: editedProduct?.changes.length || 0
    });
    return result;
  }, [editedProducts]);

  return {
    trackChange,
    getEditedProduct,
    hasChanges,
    hasProductChanges,
    getAllEditedProducts,
    clearChanges,
    removeProductChanges,
    editedProducts: Array.from(editedProducts.values())
  };
}; 