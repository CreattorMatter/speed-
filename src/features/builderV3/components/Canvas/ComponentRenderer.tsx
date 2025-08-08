// =====================================
// COMPONENT RENDERER - Canvas V3
// =====================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DraggableComponentV3, BuilderOperationsV3 } from '../../types';
import { ResizeHandles } from './ResizeHandles';
import { processDynamicContent, defaultMockData } from '../../../../utils/dynamicContentProcessor';
import { getFieldTechnicalNames } from '../../utils/contentRenderer';
import { formatValidityPeriod } from '../../../../utils/validityPeriodValidator';

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

interface ComponentRendererProps {
  component: DraggableComponentV3;
  isSelected: boolean;
  isMultiSelected: boolean;
  zoom: number;
  snapToGrid: boolean;
  gridSize: number;
  snapTolerance: number;
  allComponents: DraggableComponentV3[];
  onClick: (e: React.MouseEvent) => void;
  operations: BuilderOperationsV3;
  isPreviewMode?: boolean; // ✅ Nueva prop para modo preview
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isSelected,
  isMultiSelected,
  zoom,
  snapToGrid,
  gridSize,
  snapTolerance,
  allComponents,
  onClick,
  operations,
  isPreviewMode = false // ✅ Destructurar nueva prop con default false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialPosition, setInitialPosition] = useState<any>(null);
  
  // 🔧 NUEVA LÓGICA: Usar refs para tracking del drag
  const dragStateRef = useRef({
    isDragging: false,
    dragStart: null as { x: number; y: number } | null,
    initialPosition: null as any
  });

  /**
   * 🎯 LÓGICA MEJORADA PARA EL TOGGLE DE MOCK DATA
   * Función helper para decidir qué contenido mostrar según el toggle showMockData
   */
  const displayContent = useMemo(() => {
    // =====================
    // DECISIÓN PRINCIPAL: MOCK vs TÉCNICO
    // =====================
    
    // =====================
    // CASO ESPECIAL: FECHA VIGENCIA
    // =====================
    // La fecha vigencia SIEMPRE muestra las fechas configuradas en la plantilla
    if ((component.content as any)?.dateConfig?.type === 'validity-period') {
      const content = component.content as any;
      if (content?.dateConfig?.startDate && content?.dateConfig?.endDate) {
        // Usar el validador de fechas de vigencia
        return formatValidityPeriod({
          startDate: content.dateConfig.startDate,
          endDate: content.dateConfig.endDate
        });
      }
      // Fallback si no hay fechas configuradas
      return '21/07/2025 - 04/08/2025';
    }
    
    const shouldShowMockData = component.showMockData !== false; // Por defecto true
    
    if (shouldShowMockData) {
      // =====================
      // MODO MOCK DATA
      // =====================
      
      // Para contenido estático real (no placeholders), mostrarlo directamente
      if (component.content?.staticValue && 
          !component.content.staticValue.startsWith('[') && 
          !component.content.staticValue.endsWith(']') &&
          component.content.staticValue !== 'Nuevo componente') {
        return component.content.staticValue;
      }
      
      // Procesar con mock data
      const mockResult = processDynamicContent(component.content as any, defaultMockData);
      return mockResult;
      
    } else {
      // =====================
      // MODO NOMBRES TÉCNICOS
      // =====================
      
      const technicalResult = getFieldTechnicalNames(component);
      return technicalResult;
    }
  }, [
    component.id, 
    component.showMockData, 
    component.type,
    component.content?.staticValue,
    component.content?.fieldType,
    (component.content as any)?.dynamicTemplate,
    (component.content as any)?.outputFormat,
    (component.content as any)?.calculatedField?.expression,
    (component.content as any)?.dateConfig?.type,
    (component.content as any)?.dateConfig?.startDate,
    (component.content as any)?.dateConfig?.endDate
  ]);
  
  // Función wrapper para mantizar compatibilidad
  const getDisplayContent = () => displayContent;

  // =====================
  // 🔧 NUEVA LÓGICA DE DRAG & DROP MÁS ROBUSTA
  // =====================
  
