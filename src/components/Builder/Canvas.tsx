import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { X, Move } from 'lucide-react';
import { Block } from '../../types/builder';
import { renderBlockContent } from '../../utils/blockRenderer';

interface CanvasProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

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
    setSelectedBlock(null);
  };

  const handleContentChange = (blockId: string, content: any) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId 
          ? { ...block, content: { ...block.content, ...content } }
          : block
      )
    );
  };

  return (
    <div className="flex-1 bg-white m-4 rounded-lg shadow-lg p-4 relative min-h-[600px]">
      {blocks.map((block) => (
        <Draggable
          key={block.id}
          defaultPosition={block.position}
          onStop={(_e, data) => handleDragStop(_e, data, block.id)}
          bounds="parent"
          handle=".handle"
        >
          <div 
            className={`absolute bg-white rounded-lg border ${
              selectedBlock === block.id ? 'border-indigo-500' : 'border-gray-200'
            } shadow-sm hover:shadow-md transition-shadow`}
            style={{
              width: block.size.width,
              height: block.size.height,
            }}
          >
            {/* Barra de control */}
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

            {/* Contenido del bloque */}
            <div className="p-4" onClick={() => setSelectedBlock(block.id)}>
              {renderBlockContent({
                block,
                onEdit: (id, text) => handleContentChange(id, { text }),
                onImageUpload: (id, file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    handleContentChange(id, { imageUrl: e.target?.result });
                  };
                  reader.readAsDataURL(file);
                },
                fileInputRef: { current: fileInputRefs.current.get(block.id) || null }
              })}
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
  );
}