import React, { useState, useCallback } from 'react';
import { Block } from './Block';
import { ZoomControls } from './ZoomControls';
import Rulers from './Rulers';
import { Block as BlockType } from '../../types/builder';

interface CanvasProps {
  blocks: BlockType[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockType[]>>;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const GRID_SIZE = 20;
  const [scale, setScale] = useState(1);

  const handleDelete = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  }, [setBlocks]);

  const handleResize = useCallback((id: string, size: { width: number; height: number }) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, size } : block
    ));
  }, [setBlocks]);

  const handleMove = useCallback((e: React.MouseEvent, id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    const startX = e.clientX - block.position.x;
    const startY = e.clientY - block.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      setBlocks(prev => prev.map(b => 
        b.id === id 
          ? { ...b, position: { x: e.clientX - startX, y: e.clientY - startY } }
          : b
      ));
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

  return (
    <div 
      id="builder-canvas-area"
      className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 relative"
    >
      <ZoomControls
        scale={scale}
        onZoomIn={() => setScale(s => Math.min(s + 0.1, 2))}
        onZoomOut={() => setScale(s => Math.max(s - 0.1, 0.5))}
      />
      <Rulers gridSize={GRID_SIZE * scale} />
      <div 
        className="relative w-[calc(100%-20px)] h-[calc(100%-20px)] ml-[20px] mt-[20px]"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundColor: 'white',
          width: '3000px',
          height: '2000px'
        }}
      >
        {blocks.map(block => (
          <Block
            key={block.id}
            block={block}
            onDelete={handleDelete}
            onResize={handleResize}
            onMove={handleMove}
            onImageUpload={handleImageUpload}
          />
        ))}
      </div>
    </div>
  );
}