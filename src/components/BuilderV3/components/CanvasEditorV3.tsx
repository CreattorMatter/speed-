// =====================================
// CANVAS EDITOR V3 - ENHANCED COMPONENT
// =====================================

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { TemplateV3, DraggableComponentV3, CanvasStateV3, ComponentTypeV3, PositionV3, BuilderOperationsV3, SizeV3 } from '../../../types/builder-v3';
import { ImageUploadComponent } from './ImageUploadComponent';

interface CanvasEditorV3Props {
  template: TemplateV3;
  components: DraggableComponentV3[];
  canvasState: CanvasStateV3;
  selectedComponentIds: string[];
  onComponentSelect: (componentId: string | null) => void;
  onMultipleComponentSelect: (componentIds: string[]) => void;
  onComponentAdd: (type: ComponentTypeV3, position: PositionV3) => void;
  operations: BuilderOperationsV3;
}

export const CanvasEditorV3: React.FC<CanvasEditorV3Props> = ({
  template,
  components,
  canvasState,
  selectedComponentIds,
  onComponentSelect,
  onMultipleComponentSelect,
  onComponentAdd,
  operations
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedComponentType, setDraggedComponentType] = useState<ComponentTypeV3 | null>(null);
  const [dropPosition, setDropPosition] = useState<{ x: number; y: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);

  // =====================
  // EVENT HANDLERS
  // =====================

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / canvasState.zoom;
    const y = (e.clientY - rect.top) / canvasState.zoom;

    // Si no se hizo clic en un componente, limpiar selección
    onComponentSelect(null);
  }, [onComponentSelect, canvasState.zoom]);

  const handleComponentClick = useCallback((componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // Multi-selección
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
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / canvasState.zoom;
    const y = (e.clientY - rect.top) / canvasState.zoom;

    // Snap to grid if enabled
    let snappedX = x;
    let snappedY = y;

    if (canvasState.snapToGrid) {
      snappedX = Math.round(x / canvasState.gridSize) * canvasState.gridSize;
      snappedY = Math.round(y / canvasState.gridSize) * canvasState.gridSize;
    }

    setDropPosition({ x: snappedX, y: snappedY });
  }, [canvasState.zoom, canvasState.snapToGrid, canvasState.gridSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const componentType = e.dataTransfer.getData('application/component-type') as ComponentTypeV3;
    if (!componentType || !dropPosition) return;

    // Crear posición con snap
    const position: PositionV3 = {
      x: dropPosition.x,
      y: dropPosition.y,
      z: components.length,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    };

    onComponentAdd(componentType, position);
    setDropPosition(null);
    setDraggedComponentType(null);
  }, [dropPosition, components.length, onComponentAdd]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('application/component-type') as ComponentTypeV3;
    setDraggedComponentType(componentType);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Solo limpiar si realmente salimos del canvas
    if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
      setDropPosition(null);
      setDraggedComponentType(null);
    }
  }, []);

  // =====================
  // SELECTION BOX
  // =====================

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / canvasState.zoom;
      const y = (e.clientY - rect.top) / canvasState.zoom;
      
      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionEnd({ x, y });
    }
  }, [canvasState.zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isSelecting && selectionStart && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / canvasState.zoom;
      const y = (e.clientY - rect.top) / canvasState.zoom;
      
      setSelectionEnd({ x, y });
    }
  }, [isSelecting, selectionStart, canvasState.zoom]);

  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectionStart && selectionEnd) {
      // Calcular qué componentes están dentro del área de selección
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);

      const selectedComponents = components.filter(component => {
        const compX = component.position.x;
        const compY = component.position.y;
        const compRight = compX + component.size.width;
        const compBottom = compY + component.size.height;

        return compX >= minX && compY >= minY && compRight <= maxX && compBottom <= maxY;
      });

      if (selectedComponents.length > 0) {
        onMultipleComponentSelect(selectedComponents.map(c => c.id));
      }
    }

    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, selectionStart, selectionEnd, components, onMultipleComponentSelect]);

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
        onMultipleComponentSelect(components.map(c => c.id));
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedComponentIds.length > 0) {
          operations.duplicateComponents(selectedComponentIds);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentIds, operations, onComponentSelect, onMultipleComponentSelect, components]);

  return (
    <div className="flex-1 h-full bg-gray-100 relative overflow-hidden">
      {/* Enhanced Rulers */}
      {canvasState.showRulers && (
        <>
          {/* Horizontal Ruler */}
          <div className="absolute top-0 left-8 right-0 h-8 bg-white border-b border-gray-300 z-10">
            <div className="h-full relative">
              {Array.from({ length: Math.ceil(template.canvas.width / 25) }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full flex items-end"
                  style={{ left: `${i * 25 * canvasState.zoom}px` }}
                >
                  {i % 2 === 0 && (
                    <div className="text-xs text-gray-500 mb-1">{i * 25}</div>
                  )}
                  <div 
                    className={`w-px bg-gray-400 ${i % 4 === 0 ? 'h-3' : i % 2 === 0 ? 'h-2' : 'h-1'}`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical Ruler */}
          <div className="absolute top-8 left-0 bottom-0 w-8 bg-white border-r border-gray-300 z-10">
            <div className="w-full relative">
              {Array.from({ length: Math.ceil(template.canvas.height / 25) }, (_, i) => (
                <div
                  key={i}
                  className="absolute left-0 w-full flex items-center justify-end"
                  style={{ top: `${i * 25 * canvasState.zoom}px` }}
                >
                  {i % 2 === 0 && (
                    <div className="text-xs text-gray-500 mr-1 transform -rotate-90 origin-center">
                      {i * 25}
                    </div>
                  )}
                  <div 
                    className={`h-px bg-gray-400 ${i % 4 === 0 ? 'w-3' : i % 2 === 0 ? 'w-2' : 'w-1'}`}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Enhanced Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 overflow-auto cursor-crosshair"
        style={{
          paddingTop: canvasState.showRulers ? '32px' : '0',
          paddingLeft: canvasState.showRulers ? '32px' : '0'
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {/* Canvas Container */}
        <div
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
                  linear-gradient(${canvasState.gridColor} 1px, transparent 1px),
                  linear-gradient(90deg, ${canvasState.gridColor} 1px, transparent 1px)
                `,
                backgroundSize: `${canvasState.gridSize * canvasState.zoom}px ${canvasState.gridSize * canvasState.zoom}px`,
                opacity: 0.3
              }}
            />
          )}

          {/* Smart Guides */}
          {canvasState.showGuides && canvasState.guides.map(guide => (
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

          {/* Enhanced Components */}
          {components.map(component => (
            <EnhancedComponentRenderer
              key={component.id}
              component={component}
              isSelected={selectedComponentIds.includes(component.id)}
              isMultiSelected={selectedComponentIds.length > 1}
              zoom={canvasState.zoom}
              snapToGrid={canvasState.snapToGrid}
              gridSize={canvasState.gridSize}
              snapTolerance={canvasState.snapTolerance}
              allComponents={components}
              onClick={(e) => handleComponentClick(component.id, e)}
              operations={operations}
            />
          ))}

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
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border p-2 flex items-center space-x-2">
        <button
          onClick={operations.zoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          disabled={canvasState.zoom <= canvasState.minZoom}
          title="Alejar (Ctrl + -)"
        >
          <span className="text-lg font-mono">−</span>
        </button>
        
        <div className="px-3 py-1 text-sm font-medium min-w-[70px] text-center bg-gray-50 rounded">
          {Math.round(canvasState.zoom * 100)}%
        </div>
        
        <button
          onClick={operations.zoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          disabled={canvasState.zoom >= canvasState.maxZoom}
          title="Acercar (Ctrl + +)"
        >
          <span className="text-lg font-mono">+</span>
        </button>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <button
          onClick={operations.zoomToFit}
          className="px-3 py-2 text-xs hover:bg-gray-100 rounded transition-colors font-medium"
          title="Ajustar al canvas (Ctrl + 0)"
        >
          Fit
        </button>

        <button
          onClick={operations.zoomToSelection}
          className="px-3 py-2 text-xs hover:bg-gray-100 rounded transition-colors font-medium disabled:opacity-50"
          disabled={selectedComponentIds.length === 0}
          title="Zoom a selección"
        >
          Zoom
        </button>
      </div>

      {/* Canvas Information */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm border px-3 py-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <span className="font-medium">📐</span>
          <span>{template.canvas.width} × {template.canvas.height}px</span>
          {template.canvas.dpi && (
            <>
              <span className="text-gray-400">•</span>
              <span>{template.canvas.dpi} DPI</span>
            </>
          )}
        </div>
      </div>

      {/* Selection Information */}
      {selectedComponentIds.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border px-3 py-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="font-medium">🎯</span>
            <span>
              {selectedComponentIds.length} elemento{selectedComponentIds.length !== 1 ? 's' : ''} seleccionado{selectedComponentIds.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
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
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialPosition, setInitialPosition] = useState<PositionV3 | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!component.isDraggable || component.isLocked) return;
    
    e.stopPropagation();
    onClick(e);
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPosition(component.position);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStart || !initialPosition) return;

      const deltaX = (moveEvent.clientX - dragStart.x) / zoom;
      const deltaY = (moveEvent.clientY - dragStart.y) / zoom;

      let newX = initialPosition.x + deltaX;
      let newY = initialPosition.y + deltaY;

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

      operations.moveComponent(component.id, {
        ...component.position,
        x: newX,
        y: newY
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
  }, [component, zoom, onClick, operations, dragStart, initialPosition, snapToGrid, gridSize, snapTolerance, allComponents]);

  const renderComponentContent = () => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      color: component.style?.color?.color || '#000000',
      backgroundColor: component.style?.color?.backgroundColor || 'transparent',
      fontSize: `${(component.style?.typography?.fontSize || 16) * zoom}px`,
      fontFamily: component.style?.typography?.fontFamily || 'Arial',
      fontWeight: component.style?.typography?.fontWeight || 'normal',
      textAlign: component.style?.typography?.textAlign || 'left',
      borderRadius: component.style?.border ? `${component.style.border.radius.topLeft}px` : '0px',
      border: component.style?.border ? 
        `${component.style.border.width}px ${component.style.border.style} ${component.style.border.color}` : 
        'none',
      opacity: component.style?.effects?.opacity ?? 1,
      transform: `rotate(${component.position.rotation}deg) scale(${component.position.scaleX}, ${component.position.scaleY})`,
    };

    switch (component.type) {
      case 'text-custom':
      case 'text-editable':
      case 'text-dynamic':
      case 'field-product-name':
      case 'field-price-original':
      case 'field-price-discount':
        return (
          <div 
            style={baseStyle}
            className="flex items-center justify-center p-2 select-none"
          >
            {component.content?.staticValue || component.content?.text || 'Texto de ejemplo'}
          </div>
        );

      case 'image-header':
      case 'image-brand-logo':
      case 'image-promotional':
      case 'image-product':
        return (
          <div style={baseStyle} className="overflow-hidden">
                          <ImageUploadComponent
                component={component}
                isSelected={isSelected}
                zoom={zoom}
                onImageUpdate={(imageData: { url: string; alt?: string; file?: File }) => {
                  operations.updateComponent(component.id, {
                    content: {
                      ...component.content,
                      imageUrl: imageData.url,
                      imageAlt: imageData.alt
                    }
                  });
                }}
              />
          </div>
        );

      case 'qr-product-info':
      case 'qr-promotion-link':
        return (
          <div style={baseStyle} className="bg-white flex items-center justify-center">
            <div className="w-full h-full bg-black bg-opacity-10 flex items-center justify-center">
              📱 QR
            </div>
          </div>
        );

      default:
        return (
          <div style={baseStyle} className="flex items-center justify-center text-gray-500">
            {component.name || component.type}
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${
        component.isLocked ? 'cursor-not-allowed' : ''
      }`}
      style={{
        left: `${component.position.x * zoom}px`,
        top: `${component.position.y * zoom}px`,
        width: `${component.size.width * zoom}px`,
        height: `${component.size.height * zoom}px`,
        zIndex: component.position.z,
        visibility: component.isVisible ? 'visible' : 'hidden',
      }}
      onMouseDown={handleMouseDown}
      onClick={onClick}
    >
      {/* Component Content */}
      <div className="w-full h-full relative">
        {renderComponentContent()}
        
        {/* Component Label */}
        {isSelected && (
          <div className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded text-nowrap z-50">
            {component.name}
          </div>
        )}
      </div>

      {/* Enhanced Selection Border */}
      {isSelected && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            border: `2px solid #3B82F6`,
            boxShadow: `0 0 0 1px rgba(59, 130, 246, 0.3)`,
          }}
        />
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
        <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
          🔒
        </div>
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
  if (components.length === 0) return null;

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