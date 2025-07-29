import React from 'react';
import { TemplateV3, DraggableComponentV3 } from '../../../../../../features/builderV3/types';
import { ProductoReal } from '../../../../../../types/product';
import { getDynamicFieldValue, processDynamicTemplate } from '../../../../../../utils/productFieldsMap';
import { InlineEditableText } from './InlineEditableText';
import { calcularDescuentoPorcentaje } from '../../../../../../data/products';
import { formatValidityPeriod } from '../../../../../../utils/validityPeriodValidator';

interface BuilderTemplateRendererProps {
  template: TemplateV3;
  components: DraggableComponentV3[];
  product?: ProductoReal; // Producto para rellenar los campos dinámicos
  isPreview?: boolean; // Si es vista previa, usar datos de ejemplo
  scale?: number; // Escala para la vista previa
  productChanges?: any; // Cambios del usuario desde Redux
  onEditField?: (fieldType: string, newValue: string) => void; // 🆕 Callback para edición inline
  onPendingChange?: (fieldType: string, newValue: string | number) => void; // 🆕 Callback para cambios pendientes
  enableInlineEdit?: boolean; // 🆕 Habilitar edición inline directa
}

/**
 * Obtiene el valor dinámico de un campo considerando la estructura REAL de la BD
 * 🔧 CORREGIDO: Ahora funciona con dynamicTemplate de la estructura real
 */
