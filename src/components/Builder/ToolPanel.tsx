import React from 'react';
import { Layout, Image, Tag, DollarSign, Percent, Gift, Image as ImageIcon } from 'lucide-react';
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
  const renderTabContent = () => {
    switch (activeTab) {
      case 'elements':
        return (
          <div className="p-4 grid grid-cols-2 gap-2">
            {BLOCKS.map((block) => (
              <div
                key={block.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('blockType', block.type);
                }}
                className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 cursor-move hover:border-indigo-500 hover:shadow-sm"
              >
                {block.icon}
                <span className="mt-2 text-sm text-gray-600">{block.label}</span>
              </div>
            ))}
          </div>
        );
      case 'product':
        return <div className="p-4">Información del producto...</div>;
      case 'history':
        return <div className="p-4">Historial de cambios...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
      <div className="space-y-2 p-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('elements')}
          className={`w-full px-4 py-2 text-left rounded-lg ${
            activeTab === 'elements' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
          }`}
        >
          Elementos
        </button>
        <button
          onClick={() => setActiveTab('product')}
          className={`w-full px-4 py-2 text-left rounded-lg ${
            activeTab === 'product' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
          }`}
        >
          Producto
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`w-full px-4 py-2 text-left rounded-lg ${
            activeTab === 'history' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'
          }`}
        >
          Historial
        </button>
      </div>
      {renderTabContent()}
    </div>
  );
}