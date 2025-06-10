import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
  onError
}: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    try {
      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey === event.ctrlKey;
        const shiftMatch = shortcut.shiftKey === event.shiftKey;
        const altMatch = shortcut.altKey === event.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error);
      }
    }
  }, [shortcuts, enabled, onError]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}; 