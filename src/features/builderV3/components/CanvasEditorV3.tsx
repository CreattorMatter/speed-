// =====================================
// CANVAS EDITOR V3 - ENHANCED COMPONENT
// =====================================

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { TemplateV3, DraggableComponentV3, CanvasStateV3, ComponentTypeV3, PositionV3, BuilderOperationsV3, SizeV3 } from '../types';
import { ImageUploadComponent } from './ImageUploadComponent';
import { processDynamicContent, defaultMockData } from '../../../utils/dynamicContentProcessor';
import { EnhancedRulers } from './EnhancedRulers';

interface CanvasEditorV3Props {
  template: TemplateV3 | undefined;
  components: DraggableComponentV3[];
  canvasState: CanvasStateV3;
  selectedComponentIds: string[];
  onComponentSelect: (componentId: string | null) => void;
  onMultipleComponentSelect: (componentIds: string[]) => void;
  onComponentAdd: (type: ComponentTypeV3, position: PositionV3) => void;
  operations: BuilderOperationsV3;
  rulerUnit?: 'mm' | 'cm';
  activeTool: 'select' | 'pan' | 'zoom';
}

export const CanvasEditorV3: React.FC<CanvasEditorV3Props> = ({
  template,
  components,
  canvasState,
  selectedComponentIds,
  onComponentSelect,
  onMultipleComponentSelect,
  onComponentAdd,
  operations,
  rulerUnit,
  activeTool,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const [draggedComponentType, setDraggedComponentType] = useState<ComponentTypeV3 | null>(null);
  const [dropPosition, setDropPosition] = useState<{ x: number; y: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);

  const getCanvasCursor = () => {
    switch (activeTool) {
      case 'select':
        return 'cursor-default';
      case 'pan':
        return 'cursor-grab';
      case 'zoom':
        return 'cursor-zoom-in';
      default:
        return 'cursor-crosshair';
    }
  };

  const getCanvasCoordinatesFromEvent = useCallback((e: MouseEvent | React.MouseEvent | React.DragEvent) => {
    if (!worldRef.current) return null;
    const worldRect = worldRef.current.getBoundingClientRect();
    const x = (e.clientX - worldRect.left) / canvasState.zoom;
    const y = (e.clientY - worldRect.top) / canvasState.zoom;
    return { x, y };
  }, [canvasState.zoom]);

  // =====================
  // EVENT HANDLERS
  // =====================

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Deseleccionar solo si se hace clic en el fondo del canvas (canvasRef) y no en el mundo (worldRef) o sus hijos.
    if (target === canvasRef.current) {
      onComponentSelect(null);
    }
  }, [onComponentSelect]);

  const handleComponentClick = useCallback((componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      const currentIds = new Set(selectedComponentIds);
      if (currentIds.has(componentId)) {
        currentIds.delete(componentId);
      } else {
        currentIds.add(componentId);
      }
      onMultipleComponentSelect(Array.from(currentIds));
    } else {
      onComponentSelect(componentId);
    }
  }, [onComponentSelect, onMultipleComponentSelect, selectedComponentIds]);

  // =====================
  // DRAG & DROP HANDLING
  // =====================

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const coords = getCanvasCoordinatesFromEvent(e);
    if (!coords) return;
    
    let snappedX = coords.x;
    let snappedY = coords.y;
    if (canvasState.snapToGrid) {
      snappedX = Math.round(coords.x / canvasState.gridSize) * canvasState.gridSize;
      snappedY = Math.round(coords.y / canvasState.gridSize) * canvasState.gridSize;
    }
    setDropPosition({ x: snappedX, y: snappedY });
  }, [getCanvasCoordinatesFromEvent, canvasState.snapToGrid, canvasState.gridSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('application/component-type') as ComponentTypeV3;
    if (!componentType || !dropPosition) return;
    const position: PositionV3 = {
      x: dropPosition.x, y: dropPosition.y, z: components.length, rotation: 0, scaleX: 1, scaleY: 1
    };
    onComponentAdd(componentType, position);
    setDropPosition(null);
    setDraggedComponentType(null);
  }, [dropPosition, components.length, onComponentAdd]);

  // =====================
  // SELECTION BOX
  // =====================
  const handleSelectionMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== worldRef.current) {
      return;
    }
    
    const startCoords = getCanvasCoordinatesFromEvent(e);
    if (!startCoords) return;

    setIsSelecting(true);
    setSelectionStart(startCoords);
    setSelectionEnd(startCoords);

    const handleDocumentMouseMove = (event: MouseEvent) => {
      const currentCoords = getCanvasCoordinatesFromEvent(event);
      if (currentCoords) {
        setSelectionEnd(currentCoords);
      }
    };

    const handleDocumentMouseUp = (event: MouseEvent) => {
      setIsSelecting(false);
      
      const finalCoords = getCanvasCoordinatesFromEvent(event);
      if (!startCoords || !finalCoords) {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
        setSelectionStart(null);
        setSelectionEnd(null);
        return;
      }

      // Evitar deselección si fue solo un clic
      if (Math.abs(startCoords.x - finalCoords.x) < 5 && Math.abs(startCoords.y - finalCoords.y) < 5) {
        onComponentSelect(null);
      } else {
        const minX = Math.min(startCoords.x, finalCoords.x);
        const maxX = Math.max(startCoords.x, finalCoords.x);
        const minY = Math.min(startCoords.y, finalCoords.y);
        const maxY = Math.max(startCoords.y, finalCoords.y);

        const selectedComponents = components.filter(component => {
          const compX = component.position.x;
          const compY = component.position.y;
          const compRight = compX + component.size.width;
          const compBottom = compY + component.size.height;
          
          // Selección por intersección, no solo por contención completa
          return compX < maxX && compRight > minX && compY < maxY && compBottom > minY;
        });

        onMultipleComponentSelect(selectedComponents.map(c => c.id));
      }
      
      setSelectionStart(null);
      setSelectionEnd(null);
      
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
  }, [getCanvasCoordinatesFromEvent, components, onComponentSelect, onMultipleComponentSelect]);

  // =====================
  // KEYBOARD SHORTCUTS
  // =====================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedComponentIds.length > 0) {
        operations.removeComponents(selectedComponentIds);
      } else if (e.key === 'Escape') {
        onComponentSelect(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        onComponentSelect(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedComponentIds.length > 0) {
          const componentToDuplicate = components.find(c => c.id === selectedComponentIds[0]);
          if (componentToDuplicate) {
            onComponentAdd(componentToDuplicate.type, {
              ...componentToDuplicate.position,
              x: componentToDuplicate.position.x + 20,
              y: componentToDuplicate.position.y + 20,
              z: components.length
            });
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentIds, operations, onComponentSelect, onComponentAdd, components]);

  if (!template) return null;

  return (
    <div className="flex-1 h-full bg-gray-100 relative overflow-hidden">
      {/* Enhanced Rulers with Real Measurements */}
      {canvasState.showRulers && template.canvas && template.canvas.width > 0 && template.canvas.height > 0 && (
        <EnhancedRulers
          canvasWidth={template.canvas.width}
          canvasHeight={template.canvas.height}
          zoom={canvasState.zoom}
          offsetX={canvasState.panX}
          offsetY={canvasState.panY}
          unit={rulerUnit || 'mm'}
          visible={true}
        />
      )}

      {/* Enhanced Canvas */}
      <div
        ref={canvasRef}
        className={`absolute inset-0 overflow-auto ${getCanvasCursor()}`}
        style={{
          paddingTop: canvasState.showRulers ? '32px' : '0',
          paddingLeft: canvasState.showRulers ? '32px' : '0'
        }}
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Canvas Container */}
        <div
          ref={worldRef}
          onMouseDown={handleSelectionMouseDown}
          className="relative mx-auto my-8 shadow-2xl border border-gray-300"
          style={{
            width: `${template.canvas.width * canvasState.zoom}px`,
            height: `${template.canvas.height * canvasState.zoom}px`,
            backgroundColor: template.canvas.backgroundColor,
            transform: `translate(${canvasState.panX}px, ${canvasState.panY}px)`
          }}
        >
          {/* Enhanced Grid */}
          {canvasState.showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(#e5e7eb 1px, transparent 1px),
                  linear-gradient(90deg, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: `${canvasState.gridSize * canvasState.zoom}px ${canvasState.gridSize * canvasState.zoom}px`,
                opacity: 0.3
              }}
            />
          )}

          {/* Smart Guides */}
          {canvasState.showGrid && canvasState.guides.map(guide => (
            <div
              key={guide.id}
              className="absolute pointer-events-none z-20"
              style={{
                [guide.type === 'horizontal' ? 'top' : 'left']: `${guide.position * canvasState.zoom}px`,
                [guide.type === 'horizontal' ? 'left' : 'top']: '0',
                [guide.type === 'horizontal' ? 'right' : 'bottom']: '0',
                [guide.type === 'horizontal' ? 'height' : 'width']: '1px',
                backgroundColor: guide.color,
                opacity: 0.8,
                boxShadow: `0 0 4px ${guide.color}`
              }}
            />
          ))}

          {/* Drop Position Indicator */}
          {draggedComponentType && dropPosition && (
            <div
              className="absolute pointer-events-none z-30 border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-30"
              style={{
                left: `${dropPosition.x * canvasState.zoom}px`,
                top: `${dropPosition.y * canvasState.zoom}px`,
                width: `${100 * canvasState.zoom}px`,
                height: `${50 * canvasState.zoom}px`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-blue-600 text-xs font-medium bg-white px-2 py-1 rounded shadow">
                  Soltar aquí
                </span>
              </div>
            </div>
          )}

          {/* Enhanced Components */}
          {components.map(component => (
            <EnhancedComponentRenderer
              key={component.id}
              component={component}
              isSelected={selectedComponentIds.includes(component.id)}
              isMultiSelected={selectedComponentIds.length > 1}
              zoom={canvasState.zoom}
              snapToGrid={canvasState.showGrid}
              gridSize={canvasState.gridSize}
              snapTolerance={canvasState.snapTolerance || 10}
              allComponents={components}
              onClick={(e) => handleComponentClick(component.id, e)}
              operations={operations}
            />
          ))}

          {/* Selection Box */}
          {isSelecting && selectionStart && selectionEnd && (
            <div
              className="absolute pointer-events-none z-40 border-2 border-blue-500 bg-blue-100 bg-opacity-20"
              style={{
                left: `${Math.min(selectionStart.x, selectionEnd.x) * canvasState.zoom}px`,
                top: `${Math.min(selectionStart.y, selectionEnd.y) * canvasState.zoom}px`,
                width: `${Math.abs(selectionEnd.x - selectionStart.x) * canvasState.zoom}px`,
                height: `${Math.abs(selectionEnd.y - selectionStart.y) * canvasState.zoom}px`,
              }}
            />
          )}

          {/* Multi-Selection Overlay */}
          {selectedComponentIds.length > 1 && (
            <MultiSelectionOverlay
              components={components.filter(c => selectedComponentIds.includes(c.id))}
              zoom={canvasState.zoom}
              selectionStyle={canvasState.selectionStyle}
              operations={operations}
            />
          )}
        </div>
      </div>

      {/* Enhanced Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-white rounded-lg shadow-lg p-2 border">
        <button
          onClick={() => operations.zoomOut()}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
          title="Zoom Out"
          disabled={canvasState.zoom <= canvasState.minZoom}
        >
          −
        </button>
        
        <span className="text-sm text-gray-600 min-w-[50px] text-center">
          {Math.round(canvasState.zoom * 100)}%
        </span>
        
        <button
          onClick={() => operations.zoomIn()}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
          title="Zoom In"
          disabled={canvasState.zoom >= canvasState.maxZoom}
        >
          +
        </button>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <button
          onClick={() => operations.zoomToFit()}
          className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
          title="Ajustar al canvas"
        >
          Ajustar
        </button>
      </div>
    </div>
  );
};

// =====================
// ENHANCED COMPONENT RENDERER
// =====================

interface EnhancedComponentRendererProps {
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

const EnhancedComponentRenderer: React.FC<EnhancedComponentRendererProps> = ({
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
  const [initialPosition, setInitialPosition] = useState<PositionV3 | null>(null);

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
  }, [component.isLocked, component.id, component.position, component.size, zoom, onClick, operations, snapToGrid, gridSize, snapTolerance, allComponents]);

  // Función para obtener el nombre amigable del tipo de componente
  const getComponentDisplayName = (type: ComponentTypeV3): string => {
    const displayNames = {
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

  // Función para obtener el color del badge según el tipo
  const getBadgeColor = (type: ComponentTypeV3): string => {
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

  const renderComponentContent = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      fontSize: `${component.style?.typography?.fontSize || 16}px`,
      fontFamily: component.style?.typography?.fontFamily || 'Inter',
      fontWeight: component.style?.typography?.fontWeight || 'normal',
      color: component.style?.color?.color || '#000000',
      textAlign: component.style?.typography?.textAlign as any || 'left'
    };

    switch (component.type) {
      case 'field-dynamic-text':
        const dynamicText = processDynamicContent(component, defaultMockData);
        return (
          <div 
            style={baseStyle}
            className="flex items-center justify-center p-2 select-none"
          >
            {dynamicText}
          </div>
        );

      case 'image-header':
      case 'image-product':
      case 'image-brand-logo':
      case 'image-decorative':
        return (
          <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center select-none">
            {component.content?.imageUrl ? (
              <img 
                src={component.content.imageUrl} 
                alt={component.content?.imageAlt || 'Imagen'} 
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="text-gray-500 text-center">
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
        const dynamicDate = processDynamicContent(component, defaultMockData);
        return (
          <div 
            style={baseStyle}
            className="flex items-center justify-center p-2 select-none"
          >
            {dynamicDate}
          </div>
        );

      case 'shape-geometric':
        return (
          <div 
            className="w-full h-full select-none"
            style={{
              backgroundColor: component.style?.color?.backgroundColor || '#e5e7eb',
              borderRadius: component.style?.border?.radius?.topLeft ? `${component.style.border.radius.topLeft}px` : '0px'
            }}
          />
        );

      case 'decorative-line':
        return (
          <div 
            className="w-full select-none"
            style={{
              height: '2px',
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
        visibility: component.isVisible ? 'visible' : 'hidden',
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
          borderRadius: component.style?.border ? `${component.style.border.radius.topLeft}px` : '0px',
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
      </div>

      {/* Indicadores de tamaño en las esquinas */}
      {(isSelected || isHovered) && (
        <>
          {/* Indicador superior izquierdo */}
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
          
          {/* Indicador inferior derecho con dimensiones */}
          <div 
            className="absolute -bottom-6 -right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-mono"
            style={{
              fontSize: `${Math.max(8, 10 / zoom)}px`,
              transform: zoom < 0.5 ? `scale(${1 / zoom})` : 'none',
              transformOrigin: 'right bottom'
            }}
          >
            {Math.round(component.size.width)}×{Math.round(component.size.height)}
          </div>
        </>
      )}

      {/* Enhanced Resize Handles */}
      {isSelected && !isMultiSelected && component.isResizable && !component.isLocked && (
        <EnhancedResizeHandles
          component={component}
          zoom={zoom}
          operations={operations}
        />
      )}

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

// =====================
// ENHANCED RESIZE HANDLES
// =====================

interface EnhancedResizeHandlesProps {
  component: DraggableComponentV3;
  zoom: number;
  operations: BuilderOperationsV3;
}

const EnhancedResizeHandles: React.FC<EnhancedResizeHandlesProps> = ({ 
  component, 
  zoom, 
  operations 
}) => {
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  const createResizeHandler = useCallback((corner: string) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveHandle(corner);
      
      const startX = e.clientX;
      const startY = e.clientY;
      const startSize = { ...component.size };
      const startPosition = { ...component.position };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = (moveEvent.clientX - startX) / zoom;
        const deltaY = (moveEvent.clientY - startY) / zoom;

        let newSize = { ...startSize };
        let newPosition = { ...startPosition };

        switch (corner) {
          case 'nw':
            newSize.width = Math.max(20, startSize.width - deltaX);
            newSize.height = Math.max(20, startSize.height - deltaY);
            newPosition.x = startPosition.x + (startSize.width - newSize.width);
            newPosition.y = startPosition.y + (startSize.height - newSize.height);
            break;
          case 'ne':
            newSize.width = Math.max(20, startSize.width + deltaX);
            newSize.height = Math.max(20, startSize.height - deltaY);
            newPosition.y = startPosition.y + (startSize.height - newSize.height);
            break;
          case 'sw':
            newSize.width = Math.max(20, startSize.width - deltaX);
            newSize.height = Math.max(20, startSize.height + deltaY);
            newPosition.x = startPosition.x + (startSize.width - newSize.width);
            break;
          case 'se':
            newSize.width = Math.max(20, startSize.width + deltaX);
            newSize.height = Math.max(20, startSize.height + deltaY);
            break;
          case 'n':
            newSize.height = Math.max(20, startSize.height - deltaY);
            newPosition.y = startPosition.y + (startSize.height - newSize.height);
            break;
          case 's':
            newSize.height = Math.max(20, startSize.height + deltaY);
            break;
          case 'w':
            newSize.width = Math.max(20, startSize.width - deltaX);
            newPosition.x = startPosition.x + (startSize.width - newSize.width);
            break;
          case 'e':
            newSize.width = Math.max(20, startSize.width + deltaX);
            break;
        }

        // Maintain aspect ratio if shift is pressed
        if (moveEvent.shiftKey || component.size.isProportional) {
          const aspectRatio = startSize.width / startSize.height;
          if (corner.includes('w') || corner.includes('e')) {
            newSize.height = newSize.width / aspectRatio;
          } else {
            newSize.width = newSize.height * aspectRatio;
          }
        }

        operations.resizeComponent(component.id, newSize);
        if (newPosition.x !== startPosition.x || newPosition.y !== startPosition.y) {
          operations.moveComponent(component.id, newPosition);
        }
      };

      const handleMouseUp = () => {
        setActiveHandle(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
  }, [component, zoom, operations]);

  const handleStyle = (corner: string): React.CSSProperties => {
    const baseSize = 8;
    const size = Math.max(baseSize, baseSize / zoom);
    const offset = -size / 2;
    
    const isActive = activeHandle === corner;
    
    return {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: isActive ? '#1D4ED8' : '#3B82F6',
      border: '2px solid white',
      borderRadius: '50%',
      cursor: getCursor(corner),
      transform: 'scale(1)',
      transition: 'all 0.1s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      ...(corner.includes('n') && { top: `${offset}px` }),
      ...(corner.includes('s') && { bottom: `${offset}px` }),
      ...(corner.includes('w') && { left: `${offset}px` }),
      ...(corner.includes('e') && { right: `${offset}px` }),
      ...(corner === 'n' && { left: '50%', marginLeft: `${offset}px` }),
      ...(corner === 's' && { left: '50%', marginLeft: `${offset}px` }),
      ...(corner === 'w' && { top: '50%', marginTop: `${offset}px` }),
      ...(corner === 'e' && { top: '50%', marginTop: `${offset}px` }),
    };
  };

  const getCursor = (corner: string): string => {
    switch (corner) {
      case 'nw':
      case 'se':
        return 'nw-resize';
      case 'ne':
      case 'sw':
        return 'ne-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'w':
      case 'e':
        return 'ew-resize';
      default:
        return 'grab';
    }
  };

  const handles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

  return (
    <>
      {handles.map(handle => (
        <div
          key={handle}
          style={handleStyle(handle)}
          onMouseDown={createResizeHandler(handle)}
          className="hover:scale-125 transition-transform"
        />
      ))}
    </>
  );
};

// =====================
// MULTI-SELECTION OVERLAY
// =====================

interface MultiSelectionOverlayProps {
  components: DraggableComponentV3[];
  zoom: number;
  selectionStyle: CanvasStateV3['selectionStyle'];
  operations: BuilderOperationsV3;
}

const MultiSelectionOverlay: React.FC<MultiSelectionOverlayProps> = ({ 
  components, 
  zoom, 
  selectionStyle,
  operations 
}) => {
  if (components.length <= 1) return null;

  // Calculate bounding box
  const minX = Math.min(...components.map(c => c.position.x));
  const minY = Math.min(...components.map(c => c.position.y));
  const maxX = Math.max(...components.map(c => c.position.x + c.size.width));
  const maxY = Math.max(...components.map(c => c.position.y + c.size.height));

  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${minX * zoom}px`,
        top: `${minY * zoom}px`,
        width: `${width * zoom}px`,
        height: `${height * zoom}px`,
        border: `2px dashed ${selectionStyle.strokeColor}`,
        backgroundColor: `${selectionStyle.strokeColor}10`,
        zIndex: 1000,
      }}
    >
      {/* Multi-selection indicator */}
      <div className="absolute -top-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded">
        {components.length} elementos seleccionados
      </div>
    </div>
  );
}; 