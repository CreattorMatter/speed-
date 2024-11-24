import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Move } from 'lucide-react';
import { Block, BlockType } from '../../types/builder';
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('blockType') as BlockType;
    
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    const newBlock: Block = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      content: {},
      position: { x, y },
      size: { width: 200, height: 100 }
    };

    setBlocks([...blocks, newBlock]);
  };

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

  return (
    <div
      className="flex-1 bg-white m-4 rounded-lg shadow-xl p-4 relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ minHeight: '600px' }}
    >
      <AnimatePresence>
        {blocks.map((block) => (
          <Draggable
            key={block.id}
            defaultPosition={block.position}
            handle=".handle"
          >
            <div className={`absolute ${selectedBlock === block.id ? 'ring-2 ring-indigo-500' : ''}`}>
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="handle absolute top-0 left-0 w-full h-6 bg-gray-50 rounded-t-lg cursor-move 
                              flex items-center justify-between px-2">
                  <Move className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">{block.type}</span>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
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
                    fileInputRef: fileInputRefs.current.get(block.id)
                  })}
                </div>
              </div>
            </div>
          </Draggable>
        ))}
      </AnimatePresence>

      {blocks.length === 0 && (
        <div className="h-full flex items-center justify-center text-gray-400">
          Arrastra elementos aquí para construir tu plantilla
        </div>
      )}
    </div>
  );
}