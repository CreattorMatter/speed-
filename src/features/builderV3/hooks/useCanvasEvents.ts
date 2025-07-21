// =====================================
// CANVAS EVENTS HOOK - BuilderV3
// =====================================

import { useCallback, useEffect, useState, useRef } from 'react';
import { ComponentTypeV3, PositionV3, DraggableComponentV3, CanvasStateV3, BuilderOperationsV3 } from '../types';

interface UseCanvasEventsProps {
  canvasState: CanvasStateV3;
  components: DraggableComponentV3[];
  selectedComponentIds: string[];
  operations: BuilderOperationsV3;
  onComponentSelect: (componentId: string | null) => void;
  onMultipleComponentSelect: (componentIds: string[]) => void;
  onComponentAdd: (type: ComponentTypeV3, position: PositionV3) => void;
}

export const useCanvasEvents = ({
  canvasState,
  components,
  selectedComponentIds,
  operations,
  onComponentSelect,
  onMultipleComponentSelect,
  onComponentAdd
}: UseCanvasEventsProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  
  // Estados de interacción
  const [draggedComponentType, setDraggedComponentType] = useState<ComponentTypeV3 | null>(null);
  const [dropPosition, setDropPosition] = useState<{ x: number; y: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);

  /**
   * Convertir coordenadas de evento a coordenadas del canvas
   */
  const getCanvasCoordinatesFromEvent = useCallback((e: MouseEvent | React.MouseEvent | React.DragEvent) => {
    if (!worldRef.current) return null;
    const worldRect = worldRef.current.getBoundingClientRect();
    const x = (e.clientX - worldRect.left) / canvasState.zoom;
    const y = (e.clientY - worldRect.top) / canvasState.zoom;
    return { x, y };
  }, [canvasState.zoom]);

  /**
   * Manejar clic en el canvas
   */
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Deseleccionar solo si se hace clic en el fondo del canvas
    if (target === canvasRef.current) {
      onComponentSelect(null);
    }
  }, [onComponentSelect]);

  /**
   * Manejar clic en componente
   */
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

  /**
   * Manejar drag over para drop de componentes
   */
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

  /**
   * Manejar drop de componente
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('application/component-type') as ComponentTypeV3;
    if (!componentType || !dropPosition) return;
    
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

  /**
   * Manejar inicio de selección múltiple
   */
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
          
          // Selección por intersección
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

  /**
   * Keyboard shortcuts
   */
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

  return {
    // Refs
    canvasRef,
    worldRef,
    
    // Estados
    draggedComponentType,
    dropPosition,
    isSelecting,
    selectionStart,
    selectionEnd,
    
    // Handlers
    handleCanvasClick,
    handleComponentClick,
    handleDragOver,
    handleDrop,
    handleSelectionMouseDown,
    
    // Setters
    setDraggedComponentType
  };
}; 