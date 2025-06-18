// =====================================
// PROCESADOR DE CONTENIDO DINÁMICO COMPARTIDO
// =====================================

import { DraggableComponentV3 } from '../types/builder-v3';

// =====================
// TIPOS DE DATOS MOCK
// =====================

export interface MockDataV3 {
  // Datos de producto
  product_name: string;
  product_price: number;
  price_without_tax: number;
  product_sku: string;
  product_brand: string;
  product_category: string;
  product_origin: string;
  product_description: string;
  
  // Datos de promoción
  price_now: number;
  discount_percentage: number;
  discount_amount: number;
  date_from: string;
  date_to: string;
  promotion_name: string;
  
  // Datos calculados
  final_price: number;
  
  // Datos de tienda
  store_name: string;
  store_address: string;
}

// =====================
// DATOS MOCK POR DEFECTO
// =====================

export const defaultMockData: MockDataV3 = {
  // Productos
  product_name: 'Taladro Percutor Bosch',
  product_price: 25990,
  price_without_tax: 21900,
  product_sku: 'BSH-TD-001',
  product_brand: 'Bosch',
  product_category: 'Herramientas',
  product_origin: 'Alemania',
  product_description: 'Taladro percutor profesional 850W',
  
  // Promociones
  price_now: 19990,
  discount_percentage: 25,
  discount_amount: 6000,
  date_from: '15/06/2025',
  date_to: '30/06/2025',
  promotion_name: 'Hot Sale 2025',
  
  // Calculados
  final_price: 19990,
  
  // Tienda
  store_name: 'Easy Pilar',
  store_address: 'Av. Presidente Perón 1823, Pilar'
};

// =====================
// FUNCIONES DE FORMATEO
// =====================

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-AR').format(num);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage}%`;
};

// =====================
// PROCESAMIENTO DE PLANTILLAS
// =====================

export const processTemplate = (template: string, data: MockDataV3): string => {
  let processed = template;
  
  // Reemplazar variables con datos mock
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\[${key}\\]`, 'gi');
    let formattedValue = value.toString();
    
    // Formatear según el tipo de dato
    if (key.includes('price') && typeof value === 'number') {
      formattedValue = formatPrice(value);
    } else if (key.includes('percentage') && typeof value === 'number') {
      formattedValue = formatPercentage(value);
    } else if (key.includes('amount') && typeof value === 'number') {
      formattedValue = formatPrice(value);
    } else if (typeof value === 'number') {
      formattedValue = formatNumber(value);
    }
    
    processed = processed.replace(regex, formattedValue);
  });

  return processed;
};

// =====================
// MAPEO DE CAMPOS SAP
// =====================

export const getSAPFieldValue = (fieldName: string, data: MockDataV3): string => {
  const fieldMap: Record<string, string> = {
    'product_name': data.product_name,
    'product_price': formatPrice(data.product_price),
    'price_without_tax': formatPrice(data.price_without_tax),
    'product_sku': data.product_sku,
    'product_brand': data.product_brand,
    'product_category': data.product_category,
    'product_origin': data.product_origin,
    'product_description': data.product_description
  };
  
  return fieldMap[fieldName] || `[${fieldName}]`;
};

// =====================
// MAPEO DE CAMPOS DE PROMOCIÓN
// =====================

export const getPromotionFieldValue = (fieldName: string, data: MockDataV3): string => {
  const fieldMap: Record<string, string> = {
    'price_now': formatPrice(data.price_now),
    'discount_percentage': formatPercentage(data.discount_percentage),
    'discount_amount': formatPrice(data.discount_amount),
    'date_from': data.date_from,
    'date_to': data.date_to,
    'promotion_name': data.promotion_name
  };
  
  return fieldMap[fieldName] || `[${fieldName}]`;
};

// =====================
// PROCESADOR PRINCIPAL
// =====================

export const processDynamicContent = (
  component: DraggableComponentV3, 
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
  
  // 2. Plantilla dinámica
  if (content?.fieldType === 'dynamic' && content?.dynamicTemplate) {
    return processTemplate(content.dynamicTemplate, mockData);
  }
  
  // 3. Campo SAP directo
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
  
  // 7. Fallback para valores directos
  if (content?.staticValue) {
    return content.staticValue;
  }
  
  if (content?.text) {
    return content.text;
  }
  
  // 8. Fallback final
  return 'Texto de ejemplo';
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
      
      // Verificar si el campo existe en mockData
      if (!(fieldName in defaultMockData)) {
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
  return [
    // Campos SAP
    { value: 'product_name', label: 'Nombre del Producto', example: defaultMockData.product_name },
    { value: 'product_price', label: 'Precio', example: formatPrice(defaultMockData.product_price) },
    { value: 'price_without_tax', label: 'Precio sin Impuestos', example: formatPrice(defaultMockData.price_without_tax) },
    { value: 'product_sku', label: 'SKU', example: defaultMockData.product_sku },
    { value: 'product_brand', label: 'Marca', example: defaultMockData.product_brand },
    { value: 'product_category', label: 'Categoría', example: defaultMockData.product_category },
    { value: 'product_origin', label: 'Origen', example: defaultMockData.product_origin },
    { value: 'product_description', label: 'Descripción', example: defaultMockData.product_description },
    
    // Campos de promoción
    { value: 'price_now', label: 'Precio Ahora', example: formatPrice(defaultMockData.price_now) },
    { value: 'discount_percentage', label: 'Descuento %', example: formatPercentage(defaultMockData.discount_percentage) },
    { value: 'discount_amount', label: 'Descuento Monto', example: formatPrice(defaultMockData.discount_amount) },
    { value: 'date_from', label: 'Fecha Desde', example: defaultMockData.date_from },
    { value: 'date_to', label: 'Fecha Hasta', example: defaultMockData.date_to },
    { value: 'promotion_name', label: 'Nombre Promoción', example: defaultMockData.promotion_name }
  ];
}; 