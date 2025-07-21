// =====================================
// STYLES TAB - BuilderV3
// =====================================

import React from 'react';
import { 
  Type, 
  Palette, 
  Square,
  Droplet,
  Underline,
  Strikethrough
} from 'lucide-react';
import { TabProps, PropertiesHandlers } from './types';

interface StylesTabProps extends TabProps {
  handlers: PropertiesHandlers;
}

export const StylesTab: React.FC<StylesTabProps> = ({
  selectedComponent,
  multipleSelection,
  handlers
}) => {
  
  if (multipleSelection) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          Selecciona un solo componente para ver sus estilos
        </p>
      </div>
    );
  }

  if (!selectedComponent) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          Selecciona un componente para ver sus estilos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tipografía */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Type className="w-4 h-4 mr-2" />
          Tipografía
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fuente</label>
            <select
              value={selectedComponent?.style?.typography?.fontFamily || 'Inter'}
              onChange={(e) => handlers.handleStyleChange('typography', { 
                ...selectedComponent?.style?.typography, 
                fontFamily: e.target.value 
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Poppins">Poppins</option>
              <option value="'Calibri', Arial, sans-serif">Calibri</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño</label>
              <input
                type="number"
                value={selectedComponent?.style?.typography?.fontSize || 16}
                onChange={(e) => handlers.handleStyleChange('typography', { 
                  ...selectedComponent?.style?.typography, 
                  fontSize: parseFloat(e.target.value) || 16 
                })}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="8"
                max="200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Peso</label>
              <select
                value={selectedComponent?.style?.typography?.fontWeight || 'normal'}
                onChange={(e) => handlers.handleStyleChange('typography', { 
                  ...selectedComponent?.style?.typography, 
                  fontWeight: e.target.value 
                })}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="300">Ligera</option>
                <option value="400">Normal</option>
                <option value="500">Mediana</option>
                <option value="600">Semi-negrita</option>
                <option value="700">Negrita</option>
                <option value="800">Extra-negrita</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alineación</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { value: 'left', label: 'Izquierda', icon: '⬅️' },
                { value: 'center', label: 'Centro', icon: '↔️' },
                { value: 'right', label: 'Derecha', icon: '➡️' },
                { value: 'justify', label: 'Justificar', icon: '═' }
              ].map(align => (
                <button
                  key={align.value}
                  onClick={() => handlers.handleStyleChange('typography', { 
                    ...selectedComponent?.style?.typography, 
                    textAlign: align.value 
                  })}
                  title={align.label}
                  className={`px-2 py-2 text-xs rounded transition-all ${
                    selectedComponent?.style?.typography?.textAlign === align.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm'
                      : 'bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {align.icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Decoración</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { value: 'underline', label: 'Subrayado', icon: <Underline className="w-4 h-4" /> },
                { value: 'line-through', label: 'Tachado', icon: <Strikethrough className="w-4 h-4" /> }
              ].map(deco => (
                <button
                  key={deco.value}
                  onClick={() => handlers.handleStyleChange('typography', { 
                    ...selectedComponent?.style?.typography, 
                    textDecoration: selectedComponent?.style?.typography?.textDecoration === deco.value ? 'none' : deco.value 
                  })}
                  title={deco.label}
                  className={`px-2 py-2 text-xs rounded transition-all flex items-center justify-center ${
                    selectedComponent?.style?.typography?.textDecoration === deco.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm'
                      : 'bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {deco.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Colores */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Palette className="w-4 h-4 mr-2" />
          Colores
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Color del texto</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={selectedComponent?.style?.color?.color || '#000000'}
                onChange={(e) => handlers.handleStyleChange('color', { 
                  ...selectedComponent?.style?.color, 
                  color: e.target.value 
                })}
                className="w-10 h-10 rounded border border-gray-300 p-0.5"
              />
              <input
                type="text"
                value={selectedComponent?.style?.color?.color || '#000000'}
                onChange={(e) => handlers.handleStyleChange('color', { 
                  ...selectedComponent?.style?.color, 
                  color: e.target.value 
                })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#000000"
              />
              {'EyeDropper' in window && (
                <button
                  onClick={async () => {
                    if (!selectedComponent) return;
                    const eyeDropper = new (window as any).EyeDropper();
                    try {
                      const result = await eyeDropper.open();
                      handlers.handleStyleChange('color', { 
                        ...selectedComponent.style?.color, 
                        color: result.sRGBHex 
                      });
                    } catch (e) {
                      console.log('Cuentagotas cerrado por el usuario.');
                    }
                  }}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  title="Usar cuentagotas para seleccionar color"
                >
                  <Droplet className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Color de fondo</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={
                  selectedComponent?.style?.color?.backgroundColor && selectedComponent.style.color.backgroundColor !== 'transparent'
                    ? selectedComponent.style.color.backgroundColor
                    : '#ffffff'
                }
                onChange={(e) => handlers.handleStyleChange('color', { 
                  ...selectedComponent?.style?.color, 
                  backgroundColor: e.target.value 
                })}
                className="w-10 h-10 rounded border border-gray-300 p-0.5"
              />
              <input
                type="text"
                value={selectedComponent?.style?.color?.backgroundColor || ''}
                onChange={(e) => handlers.handleStyleChange('color', { 
                  ...selectedComponent?.style?.color, 
                  backgroundColor: e.target.value 
                })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="transparent o #ffffff"
              />
              {'EyeDropper' in window && (
                <button
                  onClick={async () => {
                    if (!selectedComponent) return;
                    const eyeDropper = new (window as any).EyeDropper();
                    try {
                      const result = await eyeDropper.open();
                      handlers.handleStyleChange('color', { 
                        ...selectedComponent.style?.color, 
                        backgroundColor: result.sRGBHex 
                      });
                    } catch (e) {
                      console.log('Cuentagotas cerrado por el usuario.');
                    }
                  }}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  title="Usar cuentagotas para seleccionar color"
                >
                  <Droplet className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bordes */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Square className="w-4 h-4 mr-2" />
          Bordes
        </h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Grosor</label>
              <input
                type="number"
                value={selectedComponent?.style?.border?.width || 0}
                onChange={(e) => handlers.handleStyleChange('border', { 
                  ...selectedComponent?.style?.border, 
                  width: Number(e.target.value) 
                })}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Estilo</label>
              <select
                value={selectedComponent?.style?.border?.style || 'solid'}
                onChange={(e) => handlers.handleStyleChange('border', { 
                  ...selectedComponent?.style?.border, 
                  style: e.target.value 
                })}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">Ninguno</option>
                <option value="solid">Sólido</option>
                <option value="dashed">Guiones</option>
                <option value="dotted">Puntos</option>
                <option value="double">Doble</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Color del borde</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={selectedComponent?.style?.border?.color || '#000000'}
                onChange={(e) => handlers.handleStyleChange('border', { 
                  ...selectedComponent?.style?.border, 
                  color: e.target.value 
                })}
                className="w-10 h-10 rounded border border-gray-300 p-0.5"
              />
              <input
                type="text"
                value={selectedComponent?.style?.border?.color || '#000000'}
                onChange={(e) => handlers.handleStyleChange('border', { 
                  ...selectedComponent?.style?.border, 
                  color: e.target.value 
                })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Radio de esquinas</label>
            <input
              type="number"
              value={selectedComponent?.style?.border?.radius?.topLeft || 0}
              onChange={(e) => {
                const radius = Number(e.target.value);
                handlers.handleStyleChange('border', { 
                  ...selectedComponent?.style?.border, 
                  radius: {
                    topLeft: radius,
                    topRight: radius,
                    bottomLeft: radius,
                    bottomRight: radius
                  }
                });
              }}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="50"
            />
          </div>
        </div>
      </div>

      {/* Efectos */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Efectos</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Opacidad ({Math.round((selectedComponent?.style?.effects?.opacity ?? 1) * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedComponent?.style?.effects?.opacity ?? 1}
              onChange={(e) => handlers.handleStyleChange('effects', { 
                ...selectedComponent?.style?.effects, 
                opacity: parseFloat(e.target.value) 
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 