// =====================================
// PROCESADOR DE CONTENIDO DINÁMICO V2
// COMPATIBLE CON ENTIDADES REALES DEL SISTEMA ERP
// =====================================

import { ProductoReal, Tienda, Seccion, Promocion } from '../types/product';
import { getDynamicFieldValue, ALL_DYNAMIC_FIELDS } from './productFieldsMap';

// =====================
// TIPOS Y INTERFACES
// =====================

export interface MockDataV3 {
  // Producto seleccionado
  producto?: ProductoReal;
  
  // Información contextual
  tienda?: Tienda;
  seccion?: Seccion;
  promocion?: Promocion;
  
  // Campos calculados dinámicamente
  fecha_actual: string;
  fecha_promocion_fin: string;
  descuento_calculado: number;
}

// =====================
// PRODUCTO MOCK REALISTA PARA VISTA PREVIA
// =====================
const createMockProduct = (): ProductoReal => ({
  id: 'mock-product-1',
  sku: 123001,
  ean: 7790123456789,
  descripcion: 'Heladera Whirlpool No Frost 375L',
  precio: 699999,
  precioAnt: 849999,
  basePrice: 578511,
  ppum: 1866,
  unidadPpumExt: 'L',
  umvExt: 'UN',
  seccion: 'Electrodomésticos',
  grupo: 'Línea Blanca',
  rubro: 'Heladeras',
  subRubro: 'No Frost',
  marcaTexto: 'WHIRLPOOL',
  paisTexto: 'Argentina',
  origen: 'ARG',
  tienda: 'E000',
  stockDisponible: 15
});

// =====================
// DATOS MOCK POR DEFECTO (CON PRODUCTO REALISTA)
// =====================

export const defaultMockData: MockDataV3 = {
  fecha_actual: new Date().toLocaleDateString('es-AR'),
  fecha_promocion_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR'),
  descuento_calculado: 18, // 18% de descuento
  producto: createMockProduct(), // AHORA INCLUYE PRODUCTO MOCK REALISTA
  tienda: {
    numero: 'E000',
    tienda: 'Easy Casa Central'
  },
  seccion: {
    numero: 12,
    seccion: 'Electrodomésticos'
  }
};

// =====================
// FORMATEADORES
// =====================

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// =====================
// PROCESAMIENTO PRINCIPAL
// =====================

/**
 * Procesa un template dinámico reemplazando campos con datos reales o ejemplos
 */
export const processTemplate = (template: string, mockData: MockDataV3 = defaultMockData): string => {
  if (!template) return '';
  
  let processedTemplate = template;
  
  // Usar el producto (real o mock) si está disponible
  if (mockData.producto) {
    // Extraer campos dinámicos del template
    const fieldRegex = /\[([^\]]+)\]/g;
    let match;
    
    while ((match = fieldRegex.exec(template)) !== null) {
      const fieldId = match[1];
      const fieldValue = getDynamicFieldValue(fieldId, mockData.producto);
      processedTemplate = processedTemplate.replace(match[0], fieldValue);
    }
  } else {
    // Fallback usando ejemplos reales de productFieldsMap
    const fieldRegex = /\[([^\]]+)\]/g;
    let match;
    
    while ((match = fieldRegex.exec(template)) !== null) {
      const fieldId = match[1];
      const field = ALL_DYNAMIC_FIELDS[fieldId];
      
      if (field?.example) {
        // Usar el ejemplo real del campo
        processedTemplate = processedTemplate.replace(match[0], field.example);
      } else {
        // Mapeo básico como fallback final
        const fieldMappings: Record<string, string> = {
          'product_name': 'Heladera Whirlpool No Frost 375L',
          'product_price': formatPrice(699999),
          'product_sku': '123001',
          'product_brand': 'WHIRLPOOL',
          'current_date': mockData.fecha_actual,
          'promotion_end_date': mockData.fecha_promocion_fin,
          'store_code': mockData.tienda?.numero || 'E000',
          'product_seccion': mockData.seccion?.seccion || 'Electrodomésticos'
        };
        
        const fallbackValue = fieldMappings[fieldId] || `[${fieldId}]`;
        processedTemplate = processedTemplate.replace(match[0], fallbackValue);
      }
    }
  }
  
  return processedTemplate;
};

/**
 * Obtiene el valor de un campo SAP específico (usando ejemplos reales)
 */
export const getSAPFieldValue = (fieldName: string, data: MockDataV3): string => {
  if (data.producto) {
    // Usar datos reales del producto
    return getDynamicFieldValue(fieldName, data.producto);
  }
  
  // Usar ejemplos reales de productFieldsMap
  const field = ALL_DYNAMIC_FIELDS[fieldName];
  if (field?.example) {
    return field.example;
  }
  
  // Fallback con datos de ejemplo realistas
  const fieldMap: Record<string, string> = {
    'product_name': 'Heladera Whirlpool No Frost 375L',
    'product_price': formatPrice(699999),
    'price_without_tax': formatPrice(578512),
    'product_sku': '123001',
    'product_brand': 'WHIRLPOOL',
    'product_seccion': data.seccion?.seccion || 'Electrodomésticos',
    'product_origin': 'Argentina',
    'stock_available': '15 unidades'
  };
  
  return fieldMap[fieldName] || `[${fieldName}]`;
};

