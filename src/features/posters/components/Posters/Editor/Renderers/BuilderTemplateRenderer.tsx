import React from 'react';
import { TemplateV3, DraggableComponentV3 } from '../../../../../../features/builderV3/types';
import { ProductoReal } from '../../../../../../types/product';

import { InlineEditableText } from './InlineEditableText';
import { DynamicImageRenderer } from '../../../Renderers/DynamicImageRenderer';
import { calcularDescuentoPorcentaje } from '../../../../../../data/products';
import { formatValidityPeriod } from '../../../../../../utils/validityPeriodValidator';
import { calculatePricePorCuota } from '../../../../../../utils/financingCalculator';
import { FormatContext, createFormatContext, reconstructOutputFormat } from '../../../../../../types/formatContext';
import { getDynamicFieldValue, generateDynamicPlaceholder } from '../../../../../../utils/productFieldsMap';
import AutoFitText from '../../../../../../components/shared/AutoFitText';

interface BuilderTemplateRendererProps {
  template: TemplateV3;
  components: DraggableComponentV3[];
  product?: ProductoReal; // Producto para rellenar los campos dinámicos
  isPreview?: boolean; // Si es vista previa, usar datos de ejemplo
  scale?: number; // Escala para la vista previa
  productChanges?: any; // Cambios del usuario desde Redux
  onEditField?: (fieldType: string, newValue: string | number, preservedFormat?: any) => void; // 🆕 Callback para edición inline
  onPendingChange?: (fieldType: string, newValue: string | number, formatContext?: FormatContext) => void; // 🆕 Callback para cambios pendientes
  enableInlineEdit?: boolean; // 🆕 Habilitar edición inline directa
  onFinancingImageClick?: (componentId: string) => void; // 🆕 Callback para clic en imagen de financiación
  financingCuotas?: number; // 🆕 Cuotas seleccionadas para cálculos
  discountPercent?: number; // 🆕 Descuento seleccionado para cálculos
  promoValue?: string; // 🆕 Valor de promoción para cálculos (ej: "3x2")
  isPdfCapture?: boolean; // 🆕 Modo captura PDF para ajustar estilos anti-recorte
  onUpdateComponent?: (componentId: string, updates: Partial<DraggableComponentV3>) => void; // 🆕 Callback para actualizar componentes
}

/**
 * Obtiene el valor dinámico de un campo considerando la estructura REAL de la BD
 * 🔧 CORREGIDO: Ahora funciona con dynamicTemplate de la estructura real
 */
