import React, { useRef, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import {
  selectElements,
  selectCanvasConfig,
  selectSelectedElements,
  selectCurrentTool,
  selectIsDragging,
  addElement,
  moveElement,
  resizeElement,
  selectElement,
  selectMultipleElements,
  clearSelection,
  setIsDragging,
  CartelElement,
  Position,
  Size,
  PrecioElement,
  DescuentoElement,
  ProductoElement,
  CuotasElement,
  OrigenElement,
  CodigoElement,
  FechaElement,
  NotaLegalElement,
  ImagenElement,
  TextoLibreElement,
  LogoElement
} from '../../redux/builderSlice';
import ElementRenderer from './ElementRenderer';

// ====================================
// TIPOS Y INTERFACES
// ====================================

interface CanvasProps {
  className?: string;
}

interface DragState {
  isDragging: boolean;
  elementId: string | null;
  startPosition: Position;
  startElementPosition: Position;
  dragType: 'move' | 'resize' | null;
  resizeHandle: string | null;
}

interface PaletteItemConfig {
  id: string;
  type: string;
  name: string;
  description: string;
  defaultSize: { width: number; height: number };
  defaultStyle: any;
  defaultContent: any;
}

// ====================================
// HOOKS PERSONALIZADOS
// ====================================

const useCanvasDrop = (canvasRef: React.RefObject<HTMLDivElement>) => {
  const dispatch = useDispatch();
  const canvasConfig = useSelector(selectCanvasConfig);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const data = e.dataTransfer.getData('application/json');
      const config: PaletteItemConfig = JSON.parse(data);
      
      // Obtener coordenadas relativas al canvas
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      const x = (e.clientX - canvasRect.left) / canvasConfig.zoom;
      const y = (e.clientY - canvasRect.top) / canvasConfig.zoom;
      
      // Aplicar snap to grid si está habilitado
      let finalPosition = { x, y };
      if (canvasConfig.snapToGrid) {
        const gridSize = canvasConfig.gridSize;
        finalPosition = {
          x: Math.round(x / gridSize) * gridSize,
          y: Math.round(y / gridSize) * gridSize
        };
      }
      
      // Crear elemento base
      const baseElement = {
        id: nanoid(),
        type: config.type,
        position: finalPosition,
        size: config.defaultSize,
        style: config.defaultStyle,
        zIndex: 1,
        locked: false,
        visible: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Crear elemento específico según el tipo
      let newElement: CartelElement;
      
      switch (config.type) {
        case 'precio':
          newElement = { ...baseElement, type: 'precio', content: config.defaultContent } as PrecioElement;
          break;
        case 'descuento':
          newElement = { ...baseElement, type: 'descuento', content: config.defaultContent } as DescuentoElement;
          break;
        case 'producto':
          newElement = { ...baseElement, type: 'producto', content: config.defaultContent } as ProductoElement;
          break;
        case 'cuotas':
          newElement = { ...baseElement, type: 'cuotas', content: config.defaultContent } as CuotasElement;
          break;
        case 'origen':
          newElement = { ...baseElement, type: 'origen', content: config.defaultContent } as OrigenElement;
          break;
        case 'codigo':
          newElement = { ...baseElement, type: 'codigo', content: config.defaultContent } as CodigoElement;
          break;
        case 'fecha':
          newElement = { ...baseElement, type: 'fecha', content: config.defaultContent } as FechaElement;
          break;
        case 'nota-legal':
          newElement = { ...baseElement, type: 'nota-legal', content: config.defaultContent } as NotaLegalElement;
          break;
        case 'imagen':
          newElement = { ...baseElement, type: 'imagen', content: config.defaultContent } as ImagenElement;
          break;
        case 'texto-libre':
          newElement = { ...baseElement, type: 'texto-libre', content: config.defaultContent } as TextoLibreElement;
          break;
        case 'logo':
          newElement = { ...baseElement, type: 'logo', content: config.defaultContent } as LogoElement;
          break;
        default:
          newElement = { ...baseElement, type: 'texto-libre', content: config.defaultContent } as TextoLibreElement;
      }
      
      dispatch(addElement(newElement));
    } catch (error) {
      console.error('Error al procesar elemento arrastrado:', error);
    }
  }, [dispatch, canvasConfig, canvasRef]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  return { handleDrop, handleDragOver };
};

