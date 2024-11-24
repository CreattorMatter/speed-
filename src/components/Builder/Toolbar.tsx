import React from 'react';

interface ToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
}

export default function Toolbar({ onSave, onPreview }: ToolbarProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Guardar
        </button>
        <button 
          onClick={onPreview}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Previsualizar
        </button>
      </div>
    </div>
  );
}