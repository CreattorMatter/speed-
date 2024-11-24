import { useState, useCallback } from 'react';
import { Block } from '../types/builder';

interface HistoryState {
  past: Block[][];
  present: Block[];
  future: Block[][];
}

export function useHistory(initialPresent: Block[]) {
  const [state, setState] = useState<HistoryState>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    setState((currentState) => {
      if (!canUndo) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    setState((currentState) => {
      if (!canRedo) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, [canRedo]);

  const update = useCallback((newPresent: Block[]) => {
    setState((currentState) => ({
      past: [...currentState.past, currentState.present],
      present: newPresent,
      future: [],
    }));
  }, []);

  return {
    blocks: state.present,
    update,
    undo,
    redo,
    canUndo,
    canRedo,
  };
} 