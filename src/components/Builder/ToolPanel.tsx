import React, { useState } from 'react';
import { Plus, Type, Image, DollarSign, Percent, Package, Tag, Star, Grid, Layers } from 'lucide-react';
// import { AdvancedFieldsPanel } from './AdvancedFieldsPanel';

interface ToolPanelProps {
  activeTab: 'elements' | 'product' | 'history';
  setActiveTab: (tab: 'elements' | 'product' | 'history') => void;
  onAddBlock: (blockType: string) => void;
}

const elements = [
  { id: 'header', label: 'Header', icon: Type, color: 'blue' },
  { id: 'image', label: 'Imagen', icon: Image, color: 'purple' },
  { id: 'price', label: 'Precio', icon: DollarSign, color: 'green' },
  { id: 'discount', label: 'Descuento', icon: Percent, color: 'red' },
  { id: 'sku', label: 'SKU', icon: Package, color: 'yellow' },
  { id: 'promotion', label: 'Promoción', icon: Star, color: 'pink' },
  { id: 'logo', label: 'Logo', icon: Grid, color: 'indigo' },
  { id: 'footer', label: 'Footer', icon: Layers, color: 'gray' }
];

const ToolPanel: React.FC<ToolPanelProps> = ({ activeTab, setActiveTab, onAddBlock }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['basic']));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const renderElementsTab = () => (
    <div className="space-y-4">
      {/* Elementos Básicos */}
      <div>
        <button
          onClick={() => toggleCategory('basic')}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-900">Elementos Básicos</span>
          <span className={`transform transition-transform ${expandedCategories.has('basic') ? 'rotate-180' : ''}`}>
            ↓
          </span>
        </button>
        
        {expandedCategories.has('basic') && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {elements.map((element) => {
              const IconComponent = element.icon;
              return (
                <button
                  key={element.id}
                  onClick={() => onAddBlock(element.id)}
                  className={`flex flex-col items-center gap-2 p-3 bg-${element.color}-50 border border-${element.color}-200 rounded-lg hover:bg-${element.color}-100 transition-colors group`}
                >
                  <IconComponent className={`w-6 h-6 text-${element.color}-600`} />
                  <span className={`text-xs font-medium text-${element.color}-700`}>
                    {element.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Campos Avanzados - PRÓXIMAMENTE */}
      <div>
        <button
          onClick={() => toggleCategory('advanced')}
          className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <span className="font-medium text-blue-900">Campos de Retail</span>
          <span className={`transform transition-transform ${expandedCategories.has('advanced') ? 'rotate-180' : ''}`}>
            ↓
          </span>
        </button>
        
        {expandedCategories.has('advanced') && (
          <div className="mt-2 p-4 bg-blue-50 rounded-lg text-center">
            <div className="text-blue-600 mb-2">🚀</div>
            <div className="text-sm font-medium text-blue-900 mb-1">Campos Avanzados</div>
            <div className="text-xs text-blue-700">
              Funcionalidad en desarrollo. Pronto tendrás acceso a campos específicos de retail como precios, descuentos, SKUs y más.
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProductTab = () => (
    <div className="p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">Productos</h3>
        <p className="text-sm text-gray-500 mb-4">
          Conecta con datos de productos del sistema
        </p>
        <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Conectar con SAP
        </button>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">Historial</h3>
        <p className="text-sm text-gray-500 mb-4">
          Revisa los cambios realizados
        </p>
        <div className="space-y-2">
          <div className="text-left p-2 bg-gray-50 rounded text-sm">
            <div className="font-medium">Elemento agregado</div>
            <div className="text-gray-500">Hace 2 minutos</div>
          </div>
          <div className="text-left p-2 bg-gray-50 rounded text-sm">
            <div className="font-medium">Plantilla creada</div>
            <div className="text-gray-500">Hace 5 minutos</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="p-4 border-b">
        <div className="flex space-x-1">
          {[
            { id: 'elements', label: 'Elements', icon: '🧩' },
            { id: 'product', label: 'Product', icon: '📦' },
            { id: 'history', label: 'History', icon: '📜' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'elements' && renderElementsTab()}
        {activeTab === 'product' && renderProductTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2">
            Arrastra elementos al canvas
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>💡</span>
            <span>Haz clic para seleccionar y redimensionar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolPanel;