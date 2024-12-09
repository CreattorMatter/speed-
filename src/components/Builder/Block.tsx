import React, { useState, useRef, useEffect } from 'react';
import { X, Move, Image, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { ResizableBox } from 'react-resizable';
import { Block as BlockType, BlockContent } from '../../types/builder';
import 'react-resizable/css/styles.css';

interface BlockProps {
  block: BlockType;
  onDelete: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onMove: (e: React.MouseEvent, id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  onTextChange: (id: string, updates: Partial<BlockContent>) => void;
  isSelected: boolean;
  onClick: () => void;
}

export const Block = React.memo(function Block({ 
  block, 
  onDelete, 
  onResize, 
  onMove,
  onImageUpload,
  onTextChange,
  isSelected,
  onClick 
}: BlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && block.type !== 'image' && block.type !== 'logo') {
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  }, [isSelected, block.type]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageUpload(block.id, file);
  };

  const handleDoubleClick = () => {
    if (!['image', 'logo'].includes(block.type)) {
      setIsEditing(true);
      setShowToolbar(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (textRef.current) {
      onTextChange(block.id, { text: textRef.current.innerText });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textRef.current?.blur();
    }
  };

  const toggleStyle = (style: 'bold' | 'italic') => {
    onTextChange(block.id, { [style]: !block.content[style] });
  };

  const setAlignment = (align: 'left' | 'center' | 'right') => {
    onTextChange(block.id, { align });
  };

  const changeFontSize = (delta: number) => {
    const currentSize = block.content.fontSize || 16;
    onTextChange(block.id, { fontSize: currentSize + delta });
  };

  const renderTextToolbar = () => {
    if (!showToolbar || ['image', 'logo'].includes(block.type)) return null;

    return (
      <div className="absolute -top-10 left-0 bg-white shadow-lg rounded-lg px-2 py-1 flex items-center gap-1 z-50">
        <button
          type="button"
          onClick={() => toggleStyle('bold')}
          className={`p-1 rounded hover:bg-gray-100 ${block.content.bold ? 'bg-gray-200' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => toggleStyle('italic')}
          className={`p-1 rounded hover:bg-gray-100 ${block.content.italic ? 'bg-gray-200' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={() => setAlignment('left')}
          className={`p-1 rounded hover:bg-gray-100 ${block.content.align === 'left' ? 'bg-gray-200' : ''}`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setAlignment('center')}
          className={`p-1 rounded hover:bg-gray-100 ${block.content.align === 'center' ? 'bg-gray-200' : ''}`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setAlignment('right')}
          className={`p-1 rounded hover:bg-gray-100 ${block.content.align === 'right' ? 'bg-gray-200' : ''}`}
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={() => changeFontSize(-1)}
          className="p-1 rounded hover:bg-gray-100"
        >
          A-
        </button>
        <button
          type="button"
          onClick={() => changeFontSize(1)}
          className="p-1 rounded hover:bg-gray-100"
        >
          A+
        </button>
      </div>
    );
  };

  const renderContent = () => {
    if (['image', 'logo'].includes(block.type)) {
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
                 'Agregar imagen'}
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
    }

    const textStyles = {
      fontWeight: block.content.bold ? 'bold' : 'normal',
      fontStyle: block.content.italic ? 'italic' : 'normal',
      textAlign: block.content.align || 'left',
      fontSize: `${block.content.fontSize || 16}px`,
    } as const;

    return (
      <div
        ref={textRef}
        contentEditable={isEditing}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full outline-none"
        style={textStyles}
        suppressContentEditableWarning
      >
        {block.content.text || 'Doble clic para editar'}
      </div>
    );
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
      {renderTextToolbar()}
      <ResizableBox
        width={block.size.width}
        height={block.size.height}
        onResize={(e, { size }) => onResize(block.id, size)}
        minConstraints={[50, 30]}
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