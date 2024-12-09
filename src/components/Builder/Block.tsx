import React, { useRef } from 'react';
import { X, Move, Image } from 'lucide-react';
import { ResizableBox } from 'react-resizable';
import { Block as BlockType } from '../../types/builder';
import { renderBlockContent } from '../../utils/blockRenderer';
import 'react-resizable/css/styles.css';

interface BlockProps {
  block: BlockType;
  onDelete: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onMove: (e: React.MouseEvent, id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  isSelected: boolean;
  onClick: () => void;
}

export const Block = React.memo(function Block({ 
  block, 
  onDelete, 
  onResize, 
  onMove,
  onImageUpload,
  isSelected,
  onClick 
}: BlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageUpload(block.id, file);
  };

  const renderContent = () => {
    switch (block.type) {
      case 'header':
      case 'footer':
      case 'logo':
      case 'image':
        return (
          <div className="w-full h-full relative group">
            {block.content?.imageUrl ? (
              <div className="relative w-full h-full">
                <img 
                  src={block.content.imageUrl} 
                  alt={block.type}
                  className="w-full h-full object-contain hover:object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                              transition-opacity flex items-center justify-center">
                  <button
                    onClick={handleImageClick}
                    className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 
                             transition-colors text-sm font-medium"
                  >
                    Cambiar imagen
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleImageClick}
                className="w-full h-full flex flex-col items-center justify-center bg-gray-50 
                         hover:bg-gray-100 transition-colors border-2 border-dashed border-gray-300"
              >
                <Image className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-500 text-sm">
                  {block.type === 'header' ? 'Agregar encabezado' :
                   block.type === 'footer' ? 'Agregar pie de página' :
                   block.type === 'logo' ? 'Agregar logo' : 'Agregar imagen'}
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        );
      case 'sku':
        return <div className="text-lg font-medium">{block.content.text}</div>;
      case 'price':
        return <div className="text-2xl font-bold text-indigo-600">{block.content.text}</div>;
      case 'price-per-unit':
        return <div className="text-sm font-medium text-gray-600">{block.content.text}</div>;
      case 'points':
        return <div className="text-lg font-bold text-green-600">{block.content.text} pts</div>;
      case 'origin':
        return <div className="text-sm uppercase font-medium text-gray-500">{block.content.text}</div>;
      case 'barcode':
        return <div className="text-sm font-mono text-gray-800">{block.content.text}</div>;
      case 'brand':
        return <div className="text-lg font-bold text-gray-800">{block.content.text}</div>;
      case 'pack-unit':
        return <div className="text-sm font-medium text-gray-600">{block.content.text}</div>;
      default:
        return <div>{block.content.text}</div>;
    }
  };

  return (
    <div
      className={`absolute ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
      style={{
        left: block.position.x,
        top: block.position.y,
        width: block.size.width,
        height: block.size.height,
      }}
      onClick={onClick}
    >
      <ResizableBox
        width={block.size.width}
        height={block.size.height}
        onResize={(e, { size }) => onResize(block.id, size)}
        minConstraints={[100, 50]}
        maxConstraints={[1000, 600]}
        resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']}
      >
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow w-full h-full">
          <div 
            className="h-8 bg-gray-50 rounded-t-lg border-b border-gray-200 px-2 flex items-center justify-between cursor-move"
            onMouseDown={(e) => onMove(e, block.id)}
          >
            <span className="text-sm text-gray-600">{block.type}</span>
            <button
              onClick={() => onDelete(block.id)}
              className="p-1 hover:bg-red-50 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="p-4">
            {renderContent()}
          </div>
        </div>
      </ResizableBox>
    </div>
  );
}); 