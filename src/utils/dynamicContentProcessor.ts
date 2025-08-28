// =====================================
// PROCESADOR DE CONTENIDO DINÁMICO V2
// COMPATIBLE CON ENTIDADES REALES DEL SISTEMA ERP
// =====================================

import { ProductoReal, Tienda, Seccion, Promocion } from '../types/product';
import { getDynamicFieldValue, ALL_DYNAMIC_FIELDS } from './productFieldsMap';
import { calculatePricePorCuota, formatPriceCuota } from './financingCalculator';

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
  fecha_vigencia_desde?: string;
  fecha_vigencia_hasta?: string;
  descuento_calculado: number;
  
  // Nuevos campos de financiación
  cuotas?: number;
  precio_cuota?: number;
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
  fecha_promocion_fin: new Date().toLocaleDateString('es-AR'),
  fecha_vigencia_desde: new Date().toLocaleDateString('es-AR'),
  fecha_vigencia_hasta: new Date().toLocaleDateString('es-AR'),
  descuento_calculado: 18, // 18% de descuento
  producto: createMockProduct(), // AHORA INCLUYE PRODUCTO MOCK REALISTA
  tienda: {
    numero: 'E000',
    tienda: 'Easy Casa Central'
  },
  seccion: {
    numero: 12,
    seccion: 'Electrodomésticos'
  },
  // Campos de financiación con valores por defecto
  cuotas: 0,
  precio_cuota: 0
};

// =====================
// FORMATEADORES
// =====================

const formatPrice = (price: number, outputFormat?: any): string => {
  // 🔧 CORREGIDO: Respetar la configuración de outputFormat
  const showCurrencySymbol = outputFormat?.showCurrencySymbol !== false; // Por defecto true para compatibilidad
  const showDecimals = outputFormat?.showDecimals === true;
  const superscriptDecimals = outputFormat?.superscriptDecimals === true;
  const precision = outputFormat?.precision || '0';
  
  // 🆕 Determinar número de decimales basado en precision
  let decimalPlaces = 0;
  if (precision.includes('1')) decimalPlaces = 1;
  if (precision.includes('2')) decimalPlaces = 2;
  if (showDecimals) decimalPlaces = 2; // Compatibilidad con showDecimals
  
  // 🆕 Detectar superíndice basado en precision o flag
  const useSuperscript = superscriptDecimals || precision.includes('-small');
  
  if (useSuperscript && decimalPlaces > 0) {
    // 🆕 MODO SUPERÍNDICE: separar parte entera de decimales
    const integerPart = Math.floor(price);
    const decimalPart = ((price - integerPart) * Math.pow(10, decimalPlaces)).toFixed(0).padStart(decimalPlaces, '0');
    
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
    const superscriptDecimals = decimalPart.split('').map(d => superscriptMap[d] || d).join('');
    
    if (showCurrencySymbol) {
      return `$ ${formattedInteger}${superscriptDecimals}`;
    } else {
      return `${formattedInteger}${superscriptDecimals}`;
    }
  } else {
    // 🔄 MODO NORMAL: usar Intl.NumberFormat estándar
    if (showCurrencySymbol) {
      // Usar formato con símbolo de moneda
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      }).format(price);
    } else {
      // Usar formato sin símbolo de moneda
      return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
        useGrouping: true
      }).format(price);
    }
  }
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// =====================
// PROCESAMIENTO DE CAMPOS CALCULADOS
// =====================

/**
 * Procesa una expresión matemática calculada reemplazando campos dinámicos con valores reales
 */
