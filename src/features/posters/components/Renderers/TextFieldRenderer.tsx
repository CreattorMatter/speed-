// =====================================
// TEXT FIELD RENDERER - Posters
// =====================================

import React from 'react';
import { DraggableComponentV3 } from '../../../builderV3/types';
import { ProductoReal } from '../../../../types/product';
import { getDynamicValue, isComponentEditable } from '../../utils/dynamicContentUtils';
import { InlineEditableText } from '../Posters/Editor/Renderers/InlineEditableText';
import AutoFitText from '../../../../components/shared/AutoFitText';

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

interface TextFieldRendererProps {
  component: DraggableComponentV3;
  product?: ProductoReal;
  isPreview?: boolean;
  scale?: number;
  productChanges?: any;
  onEditField?: (fieldType: string, newValue: string) => void;
  onPendingChange?: (fieldType: string, newValue: string | number) => void;
  enableInlineEdit?: boolean;
}

export const TextFieldRenderer: React.FC<TextFieldRendererProps> = ({
  component,
  product,
  isPreview,
  scale = 1,
  productChanges,
  onEditField,
  onPendingChange,
  enableInlineEdit
}) => {
  const content = getDynamicValue(
    component.content,
    product,
    isPreview,
    productChanges,
    component.id
  );

  const isEditable = isComponentEditable(component, enableInlineEdit);

  // Calcular padding y margin seguros
  const paddingValue = component.style?.spacing?.padding ? 
    (typeof component.style.spacing.padding === 'object' ? 
      component.style.spacing.padding.top : component.style.spacing.padding) : 0;
  const marginValue = component.style?.spacing?.margin ? 
    (typeof component.style.spacing.margin === 'object' ? 
      component.style.spacing.margin.top : component.style.spacing.margin) : 0;

  // Estilos del componente escalados
  const componentStyle = {
    position: 'absolute' as const,
    left: `${component.position.x * scale}px`,
    top: `${component.position.y * scale}px`,
    width: `${component.size.width * scale}px`,
    height: `${component.size.height * scale}px`,
    fontSize: `${(component.style?.typography?.fontSize || 16) * scale}px`,
    fontFamily: getFontFamilyWithFallbacks(component.style?.typography?.fontFamily),
    fontWeight: component.style?.typography?.fontWeight || 'normal',
    color: component.style?.color?.color || '#000000',
    textAlign: component.style?.typography?.textAlign as any || 'left',
    textDecoration: component.style?.typography?.textDecoration || 'none',
    lineHeight: component.style?.typography?.lineHeight || 'normal',
    letterSpacing: component.style?.typography?.letterSpacing || 'normal',
    textTransform: component.style?.typography?.textTransform || 'none',
    backgroundColor: component.style?.color?.backgroundColor || 'transparent',
    border: component.style?.border ? `${
(component.style.border.width || 0) * scale
    }px ${component.style.border.style || 'solid'} ${
      component.style.border.color || '#000000'
    }` : 'none',
    borderRadius: component.style?.border?.radius ? `${
      component.style.border.radius.topLeft * scale
    }px` : '0px',
    padding: `${paddingValue * scale}px`,
    margin: `${marginValue * scale}px`,
    opacity: component.style?.effects?.opacity ?? 1,
    transform: `rotate(${component.position.rotation || 0}deg) scale(${
      component.position.scaleX || 1
    }, ${component.position.scaleY || 1})`,
    zIndex: component.position.z || 1,
    overflow: 'hidden',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    boxShadow: component.style?.effects?.boxShadow
      ? component.style.effects.boxShadow.map(shadow => 
          `${shadow.inset ? 'inset ' : ''}${shadow.offsetX * scale}px ${shadow.offsetY * scale}px ${shadow.blurRadius * scale}px ${shadow.spreadRadius * scale}px ${shadow.color}`
        ).join(', ')
      : 'none'
  };

  // Determinar el tipo de campo para la edición
  const getFieldType = (): string => {
    if (component.content?.fieldType === 'static') {
      return `static_${component.id}`;
    }
    // Usar content as any para acceder a propiedades personalizadas
    const contentAny = component.content as any;
    if (contentAny?.productField) {
      return contentAny.productField;
    }
    if (contentAny?.dynamicField) {
      return contentAny.dynamicField;
    }
    return component.content?.fieldType || 'unknown';
  };

  // Función wrapper para onEditField que maneja la signature correcta
  const handleEditField = (newValue: string | number) => {
    if (onEditField) {
      onEditField(getFieldType(), String(newValue));
    }
  };

  if (isEditable && onEditField) {
    return (
      <InlineEditableText
        value={content}
        fieldType={getFieldType()}
        onSave={handleEditField}
        onPendingChange={onPendingChange}
        style={componentStyle}
        placeholder="Editar texto..."
      >
        <span>{content || 'Sin contenido'}</span>
      </InlineEditableText>
    );
  }

  return (
    <div
      style={componentStyle}
      className="select-none"
      title={`Campo: ${getFieldType()}`}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center', // Remover verticalAlign personalizado
          justifyContent: component.style?.typography?.textAlign === 'left' ? 'flex-start' :
                         component.style?.typography?.textAlign === 'right' ? 'flex-end' :
                         'center',
        }}
      >
        <AutoFitText
          text={content || 'Sin contenido'}
          style={{
            width: '100%',
            height: '100%',
            textAlign: component.style?.typography?.textAlign as any || 'left',
            fontFamily: componentStyle.fontFamily as any,
            fontWeight: component.style?.typography?.fontWeight as any,
            lineHeight: component.style?.typography?.lineHeight as any,
            letterSpacing: component.style?.typography?.letterSpacing as any,
            color: component.style?.color?.color || '#000000'
          }}
          baseFontSize={parseFloat(String(componentStyle.fontSize).replace('px',''))}
          minFontSize={6}
        />
      </div>
    </div>
  );
}; 