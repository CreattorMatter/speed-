import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { X, Move, Lock, Unlock } from 'lucide-react';
import { Block } from '../../types/builder';
import { renderBlockContent } from '../../utils/blockRenderer';
import 'react-resizable/css/styles.css';

interface CanvasProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [lockedBlocks, setLockedBlocks] = useState<Set<string>>(new Set());
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const gridSize = 20;

  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;

  const handleDrag = (id: string, data: { x: number; y: number }) => {
    if (lockedBlocks.has(id)) return;

    setBlocks(prevBlocks => prevBlocks.map(block => 
      block.id === id 
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

  const handleResize = (id: string, size: { width: number; height: number }) => {
    if (lockedBlocks.has(id)) return;

    setBlocks(prevBlocks => prevBlocks.map(block =>
      block.id === id
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

  const toggleLock = (id: string) => {
    setLockedBlocks(prev => {
      const newLocked = new Set(prev);
      if (newLocked.has(id)) {
        newLocked.delete(id);
      } else {
        newLocked.add(id);
      }
      return newLocked;
    });
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
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      >
        {blocks.map((block) => (
          <Draggable
            key={block.id}
            defaultPosition={block.position}
            onStop={(_, data) => handleDrag(block.id, data)}
            grid={[gridSize, gridSize]}
            bounds="parent"
            handle=".handle"
            disabled={lockedBlocks.has(block.id)}
          >
            <div className="absolute">
              <ResizableBox
                width={block.size.width}
                height={block.size.height}
                onResizeStop={(e, { size }) => handleResize(block.id, size)}
                minConstraints={[gridSize * 5, gridSize * 5]}
                maxConstraints={[gridSize * 40, gridSize * 30]}
                resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']}
                grid={[gridSize, gridSize]}
                draggableOpts={{ grid: [gridSize, gridSize] }}
                className={`${selectedBlock === block.id ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow w-full h-full">
                  <div className="handle h-8 bg-gray-50 rounded-t-lg border-b border-gray-200 px-2 
                              flex items-center justify-between cursor-move">
                    <Move className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{block.type}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLock(block.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        {lockedBlocks.has(block.id) ? (
                          <Lock className="w-4 h-4 text-indigo-500" />
                        ) : (
                          <Unlock className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBlocks(prevBlocks => prevBlocks.filter(b => b.id !== block.id));
                        }}
                        className="p-1 hover:bg-red-50 rounded-full"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4" onClick={() => setSelectedBlock(block.id)}>
                    {renderBlockContent({
                      block,
                      isEditing: false,
                      onEdit: () => {},
                      onStartEdit: () => {},
                      onStopEdit: () => {},
                      onImageUpload: () => {},
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