const getDynamicValue = (
  content: any,
  product?: ProductoReal,
  isPreview?: boolean,
  productChanges?: any, // Cambios del usuario desde Redux
  componentId?: string, // 🆕 ID del componente para campos estáticos únicos
  showMockData: boolean = true // 🆕 Flag para mostrar datos mock o nombres de campo
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
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
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
      fechasHasta: nextWeek.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      precioSinImpuestos: product.precio ? Math.round(product.precio * 0.83) : 0
    };
    
    const mappedValue = fieldMapping[field];
    return mappedValue !== undefined ? mappedValue : null;
  };

  // 🚀 SISTEMA UNIVERSAL DE CAMPOS DINÁMICOS
  if (content?.fieldType === 'dynamic' && content?.dynamicTemplate && product) {
    console.log(`🎯 Procesando campo dinámico: ${content.dynamicTemplate}`);
    
    // 🆕 NUEVO: Manejo especial para validity_period en dynamicTemplate
    if (content.dynamicTemplate.includes('[validity_period]')) {
      console.log(`📅 Detectado validity_period en dynamicTemplate, usando fecha de vigencia de la plantilla`);
      // Si no hay dateConfig configurado, usar fallback
      if (content?.dateConfig?.type === 'validity-period' && content?.dateConfig?.startDate && content?.dateConfig?.endDate) {
        try {
          const formattedDate = formatValidityPeriod({
            startDate: content.dateConfig.startDate as string,
            endDate: content.dateConfig.endDate as string
          });
          console.log(`📅 Fecha de vigencia formateada desde dateConfig: ${formattedDate}`);
          return formattedDate;
        } catch (error) {
          console.error(`📅 Error formateando fecha de vigencia:`, error);
        }
      }
      // Fallback si no hay dateConfig configurado
      console.log(`📅 Usando fallback para validity_period`);
      return '21/07/2025 - 04/08/2025';
    }
    
    // Primero verificar cambios del usuario para el template completo
    const fieldType = getFieldType(content);
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
        console.log(`📝 ✅ CAMBIO ENCONTRADO para campo dinámico ${fieldType}: ${change.newValue} (ID único: ${uniqueFieldId})`);
        // El input del usuario es la fuente de verdad. No reformatear.
        return String(change.newValue);
      } else {
        console.log(`📝 ❌ NO se encontró cambio para campo dinámico "${fieldType}" (ID único: ${uniqueFieldId})`);
      }
    }
    
    // Si no hay cambios, procesar el template dinámico usando la configuración del componente
    const outputFormat = content.outputFormat || {};
    // 💡 Mantener el símbolo $ por defecto para campos de precio (solo remover si outputFormat.prefix es explícitamente false)
    if (content.dynamicTemplate && !outputFormat.hasOwnProperty('prefix')) {
        outputFormat.prefix = true; // Mostrar $ por defecto
    }
    const processedValue = processDynamicTemplate(content.dynamicTemplate, product, outputFormat);
    console.log(`📊 Valor procesado del template: ${processedValue}`, { outputFormat });
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
        });
        console.log(`📅 Fecha de vigencia formateada: ${formattedDate}`);
        return formattedDate;
      } catch (error) {
        console.error(`📅 Error formateando fecha de vigencia:`, error);
        return '21/07/2025 - 04/08/2025'; // Fallback
      }
    } else {
      console.log(`📅 No hay fechas configuradas, usando fallback`);
      return '21/07/2025 - 04/08/2025'; // Fallback
    }
  }

  // 🆕 NUEVO: SISTEMA DE CAMPOS CALCULADOS
  if (content?.fieldType === 'calculated' && content?.calculatedField?.expression) {
    if (!product) {
      console.log(`🧮 Campo calculado sin producto: mostrando placeholder`);
      return 'Selecciona un producto';
    }
    console.log(`🧮 Procesando campo calculado:`, {
      expression: content.calculatedField.expression,
      product: {
        precio: product.precio,
        precioAnt: product.precioAnt,
        basePrice: product.basePrice,
        stockDisponible: product.stockDisponible
      },
      outputFormat: content.outputFormat
    });
    
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
      console.log(`🔢 Expresión original: "${expression}"`);
      
      // Obtener el porcentaje de descuento de manera segura
      let discountPercentage = 0;
      try {
        discountPercentage = calcularDescuentoPorcentaje(product);
      } catch (error) {
        console.warn('⚠️ Error calculando descuento:', error);
        discountPercentage = 0;
      }
      
      // Reemplazar campos con valores reales del producto
      const replacements = {
        '[product_price]': String(product.precio || 0),
        '[discount_percentage]': String(discountPercentage),
        '[price_previous]': String(product.precioAnt || 0),
        '[stock_available]': String(product.stockDisponible || 0),
        '[price_base]': String(product.basePrice || 0),
        '[price_without_tax]': String(product.basePrice || product.precio || 0)
      };
      
      console.log(`🔄 Reemplazos a realizar:`, replacements);
      
      // Aplicar reemplazos
      for (const [placeholder, value] of Object.entries(replacements)) {
        expression = expression.replace(new RegExp(placeholder.replace(/[[\]]/g, '\\$&'), 'g'), value);
      }
      
      console.log(`🔢 Expresión después de reemplazos: "${expression}"`);
      
      // Validar que solo contenga números, operadores y espacios
      if (expression && /^[0-9+\-*/().\s]+$/.test(expression)) {
        console.log(`✅ Expresión válida, evaluando...`);
        
        const result = Function(`"use strict"; return (${expression})`)();
        console.log(`🧮 Resultado crudo: ${result} (tipo: ${typeof result})`);
        
        if (!isNaN(result) && isFinite(result)) {
          // Aplicar formato de salida si está configurado
          const outputFormat = content.outputFormat || {};
          let formattedResult = result.toString();
          
          console.log(`🎨 Aplicando formato:`, outputFormat);
          
          // Formatear decimales
          if (outputFormat.precision && outputFormat.precision !== '0') {
            const precision = outputFormat.precision === '2-small' ? 2 : parseInt(String(outputFormat.precision));
            if (!isNaN(precision)) {
              formattedResult = Number(result).toFixed(precision);
            }
          } else {
            formattedResult = Math.round(result).toString();
          }
          
          // Agregar prefijo ($) si está configurado
          if (outputFormat.prefix) {
            formattedResult = `$ ${formattedResult}`;
          }
          
          console.log(`🧮 ✅ Resultado final calculado: "${formattedResult}"`);
          return formattedResult;
        } else {
          console.log(`❌ Resultado inválido: ${result}`);
          return 'Error: resultado inválido';
        }
      } else {
        console.log(`❌ Expresión inválida después de reemplazos: "${expression}"`);
        return 'Error: expresión inválida';
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
        value = getProductValue('precioSinImpuestos', product?.precio ? Math.round(product.precio * 0.83) : 0);
        break;
      case 'promotion-start-date':
        value = getProductValue('fechasDesde', new Date().toLocaleDateString('es-AR'));
        break;
      case 'promotion-end-date':
        value = getProductValue('fechasHasta', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR'));
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
        // El input del usuario es la fuente de verdad. No reformatear.
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

/**
 * Obtiene la URL de una imagen dinámica
 * 🔧 MEJORADA: Mejor manejo de URLs de Supabase y cache busting
 */
const getDynamicImageUrl = (
  content: any,
  product?: ProductoReal,
  isPreview?: boolean
): string => {
  // Si hay URL estática válida, usarla con cache busting para Supabase
  if (content?.imageUrl && !content.imageUrl.includes('placeholder-product.jpg')) {
    const url = content.imageUrl;
    
    // Si es URL de Supabase, agregar cache busting
    if (url.includes('supabase')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${Date.now()}`;
    }
    return url;
  }
  
  // Si hay producto con imagen válida, usarla con cache busting
  if (product?.imageUrl && !product.imageUrl.includes('placeholder-product.jpg')) {
    const url = product.imageUrl;
    
    // Si es URL de Supabase, agregar cache busting  
    if (url.includes('supabase')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${Date.now()}`;
    }
    return url;
  }
  
  // Para preview, usar imagen de ejemplo en lugar de null
  if (isPreview) {
    return '/images/example-product.jpg'; // Imagen de ejemplo para preview
  }
  
  // Fallback final con imagen placeholder
  return '/images/placeholder-product.jpg';
};

/**
 * Extrae estilos CSS válidos del objeto de estilo de BuilderV3
 */
const extractCSSStyles = (style: any): React.CSSProperties => {
  const cssStyles: React.CSSProperties = {};
  
  if (style?.typography) {
    if (style.typography.fontSize) cssStyles.fontSize = style.typography.fontSize;
    if (style.typography.fontFamily) cssStyles.fontFamily = style.typography.fontFamily;
    if (style.typography.fontWeight) cssStyles.fontWeight = style.typography.fontWeight;
    if (style.typography.textAlign) cssStyles.textAlign = style.typography.textAlign;
    if (style.typography.lineHeight) cssStyles.lineHeight = style.typography.lineHeight;
    if (style.typography.letterSpacing) cssStyles.letterSpacing = style.typography.letterSpacing;
    if (style.typography.textDecoration) cssStyles.textDecoration = style.typography.textDecoration;
  }
  
  if (style?.color) {
    if (style.color.color) cssStyles.color = style.color.color;
    if (style.color.backgroundColor) cssStyles.backgroundColor = style.color.backgroundColor;
  }
  
  if (style?.border) {
    // ❌ ELIMINADO: Lógica de borde conflictiva. Se manejará directamente en el componente.
    // if (style.border.width && style.border.style && style.border.color) {
    //   cssStyles.border = `${style.border.width}px ${style.border.style} ${style.border.color}`;
    // }
    if (style.border.radius) {
      const radius = style.border.radius;
      if (typeof radius === 'object') {
        cssStyles.borderRadius = `${radius.topLeft || 0}px ${radius.topRight || 0}px ${radius.bottomRight || 0}px ${radius.bottomLeft || 0}px`;
      } else {
        cssStyles.borderRadius = `${radius}px`;
      }
    }
  }
  
  if (style?.spacing) {
    if (style.spacing.padding) {
      const padding = style.spacing.padding;
      cssStyles.padding = `${padding.top || 0}px ${padding.right || 0}px ${padding.bottom || 0}px ${padding.left || 0}px`;
    }
    if (style.spacing.margin) {
      const margin = style.spacing.margin;
      cssStyles.margin = `${margin.top || 0}px ${margin.right || 0}px ${margin.bottom || 0}px ${margin.left || 0}px`;
    }
  }
  
  if (style?.effects) {
    if (style.effects.opacity !== undefined) cssStyles.opacity = style.effects.opacity;
  }
  
  return cssStyles;
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
    overflow: 'hidden',
    wordWrap: 'break-word' as const,
    // 🔧 Solo aplicar backgroundColor para componentes no-imagen
    backgroundColor: component.type.startsWith('image-') ? 'transparent' : (style?.color?.backgroundColor || 'transparent'),
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
  onEditField?: (fieldType: string, newValue: string) => void,
  onPendingChange?: (fieldType: string, newValue: string | number) => void,
  enableInlineEdit?: boolean
) => {
  const { type, content, style } = component;
  const baseStyles = getBaseComponentStyles(component);
  
  switch (type) {
    case 'field-dynamic-text':
      const textValue = getDynamicValue(content, product, isPreview, productChanges, component.id, component.showMockData !== false);
      const fieldType = getFieldType(content);
      
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

      const baseStyle: React.CSSProperties = {
        ...baseStyles,
        textAlign: textValidAlign,
        whiteSpace: 'pre-wrap'
      };
      
      const textContent = textValue || 
                        (isCalculatedField ? 'Campo calculado' : 
                         (isStaticField ? 'Texto estático' : 
                          (product ? 'Nuevo componente' : 'Campo dinámico')));
      
      // 🎯 EDICIÓN INLINE: Habilitar para campos dinámicos Y estáticos
      if (enableInlineEdit && onEditField && !isPreview && (product || isStaticField)) {
        console.log(`🖱️ Habilitando edición inline para campo: ${fieldType} (${isStaticField ? 'estático' : 'dinámico'})`);
        
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
        const getInputType = (fieldType: string, isComplex: boolean, isStatic: boolean): 'text' | 'number' => {
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
        const uniqueFieldId = `${fieldType}_${component.id}`;
        
        return (
          <InlineEditableText
            value={textValue}
            onSave={(newValue) => {
              console.log(`📝 Guardando edición inline: ${uniqueFieldId} = ${newValue}`, { isComplex, isStaticField, componentId: component.id });
              onEditField(uniqueFieldId, String(newValue));
            }}
            onPendingChange={onPendingChange ? (fieldType, newValue) => onPendingChange(uniqueFieldId, newValue) : undefined}
            fieldType={uniqueFieldId}
            style={baseStyle}
            inputType={getInputType(fieldType, !!isComplex, !!isStaticField)}
            placeholder={getPlaceholder(fieldType, !!isComplex, !!isStaticField)}
            maxLength={fieldType.includes('descripcion') ? 100 : (isComplex || isStaticField) ? 200 : undefined}
            isComplexTemplate={true} // FORZAR MODO TEXTO SIEMPRE
            originalTemplate={textValue}
          >
            <div title={`${fieldType}: ${textValue}${isComplex ? ' (Editar texto completo)' : isStaticField ? ' (Campo estático editable)' : ''} [ID: ${component.id}]`}>
              {textContent}
            </div>
          </InlineEditableText>
        );
      }
      
      // 📋 RENDERIZADO NORMAL: Sin edición inline
      return (
        <div 
          style={baseStyle}
          title={textValue}
        >
          {textContent}
        </div>
      );
      
    case 'image-header':
    case 'image-product':
    case 'image-brand-logo':
    case 'image-decorative':
      return (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: component.style?.color?.backgroundColor || 'transparent' }}
        >
          {component.content?.imageUrl ? (
            <img
              src={component.content.imageUrl}
              alt={component.content?.imageAlt || 'Imagen'}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="text-center">
              {component.type === 'image-header' && '🏷️'}
              {component.type === 'image-product' && '📦'}
              {component.type === 'image-brand-logo' && '🏪'}
              {component.type === 'image-decorative' && '🎨'}
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
        if (content?.dateConfig?.startDate && content?.dateConfig?.endDate) {
          dateValue = formatValidityPeriod({
            startDate: content.dateConfig.startDate as string,
            endDate: content.dateConfig.endDate as string
          });
        } else {
          dateValue = '21/07/2025 - 04/08/2025'; // Fallback
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
        
        return (
          <InlineEditableText
            value={dateValue}
            onSave={(newValue) => {
              console.log(`📝 Guardando fecha editada: ${newValue}`);
              onEditField(dateFieldType, String(newValue));
            }}
            onPendingChange={onPendingChange}
            fieldType={dateFieldType}
            style={dateBaseStyle}
            inputType="text"
            placeholder="Ej: 26/05/2025"
            maxLength={15}
            isComplexTemplate={false}
            originalTemplate={dateValue}
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
        
        return (
          <InlineEditableText
            value={iconName}
            onSave={(newValue) => {
              console.log(`📝 Guardando icono editado: ${newValue}`);
              onEditField(iconFieldType, String(newValue));
            }}
            onPendingChange={onPendingChange}
            fieldType={iconFieldType}
            style={iconBaseStyle}
            inputType="text"
            placeholder="Ej: ⭐ 🔥 💯"
            maxLength={10}
            isComplexTemplate={false}
            originalTemplate={iconName}
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
  scale = 1,
  productChanges,
  onEditField,
  onPendingChange,
  enableInlineEdit = false
}) => {
  // Filtrar componentes visibles y ordenarlos por z-index
  const visibleComponents = components
    .filter(c => c.isVisible !== false)
    .sort((a, b) => (a.position.z || 0) - (b.position.z || 0));

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: template.canvas.width,
    height: template.canvas.height,
    backgroundColor: template.canvas.backgroundColor || '#FFFFFF',
    backgroundImage: template.canvas.backgroundImage ? `url(${template.canvas.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      {visibleComponents.map(component => {
        // 🎯 SOLO POSICIONAMIENTO: Como en CanvasEditorV3, solo aplicar transform y posición
        const componentPositionStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${component.position.x}px`,
          top: `${component.position.y}px`,
          width: `${component.size.width}px`,
          height: `${component.size.height}px`,
          transform: `rotate(${component.position.rotation || 0}deg) scale(${component.position.scaleX || 1}, ${component.position.scaleY || 1})`,
          visibility: component.isVisible ? 'visible' : 'hidden',
          zIndex: component.position.z,
        };

        return (
          <div key={component.id} style={componentPositionStyle}>
            {renderComponent(component, product, isPreview, productChanges, onEditField, onPendingChange, enableInlineEdit)}
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