// =====================================
// PROPERTIES TAB - BuilderV3
// =====================================

import React from 'react';
import { 
  Move, 
  RotateCw, 
  Layers,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy
} from 'lucide-react';
import { UnitConverter } from '../../utils/unitConverter';
import { TabProps, PropertiesHandlers } from './types';

interface PropertiesTabProps extends TabProps {
  handlers: PropertiesHandlers;
}

export const PropertiesTab: React.FC<PropertiesTabProps> = ({
  selectedComponent,
  multipleSelection,
  onComponentUpdate,
  onComponentDelete,
  onComponentDuplicate,
  onComponentToggleVisibility,
  onComponentToggleLock,
  handlers
}) => {
  
  if (multipleSelection) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          Selecciona un solo componente para ver sus propiedades
        </p>
      </div>
    );
  }

  if (!selectedComponent) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          Selecciona un componente para ver sus propiedades
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Dimensiones y Posición */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Move className="w-4 h-4 mr-2" />
          Dimensiones
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">X (mm)</label>
            <input
              type="number"
              value={Math.round(UnitConverter.pxToMm(selectedComponent?.position.x || 0))}
              onChange={(e) => handlers.handlePositionChange('x', UnitConverter.mmToPx(Number(e.target.value)))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y (mm)</label>
            <input
              type="number"
              value={Math.round(UnitConverter.pxToMm(selectedComponent?.position.y || 0))}
              onChange={(e) => handlers.handlePositionChange('y', UnitConverter.mmToPx(Number(e.target.value)))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ancho (mm)</label>
            <input
              type="number"
              value={Math.round(UnitConverter.pxToMm(selectedComponent?.size.width || 0))}
              onChange={(e) => handlers.handleSizeChange('width', UnitConverter.mmToPx(Number(e.target.value)))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Alto (mm)</label>
            <input
              type="number"
              value={Math.round(UnitConverter.pxToMm(selectedComponent?.size.height || 0))}
              onChange={(e) => handlers.handleSizeChange('height', UnitConverter.mmToPx(Number(e.target.value)))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Checkbox proporcional */}
        <div className="mt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedComponent?.size.isProportional || false}
              onChange={(e) => {
                if (!selectedComponent) return;
                onComponentUpdate(selectedComponent.id, {
                  size: {
                    ...selectedComponent.size,
                    isProportional: e.target.checked
                  }
                });
              }}
              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-xs text-gray-700">Mantener proporción</span>
          </label>
        </div>
      </div>

      {/* Transformaciones */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <RotateCw className="w-4 h-4 mr-2" />
          Transformaciones
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Rotación (°)</label>
            <input
              type="number"
              value={selectedComponent?.position.rotation || 0}
              onChange={(e) => handlers.handlePositionChange('rotation', Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              min="-360"
              max="360"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Z-Index</label>
            <input
              type="number"
              value={selectedComponent?.position.z || 0}
              onChange={(e) => handlers.handlePositionChange('z', Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Escala X</label>
            <input
              type="number"
              step="0.1"
              value={selectedComponent?.position.scaleX || 1}
              onChange={(e) => handlers.handlePositionChange('scaleX', Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              min="0.1"
              max="3"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Escala Y</label>
            <input
              type="number"
              step="0.1"
              value={selectedComponent?.position.scaleY || 1}
              onChange={(e) => handlers.handlePositionChange('scaleY', Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              min="0.1"
              max="3"
            />
          </div>
        </div>
      </div>

      {/* Estado del componente */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Layers className="w-4 h-4 mr-2" />
          Estado
        </h4>
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="text-xs text-gray-700 flex items-center">
              {selectedComponent.isVisible ? <EyeOff className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
              Visible
            </span>
            <input
              type="checkbox"
              checked={selectedComponent.isVisible}
              onChange={() => onComponentToggleVisibility(selectedComponent.id)}
              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-xs text-gray-700 flex items-center">
              {selectedComponent.isLocked ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
              Bloqueado
            </span>
            <input
              type="checkbox"
              checked={selectedComponent.isLocked}
              onChange={() => onComponentToggleLock(selectedComponent.id)}
              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Acciones */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Acciones</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => onComponentDuplicate(selectedComponent.id)}
            className="flex-1 flex items-center justify-center px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Copy className="w-3 h-3 mr-1" />
            Duplicar
          </button>
          <button
            onClick={() => onComponentDelete(selectedComponent.id)}
            className="flex-1 flex items-center justify-center px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}; 