const useElementDrag = (canvasRef: React.RefObject<HTMLDivElement>) => {
  const dispatch = useDispatch();
  const canvasConfig = useSelector(selectCanvasConfig);
  const [dragState, setDragState] = React.useState<DragState>({
    isDragging: false,
    elementId: null,
    startPosition: { x: 0, y: 0 },
    startElementPosition: { x: 0, y: 0 },
    dragType: null,
    resizeHandle: null
  });

  const handleMouseDown = useCallback((
    e: React.MouseEvent, 
    elementId: string, 
    element: CartelElement,
    dragType: 'move' | 'resize' = 'move',
    resizeHandle?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const startX = (e.clientX - canvasRect.left) / canvasConfig.zoom;
    const startY = (e.clientY - canvasRect.top) / canvasConfig.zoom;

    setDragState({
      isDragging: true,
      elementId,
      startPosition: { x: startX, y: startY },
      startElementPosition: { ...element.position },
      dragType,
      resizeHandle: resizeHandle || null
    });

    dispatch(setIsDragging(true));
    dispatch(selectElement(elementId));
  }, [dispatch, canvasConfig, canvasRef]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.elementId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const currentX = (e.clientX - canvasRect.left) / canvasConfig.zoom;
    const currentY = (e.clientY - canvasRect.top) / canvasConfig.zoom;

    const deltaX = currentX - dragState.startPosition.x;
    const deltaY = currentY - dragState.startPosition.y;

    if (dragState.dragType === 'move') {
      const newPosition = {
        x: dragState.startElementPosition.x + deltaX,
        y: dragState.startElementPosition.y + deltaY
      };

      dispatch(moveElement({ id: dragState.elementId, position: newPosition }));
    } else if (dragState.dragType === 'resize') {
      // Lógica de redimensionamiento aquí
      // Se implementará en el futuro
    }
  }, [dragState, dispatch, canvasConfig, canvasRef]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        elementId: null,
        startPosition: { x: 0, y: 0 },
        startElementPosition: { x: 0, y: 0 },
        dragType: null,
        resizeHandle: null
      });
      dispatch(setIsDragging(false));
    }
  }, [dragState.isDragging, dispatch]);

  // Event listeners globales
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return { handleMouseDown, dragState };
};

// ====================================
// COMPONENTE GRID
// ====================================

const GridOverlay: React.FC<{ canvasConfig: any }> = ({ canvasConfig }) => {
  if (!canvasConfig.showGrid) return null;

  const { format, gridSize, zoom } = canvasConfig;
  const actualGridSize = gridSize * zoom;

  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-20"
      style={{
        backgroundImage: `
          linear-gradient(to right, #94a3b8 1px, transparent 1px),
          linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
        `,
        backgroundSize: `${actualGridSize}px ${actualGridSize}px`
      }}
    />
  );
};

// ====================================
// COMPONENTE SELECTION BOX
// ====================================

const SelectionBox: React.FC<{ 
  element: CartelElement; 
  isSelected: boolean; 
  onMouseDown: (e: React.MouseEvent, elementId: string, element: CartelElement) => void;
  zoom: number;
}> = ({ element, isSelected, onMouseDown, zoom }) => {
  if (!isSelected) return null;

  const handleSize = 8 / zoom; // Tamaño del handle ajustado por zoom

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        border: '2px solid #3B82F6',
        borderRadius: '2px'
      }}
    >
      {/* Handles de redimensionamiento */}
      {[
        { position: 'nw', cursor: 'nw-resize', style: { top: -handleSize/2, left: -handleSize/2 } },
        { position: 'ne', cursor: 'ne-resize', style: { top: -handleSize/2, right: -handleSize/2 } },
        { position: 'sw', cursor: 'sw-resize', style: { bottom: -handleSize/2, left: -handleSize/2 } },
        { position: 'se', cursor: 'se-resize', style: { bottom: -handleSize/2, right: -handleSize/2 } },
        { position: 'n', cursor: 'n-resize', style: { top: -handleSize/2, left: '50%', transform: 'translateX(-50%)' } },
        { position: 's', cursor: 's-resize', style: { bottom: -handleSize/2, left: '50%', transform: 'translateX(-50%)' } },
        { position: 'w', cursor: 'w-resize', style: { top: '50%', left: -handleSize/2, transform: 'translateY(-50%)' } },
        { position: 'e', cursor: 'e-resize', style: { top: '50%', right: -handleSize/2, transform: 'translateY(-50%)' } }
      ].map((handle) => (
        <div
          key={handle.position}
          className="absolute bg-blue-500 border border-white pointer-events-auto"
          style={{
            width: handleSize,
            height: handleSize,
            cursor: handle.cursor,
            ...handle.style
          }}
          onMouseDown={(e) => onMouseDown(e, element.id, element)}
        />
      ))}
    </div>
  );
};

