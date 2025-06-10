import { useState, useCallback } from 'react';

interface GridSettings {
  enabled: boolean;
  size: number;
  color: string;
  opacity: number;
  snapToGrid: boolean;
}

interface UseGridProps {
  initialSettings?: Partial<GridSettings>;
  onSettingsChange?: (settings: GridSettings) => void;
  onError?: (error: Error) => void;
}

interface UseGridReturn {
  settings: GridSettings;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  setGridColor: (color: string) => void;
  setGridOpacity: (opacity: number) => void;
  toggleSnapToGrid: () => void;
  snapToGrid: (value: number) => number;
}

const DEFAULT_SETTINGS: GridSettings = {
  enabled: true,
  size: 20,
  color: '#cccccc',
  opacity: 0.5,
  snapToGrid: true
};

export const useGrid = ({
  initialSettings,
  onSettingsChange,
  onError
}: UseGridProps = {}): UseGridReturn => {
  const [settings, setSettings] = useState<GridSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings
  });

  const updateSettings = useCallback((updates: Partial<GridSettings>) => {
    try {
      setSettings(prev => {
        const newSettings = { ...prev, ...updates };
        if (onSettingsChange) {
          onSettingsChange(newSettings);
        }
        return newSettings;
      });
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error);
      }
    }
  }, [onSettingsChange, onError]);

  const toggleGrid = useCallback(() => {
    updateSettings({ enabled: !settings.enabled });
  }, [settings.enabled, updateSettings]);

  const setGridSize = useCallback((size: number) => {
    updateSettings({ size: Math.max(5, Math.min(100, size)) });
  }, [updateSettings]);

  const setGridColor = useCallback((color: string) => {
    updateSettings({ color });
  }, [updateSettings]);

  const setGridOpacity = useCallback((opacity: number) => {
    updateSettings({ opacity: Math.max(0, Math.min(1, opacity)) });
  }, [updateSettings]);

  const toggleSnapToGrid = useCallback(() => {
    updateSettings({ snapToGrid: !settings.snapToGrid });
  }, [settings.snapToGrid, updateSettings]);

  const snapToGrid = useCallback((value: number) => {
    try {
      if (!settings.enabled || !settings.snapToGrid) return value;
      return Math.round(value / settings.size) * settings.size;
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error);
      }
      return value;
    }
  }, [settings.enabled, settings.snapToGrid, settings.size, onError]);

  return {
    settings,
    toggleGrid,
    setGridSize,
    setGridColor,
    setGridOpacity,
    toggleSnapToGrid,
    snapToGrid
  };
}; 