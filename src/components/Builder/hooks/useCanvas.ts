import { useState, useCallback, useRef } from 'react';
import { Block } from '../types/block';
import { PaperFormat } from '../types/paper';
import { PAPER_FORMATS } from '../constants/paperFormats';

interface CanvasSettings {
  format: PaperFormat;
  width: number;
  height: number;
  scale: number;
}

interface UseCanvasReturn {
  blocks: Block[];
  selectedBlock: Block | null;
  isDragging: boolean;
  canvasSettings: CanvasSettings;
  canvasRef: React.RefObject<HTMLDivElement>;
  updateBlocks: (updater: (prev: Block[]) => Block[]) => void;
  setSelectedBlock: (block: Block | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  handleBlockMove: (blockId: string, x: number, y: number) => void;
  handleBlockResize: (blockId: string, width: number, height: number) => void;
  handleBlockDelete: (blockId: string) => void;
  handleBlockSelect: (blockId: string) => void;
  handleBlockDeselect: () => void;
}

export const useCanvas = (initialBlocks: Block[] = []): UseCanvasReturn => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    format: 'A4',
    width: PAPER_FORMATS.A4.width,
    height: PAPER_FORMATS.A4.height,
    scale: 1
  });
  const canvasRef = useRef<HTMLDivElement>(null);

  const updateBlocks = useCallback((updater: (prev: Block[]) => Block[]) => {
    setBlocks(updater);
  }, []);

  const handleBlockMove = useCallback((blockId: string, x: number, y: number) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, x, y } : block
    ));
  }, []);

  const handleBlockResize = useCallback((blockId: string, width: number, height: number) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, width, height } : block
    ));
  }, []);

  const handleBlockDelete = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  }, [selectedBlock]);

  const handleBlockSelect = useCallback((blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      setSelectedBlock(block);
    }
  }, [blocks]);

  const handleBlockDeselect = useCallback(() => {
    setSelectedBlock(null);
  }, []);

  return {
    blocks,
    selectedBlock,
    isDragging,
    canvasSettings,
    canvasRef,
    updateBlocks,
    setSelectedBlock,
    setIsDragging,
    setCanvasSettings: (settings: Partial<CanvasSettings>) => 
      setCanvasSettings(prev => ({ ...prev, ...settings })),
    handleBlockMove,
    handleBlockResize,
    handleBlockDelete,
    handleBlockSelect,
    handleBlockDeselect
  };
}; 