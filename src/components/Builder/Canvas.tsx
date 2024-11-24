import React from 'react';
import Draggable from 'react-draggable';
import { X, Move } from 'lucide-react';
import { Block } from '../../types/builder';

interface CanvasProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const handleDragStop = (_e: any, data: { x: number; y: number }, blockId: string) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId 
          ? { ...block, position: { x: data.x, y: data.y } }
          : block
      )
    );
  };

  const handleDelete = (blockId: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
  };

  return (
    <div className="flex-1 bg-white m-4 rounded-lg shadow-lg p-4 relative min-h-[600px]">
      <div className="relative w-full h-full">
        {blocks.map((block) => (
          <Draggable
            key={block.id}
            defaultPosition={block.position}
            onStop={(e, data) => handleDragStop(e, data, block.id)}
            bounds="parent"
            handle=".handle"
          >
            <div 
              className="absolute bg-white rounded-lg border border-gray-200 shadow-sm"
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