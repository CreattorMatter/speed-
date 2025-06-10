import { useState, useCallback } from 'react';

interface UseZoomProps {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  step?: number;
  onZoomChange?: (scale: number) => void;
  onError?: (error: Error) => void;
}

interface UseZoomReturn {
  scale: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (scale: number) => void;
  handleWheel: (e: WheelEvent) => void;
}

export const useZoom = ({
  minScale = 0.1,
  maxScale = 3,
  initialScale = 1,
  step = 0.1,
  onZoomChange,
  onError
}: UseZoomProps): UseZoomReturn => {
  const [scale, setScale] = useState(initialScale);

  const updateScale = useCallback((newScale: number) => {
    try {
      const clampedScale = Math.min(Math.max(newScale, minScale), maxScale);
      setScale(clampedScale);
      if (onZoomChange) {
        onZoomChange(clampedScale);
      }
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error);
      }
    }
  }, [minScale, maxScale, onZoomChange, onError]);

  const zoomIn = useCallback(() => {
    updateScale(scale + step);
  }, [scale, step, updateScale]);

  const zoomOut = useCallback(() => {
    updateScale(scale - step);
  }, [scale, step, updateScale]);

  const resetZoom = useCallback(() => {
    updateScale(initialScale);
  }, [initialScale, updateScale]);

  const setZoom = useCallback((newScale: number) => {
    updateScale(newScale);
  }, [updateScale]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -step : step;
      updateScale(scale + delta);
    }
  }, [scale, step, updateScale]);

  return {
    scale,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    handleWheel
  };
}; 