import React from 'react';
import { Layers, Package, History } from 'lucide-react';

type Tab = 'elements' | 'product' | 'history';

interface ToolPanelProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function ToolPanel({ activeTab, setActiveTab }: ToolPanelProps) {
  const tabs = [
    { id: 'elements', name: 'Elements', icon: Layers },
    { id: 'product', name: 'Product Data', icon: Package },
    { id: 'history', name: 'History', icon: History },
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full">
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex-1 py-4 px-4 text-sm font-medium text-center ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4">
        {activeTab === 'elements' && <ElementsPanel />}
        {activeTab === 'product' && <ProductPanel />}
        {activeTab === 'history' && <HistoryPanel />}
      </div>
    </div>
  );
}

function ElementsPanel() {
  const elements = [
    'Header',
    'Footer',
    'SKU Block',
    'Image Block',
    'Price Block',
    'Discount Block',
    'Promotion Block',
    'Logo Block',
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Drag elements to canvas</h3>
      <div className="grid grid-cols-2 gap-3">
        {elements.map((element) => (
          <div
            key={element}
            draggable
            className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 cursor-move hover:bg-gray-100 border border-gray-200"
          >
            {element}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductPanel() {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Product Data</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter SKU"
          />
        </div>
        <button className="btn-primary w-full">Fetch Product Data</button>
      </div>
    </div>
  );
}

function HistoryPanel() {
  const history = [
    { action: 'Added header', time: '2 mins ago' },
    { action: 'Modified price block', time: '5 mins ago' },
    { action: 'Added image', time: '10 mins ago' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">History</h3>
      <div className="space-y-2">
        {history.map((item, index) => (
          <div
            key={index}
            className="flex justify-between text-sm p-2 hover:bg-gray-50 rounded"
          >
            <span>{item.action}</span>
            <span className="text-gray-500">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}