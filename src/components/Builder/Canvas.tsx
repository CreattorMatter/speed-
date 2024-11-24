import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { X, Move } from 'lucide-react';
import { Block } from '../../types/builder';
import { renderBlockContent } from '../../utils/blockRenderer';
import 'react-resizable/css/styles.css';

interface CanvasProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const gridSize = 20;

  const handleDragStop = (blockId: string, data: { x: number; y: number }) => {
    const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;
    
    setBlocks((prevBlocks: Block[]) => prevBlocks.map((block: Block) =>
      block.id === blockId
        ? {
            ...block,
            position: {
              x: snapToGrid(data.x),
              y: snapToGrid(data.y)
            }
          }
        : block
    ));
  };

  const handleResize = (blockId: string, size: { width: number; height: number }) => {
    const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;
    
    setBlocks((prevBlocks: Block[]) => prevBlocks.map((block: Block) =>
      block.id === blockId
        ? {
            ...block,
            size: {
              width: snapToGrid(size.width),
              height: snapToGrid(size.height)
            }
          }
        : block
    ));
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks((prevBlocks: Block[]) => prevBlocks.filter((b: Block) => b.id !== blockId));
  };

  const handleTextEdit = (blockId: string, text: string) => {
    setBlocks((prevBlocks: Block[]) => prevBlocks.map((b: Block) =>
      b.id === blockId
        ? { ...b, content: { ...b.content, text } }
        : b
    ));
  };

  const handleImageUpload = (blockId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        setBlocks((prevBlocks: Block[]) => prevBlocks.map((b: Block) =>
          b.id === blockId
            ? { ...b, content: { ...b.content, imageUrl: e.target?.result as string } }
            : b
        ));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-white to-gray-50 m-4 rounded-xl shadow-xl p-4 relative min-h-[600px]">
      <div
        className="relative w-full h-full rounded-lg"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      >
        {blocks.map((block) => (
          <Draggable
            key={block.id}
            defaultPosition={block.position}
            onStop={(e, data) => handleDragStop(block.id, data)}
            grid={[gridSize, gridSize]}
            bounds="parent"
            handle=".handle"
          >
            <div 
              className={`absolute ${
                selectedBlock === block.id 
                  ? 'ring-2 ring-indigo-500 shadow-lg' 
                  : 'hover:ring-2 hover:ring-indigo-300'
              }`}
              onClick={() => setSelectedBlock(block.id)}
            >
              <ResizableBox
                width={block.size.width}
                height={block.size.height}
                onResize={(e, { size }) => handleResize(block.id, size)}
                minConstraints={[100, 50]}
                maxConstraints={[800, 600]}
                resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']}
                draggableOpts={{ grid: [gridSize, gridSize] }}
              >
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full h-full transition-shadow hover:shadow-xl">
                  <div className="handle absolute top-0 left-0 w-full h-6 bg-gray-50 rounded-t-lg cursor-move 
                                flex items-center justify-between px-2">
                    <Move className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">{block.type}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id);
                        setSelectedBlock(null);
                      }}
                      className="p-1 hover:bg-red-50 rounded-full"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="mt-6 p-4">
                    {renderBlockContent({
                      block,
                      isEditing: editingText === block.id,
                      onEdit: handleTextEdit,
                      onStartEdit: (id) => setEditingText(id),
                      onStopEdit: () => setEditingText(null),
                      onImageUpload: handleImageUpload,
                      fileInputRef: { current: fileInputRefs.current.get(block.id) || null }
                    })}
                  </div>
                </div>
              </ResizableBox>
            </div>
          </Draggable>
        ))}
      </div>
    </div>
  );
}