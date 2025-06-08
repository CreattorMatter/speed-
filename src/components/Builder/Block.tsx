import React, { useRef, useCallback, memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { Block as BlockType } from '../../types/builder';

interface BlockProps {
  block: BlockType;
  onDelete: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onMove: (e: React.MouseEvent, id: string) => void;
  onImageUpload?: (id: string, file: File) => void;
  onDropInContainer?: (containerId: string, blockId: string, position: { x: number, y: number }) => void;
}

const BLOCKS_WITH_IMAGE = ['header', 'footer', 'image', 'logo'] as const;
type BlockWithImage = typeof BLOCKS_WITH_IMAGE[number];

const Block = memo(({ block, onDelete, onResize, onMove, onImageUpload, onDropInContainer }: BlockProps) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (block.isContainer) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [block.isContainer]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (block.isContainer && onDropInContainer) {
      e.preventDefault();
      e.stopPropagation();
      
      const blockId = e.dataTransfer.getData('text/plain');
      if (!blockId) return;

      const rect = blockRef.current?.getBoundingClientRect();
      if (!rect) return;

      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      onDropInContainer(block.id, blockId, position);
    }
  }, [block.id, block.isContainer, onDropInContainer]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', block.id);
  }, [block.id]);

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      if (!file.type.startsWith('image/')) {
        console.error('El archivo debe ser una imagen');
        return;
      }
      onImageUpload(block.id, file);
    }
  }, [block.id, onImageUpload]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = block.size.width;
    const startHeight = block.size.height;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      onResize(block.id, {
        width: Math.max(50, startWidth + deltaX),
        height: Math.max(50, startHeight + deltaY)
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [block.id, block.size.height, block.size.width, onResize]);

  const showImageUpload = BLOCKS_WITH_IMAGE.includes(block.type as BlockWithImage);

  // Limpiar event listeners cuando el componente se desmonta
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', () => {});
      document.removeEventListener('mouseup', () => {});
    };
  }, []);

  return (
    <motion.div
      ref={blockRef}
      className={`absolute cursor-move ${
        block.isContainer 
          ? 'border-2 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 transition-colors' 
          : 'bg-white rounded-lg shadow-md hover:shadow-lg'
      }`}
      style={{
        left: block.position.x,
        top: block.position.y,
        width: block.size.width,
        height: block.size.height,
        zIndex: block.isContainer ? 0 : 1,
        transform: block.rotation ? `rotate(${block.rotation}deg)` : undefined,
        ...block.styles
      }}
      onMouseDown={(e) => onMove(e, block.id)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      draggable={!block.isContainer}
      onDragStart={handleDragStart}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={() => onDelete(block.id)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10 shadow-sm"
        aria-label="Eliminar bloque"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="w-full h-full flex flex-col items-center justify-center relative">
        {block.content?.imageUrl ? (
          <img 
            src={block.content.imageUrl} 
            alt={`Imagen para ${block.type}`}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <>
            {showImageUpload ? (
              <button
                onClick={handleImageClick}
                className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                aria-label="Subir imagen"
              >
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Subir imagen</span>
              </button>
            ) : (
              !block.isContainer && (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <span className="text-gray-500 text-center break-words">
                    {block.content?.text || `Bloque ${block.type}`}
                  </span>
                </div>
              )
            )}
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Seleccionar imagen"
        />
      </div>

      <div
        ref={resizeRef}
        className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-500 rounded-full cursor-se-resize transform translate-x-1/2 translate-y-1/2 hover:scale-110 transition-transform"
        onMouseDown={handleResizeStart}
        aria-label="Redimensionar bloque"
      />
    </motion.div>
  );
});

Block.displayName = 'Block';

export { Block }; 