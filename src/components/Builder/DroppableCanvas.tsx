import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableCanvasProps {
  children: React.ReactNode;
}

export const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full transition-all duration-200 ${
        isOver ? 'bg-blue-50 bg-opacity-50' : ''
      }`}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-30 rounded-lg flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-blue-600 font-medium">
            Suelta aquí para agregar elemento
          </div>
        </div>
      )}
    </div>
  );
}; 