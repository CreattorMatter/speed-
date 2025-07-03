import React from 'react';
import { TemplateV3, DraggableComponentV3 } from '../../../../../../features/builderV3/types';
import { ProductoReal } from '../../../../../../types/product';
import { getDynamicFieldValue, processDynamicTemplate } from '../../../../../../utils/productFieldsMap';
import { InlineEditableText } from './InlineEditableText';

interface BuilderTemplateRendererProps {
  template: TemplateV3;
  components: DraggableComponentV3[];
  product?: ProductoReal; // Producto para rellenar los campos dinámicos
  isPreview?: boolean; // Si es vista previa, usar datos de ejemplo
  scale?: number; // Escala para la vista previa
  productChanges?: any; // Cambios del usuario desde Redux
  onEditField?: (fieldType: string, newValue: string) => void; // 🆕 Callback para edición inline
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
  productChanges?: any // Cambios del usuario desde Redux
): string => {
  if (!content) return '';
  
  // Función auxiliar para obtener el valor de un campo del producto
  const getProductValue = (field: string, fallback: any = '') => {
    if (!product) return fallback;
    
    // 🆕 CORREGIDO: Buscar en el array de cambios de Redux
    if (productChanges && productChanges[product.id]) {
      const changes = productChanges[product.id].changes || [];
      const change = changes.find((c: any) => c.field === field);
      if (change) {
        console.log(`📝 Usando valor editado para ${field}: ${change.newValue}`);
        // Si el nuevo valor es numérico y el campo es precio, formatear
        if (field.includes('precio') || field.includes('price')) {
          const numValue = typeof change.newValue === 'string' 
            ? parseFloat(change.newValue.replace(/[^\d.,]/g, '').replace(',', '.'))
            : change.newValue;
          return !isNaN(numValue) ? `$ ${numValue.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : change.newValue;
        }
        return change.newValue;
      }
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
    
    // Primero verificar cambios del usuario para el template completo
    const fieldType = getFieldType(content);
    if (productChanges && productChanges[product.id]) {
      const changes = productChanges[product.id].changes || [];
      const change = changes.find((c: any) => c.field === fieldType);
      if (change) {
        console.log(`📝 Usando valor editado para campo dinámico ${fieldType}: ${change.newValue}`);
        return String(change.newValue);
      }
    }
    
    // Si no hay cambios, procesar el template dinámico
    const processedValue = processDynamicTemplate(content.dynamicTemplate, product, { prefix: true });
    console.log(`📊 Valor procesado del template: ${processedValue}`);
    return processedValue;
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
  
  // Fallback para otros tipos de contenido
  return content?.staticValue || content?.fallbackText || '';
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
  
  // Para campos con valor estático o texto
  if (content?.staticValue || content?.text) {
    const value = (content.staticValue || content.text || '').toLowerCase();
    
    if (value.includes('nombre') || value.includes('name')) return 'descripcion';
    if (value.includes('precio') || value.includes('price') || value.includes('$')) return 'precio';
    if (value.includes('sku') || value.includes('sap')) return 'sku';
    if (value.includes('porcentaje') || value.includes('percentage') || value.includes('%')) return 'porcentaje';
    if (value.includes('fecha') || value.includes('date')) return 'fechas';
    if (value.includes('origen') || value.includes('brand') || value.includes('marca')) return 'marcaTexto';
    if (value.includes('sin_impuesto') || value.includes('without_tax')) return 'basePrice';
  }
  
  // Para campos SAP conectados
  if (content?.fieldType === 'sap-product' && content?.sapConnection?.fieldName) {
    const fieldName = content.sapConnection.fieldName.toLowerCase();
    
    if (fieldName.includes('name') || fieldName.includes('nombre')) return 'descripcion';
    if (fieldName.includes('price') || fieldName.includes('precio')) return 'precio';
    if (fieldName.includes('sku')) return 'sku';
    
    return 'universal';
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
  
  // Fallback para cualquier campo dinámico
  return 'texto';
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
 * Mapa de componentes con renderización inteligente
 * 🎯 MEJORA: Ahora considera cambios del usuario + edición inline
 */
const renderComponent = (
  component: DraggableComponentV3, 
  product?: ProductoReal, 
  isPreview?: boolean, 
  productChanges?: any,
  onEditField?: (fieldType: string, newValue: string) => void,
  enableInlineEdit?: boolean
) => {
  const { type, content, style } = component;
  const cssStyle = extractCSSStyles(style);
  
  const isImageComponent = type.startsWith('image-');
  const componentStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${component.position.x}px`,
    top: `${component.position.y}px`,
    width: `${component.size.width}px`,
    height: `${component.size.height}px`,
    transform: `rotate(${component.position.rotation || 0}deg) scale(${component.position.scaleX || 1}, ${component.position.scaleY || 1})`,
    visibility: component.isVisible ? 'visible' : 'hidden',
    opacity: component.style?.effects?.opacity ?? 1,
    fontFamily: component.style?.typography?.fontFamily,
    fontSize: `${(component.style?.typography?.fontSize || 16)}px`,
    fontWeight: component.style?.typography?.fontWeight,
    color: component.style?.color?.color,
    textAlign: component.style?.typography?.textAlign as any,
    backgroundColor: isImageComponent ? 'transparent' : (component.style?.color?.backgroundColor || 'transparent'),
    borderRadius: component.style?.border?.radius ? `${component.style.border.radius.topLeft}px` : undefined,
    border: component.style?.border && component.style.border.width > 0
      ? `${component.style.border.width}px ${component.style.border.style || 'solid'} ${component.style.border.color || '#000000'}`
      : 'none',
    boxSizing: 'border-box'
  };
  
  switch (type) {
    case 'field-dynamic-text':
      const textValue = getDynamicValue(content, product, isPreview, productChanges);
      const fieldType = getFieldType(content);
      
      // Debug: Log del valor dinámico
      if (product) {
        console.log(`🎨 Renderizando campo dinámico:`, {
          contentType: content?.textConfig?.contentType,
          staticValue: content?.staticValue,
          text: content?.text,
          fieldType,
          textValue,
          productName: product.name,
          hasChanges: !!(productChanges && productChanges[product.id]),
          enableInlineEdit
        });
      }
      
      const textValidAlign = getValidTextAlign(cssStyle.textAlign);

      const baseStyle: React.CSSProperties = {
        fontSize: 16,
        fontFamily: 'inherit',
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
        lineHeight: 1.2,
        overflow: 'hidden',
        wordWrap: 'break-word',
        height: '100%',
        ...cssStyle,
        textAlign: textValidAlign,
        whiteSpace: 'pre-wrap'
      };
      
      const textContent = textValue || (product ? 'Nuevo componente' : 'Campo dinámico');
      
      // 🎯 EDICIÓN INLINE: Si está habilitada, envolver con InlineEditableText
      if (enableInlineEdit && onEditField && product && !isPreview) {
        console.log(`🖱️ Habilitando edición inline para campo: ${fieldType}`);
        
        return (
          <InlineEditableText
            value={textValue}
            onSave={(newValue) => {
              console.log(`📝 Guardando edición inline: ${fieldType} = ${newValue}`);
              onEditField(fieldType, String(newValue));
            }}
            fieldType={fieldType}
            style={baseStyle}
          >
            <div title={`${fieldType}: ${textValue}`}>
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
            <div className="text-center">🖼️</div>
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
          ...cssStyle
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
      
    case 'field-dynamic-date':
      let dateValue = '';
      if (content?.dateConfig?.type === 'current-date') {
        dateValue = new Date().toLocaleDateString('es-AR');
      } else if (content?.dateConfig?.type === 'promotion-start') {
        dateValue = '15/05/2025';
      } else if (content?.dateConfig?.type === 'promotion-end') {
        dateValue = '18/05/2025';
      } else {
        dateValue = content?.staticValue || new Date().toLocaleDateString('es-AR');
      }
      
      const dateValidAlign = getValidTextAlign(cssStyle.textAlign);

      return (
        <div style={{
          fontSize: 14,
          fontFamily: 'inherit',
          color: '#666666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: dateValidAlign === 'center' ? 'center' : 
                         dateValidAlign === 'right' ? 'flex-end' : 'flex-start',
          ...cssStyle,
          textAlign: dateValidAlign,
          whiteSpace: 'pre-wrap'
        }}>
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
        ...cssStyle,
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
          ...cssStyle,
          whiteSpace: 'pre-wrap'
        }} />
      );
      
    case 'decorative-icon':
      const iconName = content?.iconConfig?.iconName || '★';
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.min(component.size.width, component.size.height) * 0.8,
          color: '#000000',
          ...cssStyle,
          whiteSpace: 'pre-wrap'
        }}>
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
          ...cssStyle,
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
        const componentStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${component.position.x}px`,
          top: `${component.position.y}px`,
          width: `${component.size.width}px`,
          height: `${component.size.height}px`,
          transform: `rotate(${component.position.rotation || 0}deg) scale(${component.position.scaleX || 1}, ${component.position.scaleY || 1})`,
          visibility: component.isVisible ? 'visible' : 'hidden',
          opacity: component.style?.effects?.opacity ?? 1,
          fontFamily: component.style?.typography?.fontFamily,
          fontSize: `${(component.style?.typography?.fontSize || 16)}px`,
          fontWeight: component.style?.typography?.fontWeight,
          color: component.style?.color?.color,
          textAlign: component.style?.typography?.textAlign as any,
          backgroundColor: component.style?.color?.backgroundColor || 'transparent',
          borderRadius: component.style?.border?.radius ? `${component.style.border.radius.topLeft}px` : undefined,
          border: component.style?.border && component.style.border.width > 0
            ? `${component.style.border.width}px ${component.style.border.style || 'solid'} ${component.style.border.color || '#000000'}`
            : 'none',
          boxSizing: 'border-box'
        };

        return (
          <div key={component.id} style={componentStyle}>
            {renderComponent(component, product, isPreview, productChanges, onEditField, enableInlineEdit)}
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