// =====================================
// DYNAMIC CONTENT UTILITIES - Posters
// =====================================

import { DraggableComponentV3 } from '../../builderV3/types';
import { ProductoReal } from '../../../types/product';
import { getDynamicFieldValue, processDynamicTemplate } from '../../../utils/productFieldsMap';
import { calcularDescuentoPorcentaje } from '../../../data/products';

/**
 * Obtiene el valor dinámico de un campo considerando la estructura REAL de la BD
 * 🔧 CORREGIDO: Ahora funciona con dynamicTemplate de la estructura real
 */
export const getDynamicValue = (
  content: any,
  product?: ProductoReal,
  isPreview?: boolean,
  productChanges?: any, // Cambios del usuario desde Redux
  componentId?: string // 🆕 ID del componente para campos estáticos únicos
): string => {
  if (!content) return '';
  
  // Función auxiliar para obtener el valor de un campo del producto
  const getProductValue = (field: string, fallback: any = '') => {
    if (!product) return fallback;
    
    // 🆕 CORREGIDO: Buscar en el array de cambios de Redux
    if (productChanges && productChanges[product.id]) {
      const changes = productChanges[product.id].changes || [];
      
      // 🔧 DEBUGGING: Log para entender qué está pasando
      console.log(`🔍 Buscando cambios para campo \"${field}\" (componentId: ${componentId}):`, {
        productId: product.id,
        totalChanges: changes.length,
        changes: changes.map((c: any) => ({ field: c.field, newValue: c.newValue }))
      });
      
      // 🔧 BUSCAR CAMBIO CON ID ÚNICO PRIMERO (field_componentId)
      let change = changes.find((c: any) => c.field === `${field}_${componentId}`);
      
      // Si no encuentra con ID único, buscar por campo general
      if (!change) {
        change = changes.find((c: any) => c.field === field);
      }
      
      if (change) {
        console.log(`✅ Cambio encontrado para \"${field}\":`, change.newValue);
        return change.newValue;
      }
    }
    
    // Si no hay cambios, retornar valor original del producto
    const value = (product as any)[field];
    return value !== undefined && value !== null ? value : fallback;
  };
  
  // 1. Contenido estático - mostrar tal como está
  if (content?.fieldType === 'static') {
    // Para campos estáticos únicos por componente, verificar cambios con componentId
    if (componentId && productChanges && product) {
      const changes = productChanges[product.id]?.changes || [];
      const uniqueFieldKey = `static_${componentId}`;
      const change = changes.find((c: any) => c.field === uniqueFieldKey);
      
      if (change) {
        return change.newValue;
      }
    }
    
    return content?.staticValue || content?.text || 'Texto estático';
  }
  
  // 2. Campo calculado - mostrar la expresión técnica
  if (content?.fieldType === 'calculated') {
    const expression = content?.calculatedExpression || content?.expression;
    if (!expression || isPreview) {
      // Si es preview, mostrar resultado calculado
      return calculateExpression(expression, product, productChanges);
    }
    return `{${expression}}`; // Mostrar la expresión tal como está
  }
  
  // 3. Campo dinámico SAP - procesar según dynamicTemplate
  if (content?.fieldType === 'dynamic-sap') {
    const template = content?.dynamicTemplate;
    if (!template) return 'Campo dinámico sin configurar';
    
    if (!product || isPreview) {
      // En preview o sin producto, mostrar el template procesado
      return product ? processDynamicTemplate(template, product) : template;
    }
    
    // En edición, mostrar el template sin procesar
    return template;
  }
  
  // 4. Campo de producto directo (LEGACY - para compatibilidad)
  if (content?.productField) {
    const field = content.productField;
    
    if (!product) {
      return isPreview ? getPreviewValue(field) : `{${field}}`;
    }
    
    return String(getProductValue(field, ''));
  }
  
  // 5. Campo dinámico genérico usando getDynamicFieldValue
  if (content?.dynamicField) {
    const field = content.dynamicField;
    
    if (!product) {
      return isPreview ? getPreviewValue(field) : `{${field}}`;
    }
    
    const value = getDynamicFieldValue(field, product, productChanges);
    return String(value || '');
  }
  
  // 6. Fallback - retornar cualquier texto disponible
  return content?.text || content?.staticValue || content?.value || '';
};

/**
 * Calcula una expresión matemática con valores de producto
 */
const calculateExpression = (
  expression: string,
  product?: ProductoReal,
  productChanges?: any
): string => {
  if (!expression || !product) return '0';
  
  // Función para obtener el valor de un campo
  const getFieldValue = (field: string): number => {
    if (productChanges && productChanges[product.id]) {
      const changes = productChanges[product.id].changes || [];
      const change = changes.find((c: any) => c.field === field);
      if (change) {
        return Number(change.newValue) || 0;
      }
    }
    return Number((product as any)[field]) || 0;
  };
  
  try {
    // Reemplazar campos en la expresión
    let processedExpression = expression;
    
    // Reemplazar campos comunes
    processedExpression = processedExpression.replace(/precio/g, String(getFieldValue('precio')));
    processedExpression = processedExpression.replace(/precioAnt/g, String(getFieldValue('precioAnt')));
    processedExpression = processedExpression.replace(/descuento/g, String(calcularDescuentoPorcentaje(product)));
    
    // Evaluar la expresión de manera segura
    const result = Function('"use strict"; return (' + processedExpression + ')')();
    return String(result);
  } catch (error) {
    console.error('Error calculando expresión:', expression, error);
    return '0';
  }
};

/**
 * Obtiene valores de preview para campos específicos
 */
const getPreviewValue = (field: string): string => {
  const previewValues: { [key: string]: string } = {
    descripcion: 'Producto de Ejemplo',
    precio: '$99.999',
    precioAnt: '$119.999',
    sku: '12345',
    ean: '7890123456789',
    stockDisponible: '50',
    marca: 'Marca Ejemplo',
    categoria: 'Categoría',
    modelo: 'Modelo ABC',
    color: 'Azul',
    talle: 'M',
    material: 'Algodón',
    descuento: '17%',
    ahorro: '$20.000',
    cuotas: '12 cuotas',
    montoCuota: '$8.333',
    fechaVencimiento: '31/12/2024',
    codigoPromocion: 'PROMO123'
  };
  
  return previewValues[field] || `{${field}}`;
};

/**
 * Formatea valores monetarios
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '$0';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
};

/**
 * Formatea porcentajes
 */
export const formatPercentage = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0%';
  
  return `${Math.round(numValue)}%`;
};

/**
 * Determina si un componente debe ser editable
 */
export const isComponentEditable = (
  component: DraggableComponentV3,
  enableInlineEdit?: boolean
): boolean => {
  if (!enableInlineEdit) return false;
  
  // Solo permitir edición en campos de texto dinámico
  const editableTypes = [
    'field-dynamic-text',
    // 'field-dynamic-date' eliminado - usar validity-period en su lugar
  ];
  
  return editableTypes.includes(component.type);
}; 