  // Event handlers definidos fuera para evitar recreaciones
  const handleMouseMove = useRef((moveEvent: MouseEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging || !dragState.dragStart || !dragState.initialPosition) return;

    const deltaX = (moveEvent.clientX - dragState.dragStart.x) / zoom;
    const deltaY = (moveEvent.clientY - dragState.dragStart.y) / zoom;
    
    let newX = dragState.initialPosition.x + deltaX;
    let newY = dragState.initialPosition.y + deltaY;

    // Snap to grid si está habilitado
    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    // Aplicar restricciones
    if (component.constraints) {
      if (component.constraints.x) {
        newX = Math.max(component.constraints.x.min, Math.min(component.constraints.x.max, newX));
      }
      if (component.constraints.y) {
        newY = Math.max(component.constraints.y.min, Math.min(component.constraints.y.max, newY));
      }
    }

    operations.updateComponent(component.id, {
      position: { 
        x: newX, 
        y: newY,
        z: component.position.z || 0,
        rotation: component.position.rotation || 0,
        scaleX: component.position.scaleX || 1,
        scaleY: component.position.scaleY || 1
      }
    });
  }).current;

  const handleMouseUp = useRef(() => {
    // Limpiar estado
    dragStateRef.current = {
      isDragging: false,
      dragStart: null,
      initialPosition: null
    };
    
    setIsDragging(false);
    setDragStart(null);
    setInitialPosition(null);
  }).current;

  // UseEffect para manejar los event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (component.isLocked || !component.isDraggable) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Actualizar estados
    const newDragStart = { x: e.clientX, y: e.clientY };
    const newInitialPosition = { x: component.position.x, y: component.position.y };
    
    // Actualizar ref para event handlers
    dragStateRef.current = {
      isDragging: true,
      dragStart: newDragStart,
      initialPosition: newInitialPosition
    };
    
    // Actualizar estados de React
    setIsDragging(true);
    setDragStart(newDragStart);
    setInitialPosition(newInitialPosition);
  };

  // =====================
  // RENDERIZADO DEL CONTENIDO
  // =====================
  
  const renderComponentContent = () => {
    const baseStyle: React.CSSProperties = {
      fontSize: (component.style.typography?.fontSize || 16) * zoom, // ✅ Aplicar zoom al fontSize para escalado correcto
      fontFamily: getFontFamilyWithFallbacks(component.style.typography?.fontFamily),
      fontWeight: component.style.typography?.fontWeight || 'normal',
      fontStyle: component.style.typography?.fontStyle || 'normal',
      textAlign: component.style.typography?.textAlign || 'left',
      lineHeight: component.style.typography?.lineHeight || 1.4,
      letterSpacing: component.style.typography?.letterSpacing || 0,
      textTransform: component.style.typography?.textTransform || 'none',
      textDecoration: component.style.typography?.textDecoration || 'none',
      color: component.style.color?.color || '#000000',
      backgroundColor: component.style.color?.backgroundColor || 'transparent',
      padding: typeof component.style.spacing?.padding === 'object' 
        ? `${component.style.spacing.padding.top}px ${component.style.spacing.padding.right}px ${component.style.spacing.padding.bottom}px ${component.style.spacing.padding.left}px`
        : component.style.spacing?.padding || 0,
      borderRadius: component.style.border?.radius?.topLeft || 0,
      border: component.style.border?.width ? 
        `${component.style.border.width}px ${component.style.border.style || 'solid'} ${component.style.border.color || '#000000'}` : 
        'none',
      // 🔧 CRÍTICO: Forzar que el contenido respete estrictamente las dimensiones del contenedor
      overflow: 'hidden',
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      minWidth: 0,
      minHeight: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: component.style.typography?.textAlign === 'center' ? 'center' : 
                     component.style.typography?.textAlign === 'right' ? 'flex-end' : 'flex-start',
      // 🔧 CRÍTICO: Preservar saltos de línea en textos dinámicos pero forzar wrap
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      wordWrap: 'break-word',
      hyphens: 'auto',
      // 🔧 CRÍTICO: Evitar que el contenido interfiera con el drag
      pointerEvents: 'none',
      // 🔧 NUEVO: Asegurar que el texto no se desborde
      textOverflow: 'ellipsis',
      // 🔧 NUEVO: Forzar layout estricto
      boxSizing: 'border-box'
    };

    switch (component.type) {
      case 'field-dynamic-text':
        return (
          <div style={baseStyle}>
            {getDisplayContent()}
          </div>
        );

      case 'image-header':
      case 'image-footer':
      case 'image-background':
      case 'image-product':
      case 'image-brand-logo':
      case 'image-financing':
      case 'image-decorative':
        // Si no hay URL de imagen, mostrar contenedor vacío (sin placeholder)
        if (!component.content?.imageUrl) {
          const label = component.type === 'image-header' 
            ? 'Header (sin imagen)'
            : component.type === 'image-footer' 
              ? 'Footer (sin imagen)'
              : component.type === 'image-financing'
                ? 'Logo financiación (sin imagen)'
                : 'Imagen (sin imagen)';

          return (
            <div
              style={{
                ...baseStyle,
                padding: 0,
                backgroundColor: 'rgba(148, 163, 184, 0.12)', // slate-400/20
                border: '2px dashed #cbd5e1', // slate-300
                color: '#64748b', // slate-500
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: (component.style.typography?.fontSize || 14) * Math.max(0.8, zoom)
              }}
            >
              {label}
            </div>
          );
        }
        return (
          <div style={{ ...baseStyle, padding: 0 }}>
            <img
              src={component.content.imageUrl}
              alt={component.content?.imageAlt || 'Imagen'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: component.type === 'image-background' ? 'cover' : 'contain',
                borderRadius: component.style.border?.radius?.topLeft || 0,
                pointerEvents: 'none'
              }}
            />
          </div>
        );

      case 'shape-geometric': {
        const bg = component.style.color?.backgroundColor ?? 'transparent';
        const borderWidth = component.style.border?.width ?? 1;
        const borderStyle = component.style.border?.style ?? 'solid';
        const borderColor = component.style.border?.color ?? '#333333';
        const shapeType = (component.content as any)?.shapeConfig?.type || 'rectangle';
        const radiusValue = component.style.border?.radius?.topLeft ?? 0;

        const shapeStyle: React.CSSProperties = {
          ...baseStyle,
          backgroundColor: bg,
          border: `${borderWidth}px ${borderStyle} ${borderColor}`,
          borderRadius: shapeType === 'circle' ? '50%' : radiusValue,
        };

        return <div style={shapeStyle} />;
      }



      default:
        return (
          <div style={baseStyle}>
            {getDisplayContent()}
          </div>
        );
    }
  };

  // =====================
  // ESTILOS PRINCIPALES
  // =====================
  
  // Tomar transformaciones desde position (panel de propiedades) con fallback a style.effects.transform
  const rotationDeg = (component.position?.rotation ?? component.style.effects?.transform?.rotate ?? 0);
  const scaleXVal = (component.position?.scaleX ?? component.style.effects?.transform?.scaleX ?? 1);
  const scaleYVal = (component.position?.scaleY ?? component.style.effects?.transform?.scaleY ?? 1);

  const componentStyles: React.CSSProperties = {
    position: 'absolute',
    left: `${component.position.x * zoom}px`,
    top: `${component.position.y * zoom}px`,
    width: `${component.size.width * zoom}px`,
    height: `${component.size.height * zoom}px`,
    zIndex: isSelected ? 1000 : component.position.z || 1,
    opacity: component.isVisible ? (component.style.effects?.opacity || 1) : 0.3,
    transform: `
      rotate(${rotationDeg}deg)
      scale(${scaleXVal}, ${scaleYVal})
    `,
    filter: `
      blur(${component.style.effects?.filter?.blur || 0}px)
      brightness(${component.style.effects?.filter?.brightness || 100}%)
      contrast(${component.style.effects?.filter?.contrast || 100}%)
      saturate(${component.style.effects?.filter?.saturate || 100}%)
    `,
    cursor: component.isLocked ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
    transition: isDragging ? 'none' : 'all 0.15s ease',
    userSelect: 'none',
    pointerEvents: component.isLocked ? 'none' : 'auto',
    boxShadow: component.style.effects?.boxShadow?.map(shadow => 
      `${shadow.inset ? 'inset ' : ''}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blurRadius}px ${shadow.spreadRadius}px ${shadow.color}`
    ).join(', ') || 'none'
  };

  // Determinar el color del borde basado en la etiqueta personalizada
  const getBorderColor = () => {
    if (component.customLabel?.show && component.customLabel?.color) {
      return component.customLabel.color;
    }
    
    if (isSelected && !isMultiSelected) return '#3b82f6';
    if (isSelected && isMultiSelected) return '#f59e0b';
    if (isHovered) return '#93c5fd';
    return 'transparent';
  };

  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    border: `2px solid ${getBorderColor()}`,
    borderRadius: '2px',
    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    pointerEvents: 'none',
    zIndex: 10
  };

  // =====================
  // RENDERIZADO FINAL
  // =====================
  
  return (
    <div
      style={componentStyles}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        // Solo ejecutar onClick si no estamos en medio de un drag
        if (!isDragging) {
          onClick(e);
        }
      }}
      data-component-id={component.id}
      data-component-type={component.type}
      className={`builder-component ${isDragging ? 'dragging' : ''}`}
    >
      {/* Contenido del componente */}
      {renderComponentContent()}
      
      {/* ✅ Ocultar elementos de UI del builder en modo preview */}
      {!isPreviewMode && (
        <>
          {/* Overlay de selección */}
          <div style={overlayStyles} />
          
          {/* Etiqueta personalizada */}
          {component.customLabel?.show && (
            <div
              style={{
                position: 'absolute',
                top: '-24px',
                left: '0',
                backgroundColor: component.customLabel.color,
                color: component.customLabel.textColor || 'white',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: 'bold',
                zIndex: 20,
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
              }}
            >
              {component.customLabel.name}
            </div>
          )}

          {/* Handles de redimensionamiento */}
          {isSelected && !component.isLocked && component.isResizable && (
            <ResizeHandles
              component={component}
              zoom={zoom}
              operations={operations}
              isVisible={!isMultiSelected}
            />
          )}
        </>
      )}
    </div>
  );
}; 