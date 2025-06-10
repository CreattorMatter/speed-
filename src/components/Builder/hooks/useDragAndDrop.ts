import { useState, useCallback, useRef } from 'react';

interface DragItem {
  type: string;
  id: string;
  data?: any;
}

interface UseDragAndDropProps {
  onDrop: (item: DragItem, position: { x: number; y: number }) => void;
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: () => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface UseDragAndDropReturn {
  isDragging: boolean;
  dragItem: DragItem | null;
  handleDragStart: (e: React.DragEvent, item: DragItem) => void;
  handleDragEnd: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
}

export const useDragAndDrop = ({
  onDrop,
  onDragStart,
  onDragEnd,
  onError,
  enabled = true
}: UseDragAndDropProps): UseDragAndDropReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
    if (!enabled) return;

    try {
      setIsDragging(true);
      setDragItem(item);
      e.dataTransfer.setData('application/json', JSON.stringify(item));
      e.dataTransfer.effectAllowed = 'move';

      if (onDragStart) {
        onDragStart(item);
      }
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error);
      }
    }
  }, [enabled, onDragStart, onError]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setIsDragging(false);
    setDragItem(null);

    if (onDragEnd) {
      onDragEnd();
    }
  }, [onDragEnd]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!enabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, [enabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!enabled) return;
    e.preventDefault();

    try {
      const item = JSON.parse(e.dataTransfer.getData('application/json')) as DragItem;
      const rect = containerRef.current?.getBoundingClientRect();
      
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        onDrop(item, { x, y });
      }
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error);
      }
    }

    setIsDragging(false);
    setDragItem(null);

    if (onDragEnd) {
      onDragEnd();
    }
  }, [enabled, onDrop, onDragEnd, onError]);

  return {
    isDragging,
    dragItem,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };
}; 