import React, { useState, useCallback } from 'react';
import { Block } from './Block';
import { ZoomControls } from './ZoomControls';
import Rulers from './Rulers';
import { Block as BlockType } from '../../types/builder';

interface CanvasProps {
  blocks: BlockType[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockType[]>>;
  onDropInContainer: (containerId: string, blockId: string, position: { x: number, y: number }) => void;
}

export default function Canvas({ blocks, setBlocks, onDropInContainer }: CanvasProps) {
  const GRID_SIZE = 20;
  const [scale, setScale] = useState(1);

  const handleDelete = useCallback((id: string) => {
    setBlocks(prev => {
      const blockToDelete = prev.find(b => b.id === id);
      if (blockToDelete?.isContainer) {
        // Si es un contenedor, eliminar también los bloques hijos
        return prev.filter(block => block.id !== id && block.parentId !== id);
      }
      // Si no es un contenedor, solo eliminar el bloque
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
            // Mover el contenedor
            return {
              ...b,
              position: {
                x: initialBlockPosition.x + deltaX,
                y: initialBlockPosition.y + deltaY
              }
            };
          } else if (b.parentId === id) {
            // Encontrar la posición inicial de este hijo
            const initialPos = childrenInitialPositions.find(p => p.id === b.id)?.position;
            if (!initialPos) return b;
            
            // Mover el bloque hijo manteniendo su posición relativa
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

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', handleMouseMove);
    }, { once: true });
  }, [blocks, setBlocks]);

  const handleImageUpload = useCallback((id: string, file: File) => {
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
    reader.readAsDataURL(file);
  }, [setBlocks]);

  // Ordenar los bloques para que los contenedores se rendericen primero
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.isContainer && !b.isContainer) return -1;
    if (!a.isContainer && b.isContainer) return 1;
    return 0;
  });

  console.log('Renderizando bloques en Canvas:', sortedBlocks);

  return (
    <div 
      id="builder-canvas-area"
      className="h-full w-full relative bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <ZoomControls
        scale={scale}
        onZoomIn={() => setScale(s => Math.min(s + 0.1, 2))}
        onZoomOut={() => setScale(s => Math.max(s - 0.1, 0.5))}
      />
      <Rulers gridSize={GRID_SIZE * scale} />
      <div 
        className="builder-canvas relative w-[calc(100%-20px)] h-[calc(100%-20px)] ml-[20px] mt-[20px] overflow-auto"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundColor: 'white',
          minWidth: '3000px',
          minHeight: '2000px',
          position: 'relative'
        }}
      >
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
  );
}