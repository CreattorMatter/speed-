import { useState, useCallback, useRef } from 'react';
import { Block } from '../types/block';

interface UseBlockProps {
  block: Block;
  onMove: (blockId: string, x: number, y: number) => void;
  onResize: (blockId: string, width: number, height: number) => void;
  onDelete: (blockId: string) => void;
  onSelect: (blockId: string) => void;
  isSelected: boolean;
}

interface UseBlockReturn {
  isDragging: boolean;
  isResizing: boolean;
  dragStartPos: { x: number; y: number };
  resizeStartPos: { width: number; height: number };
  blockRef: React.RefObject<HTMLDivElement>;
  handleDragStart: (e: React.MouseEvent) => void;
  handleDragMove: (e: MouseEvent) => void;
  handleDragEnd: () => void;
  handleResizeStart: (e: React.MouseEvent) => void;
  handleResizeMove: (e: MouseEvent) => void;
  handleResizeEnd: () => void;
  handleClick: (e: React.MouseEvent) => void;
  handleDelete: () => void;
}

export const useBlock = ({
  block,
  onMove,
  onResize,
  onDelete,
  onSelect,
  isSelected
}: UseBlockProps): UseBlockReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ width: 0, height: 0 });
  const blockRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStartPos({
      x: e.clientX - block.x,
      y: e.clientY - block.y
    });
    e.stopPropagation();
  }, [block.x, block.y]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const x = e.clientX - dragStartPos.x;
    const y = e.clientY - dragStartPos.y;
    onMove(block.id, x, y);
  }, [isDragging, dragStartPos, block.id, onMove]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsResizing(true);
    setResizeStartPos({
      width: block.width,
      height: block.height
    });
    e.stopPropagation();
  }, [block.width, block.height]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const width = Math.max(50, resizeStartPos.width + (e.clientX - e.clientX));
    const height = Math.max(50, resizeStartPos.height + (e.clientY - e.clientY));
    onResize(block.id, width, height);
  }, [isResizing, resizeStartPos, block.id, onResize]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(block.id);
  }, [block.id, onSelect]);

  const handleDelete = useCallback(() => {
    onDelete(block.id);
  }, [block.id, onDelete]);

  return {
    isDragging,
    isResizing,
    dragStartPos,
    resizeStartPos,
    blockRef,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    handleClick,
    handleDelete
  };
}; 