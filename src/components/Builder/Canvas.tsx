import React from 'react';
import { X, Move } from 'lucide-react';
import { Block } from '../../types/builder';

interface CanvasProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const handleDelete = (blockId: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
  };

  const handleMouseDown = (e: React.MouseEvent, blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const startX = e.clientX - block.position.x;
    const startY = e.clientY - block.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      setBlocks(prevBlocks => prevBlocks.map(b => {
        if (b.id === blockId) {
          return {
            ...b,
            position: {
              x: e.clientX - startX,
              y: e.clientY - startY
            }
          };
        }
        return b;
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex-1 bg-white m-4 rounded-lg shadow-lg p-4 relative min-h-[600px]">
      <div className="relative w-full h-full">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            style={{
              left: block.position.x,
              top: block.position.y,
              width: block.size.width,
              height: block.size.height,
            }}
          >
            <div 
              className="h-8 bg-gray-50 rounded-t-lg border-b border-gray-200 px-2 
                        flex items-center justify-between cursor-move"
              onMouseDown={(e) => handleMouseDown(e, block.id)}
            >
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