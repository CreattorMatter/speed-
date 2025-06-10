import React, { useState, useCallback, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Block } from '../../types/builder';
import { DraggableBlock } from './DraggableBlock';

interface UnifiedCanvasProps {
  children?: React.ReactNode;
  blocks: Block[];
  onDeleteBlock: (id: string) => void;
  onResizeBlock: (id: string, size: { width: number; height: number }) => void;
  onImageUpload: (index: number, file: File) => void;
  showGrid?: boolean;
  showRulers?: boolean;
  zoom?: number;
}

export const UnifiedCanvas: React.FC<UnifiedCanvasProps> = ({
  children,
  blocks,
  onDeleteBlock,
  onResizeBlock,
  onImageUpload,
  showGrid = true,
  showRulers = true,
  zoom = 100
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas',
  });

  const GRID_SIZE = 20;
  const PAPER_WIDTH = 210 * 4; // A4 en mm * escala
  const PAPER_HEIGHT = 297 * 4;

  const getGridBackground = () => {
    if (!showGrid) return '';
    
    return `
      linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
      linear-gradient(to right, rgba(99, 102, 241, 0.2) ${GRID_SIZE}px, transparent ${GRID_SIZE}px),
      linear-gradient(to bottom, rgba(99, 102, 241, 0.2) ${GRID_SIZE}px, transparent ${GRID_SIZE}px)
    `;
  };

  const getGridBackgroundSize = () => {
    if (!showGrid) return '';
    return `${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE * 5}px ${GRID_SIZE * 5}px, ${GRID_SIZE * 5}px ${GRID_SIZE * 5}px`;
  };

  return (
    <div className="w-full h-full relative bg-gray-200 overflow-auto">
      {/* Rulers */}
      {showRulers && (
        <>
          {/* Horizontal Ruler */}
          <div className="absolute top-0 left-8 right-0 h-8 bg-white border-b border-gray-300 z-20">
            <div className="relative h-full">
              {Array.from({ length: Math.ceil(PAPER_WIDTH / 50) }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 border-l border-gray-400"
                  style={{ left: i * 50 * (zoom / 100) }}
                >
                  <span className="text-xs text-gray-600 ml-1">
                    {i * 50}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Vertical Ruler */}
          <div className="absolute top-8 left-0 bottom-0 w-8 bg-white border-r border-gray-300 z-20">
            <div className="relative w-full h-full">
              {Array.from({ length: Math.ceil(PAPER_HEIGHT / 50) }, (_, i) => (
                <div
                  key={i}
                  className="absolute left-0 border-t border-gray-400"
                  style={{ top: i * 50 * (zoom / 100) }}
                >
                  <span className="text-xs text-gray-600 ml-1 writing-mode-vertical">
                    {i * 50}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Corner */}
          <div className="absolute top-0 left-0 w-8 h-8 bg-gray-100 border-r border-b border-gray-300 z-30" />
        </>
      )}

      {/* Canvas Container */}
      <div
        className={`${showRulers ? 'ml-8 mt-8' : ''} w-full h-full relative p-8`}
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: '0 0',
          minWidth: `${PAPER_WIDTH + 100}px`,
          minHeight: `${PAPER_HEIGHT + 100}px`
        }}
      >
        {/* Paper */}
        <div
          ref={setNodeRef}
          className={`
            relative bg-white shadow-xl mx-auto
            transition-all duration-200
            ${isOver ? 'ring-4 ring-blue-300 ring-opacity-50' : ''}
          `}
          style={{
            width: PAPER_WIDTH,
            height: PAPER_HEIGHT,
            backgroundImage: getGridBackground(),
            backgroundSize: getGridBackgroundSize(),
          }}
        >
          {/* Drop Zone Indicator */}
          {isOver && (
            <div className="absolute inset-0 bg-blue-50 bg-opacity-30 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-50 pointer-events-none">
              <div className="bg-white px-6 py-3 rounded-lg shadow-lg text-blue-600 font-medium flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                Suelta aquí para agregar elemento
              </div>
            </div>
          )}

          {/* Format Label */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-t-lg shadow-sm border border-b-0 border-gray-200">
            <span className="text-sm font-medium text-gray-700">A4</span>
            <span className="text-xs text-gray-500 ml-2">(210 × 297mm)</span>
          </div>

          {/* Blocks */}
          {blocks.map((block, index) => (
            <DraggableBlock
              key={block.id}
              block={block}
              index={index}
              onDelete={onDeleteBlock}
              onResize={onResizeBlock}
              onImageUpload={onImageUpload}
            />
          ))}

          {/* Children (for additional content) */}
          {children}
        </div>
      </div>
    </div>
  );
}; 