const getDynamicValue = (
  content: any,
  product?: ProductoReal,
  _isPreview?: boolean,
  productChanges?: any, // Cambios del usuario desde Redux
  componentId?: string, // 🆕 ID del componente para campos estáticos únicos
  showMockData: boolean = true, // 🆕 Flag para mostrar datos mock o nombres de campo
  financingCuotas?: number, // 🆕 Cuotas para cálculos de financiación
  discountPercent?: number, // 🆕 Descuento para cálculos de descuento
  promoValue?: string, // 🆕 Valor de promoción para cálculos
  isPdfCapture: boolean = false // 🆕 Para saber si es impresión
): string => {
  if (!content) return '';
  
  // 🆕 Si showMockData es false, devolver el nombre técnico del campo
  if (showMockData === false) {
    // Obtener el nombre técnico basado en el tipo de campo
    if (content?.fieldType === 'dynamic' && content?.dynamicTemplate) {
      return content.dynamicTemplate;
    } else if (content?.fieldType === 'calculated' && content?.calculatedField?.expression) {
      return content.calculatedField.expression;
    } else if (content?.textConfig?.contentType) {
      return `[${content.textConfig.contentType}]`;
    } else if (content?.staticValue) {
      return content.staticValue;
    }
    return 'Campo';
  }
  
  // Función auxiliar para obtener el valor de un campo del producto
  const getProductValue = (field: string, fallback: any = '') => {
    if (!product) return fallback;
    
    // 🆕 CORREGIDO: Buscar en el array de cambios de Redux
    if (productChanges && productChanges[product.id]) {
      const changes = productChanges[product.id].changes || [];
      
      // 🔧 DEBUGGING: Log para entender qué está pasando
      console.log(`🔍 Buscando cambios para campo "${field}" (componentId: ${componentId}):`, {
        productId: product.id,
        totalChanges: changes.length,
        changes: changes.map((c: any) => ({ field: c.field, newValue: c.newValue }))
      });
      
      // 🔧 BUSCAR CAMBIO CON ID ÚNICO PRIMERO (field_componentId)
      let change = changes.find((c: any) => c.field === `${field}_${componentId}`);
      
      // Si no se encuentra con ID único, buscar con el field original (para compatibilidad)
      if (!change) {
        change = changes.find((c: any) => c.field === field);
      }
      
      if (change) {
        console.log(`📝 ✅ CAMBIO ENCONTRADO para ${field}: ${change.newValue} (ID: ${componentId})`);
        // Devolver el valor tal cual lo guardó el usuario.
        return change.newValue;
      } else {
        console.log(`📝 ❌ NO se encontró cambio para campo "${field}" (componentId: ${componentId})`);
      }
    } else {
      console.log(`📝 ⚠️ No hay productChanges para producto ${product?.id || 'undefined'}`);
    }
    
    // Si no hay cambio, usar valor del producto original
    if (product.hasOwnProperty(field)) {
      return product[field as keyof ProductoReal];
    }
    
    // Intentar mapeo automático
    const mappedValue = getAutoMappedProductValue(product, field);
    if (mappedValue !== null) {
      return mappedValue;
    }
    
    return fallback;
  };

  // Función para mapear automáticamente campos comunes
  const getAutoMappedProductValue = (product: ProductoReal, field: string): string | number | null => {
    if (!product) return null;
    
    const now = new Date();
    
    const fieldMapping: Record<string, any> = {
      // Mapeo directo desde el producto (usando ProductoReal)
      descripcion: product.descripcion || 'Sin nombre',
      precio: product.precio || 0,
      sku: product.sku || 'N/A',
      ean: product.ean || '',
      marcaTexto: product.marcaTexto || '',
      precioAnt: product.precioAnt || 0,
      basePrice: product.basePrice || 0,
      stockDisponible: product.stockDisponible || 0,
      paisTexto: product.paisTexto || 'Argentina',
      origen: product.origen || 'ARG',
      
      // Valores calculados o por defecto
      porcentaje: 20, // Descuento por defecto del 20%
      fechasDesde: now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      fechasHasta: now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      // 🔧 CÁLCULO EXACTO: Mantener 2 decimales en precio sin impuestos
      precioSinImpuestos: product.precio ? Number((product.precio * 0.83).toFixed(2)) : 0
    };
    
    const mappedValue = fieldMapping[field];
    return mappedValue !== undefined ? mappedValue : null;
  };

  // 🚀 SISTEMA UNIVERSAL DE CAMPOS DINÁMICOS
  if (content?.fieldType === 'dynamic' && content?.dynamicTemplate) {
    // 🆕 NUEVO: Si no hay producto, usar placeholders amigables
    if (!product) {
      return generateDynamicPlaceholder(content.dynamicTemplate);
    }
    console.log(`🎯 Procesando campo dinámico: ${content.dynamicTemplate}`);
    
    // 🆕 VERIFICAR CAMBIOS MANUALES PRIMERO para TODOS los campos dinámicos
    const fieldType = getFieldType(content);
    const uniqueFieldId = `${fieldType}_${componentId}`;
    
    if (productChanges && productChanges[product.id]) {
      const changes = productChanges[product.id].changes || [];
      
      // Buscar cambio con ID único primero
      let change = changes.find((c: any) => c.field === uniqueFieldId);
      
      // Si no se encuentra con ID único, buscar con el fieldType original
      if (!change) {
        change = changes.find((c: any) => c.field === fieldType);
      }
      
      if (change) {
        // 🚀 SOLUCIÓN SIMPLE: Preservar valor exacto + formateo visual correcto
        const rawValue = String(change.newValue);
        console.log(`🎯 APLICANDO FORMATO VISUAL A VALOR PRESERVADO: "${rawValue}" para campo: ${fieldType}`);
        
        // Si es un campo de precio, aplicar formato de miles argentino
        if (fieldType.includes('precio') || fieldType.includes('price') || fieldType.includes('basePrice')) {
          const formattedValue = formatPriceForDisplay(rawValue);
          console.log(`💰 FORMATO APLICADO: "${rawValue}" → "${formattedValue}"`);
          return formattedValue;
        }
        
        return rawValue;
      } else {
        // No se encontró cambio manual para campo dinámico
      }
    }
    
    // 🆕 NUEVO: Manejo especial para validity_period en dynamicTemplate
    if (content.dynamicTemplate.includes('[validity_period]')) {
      console.log(`📅 Detectado validity_period en dynamicTemplate, usando configuración automática`);
      
      // Si no hay cambios del usuario, usar la configuración original del dateConfig
      if (content?.dateConfig?.type === 'validity-period' && content?.dateConfig?.startDate && content?.dateConfig?.endDate) {
        try {
          const formattedDate = formatValidityPeriod({
            startDate: content.dateConfig.startDate as string,
            endDate: content.dateConfig.endDate as string
          }, isPdfCapture);
          console.log(`📅 Fecha de vigencia formateada desde dateConfig: ${formattedDate}`);
          return formattedDate;
        } catch (error) {
          console.error(`📅 Error formateando fecha de vigencia:`, error);
        }
      }
      // Fallback si no hay dateConfig configurado
      console.log(`📅 Usando fallback para validity_period`);
      return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    
    // Si no hay cambios manuales, procesar el template dinámico usando la configuración del componente
    const outputFormat = { ...(content.outputFormat || {}) } as any;
    // Compatibilidad: mapear "prefix" → "showCurrencySymbol" si fuera necesario
    if (outputFormat.showCurrencySymbol === undefined && typeof outputFormat.prefix === 'boolean') {
      outputFormat.showCurrencySymbol = outputFormat.prefix;
    }
    // 💡 Default inteligente: si no está definido, inferirlo de la plantilla.
    // - Si la plantilla trae "$" o [currency_symbol] → true
    // - Si no hay indicios → false (no agregar símbolo por defecto)
    if (content.dynamicTemplate && outputFormat.showCurrencySymbol === undefined) {
      const templateHasSymbol = /\$/.test(content.dynamicTemplate) || content.dynamicTemplate.includes('[currency_symbol]');
      outputFormat.showCurrencySymbol = templateHasSymbol;
    }
    const processedValue = processDynamicTemplate(content.dynamicTemplate, product, outputFormat, financingCuotas, discountPercent, promoValue || '0x0');
    console.log(`📊 Valor procesado del template: ${processedValue}`, { outputFormat, financingCuotas });
    return processedValue;
  }

  // 🆕 NUEVO: SISTEMA PARA CAMPOS DE FECHA DE VIGENCIA (validity-period)
  console.log(`🔍 DEBUG: Verificando content para validity-period:`, {
    hasContent: !!content,
    hasDateConfig: !!content?.dateConfig,
    dateConfigType: content?.dateConfig?.type,
    dateConfig: content?.dateConfig
  });
  
  if (content?.dateConfig?.type === 'validity-period') {
    console.log(`📅 Procesando fecha de vigencia desde la plantilla:`, content.dateConfig);
    
    // Usar el validador de fechas de vigencia
    if (content?.dateConfig?.startDate && content?.dateConfig?.endDate) {
      try {
        const formattedDate = formatValidityPeriod({
          startDate: content.dateConfig.startDate as string,
          endDate: content.dateConfig.endDate as string
        }, isPdfCapture);
        console.log(`📅 Fecha de vigencia formateada: ${formattedDate}`);
        return formattedDate;
      } catch (error) {
        console.error(`📅 Error formateando fecha de vigencia:`, error);
        return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Fallback
      }
    } else {
      console.log(`📅 No hay fechas configuradas, usando fallback`);
      return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Fallback
    }
  }

  // 🆕 NUEVO: SISTEMA DE CAMPOS CALCULADOS
  if (content?.fieldType === 'calculated' && content?.calculatedField?.expression) {
    if (!product) {
      console.log(`🧮 Campo calculado sin producto: mostrando placeholder`);
      return '0000';
    }
    
    
    // Primero verificar cambios del usuario para el campo calculado
    const fieldType = 'calculated';
    if (productChanges && productChanges[product.id]) {
      const changes = productChanges[product.id].changes || [];
      
      // 🔧 BUSCAR CAMBIO CON ID ÚNICO PRIMERO (fieldType_componentId)
      const uniqueFieldId = `${fieldType}_${componentId}`;
      let change = changes.find((c: any) => c.field === uniqueFieldId);
      
      // Si no se encuentra con ID único, buscar con el fieldType original (para compatibilidad)
      if (!change) {
        change = changes.find((c: any) => c.field === fieldType);
      }
      
      if (change) {
        console.log(`📝 ✅ CAMBIO ENCONTRADO para campo calculado ${fieldType}: ${change.newValue} (ID único: ${uniqueFieldId})`);
        // El input del usuario es la fuente de verdad. No reformatear.
        return String(change.newValue);
      } else {
        console.log(`📝 ❌ NO se encontró cambio para campo calculado "${fieldType}" (ID único: ${uniqueFieldId})`);
      }
    }
    
    // Si no hay cambios, procesar la expresión calculada
    try {
      let expression = content.calculatedField.expression;
      // Obtener el porcentaje de descuento de manera segura
      let discountPercentage = 0;
      try {
        discountPercentage = calcularDescuentoPorcentaje(product);
      } catch (error) {
        discountPercentage = 0;
      }
      
      // Reemplazar campos con valores reales
      expression = expression.replace(/\[product_price\]/g, String(product?.precio || 0));
      expression = expression.replace(/\[price_previous\]/g, String(product?.precioAnt || 0));
      expression = expression.replace(/\[price_base\]/g, String(product?.basePrice || 0));
      expression = expression.replace(/\[stock_available\]/g, String(product?.stockDisponible || 0));
      expression = expression.replace(/\[discount_percentage\]/g, String(discountPercentage));
      // 🆕 soportar campos de financiación y descuento en expresiones
      expression = expression.replace(/\[cuota\]/g, String(financingCuotas || 0));
      // 🆕 soportar campo promo en expresiones - PRIORIZAR cambios manuales sobre selectedPromo
      // 🔑 CLAVE: Buscar cambios manuales de promo PRIMERO (igual que con descuentos)
      let promoLlevas = 0; // Primer número (cuántos llevás)
      let promoPagas = 0;  // Segundo número (cuántos pagás)
      
      if (productChanges && product?.id) {
        const changes = productChanges[product.id]?.changes || [];
        // 🔧 BUSCAR POR FIELD NAME, NO POR ID ÚNICO
        const promoChange = changes.find((c: any) => {
          // Buscar tanto 'promo' como cualquier field que termine en 'promo'
          return c.field === 'promo' || c.field.includes('promo');
        });
        
        if (promoChange) {
          const manualPromoValue = String(promoChange.newValue);
          const promoParts = manualPromoValue.split('x');
          promoLlevas = parseInt(promoParts[0], 10) || 0;
          promoPagas = parseInt(promoParts[1], 10) || 0;
        } else {
          // Si no hay cambio manual, usar selectedPromo
          const promoParts = (promoValue || '0x0').split('x');
          promoLlevas = parseInt(promoParts[0], 10) || 0;
          promoPagas = parseInt(promoParts[1], 10) || 0;
        }
      } else {
        const promoParts = (promoValue || '0x0').split('x');
        promoLlevas = parseInt(promoParts[0], 10) || 0;
        promoPagas = parseInt(promoParts[1], 10) || 0;
      }
      
      const promoDivisor = promoLlevas > 0 && promoPagas > 0 ? promoLlevas / promoPagas : 1;
      
      // Reemplazar [promo] con el divisor correcto para obtener el precio del combo
      expression = expression.replace(/\[promo\]/g, String(promoDivisor));
      // precio_descuento calculado en base a product_price y discountPercent
      const dto = (typeof discountPercent === 'number' ? discountPercent : discountPercentage) || 0;
      // 🔧 CÁLCULO EXACTO: Mantener 2 decimales sin redondear a enteros
      const precioDesc = dto > 0 ? Number(((product?.precio || 0) * (1 - dto / 100)).toFixed(2)) : (product?.precio || 0);
      expression = expression.replace(/\[precio_descuento\]/g, String(precioDesc));
      
      console.log(`🔢 Expresión con reemplazos: "${expression}"`);
      
      // Evaluar la expresión de forma segura
      // Validar que solo contenga caracteres permitidos
      if (/^[0-9+\-*/().\s]+$/.test(expression)) {
        const result = Function(`"use strict"; return (${expression})`)();
        
        if (!isNaN(result) && isFinite(result)) {
          // Aplicar formato de salida si está configurado
          const outputFormat = { ...(content.outputFormat || {}) } as any;
          // Compatibilidad: aceptar tanto prefix como showCurrencySymbol
          if (outputFormat.showCurrencySymbol === undefined && typeof outputFormat.prefix === 'boolean') {
            outputFormat.showCurrencySymbol = outputFormat.prefix;
          }
          // Si el resultado viene como string con "$" por un preformateo, normalizar
          let numericResult = result;
          if (typeof result === 'string') {
            const normalized = Number(String(result).replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.'));
            if (!isNaN(normalized)) numericResult = normalized;
          }
          return applyOutputFormat(numericResult, outputFormat);
        } else {
          console.log(`❌ Resultado inválido (división por 0 u operación no finita): ${result}`);
          // Fallback seguro: 0
          const outputFormat = { ...(content.outputFormat || {}) } as any;
          if (outputFormat.showCurrencySymbol === undefined && typeof outputFormat.prefix === 'boolean') {
            outputFormat.showCurrencySymbol = outputFormat.prefix;
          }
          return applyOutputFormat(0, outputFormat);
        }
      } else {
        console.log(`❌ Expresión inválida después de reemplazos: "${expression}"`);
        const outputFormat = { ...(content.outputFormat || {}) } as any;
        if (outputFormat.showCurrencySymbol === undefined && typeof outputFormat.prefix === 'boolean') {
          outputFormat.showCurrencySymbol = outputFormat.prefix;
        }
        return applyOutputFormat(0, outputFormat);
      }
      
    } catch (error) {
      console.error('❌ Error procesando campo calculado:', error);
      return 'Error en cálculo';
    }
  }

  // 🔧 COMPATIBILIDAD: Mantener soporte para textConfig (por si hay plantillas mixtas)
  if (content?.textConfig?.contentType) {
    const formatters = content.textConfig.formatters || [];
    let value: any;
    
    switch (content.textConfig.contentType) {
      case 'product-name':
        value = getProductValue('nombre', product?.name || 'Sin nombre');
        break;
      case 'product-description':
        value = product?.descripcion || '';
        break;
      case 'product-sku':
        value = getProductValue('sap', product?.sku || 'N/A');
        break;
      case 'product-brand':
        value = getProductValue('origen', product?.marcaTexto || 'ARG');
        break;
      case 'price-original':
      case 'price-final':
        value = getProductValue('precioActual', product?.precio || 0);
        break;
      case 'price-discount':
        // Usar precio con descuento calculado desde porcentaje
        const percentage = getProductValue('porcentaje', 20);
        const originalPrice = getProductValue('precioActual', product?.precio || 0);
        value = originalPrice ? Math.round(originalPrice * (1 - percentage / 100)) : 0;
        break;
      case 'discount-percentage':
        value = getProductValue('porcentaje', 20);
        break;
      case 'price-without-taxes':
        // 🔧 CÁLCULO EXACTO: Mantener 2 decimales en precio sin impuestos
        value = getProductValue('precioSinImpuestos', product?.precio ? Number((product.precio * 0.83).toFixed(2)) : 0);
        break;
      case 'promotion-start-date':
        value = getProductValue('fechasDesde', new Date().toLocaleDateString('es-AR'));
        break;
      case 'promotion-end-date':
        value = getProductValue('fechasHasta', new Date().toLocaleDateString('es-AR'));
        break;
      default:
        value = content.textConfig.fallbackText || '';
    }
    
    // Aplicar formatters
    for (const formatter of formatters) {
      switch (formatter.type) {
        case 'currency':
          if (typeof value === 'number') {
            value = new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
          break;
        case 'percentage':
          if (typeof value === 'number') {
            value = `${value}%`;
          }
          break;
        case 'uppercase':
          value = String(value).toUpperCase();
          break;
        case 'lowercase':
          value = String(value).toLowerCase();
          break;
        case 'capitalize':
          value = String(value).replace(/\b\w/g, l => l.toUpperCase());
          break;
      }
    }
    
    return String(value);
  }
  
  // 🆕 NUEVO: Para campos estáticos, verificar si hay cambios del usuario
  if (content?.staticValue) {
    const fieldType = getFieldType(content);
    
    // Verificar cambios del usuario para campos estáticos
    if (productChanges && product && productChanges[product.id]) {
      const changes = productChanges[product.id].changes || [];
      
      // 🔧 BUSCAR CAMBIO CON ID ÚNICO PRIMERO (fieldType_componentId)
      const uniqueFieldId = `${fieldType}_${componentId}`;
      let change = changes.find((c: any) => c.field === uniqueFieldId);
      
      // Si no se encuentra con ID único, buscar con el fieldType original (para compatibilidad)
      if (!change) {
        change = changes.find((c: any) => c.field === fieldType);
      }
      
      if (change) {
        console.log(`📝 ✅ CAMBIO ENCONTRADO para campo estático ${fieldType}: ${change.newValue} (ID único: ${uniqueFieldId})`);
        
        // 🎭 APLICAR FORMATO PRESERVADO SI EXISTE
        if (change.preservedFormat) {
          console.log(`🎭 APLICANDO FORMATO PRESERVADO AL CAMPO ESTÁTICO:`, {
            fieldType,
            originalValue: change.newValue,
            preservedFormat: change.preservedFormat,
            valueType: typeof change.newValue
          });
          
          // Aplicar el formato preservado al valor del cambio
          const formattedValue = applyOutputFormat(Number(change.newValue), change.preservedFormat);
          console.log(`🎭 CAMPO ESTÁTICO CON FORMATO APLICADO: ${change.newValue} → ${formattedValue}`);
          return formattedValue;
        } else {
          // Sin formato preservado, aplicar formato básico de miles para precios
          if (fieldType.includes('precio') || fieldType.includes('price') || fieldType.includes('basePrice')) {
            const numericValue = Number(change.newValue);
            if (!isNaN(numericValue)) {
              const formattedValue = numericValue.toLocaleString('es-AR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                useGrouping: true
              });
              console.log(`💰 APLICANDO FORMATO BÁSICO DE MILES A CAMPO ESTÁTICO: ${change.newValue} → ${formattedValue}`);
              return formattedValue;
            }
          }
          console.log(`⚠️ NO HAY FORMATO PRESERVADO para campo estático ${fieldType}, valor: ${change.newValue}`);
        }
        
        // Si no hay formato preservado, devolver el valor directo
        return String(change.newValue);
      } else {
        console.log(`📝 ❌ NO se encontró cambio para campo estático "${fieldType}" (ID único: ${uniqueFieldId})`);
      }
    }
    
    return content.staticValue;
  }
  
  // Fallback para otros tipos de contenido
  return content?.fallbackText || '';
};


// ===============================================
// PROCESADOR DE PLANTILLAS DINÁMICAS (CORREGIDO)
// =ual=============================================
const processDynamicTemplate = (
  template: string,
  product: ProductoReal,
  outputFormat: any = {}, // 🔧 CORRECCIÓN: Aceptar y usar outputFormat
  financingCuotas?: number,
  discountPercent?: number,
  promoValue?: string // 🆕 Valor de promoción
): string => {
  if (!template) return '';
  let processed = template;
  const fieldRegex = /\[([^\]]+)\]/g;
  let match;

  while ((match = fieldRegex.exec(template)) !== null) {
    const fieldId = match[1];
    let value: any = '';

    // Mapeo de valores
    if (fieldId === 'cuota') {
      value = financingCuotas || 0;
    } else if (fieldId === 'precio_cuota') {
      value = calculatePricePorCuota(product?.precio || 0, financingCuotas || 0);
    } else if (fieldId === 'descuento') {
      // 🔧 CAMBIO CRÍTICO: Usar selectedDescuento (0 por defecto)
      value = discountPercent || 0;
    } else if (fieldId === 'precio_descuento') {
      const precio = product?.precio || 0;
      const dto = discountPercent || 0;
      // 🔧 CÁLCULO EXACTO: Mantener 2 decimales sin redondear a enteros
      const finalPrice = dto > 0 ? Number((precio * (1 - dto / 100)).toFixed(2)) : precio;
      value = finalPrice;
    } else if (fieldId === 'discount_percentage') {
      // 🔧 MAPEAR discount_percentage a descuento
      value = discountPercent || 0;
    } else if (fieldId === 'promo') {
      // 🆕 MAPEAR promo al valor configurado
      value = promoValue || '0x0';
    } else {
      // Usar getDynamicFieldValue para obtener valores del producto (ej: product_price -> product.precio)
      value = getDynamicFieldValue(fieldId, product, outputFormat, financingCuotas, discountPercent, promoValue);
    }
    
    // 🔧 SOLUCIÓN MEJORADA: Aplicar formato solo cuando corresponde según el tipo de campo
    let formattedValue;
    
    // Determinar si es un campo monetario para aplicar formato de precio
    const isPriceField = ['precio', 'price', 'cuota', 'precio_cuota', 'precio_descuento'].some(priceKey => 
      fieldId.toLowerCase().includes(priceKey)
    );
    
    // Normalización: si el formateador aguas arriba ya agregó "$" pero la config
    // indica que NO debe mostrarse, quitarlo antes de aplicar formato propio
    if (
      isPriceField &&
      outputFormat && outputFormat.showCurrencySymbol === false &&
      typeof value === 'string' && /\$/.test(value)
    ) {
      value = value.replace(/^\s*\$\s*/, '');
      // Reconvertir a número si es posible, para que nuestro formateo sea consistente
      const normalized = Number(String(value).replace(/\./g, '').replace(/,/g, '.'));
      if (!isNaN(normalized)) {
        value = normalized;
      }
    }

    if (isPriceField && typeof value === 'number') {
      // Para campos de precio, aplicar formato completo
      formattedValue = applyOutputFormat(value, outputFormat);
    } else {
      // Para otros campos, aplicar solo formato básico (sin prefijos monetarios)
      formattedValue = applyOutputFormat(value, {});
    }
    
    processed = processed.replace(match[0], formattedValue);
  }
  
  return processed;
};

// ===============================================
// FORMATEADOR VISUAL PARA PRECIOS (PRESERVA VALOR EXACTO)
// ===============================================
const formatPriceForDisplay = (value: string): string => {
  const cleanValue = value.toString().trim();
  
  // Si está vacío, devolver vacío
  if (!cleanValue) return cleanValue;
  
  // Detectar si tiene decimales (formato argentino: coma para decimales)
  const hasCommaDecimals = cleanValue.includes(',');
  
  if (hasCommaDecimals) {
    // Formato con decimales: "1234567,50" → "1.234.567,50"
    const parts = cleanValue.split(',');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';
    
    // Formatear solo la parte entera con separadores de miles
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},${decimalPart}`;
  } else {
    // Solo números enteros: "6999999" → "6.999.999"
    // Verificar si es un número válido
    if (!/^\d+$/.test(cleanValue)) {
      // Si no es solo números, devolverlo tal como está
      return cleanValue;
    }
    
    // Aplicar separadores de miles
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
};

// ===============================================
// APLICADOR DE FORMATO DE SALIDA (UNIFICADO)
// ===============================================
const applyOutputFormat = (value: any, format: any): string => {
  if (format) {
    let formattedValue = value;

    // 🔧 MEJORA: Determinar el número de decimales desde showDecimals o precision
    let decimalPlaces = 0;
    const precisionStr = String(format.precision || '0');
    if (format.showDecimals === true || format.precision === '2') {
      decimalPlaces = 2;
    } else if (format.precision && format.precision !== '0') {
      if (precisionStr.includes('1')) decimalPlaces = 1;
      else if (precisionStr.includes('2')) decimalPlaces = 2;
      else {
        const precision = parseInt(precisionStr, 10);
        if (!isNaN(precision)) {
          decimalPlaces = precision;
        }
      }
    }

    // 🆕 Detectar si se debe usar superíndice
    const useSuperscript = format.superscriptDecimals === true || precisionStr.includes('-small');

    // Formato de números con separador de miles y decimales configurables
    if (typeof value === 'number') {
      if (useSuperscript && decimalPlaces > 0) {
        // 🆕 MODO SUPERÍNDICE: separar parte entera de decimales
        const integerPart = Math.floor(value);
        const decimalPart = ((value - integerPart) * Math.pow(10, decimalPlaces)).toFixed(0).padStart(decimalPlaces, '0');
        
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
        
        formattedValue = `${formattedInteger}${superscriptDecimals}`;
      } else {
        // 🔄 MODO NORMAL: usar toLocaleString estándar
        formattedValue = value.toLocaleString('es-AR', {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
          useGrouping: true
        });
      }
    }

    // 🔧 MEJORA: Prefijo monetario solo si showCurrencySymbol es true
    if (format.showCurrencySymbol === true && formattedValue && typeof value === 'number') {
       // Evitar doble prefijo si ya lo tiene
      if (!String(formattedValue).trim().startsWith('$')) {
        formattedValue = `$ ${formattedValue}`;
      }
    }

    // Transformación de texto
    if (format.transform) {
      switch (format.transform) {
        case 'uppercase':
          formattedValue = String(formattedValue).toUpperCase();
          break;
        case 'lowercase':
          formattedValue = String(formattedValue).toLowerCase();
          break;
        case 'capitalize':
          formattedValue = String(formattedValue).replace(/\b\w/g, l => l.toUpperCase());
          break;
      }
    }
    
    return String(formattedValue);
  }
  
  // Si no hay formato, aplicar formato de número por defecto para consistencia
  if (typeof value === 'number') {
    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true
    });
  }
  
  return String(value);
};


/**
 * 🆕 NUEVA FUNCIÓN: Mapea contenido a tipo de campo para edición inline
 */
const getFieldType = (content: any): string => {
  // Para campos con textConfig (configuración de texto dinámico)
  if (content?.textConfig?.contentType) {
    const contentType = content.textConfig.contentType;
    
    switch (contentType) {
      case 'product-name': return 'descripcion';
      case 'product-sku': return 'sku';
      case 'product-brand': return 'marcaTexto';
      case 'price-original':
      case 'price-final': return 'precio';
      case 'price-discount': return 'precio';
      case 'discount-percentage': return 'porcentaje';
      case 'price-without-taxes': return 'basePrice';
      case 'promotion-start-date': return 'fechasDesde';
      case 'promotion-end-date': return 'fechasHasta';
      default: return 'texto';
    }
  }
  
  // Para campos dinámicos con dynamicTemplate
  if (content?.fieldType === 'dynamic' && content?.dynamicTemplate) {
    const dynamicTemplate = content.dynamicTemplate;
    
    // 🆕 CASO ESPECIAL: Campos de fecha de vigencia
    if (dynamicTemplate.includes('[validity_period]') || content?.dateConfig?.type === 'validity-period') {
      return 'date';
    }
    
    // Extraer el campo del template [field_name]
    const match = dynamicTemplate.match(/\[([^\]]+)\]/);
    if (match) {
      const fieldId = match[1];
      
      // Mapear fieldId a fieldKey usando la información de productFieldsMap
      switch (fieldId) {
        case 'product_name': return 'descripcion';
        case 'product_sku': return 'sku';
        case 'product_ean': return 'ean';
        case 'product_brand': return 'marcaTexto';
        case 'product_price': return 'precio';
        case 'price_previous': return 'precioAnt';
        case 'price_base': return 'basePrice';
        case 'price_without_tax': return 'precio'; // Se calcula sobre precio
        case 'product_origin': return 'paisTexto';
        case 'product_origin_code': return 'origen';
        case 'stock_available': return 'stockDisponible';
        case 'validity_period': return 'date'; // 🆕 CAMPO DE FECHA
        default: return fieldId;
      }
    }
  }

  // 🆕 Para campos calculados
  if (content?.fieldType === 'calculated' && content?.calculatedField?.expression) {
    return 'calculated';
  }
  
  // Para campos SAP conectados
  if (content?.fieldType === 'sap-product' && content?.sapConnection?.fieldName) {
    const fieldName = content.sapConnection.fieldName.toLowerCase();
    
    if (fieldName.includes('name') || fieldName.includes('nombre')) return 'descripcion';
    if (fieldName.includes('price') || fieldName.includes('precio')) return 'precio';
    if (fieldName.includes('sku')) return 'sku';
    
    return 'universal';
  }
  
  // 🆕 MEJORADO: Para campos con valor estático o texto (detectar mejor los tipos)
  if (content?.staticValue || content?.text) {
    const value = (content.staticValue || content.text || '').toLowerCase();
    
    // Detectar precios por formato numérico y símbolos
    if (value.includes('$') || value.match(/\d+[.,]\d+/) || value.includes('precio') || value.includes('price')) {
      return 'precio';
    }
    
    // Detectar porcentajes
    if (value.includes('%') || value.includes('descuento') || value.includes('discount') || value.includes('porcentaje')) {
      return 'porcentaje';
    }
    
    // Detectar fechas por formato
    if (value.includes('fecha') || value.includes('date') || value.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
      return 'fecha';
    }
    
    // Detectar códigos/SKUs
    if (value.includes('sku') || value.includes('sap') || value.includes('código') || value.includes('code')) {
      return 'sku';
    }
    
    // Detectar nombres de productos
    if (value.includes('nombre') || value.includes('name') || value.includes('producto') || value.includes('product')) {
      return 'descripcion';
    }
    
    // Detectar origen/marca
    if (value.includes('origen') || value.includes('brand') || value.includes('marca')) {
      return 'marcaTexto';
    }
    
    // Detectar precios sin impuestos
    if (value.includes('sin_impuesto') || value.includes('without_tax') || value.includes('sin impuesto')) {
      return 'basePrice';
    }
    
    // 🆕 NUEVO: Detectar texto estático puro (sin palabras clave específicas)
    // Si no coincide con ningún patrón específico, es texto estático editable
    return 'texto_estatico';
  }
  
  // Fallback para cualquier campo dinámico
  return 'texto';
};

/**
 * 🆕 NUEVA FUNCIÓN: Detecta si un campo es complejo (tiene texto + campos dinámicos)
 */
const isComplexTemplate = (content: any): boolean => {
  if (content?.fieldType !== 'dynamic' || !content?.dynamicTemplate) {
    return false;
  }
  
  const template = content.dynamicTemplate;
  
  // Contar campos dinámicos [field_name] en el template
  const fieldMatches = template.match(/\[([^\]]+)\]/g) || [];
  
  // Si hay texto además de los campos dinámicos, es complejo
  let templateWithoutFields = template;
  fieldMatches.forEach((match: string) => {
    templateWithoutFields = templateWithoutFields.replace(match, '');
  });
  
  // Si después de remover los campos dinámicos queda texto significativo, es complejo
  const remainingText = templateWithoutFields.trim();
  const isComplex = remainingText.length > 0;
  
  console.log(`🔍 Análisis template:`, {
    template,
    fieldMatches,
    remainingText,
    isComplex
  });
  
  return isComplex;
};

/**
 * 🆕 FUNCIÓN HELPER: Validar textAlign para compatibilidad con React
 */
const getValidTextAlign = (textAlign: any): 'left' | 'center' | 'right' | 'justify' => {
  if (textAlign === 'center' || textAlign === 'right' || textAlign === 'justify') {
    return textAlign;
  }
  return 'left';
};

/**
 * 🆕 FUNCIÓN HELPER: Obtener font-family con fallbacks apropiados
 */
const getFontFamilyWithFallbacks = (fontFamily?: string): string => {
  if (!fontFamily || fontFamily === 'inherit') {
    return 'inherit';
  }
  
  // Mapear fuentes específicas con sus fallbacks
  const fontMappings: Record<string, string> = {
    'Calibri': "'Calibri', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    'Inter': "'Inter', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    'Roboto': "'Roboto', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    'Open Sans': "'Open Sans', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    'Poppins': "'Poppins', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    'Arial': "Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    'Helvetica': "'Helvetica Neue', Helvetica, Arial, sans-serif"
  };
  
  // Si la fuente ya incluye fallbacks (contiene comas), devolverla tal como está
  if (fontFamily.includes(',')) {
    return fontFamily;
  }
  
  // Buscar mapeo específico
  const mappedFont = fontMappings[fontFamily];
  if (mappedFont) {
    return mappedFont;
  }
  
  // Para fuentes no mapeadas, agregar fallbacks genéricos
  return `'${fontFamily}', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
};

/**
 * 🆕 FUNCIÓN HELPER: Crear estilos base consistentes con CanvasEditorV3
 */
const getBaseComponentStyles = (component: DraggableComponentV3): React.CSSProperties => {
  const { style } = component;
  
  // 🎯 APLICAR SOLO ESTILOS DE CONTENIDO, NO DE POSICIONAMIENTO
  const baseStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    fontFamily: getFontFamilyWithFallbacks(style?.typography?.fontFamily),
    fontSize: style?.typography?.fontSize ? `${style.typography.fontSize}px` : '16px',
    fontWeight: style?.typography?.fontWeight || 'normal',
    color: style?.color?.color || '#000000',
    textAlign: (style?.typography?.textAlign as any) || 'left',
    lineHeight: style?.typography?.lineHeight || 1.2,
    letterSpacing: style?.typography?.letterSpacing || 'normal',
    textDecoration: style?.typography?.textDecoration || 'none',
    opacity: style?.effects?.opacity ?? 1,
    boxSizing: 'border-box' as const,
    overflow: 'hidden', // Mantener hidden por defecto, se maneja específicamente en cada caso
    wordWrap: 'break-word' as const,
    // 🔧 Solo aplicar backgroundColor para componentes no-imagen
    backgroundColor: component.type.startsWith('image-') ? 'transparent' : (style?.color?.backgroundColor || 'transparent'),
    // 🎯 AGREGAR PADDING CONSISTENTE CON BUILDER V3
    padding: typeof style?.spacing?.padding === 'object' 
      ? `${style.spacing.padding.top}px ${style.spacing.padding.right}px ${style.spacing.padding.bottom}px ${style.spacing.padding.left}px`
      : style?.spacing?.padding || 0,
  };

  // 🎯 APLICAR BORDES SOLO SI ESTÁN DEFINIDOS
  if (style?.border && style.border.width > 0) {
    baseStyles.border = `${style.border.width}px ${style.border.style || 'solid'} ${style.border.color || '#000000'}`;
  }

  // 🎯 APLICAR BORDER RADIUS SOLO SI ESTÁ DEFINIDO  
  if (style?.border?.radius?.topLeft) {
    const radius = style.border.radius;
    if (typeof radius === 'object') {
      baseStyles.borderRadius = `${radius.topLeft || 0}px ${radius.topRight || 0}px ${radius.bottomRight || 0}px ${radius.bottomLeft || 0}px`;
    } else {
      baseStyles.borderRadius = `${radius}px`;
    }
  }

  return baseStyles;
};

