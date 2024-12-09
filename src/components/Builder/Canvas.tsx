import React, { useState, useCallback } from 'react';
import { Block as BlockComponent } from './Block';
import { ZoomControls } from './ZoomControls';
import Rulers from './Rulers';
import { Block, PaperFormat } from '../../types/builder';

interface CanvasProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
  selectedBlock: string | null;
  onSelectBlock: (id: string | null) => void;
  showGrid: boolean;
  zoom: number;
  paperFormat: PaperFormat;
  isLandscape: boolean;
  showPoints: boolean;
  showOrigin: boolean;
  showBarcode: boolean;
}

export default function Canvas({ 
  blocks, 
  setBlocks, 
  selectedBlock, 
  onSelectBlock, 
  showGrid, 
  zoom, 
  paperFormat, 
  isLandscape, 
  showPoints, 
  showOrigin, 
  showBarcode 
}: CanvasProps) {
  const GRID_SIZE = 20;

  const handleDelete = useCallback((id: string) => {
    setBlocks((prevBlocks: Block[]) => prevBlocks.filter(block => block.id !== id));
  }, [setBlocks]);

  const handleResize = useCallback((id: string, size: { width: number; height: number }) => {
    setBlocks((prevBlocks: Block[]) => prevBlocks.map(block => 
      block.id === id ? { ...block, size } : block
    ));
  }, [setBlocks]);

  const handleMove = useCallback((e: React.MouseEvent, id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    const startX = e.clientX - block.position.x;
    const startY = e.clientY - block.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      setBlocks((prevBlocks: Block[]) => prevBlocks.map(block => 
        block.id === id 
          ? { ...block, position: { x: e.clientX - startX, y: e.clientY - startY } }
          : block
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
        setBlocks((prevBlocks: Block[]) => prevBlocks.map(block => 
          block.id === id 
            ? { ...block, content: { ...block.content, imageUrl: result } }
            : block
        ));
      }
    };
    reader.readAsDataURL(file);
  }, [setBlocks]);

  return (
    <div className="flex-1 bg-white rounded-lg shadow-lg p-4 relative min-h-[800px] overflow-hidden">
      <ZoomControls
        scale={zoom}
        onZoomIn={() => setScale(s => Math.min(s + 0.1, 2))}
        onZoomOut={() => setScale(s => Math.max(s - 0.1, 0.5))}
      />
      <Rulers gridSize={GRID_SIZE * zoom} />
      <div 
        className="relative w-[calc(100%-20px)] h-[calc(100%-20px)] ml-[20px] mt-[20px]"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
          backgroundImage: showGrid ? `linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)` : 'none',
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundColor: 'white',
          width: '3000px',
          height: '2000px'
        }}
      >
        {blocks.map(block => (
          <BlockComponent
            key={block.id}
            block={block}
            onDelete={handleDelete}
            onResize={handleResize}
            onMove={handleMove}
            onImageUpload={handleImageUpload}
            isSelected={block.id === selectedBlock}
            onClick={() => onSelectBlock(block.id)}
          />
        ))}
      </div>
    </div>
  );
}