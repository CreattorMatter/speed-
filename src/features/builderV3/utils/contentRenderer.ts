// =====================================
// CONTENT RENDERER UTILITIES - BuilderV3
// =====================================

import { DraggableComponentV3 } from '../types';

/**
 * 🆕 FUNCIÓN PARA MOSTRAR NOMBRES TÉCNICOS DURANTE EDICIÓN
 * Extrae los nombres técnicos de los campos en lugar de procesarlos con datos mock
 */
export const getFieldTechnicalNames = (component: DraggableComponentV3): string => {
  const content = component.content as any;
  
  if (!content) {
    console.log(`⚠️ No hay contenido para componente ${component.type}, devolviendo nombre por defecto`);
    // Fallback basado en el tipo de componente
    switch (component.type) {
      case 'field-dynamic-text': return '[product_name]';
      case 'shape-geometric': return '[geometric_shape]';
      default: return `[${component.type.replace('-', '_')}]`;
    }
  }
  
  // 1. Contenido estático - para el modo técnico, mostrar el tipo de campo
  if (content?.fieldType === 'static') {
    // En modo técnico (showMockData = false), mostrar nombre técnico
    // En modo mock (showMockData = true), mostrar el valor estático
    // Nota: Esta función se llama solo cuando showMockData es false
    return '[static_text]';
  }
  
  // 2. Campo calculado - mostrar la expresión técnica sin procesar en el canvas
  if (content?.fieldType === 'calculated' && content?.calculatedField?.expression) {
    console.log(`📝 [Canvas] Mostrando expresión técnica del campo calculado: "${content.calculatedField.expression}"`);
    return content.calculatedField.expression;
  }
  
  // 3. Plantilla dinámica - mostrar campos técnicos sin procesar
  if (content?.fieldType === 'dynamic' && content?.dynamicTemplate) {
    // Mantener los nombres técnicos tal como están: [product_name], [product_price], etc.
    return content.dynamicTemplate;
  }
  
  // 4. Campo SAP directo - mostrar nombre técnico
  if (content?.fieldType === 'sap-product' && content?.sapField) {
    console.log(`🔗 Campo SAP encontrado: "${content.sapField}"`);
    return `[${content.sapField}]`;
  }
  
  // 5. Campo promoción directo - mostrar nombre técnico  
  if (content?.fieldType === 'promotion-data' && content?.promotionField) {
    console.log(`🎉 Campo promoción encontrado: "${content.promotionField}"`);
    return `[${content.promotionField}]`;
  }
  
  // 6. QR Code
  if (content?.fieldType === 'qr-code') {
    console.log(`📱 Campo QR encontrado`);
    return '[qr_code]';
  }
  
  // 7. Imagen
  if (content?.fieldType === 'image') {
    return 'Imagen';
  }
  
  // 8. Fallback para textConfig (campos con configuración específica)
  if (content?.textConfig?.contentType) {
    console.log(`🏷️ textConfig encontrado: "${content.textConfig.contentType}"`);
    const contentTypeMap: Record<string, string> = {
      'product-name': '[product_name]',
      'product-description': '[product_description]', 
      'product-sku': '[product_sku]',
      'product-brand': '[product_brand]',
      'price-original': '[product_price]',
      'price-final': '[product_price]',
      'price-discount': '[price_discount]',
      'discount-percentage': '[discount_percentage]',
      'price-without-taxes': '[price_without_tax]',
      'promotion-start-date': '[promotion_start_date]',
      'promotion-end-date': '[promotion_end_date]',
      'financing-text': '[financing_text]',
      'promotion-title': '[promotion_title]'
    };
    
    return contentTypeMap[content.textConfig.contentType] || `[${content.textConfig.contentType}]`;
  }
  
  // 9. Campos de fecha específicos
  if (content?.dateConfig?.type) {
    console.log(`📅 dateConfig encontrado: "${content.dateConfig.type}"`);
    
    // CASO ESPECIAL: validity-period siempre muestra las fechas, no el nombre técnico
    if (content.dateConfig.type === 'validity-period') {
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
      return '21/07/2025 - 04/08/2025'; // Fallback
    }
    
    const dateTypeMap: Record<string, string> = {
      'current-date': '[current_date]',
      'promotion-start': '[promotion_start_date]',
      'promotion-end': '[promotion_end_date]',
      'promotion-period': '[promotion_period]'
    };
    
    return dateTypeMap[content.dateConfig.type] || `[${content.dateConfig.type}]`;
  }
  
  // 10. Fallback para valores directos que pueden contener campos dinámicos
  if (content?.staticValue) {
    console.log(`💾 staticValue encontrado: "${content.staticValue}"`);
    // Si contiene campos dinámicos, mostrarlos sin procesar
    if (content.staticValue.includes('[') && content.staticValue.includes(']')) {
      return content.staticValue;
    }
    // Para contenido estático sin fieldType, mostrar nombre técnico en modo técnico
    // Nota: Esta función se llama solo cuando showMockData es false
    return '[static_text]';
  }
  
  if (content?.text) {
    console.log(`📝 text encontrado: "${content.text}"`);
    // Si contiene campos dinámicos, mostrarlos sin procesar
    if (content.text.includes('[') && content.text.includes(']')) {
      return content.text;
    }
    // Para contenido estático sin fieldType, mostrar nombre técnico en modo técnico
    // Nota: Esta función se llama solo cuando showMockData es false
    return '[static_text]';
  }
  
  // 11. Fallback final inteligente basado en el tipo de componente
  console.log(`⚠️ Fallback final para componente ${component.type}, contenido:`, content);
  switch (component.type) {
    case 'field-dynamic-text': return '[product_name]';
    case 'image-header': return '[header_image]';
    case 'image-footer': return '[footer_image]';
    case 'image-background': return '[background_image]';
    case 'image-product': return '[product_image]';
    case 'image-brand-logo': return '[brand_logo]';
    case 'image-decorative': return '[decorative_image]';
    case 'shape-geometric': return '[geometric_shape]';
    default: return `[${(component.type as string).replace('-', '_')}]`;
  }
};

