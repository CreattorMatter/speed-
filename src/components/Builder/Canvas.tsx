import React, { useState, useRef, useEffect } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { X, Move } from 'lucide-react';
import { Block } from '../../types/builder';
import Rulers from './Rulers';

interface CanvasProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [guides, setGuides] = useState<{ x: number[], y: number[] }>({ x: [], y: [] });
  const canvasRef = useRef<HTMLDivElement>(null);
  const gridSize = 20;

  useEffect(() => {
    if (canvasRef.current) {
      setCanvasSize({
        width: canvasRef.current.clientWidth,
        height: canvasRef.current.clientHeight
      });
    }
  }, []);

  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;

  const updateGuides = (activeBlock: Block) => {
    const activeCenter = {
      x: activeBlock.position.x + activeBlock.size.width / 2,
      y: activeBlock.position.y + activeBlock.size.height / 2
    };

    const newGuides = { x: [] as number[], y: [] as number[] };

    blocks.forEach(block => {
      if (block.id !== activeBlock.id) {
        // Centro
        const blockCenter = {
          x: block.position.x + block.size.width / 2,
          y: block.position.y + block.size.height / 2
        };

        // Bordes
        const blockEdges = {
          left: block.position.x,
          right: block.position.x + block.size.width,
          top: block.position.y,
          bottom: block.position.y + block.size.height
        };

        const activeEdges = {
          left: activeBlock.position.x,
          right: activeBlock.position.x + activeBlock.size.width,
          top: activeBlock.position.y,
          bottom: activeBlock.position.y + activeBlock.size.height
        };

        // Alineación vertical
        if (Math.abs(blockCenter.x - activeCenter.x) < 5) newGuides.x.push(blockCenter.x);
        if (Math.abs(blockEdges.left - activeEdges.left) < 5) newGuides.x.push(blockEdges.left);
        if (Math.abs(blockEdges.right - activeEdges.right) < 5) newGuides.x.push(blockEdges.right);

        // Alineación horizontal
        if (Math.abs(blockCenter.y - activeCenter.y) < 5) newGuides.y.push(blockCenter.y);
        if (Math.abs(blockEdges.top - activeEdges.top) < 5) newGuides.y.push(blockEdges.top);
        if (Math.abs(blockEdges.bottom - activeEdges.bottom) < 5) newGuides.y.push(blockEdges.bottom);
      }
    });

    setGuides(newGuides);
  };

  const handleDrag = (blockId: string, e: DraggableEvent, data: DraggableData) => {
    const updatedBlocks = blocks.map(block => {
      if (block.id === blockId) {
        const newBlock = {
          ...block,
          position: {
            x: snapToGrid(data.x),
            y: snapToGrid(data.y)
          }
        };
        updateGuides(newBlock);
        return newBlock;
      }
      return block;
    });
    setBlocks(updatedBlocks);
  };

  const handleDragStop = () => {
    setGuides({ x: [], y: [] });
  };

  const handleDelete = (blockId: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
  };

  return (
    <div 
      ref={canvasRef}
      className="flex-1 bg-white m-4 rounded-lg shadow-lg relative min-h-[600px]"
      style={{ 
        paddingTop: '20px',
        paddingLeft: '20px'
      }}
    >
      <Rulers width={canvasSize.width - 20} height={canvasSize.height - 20} gridSize={gridSize} />

      <div 
        className="relative w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      >
        {/* Guías de alineación */}
        {guides.x.map((x, i) => (
          <div
            key={`guide-x-${i}`}
            className="absolute h-full w-px bg-indigo-500"
            style={{ left: x }}
          />
        ))}
        {guides.y.map((y, i) => (
          <div
            key={`guide-y-${i}`}
            className="absolute w-full h-px bg-indigo-500"
            style={{ top: y }}
          />
        ))}

        {blocks.map((block) => (
          <Draggable
            key={block.id}
            defaultPosition={block.position}
            grid={[gridSize, gridSize]}
            onDrag={(e, data) => handleDrag(block.id, e, data)}
            onStop={handleDragStop}
            bounds="parent"
            handle=".handle"
          >
            <div 
              className="absolute bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              style={{
                width: block.size.width,
                height: block.size.height,
              }}
            >
              <div className="handle h-8 bg-gray-50 rounded-t-lg border-b border-gray-200 px-2 
                            flex items-center justify-between cursor-move">
                <Move className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{block.type}</span>
                <button
                  onClick={() => handleDelete(block.id)}
                  className="p-1 hover:bg-red-50 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="p-4">
                {block.content.text || `Bloque ${block.type}`}
              </div>
            </div>
          </Draggable>
        ))}

        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Haz clic en los elementos del panel para agregarlos
          </div>
        )}
      </div>
    </div>
  );
}