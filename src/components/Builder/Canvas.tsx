import React from 'react';
import { X, Move } from 'lucide-react';
import { Block } from '../../types/builder';
import { ResizableBox } from 'react-resizable';
import { renderBlockContent } from '../../utils/blockRenderer';
import 'react-resizable/css/styles.css';

interface CanvasProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const handleDelete = (blockId: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    e.dataTransfer.setData('blockId', blockId);
  };

  const handleDragStop = (blockId: string, position: { x: number; y: number }) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId 
          ? { ...block, position }
          : block
      )
    );
  };

  const handleResize = (blockId: string, size: { width: number; height: number }) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId 
          ? { ...block, size }
          : block
      )
    );
  };

  const handleImageUpload = (blockId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setBlocks(prevBlocks => 
          prevBlocks.map(block => 
            block.id === blockId 
              ? { ...block, content: { ...block.content, imageUrl: e.target.result as string } }
              : block
          )
        );
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 bg-white m-4 rounded-lg shadow-lg p-4 relative min-h-[600px]">
      <div 
        className="relative w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `20px 20px`,
        }}
      >
        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute"
            style={{
              left: block.position.x,
              top: block.position.y,
            }}
          >
            <ResizableBox
              width={block.size.width}
              height={block.size.height}
              onResize={(e, { size }) => handleResize(block.id, size)}
              minConstraints={[100, 50]}
              maxConstraints={[800, 600]}
              resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']}
            >
              <div 
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow w-full h-full"
                draggable
                onDragStart={(e) => handleDragStart(e, block.id)}
              >
                <div 
                  className="h-8 bg-gray-50 rounded-t-lg border-b border-gray-200 px-2 
                            flex items-center justify-between cursor-move"
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
                  {renderBlockContent({
                    block,
                    onImageUpload: handleImageUpload
                  })}
                </div>
              </div>
            </ResizableBox>
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