/**
 * Obtener el nombre amigable del tipo de componente
 */
export const getComponentDisplayName = (type: string): string => {
  const displayNames: Record<string, string> = {
    'field-dynamic-text': 'Texto Dinámico',
    'image-header': 'Imagen Header',
    'image-product': 'Imagen Producto', 
    'image-brand-logo': 'Logo Marca',
    'image-decorative': 'Imagen Decorativa',
    'shape-geometric': 'Forma Geométrica'
  };
  return displayNames[type] || type;
};

/**
 * Obtener el color del badge según el tipo
 */
export const getBadgeColor = (type: string): string => {
  if (type.includes('price') || type.includes('discount') || type.includes('installment')) {
    return 'bg-green-500 text-white';
  }
  if (type.includes('product')) {
    return 'bg-blue-500 text-white';
  }
  if (type.includes('image')) {
    return 'bg-purple-500 text-white';
  }
  if (type.includes('date')) {
    return 'bg-orange-500 text-white';
  }
  if (type.includes('qr')) {
    return 'bg-gray-800 text-white';
  }
  if (type.includes('text')) {
    return 'bg-indigo-500 text-white';
  }
  if (type.includes('shape') || type.includes('container')) {
    return 'bg-gray-500 text-white';
  }
  return 'bg-gray-600 text-white';
};

/**
 * Formatear box shadow para zoom
 */
export const formatBoxShadow = (shadows: any[] | undefined, zoom: number): string => {
  if (!shadows || shadows.length === 0) {
    return 'none';
  }
  return shadows.map(shadow => 
    `${shadow.inset ? 'inset ' : ''}${shadow.offsetX * zoom}px ${shadow.offsetY * zoom}px ${shadow.blurRadius * zoom}px ${shadow.spreadRadius * zoom}px ${shadow.color}`
  ).join(', ');
}; 