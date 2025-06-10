import React, { useState, useCallback, useRef, memo, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Block } from './Block';
import Rulers from './Rulers';
import { Block as BlockType, PaperFormat } from '../../types/builder';
import { PAPER_FORMATS } from '../../constants/paperFormats';
import '../../styles/scrollbar.css';
import { BlockSize, BlockPosition } from './types/block';
import { DraggableBlock } from './DraggableBlock';
import { DroppableCanvas } from './DroppableCanvas';

interface CanvasProps {
  blocks: BlockType[];
  onDeleteBlock: (index: number) => void;
  onResizeBlock: (index: number, size: BlockSize) => void;
  onMoveBlock: (index: number, position: BlockPosition) => void;
  onImageUpload: (index: number, imageUrl: string) => void;
  onAddBlock: (blockType: string, position: { x: number; y: number }) => void;
  selectedFormat?: PaperFormat;
  isLandscape?: boolean;
  scale: number;
  canvasRef?: React.RefObject<HTMLDivElement>;
  setScale?: (scale: number) => void;
  zoom: number;
  selectedFormat: PaperFormat;
  posterSize?: { width: number; height: number; name: string };
}

const Canvas: React.FC<CanvasProps> = ({
  blocks,
  onDeleteBlock,
  onResizeBlock,
  onMoveBlock,
  onImageUpload,
  onAddBlock,
  selectedFormat = PAPER_FORMATS[2], // A4 por defecto
  isLandscape = false,
  scale = 1,
  canvasRef,
  setScale,
  zoom,
  selectedFormat: selectedFormatProp,
  posterSize
}) => {
  const localCanvasRef = useRef<HTMLDivElement>(null);
  const finalCanvasRef = canvasRef || localCanvasRef;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedFromPanel, setDraggedFromPanel] = useState<string | null>(null);
  const GRID_SIZE = 20;
  const RULER_SIZE = 20;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Detectar si se arrastra desde el panel de herramientas
    if (typeof active.id === 'string' && active.id.startsWith('tool-')) {
      setDraggedFromPanel(active.id.replace('tool-', ''));
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    setActiveId(null);
    setDraggedFromPanel(null);

    if (!over) return;

    // Si se arrastra desde el panel de herramientas al canvas
    if (typeof active.id === 'string' && active.id.startsWith('tool-') && over.id === 'canvas-drop-zone') {
      const blockType = active.id.replace('tool-', '');
      const canvasRect = finalCanvasRef.current?.getBoundingClientRect();
      
      if (canvasRect) {
        const position = {
          x: Math.max(0, (event.activatorEvent.clientX - canvasRect.left) / scale - RULER_SIZE),
          y: Math.max(0, (event.activatorEvent.clientY - canvasRect.top) / scale - RULER_SIZE)
        };
        
        onAddBlock(blockType, position);
      }
      return;
    }

    // Si se mueve un bloque existente dentro del canvas
    if (over.id === 'canvas-drop-zone' && typeof active.id === 'string' && !active.id.startsWith('tool-')) {
      const blockIndex = blocks.findIndex(block => block.id === active.id);
      if (blockIndex !== -1 && delta) {
        const currentBlock = blocks[blockIndex];
        onMoveBlock(blockIndex, {
          x: currentBlock.position.x + delta.x / scale,
          y: currentBlock.position.y + delta.y / scale
        });
      }
    }
  }, [blocks, onAddBlock, onMoveBlock, finalCanvasRef, scale]);

  const handleDelete = useCallback((id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index !== -1) {
      onDeleteBlock(index);
    }
  }, [blocks, onDeleteBlock]);

  const handleResize = useCallback((id: string, size: { width: number; height: number }) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index !== -1) {
      onResizeBlock(index, size);
    }
  }, [blocks, onResizeBlock]);

  const handleImageUpload = useCallback((index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type. Please upload an image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageUpload(index, e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const handleMove = useCallback((id: string, position: { x: number; y: number }) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index !== -1) {
      onMoveBlock(index, position);
    }
  }, [blocks, onMoveBlock]);

  // Calcular el tamaño del papel en píxeles
  const paperWidth = isLandscape ? selectedFormatProp.height : selectedFormatProp.width;
  const paperHeight = isLandscape ? selectedFormatProp.width : selectedFormatProp.height;

  // Ordenar los bloques para que los contenedores se rendericen primero
  const sortedBlocks = React.useMemo(() => {
    return [...blocks].sort((a, b) => {
      if (a.isContainer && !b.isContainer) return -1;
      if (!a.isContainer && b.isContainer) return 1;
      return 0;
    });
  }, [blocks]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div 
        id="builder-canvas-area"
        className="h-full w-full relative bg-gray-50 flex flex-col overflow-hidden"
      >
        {/* Rulers - Fijos en la parte superior */}
        <div className="flex-shrink-0">
          <Rulers gridSize={GRID_SIZE * scale} />
        </div>

        {/* Canvas Container con Scroll */}
        <div 
          ref={finalCanvasRef}
          className="flex-1 builder-canvas-container bg-gray-100 relative"
          style={{
            minHeight: '100%',
            background: 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        >
          <DroppableCanvas>
            {/* Canvas Paper */}
            <div
              className="relative bg-white shadow-2xl mx-auto my-8 border border-gray-300 canvas-wrapper"
              style={{
                width: `${paperWidth}px`,
                height: `${paperHeight}px`,
                minWidth: `${Math.max(paperWidth, 400)}px`,
                minHeight: `${Math.max(paperHeight, 600)}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'center top',
                marginTop: `${Math.max(40, 40 * scale)}px`,
                marginBottom: `${Math.max(40, 40 * scale)}px`,
              }}
            >
              {/* Paper Info Badge */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-t-lg shadow text-sm font-medium flex items-center gap-2">
                <span>{selectedFormatProp.name}</span>
                <span className="text-blue-200">•</span>
                <span className="text-blue-200">{selectedFormatProp.originalSize}</span>
                <span className="text-blue-200">•</span>
                <span className="text-blue-200">{Math.round(scale * 100)}%</span>
              </div>

              {/* Grid Pattern */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                    linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE * 5}px ${GRID_SIZE * 5}px, ${GRID_SIZE * 5}px ${GRID_SIZE * 5}px`
                }}
              />

              {/* Elementos en el Canvas */}
              <div className="relative w-full h-full">
                {sortedBlocks.length > 0 ? (
                  sortedBlocks.map((block, index) => (
                    <DraggableBlock
                      key={block.id}
                      block={block}
                      index={index}
                      onDelete={handleDelete}
                      onResize={handleResize}
                      onImageUpload={handleImageUpload}
                      onMove={handleMove}
                      isDragging={activeId === block.id}
                    />
                  ))
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-4">📄</div>
                      <div className="text-xl font-medium mb-2">Canvas Vacío</div>
                      <div className="text-sm">Arrastra elementos desde el sidebar para comenzar</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DroppableCanvas>
        </div>

        {/* Controles de Zoom - Flotantes */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2 z-10 zoom-controls">
          <button
            onClick={() => setScale && setScale(Math.max(0.25, scale - 0.1))}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
            title="Zoom Out"
          >
            −
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale && setScale(Math.min(2, scale + 0.1))}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
            title="Zoom In"
          >
            +
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => setScale && setScale(1)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            title="Reset Zoom"
          >
            Fit
          </button>
        </div>

        {/* Stats Bar - Flotante */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-4 text-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="font-medium">{sortedBlocks.length}</span>
            <span className="text-gray-500">elementos</span>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div className="text-gray-600">
            {paperWidth} × {paperHeight}px
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && draggedFromPanel ? (
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 shadow-lg">
              <div className="text-blue-700 font-medium">{draggedFromPanel}</div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

Canvas.displayName = 'Canvas';

export default Canvas;