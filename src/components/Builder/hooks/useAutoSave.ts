import { useState, useCallback, useEffect, useRef } from 'react';
import { Block } from '../types/block';

interface UseAutoSaveProps {
  onSave: (blocks: Block[]) => Promise<void>;
  onError: (error: Error) => void;
  interval?: number; // in milliseconds
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  lastError: Error | null;
  saveNow: () => Promise<void>;
  toggleAutoSave: () => void;
  isEnabled: boolean;
}

export const useAutoSave = ({
  onSave,
  onError,
  interval = 30000, // 30 seconds default
  enabled = true
}: UseAutoSaveProps): UseAutoSaveReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const blocksRef = useRef<Block[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const saveNow = useCallback(async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setLastError(null);
      await onSave(blocksRef.current);
      setLastSaved(new Date());
    } catch (error) {
      if (error instanceof Error) {
        setLastError(error);
        onError(error);
      }
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, onSave, onError]);

  const scheduleSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isEnabled) {
      timeoutRef.current = setTimeout(saveNow, interval);
    }
  }, [isEnabled, interval, saveNow]);

  const toggleAutoSave = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const updateBlocks = useCallback((blocks: Block[]) => {
    blocksRef.current = blocks;
    scheduleSave();
  }, [scheduleSave]);

  useEffect(() => {
    if (isEnabled) {
      scheduleSave();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isEnabled, scheduleSave]);

  return {
    isSaving,
    lastSaved,
    lastError,
    saveNow,
    toggleAutoSave,
    isEnabled
  };
}; 