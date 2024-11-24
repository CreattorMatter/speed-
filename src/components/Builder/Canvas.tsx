import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Move, Edit2, Upload } from 'lucide-react';
import { Block, BlockType } from '../../types/builder';

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
    e.dataTransfer.dropEffect = 'move';
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

  const handleDragStop = (blockId: string, data: { x: number; y: number }) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId
        ? { ...block, position: { x: data.x, y: data.y } }
        : block
    );
    setBlocks(updatedBlocks);
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
      style={{ 
        minHeight: '600px', 
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>
        {blocks.map((block) => (
          <Draggable
            key={block.id}
            defaultPosition={block.position}
            onStop={(e, data) => handleDragStop(block.id, data)}
            bounds="parent"
            handle=".handle"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`absolute ${selectedBlock === block.id ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => setSelectedBlock(block.id)}
              style={{ 
                position: 'absolute',
                zIndex: selectedBlock === block.id ? 10 : 1,
                width: block.size?.width,
                height: block.size?.height,
              }}
            >
              <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full h-full">
                <div className="handle absolute top-0 left-0 w-full h-6 bg-gray-50 rounded-t-lg cursor-move 
                              flex items-center justify-between px-2">
                  <Move className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">{block.type}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBlock(block.id);
                    }}
                    className="p-1 hover:bg-red-50 rounded-full group"
                  >
                    <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                  </button>
                </div>
                <div className="mt-6 p-4 overflow-auto">
                  {renderBlockContent(block)}
                </div>
              </div>
            </motion.div>
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