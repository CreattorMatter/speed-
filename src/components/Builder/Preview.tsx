import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Block } from '../../types/builder';

interface PreviewProps {
  blocks: Block[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Preview({ blocks, isOpen, onClose }: PreviewProps) {
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

          <div className="p-6 bg-white min-h-[600px] relative">
            {blocks.map(block => (
              <div
                key={block.id}
                className={`absolute ${
                  block.isContainer 
                    ? 'border-2 border-dashed border-indigo-300 bg-indigo-50/10' 
                    : ''
                }`}
                style={{
                  left: block.position.x,
                  top: block.position.y,
                  width: block.size.width,
                  height: block.size.height,
                  zIndex: block.isContainer ? 0 : 1
                }}
              >
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
              </div>
            ))}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 