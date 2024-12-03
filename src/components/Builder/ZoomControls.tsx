import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ZoomControls = React.memo(function ZoomControls({ 
  scale, 
  onZoomIn, 
  onZoomOut 
}: ZoomControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex gap-2 bg-white rounded-lg shadow-md p-1 z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <ZoomIn className="w-5 h-5 text-gray-600" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <ZoomOut className="w-5 h-5 text-gray-600" />
      </motion.button>
      <div className="flex items-center px-2 text-sm text-gray-500 border-l border-gray-200">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}); 