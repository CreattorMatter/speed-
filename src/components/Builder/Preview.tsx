import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Block } from '../../types/builder';

interface PreviewProps {
  blocks: Block[];
  isOpen: boolean;
  onClose: () => void;
}

// Función utilitaria para calcular bounds y escala
const calculateBoundsAndScale = (blocks: Block[]) => {
  if (blocks.length === 0) {
    return { bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }, scale: 1 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  blocks.forEach(block => {
    minX = Math.min(minX, block.position.x);
    minY = Math.min(minY, block.position.y);
    maxX = Math.max(maxX, block.position.x + block.size.width);
    maxY = Math.max(maxY, block.position.y + block.size.height);
  });

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const scaleX = 800 / contentWidth;
  const scaleY = 600 / contentHeight;
  const scale = Math.min(scaleX, scaleY, 1);

  return {
    bounds: { minX, minY, maxX, maxY },
    scale
  };
};

export default function Preview({ blocks, isOpen, onClose }: PreviewProps) {
  const [previewBounds, setPreviewBounds] = useState({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const { bounds, scale } = calculateBoundsAndScale(blocks);
    setPreviewBounds(bounds);
    setScale(scale);
  }, [blocks]);

  const renderBlock = (block: Block) => (
    <div
      key={block.id}
      className={`absolute ${
        block.isContainer 
          ? 'border-2 border-dashed border-indigo-300 bg-indigo-50/10' 
          : ''
      }`}
      style={{
        left: (block.position.x - previewBounds.minX) * scale,
        top: (block.position.y - previewBounds.minY) * scale,
        width: block.size.width * scale,
        height: block.size.height * scale,
        zIndex: block.isContainer ? 0 : 1,
        transform: `scale(${scale})`
      }}
    >
      {block.isContainer && (
        <div className="absolute -top-6 left-0 text-xs text-indigo-500 font-medium bg-white px-2 py-1 rounded-t-md border border-indigo-200">
          Contenedor
        </div>
      )}

      {block.content.imageUrl ? (
        <img 
          src={block.content.imageUrl} 
          alt={`Contenido de ${block.type}`}
          className="w-full h-full object-contain"
        />
      ) : (
        !block.isContainer && (
          <div className="w-full h-full flex items-center justify-center">
            {block.content.text}
          </div>
        )
      )}

      {block.isContainer && blocks
        .filter(b => b.parentId === block.id)
        .map(childBlock => renderBlock(childBlock))}
    </div>
  );

  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.isContainer && !b.isContainer) return -1;
    if (!a.isContainer && b.isContainer) return 1;
    return 0;
  });

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-start p-4 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Vista Previa
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 bg-white h-[600px] relative overflow-hidden flex items-center justify-center">
            <div 
              className="relative"
              style={{
                width: (previewBounds.maxX - previewBounds.minX) * scale,
                height: (previewBounds.maxY - previewBounds.minY) * scale,
              }}
            >
              {sortedBlocks
                .filter(block => !block.parentId)
                .map(block => renderBlock(block))}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 