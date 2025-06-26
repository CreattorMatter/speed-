// =====================================
// MAPEO UNIVERSAL DE CAMPOS DINÁMICOS
// =====================================

import { Product } from '../data/products';

// =====================
// DEFINICIONES DE CAMPOS
// =====================

export interface DynamicFieldCategory {
  id: string;
  name: string;
  icon: string;
  fields: DynamicField[];
}

export interface DynamicField {
  id: string;
  name: string;
  description: string;
  fieldKey: string; // Para mapear al producto
  example?: string;
  formatter?: (value: any, product?: Product) => string;
}

// =====================
// FORMATEADORES AUXILIARES  
// =====================

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

const formatPriceWithoutCurrency = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
};

const calculatePriceWithoutTax = (price: number): number => {
  return price / 1.21; // Quitar IVA del 21%
};

const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
  if (originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// =====================
// CATEGORÍAS DE CAMPOS DINÁMICOS
// =====================

export const DYNAMIC_FIELD_CATEGORIES: DynamicFieldCategory[] = [
  {
    id: 'product-basic',
    name: 'Información del Producto',
    icon: '📦',
    fields: [
      {
        id: 'product_name',
        name: 'Nombre del Producto',
        description: 'Nombre completo del producto',
        fieldKey: 'name',
        example: 'Heladera Whirlpool No Frost 375L'
      },
      {
        id: 'product_sku',
        name: 'Código SKU',
        description: 'Código único del producto',
        fieldKey: 'sku',
        example: 'MDH-002'
      },
      {
        id: 'product_description',
        name: 'Descripción',
        description: 'Descripción detallada del producto',
        fieldKey: 'description',
        example: 'Heladera No Frost con freezer superior'
      },
      {
        id: 'product_category',
        name: 'Categoría',
        description: 'Categoría principal del producto',
        fieldKey: 'category',
        example: 'Electrodomésticos'
      },
      {
        id: 'product_subcategory',
        name: 'Subcategoría',
        description: 'Subcategoría del producto (si existe)',
        fieldKey: 'subCategory',
        example: 'Aceites Comunes'
      },
      {
        id: 'product_brand',
        name: 'Marca',
        description: 'Marca del producto',
        fieldKey: 'brand',
        example: 'WHIRLPOOL'
      },
      {
        id: 'product_package',
        name: 'Tipo de Empaque',
        description: 'Tipo de empaque/envase',
        fieldKey: 'packageType',
        example: 'Botella de Plástico'
      },
      {
        id: 'product_volume',
        name: 'Volumen/Tamaño',
        description: 'Volumen o tamaño del producto',
        fieldKey: 'volume',
        example: '1.5 L'
      }
    ]
  },
  {
    id: 'product-pricing',
    name: 'Precios y Finanzas',
    icon: '💰',
    fields: [
      {
        id: 'product_price',
        name: 'Precio con IVA',
        description: 'Precio final con IVA incluido',
        fieldKey: 'price',
        example: '$ 699.999,99',
        formatter: (price: number) => formatPrice(price)
      },
      {
        id: 'price_without_tax',
        name: 'Precio sin IVA',
        description: 'Precio sin impuestos (IVA)',
        fieldKey: 'price',
        example: '$ 578.512,39',
        formatter: (price: number) => formatPrice(calculatePriceWithoutTax(price))
      },
      {
        id: 'price_number_only',
        name: 'Precio Solo Números',
        description: 'Precio sin símbolo de moneda',
        fieldKey: 'price',
        example: '699.999,99',
        formatter: (price: number) => formatPriceWithoutCurrency(price)
      },
      {
        id: 'currency_symbol',
        name: 'Símbolo de Moneda',
        description: 'Símbolo $ de pesos',
        fieldKey: 'static',
        example: '$',
        formatter: () => '$'
      },
      {
        id: 'discount_percentage',
        name: 'Porcentaje de Descuento',
        description: 'Porcentaje de descuento aplicado',
        fieldKey: 'price',
        example: '25%',
        formatter: (currentPrice: number, product?: Product) => {
          // En el futuro podríamos tener precio original vs actual
          const originalPrice = currentPrice * 1.3; // Simulación
          const discount = calculateDiscountPercentage(originalPrice, currentPrice);
          return discount > 0 ? `${discount}%` : '0%';
        }
      },
      {
        id: 'installment_price',
        name: 'Precio en Cuotas',
        description: 'Precio mensual en cuotas',
        fieldKey: 'price',
        example: '$ 58.333,33',
        formatter: (price: number) => formatPrice(price / 12) // 12 cuotas por defecto
      },
      {
        id: 'installment_count',
        name: 'Cantidad de Cuotas',
        description: 'Número de cuotas disponibles',
        fieldKey: 'static',
        example: '12',
        formatter: () => '12' // Por defecto 12 cuotas
      }
    ]
  },
  {
    id: 'dates-promos',
    name: 'Fechas y Promociones',
    icon: '📅',
    fields: [
      {
        id: 'current_date',
        name: 'Fecha Actual',
        description: 'Fecha de hoy',
        fieldKey: 'static',
        example: '25/01/2025',
        formatter: () => formatDate(new Date())
      },
      {
        id: 'promotion_end_date',
        name: 'Fin de Promoción',
        description: 'Fecha límite de la promoción',
        fieldKey: 'static',
        example: '31/01/2025',
        formatter: () => {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 7); // 7 días desde hoy
          return formatDate(endDate);
        }
      },
      {
        id: 'promo_validity',
        name: 'Validez de Promoción',
        description: 'Texto de validez',
        fieldKey: 'static',
        example: 'Válido hasta 31/01/2025',
        formatter: () => {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 7);
          return `Válido hasta ${formatDate(endDate)}`;
        }
      },
      {
        id: 'promotion_name',
        name: 'Nombre de Promoción',
        description: 'Nombre de la promoción activa',
        fieldKey: 'static',
        example: 'Black Friday',
        formatter: () => 'Oferta Especial' // Por defecto
      }
    ]
  },
  {
    id: 'formatting',
    name: 'Formato y Estilos',
    icon: '🎨',
    fields: [
      {
        id: 'price_large',
        name: 'Precio Grande',
        description: 'Precio con formato destacado',
        fieldKey: 'price',
        example: '$ 699.999',
        formatter: (price: number) => formatPrice(Math.floor(price))
      },
      {
        id: 'price_small',
        name: 'Precio Pequeño',
        description: 'Precio con formato reducido',
        fieldKey: 'price',
        example: '699.999',
        formatter: (price: number) => formatPriceWithoutCurrency(Math.floor(price))
      },
      {
        id: 'product_name_upper',
        name: 'Nombre en Mayúsculas',
        description: 'Nombre del producto en mayúsculas',
        fieldKey: 'name',
        example: 'HELADERA WHIRLPOOL NO FROST 375L',
        formatter: (name: string) => name.toUpperCase()
      },
      {
        id: 'product_brand_upper',
        name: 'Marca en Mayúsculas',
        description: 'Marca en mayúsculas',
        fieldKey: 'brand',
        example: 'WHIRLPOOL',
        formatter: (brand: string) => brand ? brand.toUpperCase() : ''
      }
    ]
  }
];

