import { useState } from 'react';
import { Block } from '../types/builder';

interface HistoryEntry {
  blocks: Block[];
  timestamp: number;
  description: string;
}

export function useBlockHistory(initialBlocks: Block[]) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { blocks: initialBlocks, timestamp: Date.now(), description: 'Estado inicial' }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addToHistory = (blocks: Block[], description: string) => {
    const newEntry = {
      blocks,
      timestamp: Date.now(),
      description
    };

    // Eliminar entradas futuras si estamos en medio del historial
    const newHistory = history.slice(0, currentIndex + 1);
    setHistory([...newHistory, newEntry]);
    setCurrentIndex(newHistory.length);
  };

  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1].blocks;
    }
    return history[currentIndex].blocks;
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1].blocks;
    }
    return history[currentIndex].blocks;
  };

  const getHistory = () => history;
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    addToHistory,
    undo,
    redo,
    getHistory,
    canUndo,
    canRedo,
    currentEntry: history[currentIndex]
  };
} 