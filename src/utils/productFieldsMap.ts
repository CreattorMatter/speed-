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
  formatter?: (value: any, product?: ProductoReal, outputFormat?: any) => string;
}

// =====================
// FORMATEADORES AUXILIARES  
// =====================

const formatPrice = (
  price: number,
  options?: { 
    prefix?: string | boolean; 
    precision?: number | string; 
    showCurrencySymbol?: boolean; 
    showDecimals?: boolean;
    superscriptDecimals?: boolean; // 🆕 Nueva opción para superíndice
  }
): string => {
  // Compatibilidad y opciones modernas
  const showCurrencySymbol = options?.showCurrencySymbol !== false && options?.prefix !== false;
  const superscriptDecimals = options?.superscriptDecimals === true;

  let precision: number;
  if (options?.precision !== undefined) {
    const precisionStr = typeof options.precision === 'string' ? options.precision : options.precision.toString();
    // 🆕 Detectar superíndice en el valor precision
    const useSuperscript = superscriptDecimals || precisionStr.includes('-small');
    
    if (precisionStr.includes('1')) precision = 1;
    else if (precisionStr.includes('2')) precision = 2;
    else precision = parseInt(precisionStr, 10) || 0;
    
    // 🆕 MODO SUPERÍNDICE
    if (useSuperscript && precision > 0) {
      const integerPart = Math.floor(price);
      const decimalPart = ((price - integerPart) * Math.pow(10, precision)).toFixed(0).padStart(precision, '0');
      
      // Formatear parte entera con separadores de miles
      const formattedInteger = new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true
      }).format(integerPart);
      
      // Convertir decimales a superíndice
      const superscriptMap: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
      };
      const superscriptDecimalStr = decimalPart.split('').map(d => superscriptMap[d] || d).join('');
      
      if (showCurrencySymbol) {
        return `$ ${formattedInteger}${superscriptDecimalStr}`;
      } else {
        return `${formattedInteger}${superscriptDecimalStr}`;
      }
    }
  } else if (options?.showDecimals === true) {
    precision = 2;
  } else {
    precision = 0;
  }

  // 🔄 MODO NORMAL: usar Intl.NumberFormat estándar
  if (showCurrencySymbol) {
    // Con símbolo de moneda (peso)
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(price);
  }

  // Sin símbolo de moneda
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    useGrouping: true,
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
        formatter: (price: number, _: any, outputFormat: any) => formatPrice(price, outputFormat)
      },
      {
        id: 'price_previous',
        name: 'Precio Anterior',
        description: 'Precio anterior (para antes/ahora)',
        fieldKey: 'precioAnt',
        example: '$ 849.999',
        formatter: (price: number, _: any, outputFormat: any) => price ? formatPrice(price, outputFormat) : 'No disponible'
      },
      {
        id: 'price_base',
        name: 'Precio Base',
        description: 'Precio sin impuestos nacionales',
        fieldKey: 'basePrice',
        example: '$ 578.511',
        formatter: (price: number, _: any, outputFormat: any) => price ? formatPrice(price, outputFormat) : 'No disponible'
      },
      {
        id: 'price_without_tax',
        name: 'Precio sin IVA',
        description: 'Precio sin IVA (21%)',
        fieldKey: 'precio',
        example: '$ 578.512',
        formatter: (price: number, _: any, outputFormat: any) => price ? formatPrice(price / 1.21, outputFormat) : 'No disponible'
      },
      {
        id: 'price_unit_alt',
        name: 'Precio Unidad Alternativa',
        description: 'Precio por unidad secundaria',
        fieldKey: 'ppum',
        example: '$ 866/mL',
        formatter: (price: number, product?: ProductoReal, outputFormat?: any) => {
          if (!price || !product?.unidadPpumExt) return 'No disponible';
          return `${formatPrice(price, outputFormat)}/${product.unidadPpumExt}`;
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
        formatter: (_, product?: ProductoReal, outputFormat?: any) => {
          if (!product?.precio || !product?.precioAnt) return 'Sin descuento';
          const ahorro = product.precioAnt - product.precio;
          return ahorro > 0 ? formatPrice(ahorro, outputFormat) : 'Sin descuento';
        }
      },
      {
        id: 'installment_price',
        name: 'Precio en Cuotas',
        description: 'Precio mensual en cuotas',
        fieldKey: 'precio',
        example: '$ 58.333',
        formatter: (price: number, _: any, outputFormat?: any) => price ? formatPrice(price / 12, outputFormat) : 'No disponible'
      },
      {
        id: 'descuento',
        name: 'Descuento',
        description: 'Porcentaje de descuento del producto (entero sin %)',
        fieldKey: 'static',
        example: '20',
        formatter: (_: any, product?: ProductoReal, outputFormat?: any, discountPercent?: number) => {
          // 🆕 Priorizar discountPercent (editado inline) sobre valor por defecto 0
          if (discountPercent !== undefined && discountPercent !== null) {
            return discountPercent.toString();
          }
          // 🔧 CAMBIO CRÍTICO: Inicializar en 0, NO usar cálculo automático
          return '0';
        }
      },
      {
        id: 'precio_descuento',
        name: 'Precio con Descuento',
        description: 'Precio final con el descuento aplicado',
        fieldKey: 'static',
        example: '$ 560.000',
        formatter: (_: any, product?: ProductoReal, outputFormat?: any, discountPercent?: number) => {
          if (!product?.precio) return formatPrice(0, outputFormat);
          
          // 🔧 CAMBIO CRÍTICO: Solo aplicar descuento si discountPercent > 0 (CÁLCULO EXACTO)
          // Si discountPercent es 0 o undefined, mostrar precio original SIN descuento
          if (discountPercent !== undefined && discountPercent !== null && discountPercent > 0) {
            const finalPrice = Math.round(product.precio * (1 - discountPercent / 100));
            return formatPrice(finalPrice, outputFormat);
          }
          
          // Si no hay descuento (0 o undefined), mostrar precio original
          return formatPrice(product.precio, outputFormat);
        }
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
        id: 'cuota',
        name: 'Número de Cuotas',
        description: 'Cantidad de cuotas seleccionadas (se actualiza desde la cartelera)',
        fieldKey: 'cuotas',
        example: '6',
        formatter: (_baseValue: any, _product?: any, _outputFormat?: any, cuotas?: number) => {
          // 🎯 Usar cuotas del parámetro financingCuotas, no del baseValue
          const cuotasValue = cuotas || 0;
          console.log(`🔢 [CUOTA FORMATTER] Formateando cuotas: ${cuotasValue}`);
          return cuotasValue.toString();
        }
      },
      {
        id: 'precio_cuota',
        name: 'Precio por Cuota',
        description: 'Precio calculado por cuota (precio_producto / cuota)',
        fieldKey: 'precio_cuota',
        example: '$ 116.666',
        formatter: (_baseValue: any, product?: any, outputFormat?: any, cuotas?: number) => {
          // 🎯 Usar precio del producto, no el baseValue (que es undefined)
          const precioProducto = product?.precio || 0;
          if (!precioProducto || !cuotas || cuotas === 0) return '$ 0,00';
          const precioCuota = Number((precioProducto / cuotas).toFixed(2));
          // 🆕 Forzar 2 decimales para cuotas
          return formatPrice(precioCuota, { ...outputFormat, precision: 2 });
        }
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
        formatter: (price: number, _: any, outputFormat: any) => price ? formatPrice(Math.floor(price), outputFormat) : 'No disponible'
      },
      {
        id: 'price_small',
        name: 'Precio Pequeño',
        description: 'Precio con formato reducido',
        fieldKey: 'precio',
        example: '699.999',
        formatter: (price: number, _: any, outputFormat: any) => price ? formatPriceWithoutCurrency(Math.floor(price)) : 'No disponible'
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
export const getDynamicFieldValue = (
  fieldId: string, 
  product: ProductoReal,
  outputFormat?: any,
  financingCuotas?: number,  // 🆕 Parámetro de cuotas para cálculos de financiación
  discountPercent?: number   // 🆕 Parámetro de descuento para cálculos de descuento
): string => {
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
      // Manejo especial para campos de descuento
      if (fieldId === 'descuento' || fieldId === 'discount_percentage') {
        return (discountPercent || 0).toString();
      } else if (fieldId === 'precio_descuento') {
        const precio = product.precio || 0;
        const dto = discountPercent || 0;
        // 🔧 CÁLCULO EXACTO: usar Math.round para evitar decimales flotantes
        const finalPrice = dto > 0 ? Math.round(precio * (1 - dto / 100)) : precio;
        return formatPrice(finalPrice, outputFormat);
      }
      // @ts-ignore - Los formatters pueden aceptar diferentes números de parámetros
      return field.formatter(baseValue, product, outputFormat, discountPercent);
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
/**
 * 🆕 Genera placeholders amigables para campos dinámicos cuando no hay producto
 * Reemplaza variables dinámicas con placeholders apropiados según el tipo de dato
 */
export const generateDynamicPlaceholder = (dynamicTemplate: string): string => {
  if (!dynamicTemplate) {
    return '';
  }

  let placeholderTemplate = dynamicTemplate;

  // 🔢 Campos numéricos/monetarios → 000.000
  const numericFields = [
    'product_price', 'precio', 'basePrice', 'precioAnt', 'stockDisponible',
    'precioSinImpuestos', 'precio_descuento', 'precio_cuota', 'cuota_valor',
    'price_base', 'base_price', 'price_without_tax', 'price_with_tax'
  ];
  numericFields.forEach(field => {
    const regex = new RegExp(`\\[${field}\\]`, 'g');
    placeholderTemplate = placeholderTemplate.replace(regex, '000.000');
  });

  // 📊 Campos de porcentaje → 00%
  const percentageFields = ['porcentaje', 'descuento', 'discount_percentage'];
  percentageFields.forEach(field => {
    const regex = new RegExp(`\\[${field}\\]`, 'g');
    placeholderTemplate = placeholderTemplate.replace(regex, '00%');
  });

  // 🔢 Campos de cantidad → 00
  const quantityFields = ['cuota', 'cuotas', 'stockDisponible', 'stock'];
  quantityFields.forEach(field => {
    const regex = new RegExp(`\\[${field}\\]`, 'g');
    placeholderTemplate = placeholderTemplate.replace(regex, '00');
  });

  // 📅 Campos de fecha → DD/MM/AAAA
  const dateFields = [
    'fechasDesde', 'fechasHasta', 'validity_period', 'fecha_desde', 'fecha_hasta'
  ];
  dateFields.forEach(field => {
    const regex = new RegExp(`\\[${field}\\]`, 'g');
    placeholderTemplate = placeholderTemplate.replace(regex, 'DD/MM/AAAA');
  });

  // 📝 Campos de texto → XXXX
  const textFields = [
    'descripcion', 'marca', 'marcaTexto', 'sku', 'ean', 'origen', 'paisTexto',
    'product_name', 'product_description', 'product_sku', 'product_ean', 
    'product_origin', 'product_brand', 'product_marca'
  ];
  textFields.forEach(field => {
    const regex = new RegExp(`\\[${field}\\]`, 'g');
    placeholderTemplate = placeholderTemplate.replace(regex, 'XXXX');
  });

  // 💰 Símbolos especiales
  placeholderTemplate = placeholderTemplate.replace(/\[currency_symbol\]/g, '$');

  // 🔍 Fallback inteligente para campos no categorizados
  // Buscar cualquier campo restante [field_name] y decidir por el nombre
  placeholderTemplate = placeholderTemplate.replace(/\[([^\]]+)\]/g, (match, fieldName) => {
    const field = fieldName.toLowerCase();
    
    // Si contiene "price", "cost", "value", "amount" → numérico
    if (field.includes('price') || field.includes('cost') || field.includes('value') || 
        field.includes('amount') || field.includes('precio') || field.includes('total')) {
      return '000.000';
    }
    
    // Si contiene "percent", "rate", "%" → porcentaje  
    if (field.includes('percent') || field.includes('rate') || field.includes('%') || 
        field.includes('porcentaje') || field.includes('tasa')) {
      return '00%';
    }
    
    // Si contiene "date", "fecha", "time" → fecha
    if (field.includes('date') || field.includes('fecha') || field.includes('time') || 
        field.includes('desde') || field.includes('hasta')) {
      return 'DD/MM/AAAA';
    }
    
    // Si contiene "count", "quantity", "stock", "cuota" → cantidad
    if (field.includes('count') || field.includes('quantity') || field.includes('stock') || 
        field.includes('cuota') || field.includes('cantidad')) {
      return '00';
    }
    
    // Por defecto, campos de texto → XXXX
    return 'XXXX';
  });

  return placeholderTemplate;
};

export const processDynamicTemplate = (
  dynamicTemplate: string, 
  product: ProductoReal,
  outputFormat?: any,
  financingCuotas?: number,  // 🆕 Parámetro de cuotas para cálculos de financiación
  discountPercent?: number   // 🆕 Parámetro de descuento para cálculos de descuento
): string => {
  if (!dynamicTemplate || !product) {
    return dynamicTemplate || '';
  }

  let processedTemplate = dynamicTemplate;
  const fields = extractDynamicFields(dynamicTemplate);

  fields.forEach(fieldId => {
    // Manejo especial para campos de descuento que usan el parámetro discountPercent
    let value: string;
    if (fieldId === 'descuento' || fieldId === 'discount_percentage') {
      value = (discountPercent || 0).toString();
    } else if (fieldId === 'precio_descuento') {
      const precio = product.precio || 0;
      const dto = discountPercent || 0;
      // 🔧 CÁLCULO EXACTO: usar Math.round para evitar decimales flotantes
      const finalPrice = dto > 0 ? Math.round(precio * (1 - dto / 100)) : precio;
      value = formatPrice(finalPrice, outputFormat);
    } else {
      value = getDynamicFieldValue(fieldId, product, outputFormat, financingCuotas, discountPercent);
    }
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