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
      case 'field-dynamic-date': return '[current_date]';
      case 'qr-dynamic': return '[qr_code]';
      default: return `[${component.type.replace('-', '_')}]`;
    }
  }
  
  // 1. Contenido estático - mostrar tal como está
  if (content?.fieldType === 'static') {
    return content?.staticValue || content?.text || 'Texto estático';
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
    const dateTypeMap: Record<string, string> = {
      'current-date': '[current_date]',
      'promotion-start': '[promotion_start_date]',
      'promotion-end': '[promotion_end_date]'
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
    return content.staticValue;
  }
  
  if (content?.text) {
    console.log(`📝 text encontrado: "${content.text}"`);
    // Si contiene campos dinámicos, mostrarlos sin procesar
    if (content.text.includes('[') && content.text.includes(']')) {
      return content.text;
    }
    return content.text;
  }
  
  // 11. Fallback final inteligente basado en el tipo de componente
  console.log(`⚠️ Fallback final para componente ${component.type}, contenido:`, content);
  switch (component.type) {
    case 'field-dynamic-text': return '[product_name]';
    case 'field-dynamic-date': return '[current_date]';
    case 'qr-dynamic': return '[qr_code]';
    case 'image-header': return '[header_image]';
    case 'image-footer': return '[footer_image]';
    case 'image-background': return '[background_image]';
    case 'image-product': return '[product_image]';
    case 'image-brand-logo': return '[brand_logo]';
    case 'image-decorative': return '[decorative_image]';
    default: return `[${component.type.replace('-', '_')}]`;
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
    'qr-dynamic': 'QR Dinámico',
    'field-dynamic-date': 'Fecha Dinámica',
    'shape-geometric': 'Forma Geométrica',
    'decorative-line': 'Línea Decorativa',
    'decorative-icon': 'Ícono Decorativo',
    'container-flexible': 'Contenedor Flexible',
    'container-grid': 'Grilla de Contenido'
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