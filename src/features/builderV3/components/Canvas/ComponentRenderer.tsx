// =====================================
// COMPONENT RENDERER - BuilderV3
// =====================================

import React, { useState, useCallback, useEffect } from 'react';
import { DraggableComponentV3, BuilderOperationsV3 } from '../../types';
import { getDynamicFieldValue } from '../../../../utils/productFieldsMap';
import { ResizeHandles } from './ResizeHandles';
import { getFieldTechnicalNames, getComponentDisplayName, getBadgeColor, formatBoxShadow } from '../../utils/contentRenderer';
import { processDynamicContent, defaultMockData } from '../../../../utils/dynamicContentProcessor';

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

  /**
   * Función helper para decidir qué contenido mostrar según el toggle showMockData
   */
  const getDisplayContent = (component: DraggableComponentV3) => {
    console.log(`🎯 getDisplayContent - Component ${component.id}:`, {
      type: component.type,
      showMockData: component.showMockData,
      hasStaticValue: !!component.content?.staticValue,
      staticValue: component.content?.staticValue,
      fieldType: (component.content as any)?.fieldType,
      dynamicTemplate: (component.content as any)?.dynamicTemplate
    });

    // Solo usar staticValue si es un valor real, no un placeholder como '[product_name]'
    if (component.content?.staticValue && 
        !component.content.staticValue.startsWith('[') && 
        !component.content.staticValue.endsWith(']')) {
      console.log(`✅ Usando staticValue real: "${component.content.staticValue}"`);
      return component.content.staticValue;
    }
    
    // Si showMockData es true (por defecto) o undefined, mostrar datos mock
    // Si showMockData es false, mostrar nombres técnicos
    if (component.showMockData !== false) {
      console.log(`🎭 Mostrando datos mock para ${component.id}`);
      // Mostrar datos mock procesados
      const mockResult = processDynamicContent(component.content as any, defaultMockData);
      console.log(`🎭 Resultado mock: "${mockResult}"`);
      return mockResult;
    } else {
      console.log(`🏷️ Mostrando nombres técnicos para ${component.id}`);
      // Mostrar nombres técnicos sin procesar
      const technicalResult = getFieldTechnicalNames(component);
      console.log(`🏷️ Resultado técnico: "${technicalResult}"`);
      return technicalResult;
    }
  };

  /**
   * Manejar inicio de arrastre
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Permitir arrastrar siempre, excepto si está bloqueado
    if (component.isLocked) {
      return;
    }
    
    e.stopPropagation();
    onClick(e);
    
    setIsDragging(true);
    const startPos = { x: e.clientX, y: e.clientY };
    const startComponentPos = component.position;
    setDragStart(startPos);
    setInitialPosition(startComponentPos);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startPos.x) / zoom;
      const deltaY = (moveEvent.clientY - startPos.y) / zoom;

      let newX = startComponentPos.x + deltaX;
      let newY = startComponentPos.y + deltaY;

      // Smart snapping
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      // Snap to other components
      const snapTargets = allComponents.filter(c => c.id !== component.id);
      for (const target of snapTargets) {
        // Horizontal snapping
        if (Math.abs(newX - target.position.x) < snapTolerance) {
          newX = target.position.x;
        }
        if (Math.abs(newX + component.size.width - target.position.x) < snapTolerance) {
          newX = target.position.x - component.size.width;
        }
        if (Math.abs(newX - (target.position.x + target.size.width)) < snapTolerance) {
          newX = target.position.x + target.size.width;
        }

        // Vertical snapping
        if (Math.abs(newY - target.position.y) < snapTolerance) {
          newY = target.position.y;
        }
        if (Math.abs(newY + component.size.height - target.position.y) < snapTolerance) {
          newY = target.position.y - component.size.height;
        }
        if (Math.abs(newY - (target.position.y + target.size.height)) < snapTolerance) {
          newY = target.position.y + target.size.height;
        }
      }

      // Evitar que se salga del canvas
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);

      operations.updateComponent(component.id, {
        position: {
          ...component.position,
          x: newX,
          y: newY
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
      setInitialPosition(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [component, zoom, onClick, operations, snapToGrid, gridSize, snapTolerance, allComponents]);

  /**
   * Renderizar contenido específico del componente
   */
  const renderComponentContent = () => {
    // Calcular el tamaño de fuente base sin zoom para evitar doble escalado
    const baseFontSize = component.style?.typography?.fontSize || 16;
    
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      fontSize: `${baseFontSize}px`, // NO aplicar zoom aquí, se aplicará en el contenedor
      fontFamily: getFontFamilyWithFallbacks(component.style?.typography?.fontFamily),
      fontWeight: component.style?.typography?.fontWeight || 'normal',
      color: component.style?.color?.color || '#000000',
      textAlign: component.style?.typography?.textAlign as any || 'left',
      textDecoration: component.style?.typography?.textDecoration || 'none',
      lineHeight: component.style?.typography?.lineHeight || 1.2,
      letterSpacing: `${(component.style?.typography?.letterSpacing || 0)}px`,
      overflow: 'hidden', // Evitar que el texto se salga del contenedor
      wordWrap: 'break-word',
      hyphens: 'auto',
    };

    switch (component.type) {
      case 'field-dynamic-text':
        const dynamicText = getDisplayContent(component);
        return (
          <div 
            style={{
              ...baseStyle,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: component.style?.typography?.textAlign === 'center' ? 'center' : 
                            component.style?.typography?.textAlign === 'right' ? 'flex-end' : 'flex-start',
              alignItems: component.style?.typography?.textAlign === 'center' ? 'center' : 
                          component.style?.typography?.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: `${Math.max(4, 8 / zoom)}px`, // Padding responsive al zoom
              boxSizing: 'border-box',
              width: '100%',
              height: '100%'
            }}
            className="select-none"
            title={`Campo dinámico: ${dynamicText}`}
          >
            <div 
              style={{ 
                textAlign: component.style?.typography?.textAlign as any || 'left',
                maxWidth: '100%',
                maxHeight: '100%',
                overflow: 'hidden'
              }}
            >
              {dynamicText}
            </div>
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
            className="w-full h-full flex items-center justify-center select-none"
            style={{ backgroundColor: component.style?.color?.backgroundColor || 'transparent' }}
          >
            {component.content?.imageUrl ? (
              <img 
                src={component.content.imageUrl} 
                alt={component.content?.imageAlt || 'Imagen'} 
                className="w-full h-full object-contain"
                draggable={false}
              />
            ) : (
              <div className="text-gray-500 text-center p-2 border-2 border-dashed border-gray-300 rounded-md w-full h-full flex flex-col items-center justify-center">
                <span className="text-2xl">🖼️</span>
                <div className="text-xs mt-1">Imagen</div>
              </div>
            )}
          </div>
        );

      case 'qr-dynamic':
        return (
          <div className="w-full h-full bg-gray-50 border border-gray-200 flex items-center justify-center select-none">
            <div className="text-center">
              <span className="text-3xl">📱</span>
              <div className="text-xs mt-1">QR Code</div>
            </div>
          </div>
        );

      case 'field-dynamic-date':
        const dynamicDate = getDisplayContent(component);
        return (
          <div 
            style={{
              ...baseStyle,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: component.style?.typography?.textAlign === 'center' ? 'center' : 
                            component.style?.typography?.textAlign === 'right' ? 'flex-end' : 'flex-start',
              alignItems: component.style?.typography?.textAlign === 'center' ? 'center' : 
                          component.style?.typography?.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: `${Math.max(4, 8 / zoom)}px`, // Padding responsive al zoom
              boxSizing: 'border-box',
              width: '100%',
              height: '100%'
            }}
            className="select-none"
            title={`Campo de fecha: ${dynamicDate}`}
          >
            <div 
              style={{ 
                textAlign: component.style?.typography?.textAlign as any || 'left',
                maxWidth: '100%',
                maxHeight: '100%',
                overflow: 'hidden'
              }}
            >
              {dynamicDate}
            </div>
          </div>
        );

      case 'shape-geometric':
        const borderConfig = component.style?.border;
        const hasBorder = borderConfig && borderConfig.width > 0;
        const backgroundColor = component.style?.color?.backgroundColor || '#e5e7eb';
        const borderRadius = borderConfig?.radius?.topLeft || 0;
        
        return (
          <div 
            className="w-full h-full select-none transition-all duration-200"
            style={{
              backgroundColor,
              borderRadius: `${borderRadius * zoom}px`,
              border: hasBorder 
                ? `${borderConfig.width * zoom}px ${borderConfig.style || 'solid'} ${borderConfig.color || '#000000'}`
                : 'none',
              boxSizing: 'border-box'
            }}
          />
        );

      case 'decorative-line':
        return (
          <div 
            className="w-full select-none"
            style={{
              height: `${(component.style?.border?.width || 2) * zoom}px`,
              backgroundColor: component.style?.color?.backgroundColor || '#d1d5db',
              transform: 'translateY(50%)'
            }}
          />
        );

      case 'decorative-icon':
        return (
          <div className="w-full h-full flex items-center justify-center select-none">
            <span style={{ fontSize: `${Math.min(component.size.width, component.size.height) * 0.6}px` }}>
              {component.content?.staticValue || '⭐'}
            </span>
          </div>
        );

      case 'container-flexible':
      case 'container-grid':
        return (
          <div className="w-full h-full border-2 border-dashed border-blue-300 bg-blue-50 bg-opacity-50 flex items-center justify-center select-none">
            <div className="text-blue-600 text-center">
              <span className="text-xl">📦</span>
              <div className="text-xs mt-1">Contenedor</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center select-none">
            <span className="text-gray-500 text-xs">Componente desconocido</span>
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute select-none group transition-all duration-200 ${
        isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'
      } ${component.isLocked ? 'cursor-not-allowed' : ''}`}
      style={{
        left: `${component.position.x * zoom}px`,
        top: `${component.position.y * zoom}px`,
        width: `${component.size.width * zoom}px`,
        height: `${component.size.height * zoom}px`,
        zIndex: component.position.z,
        transform: `rotate(${component.position.rotation || 0}deg) scale(${component.position.scaleX || 1}, ${component.position.scaleY || 1})`,
        visibility: component.isVisible ? 'visible' : 'hidden',
        opacity: component.style?.effects?.opacity ?? 1,
        boxShadow: formatBoxShadow(component.style?.effects?.boxShadow, zoom),
        overflow: 'visible',
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Component Content */}
      <div className="w-full h-full relative">
        {renderComponentContent()}
      </div>

      {/* Bordes visuales siempre visibles */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-200 ${
          isSelected 
            ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/25' 
            : isHovered
              ? 'border border-blue-300 border-dashed'
              : 'border border-gray-300 border-dashed opacity-30'
        }`}
        style={{
          borderRadius: component.style?.border ? `${component.style.border.radius.topLeft * zoom}px` : '0px',
        }}
      />

      {/* Etiqueta del tipo de componente - SIEMPRE VISIBLE */}
      <div 
        className={`absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium transition-all duration-200 z-50 ${
          component.customLabel?.show !== false 
            ? (component.customLabel?.color ? '' : getBadgeColor(component.type))
            : 'opacity-0'
        } ${isSelected || isHovered ? 'opacity-100' : 'opacity-75'}`}
        style={{
          fontSize: `${Math.max(10, 12 / zoom)}px`,
          transform: zoom < 0.5 ? `scale(${1 / zoom})` : 'none',
          transformOrigin: 'left top',
          backgroundColor: component.customLabel?.color || undefined,
          color: component.customLabel?.textColor || (component.customLabel?.color ? '#ffffff' : undefined),
          display: component.customLabel?.show === false ? 'none' : 'block'
        }}
      >
        {component.customLabel?.name || getComponentDisplayName(component.type)}
        {/* Indicador de modo de datos */}
        {(['field-dynamic-text', 'field-dynamic-date'].includes(component.type)) && (
          <span className="ml-1 text-xs opacity-75">
            {component.showMockData !== false ? '🎭' : '🏷️'}
          </span>
        )}
      </div>

      {/* Indicadores de tamaño en las esquinas */}
      {(isSelected || isHovered) && (
        <div 
          className="absolute -top-2 -left-2 bg-white border border-gray-400 rounded-full w-3 h-3 flex items-center justify-center text-xs font-mono text-gray-600"
          style={{
            fontSize: `${Math.max(8, 10 / zoom)}px`,
            transform: zoom < 0.5 ? `scale(${1 / zoom})` : 'none',
            transformOrigin: 'center'
          }}
        >
          ↖
        </div>
      )}

      {/* Resize Handles */}
      <ResizeHandles
        component={component}
        zoom={zoom}
        operations={operations}
        isVisible={isSelected && !isMultiSelected && !component.isLocked}
      />

      {/* Lock Indicator */}
      {component.isLocked && (
        <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs">
          🔒
        </div>
      )}

      {/* Drag indicator cuando se está arrastrando */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 border-dashed animate-pulse" />
      )}
    </div>
  );
}; 