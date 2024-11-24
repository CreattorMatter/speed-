import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Download, Move } from 'lucide-react';
import { Block } from '../../types/builder';
// Importación dinámica de html2canvas
const html2canvas = import('html2canvas').then(module => module.default);

interface PreviewProps {
  blocks: Block[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Preview({ blocks, isOpen, onClose }: PreviewProps) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  const handleExport = async () => {
    if (!previewRef.current) return;
    
    try {
      const h2c = await html2canvas;
      const canvas = await h2c(previewRef.current);
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
          className="bg-white rounded-lg shadow-2xl m-4 p-8 relative max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Toolbar */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomIn}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomOut}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleExport}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Download className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Preview Area */}
          <motion.div
            ref={previewRef}
            style={{
              scale,
              x: position.x,
              y: position.y,
            }}
            drag
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            className="relative bg-white shadow-lg rounded-lg mt-12 transform-gpu"
          >
            {blocks.map((block) => (
              <motion.div
                key={block.id}
                className="absolute transition-all duration-300 ease-in-out"
                style={{
                  left: block.position.x,
                  top: block.position.y,
                  width: block.size?.width,
                  height: block.size?.height,
                }}
              >
                <div className="w-full h-full overflow-hidden">
                  {renderPreviewContent(block)}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm text-gray-600">
            {Math.round(scale * 100)}%
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function renderPreviewContent(block: Block) {
  switch (block.type) {
    case 'header':
    case 'footer':
      return block.content?.imageUrl ? (
        <img 
          src={block.content.imageUrl} 
          alt={block.type}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">Sin imagen</span>
        </div>
      );
    case 'image':
    case 'logo':
      return block.content?.imageUrl ? (
        <img 
          src={block.content.imageUrl} 
          alt="Content"
          className="w-full h-full object-contain"
        />
      ) : null;
    case 'sku':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <span className="font-mono text-gray-600">{block.content?.text}</span>
        </div>
      );
    case 'price':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{block.content?.text}</span>
        </div>
      );
    case 'discount':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-red-500 font-semibold">{block.content?.text}</span>
        </div>
      );
    case 'promotion':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="bg-yellow-50 text-yellow-800 p-2 rounded">
            {block.content?.text}
          </div>
        </div>
      );
    default:
      return null;
  }
} 