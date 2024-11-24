import React from 'react';
import { Layout, Image, Tag, DollarSign, Percent, Gift, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { BlockType } from '../../types/builder';

interface ToolPanelProps {
  activeTab: 'elements' | 'product' | 'history';
  setActiveTab: (tab: 'elements' | 'product' | 'history') => void;
}

const BLOCKS: { type: BlockType; icon: React.ReactNode; label: string }[] = [
  { type: 'header', icon: <Layout className="w-5 h-5" />, label: 'Header' },
  { type: 'footer', icon: <Layout className="w-5 h-5" />, label: 'Footer' },
  { type: 'sku', icon: <Tag className="w-5 h-5" />, label: 'SKU' },
  { type: 'image', icon: <Image className="w-5 h-5" />, label: 'Imagen' },
  { type: 'price', icon: <DollarSign className="w-5 h-5" />, label: 'Precio' },
  { type: 'discount', icon: <Percent className="w-5 h-5" />, label: 'Descuento' },
  { type: 'promotion', icon: <Gift className="w-5 h-5" />, label: 'Promoción' },
  { type: 'logo', icon: <ImageIcon className="w-5 h-5" />, label: 'Logo' },
];

export default function ToolPanel({ activeTab, setActiveTab }: ToolPanelProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, blockType: BlockType) => {
    e.dataTransfer.setData('blockType', blockType);
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      <div className="space-y-2 p-4 border-b border-gray-200">
        {['elements', 'product', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`w-full px-4 py-2 text-left rounded-lg transition-colors
                       ${activeTab === tab 
                         ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                         : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'elements' && (
        <div className="p-4 grid grid-cols-2 gap-2">
          {BLOCKS.map((block) => (
            <div
              key={block.type}
              draggable
              onDragStart={(e) => handleDragStart(e, block.type)}
              className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 
                       cursor-move hover:border-indigo-500 hover:shadow-lg transition-colors"
            >
              <div className="p-2 bg-indigo-100 rounded-lg">
                {block.icon}
              </div>
              <span className="mt-2 text-sm font-medium text-gray-600">{block.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}