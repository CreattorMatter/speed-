import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Move, Edit2, Upload } from 'lucide-react';
import { Block, BlockType } from '../../types/builder';
import 'react-resizable/css/styles.css';
import { useCollisionDetection, checkCollision } from '../../hooks/useCollisionDetection';
import { useResizeShortcuts } from '../../hooks/useResizeShortcuts';
import { useBlockHistory } from '../../hooks/useBlockHistory';

interface CanvasProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}

interface ResizeIndicatorProps {
  width: number;
  height: number;
}

const ResizeIndicator = ({ width, height }: ResizeIndicatorProps) => (
  <div className="absolute -bottom-6 right-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded-md opacity-80">
    {Math.round(width)} x {Math.round(height)}
  </div>
);

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [guides, setGuides] = useState<{
    vertical: number[];
    horizontal: number[];
  }>({ vertical: [], horizontal: [] });
  const collisionState = useCollisionDetection(blocks, selectedBlock);
  const [isResizing, setIsResizing] = useState(false);
  const gridSize = 20; // Tamaño de la cuadrícula para snap
  const [mirrorMode, setMirrorMode] = useState(false);
  const [resizeHistory, setResizeHistory] = useState<{
    blockId: string;
    previousSize: { width: number; height: number };
    newSize: { width: number; height: number };
    timestamp: number;
  }[]>([]);
  const history = useBlockHistory(blocks);
  const [lockAspectRatio, setLockAspectRatio] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [copiedSize, setCopiedSize] = useState<{ width: number; height: number } | null>(null);

  useResizeShortcuts(blocks, setBlocks, selectedBlock);

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('blockType') as BlockType;
    
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    const newBlock: Block = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      content: {},
      position: { x, y },
      size: { width: 200, height: 100 }
    };

    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
  };

  const handleDragStop = (blockId: string, data: { x: number; y: number }) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId
        ? { ...block, position: { x: data.x, y: data.y } }
        : block
    );
    setBlocks(updatedBlocks);
  };

  const handleBlockDrag = (blockId: string, data: { x: number; y: number }) => {
    const activeBlock = blocks.find(b => b.id === blockId);
    if (!activeBlock) return;

    // Ajustar posición con la fuerza de repulsión
    let newX = Math.round(data.x / 20) * 20 + collisionState.repulsionForce.x;
    let newY = Math.round(data.y / 20) * 20 + collisionState.repulsionForce.y;

    // Verificar límites del canvas
    const maxX = window.innerWidth - (activeBlock.size?.width || 200) - 100;
    const maxY = window.innerHeight - (activeBlock.size?.height || 100) - 100;
    
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    const updatedBlocks = blocks.map(block => 
      block.id === blockId 
        ? { 
            ...block, 
            position: { x: newX, y: newY }
          }
        : block
    );
    setBlocks(updatedBlocks);
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

  const updateGuides = (activeBlock: Block) => {
    const verticalGuides: number[] = [];
    const horizontalGuides: number[] = [];

    blocks.forEach(block => {
      if (block.id === activeBlock.id) return;

      // Guías verticales
      const blockCenterX = block.position.x + (block.size?.width || 0) / 2;
      const activeCenterX = activeBlock.position.x + (activeBlock.size?.width || 0) / 2;
      
      if (Math.abs(blockCenterX - activeCenterX) < 10) {
        verticalGuides.push(blockCenterX);
      }

      // Guías horizontales
      const blockCenterY = block.position.y + (block.size?.height || 0) / 2;
      const activeCenterY = activeBlock.position.y + (activeBlock.size?.height || 0) / 2;
      
      if (Math.abs(blockCenterY - activeCenterY) < 10) {
        horizontalGuides.push(blockCenterY);
      }
    });

    setGuides({ vertical: verticalGuides, horizontal: horizontalGuides });
  };

  const renderBlockContent = (block: Block) => {
    const isEditing = editingText === block.id;

    switch (block.type) {
      case 'header':
        return <div className="bg-gray-50 p-4 rounded">Header Content</div>;
      case 'footer':
        return <div className="bg-gray-50 p-4 rounded">Footer Content</div>;
      case 'sku':
        return (
          <div className="relative group">
            {isEditing ? (
              <input
                type="text"
                value={block.content?.text || 'SKU-12345'}
                onChange={(e) => handleTextEdit(block.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                autoFocus
                className="font-mono text-gray-600 w-full p-1 border rounded"
              />
            ) : (
              <>
                <span className="font-mono text-gray-600">{block.content?.text || 'SKU-12345'}</span>
                <button
                  onClick={() => setEditingText(block.id)}
                  className="absolute -right-6 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </>
            )}
          </div>
        );
      case 'image':
        return (
          <div className="relative group">
            {block.content?.imageUrl ? (
              <img 
                src={block.content.imageUrl} 
                alt="Uploaded content"
                className="w-full h-full object-contain"
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
                if (file) handleImageUpload(block.id, file);
              }}
            />
          </div>
        );
      case 'price':
        return (
          <div className="relative group">
            {isEditing ? (
              <input
                type="text"
                value={block.content?.text || '$99.99'}
                onChange={(e) => handleTextEdit(block.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                autoFocus
                className="text-2xl font-bold text-gray-800 w-full p-1 border rounded"
              />
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-800">{block.content?.text || '$99.99'}</span>
                <button
                  onClick={() => setEditingText(block.id)}
                  className="absolute -right-6 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </>
            )}
          </div>
        );
      case 'discount':
        return (
          <div className="relative group">
            {isEditing ? (
              <input
                type="text"
                value={block.content?.text || '-20%'}
                onChange={(e) => handleTextEdit(block.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                autoFocus
                className="text-red-500 font-semibold w-full p-1 border rounded"
              />
            ) : (
              <>
                <span className="text-red-500 font-semibold">{block.content?.text || '-20%'}</span>
                <button
                  onClick={() => setEditingText(block.id)}
                  className="absolute -right-6 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </>
            )}
          </div>
        );
      case 'promotion':
        return (
          <div className="relative group">
            {isEditing ? (
              <input
                type="text"
                value={block.content?.text || '¡Oferta especial!'}
                onChange={(e) => handleTextEdit(block.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                autoFocus
                className="bg-yellow-50 text-yellow-800 p-2 rounded w-full border"
              />
            ) : (
              <>
                <div className="bg-yellow-50 text-yellow-800 p-2 rounded">
                  {block.content?.text || '¡Oferta especial!'}
                </div>
                <button
                  onClick={() => setEditingText(block.id)}
                  className="absolute -right-6 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </>
            )}
          </div>
        );
      case 'logo':
        return (
          <div className="relative group">
            {block.content?.imageUrl ? (
              <img 
                src={block.content.imageUrl} 
                alt="Company logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div 
                className="bg-gray-100 rounded p-4 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-400 text-sm">Subir logo</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(block.id, file);
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const getAspectRatio = (blockType: BlockType): number | null => {
    switch (blockType) {
      case 'image':
      case 'logo':
        return 16 / 9; // Aspecto 16:9 para imágenes
      case 'header':
        return 4 / 1; // Aspecto 4:1 para headers
      case 'footer':
        return 4 / 1; // Aspecto 4:1 para footers
      default:
        return null; // Sin restricción de aspecto
    }
  };

  const snapToGrid = (value: number): number => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleResize = (blockId: string, e: React.SyntheticEvent, data: ResizeCallbackData) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const newSize = {
      width: snapToGrid(data.size.width),
      height: snapToGrid(data.size.height)
    };

    // Guardar en el historial
    setResizeHistory(prev => [...prev, {
      blockId,
      previousSize: block.size || { width: 200, height: 100 },
      newSize,
      timestamp: Date.now()
    }]);

    // Aplicar modo espejo si está activo
    if (mirrorMode) {
      const centerX = window.innerWidth / 2;
      const distanceFromCenter = block.position.x - centerX;
      
      const mirroredBlocks = blocks.map(b => {
        if (b.id === blockId) {
          return { ...b, size: newSize };
        }
        if (b.position.x === centerX - distanceFromCenter) {
          return { ...b, size: newSize };
        }
        return b;
      });
      
      setBlocks(mirroredBlocks);
    } else {
      const updatedBlocks = blocks.map(b =>
        b.id === blockId ? { ...b, size: newSize } : b
      );
      setBlocks(updatedBlocks);
    }
  };

  // Función para copiar el tamaño de un bloque
  const copyBlockSize = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block?.size) {
      setCopiedSize(block.size);
    }
  };

  // Función para aplicar el tamaño copiado
  const applyBlockSize = (blockId: string) => {
    if (!copiedSize) return;
    
    const updatedBlocks = blocks.map(block =>
      block.id === blockId
        ? { ...block, size: copiedSize }
        : block
    );
    setBlocks(updatedBlocks);
    history.addToHistory(updatedBlocks, `Aplicado tamaño copiado a ${blockId}`);
  };

  // Función para cambiar el tamaño de la rejilla
  const handleGridSizeChange = (newSize: number) => {
    setGridSize(newSize);
    // Ajustar todos los bloques a la nueva rejilla
    const updatedBlocks = blocks.map(block => ({
      ...block,
      position: {
        x: Math.round(block.position.x / newSize) * newSize,
        y: Math.round(block.position.y / newSize) * newSize
      }
    }));
    setBlocks(updatedBlocks);
    history.addToHistory(updatedBlocks, `Cambiado tamaño de rejilla a ${newSize}px`);
  };

  return (
    <div className="relative flex-1">
      {/* Controles de rejilla */}
      <div className="absolute top-4 right-4 flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm">
        <label className="text-sm text-gray-600">Tamaño de rejilla:</label>
        <select
          value={gridSize}
          onChange={(e) => handleGridSizeChange(Number(e.target.value))}
          className="px-2 py-1 border rounded"
        >
          <option value="10">10px</option>
          <option value="20">20px</option>
          <option value="50">50px</option>
        </select>
        <button
          onClick={() => setLockAspectRatio(!lockAspectRatio)}
          className={`p-2 rounded ${
            lockAspectRatio ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100'
          }`}
        >
          Bloquear proporción
        </button>
      </div>

      <div
        ref={canvasRef}
        className="flex-1 bg-white m-4 rounded-lg shadow-xl p-4 relative"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={handleDrop}
        style={{ 
          minHeight: '600px', 
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'radial-gradient(circle at 1px 1px, #f0f0f0 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        <AnimatePresence>
          {blocks.map((block) => (
            <Draggable
              key={block.id}
              defaultPosition={block.position}
              onStop={(e, data) => handleDragStop(block.id, data)}
              bounds="parent"
              handle=".handle"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`absolute ${selectedBlock === block.id ? 'ring-2 ring-indigo-500' : ''}`}
                onClick={() => setSelectedBlock(block.id)}
                style={{ 
                  position: 'absolute',
                  zIndex: selectedBlock === block.id ? 10 : 1,
                  width: block.size?.width,
                  height: block.size?.height,
                }}
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
                    {renderBlockContent(block)}
                  </div>
                </div>
              </motion.div>
            </Draggable>
          ))}
        </AnimatePresence>

        {blocks.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400">
            Arrastra elementos aquí para construir tu plantilla
          </div>
        )}

        {/* Guías verticales */}
        {guides.vertical.map((position, index) => (
          <div
            key={`v-${index}`}
            className="absolute top-0 bottom-0 w-px bg-indigo-500/50"
            style={{ left: position }}
          />
        ))}

        {/* Guías horizontales */}
        {guides.horizontal.map((position, index) => (
          <div
            key={`h-${index}`}
            className="absolute left-0 right-0 h-px bg-indigo-500/50"
            style={{ top: position }}
          />
        ))}

        {/* Controles adicionales */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={() => setMirrorMode(!mirrorMode)}
            className={`p-2 rounded-lg ${
              mirrorMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Modo Espejo
          </button>
          
          <button
            onClick={() => {
              const lastResize = resizeHistory[resizeHistory.length - 1];
              if (lastResize) {
                setBlocks(blocks.map(b =>
                  b.id === lastResize.blockId
                    ? { ...b, size: lastResize.previousSize }
                    : b
                ));
                setResizeHistory(prev => prev.slice(0, -1));
              }
            }}
            className="p-2 rounded-lg bg-gray-100 text-gray-700"
            disabled={resizeHistory.length === 0}
          >
            Deshacer Último Cambio
          </button>
        </div>
      </div>

      {/* Menú contextual para bloques */}
      {selectedBlock && (
        <div className="absolute right-4 bottom-4 bg-white p-2 rounded-lg shadow-sm space-y-2">
          <button
            onClick={() => copyBlockSize(selectedBlock)}
            className="w-full px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            Copiar tamaño
          </button>
          {copiedSize && (
            <button
              onClick={() => applyBlockSize(selectedBlock)}
              className="w-full px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Aplicar tamaño copiado
            </button>
          )}
        </div>
      )}
    </div>
  );
}