// ====================================
// COMPONENTE PRINCIPAL CANVAS
// ====================================

const Canvas: React.FC<CanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  
  // Selectores Redux
  const elements = useSelector(selectElements);
  const canvasConfig = useSelector(selectCanvasConfig);
  const selectedElements = useSelector(selectSelectedElements);
  const currentTool = useSelector(selectCurrentTool);
  const isDraggingGlobal = useSelector(selectIsDragging);

  // Hooks personalizados
  const { handleDrop, handleDragOver } = useCanvasDrop(canvasRef);
  const { handleMouseDown, dragState } = useElementDrag(canvasRef);

  // Elementos ordenados por zIndex
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // Manejar click en canvas (deseleccionar elementos)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      dispatch(clearSelection());
    }
  }, [dispatch]);

  // Calcular dimensiones del canvas en pixels
  const canvasStyle = {
    width: `${canvasConfig.format.width * canvasConfig.zoom}px`,
    height: `${canvasConfig.format.height * canvasConfig.zoom}px`,
    backgroundColor: canvasConfig.backgroundColor,
    transform: `scale(1)`, // El zoom se aplica a las dimensiones, no al transform
    transformOrigin: 'top left'
  };

  return (
    <div className={`canvas-container relative overflow-auto bg-gray-100 ${className}`}>
      {/* Área de canvas */}
      <div className="canvas-scroll-area p-8">
        <div
          ref={canvasRef}
          className="canvas-paper relative bg-white shadow-lg mx-auto"
          style={canvasStyle}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleCanvasClick}
        >
          {/* Grid overlay */}
          <GridOverlay canvasConfig={canvasConfig} />
          
          {/* Elementos del cartel */}
          {sortedElements.map((element) => {
            const isSelected = selectedElements.some(sel => sel.id === element.id);
            
            return (
              <div key={element.id} className="absolute">
                {/* Elemento renderizado */}
                <div
                  style={{
                    position: 'absolute',
                    left: element.position.x,
                    top: element.position.y,
                    width: element.size.width,
                    height: element.size.height,
                    cursor: currentTool === 'select' ? 'move' : 'default',
                    pointerEvents: element.locked ? 'none' : 'auto',
                    opacity: element.visible ? 1 : 0.3,
                    zIndex: element.zIndex
                  }}
                  onMouseDown={(e) => {
                    if (currentTool === 'select' && !element.locked) {
                      handleMouseDown(e, element.id, element, 'move');
                    }
                  }}
                >
                  <ElementRenderer element={element} isSelected={isSelected} />
                </div>
                
                {/* Selection box y handles */}
                <SelectionBox
                  element={element}
                  isSelected={isSelected}
                  onMouseDown={handleMouseDown}
                  zoom={canvasConfig.zoom}
                />
              </div>
            );
          })}
          
          {/* Indicador de arrastrar */}
          {isDraggingGlobal && (
            <div className="absolute inset-0 bg-blue-100 bg-opacity-20 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                Moviendo elemento...
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Info del canvas */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-xs text-gray-600 shadow-sm">
        <div className="flex items-center space-x-4">
          <span>
            📏 {canvasConfig.format.name} ({canvasConfig.format.width}×{canvasConfig.format.height}{canvasConfig.format.unit})
          </span>
          <span>
            🔍 {Math.round(canvasConfig.zoom * 100)}%
          </span>
          <span>
            📦 {elements.length} elemento{elements.length !== 1 ? 's' : ''}
          </span>
          {selectedElements.length > 0 && (
            <span>
              ✅ {selectedElements.length} seleccionado{selectedElements.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas; 