export const processCalculatedField = (
  expression: string, 
  mockData: MockDataV3 = defaultMockData,
  outputFormat?: any
): string => {
  if (!expression) return '0';
  
  console.log(`🧮 Iniciando procesamiento de expresión: "${expression}"`);
  
  try {
    let processedExpression = expression;
    
    // Usar el producto (real o mock) si está disponible
    if (mockData.producto) {
      // Extraer campos dinámicos de la expresión
      const fieldRegex = /\[([^\]]+)\]/g;
      let match;
      
      while ((match = fieldRegex.exec(expression)) !== null) {
        const fieldId = match[1];
        console.log(`🔍 Procesando campo en expresión: [${fieldId}]`);
        
        let fieldValue = getDynamicFieldValue(fieldId, mockData.producto);
        
        // Extraer valor numérico desde formatos locales de precio (ej: "$ 849.999,00")
        if (fieldValue.includes('$')) {
          // 1) quitar símbolo y espacios, 2) remover separador de miles '.', 3) cambiar coma decimal por punto
          fieldValue = fieldValue
            .replace(/[$\s]/g, '')
            .replace(/\./g, '')
            .replace(/,/g, '.');
        }
        
        // Extraer solo el número de campos con porcentaje
        if (fieldValue.includes('%')) {
          fieldValue = fieldValue.replace('%', '');
        }
        
        // Convertir a número
        const numericValue = parseFloat(fieldValue);
        if (!isNaN(numericValue)) {
          processedExpression = processedExpression.replace(match[0], numericValue.toString());
          console.log(`✅ Reemplazado [${fieldId}] → ${numericValue}`);
        } else {
          console.warn(`⚠️ No se pudo convertir a número: [${fieldId}] = "${fieldValue}"`);
          // Usar valor por defecto 0 para campos no numéricos
          processedExpression = processedExpression.replace(match[0], '0');
        }
      }
    } else {
      // Fallback usando valores mock estándar
      const mockValues: Record<string, number> = {
        'product_price': 699999,
        'price_previous': 849999,
        'price_base': 578512,
        'price_without_tax': 578512,
        'discount_percentage': 18,
        'discount_amount': 150000,
        'stock_available': 15,
        'installment_price': 58333
      };
      
      const fieldRegex = /\[([^\]]+)\]/g;
      let match;
      
      while ((match = fieldRegex.exec(expression)) !== null) {
        const fieldId = match[1];
        const mockValue = mockValues[fieldId] || 0;
        processedExpression = processedExpression.replace(match[0], mockValue.toString());
        console.log(`🎭 Mock - Reemplazado [${fieldId}] → ${mockValue}`);
      }
    }
    
    console.log(`🔄 Expresión procesada: "${processedExpression}"`);
    
    // Validar que solo contenga números, operadores y espacios
    if (!/^[0-9+\-*/().\s]+$/.test(processedExpression)) {
      console.error(`❌ Expresión inválida después del procesamiento: "${processedExpression}"`);
      return 'Error: Expresión inválida';
    }
    
    // Evaluar la expresión matemática de forma segura
    const result = Function(`"use strict"; return (${processedExpression})`)();
    
    if (isNaN(result) || !isFinite(result)) {
      console.error(`❌ Resultado no numérico o infinito: ${result}`);
      // Fallback seguro a 0 para evitar Infinity en el canvas
      return formatWithOutput(0, outputFormat);
    }
    
    return formatWithOutput(result, outputFormat);
    
  } catch (error) {
    console.error(`❌ Error evaluando expresión "${expression}":`, error);
    return formatWithOutput(0, outputFormat);
  }
};

// Helper: aplica formato respetando outputFormat o devuelve string simple
const formatWithOutput = (value: number, outputFormat?: any): string => {
  try {
    let formatted = '';
    // precision
    const precision = outputFormat?.precision === '2' ? 2
      : (typeof outputFormat?.precision === 'string' && !isNaN(parseInt(outputFormat.precision))
        ? parseInt(outputFormat.precision)
        : 0);
    formatted = Number(value).toFixed(precision);
    // miles
    if (Math.abs(value) >= 1000) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      formatted = parts.join(precision > 0 ? ',' : '');
    }
    // prefijo
    if (outputFormat?.prefix !== false) {
      formatted = `$ ${formatted}`;
    }
    return formatted || '0';
  } catch {
    return '0';
  }
};

// =====================
// CÁLCULO DE FINANCIACIÓN EN TIEMPO REAL
// =====================

/**
 * Calcula y actualiza los campos de financiación en tiempo real
 * @param mockData - Datos actuales
 * @param nuevasCuotas - Nueva cantidad de cuotas (opcional)
 * @returns MockData actualizado con cálculos de financiación
 */
