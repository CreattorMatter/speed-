// =====================================
// PROPERTIES TAB - BuilderV3
// =====================================

import React from 'react';
import { 
  Move, 
  RotateCw, 
  Trash2,
  Copy,
  Tag
} from 'lucide-react';
import { UnitConverter } from '../../utils/unitConverter';
import { TabProps, PropertiesHandlers } from './types';

interface PropertiesTabProps extends TabProps {
  handlers: PropertiesHandlers;
}

// Colores predefinidos para las etiquetas
const LABEL_COLORS = [
  { name: 'Rojo', value: '#ef4444', bgClass: 'bg-red-500' },
  { name: 'Naranja', value: '#f97316', bgClass: 'bg-orange-500' },
  { name: 'Amarillo', value: '#eab308', bgClass: 'bg-yellow-500' },
  { name: 'Verde', value: '#22c55e', bgClass: 'bg-green-500' },
  { name: 'Azul', value: '#3b82f6', bgClass: 'bg-blue-500' },
  { name: 'Púrpura', value: '#8b5cf6', bgClass: 'bg-purple-500' },
  { name: 'Rosa', value: '#ec4899', bgClass: 'bg-pink-500' },
  { name: 'Gris', value: '#6b7280', bgClass: 'bg-gray-500' },
  { name: 'Negro', value: '#000000', bgClass: 'bg-black' },
  { name: 'Blanco', value: '#ffffff', bgClass: 'bg-white border border-gray-300' }
];

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

  // Inicializar customLabel si no existe
  const customLabel = selectedComponent.customLabel || {
    name: '',
    color: '#3b82f6',
    textColor: '#ffffff',
    show: false
  };

  const handleLabelNameChange = (name: string) => {
    onComponentUpdate(selectedComponent.id, {
      customLabel: {
        ...customLabel,
        name
      }
    });
  };

  const handleLabelColorChange = (color: string) => {
    onComponentUpdate(selectedComponent.id, {
      customLabel: {
        ...customLabel,
        color
      }
    });
  };

  const handleLabelShowChange = (show: boolean) => {
    onComponentUpdate(selectedComponent.id, {
      customLabel: {
        ...customLabel,
        show
      }
    });
  };

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
        <div className="grid grid-cols-3 gap-3">
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

      {/* Etiqueta Personalizada */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          Etiqueta Personalizada
        </h4>
        
        {/* Mostrar/Ocultar etiqueta */}
        <div className="mb-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={customLabel.show}
              onChange={(e) => handleLabelShowChange(e.target.checked)}
              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-xs text-gray-700">Mostrar etiqueta</span>
          </label>
        </div>

        {customLabel.show && (
          <div className="space-y-3">
            {/* Nombre de la etiqueta */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre de la etiqueta</label>
              <input
                type="text"
                value={customLabel.name}
                onChange={(e) => handleLabelNameChange(e.target.value)}
                placeholder="Ej: Precio, Título, Logo..."
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Selector de color */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">Color de la etiqueta</label>
              <div className="grid grid-cols-5 gap-2">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleLabelColorChange(color.value)}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all
                      ${customLabel.color === color.value 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:border-gray-500'
                      }
                      ${color.bgClass}
                    `}
                    title={color.name}
                  />
                ))}
              </div>
              
              {/* Input de color personalizado */}
              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">Color personalizado</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={customLabel.color}
                    onChange={(e) => handleLabelColorChange(e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customLabel.color}
                    onChange={(e) => handleLabelColorChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>


          </div>
        )}
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