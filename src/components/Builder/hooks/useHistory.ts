import { useState, useCallback, useRef } from 'react';
import { Block } from '../types/block';

interface HistoryState {
  blocks: Block[];
  timestamp: number;
  description: string;
}

interface UseHistoryProps {
  initialBlocks: Block[];
  onStateChange: (blocks: Block[]) => void;
  maxHistorySize?: number;
  onError?: (error: Error) => void;
}

interface UseHistoryReturn {
  canUndo: boolean;
  canRedo: boolean;
  currentState: HistoryState | null;
  pushState: (blocks: Block[], description: string) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

export const useHistory = ({
  initialBlocks,
  onStateChange,
  maxHistorySize = 50,
  onError
}: UseHistoryProps): UseHistoryReturn => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);

  const pushState = useCallback((blocks: Block[], description: string) => {
    try {
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        return;
      }

      // Remove any future states if we're not at the end
      const newHistory = history.slice(0, currentIndex + 1);

      // Add new state
      newHistory.push({
        blocks: JSON.parse(JSON.stringify(blocks)),
        timestamp: Date.now(),
        description
      });

      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }

      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error);
      }
    }
  }, [history, currentIndex, maxHistorySize, onError]);

  const undo = useCallback(() => {
    try {
      if (currentIndex > 0) {
        isUndoRedoRef.current = true;
        const newIndex = currentIndex - 1;
        setCurrentIndex(newIndex);
        onStateChange(history[newIndex].blocks);
      }
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error);
      }
    }
  }, [currentIndex, history, onStateChange, onError]);

  const redo = useCallback(() => {
    try {
      if (currentIndex < history.length - 1) {
        isUndoRedoRef.current = true;
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        onStateChange(history[newIndex].blocks);
      }
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error);
      }
    }
  }, [currentIndex, history, onStateChange, onError]);

  const clearHistory = useCallback(() => {
    try {
      setHistory([]);
      setCurrentIndex(-1);
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error);
      }
    }
  }, [onError]);

  // Initialize with initial blocks
  if (history.length === 0) {
    pushState(initialBlocks, 'Initial state');
  }

  return {
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    currentState: history[currentIndex] || null,
    pushState,
    undo,
    redo,
    clearHistory
  };
}; 