export const updateFinancingFields = (
  mockData: MockDataV3,
  nuevasCuotas?: number
): MockDataV3 => {
  const cuotas = nuevasCuotas ?? mockData.cuotas ?? 0;
  const precio = mockData.producto?.precio ?? 0;

  // Calcular precio por cuota usando la función utilitaria
  const precioCuota = calculatePricePorCuota(precio, cuotas);

  console.log(`🔢 [FINANCING] Actualizando campos de financiación:`, {
    cuotas,
    precio,
    precioCuota,
    formatted: formatPriceCuota(precioCuota, true)
  });

  return {
    ...mockData,
    cuotas,
    precio_cuota: precioCuota
  };
};

/**
 * Procesa campos de financiación específicos
 * @param fieldId - ID del campo ('cuota' o 'precio_cuota')
 * @param mockData - Datos actuales
 * @returns Valor formateado del campo
 */
export const processFinancingField = (fieldId: string, mockData: MockDataV3): string => {
  switch (fieldId) {
    case 'cuota':
      return mockData.cuotas?.toString() ?? '0';
    
    case 'precio_cuota':
      const precioCuota = mockData.precio_cuota ?? 0;
      return formatPriceCuota(precioCuota, true);
    
    default:
      return '';
  }
};

// =====================
// PROCESAMIENTO PRINCIPAL
// =====================

/**
 * Procesa un template dinámico reemplazando todos los campos dinámicos
 */
