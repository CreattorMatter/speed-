// =====================================
// MAPEO UNIVERSAL DE CAMPOS DINÁMICOS V2
// COMPATIBLE CON ENTIDADES REALES DEL SISTEMA ERP
// =====================================

import { ProductoReal } from '../types/product';

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
  formatter?: (value: any, product?: ProductoReal) => string;
}

// =====================
// FORMATEADORES AUXILIARES  
// =====================

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const formatPriceWithoutCurrency = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
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

const calculateDiscountPercentage = (producto: ProductoReal): number => {
  if (!producto.precio || !producto.precioAnt) return 0;
  return Math.round(((producto.precioAnt - producto.precio) / producto.precioAnt) * 100);
};

// =====================
// CATEGORÍAS DE CAMPOS DINÁMICOS EXPANDIDAS
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
        fieldKey: 'descripcion',
        example: 'Heladera Whirlpool No Frost 375L'
      },
      {
        id: 'product_sku',
        name: 'Código SKU',
        description: 'Código único del producto',
        fieldKey: 'sku',
        example: '123001'
      },
      {
        id: 'product_ean',
        name: 'Código EAN',
        description: 'Código de barras del producto',
        fieldKey: 'ean',
        example: '7790123456789'
      },
      {
        id: 'product_description',
        name: 'Descripción',
        description: 'Descripción detallada del producto',
        fieldKey: 'descripcion',
        example: 'Heladera No Frost con freezer superior'
      },
      {
        id: 'product_brand',
        name: 'Marca',
        description: 'Marca del producto',
        fieldKey: 'marcaTexto',
        example: 'WHIRLPOOL'
      },
      {
        id: 'product_brand_upper',
        name: 'Marca en Mayúsculas',
        description: 'Marca del producto en mayúsculas',
        fieldKey: 'marcaTexto',
        example: 'WHIRLPOOL',
        formatter: (brand: string) => brand ? brand.toUpperCase() : ''
      },
      {
        id: 'product_unit',
        name: 'Unidad de Medida',
        description: 'Unidad de medida del producto',
        fieldKey: 'umvExt',
        example: 'Kg'
      }
    ]
  },
  {
    id: 'product-classification',
    name: 'Clasificación y Categorías',
    icon: '🏷️',
    fields: [
      {
        id: 'product_seccion',
        name: 'Sección',
        description: 'Sección del producto',
        fieldKey: 'seccion',
        example: 'Electrodomésticos'
      },
      {
        id: 'product_grupo',
        name: 'Grupo',
        description: 'Grupo del producto',
        fieldKey: 'grupo',
        example: 'Línea Blanca'
      },
      {
        id: 'product_rubro',
        name: 'Rubro',
        description: 'Rubro específico',
        fieldKey: 'rubro',
        example: 'Heladeras'
      },
      {
        id: 'product_subrubro',
        name: 'SubRubro',
        description: 'SubRubro específico',
        fieldKey: 'subRubro',
        example: 'No Frost'
      },
      {
        id: 'classification_complete',
        name: 'Clasificación Completa',
        description: 'Jerarquía completa de clasificación',
        fieldKey: 'static',
        example: 'Electrodomésticos > Línea Blanca > Heladeras > No Frost',
        formatter: (_, product?: ProductoReal) => {
          if (!product) return '';
          const parts = [product.seccion, product.grupo, product.rubro, product.subRubro]
            .filter(Boolean);
          return parts.join(' > ');
        }
      }
    ]
  },
  {
    id: 'product-pricing',
    name: 'Sistema de Precios',
    icon: '💰',
    fields: [
      {
        id: 'product_price',
        name: 'Precio Actual',
        description: 'Precio actual de venta',
        fieldKey: 'precio',
        example: '$ 699.999',
        formatter: (price: number) => formatPrice(price)
      },
      {
        id: 'price_previous',
        name: 'Precio Anterior',
        description: 'Precio anterior (para antes/ahora)',
        fieldKey: 'precioAnt',
        example: '$ 849.999',
        formatter: (price: number) => price ? formatPrice(price) : 'No disponible'
      },
      {
        id: 'price_base',
        name: 'Precio Base',
        description: 'Precio sin impuestos nacionales',
        fieldKey: 'basePrice',
        example: '$ 578.511',
        formatter: (price: number) => price ? formatPrice(price) : 'No disponible'
      },
      {
        id: 'price_without_tax',
        name: 'Precio sin IVA',
        description: 'Precio sin IVA (21%)',
        fieldKey: 'precio',
        example: '$ 578.512',
        formatter: (price: number) => price ? formatPrice(price / 1.21) : 'No disponible'
      },
      {
        id: 'price_unit_alt',
        name: 'Precio Unidad Alternativa',
        description: 'Precio por unidad secundaria',
        fieldKey: 'ppum',
        example: '$ 866/mL',
        formatter: (price: number, product?: ProductoReal) => {
          if (!price || !product?.unidadPpumExt) return 'No disponible';
          return `${formatPrice(price)}/${product.unidadPpumExt}`;
        }
      },
      {
        id: 'discount_percentage',
        name: 'Porcentaje de Descuento',
        description: 'Descuento real calculado',
        fieldKey: 'static',
        example: '18%',
        formatter: (_, product?: ProductoReal) => {
          if (!product) return '0%';
          const discount = calculateDiscountPercentage(product);
          return discount > 0 ? `${discount}%` : 'Sin descuento';
        }
      },
      {
        id: 'discount_amount',
        name: 'Ahorro en Pesos',
        description: 'Cantidad ahorrada en pesos',
        fieldKey: 'static',
        example: '$ 150.000',
        formatter: (_, product?: ProductoReal) => {
          if (!product?.precio || !product?.precioAnt) return 'Sin descuento';
          const ahorro = product.precioAnt - product.precio;
          return ahorro > 0 ? formatPrice(ahorro) : 'Sin descuento';
        }
      },
      {
        id: 'installment_price',
        name: 'Precio en Cuotas',
        description: 'Precio mensual en cuotas',
        fieldKey: 'precio',
        example: '$ 58.333',
        formatter: (price: number) => price ? formatPrice(price / 12) : 'No disponible'
      },
      {
        id: 'currency_symbol',
        name: 'Símbolo de Moneda',
        description: 'Símbolo $ de pesos',
        fieldKey: 'static',
        example: '$',
        formatter: () => '$'
      }
    ]
  },
  {
    id: 'product-origin',
    name: 'Origen y Ubicación',
    icon: '🌍',
    fields: [
      {
        id: 'product_origin',
        name: 'País de Origen',
        description: 'País de origen del producto',
        fieldKey: 'paisTexto',
        example: 'Argentina'
      },
      {
        id: 'product_origin_code',
        name: 'Código de Origen',
        description: 'Código del país de origen',
        fieldKey: 'origen',
        example: 'ARG'
      },
      {
        id: 'store_code',
        name: 'Código de Tienda',
        description: 'Código de la tienda',
        fieldKey: 'tienda',
        example: 'E000'
      }
    ]
  },
  {
    id: 'product-stock',
    name: 'Stock e Inventario',
    icon: '📊',
    fields: [
      {
        id: 'stock_available',
        name: 'Stock Disponible',
        description: 'Cantidad en stock',
        fieldKey: 'stockDisponible',
        example: '15 unidades',
        formatter: (stock: number) => stock ? `${stock} unidades` : 'Sin stock'
      },
      {
        id: 'stock_status',
        name: 'Estado de Stock',
        description: 'Estado del inventario',
        fieldKey: 'stockDisponible',
        example: 'Disponible',
        formatter: (stock: number) => {
          if (!stock) return 'Sin stock';
          if (stock < 5) return 'Últimas unidades';
          if (stock < 20) return 'Stock limitado';
          return 'Disponible';
        }
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
          endDate.setDate(endDate.getDate() + 7);
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
        formatter: () => 'Oferta Especial'
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
        fieldKey: 'precio',
        example: '$ 699.999',
        formatter: (price: number) => price ? formatPrice(Math.floor(price)) : 'No disponible'
      },
      {
        id: 'price_small',
        name: 'Precio Pequeño',
        description: 'Precio con formato reducido',
        fieldKey: 'precio',
        example: '699.999',
        formatter: (price: number) => price ? formatPriceWithoutCurrency(Math.floor(price)) : 'No disponible'
      },
      {
        id: 'product_name_upper',
        name: 'Nombre en Mayúsculas',
        description: 'Nombre del producto en mayúsculas',
        fieldKey: 'descripcion',
        example: 'HELADERA WHIRLPOOL NO FROST 375L',
        formatter: (name: string) => name ? name.toUpperCase() : ''
      },
      {
        id: 'ean_formatted',
        name: 'EAN Formateado',
        description: 'Código EAN con formato',
        fieldKey: 'ean',
        example: '7790-123-456-789',
        formatter: (ean: number) => {
          const eanStr = ean.toString();
          return eanStr.replace(/(\d{4})(\d{3})(\d{3})(\d{3})/, '$1-$2-$3-$4');
        }
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
export const getDynamicFieldValue = (fieldId: string, product: ProductoReal): string => {
  const field = ALL_DYNAMIC_FIELDS[fieldId];
  if (!field) {
    console.warn(`⚠️ Campo dinámico no encontrado: ${fieldId}`);
    return `[${fieldId}]`;
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
export const processDynamicTemplate = (dynamicTemplate: string, product: ProductoReal): string => {
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
  'product_category': 'product_seccion',
  'product_brand': 'product_brand'
};

/**
 * Obtiene valor usando mapeo legacy (para compatibilidad)
 */
export const getLegacyFieldValue = (fieldName: string, product: ProductoReal): string => {
  const modernFieldId = LEGACY_FIELD_MAPPING[fieldName] || fieldName;
  return getDynamicFieldValue(modernFieldId, product);
}; 