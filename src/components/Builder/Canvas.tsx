import React, { useState, useCallback, useRef, memo, useEffect } from 'react';
import { Block } from './Block';
import Rulers from './Rulers';
import { Block as BlockType, PaperFormat } from '../../types/builder';
import { PAPER_FORMATS } from '../../constants/paperFormats';
import '../../styles/scrollbar.css';

interface CanvasProps {
  blocks: BlockType[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockType[]>>;
  onDropInContainer: (containerId: string, blockId: string, position: { x: number, y: number }) => void;
  selectedFormat?: PaperFormat;
  isLandscape?: boolean;
  scale: number;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

const Canvas = memo(({ 
  blocks, 
  setBlocks, 
  onDropInContainer, 
  selectedFormat = PAPER_FORMATS[2], // A4 por defecto
  isLandscape = false,
  scale = 1,
  canvasRef
}: CanvasProps) => {
  const localCanvasRef = useRef<HTMLDivElement>(null);
  const finalCanvasRef = canvasRef || localCanvasRef;
  const GRID_SIZE = 20;
  const RULER_SIZE = 20;
  const [isDragging, setIsDragging] = useState(false);

  const handleDelete = useCallback((id: string) => {
    setBlocks(prev => {
      const blockToDelete = prev.find(b => b.id === id);
      if (blockToDelete?.isContainer) {
        return prev.filter(block => block.id !== id && block.parentId !== id);
      }
      return prev.filter(block => block.id !== id);
    });
  }, [setBlocks]);

  const handleResize = useCallback((id: string, size: { width: number; height: number }) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, size } : block
    ));
  }, [setBlocks]);

  const handleMove = useCallback((e: React.MouseEvent, id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialBlockPosition = { ...block.position };
    const childrenInitialPositions = blocks
      .filter(b => b.parentId === id)
      .map(b => ({ id: b.id, position: { ...b.position } }));

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      setBlocks(prev => {
        return prev.map(b => {
          if (b.id === id) {
            return {
              ...b,
              position: {
                x: initialBlockPosition.x + deltaX,
                y: initialBlockPosition.y + deltaY
              }
            };
          } else if (b.parentId === id) {
            const initialPos = childrenInitialPositions.find(p => p.id === b.id)?.position;
            if (!initialPos) return b;
            
            return {
              ...b,
              position: {
                x: initialPos.x + deltaX,
                y: initialPos.y + deltaY
              }
            };
          }
          return b;
        });
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [blocks, setBlocks]);

  const handleImageUpload = useCallback((id: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      console.error('El archivo debe ser una imagen');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setBlocks(prev => prev.map(block => 
          block.id === id 
            ? { ...block, content: { ...block.content, imageUrl: result } }
            : block
        ));
      }
    };
    reader.onerror = () => {
      console.error('Error al leer el archivo');
    };
    reader.readAsDataURL(file);
  }, [setBlocks]);

  // Ordenar los bloques para que los contenedores se rendericen primero
  const sortedBlocks = React.useMemo(() => {
    return [...blocks].sort((a, b) => {
      if (a.isContainer && !b.isContainer) return -1;
      if (!a.isContainer && b.isContainer) return 1;
      return 0;
    });
  }, [blocks]);

  // Calcular el tamaño del papel en píxeles
  const paperWidth = isLandscape ? selectedFormat.height : selectedFormat.width;
  const paperHeight = isLandscape ? selectedFormat.width : selectedFormat.height;

  // Efecto para limpiar los event listeners cuando el componente se desmonta
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', () => {});
      document.removeEventListener('mouseup', () => {});
    };
  }, []);

  return (
    <div 
      id="builder-canvas-area"
      className="h-full w-full relative bg-gray-100 rounded-lg shadow-lg overflow-hidden"
    >
      <Rulers gridSize={GRID_SIZE * scale} />
      <div 
        ref={finalCanvasRef}
        className={`builder-canvas relative overflow-auto scrollbar-custom ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{
          width: `calc(100% - ${RULER_SIZE}px)`,
          height: `calc(100% - ${RULER_SIZE}px)`,
          marginLeft: `${RULER_SIZE}px`,
          marginTop: `${RULER_SIZE}px`,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          backgroundColor: '#f3f4f6',
          minWidth: Math.max(paperWidth * 1.2, 1000) + 'px',
          minHeight: Math.max(paperHeight * 1.2, 800) + 'px',
          position: 'relative'
        }}
      >
        <div
          className="absolute bg-white shadow-lg"
          style={{
            width: paperWidth + 'px',
            height: paperHeight + 'px',
            left: RULER_SIZE + 'px',
            top: RULER_SIZE + 'px',
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
              linear-gradient(to right, rgba(99, 102, 241, 0.1) ${GRID_SIZE}px, transparent ${GRID_SIZE}px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.1) ${GRID_SIZE}px, transparent ${GRID_SIZE}px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE * 5}px ${GRID_SIZE * 5}px, ${GRID_SIZE * 5}px ${GRID_SIZE * 5}px`
          }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-t-lg shadow text-sm text-gray-600 flex items-center gap-2">
            <span className="font-medium">{selectedFormat.name}</span>
            <span className="text-gray-400">({selectedFormat.originalSize})</span>
          </div>

          {sortedBlocks.length > 0 ? (
            sortedBlocks.map(block => (
              <Block
                key={block.id}
                block={block}
                onDelete={handleDelete}
                onResize={handleResize}
                onMove={handleMove}
                onImageUpload={handleImageUpload}
                onDropInContainer={onDropInContainer}
              />
            ))
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Arrastra elementos aquí para comenzar
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;