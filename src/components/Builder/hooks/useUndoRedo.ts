import { useState, useCallback, useRef } from 'react';
import { Block } from '../types/block';

interface HistoryState {
  blocks: Block[];
  timestamp: number;
}

interface UseUndoRedoProps {
  initialBlocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushState: (blocks: Block[]) => void;
  clearHistory: () => void;
}

export const useUndoRedo = ({
  initialBlocks,
  onBlocksChange
}: UseUndoRedoProps): UseUndoRedoReturn => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const historyRef = useRef<HistoryState[]>([]);
  const currentIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);

  const pushState = useCallback((blocks: Block[]) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    // Remove any future states if we're not at the end
    if (currentIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    }

    // Add new state
    historyRef.current.push({
      blocks: JSON.parse(JSON.stringify(blocks)),
      timestamp: Date.now()
    });

    // Limit history size
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    }

    currentIndexRef.current = historyRef.current.length - 1;
    setCanUndo(currentIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      currentIndexRef.current--;
      const previousState = historyRef.current[currentIndexRef.current];
      onBlocksChange(previousState.blocks);
      setCanUndo(currentIndexRef.current > 0);
      setCanRedo(true);
    }
  }, [onBlocksChange]);

  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      currentIndexRef.current++;
      const nextState = historyRef.current[currentIndexRef.current];
      onBlocksChange(nextState.blocks);
      setCanUndo(true);
      setCanRedo(currentIndexRef.current < historyRef.current.length - 1);
    }
  }, [onBlocksChange]);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    currentIndexRef.current = -1;
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  // Initialize with initial blocks
  if (historyRef.current.length === 0) {
    pushState(initialBlocks);
  }

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    clearHistory
  };
}; 