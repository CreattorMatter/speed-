import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { X, Move } from 'lucide-react';
import { Block } from '../../types/builder';
import { renderBlockContent } from '../../utils/blockRenderer';

interface CanvasProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setSelectedBlock(null);
  };

  const handleTextEdit = (blockId: string, newText: string) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, content: { ...block.content, text: newText } }
        : block
    ));
  };

  const handleImageUpload = (blockId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBlocks(blocks.map(block => 
        block.id === blockId 
          ? { ...block, content: { ...block.content, imageUrl: e.target?.result } }
          : block
      ));
    };
    reader.readAsDataURL(file);
  };

  const handleDragStop = (blockId: string, data: { x: number; y: number }) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, position: { x: data.x, y: data.y } }
        : block
    ));
  };

  return (
    <div className="flex-1 bg-white m-4 rounded-lg shadow-xl p-4 relative min-h-[600px]">
      {blocks.map((block) => (
        <Draggable
          key={block.id}
          defaultPosition={block.position}
          onStop={(e, data) => handleDragStop(block.id, data)}
          bounds="parent"
          handle=".handle"
        >
          <div 
            className={`absolute ${selectedBlock === block.id ? 'ring-2 ring-indigo-500' : ''}`}
            onClick={() => setSelectedBlock(block.id)}
          >
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="handle absolute top-0 left-0 w-full h-6 bg-gray-50 rounded-t-lg cursor-move 
                            flex items-center justify-between px-2">
                <Move className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-600">{block.type}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBlock(block.id);
                  }}
                  className="p-1 hover:bg-red-50 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="mt-6 p-4" style={{ width: block.size?.width, height: block.size?.height }}>
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
          </div>
        </Draggable>
      ))}

      {blocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          Haz clic en los elementos para agregarlos a la plantilla
        </div>
      )}
    </div>
  );
}