// ===============================================
// ELEMENTS PANEL COMPONENT
// ===============================================

import React, { useState } from 'react';
import { 
  DraggableElementCategory, 
  DraggableElementType,
  DraggableElementsConfig,
  ElementSize,
  ElementPosition
} from '../../../types/builder-v2';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Package,
  FileText,
  DollarSign,
  Percent,
  Calendar,
  CreditCard,
  Info,
  QrCode,
  Image
} from 'lucide-react';

interface ElementsPanelProps {
  draggableElements: DraggableElementsConfig;
  onElementAdd: (type: DraggableElementType, position: ElementPosition) => void;
  recommendedElements?: DraggableElementType[];
}

export const ElementsPanel: React.FC<ElementsPanelProps> = ({
  draggableElements,
  onElementAdd,
  recommendedElements = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<DraggableElementCategory>>(
    new Set(['SKU', 'Precio', 'Descripción'])
  );
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);

  const toggleCategory = (category: DraggableElementCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = (category: DraggableElementCategory) => {
    switch (category) {
      case 'Header':
        return <Image className="w-4 h-4" />;
      case 'SKU':
        return <Package className="w-4 h-4" />;
      case 'Descripción':
        return <FileText className="w-4 h-4" />;
      case 'Precio':
        return <DollarSign className="w-4 h-4" />;
      case 'Descuento':
        return <Percent className="w-4 h-4" />;
      case 'Fechas':
        return <Calendar className="w-4 h-4" />;
      case 'Finanzas':
        return <CreditCard className="w-4 h-4" />;
      case 'Footer':
        return <Info className="w-4 h-4" />;
      case 'QR':
        return <QrCode className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: DraggableElementCategory) => {
    switch (category) {
      case 'Header':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'SKU':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Descripción':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Precio':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Descuento':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Fechas':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Finanzas':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Footer':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'QR':
        return 'text-pink-600 bg-pink-50 border-pink-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleAddElement = (type: DraggableElementType) => {
    // Posición aleatoria cerca del centro
    const position: ElementPosition = {
      x: Math.random() * 200 + 100,
      y: Math.random() * 200 + 100,
      z: 1
    };
    onElementAdd(type, position);
  };

  const getFilteredElements = () => {
    let filtered = draggableElements;
    
    if (showRecommendedOnly && recommendedElements.length > 0) {
      filtered = Object.fromEntries(
        Object.entries(draggableElements).map(([category, elements]) => [
          category,
          elements.filter(el => recommendedElements.includes(el.type))
        ]).filter(([, elements]) => elements.length > 0)
      ) as DraggableElementsConfig;
    }

    if (searchTerm) {
      filtered = Object.fromEntries(
        Object.entries(filtered).map(([category, elements]) => [
          category,
          elements.filter(el => 
            el.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            el.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ]).filter(([, elements]) => elements.length > 0)
      ) as DraggableElementsConfig;
    }

    return filtered;
  };

  const filteredElements = getFilteredElements();
  const totalElements = Object.values(filteredElements).reduce((sum, elements) => sum + elements.length, 0);

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Elementos
        </h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar elementos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRecommendedOnly(!showRecommendedOnly)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              showRecommendedOnly
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {showRecommendedOnly ? 'Todos' : 'Recomendados'}
          </button>
          
          <span className="text-xs text-gray-500">
            {totalElements} elementos
          </span>
        </div>
      </div>

      {/* Elements List */}
      <div className="flex-1 overflow-auto">
        {Object.keys(filteredElements).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No se encontraron elementos</p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(filteredElements).map(([category, elements]) => (
              <div key={category} className="mb-4">
                <button
                  onClick={() => toggleCategory(category as DraggableElementCategory)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedCategories.has(category as DraggableElementCategory) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    
                    <div className={`p-1 rounded ${getCategoryColor(category as DraggableElementCategory)}`}>
                      {getCategoryIcon(category as DraggableElementCategory)}
                    </div>
                    
                    <span className="font-medium text-gray-900">{category}</span>
                  </div>
                  
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {elements.length}
                  </span>
                </button>

                {expandedCategories.has(category as DraggableElementCategory) && (
                  <div className="ml-4 mt-2 space-y-1">
                    {elements.map((element) => (
                      <div
                        key={element.type}
                        className="group relative"
                      >
                        <button
                          onClick={() => handleAddElement(element.type)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className={`p-2 rounded-lg ${getCategoryColor(element.category)} flex-shrink-0`}>
                            {element.icon ? (
                              <span className="text-sm">{element.icon}</span>
                            ) : (
                              getCategoryIcon(element.category)
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                {element.name}
                              </h4>
                              
                              {recommendedElements.includes(element.type) && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                  ★
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {element.description}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              <span>{element.defaultSize.width}×{element.defaultSize.height}</span>
                            </div>
                          </div>
                        </button>

                        {/* Add button overlay */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleAddElement(element.type)}
                            className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                            title={`Agregar ${element.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Recomendado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Disponible</span>
            </div>
          </div>
          <p>Haz clic para agregar elementos al canvas</p>
        </div>
      </div>
    </div>
  );
}; 