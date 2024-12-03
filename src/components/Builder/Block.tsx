import React from 'react';
import { X, Move } from 'lucide-react';
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
}

export const Block = React.memo(function Block({ 
  block, 
  onDelete, 
  onResize, 
  onMove,
  onImageUpload 
}: BlockProps) {
  const handleImageUploadWrapper = (file: File) => {
    onImageUpload(block.id, file);
  };

  return (
    <div
      className="absolute"
      style={{
        left: block.position.x,
        top: block.position.y,
      }}
    >
      <ResizableBox
        width={block.size.width}
        height={block.size.height}
        onResize={(e, { size }) => onResize(block.id, size)}
        minConstraints={[100, 50]}
        maxConstraints={[800, 600]}
        resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']}
      >
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow w-full h-full">
          <div 
            className="h-8 bg-gray-50 rounded-t-lg border-b border-gray-200 px-2 flex items-center justify-between cursor-move"
            onMouseDown={(e) => onMove(e, block.id)}
          >
            <Move className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{block.type}</span>
            <button
              onClick={() => onDelete(block.id)}
              className="p-1 hover:bg-red-50 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="p-4">
            {renderBlockContent({
              block,
              onImageUpload: handleImageUploadWrapper
            })}
          </div>
        </div>
      </ResizableBox>
    </div>
  );
}); 