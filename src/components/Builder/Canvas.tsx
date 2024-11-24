import React, { useState } from 'react';
import { Block, BlockType } from '../../types/builder';

export default function Canvas() {
  const [blocks, setBlocks] = useState<Block[]>([]);

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
    };

    setBlocks([...blocks, newBlock]);
  };

  return (
    <div
      className="flex-1 bg-white m-4 rounded-lg shadow-sm p-4 relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {blocks.map((block) => (
        <div
          key={block.id}
          className="absolute p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
          style={{
            left: block.position.x,
            top: block.position.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="text-sm font-medium text-gray-600">{block.type}</div>
        </div>
      ))}
      {blocks.length === 0 && (
        <div className="h-full flex items-center justify-center text-gray-400">
          Arrastra elementos aquí para construir tu plantilla
        </div>
      )}
    </div>
  );
}