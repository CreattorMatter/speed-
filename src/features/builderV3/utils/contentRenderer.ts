// =====================================
// CONTENT RENDERER UTILITIES - BuilderV3
// =====================================

import { DraggableComponentV3, DynamicContentV3, ShadowV3 } from '../types';

/**
 * 🆕 FUNCIÓN PARA MOSTRAR NOMBRES TÉCNICOS DURANTE EDICIÓN
 * Extrae los nombres técnicos de los campos en lugar de procesarlos con datos mock
 */
export const getFieldTechnicalNames = (component: DraggableComponentV3): string => {
  const content = component.content as DynamicContentV3;

  if (!content) {
    return `[${component.type.replace('-', '_')}]`;
  }

  // Lógica para textConfig (Texto Dinámico)
  if (content.textConfig?.contentType) {
    const type = content.textConfig.contentType;
    const internalFieldsMap: Record<string, string> = {
      'promotion-title': '[Promo]',
      'numero_cuota': '[N° Cuota]',
      'monto_cuota': '[Monto Cuota]',
      'promo': '[Promo NxN]',
      'custom': content.textConfig.fallbackText || '[Texto Personalizado]'
    };

    if (internalFieldsMap[type]) {
      return internalFieldsMap[type];
    }

    // Para campos de la API, mostrar su nombre técnico directamente.
    return `[${type}]`;
  }

  // Lógica para dateConfig (Fechas)
  if (content.dateConfig?.type) {
    const type = content.dateConfig.type;
    if (type === 'validity-period') {
      if (content.dateConfig.startDate && content.dateConfig.endDate) {
        const formatDate = (dateStr: string) => {
          const [year, month, day] = dateStr.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };
        return `${formatDate(content.dateConfig.startDate)} - ${formatDate(content.dateConfig.endDate)}`;
      }
      return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    const dateTypeMap: Record<string, string> = {
      'current-date': '[Fecha Actual]',
      'promotion-start': '[Inicio Promo]',
      'promotion-end': '[Fin Promo]',
      'promotion-period': '[Período Promo]'
    };
    return dateTypeMap[type] || `[${type}]`;
  }

  // Fallback para otros tipos de componentes o contenido
  if (component.type === 'qr-dynamic') return '[QR Code]';
  if (component.type.startsWith('image-')) return '[Imagen]';
  if (component.type.startsWith('shape-')) return '[Forma]';

  return `[${component.name || component.type}]`;
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
export const formatBoxShadow = (shadows: ShadowV3[] | undefined, zoom: number): string => {
  if (!shadows || shadows.length === 0) {
    return 'none';
  }
  return shadows.map(shadow => 
    `${shadow.inset ? 'inset ' : ''}${shadow.offsetX * zoom}px ${shadow.offsetY * zoom}px ${shadow.blurRadius * zoom}px ${shadow.spreadRadius * zoom}px ${shadow.color}`
  ).join(', ');
}; 