/**
 * Mapa de componentes con renderización inteligente
 * 🎯 CORREGIDO: Sistema unificado sin duplicación de estilos
 */
const renderComponent = (
  component: DraggableComponentV3, 
  product?: ProductoReal, 
  isPreview?: boolean, 
  productChanges?: any,
  onEditField?: (fieldType: string, newValue: string | number, preservedFormat?: any) => void,
  onPendingChange?: (fieldType: string, newValue: string | number, formatContext?: FormatContext) => void,
  enableInlineEdit?: boolean,
  onFinancingImageClick?: (componentId: string) => void,
  financingCuotas?: number,  // 🆕 Cuotas para cálculos de financiación
  discountPercent?: number,   // 🆕 Descuento para cálculos de descuento
  promoValue?: string,        // 🆕 Valor de promoción para cálculos
  onUpdateComponent?: (componentId: string, updates: Partial<DraggableComponentV3>) => void,
  isPdfCapture: boolean = false
) => {
  const { type, content, style } = component;
  const baseStyles = getBaseComponentStyles(component);
  
  switch (type) {
    case 'field-dynamic-text':
      const textValue = getDynamicValue(content, product, isPreview, productChanges, component.id, component.showMockData !== false, financingCuotas, discountPercent, promoValue, isPdfCapture);
      const fieldType = getFieldType(content);
      
      // 🔥 DEBUG: Log especial para campos de cuotas
      const componentDynamicTemplate = (content as any)?.dynamicTemplate || '';
      if (componentDynamicTemplate.includes('[cuota]') || componentDynamicTemplate.includes('[precio_cuota]')) {
        console.log(`🔥 [CUOTAS DEBUG] Renderizando campo de cuotas:`, {
          dynamicTemplate: componentDynamicTemplate,
          financingCuotas,
          textValue,
          fieldType,
          componentId: component.id
        });
      }
      
              // 🆕 DETECTAR SI ES CAMPO ESTÁTICO O DINÁMICO
        const isCalculatedField = (content as any)?.fieldType === 'calculated';
        const isStaticField = (!content?.fieldType || content?.fieldType === 'static') && 
                              !isCalculatedField && 
                              (!(content as any)?.dynamicTemplate && !content?.textConfig?.contentType && content?.staticValue);
      
      // Debug: Log del valor dinámico
      /*
      console.log(`🎨 Renderizando campo de texto:`, {
        contentType: content?.textConfig?.contentType,
        fieldType: content?.fieldType,
        staticValue: content?.staticValue,
        text: content?.text,
        detectedFieldType: fieldType,
        textValue,
        isStaticField,
        isCalculatedField,
        hasProduct: !!product,
        enableInlineEdit,
        calculatedExpression: isCalculatedField ? (content as any)?.calculatedField?.expression : null
      });
      */
      
      const textValidAlign = getValidTextAlign(baseStyles.textAlign);

      // 🎯 SEPARAR PADDING DEL ÁREA DE MEDICIÓN DE AUTOFITTEXT
      const componentPadding = baseStyles.padding;
      
      const baseStyle: React.CSSProperties = {
        ...baseStyles,
        textAlign: textValidAlign,
        whiteSpace: 'pre-wrap',
        // 🛡️ En modo captura PDF evitar recortes por métricas de fuente
        overflow: isPdfCapture ? 'visible' : baseStyles.overflow,
        // 🚫 NO aplicar padding aquí - se aplicará en el contenedor exterior
        padding: 0
      };
      
      const textContent = textValue?.toString() || 
                        (isCalculatedField ? 'Campo calculado' : 
                         (isStaticField ? 'Texto estático' : 
                          (product ? 'Nuevo componente' : 'Campo dinámico')));
      
      // 🔍 DETECTAR CAMPOS DE FINANCIACIÓN Y FECHA (MEJORADO)
      const templateContent = (content as any)?.dynamicTemplate || '';
      
      // 🎯 DETECCIÓN MEJORADA: Si contiene cuota/financiación -> EDITABLE INLINE
      const isFinancingField = 
        templateContent.includes('[cuota]') || 
        templateContent.includes('[precio_cuota]') ||
        fieldType === 'cuota' || 
        fieldType === 'precio_cuota' ||
        fieldType.includes('cuota') ||
        textContent.includes('CUOTAS') ||
        textContent.toLowerCase().includes('cuota') ||
        // Detección adicional por contenido dinámico
        (content?.fieldType === 'dynamic' && (
          templateContent.includes('cuota') || 
          templateContent.includes('financ')
        ));

      // 🎯 DETECCIÓN MEJORADA: Si contiene descuento -> EDITABLE INLINE
      const isDiscountField = 
        templateContent.includes('[descuento]') || 
        templateContent.includes('[precio_descuento]') ||
        templateContent.includes('[discount_percentage]') ||
        fieldType === 'descuento' || 
        fieldType === 'precio_descuento' ||
        fieldType === 'discount_percentage' ||
        fieldType.includes('descuento') ||
        fieldType.includes('discount') ||
        textContent.includes('DESCUENTO') ||
        textContent.toLowerCase().includes('descuento');

      // 🆕 DETECCIÓN DE CAMPOS DE FECHA -> EDITABLE CON MÁSCARA
      const isDateField = 
        templateContent.includes('[validity_period]') ||
        (content as any)?.dateConfig?.type === 'validity-period' ||
        textContent.includes('/') && textContent.includes('2025') || // Pattern like DD/MM/YYYY
        textContent.match(/\d{2}\/\d{2}\/\d{4}/) || // Date format XX/XX/XXXX
        textContent.includes(' - ') && textContent.match(/\d{2}\/\d{2}\/\d{4}/); // Date range

      // 🆕 DETECCIÓN DE CAMPOS PROMO -> SIEMPRE EDITABLE (sin restricciones)
      const isPromoField = 
        templateContent.includes('[promo]') ||
        fieldType === 'promo' ||
        fieldType.includes('promo') ||
        textContent.match(/\d+x\d+/); // Pattern like 3x2, 5x4
      
      // Debug solo para modo PDF
      if (isPdfCapture && textContent.includes('10.')) {
        console.log(`📄 [PDF DEBUG] Texto grande detectado:`, {
          text: textContent.substring(0, 30),
          fieldType
        });
      }
      
      // 🎯 EDICIÓN INLINE: Habilitar para:
      // 1. Modo inline normal (enableInlineEdit = true) - solo si NO es preview
      // 2. Campos de financiación (cuotas) - SIEMPRE editables (incluso en preview)
      // 3. Campos de descuento - SIEMPRE editables (incluso en preview)
      // 4. Campos de fecha - SIEMPRE editables (incluso en preview)
      const canEdit = onEditField && (product || isStaticField) && 
                     ((enableInlineEdit && !isPreview) || isFinancingField || isDiscountField || isDateField || isPromoField);
      
      // 🆕 MEJORAR FIELDTYPE PARA CUOTAS, DESCUENTOS Y FECHAS
      let enhancedFieldType = fieldType;
      if (isFinancingField) {
        if (templateContent.includes('[cuota]') && !templateContent.includes('[precio_cuota]')) {
          enhancedFieldType = 'cuota';
        } else if (templateContent.includes('[precio_cuota]')) {
          enhancedFieldType = 'precio_cuota';
        }
      } else if (isDiscountField) {
        if (templateContent.includes('[descuento]') && !templateContent.includes('[precio_descuento]')) {
          enhancedFieldType = 'descuento';
        } else if (templateContent.includes('[precio_descuento]')) {
          enhancedFieldType = 'precio_descuento';
        } else if (templateContent.includes('[discount_percentage]')) {
          enhancedFieldType = 'descuento'; // 🔧 Mapear discount_percentage a descuento
        }
      } else if (isDateField) {
        enhancedFieldType = 'date';
      }
      
      // 🔥 Debug SIMPLIFICADO para campos de financiación, descuento y fecha

      
      // 🔧 MODO IMPRESIÓN: Usar el mismo sistema que la cartelera (InlineEditableText con AutoFitText interno)
      // NO forzar AutoFitText directo - usar el flujo normal para que se vea igual

      if (canEdit) {
        // 🆕 DETECTAR SI ES TEMPLATE COMPLEJO (solo para campos dinámicos)
        const isComplex = !isStaticField && isComplexTemplate(content);
        
        console.log(`🔍 Análisis campo para edición:`, {
          fieldType,
          isComplex,
          isStaticField,
          textValue,
          content
        });
        
        // Determinar el tipo de input según el campo
        const getInputType = (_fieldType: string, isComplex: boolean, isStatic: boolean): 'text' | 'number' => {
          // 🚫 SIEMPRE USAR 'text' PARA EVITAR FLECHAS DE INCREMENTO Y SCROLL DEL MOUSE
          // Para campos complejos o estáticos, siempre usar texto
          if (isComplex || isStatic) return 'text';
          
          // 🔧 CAMBIO: Usar 'text' para todos los campos numéricos también
          // Esto evita las flechas de incremento/decremento y el scroll del mouse
          return 'text';
        };

        // Generar placeholder contextual
        const getPlaceholder = (fieldType: string, isComplex: boolean, isStatic: boolean): string => {
          if (isStatic) {
            if (fieldType === 'texto_estatico') {
              return 'Editar texto (ej: "SUPERPRECIO", "14% DESCUENTO")';
            } else if (fieldType.includes('precio')) {
              return 'Editar precio (ej: "$ 99.999")';
            } else if (fieldType.includes('porcentaje')) {
              return 'Editar porcentaje (ej: "15%")';
            } else if (fieldType.includes('fecha')) {
              return 'Editar fecha (ej: "26/05/2025")';
            }
            return `Editar ${fieldType}`;
          }
          
          if (isComplex) {
            return 'Editar texto completo (ej: "14% DE DESCUENTO")';
          }
          
          if (fieldType.includes('precio') || fieldType.includes('price')) {
            return 'Ej: 99999';
          } else if (fieldType.includes('porcentaje')) {
            return 'Ej: 15';
          } else if (fieldType.includes('descripcion') || fieldType.includes('nombre')) {
            return 'Nombre del producto';
          }
          return `Editar ${fieldType}`;
        };

        // 🆕 CREAR IDENTIFICADOR ÚNICO PARA TODOS LOS CAMPOS (ESTÁTICOS Y DINÁMICOS)
        // Esto evita que al cambiar un campo se cambien otros campos del mismo tipo
        const uniqueFieldId = `${enhancedFieldType}_${component.id}`;
        
        // 🔧 MEJORADO: Estilos optimizados para edición inline
        const editableStyle = {
          ...baseStyle,
          // 🎯 APLICAR PADDING EN EL CONTENEDOR DE EDICIÓN
          padding: componentPadding,
          // 🔧 Asegurar dimensiones mínimas para edición
          minWidth: baseStyle.width || '100px',
          minHeight: baseStyle.height || '24px',
          // 🔧 Permitir expansión si es necesario
          maxWidth: baseStyle.maxWidth || '100%',
          maxHeight: baseStyle.maxHeight || '200px',
          // 🔧 Mantener word-wrap del contenedor original
          wordWrap: 'break-word' as const,
          overflowWrap: 'break-word' as const,
          whiteSpace: 'pre-wrap' as const
        };

        // 🎭 VERIFICAR SI HAY FORMATO PRESERVADO EN PRODUCTCHANGES
        let preservedFormatFromChanges = null;
        if (productChanges && product && productChanges[product.id]) {
          const changes = productChanges[product.id].changes || [];
          const changeWithFormat = changes.find((change: any) => 
            change.field === uniqueFieldId && change.preservedFormat
          );
          preservedFormatFromChanges = changeWithFormat?.preservedFormat;
          
          console.log(`🎭 BUSCANDO FORMATO PRESERVADO:`, {
            uniqueFieldId,
            foundChange: !!changeWithFormat,
            preservedFormat: preservedFormatFromChanges,
            totalChanges: changes.length
          });
        }
        
        // 🎭 APLICAR FORMATO PRESERVADO AL COMPONENTE SI EXISTE
        let componentWithPreservedFormat = component;
        if (preservedFormatFromChanges) {
          console.log(`🎭 APLICANDO FORMATO PRESERVADO AL COMPONENTE:`, { 
            fieldType, 
            preservedFormat: preservedFormatFromChanges 
          });
          
          componentWithPreservedFormat = {
            ...component,
            content: {
              ...component.content,
              outputFormat: {
                ...component.content?.outputFormat,
                ...preservedFormatFromChanges
              }
            }
          };
        }
        
        // 🎭 CREAR FORMATO CONTEXT para preservar máscaras
        const formatContext = createFormatContext(componentWithPreservedFormat, textValue, fieldType);
        
        return (
          <InlineEditableText
            value={textValue}
            onSave={(newValue, preservedFormatContext) => {
              console.log(`📝 Guardando edición inline: ${uniqueFieldId} = ${newValue}`, { 
                isComplex, 
                isStaticField, 
                componentId: component.id,
                hasPreservedFormat: !!preservedFormatContext 
              });
              
              // 🎭 Si hay formato preservado, aplicarlo al componente
              if (preservedFormatContext && preservedFormatContext.hasSpecialFormat) {
                const reconstructedFormat = reconstructOutputFormat(preservedFormatContext);
                console.log(`🎭 Aplicando formato preservado:`, reconstructedFormat);
                
                // Actualizar tanto el valor como el formato
                onEditField(uniqueFieldId, String(newValue), reconstructedFormat);
              } else {
                onEditField(uniqueFieldId, String(newValue));
              }
            }}
            onPendingChange={onPendingChange ? (_fieldType, newValue, pendingFormatContext) => {
              // 🎭 Incluir formato en cambios pendientes
              if (pendingFormatContext && pendingFormatContext.hasSpecialFormat) {
                onPendingChange(uniqueFieldId, newValue, pendingFormatContext);
              } else {
                onPendingChange(uniqueFieldId, newValue);
              }
            } : undefined}
            fieldType={enhancedFieldType}
            style={editableStyle}
            inputType={getInputType(fieldType, !!isComplex, !!isStaticField)}
            placeholder={getPlaceholder(fieldType, !!isComplex, !!isStaticField)}
            maxLength={fieldType.includes('descripcion') ? 100 : (isComplex || isStaticField) ? 200 : undefined}
            isComplexTemplate={!!isComplex} // 🎭 Usar valor real para preservar formato
            originalTemplate={textValue}
            multiline={textValue.length > 30 || textValue.includes('\n')}
            formatContext={formatContext} // 🆕 Pasar contexto de formato

          >
            <div title={`${fieldType}: ${textValue}${isComplex ? ' (Editar texto completo)' : isStaticField ? ' (Campo estático editable)' : ''} [ID: ${component.id}]`}>
              {textContent}
            </div>
          </InlineEditableText>
        );
      }
      
      // 📋 RENDERIZADO NORMAL: Sin edición inline con AutoFitText
      return (
        <div 
          style={{
            ...baseStyle,
            // 🎯 APLICAR PADDING EN EL CONTENEDOR EXTERIOR
            padding: componentPadding,
            overflow: 'hidden', // Restaurar overflow hidden para el contenedor padre
            display: 'flex',
            alignItems: 'center',
            justifyContent: textValidAlign === 'center' ? 'center' : textValidAlign === 'right' ? 'flex-end' : 'flex-start'
          }}
          title={textValue}
        >
          <AutoFitText
            text={textContent}
            style={{
              // 🎯 ÁREA COMPLETA PARA AUTOFITTEXT (sin padding)
              width: '100%',
              height: '100%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              textAlign: textValidAlign,
              fontFamily: baseStyle.fontFamily,
              fontWeight: baseStyle.fontWeight as any,
              lineHeight: baseStyle.lineHeight as any,
              letterSpacing: baseStyle.letterSpacing as any,
              color: baseStyle.color as any,
              overflow: 'visible' // AutoFitText interno puede ser visible
            }}
            baseFontSize={component.style?.typography?.fontSize || 16}
            minFontSize={6}
            maxFontSize={(() => {
              const originalFontSize = component.style?.typography?.fontSize || 16;
              return Math.max(originalFontSize * 2, 200);
            })()}
          />
        </div>
      );
      
    case 'image-header':
    case 'image-footer':
    case 'image-background':
    case 'image-product':
    case 'image-brand-logo':
    case 'image-decorative':
      return (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: component.style?.color?.backgroundColor || 'transparent' }}
        >
          {component.content?.imageUrl || component.style?.color?.backgroundImage ? (
            <img
              src={component.content?.imageUrl || (component.style?.color?.backgroundImage as any)}
              alt={component.content?.imageAlt || (
                component.type === 'image-background' ? 'Imagen de fondo' : 'Imagen'
              )}
              className={
                component.type === 'image-product' ? 'w-full h-full object-contain' : 'w-full h-full object-cover'
              }
              draggable={false}
            />
          ) : (
            <div className="text-center">
              {component.type === 'image-header' && '🏷️'}
              {component.type === 'image-footer' && '📌'}
              {component.type === 'image-background' && '🖼️'}
              {component.type === 'image-product' && '📦'}
              {component.type === 'image-brand-logo' && '🏪'}
              {component.type === 'image-decorative' && '🎨'}
              {component.type === 'image-dynamic' && '📁'}
            </div>
          )}
        </div>
      );
      
    case 'image-financing':
      // 🚫 COMPONENTE ESPECIAL: No editable manualmente, solo seleccionable desde modal
      // 🎯 FUNCIONA INDEPENDIENTEMENTE DEL MODO DE EDICIÓN INLINE
      return (
        <div
          className="w-full h-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-green-400 transition-all duration-200"
          style={{ backgroundColor: component.style?.color?.backgroundColor || 'transparent' }}
          onClick={(e) => {
            e.stopPropagation();
            if (onFinancingImageClick) {
              onFinancingImageClick(component.id);
            }
          }}
          title="Clic para seleccionar logo de financiación"
        >
          {component.content?.imageUrl ? (
            <img
              src={component.content.imageUrl}
              alt={component.content?.imageAlt || 'Logo de financiación'}
              className="w-full h-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 border-2 border-dashed border-green-300 rounded-lg flex flex-col items-center justify-center text-green-600">
              <div className="text-4xl mb-2">💳</div>
              <div className="text-sm font-medium text-center px-2">
                Logo de financiación
              </div>
              <div className="text-xs text-green-500 mt-1 text-center px-2">
                ¡Clic para seleccionar!
              </div>
            </div>
          )}
        </div>
      );
      
    case 'qr-dynamic':
      const qrSize = Math.min(component.size.width, component.size.height);
      return (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #ccc',
          ...baseStyles
        }}>
          <div style={{
            width: qrSize * 0.8,
            height: qrSize * 0.8,
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: Math.max(qrSize * 0.1, 8),
            textAlign: 'center'
          }}>
            QR
          </div>
        </div>
      );
      
    // field-dynamic-date eliminado - usar validity-period en su lugar
      let dateValue = '';
      if (content?.dateConfig?.type === 'validity-period') {
        // Usar el validador de fechas de vigencia
        try {
          if (content.dateConfig?.startDate && content.dateConfig?.endDate) {
            dateValue = formatValidityPeriod({
              startDate: content.dateConfig!.startDate!,
              endDate: content.dateConfig!.endDate!
            }, isPdfCapture);
          } else {
            dateValue = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Fallback
          }
        } catch (error) {
          dateValue = '21/07/2025 - 04/08/2025'; // Fallback en caso de error
        }
      } else if (content?.dateConfig?.type === 'current-date') {
        dateValue = new Date().toLocaleDateString('es-AR');
      } else if (content?.dateConfig?.type === 'promotion-start') {
        dateValue = '15/05/2025';
      } else if (content?.dateConfig?.type === 'promotion-end') {
        dateValue = '18/05/2025';
      } else {
        dateValue = content?.staticValue || new Date().toLocaleDateString('es-AR');
      }
      
      const dateValidAlign = getValidTextAlign(baseStyles.textAlign);
      const dateFieldType = 'fecha'; // Tipo de campo para edición

      const dateBaseStyle: React.CSSProperties = {
        ...baseStyles,
        fontSize: '14px',
        color: '#666666',
        display: 'flex',
        alignItems: 'center',
        justifyContent: dateValidAlign === 'center' ? 'center' : 
                       dateValidAlign === 'right' ? 'flex-end' : 'flex-start',
        textAlign: dateValidAlign,
        whiteSpace: 'pre-wrap'
      };

      // 🎯 EDICIÓN INLINE PARA FECHAS: Si está habilitada, envolver con InlineEditableText
      if (enableInlineEdit && onEditField && !isPreview) {
        console.log(`📅 Habilitando edición inline para fecha: ${dateValue}`);
        
        // 🎭 CREAR FORMATO CONTEXT para fechas
        const dateFormatContext = createFormatContext(component, dateValue, dateFieldType);
        
        return (
          <InlineEditableText
            value={dateValue}
            onSave={(newValue, preservedFormatContext) => {
              console.log(`📝 Guardando fecha editada: ${newValue}`);
              
              // 🎭 Si hay formato preservado para fechas, aplicarlo
              if (preservedFormatContext && preservedFormatContext.hasSpecialFormat) {
                const reconstructedFormat = reconstructOutputFormat(preservedFormatContext);
                onEditField?.(dateFieldType, String(newValue), reconstructedFormat);
              } else {
                onEditField?.(dateFieldType, String(newValue));
              }
            }}
            onPendingChange={onPendingChange}
            fieldType={dateFieldType}
            style={dateBaseStyle}
            inputType="text"
            placeholder="Ej: 26/05/2025"
            maxLength={15}
            isComplexTemplate={false}
            originalTemplate={dateValue}
            formatContext={dateFormatContext} // 🆕 Pasar contexto de formato

          >
            <div title={`Fecha: ${dateValue}`}>
              {dateValue}
            </div>
          </InlineEditableText>
        );
      }

      // 📋 RENDERIZADO NORMAL: Sin edición inline
      return (
        <div style={dateBaseStyle}>
          {dateValue}
        </div>
      );

    // 📁 IMAGEN DINÁMICA (CON FUNCIONALIDAD DE UPLOAD)
    case 'image-dynamic':
      return (
        <DynamicImageRenderer
          component={component}
          isEditMode={true} // ✅ SIEMPRE EDITABLE - No depende del modo inline
          scale={1}
          onUpdateComponent={onUpdateComponent || ((id, updates) => console.log('No onUpdateComponent handler:', id, updates))}
        />
      );
      
    case 'shape-geometric':
      const shapeType = content?.shapeConfig?.type || 'rectangle';
      const borderConfig = style?.border;
      const hasBorder = borderConfig && borderConfig.width > 0;
      const backgroundColor = style?.color?.backgroundColor || '#007bff';
      const borderRadius = borderConfig?.radius?.topLeft || (shapeType === 'circle' ? '50%' : 0);
      
      const baseShapeStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor,
        border: hasBorder 
          ? `${borderConfig.width}px ${borderConfig.style || 'solid'} ${borderConfig.color || '#000000'}`
          : 'none',
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        boxSizing: 'border-box', // Importante para que el borde no afecte el tamaño
        transition: 'all 0.2s ease', // Suave transición para cambios
        ...baseStyles,
        whiteSpace: 'pre-wrap'
      };
      
      if (shapeType === 'triangle') {
        return (
          <div style={{
            width: 0,
            height: 0,
            borderLeft: `${component.size.width/2}px solid transparent`,
            borderRight: `${component.size.width/2}px solid transparent`,
            borderBottom: `${component.size.height}px solid ${style?.color?.backgroundColor || '#007bff'}`
          }} />
        );
      }
      
      return <div style={baseShapeStyle} />;
      
    case 'decorative-line':
      return (
        <div style={{
          width: '100%',
          height: content?.lineConfig?.thickness || 2,
          backgroundColor: '#cccccc',
          ...baseStyles,
          whiteSpace: 'pre-wrap'
        }} />
      );
      
    case 'decorative-icon':
      const iconName = content?.iconConfig?.iconName || content?.staticValue || '★';
      const iconFieldType = 'icono'; // Tipo de campo para edición

      const iconBaseStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.min(component.size.width, component.size.height) * 0.8,
        color: '#000000',
        ...baseStyles,
        whiteSpace: 'pre-wrap'
      };

      // 🎯 EDICIÓN INLINE PARA ICONOS: Si está habilitada, envolver con InlineEditableText
      if (enableInlineEdit && onEditField && !isPreview) {
        console.log(`🎨 Habilitando edición inline para icono: ${iconName}`);
        
        // 🎭 CREAR FORMATO CONTEXT para iconos
        const iconFormatContext = createFormatContext(component, iconName, iconFieldType);
        
        return (
          <InlineEditableText
            value={iconName}
            onSave={(newValue, preservedFormatContext) => {
              console.log(`📝 Guardando icono editado: ${newValue}`);
              
              // 🎭 Si hay formato preservado para iconos, aplicarlo
              if (preservedFormatContext && preservedFormatContext.hasSpecialFormat) {
                const reconstructedFormat = reconstructOutputFormat(preservedFormatContext);
                onEditField(iconFieldType, String(newValue), reconstructedFormat);
              } else {
                onEditField(iconFieldType, String(newValue));
              }
            }}
            onPendingChange={onPendingChange}
            fieldType={iconFieldType}
            style={iconBaseStyle}
            inputType="text"
            placeholder="Ej: ⭐ 🔥 💯"
            maxLength={10}
            isComplexTemplate={false}
            originalTemplate={iconName}
            formatContext={iconFormatContext} // 🆕 Pasar contexto de formato

          >
            <div title={`Icono: ${iconName}`}>
              {iconName}
            </div>
          </InlineEditableText>
        );
      }

      // 📋 RENDERIZADO NORMAL: Sin edición inline
      return (
        <div style={iconBaseStyle}>
          {iconName}
        </div>
      );
      
    case 'container-flexible':
    case 'container-grid':
      return (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          border: '1px dashed #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: content?.containerConfig?.flexDirection || 'column',
          gap: content?.containerConfig?.gap || 8,
          padding: '8px',
          ...baseStyles,
          whiteSpace: 'pre-wrap'
        }}>
          <span style={{ 
            color: '#999', 
            fontSize: 12, 
            textAlign: 'center' 
          }}>
            Contenedor {type === 'container-grid' ? 'Grid' : 'Flexible'}
          </span>
        </div>
      );
      
    default:
      return (
        <div style={{
          width: '100%',
          height: '100%',
          border: '2px dashed #ff6b6b',
          backgroundColor: '#ffe6e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d63031',
          fontSize: 12,
          textAlign: 'center',
          padding: 4,
          whiteSpace: 'pre-wrap'
        }}>
          Tipo no soportado:<br/>{type}
        </div>
      );
  }
};

