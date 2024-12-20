import React, { useRef } from 'react';
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

const BLOCKS_WITH_IMAGE = ['header', 'footer', 'image', 'logo'];

export function Block({ block, onDelete, onResize, onMove, onImageUpload, onDropInContainer }: BlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('Renderizando bloque:', block);

  const handleDragOver = (e: React.DragEvent) => {
    if (block.isContainer) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
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
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', block.id);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(block.id, file);
    }
  };

  const showImageUpload = BLOCKS_WITH_IMAGE.includes(block.type);

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
        ...(block.scale && {
          transform: `${block.rotation ? `rotate(${block.rotation}deg) ` : ''}scale(${block.scale.x}, ${block.scale.y})`
        }),
        ...block.styles
      }}
      onMouseDown={(e) => onMove(e, block.id)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      draggable={!block.isContainer}
      onDragStart={handleDragStart}
      data-block-id={block.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Etiqueta del contenedor */}
      {block.isContainer && (
        <div className="absolute -top-6 left-0 text-xs text-indigo-500 font-medium bg-white px-2 py-1 rounded-t-md border border-indigo-200">
          Contenedor
        </div>
      )}

      {/* Botón de eliminar */}
      <button
        onClick={() => onDelete(block.id)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10 shadow-sm"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Contenido del bloque */}
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        {block.content?.imageUrl ? (
          <img 
            src={block.content.imageUrl} 
            alt={`Imagen para ${block.type}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <>
            {showImageUpload ? (
              <button
                onClick={handleImageClick}
                className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
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
        />
      </div>

      {/* Manejador de redimensionamiento */}
      <div
        ref={resizeRef}
        className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-500 rounded-full cursor-se-resize transform translate-x-1/2 translate-y-1/2 hover:scale-110 transition-transform"
        onMouseDown={(e) => {
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

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', handleMouseMove);
          }, { once: true });
        }}
      />
    </motion.div>
  );
} 