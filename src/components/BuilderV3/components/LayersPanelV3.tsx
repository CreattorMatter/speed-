// =====================================
// SPEED BUILDER V3 - LAYERS PANEL
// =====================================

import React from 'react';
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
  Hash
} from 'lucide-react';
import { BuilderStateV3, ComponentV3 } from '../../../types/builder-v3';

interface LayersPanelV3Props {
  state: BuilderStateV3;
  onComponentSelect: (componentId: string) => void;
  onComponentToggleVisibility: (componentId: string) => void;
  onComponentToggleLock: (componentId: string) => void;
  onComponentReorder: (componentId: string, direction: 'up' | 'down') => void;
}

export const LayersPanelV3: React.FC<LayersPanelV3Props> = ({
  state,
  onComponentSelect,
  onComponentToggleVisibility,
  onComponentToggleLock,
  onComponentReorder
}) => {
  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'qr-code':
        return <QrCode className="w-4 h-4" />;
      case 'price':
      case 'financial-info':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const getComponentName = (component: ComponentV3) => {
    if (component.name) return component.name;
    
    switch (component.type) {
      case 'text':
        const textContent = component.content as string;
        return textContent ? textContent.substring(0, 20) + (textContent.length > 20 ? '...' : '') : 'Texto';
      case 'image':
        return 'Imagen';
      case 'qr-code':
        return 'Código QR';
      case 'price':
        return 'Precio';
      case 'financial-info':
        return 'Info Financiera';
      case 'product-data':
        return 'Datos de Producto';
      default:
        return component.type;
    }
  };

  if (state.components.length === 0) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Layers className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Capas</h3>
        </div>
        
        <div className="text-center text-gray-500 mt-8">
          <Layers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No hay componentes en el canvas</p>
          <p className="text-xs text-gray-400 mt-1">
            Arrastra elementos desde el panel de componentes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Capas</h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {state.components.length}
          </span>
        </div>
      </div>

      {/* Components List */}
      <div className="p-2">
        {state.components
          .slice()
          .reverse() // Mostrar los elementos más recientes arriba
          .map((component, index) => {
            const isSelected = state.selectedComponentIds?.includes(component.id);
            const reverseIndex = state.components.length - 1 - index;
            
            return (
              <div
                key={component.id}
                className={`
                  group flex items-center p-2 mb-1 rounded-lg cursor-pointer transition-colors
                  ${isSelected 
                    ? 'bg-blue-100 border border-blue-300' 
                    : 'hover:bg-gray-50 border border-transparent'
                  }
                `}
                onClick={() => onComponentSelect(component.id)}
              >
                {/* Component Icon */}
                <div className="flex-shrink-0 mr-2">
                  {getComponentIcon(component.type)}
                </div>

                {/* Component Name */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {getComponentName(component)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {component.type}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex-shrink-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Reorder buttons */}
                  <div className="flex flex-col">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onComponentReorder(component.id, 'up');
                      }}
                      disabled={reverseIndex === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Mover hacia adelante"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onComponentReorder(component.id, 'down');
                      }}
                      disabled={reverseIndex === state.components.length - 1}
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
                      onComponentToggleVisibility(component.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title={component.isVisible ? 'Ocultar' : 'Mostrar'}
                  >
                    {component.isVisible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-gray-400" />
                    )}
                  </button>

                  {/* Lock toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComponentToggleLock(component.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title={component.isLocked ? 'Desbloquear' : 'Bloquear'}
                  >
                    {component.isLocked ? (
                      <Lock className="w-3 h-3 text-orange-600" />
                    ) : (
                      <Unlock className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          <p>💡 <strong>Consejo:</strong> Usa Ctrl/Cmd + click para seleccionar múltiples componentes</p>
        </div>
      </div>
    </div>
  );
}; 