/**
 * Renderizador principal de plantillas del Builder V3
 * 🎯 MEJORA: Ahora considera cambios del usuario para renderizado dinámico
 */
export const BuilderTemplateRenderer: React.FC<BuilderTemplateRendererProps> = ({
  template,
  components,
  product,
  isPreview = false,
  scale: _scale = 1,
  productChanges,
  onEditField,
  onPendingChange,
  enableInlineEdit = false,
  onFinancingImageClick,
  financingCuotas = 0,
  discountPercent = 0,
  promoValue = '0x0',
  isPdfCapture = false,
  onUpdateComponent
}) => {

  // Filtrar componentes visibles y ordenarlos por z-index
  const safeComponents = Array.isArray(components) ? components : [];
  const visibleComponents = safeComponents
    .filter(c => c.isVisible !== false)
    .sort((a, b) => (a.position.z || 0) - (b.position.z || 0));

  // Dimensiones seguras del template con fallbacks
  const canvasWidth = template?.canvas?.width || (template as any)?.width || 1240;
  const canvasHeight = template?.canvas?.height || (template as any)?.height || 1754;
  const canvasBackground = template?.canvas?.backgroundColor || '#FFFFFF';
  const canvasBackgroundImage = template?.canvas?.backgroundImage;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: canvasWidth,
    height: canvasHeight,
    backgroundColor: canvasBackground,
    backgroundImage: canvasBackgroundImage ? `url(${canvasBackgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: isPdfCapture ? 'visible' : 'hidden',
  };

  return (
    <div style={containerStyle}>
      {visibleComponents.map(component => {
        const rotation = component.position.rotation || 0;
        const rawScaleX = component.position.scaleX || 1;
        const rawScaleY = component.position.scaleY || 1;

        // En modo impresión, evitar transform: scale para que AutoFit mida el tamaño real visible
        const effectiveWidth = isPdfCapture ? (component.size.width * rawScaleX) : component.size.width;
        const effectiveHeight = isPdfCapture ? (component.size.height * rawScaleY) : component.size.height;
        const scaleX = isPdfCapture ? 1 : rawScaleX;
        const scaleY = isPdfCapture ? 1 : rawScaleY;

        // 🎯 Posicionamiento base
        const componentPositionStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${component.position.x}px`,
          top: `${component.position.y}px`,
          width: `${effectiveWidth}px`,
          height: `${effectiveHeight}px`,
          transform: `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
          visibility: component.isVisible ? 'visible' : 'hidden',
          zIndex: component.position.z,
        };

        return (
          <div key={component.id} style={componentPositionStyle}>
            {renderComponent(
              component,
              product,
              isPreview,
              productChanges,
              onEditField,
              onPendingChange,
              enableInlineEdit,
              onFinancingImageClick,
              financingCuotas,
              discountPercent,
              promoValue,
              onUpdateComponent,
              isPdfCapture
            )}
          </div>
        );
      })}
      
      {/* Overlay informativo si no hay componentes */}
      {visibleComponents.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#999',
          textAlign: 'center',
          fontSize: 14,
          padding: 20
        }}>
          {isPreview ? (
            // Vista previa visual completa cuando no hay componentes
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {/* Header de la plantilla */}
              <div style={{
                width: '100%',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                BLACK FRIDAY
              </div>
              
              {/* Área principal de contenido */}
              <div style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                backgroundColor: '#fafafa'
              }}>
                {/* Imagen del producto */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#e3f2fd',
                  border: '3px solid #2196f3',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#1976d2',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  PRODUCTO<br/>IMAGEN
                </div>
                
                {/* Nombre del producto */}
                <div style={{
                  width: '100%',
                  maxWidth: '280px',
                  height: '50px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#333333',
                  textAlign: 'center'
                }}>
                  NOMBRE DEL PRODUCTO
                </div>
                
                {/* Precio */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    padding: '8px 16px',
                    backgroundColor: '#ff5722',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    -30%
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#4caf50'
                  }}>
                    $99.999
                  </div>
                </div>
              </div>
              
              {/* Footer con info adicional */}
              <div style={{
                width: '100%',
                height: '40px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                fontSize: '12px',
                color: '#666666'
              }}>
                <span>SKU: EJ001</span>
                <span>Válido hasta 31/12</span>
              </div>
            </div>
          ) : (
            // Mensaje normal cuando no es preview
            'Plantilla sin componentes visibles'
          )}
        </div>
      )}
    </div>
  );
}; 