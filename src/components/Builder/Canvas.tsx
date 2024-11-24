import React from 'react';

export default function Canvas() {
  return (
    <div className="flex-1 bg-gray-100 p-8 overflow-auto">
      <div className="bg-white w-[800px] h-[600px] mx-auto shadow-lg rounded-lg relative">
        {/* Placeholder for draggable elements */}
        <div className="absolute top-4 left-4 right-4 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
          Header Block
        </div>
        <div className="absolute top-24 left-4 right-4 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
          Image Block
        </div>
        <div className="absolute top-60 left-4 right-4 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
          Price Block
        </div>
      </div>
    </div>
  );
}