/**
 * Obtiene el valor de un campo de promoción
 */
export const getPromotionFieldValue = (fieldName: string, data: MockDataV3): string => {
  if (data.promocion) {
    const promo = data.promocion;
    
    const fieldMap: Record<string, string> = {
      'promo_type': promo.precioVentaPromocional || 'Oferta especial',
      'promo_description': promo.descripcionCombo || promo.descripcion || 'Promoción vigente',
      'promo_validity': promo.hasta ? `Válido hasta ${formatDate(promo.hasta)}` : 'Consultar vigencia',
      'promo_stores': promo.local || 'Todas las sucursales',
      'promo_discount': promo.precioVentaPromocional?.includes('%') 
        ? promo.precioVentaPromocional 
        : 'Precio especial'
    };
    
    return fieldMap[fieldName] || `[${fieldName}]`;
  }
  
  // Valores por defecto realistas
  const defaultValues: Record<string, string> = {
    'promo_type': 'Oferta Especial',
    'promo_description': 'Promoción vigente',
    'promo_validity': `Válido hasta ${data.fecha_promocion_fin}`,
    'promo_stores': 'Todas las sucursales',
    'promo_discount': '18%'
  };
  
  return defaultValues[fieldName] || `[${fieldName}]`;
};

// =====================
// PROCESADOR PRINCIPAL DE COMPONENTES (MEJORADO)
// =====================

export const processDynamicContent = (
  component: any, 
  mockData: MockDataV3 = defaultMockData
): string => {
  const content = component.content as any;
  
  if (!content) {
    return 'Sin contenido';
  }
  
  // 1. Contenido estático
  if (content?.fieldType === 'static') {
    return content?.staticValue || content?.text || 'Texto estático';
  }
  
  // 2. Plantilla dinámica (PRINCIPAL - MEJORADO)
  if (content?.fieldType === 'dynamic' && content?.dynamicTemplate) {
    return processTemplate(content.dynamicTemplate, mockData);
  }
  
  // 3. Campo SAP directo (MEJORADO)
  if (content?.fieldType === 'sap-product' && content?.sapField) {
    return getSAPFieldValue(content.sapField, mockData);
  }
  
  // 4. Campo promoción directo
  if (content?.fieldType === 'promotion-data' && content?.promotionField) {
    return getPromotionFieldValue(content.promotionField, mockData);
  }
  
  // 5. QR Code
  if (content?.fieldType === 'qr-code') {
    return 'QR Code';
  }
  
  // 6. Imagen
  if (content?.fieldType === 'image') {
    return 'Imagen';
  }
  
  // 7. Fallback para valores directos (MEJORADO)
  if (content?.staticValue) {
    // Si es un template dinámico en staticValue, procesarlo
    if (content.staticValue.includes('[') && content.staticValue.includes(']')) {
      return processTemplate(content.staticValue, mockData);
    }
    return content.staticValue;
  }
  
  if (content?.text) {
    // Si es un template dinámico en text, procesarlo
    if (content.text.includes('[') && content.text.includes(']')) {
      return processTemplate(content.text, mockData);
    }
    return content.text;
  }
  
  // 8. Fallback final con dato realista
  return 'Heladera Whirlpool No Frost 375L';
};

// =====================
// VALIDADOR DE PLANTILLAS
// =====================

export const validateDynamicTemplate = (template: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Buscar variables en la plantilla
  const variables = template.match(/\[([^\]]+)\]/g);
  
  if (variables) {
    variables.forEach(variable => {
      const fieldName = variable.slice(1, -1); // Remover [ y ]
      
      // Verificar si el campo existe en nuestro sistema
      if (!ALL_DYNAMIC_FIELDS[fieldName]) {
        errors.push(`Campo desconocido: ${variable}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// =====================
// EXPORTACIONES ADICIONALES
// =====================

export const getAvailableFields = (): Array<{ value: string; label: string; example: string }> => {
  return Object.entries(ALL_DYNAMIC_FIELDS).map(([fieldId, field]) => ({
    value: fieldId,
    label: field.name,
    example: field.example || 'Ejemplo no disponible'
  }));
};

/**
 * Crea datos mock con un producto específico
 */
export const createMockDataWithProduct = (producto: ProductoReal): MockDataV3 => {
  return {
    ...defaultMockData,
    producto,
    descuento_calculado: producto.precioAnt && producto.precio 
      ? Math.round(((producto.precioAnt - producto.precio) / producto.precioAnt) * 100)
      : 0
  };
};

/**
 * Crea datos mock con contexto completo
 */
export const createMockDataWithContext = (
  producto?: ProductoReal,
  tienda?: Tienda,
  seccion?: Seccion,
  promocion?: Promocion
): MockDataV3 => {
  return {
    ...defaultMockData,
    producto: producto || createMockProduct(), // Siempre incluir un producto mock
    tienda: tienda || defaultMockData.tienda,
    seccion: seccion || defaultMockData.seccion,
    promocion,
    descuento_calculado: producto?.precioAnt && producto?.precio 
      ? Math.round(((producto.precioAnt - producto.precio) / producto.precioAnt) * 100)
      : 18 // Descuento por defecto del mock
  };
}; 