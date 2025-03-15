import { useState, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DraggableOptions {
  gridSnap?: number;
  bounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  onDragStart?: () => void;
  onDragEnd?: (position: Position) => void;
  onDrag?: (position: Position) => void;
}

export function useDraggable(initialPosition: Position, options: DraggableOptions = {}) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [elementOffset, setElementOffset] = useState<Position>({ x: 0, y: 0 });

  const snapToGrid = useCallback((value: number, gridSize: number): number => {
    return Math.round(value / gridSize) * gridSize;
  }, []);

  const constrainToBounds = useCallback((pos: Position, bounds?: DraggableOptions['bounds']): Position => {
    if (!bounds) return pos;
    return {
      x: Math.min(Math.max(pos.x, bounds.left), bounds.right),
      y: Math.min(Math.max(pos.y, bounds.top), bounds.bottom)
    };
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return; // Solo botón izquierdo
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    const element = e.target as HTMLElement;
    const rect = element.getBoundingClientRect();
    setElementOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    options.onDragStart?.();
  }, [options]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart) return;

    let newX = e.clientX - elementOffset.x;
    let newY = e.clientY - elementOffset.y;

    // Aplicar snap a la grilla si está configurado
    if (options.gridSnap) {
      newX = snapToGrid(newX, options.gridSnap);
      newY = snapToGrid(newY, options.gridSnap);
    }

    // Aplicar restricciones de límites
    const newPosition = constrainToBounds({ x: newX, y: newY }, options.bounds);

    setPosition(newPosition);
    options.onDrag?.(newPosition);
  }, [isDragging, dragStart, elementOffset, options, snapToGrid, constrainToBounds]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      options.onDragEnd?.(position);
    }
  }, [isDragging, position, options]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    position,
    isDragging,
    handleMouseDown,
    setPosition
  };
} 