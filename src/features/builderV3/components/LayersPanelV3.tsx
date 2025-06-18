// =====================================
// SPEED BUILDER V3 - ENHANCED LAYERS PANEL
// =====================================

import React, { useState, useRef } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  ChevronUp,
  ChevronDown,
  Type,
  Image,
  QrCode,
  DollarSign,
  Hash,
  Search,
  Filter,
  MoreVertical,
  Tag
} from 'lucide-react';
import { BuilderStateV3, DraggableComponentV3, BuilderOperationsV3 } from '../types';

interface LayersPanelV3Props {
  state: BuilderStateV3;
  operations: BuilderOperationsV3;
}

export const LayersPanelV3: React.FC<LayersPanelV3Props> = ({
  state,
  operations
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<number | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // =====================
  // UTILITY FUNCTIONS
  // =====================

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'field-dynamic-text':
        return <Type className="w-4 h-4 text-blue-600" />;
      case 'image-header':
      case 'image-product':
      case 'image-brand-logo':
      case 'image-decorative':
        return <Image className="w-4 h-4 text-purple-600" />;
      case 'qr-dynamic':
        return <QrCode className="w-4 h-4 text-gray-600" />;
      case 'field-dynamic-date':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'shape-geometric':
      case 'decorative-line':
      case 'decorative-icon':
        return <Tag className="w-4 h-4 text-orange-600" />;
      default:
        return <Hash className="w-4 h-4 text-gray-500" />;
    }
  };

  const getComponentName = (component: DraggableComponentV3) => {
    if (component.name) return component.name;
    
    const content = component.content as any;
    
    switch (component.type) {
      case 'field-dynamic-text':
        if (content?.staticValue) {
          return content.staticValue.length > 20 
            ? content.staticValue.substring(0, 20) + '...'
            : content.staticValue;
        }
        if (content?.dynamicTemplate) {
          return 'Texto dinámico';
        }
        return 'Texto';
      
      case 'image-header':
      case 'image-brand-logo':
      case 'image-decorative':
      case 'image-product':
        return component.type === 'image-header' ? 'Header' :
               component.type === 'image-brand-logo' ? 'Logo' :
               component.type === 'image-decorative' ? 'Imagen decorativa' :
               component.type === 'image-product' ? 'Imagen producto' : 'Imagen';
      
      case 'qr-dynamic':
        return 'Código QR';
      
      case 'field-dynamic-date':
        return 'Fecha';
        
      case 'shape-geometric':
        return 'Forma Geométrica';
        
      case 'decorative-line':
        return 'Línea Decorativa';
        
      case 'decorative-icon':
        return 'Ícono Decorativo';
        
      case 'container-flexible':
      case 'container-grid':
        return 'Contenedor';
        
      default:
        return component.type;
    }
  };

  const getComponentTypeColor = (type: string) => {
    switch (type) {
      case 'field-dynamic-text':
        return 'bg-blue-100 text-blue-800';
      case 'image-header':
      case 'image-brand-logo':
      case 'image-decorative':
      case 'image-product':
        return 'bg-purple-100 text-purple-800';
      case 'qr-dynamic':
        return 'bg-gray-100 text-gray-800';
      case 'field-dynamic-date':
        return 'bg-green-100 text-green-800';
      case 'shape-geometric':
      case 'decorative-line':
      case 'decorative-icon':
        return 'bg-orange-100 text-orange-800';
      case 'container-flexible':
      case 'container-grid':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // =====================
  // FILTER & SEARCH
  // =====================

  const filteredComponents = state.components.filter(component => {
    const matchesSearch = searchTerm === '' || 
      getComponentName(component).toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || component.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const componentTypes = [...new Set(state.components.map(c => c.type))];

  // =====================
  // DRAG & DROP HANDLERS
  // =====================

  const handleDragStart = (e: React.DragEvent, componentId: string) => {
    setDraggedComponent(componentId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropPosition(index);
  };

  const handleDragLeave = () => {
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedComponent) return;
    
    const draggedIndex = state.components.findIndex(c => c.id === draggedComponent);
    
    if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
      operations.reorderComponent(draggedComponent, dropIndex);
    }
    
    setDraggedComponent(null);
    setDropPosition(null);
  };

  // =====================
  // COMPONENT ACTIONS
  // =====================

  const handleComponentSelect = (componentId: string) => {
    operations.selectComponent(componentId);
  };

  const handleComponentToggleVisibility = (componentId: string) => {
    const component = state.components.find(c => c.id === componentId);
    if (component) {
      operations.updateComponent(componentId, { isVisible: !component.isVisible });
    }
  };

  const handleComponentToggleLock = (componentId: string) => {
    const component = state.components.find(c => c.id === componentId);
    if (component) {
      operations.updateComponent(componentId, { isLocked: !component.isLocked });
    }
  };

  const handleComponentReorder = (componentId: string, direction: 'up' | 'down') => {
    const currentIndex = state.components.findIndex(c => c.id === componentId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < state.components.length) {
      operations.reorderComponent(componentId, newIndex);
    }
  };

  const handleComponentDuplicate = (componentId: string) => {
    operations.duplicateComponent(componentId);
  };

  const handleComponentDelete = (componentId: string) => {
    operations.removeComponent(componentId);
  };

  // =====================
  // RENDER HELPERS
  // =====================

  const renderComponentItem = (component: DraggableComponentV3, index: number) => {
    const isSelected = state.canvas.selectedComponentIds?.includes(component.id);
    const isDragging = draggedComponent === component.id;
    const showDropIndicator = dropPosition === index;
    
    return (
      <div key={component.id} className="relative">
        {/* Drop indicator */}
        {showDropIndicator && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />
        )}
        
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, component.id)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          className={`
            group flex items-center p-3 mb-1 rounded-lg cursor-pointer transition-all duration-200
            ${isSelected 
              ? 'bg-blue-100 border border-blue-300 shadow-sm' 
              : 'hover:bg-gray-50 border border-transparent'
            }
            ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
            ${component.isLocked ? 'bg-orange-50' : ''}
            ${!component.isVisible ? 'bg-gray-100' : ''}
          `}
          onClick={() => handleComponentSelect(component.id)}
        >
          {/* Drag handle */}
          <div className="flex-shrink-0 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          </div>

          {/* Component Icon */}
          <div className="flex-shrink-0 mr-3">
            {getComponentIcon(component.type)}
          </div>

          {/* Component Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-gray-900 truncate">
                {getComponentName(component)}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getComponentTypeColor(component.type)}`}>
                {component.type}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">
                {Math.round(component.position.x)}, {Math.round(component.position.y)}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {Math.round(component.size.width)}×{Math.round(component.size.height)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-shrink-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Reorder buttons */}
            <div className="flex flex-col">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleComponentReorder(component.id, 'up');
                }}
                disabled={index === 0}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Mover hacia adelante"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleComponentReorder(component.id, 'down');
                }}
                disabled={index === filteredComponents.length - 1}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Mover hacia atrás"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Visibility toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleComponentToggleVisibility(component.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title={component.isVisible ? 'Ocultar' : 'Mostrar'}
            >
              {component.isVisible ? (
                <Eye className="w-3 h-3 text-gray-600" />
              ) : (
                <EyeOff className="w-3 h-3 text-gray-400" />
              )}
            </button>

            {/* Lock toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleComponentToggleLock(component.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title={component.isLocked ? 'Desbloquear' : 'Bloquear'}
            >
              {component.isLocked ? (
                <Lock className="w-3 h-3 text-orange-600" />
              ) : (
                <Unlock className="w-3 h-3 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =====================
  // MAIN RENDER
  // =====================

  if (state.components.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Capas</h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            0
          </span>
        </div>
        
        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <Layers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No hay componentes en el canvas</p>
            <p className="text-xs text-gray-400 mt-1">
              Arrastra elementos desde el panel de componentes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Capas</h3>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {state.components.length}
        </span>
      </div>

      {/* Search and Filter */}
      <div className="p-3 border-b border-gray-200 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar capas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los tipos</option>
            {componentTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Components List */}
      <div 
        ref={dropRef}
        className="flex-1 overflow-y-auto p-2"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
      >
        {filteredComponents
          .slice()
          .reverse() // Mostrar los elementos más recientes arriba (z-index más alto)
          .map((component, index) => renderComponentItem(component, index))
        }
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>💡 <strong>Tip:</strong> Arrastra para reordenar</span>
            <span>{filteredComponents.length} mostrados</span>
          </div>
          <p>Usa Ctrl/Cmd + click para seleccionar múltiples</p>
        </div>
      </div>
    </div>
  );
}; 