// =====================================
// COMPONENT RENDERER - Canvas V3
// =====================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DraggableComponentV3, BuilderOperationsV3 } from '../../types';
import { ResizeHandles } from './ResizeHandles';
import { processDynamicContent, defaultMockData } from '../../../../utils/dynamicContentProcessor';
import { getFieldTechnicalNames } from '../../utils/contentRenderer';

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
  operations
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
    (component.content as any)?.dynamicTemplate
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
      fontSize: component.style.typography?.fontSize || 16,
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
      overflow: 'hidden',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: component.style.typography?.textAlign === 'center' ? 'center' : 
                     component.style.typography?.textAlign === 'right' ? 'flex-end' : 'flex-start',
      // 🔧 CRÍTICO: Evitar que el contenido interfiera con el drag
      pointerEvents: 'none'
    };

    switch (component.type) {
      case 'field-dynamic-text':
      case 'field-dynamic-date':
        return (
          <div style={baseStyle}>
            {getDisplayContent()}
          </div>
        );

      case 'image-header':
      case 'image-product':
      case 'image-brand-logo':
      case 'image-decorative':
        const imageUrl = component.content?.imageUrl || '/placeholder-image.png';
        return (
          <div style={{ ...baseStyle, padding: 0 }}>
            <img
              src={imageUrl}
              alt={component.content?.imageAlt || 'Imagen'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: component.style.border?.radius?.topLeft || 0,
                // 🔧 CRÍTICO: Evitar que la imagen interfiera con el drag
                pointerEvents: 'none'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
              }}
            />
          </div>
        );

      case 'qr-dynamic':
        return (
          <div style={{ ...baseStyle, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              width: '80%',
              height: '80%',
              backgroundColor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              // 🔧 CRÍTICO: Evitar que el QR interfiera con el drag
              pointerEvents: 'none'
            }}>
              QR
            </div>
          </div>
        );

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
  
  const componentStyles: React.CSSProperties = {
    position: 'absolute',
    left: `${component.position.x * zoom}px`,
    top: `${component.position.y * zoom}px`,
    width: `${component.size.width * zoom}px`,
    height: `${component.size.height * zoom}px`,
    zIndex: isSelected ? 1000 : component.position.z || 1,
    opacity: component.isVisible ? (component.style.effects?.opacity || 1) : 0.3,
    transform: `
      rotate(${component.style.effects?.transform?.rotate || 0}deg)
      scale(${component.style.effects?.transform?.scaleX || 1}, ${component.style.effects?.transform?.scaleY || 1})
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

  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    border: isSelected && !isMultiSelected ? '2px solid #3b82f6' : 
           isSelected && isMultiSelected ? '2px solid #f59e0b' :
           isHovered ? '1px solid #93c5fd' : 'none',
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
    </div>
  );
}; 