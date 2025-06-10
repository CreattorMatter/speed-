import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';

interface Block {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

const DraggableItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-blue-100 border-2 border-blue-300 rounded cursor-move ${isDragging ? 'opacity-50' : ''}`}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
};

const DroppableArea: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOver, setNodeRef } = useDroppable({ id: 'droppable' });

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full border-2 border-dashed ${isOver ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
    >
      {children}
    </div>
  );
};

export const SimpleTestBuilder: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Si arrastramos desde el panel al canvas
    if (typeof active.id === 'string' && over.id === 'droppable') {
      const blockType = active.id;
      const newBlock: Block = {
        id: `${blockType}-${Date.now()}`,
        type: blockType,
        x: 50,
        y: 50,
        width: 150,
        height: 100,
        text: blockType === 'price' ? '$999.99' : blockType === 'text' ? 'Texto' : 'Elemento'
      };
      setBlocks(prev => [...prev, newBlock]);
    }
  }, []);

  return (
    <div className="h-screen bg-gray-100 flex">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Panel lateral */}
        <div className="w-64 bg-white border-r p-4 space-y-4">
          <h3 className="font-bold">Elementos</h3>
          <DraggableItem id="price">💰 Precio</DraggableItem>
          <DraggableItem id="text">📝 Texto</DraggableItem>
          <DraggableItem id="image">🖼️ Imagen</DraggableItem>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-8">
          <DroppableArea>
            <div className="relative w-full h-full bg-white rounded shadow-lg p-4">
              <h3 className="text-center mb-4">Canvas - Arrastra elementos aquí</h3>
              
              {/* Elementos en el canvas */}
              {blocks.map(block => (
                <div
                  key={block.id}
                  className="absolute bg-yellow-100 border border-yellow-300 rounded p-2"
                  style={{
                    left: block.x,
                    top: block.y,
                    width: block.width,
                    height: block.height
                  }}
                >
                  {block.text}
                </div>
              ))}
            </div>
          </DroppableArea>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && (
            <div className="p-3 bg-blue-200 border-2 border-blue-400 rounded">
              Arrastrando: {activeId}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}; 