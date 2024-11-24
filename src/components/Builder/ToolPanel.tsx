import React from 'react';

interface ToolPanelProps {
  activeTab: 'elements' | 'product' | 'history';
  setActiveTab: (tab: 'elements' | 'product' | 'history') => void;
}

export default function ToolPanel({ activeTab, setActiveTab }: ToolPanelProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'elements':
        return <div className="p-4">Contenido de elementos...</div>;
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