export const processTemplate = (
  template: string, 
  mockData: MockDataV3 = defaultMockData,
  outputFormat?: any
): string => {
  if (!template) return '';
  
  let processedTemplate = template;
  
  // Usar el producto (real o mock) si está disponible
  if (mockData.producto) {
    // Extraer campos dinámicos del template
    const fieldRegex = /\[([^\]]+)\]/g;
    let match;
    
    while ((match = fieldRegex.exec(template)) !== null) {
      const fieldId = match[1];
      
      // 🆕 CAMPOS DE FINANCIACIÓN: Manejo especial
      if (fieldId === 'cuota' || fieldId === 'precio_cuota') {
        const fieldValue = processFinancingField(fieldId, mockData);
        processedTemplate = processedTemplate.replace(match[0], fieldValue);
      } else {
        const fieldValue = getDynamicFieldValue(fieldId, mockData.producto, outputFormat);
        processedTemplate = processedTemplate.replace(match[0], fieldValue);
      }
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
          'product_price': formatPrice(699999, outputFormat),
          'product_sku': '123001',
          'product_brand': 'WHIRLPOOL',
          'current_date': mockData.fecha_actual,
          'promotion_end_date': mockData.fecha_promocion_fin,
          'store_code': mockData.tienda?.numero || 'E000',
          'product_seccion': mockData.seccion?.seccion || 'Electrodomésticos',
          'cuota': mockData.cuotas?.toString() || '0',
          'precio_cuota': mockData.precio_cuota ? formatPrice(mockData.precio_cuota, outputFormat) : '$ 0'
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
export const getSAPFieldValue = (fieldName: string, data: MockDataV3, outputFormat?: any): string => {
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
    'product_price': formatPrice(699999, outputFormat),
    'price_without_tax': formatPrice(578512, outputFormat),
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
// PROCESADOR PRINCIPAL DE COMPONENTES (CORREGIDO)
// =====================

export const processDynamicContent = (
  contentOrComponent: any, 
  mockData: MockDataV3 = defaultMockData,
  outputFormat?: any
): string => {
  // 🔧 CORRECCIÓN: Detectar si se pasó el content directamente o el componente completo
  let content: any;
  let componentType: string | undefined;
  
  if (contentOrComponent?.content) {
    // Se pasó el componente completo
    content = contentOrComponent.content;
    componentType = contentOrComponent.type;
    console.log(`📦 Se pasó componente completo:`, { type: componentType, content });
  } else {
    // Se pasó solo el content
    content = contentOrComponent;
    componentType = undefined;
    console.log(`📄 Se pasó content directamente:`, { content });
  }
  
  if (!content) {
    console.log(`⚠️ No hay content, usando fallback por tipo de componente: ${componentType}`);
    // Fallback específico por tipo de componente cuando no hay content
    switch (componentType) {
      case 'field-dynamic-text':
        return mockData.producto?.descripcion || 'Heladera Whirlpool No Frost 375L';
      // field-dynamic-date eliminado - usar validity-period en su lugar
      default:
        return 'Contenido por defecto';
    }
  }
  
  console.log(`🔍 Procesando content:`, {
    fieldType: content.fieldType,
    dynamicTemplate: content.dynamicTemplate,
    staticValue: content.staticValue,
    textConfig: content.textConfig
  });
  
  // 1. Contenido estático directo - generar datos mock apropiados
  if (content?.fieldType === 'static') {
    console.log(`📝 Procesando contenido estático: "${content.staticValue}"`);
    // Para campos estáticos, generar datos mock basados en el contexto
    const staticValue = content?.staticValue || content?.text || 'Texto estático';
    
    // Si parece ser un precio, mostrar precio mock
    if (staticValue.toLowerCase().includes('precio') || staticValue.includes('$')) {
      return '$ 99.999';
    }
    // Si parece ser un porcentaje, mostrar porcentaje mock
    if (staticValue.toLowerCase().includes('descuento') || staticValue.toLowerCase().includes('off') || staticValue.includes('%')) {
      return '25% OFF';
    }
    // Si parece ser texto promocional, mostrar texto mock
    if (staticValue.toLowerCase().includes('super') || staticValue.toLowerCase().includes('mega') || staticValue.toLowerCase().includes('oferta')) {
      return 'SUPER OFERTA';
    }
    // Para otros campos estáticos, generar texto mock genérico
    return 'Texto Ejemplo';
  }
  
  // 2. Campo calculado (NUEVO - PROCESAMIENTO DE EXPRESIONES MATEMÁTICAS)
  if (content?.fieldType === 'calculated' && content?.calculatedField?.expression) {
    console.log(`🧮 Procesando campo calculado: "${content.calculatedField.expression}"`);
    const result = processCalculatedField(content.calculatedField.expression, mockData, content.outputFormat);
    console.log(`🧮 Resultado de cálculo: "${result}"`);
    return result;
  }

  // 3. Plantilla dinámica (PRINCIPAL - MEJORADO)
  if (content?.fieldType === 'dynamic' && content?.dynamicTemplate) {
    console.log(`🎭 Procesando plantilla dinámica: "${content.dynamicTemplate}"`);
    const result = processTemplate(content.dynamicTemplate, mockData, content.outputFormat);
    console.log(`🎭 Resultado de plantilla: "${result}"`);
    return result;
  }
  
  // 4. Campo SAP directo (MEJORADO)
  if (content?.fieldType === 'sap-product' && content?.sapField) {
    console.log(`🔗 Procesando campo SAP: "${content.sapField}"`);
    return getSAPFieldValue(content.sapField, mockData);
  }
  
  // 5. Campo promoción directo
  if (content?.fieldType === 'promotion-data' && content?.promotionField) {
    return getPromotionFieldValue(content.promotionField, mockData);
  }
  
  // 6. QR Code
  if (content?.fieldType === 'qr-code') {
    return 'QR Code';
  }
  
  // 7. Imagen
  if (content?.fieldType === 'image') {
    return 'Imagen';
  }
  
  // 8. NUEVO: Manejo de textConfig para componentes de texto dinámico
  if (content?.textConfig?.contentType) {
    const contentType = content.textConfig.contentType;
    const producto = mockData.producto;
    
    if (producto) {
      switch (contentType) {
        case 'product-name':
          return producto.descripcion || 'Heladera Whirlpool No Frost 375L';
        case 'product-description': 
          return `${producto.marcaTexto} ${producto.descripcion}` || 'Producto de calidad premium';
        case 'product-sku':
          return producto.sku?.toString() || '123001';
        case 'product-brand':
          return producto.marcaTexto || 'WHIRLPOOL';
        case 'price-original':
          return formatPrice(producto.precioAnt || 849999, outputFormat);
        case 'price-discount':
        case 'price-final':
          return formatPrice(producto.precio || 699999, outputFormat);
        case 'discount-percentage':
          const precioAnt = producto.precioAnt || 849999;
          const precio = producto.precio || 699999;
          return `${Math.round(((precioAnt - precio) / precioAnt) * 100)}%`;
        case 'financing-text':
          return 'Financiación disponible';
        case 'promotion-title':
          return 'SUPER OFERTA';
        default:
          return content.textConfig.fallbackText || 'Contenido dinámico';
      }
    }
  }
  
  // 9. NUEVO: Manejo de dateConfig para componentes de fecha
  if (content?.dateConfig?.type) {
    const dateType = content.dateConfig.type;
    switch (dateType) {
      case 'current-date':
        return mockData.fecha_actual;
      case 'promotion-start':
        return mockData.fecha_actual;
      case 'promotion-end':
        return mockData.fecha_promocion_fin;
      case 'promotion-period':
        return `${mockData.fecha_actual} - ${mockData.fecha_promocion_fin}`;
      case 'validity-period':
        // Campo fecha vigencia - SIEMPRE usa las fechas configuradas en la plantilla
        if (content?.dateConfig?.startDate && content?.dateConfig?.endDate) {
          const formatDate = (dateStr: string) => {
            // Crear fecha local para evitar problemas de zona horaria
            const [year, month, day] = dateStr.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return date.toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          };
          return `${formatDate(content.dateConfig.startDate)} - ${formatDate(content.dateConfig.endDate)}`;
        }
        // Fallback si no hay fechas configuradas
        return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      default:
        return mockData.fecha_actual;
    }
  }
  
  // 10. Fallback para valores directos (MEJORADO) - generar datos mock
  if (content?.staticValue) {
    // Si es un template dinámico en staticValue, procesarlo
    if (content.staticValue.includes('[') && content.staticValue.includes(']')) {
      return processTemplate(content.staticValue, mockData, content.outputFormat);
    }
    
    // Para campos estáticos sin fieldType, generar datos mock basados en el contexto
    const staticValue = content.staticValue;
    
    // Si parece ser un precio, mostrar precio mock
    if (staticValue.toLowerCase().includes('precio') || staticValue.includes('$')) {
      return '$ 99.999';
    }
    // Si parece ser un porcentaje, mostrar porcentaje mock
    if (staticValue.toLowerCase().includes('descuento') || staticValue.toLowerCase().includes('off') || staticValue.includes('%')) {
      return '25% OFF';
    }
    // Si parece ser texto promocional, mostrar texto mock
    if (staticValue.toLowerCase().includes('super') || staticValue.toLowerCase().includes('mega') || staticValue.toLowerCase().includes('oferta')) {
      return 'SUPER OFERTA';
    }
    // Para "Nuevo componente" y otros campos estáticos genéricos, mostrar texto mock
    return 'Texto Ejemplo';
  }
  
  if (content?.text) {
    // Si es un template dinámico en text, procesarlo
    if (content.text.includes('[') && content.text.includes(']')) {
      return processTemplate(content.text, mockData, content.outputFormat);
    }
    
    // Para campos estáticos sin fieldType, generar datos mock basados en el contexto
    const textValue = content.text;
    
    // Si parece ser un precio, mostrar precio mock
    if (textValue.toLowerCase().includes('precio') || textValue.includes('$')) {
      return '$ 99.999';
    }
    // Si parece ser un porcentaje, mostrar porcentaje mock
    if (textValue.toLowerCase().includes('descuento') || textValue.toLowerCase().includes('off') || textValue.includes('%')) {
      return '25% OFF';
    }
    // Si parece ser texto promocional, mostrar texto mock
    if (textValue.toLowerCase().includes('super') || textValue.toLowerCase().includes('mega') || textValue.toLowerCase().includes('oferta')) {
      return 'SUPER OFERTA';
    }
    // Para otros campos estáticos genéricos, mostrar texto mock
    return 'Texto Ejemplo';
  }
  
  // 11. Fallback basado en el tipo de componente
  if (componentType) {
    switch (componentType) {
      case 'field-dynamic-text':
        return mockData.producto?.descripcion || 'Heladera Whirlpool No Frost 375L';
      // field-dynamic-date eliminado - usar validity-period en su lugar
      case 'qr-dynamic':
        return 'QR Code';
      default:
        return 'Contenido dinámico';
    }
  }
  
  // 12. Fallback final con dato realista
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