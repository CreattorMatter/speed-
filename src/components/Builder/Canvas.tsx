import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Move } from 'lucide-react';
import { Block, BlockType } from '../../types/builder';
import { renderBlockContent } from '../../utils/blockRenderer';
import 'react-resizable/css/styles.css';
import Rulers from './Rulers';

interface CanvasProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const gridSize = 20; // Tamaño de la cuadrícula

  // Actualizar tamaño del canvas cuando cambie el tamaño de la ventana
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Función para ajustar a la cuadrícula
  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('blockType') as BlockType;
    
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const x = snapToGrid(e.clientX - canvasRect.left);
    const y = snapToGrid(e.clientY - canvasRect.top);

    const newBlock: Block = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      content: {},
      position: { x, y },
      size: { width: snapToGrid(200), height: snapToGrid(100) }
    };

    setBlocks([...blocks, newBlock]);
  };

  const handleDragStop = (blockId: string, data: { x: number; y: number }) => {
    setBlocks(blocks.map(block =>
      block.id === blockId
        ? { 
            ...block, 
            position: { 
              x: snapToGrid(data.x), 
              y: snapToGrid(data.y) 
            } 
          }
        : block
    ));
  };

  const handleResize = (blockId: string, size: { width: number; height: number }) => {
    setBlocks(blocks.map(block =>
      block.id === blockId
        ? { ...block, size }
        : block
    ));
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
      ref={canvasRef}
      className="flex-1 bg-white m-4 rounded-lg shadow-xl relative"
      style={{ 
        minHeight: '600px',
        paddingTop: '20px',   // Espacio para la regla horizontal
        paddingLeft: '20px',  // Espacio para la regla vertical
      }}
    >
      {/* Reglas */}
      <Rulers 
        width={canvasSize.width - 20} 
        height={canvasSize.height - 20}
        gridSize={gridSize}
      />

      {/* Área de trabajo con cuadrícula */}
      <div
        className="relative w-full h-full"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          overflow: 'hidden',
        }}
      >
        <AnimatePresence>
          {blocks.map((block) => (
            <Draggable
              key={block.id}
              defaultPosition={block.position}
              position={null}
              onStop={(e, data) => handleDragStop(block.id, data)}
              bounds="parent"
              handle=".handle"
            >
              <div className="absolute">
                <ResizableBox
                  width={block.size?.width || 200}
                  height={block.size?.height || 100}
                  onResize={(e, { size }) => handleResize(block.id, size)}
                  minConstraints={[100, 50]}
                  maxConstraints={[800, 600]}
                  resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']}
                  className={`${selectedBlock === block.id ? 'ring-2 ring-indigo-500' : ''}`}
                  onClick={() => setSelectedBlock(block.id)}
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
                      {renderBlockContent({
                        block,
                        isEditing: editingText === block.id,
                        onEdit: handleTextEdit,
                        onStartEdit: (id) => setEditingText(id),
                        onStopEdit: () => setEditingText(null),
                        onImageUpload: handleImageUpload,
                        fileInputRef: fileInputRefs.current.get(block.id)
                      })}
                    </div>
                  </div>
                </ResizableBox>
              </div>
            </Draggable>
          ))}
        </AnimatePresence>

        {blocks.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400">
            Arrastra elementos aquí para construir tu plantilla
          </div>
        )}
      </div>
    </div>
  );
}