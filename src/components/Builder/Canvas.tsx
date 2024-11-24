import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { X, Move } from 'lucide-react';
import { Block } from '../../types/builder';
import { renderBlockContent } from '../../utils/blockRenderer';
import 'react-resizable/css/styles.css';

interface CanvasProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const gridSize = 20;

  const handleDragStop = (blockId: string, data: { x: number; y: number }) => {
    setBlocks(blocks.map(block =>
      block.id === blockId
        ? { ...block, position: { x: data.x, y: data.y } }
        : block
    ));
  };

  const handleResize = (blockId: string, size: { width: number; height: number }) => {
    setBlocks(blocks.map(block =>
      block.id === blockId
        ? { ...block, size }
        : block
    ));
  };

  return (
    <div className="flex-1 bg-white m-4 rounded-lg shadow-xl p-4 relative min-h-[600px]">
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
              className={`absolute ${selectedBlock === block.id ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => setSelectedBlock(block.id)}
            >
              <ResizableBox
                width={block.size.width}
                height={block.size.height}
                onResize={(e, { size }) => handleResize(block.id, size)}
                minConstraints={[100, 50]}
                maxConstraints={[800, 600]}
                resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']}
              >
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full h-full">
                  <div className="handle absolute top-0 left-0 w-full h-6 bg-gray-50 rounded-t-lg cursor-move 
                                flex items-center justify-between px-2">
                    <Move className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">{block.type}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBlocks(blocks.filter(b => b.id !== block.id));
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
                      onEdit: (id, text) => {
                        setBlocks(blocks.map(b =>
                          b.id === id
                            ? { ...b, content: { ...b.content, text } }
                            : b
                        ));
                      },
                      onStartEdit: (id) => setEditingText(id),
                      onStopEdit: () => setEditingText(null),
                      onImageUpload: (id, file) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          if (e.target?.result) {
                            setBlocks(blocks.map(b =>
                              b.id === id
                                ? { ...b, content: { ...b.content, imageUrl: e.target.result as string } }
                                : b
                            ));
                          }
                        };
                        reader.readAsDataURL(file);
                      },
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