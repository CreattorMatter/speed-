import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Block } from '../../types/builder';
import { renderBlockContent } from '../../utils/blockRenderer';

interface PreviewProps {
  blocks: Block[];
  isOpen: boolean;
  onClose: () => void;
}

// Dimensiones de una página A4 en horizontal (en mm)
const A4_WIDTH_MM = 297;
const A4_HEIGHT_MM = 210;
// Factor de conversión de mm a píxeles (96 DPI)
const MM_TO_PX = 3.7795275591;

export default function Preview({ blocks, isOpen, onClose }: PreviewProps) {
  const [scale, setScale] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  const handleExport = async () => {
    if (!previewRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current);
      const link = document.createElement('a');
      link.download = 'template.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error al exportar la plantilla:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-100 rounded-lg shadow-2xl p-8 relative max-h-[90vh] overflow-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Toolbar */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomIn}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomOut}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleExport}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* A4 Page Preview */}
          <div 
            className="mt-16 bg-white shadow-xl mx-auto"
            style={{
              width: `${A4_WIDTH_MM * MM_TO_PX * scale}px`,
              height: `${A4_HEIGHT_MM * MM_TO_PX * scale}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              position: 'relative'
            }}
          >
            <div
              ref={previewRef}
              className="absolute inset-0"
              style={{
                width: `${A4_WIDTH_MM * MM_TO_PX}px`,
                height: `${A4_HEIGHT_MM * MM_TO_PX}px`,
              }}
            >
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="absolute transition-all duration-300 ease-in-out"
                  style={{
                    left: block.position.x,
                    top: block.position.y,
                    width: block.size?.width,
                    height: block.size?.height,
                  }}
                >
                  {renderBlockContent({
                    block,
                    isEditing: false,
                    onEdit: () => {},
                    onStartEdit: () => {},
                    onStopEdit: () => {},
                    onImageUpload: () => {},
                    fileInputRef: { current: null }
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-lg shadow-sm text-sm text-gray-600">
            {Math.round(scale * 100)}%
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 