import React, { useState, useEffect, useRef } from 'react';
import { X, Move } from 'lucide-react';
import { Block } from '../../types/builder';
import { ResizableBox } from 'react-resizable';
import { PAPER_SIZES, MM_TO_PX } from '../../utils/paperSizes';
import 'react-resizable/css/styles.css';
import { renderBlockContent } from '../../utils/blockRenderer';

interface CanvasProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectedPaperSize, setSelectedPaperSize] = useState<keyof typeof PAPER_SIZES>('A4');
  const canvasRef = useRef<HTMLDivElement>(null);
  const gridSize = 20;

  // Actualizar tamaño del canvas según la resolución
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        setCanvasSize({
          width: viewportWidth - 400, // Restamos espacio para paneles laterales
          height: viewportHeight - 150 // Restamos espacio para header y toolbar
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const handleDelete = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
  };

  const handleMouseDown = (e: React.MouseEvent, blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const blockElement = e.currentTarget as HTMLDivElement;
    const startX = e.clientX - block.position.x;
    const startY = e.clientY - block.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.round((e.clientX - startX) / gridSize) * gridSize;
      const newY = Math.round((e.clientY - startY) / gridSize) * gridSize;

      blockElement.style.left = `${newX}px`;
      blockElement.style.top = `${newY}px`;
    };

    const handleMouseUp = () => {
      const finalX = parseInt(blockElement.style.left);
      const finalY = parseInt(blockElement.style.top);

      setBlocks(prevBlocks => prevBlocks.map(b => 
        b.id === blockId 
          ? { ...b, position: { x: finalX, y: finalY } }
          : b
      ));

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (blockId: string, size: { width: number; height: number }) => {
    const snappedSize = {
      width: Math.round(size.width / gridSize) * gridSize,
      height: Math.round(size.height / gridSize) * gridSize
    };
    
    setBlocks(prevBlocks => prevBlocks.map(block => 
      block.id === blockId 
        ? { ...block, size: snappedSize }
        : block
    ));
  };

  const getPaperSizeInPixels = (paperSize: keyof typeof PAPER_SIZES) => {
    const size = PAPER_SIZES[paperSize];
    return {
      width: Math.round(size.width * MM_TO_PX),
      height: Math.round(size.height * MM_TO_PX)
    };
  };

  const handleImageUpload = (blockId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setBlocks(prevBlocks => prevBlocks.map(block => 
          block.id === blockId 
            ? { ...block, content: { ...block.content, imageUrl: e.target.result as string } }
            : block
        ));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      ref={canvasRef}
      className="flex-1 bg-white m-4 rounded-lg shadow-xl relative overflow-auto"
      style={{ 
        minHeight: '600px',
        height: canvasSize.height,
      }}
    >
      {/* Selector de tamaño de papel */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {(Object.keys(PAPER_SIZES) as Array<keyof typeof PAPER_SIZES>).map((size) => (
          <button
            key={size}
            onClick={() => setSelectedPaperSize(size)}
            className={`px-3 py-1 rounded text-sm ${
              selectedPaperSize === size
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {PAPER_SIZES[size].name}
          </button>
        ))}
      </div>

      {/* Área de trabajo con cuadrícula */}
      <div
        className="relative w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      >
        {/* Guías de tamaño de papel */}
        {(Object.keys(PAPER_SIZES) as Array<keyof typeof PAPER_SIZES>).map((size) => {
          const paperSize = getPaperSizeInPixels(size);
          return (
            <div
              key={size}
              className={`absolute border-2 ${
                selectedPaperSize === size ? 'border-indigo-500' : 'border-gray-300'
              } border-dashed pointer-events-none`}
              style={{
                width: paperSize.width,
                height: paperSize.height,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: selectedPaperSize === size ? 1 : 0.3
              }}
            >
              <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs
                ${selectedPaperSize === size ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                {PAPER_SIZES[size].name}
              </div>
            </div>
          );
        })}

        {/* Bloques */}
        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute"
            style={{
              left: block.position.x,
              top: block.position.y,
            }}
          >
            <ResizableBox
              width={block.size.width}
              height={block.size.height}
              onResize={(e, { size }) => handleResize(block.id, size)}
              minConstraints={[gridSize * 5, gridSize * 3]}
              maxConstraints={[gridSize * 40, gridSize * 30]}
              resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']}
              grid={[gridSize, gridSize]}
            >
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow w-full h-full">
                <div 
                  className="h-8 bg-gray-50 rounded-t-lg border-b border-gray-200 px-2 
                            flex items-center justify-between cursor-move"
                  onMouseDown={(e) => handleMouseDown(e, block.id)}
                >
                  <Move className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{block.type}</span>
                  <button
                    onClick={(e) => handleDelete(block.id, e)}
                    className="p-1 hover:bg-red-50 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="p-4">
                  {renderBlockContent({
                    block,
                    onImageUpload: handleImageUpload
                  })}
                </div>
              </div>
            </ResizableBox>
          </div>
        ))}

        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Haz clic en los elementos del panel para agregarlos
          </div>
        )}
      </div>
    </div>
  );
}