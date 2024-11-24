import React from 'react';
import {
  Layout,
  Image,
  Type,
  Square,
  Move,
  Palette,
  Save,
  Undo,
  Redo,
} from 'lucide-react';

export default function Toolbar() {
  const tools = [
    { icon: Layout, name: 'Layout' },
    { icon: Image, name: 'Image' },
    { icon: Type, name: 'Text' },
    { icon: Square, name: 'Shape' },
    { icon: Move, name: 'Move' },
    { icon: Palette, name: 'Color' },
  ];

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex space-x-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.name}
              className="p-2 hover:bg-gray-100 rounded-lg tooltip"
              title={tool.name}
            >
              <Icon className="h-5 w-5 text-gray-700" />
            </button>
          );
        })}
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Undo className="h-5 w-5 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Redo className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        <button className="btn-primary">
          <Save className="h-5 w-5 mr-2" />
          Save Template
        </button>
      </div>
    </div>
  );
}