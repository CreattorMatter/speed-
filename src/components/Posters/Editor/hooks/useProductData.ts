import { useSelector } from 'react-redux';
import { selectProductChanges } from '../../../../store/features/poster/posterSlice';
import { type Product } from '../../../../data/products';

export const useProductData = () => {
  const productChanges = useSelector(selectProductChanges);

  // Función helper para obtener producto editado
  const getEditedProduct = (productId: string) => {
    return productChanges[productId] || null;
  };

  // Función para obtener el valor actual de un campo del producto
  const getCurrentProductValue = (product: Product, field: string): any => {
    const editedProduct = getEditedProduct(product.id);
    
    // Primero verificar si hay un valor editado
    if (editedProduct && editedProduct.changes.length > 0) {
      const change = editedProduct.changes.find(c => c.field === field);
      if (change) {
        return change.newValue;
      }
    }
    
    // Mapeo directo de campos del producto
    const productFieldMapping: Record<string, keyof Product> = {
      nombre: 'name',
      precioActual: 'price',
      sap: 'sku'
    };
    
    const productField = productFieldMapping[field];
    if (productField && product[productField] !== undefined) {
      return product[productField];
    }
    
    // Valores por defecto para campos que no están en Product
    const defaultValues: Record<string, any> = {
      porcentaje: 20,
      fechasDesde: '15/05/2025',
      fechasHasta: '18/05/2025',
      origen: 'ARG',
      precioSinImpuestos: product.price ? (product.price * 0.83).toFixed(2) : '0'
    };
    
    return defaultValues[field] || '';
  };

  // Función para generar props dinámicos para el componente de plantilla
  const generateTemplateProps = (product: Product, selectedFinancing: any[]) => {
    const baseProps = {
      small: false,
      financiacion: selectedFinancing,
      productos: [product],
      titulo: "Ofertas Especiales"
    };

    // Generar props dinámicos basados en los valores actuales del producto
    const templateProps: Record<string, any> = {
      // Mapeo directo de campos
      nombre: getCurrentProductValue(product, 'nombre'),
      precioActual: getCurrentProductValue(product, 'precioActual')?.toString(),
      porcentaje: getCurrentProductValue(product, 'porcentaje')?.toString(),
      sap: getCurrentProductValue(product, 'sap')?.toString(),
      fechasDesde: getCurrentProductValue(product, 'fechasDesde')?.toString(),
      fechasHasta: getCurrentProductValue(product, 'fechasHasta')?.toString(),
      origen: getCurrentProductValue(product, 'origen')?.toString(),
      precioSinImpuestos: getCurrentProductValue(product, 'precioSinImpuestos')?.toString()
    };

    return { 
      ...baseProps, 
      ...templateProps 
    };
  };

  return {
    getEditedProduct,
    getCurrentProductValue,
    generateTemplateProps
  };
}; 