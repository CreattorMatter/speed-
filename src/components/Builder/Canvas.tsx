import React, { useState, useCallback } from 'react';
import { Block as BlockComponent } from './Block';
import { ZoomControls } from './ZoomControls';
import Rulers from './Rulers';
import { Block, PaperFormat } from '../../types/builder';
import { PAPER_FORMATS } from '../../constants/paperFormats';

// Convertir mm a píxeles (96 DPI)
const MM_TO_PX = 3.7795275591;

const convertSizeToPx = (size: string): number => {
  const value = parseFloat(size);
  return Math.round(value * MM_TO_PX);
};

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

  // Convertir dimensiones del papel a píxeles
  const width = convertSizeToPx(isLandscape ? paperFormat.height : paperFormat.width);
  const height = convertSizeToPx(isLandscape ? paperFormat.width : paperFormat.height);

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
    <div className="flex-1 bg-gray-100 rounded-lg shadow-lg p-4 relative min-h-[800px] overflow-hidden">
      <ZoomControls
        scale={zoom}
        onZoomIn={() => onZoomChange?.(Math.min(zoom + 0.1, 2))}
        onZoomOut={() => onZoomChange?.(Math.max(zoom - 0.1, 0.5))}
      />
      <Rulers gridSize={GRID_SIZE * zoom} />
      
      {/* Área de trabajo con scroll */}
      <div className="relative w-[calc(100%-20px)] h-[calc(100%-20px)] ml-[20px] mt-[20px] overflow-auto">
        {/* Contenedor con zoom */}
        <div
          className="relative min-w-full min-h-full flex items-center justify-center p-8"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Área de papel */}
          <div 
            className="relative bg-white shadow-xl"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundImage: showGrid ? `
                linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
              ` : 'none',
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            }}
          >
            {/* Marcadores de centro */}
            <div className="absolute left-1/2 -top-4 -translate-x-1/2 w-0.5 h-4 bg-blue-300/30" />
            <div className="absolute left-1/2 -bottom-4 -translate-x-1/2 w-0.5 h-4 bg-blue-300/30" />
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 h-0.5 w-4 bg-blue-300/30" />
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 h-0.5 w-4 bg-blue-300/30" />

            {/* Líneas de guía */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-0 right-0 border-t border-blue-300/30" />
              <div className="absolute top-1/2 left-0 right-0 border-t border-blue-300/30" />
              <div className="absolute top-3/4 left-0 right-0 border-t border-blue-300/30" />
              <div className="absolute left-1/4 top-0 bottom-0 border-l border-blue-300/30" />
              <div className="absolute left-1/2 top-0 bottom-0 border-l border-blue-300/30" />
              <div className="absolute left-3/4 top-0 bottom-0 border-l border-blue-300/30" />
            </div>

            {/* Dimensiones del papel */}
            <div className="absolute -top-8 left-0 px-2 py-1 bg-white/80 
                           backdrop-blur-sm rounded-md shadow-sm border border-gray-200 whitespace-nowrap">
              <div className="text-xs font-medium text-gray-700">{paperFormat.name}</div>
              <div className="text-[10px] text-gray-500">
                {isLandscape ? 
                  `${paperFormat.height} × ${paperFormat.width}` : 
                  `${paperFormat.width} × ${paperFormat.height}`}
              </div>
            </div>

            {/* Bloques */}
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
      </div>
    </div>
  );
}