// =====================
// MAPEO UNIVERSAL DE CAMPOS
// =====================

/**
 * Mapa de todos los campos dinámicos para acceso rápido
 */
export const ALL_DYNAMIC_FIELDS = DYNAMIC_FIELD_CATEGORIES.reduce((acc, category) => {
  category.fields.forEach(field => {
    acc[field.id] = field;
  });
  return acc;
}, {} as Record<string, DynamicField>);

/**
 * Obtiene el valor de un campo dinámico para un producto específico
 */
export const getDynamicFieldValue = (fieldId: string, product: Product): string => {
  const field = ALL_DYNAMIC_FIELDS[fieldId];
  if (!field) {
    console.warn(`⚠️ Campo dinámico no encontrado: ${fieldId}`);
    return `[${fieldId}]`; // Fallback
  }

  try {
    // Obtener valor base del producto
    let baseValue: any;
    
    if (field.fieldKey === 'static') {
      baseValue = null; // Los campos estáticos no usan el producto
    } else {
      baseValue = (product as any)[field.fieldKey];
    }

    // Aplicar formateador si existe
    if (field.formatter) {
      return field.formatter(baseValue, product);
    }

    // Retornar valor base o fallback
    return baseValue?.toString() || `[${fieldId}]`;
    
  } catch (error) {
    console.error(`❌ Error obteniendo valor para campo ${fieldId}:`, error);
    return `[${fieldId}]`;
  }
};

/**
 * Detecta y extrae todos los campos dinámicos de un template
 */
export const extractDynamicFields = (dynamicTemplate: string): string[] => {
  const regex = /\[([^\]]+)\]/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(dynamicTemplate)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
};

/**
 * Procesa un template reemplazando todos los campos dinámicos
 */
export const processDynamicTemplate = (dynamicTemplate: string, product: Product): string => {
  if (!dynamicTemplate || !product) {
    return dynamicTemplate || '';
  }

  let processedTemplate = dynamicTemplate;
  const fields = extractDynamicFields(dynamicTemplate);

  fields.forEach(fieldId => {
    const value = getDynamicFieldValue(fieldId, product);
    const regex = new RegExp(`\\[${fieldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
    processedTemplate = processedTemplate.replace(regex, value);
  });

  return processedTemplate;
};

// =====================
// COMPATIBILIDAD CON SISTEMA ANTERIOR
// =====================

/**
 * Mapeo de compatibilidad con campos antiguos
 */
export const LEGACY_FIELD_MAPPING: Record<string, string> = {
  'product_name': 'product_name',
  'product_price': 'product_price', 
  'product_sku': 'product_sku',
  'product_description': 'product_description',
  'product_category': 'product_category',
  'product_brand': 'product_brand'
};

/**
 * Obtiene valor usando mapeo legacy (para compatibilidad)
 */
export const getLegacyFieldValue = (fieldName: string, product: Product): string => {
  const modernFieldId = LEGACY_FIELD_MAPPING[fieldName] || fieldName;
  return getDynamicFieldValue(modernFieldId, product);
}; 