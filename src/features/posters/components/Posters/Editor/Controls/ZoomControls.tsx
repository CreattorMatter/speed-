import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  minZoom?: number;
  maxZoom?: number;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  minZoom = 0.25,
  maxZoom = 3
}) => {
  const zoomPercentage = Math.round(zoom * 100);
  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-2 border border-gray-200">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className={`p-2 rounded-lg transition-colors ${
          canZoomOut 
            ? 'hover:bg-gray-100 text-gray-700' 
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Alejar"
      >
        <ZoomOut className="w-4 h-4" />
      </motion.button>

      <div className="px-3 py-1 text-sm font-medium text-gray-700 min-w-[60px] text-center">
        {zoomPercentage}%
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className={`p-2 rounded-lg transition-colors ${
          canZoomIn 
            ? 'hover:bg-gray-100 text-gray-700' 
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Acercar"
      >
        <ZoomIn className="w-4 h-4" />
      </motion.button>

      <div className="w-px h-6 bg-gray-300" />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onResetZoom}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
        title="Restablecer zoom"
      >
        <RotateCcw className="w-4 h-4" />
      </motion.button>
    </div>
  );
}; 