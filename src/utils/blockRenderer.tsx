import React from 'react';
import { Block } from '../types/builder';
import { Edit2, Upload } from 'lucide-react';

interface RenderBlockContentProps {
  block: Block;
  isEditing: boolean;
  onEdit: (blockId: string, text: string) => void;
  onStartEdit: (blockId: string) => void;
  onStopEdit: () => void;
  onImageUpload: (blockId: string, file: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const renderBlockContent = ({
  block,
  isEditing,
  onEdit,
  onStartEdit,
  onStopEdit,
  onImageUpload,
  fileInputRef
}: RenderBlockContentProps) => {
  switch (block.type) {
    case 'header':
    case 'footer':
      return (
        <div className="relative group">
          {block.content?.imageUrl ? (
            <img 
              src={block.content.imageUrl} 
              alt={block.type}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div 
              className="bg-gray-100 rounded flex flex-col items-center justify-center h-full min-h-[100px] cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-400 text-sm">Click para subir imagen</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload(block.id, file);
            }}
          />
        </div>
      );

    case 'sku':
    case 'price':
    case 'discount':
    case 'promotion':
      return (
        <div className="relative group">
          {isEditing ? (
            <input
              type="text"
              value={block.content?.text || ''}
              onChange={(e) => onEdit(block.id, e.target.value)}
              onBlur={onStopEdit}
              autoFocus
              className="w-full p-2 border rounded"
            />
          ) : (
            <>
              <span className={`
                ${block.type === 'price' ? 'text-2xl font-bold text-gray-800' : ''}
                ${block.type === 'discount' ? 'text-red-500 font-semibold' : ''}
                ${block.type === 'promotion' ? 'bg-yellow-50 text-yellow-800 p-2 rounded' : ''}
                ${block.type === 'sku' ? 'font-mono text-gray-600' : ''}
              `}>
                {block.content?.text || getDefaultText(block.type)}
              </span>
              <button
                onClick={() => onStartEdit(block.id)}
                className="absolute -right-6 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-4 h-4 text-gray-400" />
              </button>
            </>
          )}
        </div>
      );

    case 'image':
    case 'logo':
      return (
        <div className="relative group">
          {block.content?.imageUrl ? (
            <img 
              src={block.content.imageUrl} 
              alt="Content"
              className="w-full h-full object-contain rounded"
            />
          ) : (
            <div 
              className="bg-gray-100 rounded flex flex-col items-center justify-center h-full min-h-[100px] cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-400 text-sm">
                {block.type === 'logo' ? 'Subir logo' : 'Subir imagen'}
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload(block.id, file);
            }}
          />
        </div>
      );

    default:
      return null;
  }
};

function getDefaultText(blockType: string): string {
  switch (blockType) {
    case 'sku':
      return 'SKU-12345';
    case 'price':
      return '$99.99';
    case 'discount':
      return '-20%';
    case 'promotion':
      return '¡Oferta especial!';
    default:
      return '';
  }
} 