// =====================================
// CANVAS EDITOR V3 - MODULARIZED COMPONENT
// =====================================

import React from 'react';
import { TemplateV3, DraggableComponentV3, CanvasStateV3, ComponentTypeV3, PositionV3, BuilderOperationsV3 } from '../types';
import { ComponentRenderer } from './Canvas/ComponentRenderer';
import { MultiSelectionOverlay } from './Canvas/MultiSelectionOverlay';
import { useCanvasEvents } from '../hooks/useCanvasEvents';
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
  // 🚀 Usar hook modularizado para manejar eventos del canvas
  const {
    canvasRef,
    worldRef,
    draggedComponentType,
    dropPosition,
    isSelecting,
    selectionStart,
    selectionEnd,
    handleCanvasClick,
    handleComponentClick,
    handleDragOver,
    handleDrop,
    handleSelectionMouseDown,
    setDraggedComponentType
  } = useCanvasEvents({
    canvasState,
    components,
    selectedComponentIds,
    operations,
    onComponentSelect,
    onMultipleComponentSelect,
    onComponentAdd
  });

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

  if (!template) return null;

  return (
    <div className="flex-1 h-full bg-gray-100 relative overflow-hidden">
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
          data-canvas="builderv3"
          data-testid="canvas-container"
          data-template-width={template.canvas.width}
          data-template-height={template.canvas.height}
          style={{
            width: `${template.canvas.width * canvasState.zoom}px`,
            height: `${template.canvas.height * canvasState.zoom}px`,
            backgroundColor: template.canvas.backgroundColor,
            transform: `translate(${canvasState.panX}px, ${canvasState.panY}px)`
          }}
        >
          {/* Enhanced Rulers - Positioned to align with canvas edges */}
          {canvasState.showRulers && template.canvas && template.canvas.width > 0 && template.canvas.height > 0 && (
            <div data-overlay="rulers">
              <EnhancedRulers
                width={template.canvas.width * canvasState.zoom}
                height={template.canvas.height * canvasState.zoom}
                zoom={canvasState.zoom}
                visible={true}
                rulerUnit={rulerUnit || 'mm'}
              />
            </div>
          )}
          {/* Enhanced Grid */}
          {canvasState.showGrid && (
            <div
              data-overlay="grid"
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
              data-overlay="guides"
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

          {/* 🚀 Modularized Components */}
          {components.map(component => (
            <ComponentRenderer
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
              data-overlay="selection"
              className="absolute pointer-events-none z-40 border-2 border-blue-500 bg-blue-100 bg-opacity-20"
              style={{
                left: `${Math.min(selectionStart.x, selectionEnd.x) * canvasState.zoom}px`,
                top: `${Math.min(selectionStart.y, selectionEnd.y) * canvasState.zoom}px`,
                width: `${Math.abs(selectionEnd.x - selectionStart.x) * canvasState.zoom}px`,
                height: `${Math.abs(selectionEnd.y - selectionStart.y) * canvasState.zoom}px`,
              }}
            />
          )}

          {/* 🚀 Modularized Multi-Selection Overlay */}
          <MultiSelectionOverlay
            data-overlay="selection"
            components={components.filter(c => selectedComponentIds.includes(c.id))}
            zoom={canvasState.zoom}
            selectionStyle={canvasState.selectionStyle}
            operations={operations}
          />
        </div>
      </div>

      {/* Enhanced Zoom Controls - Ocultos para evitar duplicación con toolbar */}
      {/* Los controles de zoom principales están en la toolbar superior */}
      {/* 
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
      */}
    </div>
  );
}; 