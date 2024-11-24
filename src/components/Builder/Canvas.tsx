import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Move } from 'lucide-react';
import { Block, BlockType } from '../../types/builder';
import 'react-resizable/css/styles.css';

export default function Canvas() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('blockType') as BlockType;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

  return (
    <div
      className="flex-1 bg-white m-4 rounded-lg shadow-sm p-4 relative overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {blocks.map((block) => (
          <Draggable
            key={block.id}
            defaultPosition={block.position}
            bounds="parent"
            handle=".handle"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute ${selectedBlock === block.id ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => setSelectedBlock(block.id)}
            >
              <ResizableBox
                width={block.size?.width || 200}
                height={block.size?.height || 100}
                minConstraints={[100, 50]}
                maxConstraints={[500, 300]}
                onResize={(e, { size }) => {
                  const updatedBlocks = blocks.map(b =>
                    b.id === block.id ? { ...b, size } : b
                  );
                  setBlocks(updatedBlocks);
                }}
              >
                <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 p-4 h-full">
                  <div className="handle absolute top-0 left-0 w-full h-6 bg-gray-50 rounded-t-lg cursor-move flex items-center justify-between px-2">
                    <Move className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">{block.type}</span>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="p-1 hover:bg-red-50 rounded-full group"
                    >
                      <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                    </button>
                  </div>
                  <div className="mt-6">
                    {/* Contenido específico según el tipo de bloque */}
                    {renderBlockContent(block)}
                  </div>
                </div>
              </ResizableBox>
            </motion.div>
          </Draggable>
        ))}
      </AnimatePresence>
      
      {blocks.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full flex items-center justify-center"
        >
          <div className="text-center space-y-4">
            <div className="bg-indigo-50 rounded-full p-4 mx-auto w-fit">
              <Move className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-gray-500">
              Arrastra elementos aquí para construir tu plantilla
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function renderBlockContent(block: Block) {
  switch (block.type) {
    case 'header':
      return <div className="bg-gray-50 p-4 rounded">Header Content</div>;
    case 'footer':
      return <div className="bg-gray-50 p-4 rounded">Footer Content</div>;
    case 'sku':
      return <div className="font-mono text-gray-600">SKU-12345</div>;
    case 'image':
      return (
        <div className="bg-gray-100 rounded flex items-center justify-center h-full">
          <span className="text-gray-400">Image Placeholder</span>
        </div>
      );
    case 'price':
      return <div className="text-2xl font-bold text-gray-800">$99.99</div>;
    case 'discount':
      return <div className="text-red-500 font-semibold">-20%</div>;
    case 'promotion':
      return <div className="bg-yellow-50 text-yellow-800 p-2 rounded">¡Oferta especial!</div>;
    case 'logo':
      return (
        <div className="bg-gray-100 rounded p-4 flex items-center justify-center">
          <span className="text-gray-400">Logo</span>
        </div>
      );
    default:
      return null;
  }
}