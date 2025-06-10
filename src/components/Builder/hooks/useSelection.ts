import { useState, useCallback, useRef } from 'react';
import { Block } from '../types/block';

interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseSelectionProps {
  blocks: Block[];
  onSelectionChange: (selectedBlocks: Block[]) => void;
  onSelectionBoxChange?: (box: SelectionBox | null) => void;
}

interface UseSelectionReturn {
  selectedBlocks: Block[];
  selectionBox: SelectionBox | null;
  isSelecting: boolean;
  startSelection: (e: React.MouseEvent) => void;
  updateSelection: (e: MouseEvent) => void;
  endSelection: () => void;
  clearSelection: () => void;
  isBlockSelected: (block: Block) => boolean;
  toggleBlockSelection: (block: Block) => void;
}

export const useSelection = ({
  blocks,
  onSelectionChange,
  onSelectionBoxChange
}: UseSelectionProps): UseSelectionReturn => {
  const [selectedBlocks, setSelectedBlocks] = useState<Block[]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSelectedBlocks = useCallback((newSelection: Block[]) => {
    setSelectedBlocks(newSelection);
    onSelectionChange(newSelection);
  }, [onSelectionChange]);

  const startSelection = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    if (e.shiftKey) return; // Don't start selection if shift is pressed

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsSelecting(true);
    startPosRef.current = { x, y };
    setSelectionBox({ x, y, width: 0, height: 0 });

    if (onSelectionBoxChange) {
      onSelectionBoxChange({ x, y, width: 0, height: 0 });
    }
  }, [onSelectionBoxChange]);

  const updateSelection = useCallback((e: MouseEvent) => {
    if (!isSelecting || !startPosRef.current) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(startPosRef.current.x, currentX);
    const y = Math.min(startPosRef.current.y, currentY);
    const width = Math.abs(currentX - startPosRef.current.x);
    const height = Math.abs(currentY - startPosRef.current.y);

    const newSelectionBox = { x, y, width, height };
    setSelectionBox(newSelectionBox);

    if (onSelectionBoxChange) {
      onSelectionBoxChange(newSelectionBox);
    }

    // Find blocks that intersect with the selection box
    const selected = blocks.filter(block => {
      return (
        block.x < x + width &&
        block.x + block.width > x &&
        block.y < y + height &&
        block.y + block.height > y
      );
    });

    updateSelectedBlocks(selected);
  }, [isSelecting, blocks, updateSelectedBlocks, onSelectionBoxChange]);

  const endSelection = useCallback(() => {
    setIsSelecting(false);
    startPosRef.current = null;
    setSelectionBox(null);

    if (onSelectionBoxChange) {
      onSelectionBoxChange(null);
    }
  }, [onSelectionBoxChange]);

  const clearSelection = useCallback(() => {
    updateSelectedBlocks([]);
  }, [updateSelectedBlocks]);

  const isBlockSelected = useCallback((block: Block) => {
    return selectedBlocks.some(selected => selected.id === block.id);
  }, [selectedBlocks]);

  const toggleBlockSelection = useCallback((block: Block) => {
    if (isBlockSelected(block)) {
      updateSelectedBlocks(selectedBlocks.filter(b => b.id !== block.id));
    } else {
      updateSelectedBlocks([...selectedBlocks, block]);
    }
  }, [isBlockSelected, selectedBlocks, updateSelectedBlocks]);

  return {
    selectedBlocks,
    selectionBox,
    isSelecting,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    isBlockSelected,
    toggleBlockSelection
  };
}; 