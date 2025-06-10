// ===============================================
// PROPERTIES PANEL COMPONENT
// ===============================================

import React from 'react';
import { 
  DraggableElement,
  ElementStyle
} from '../../../types/builder-v2';
import { 
  Settings, 
  Type, 
  Palette, 
  Move, 
  Square,
  Eye,
  Lock,
  Trash2
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedElement: DraggableElement | null;
  onElementUpdate: (elementId: string, updates: Partial<DraggableElement>) => void;
  onElementDelete: (elementId: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onElementUpdate,
  onElementDelete
}) => {
  if (!selectedElement) {
    return (
      <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Propiedades
          </h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Sin selección</p>
            <p className="text-sm">Selecciona un elemento para ver sus propiedades</p>
          </div>
        </div>
      </div>
    );
  }

  const updateStyle = (styleUpdates: Partial<ElementStyle>) => {
    onElementUpdate(selectedElement.id, {
      style: {
        ...selectedElement.style,
        ...styleUpdates
      }
    });
  };

  const updateContent = (contentUpdates: Partial<typeof selectedElement.content>) => {
    onElementUpdate(selectedElement.id, {
      content: {
        ...selectedElement.content,
        ...contentUpdates
      }
    });
  };

  const updatePosition = (x?: number, y?: number, z?: number) => {
    onElementUpdate(selectedElement.id, {
      position: {
        ...selectedElement.position,
        ...(x !== undefined && { x }),
        ...(y !== undefined && { y }),
        ...(z !== undefined && { z })
      }
    });
  };

  const updateSize = (width?: number, height?: number) => {
    onElementUpdate(selectedElement.id, {
      size: {
        ...selectedElement.size,
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height })
      }
    });
  };

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Propiedades
          </h2>
          
          <button
            onClick={() => onElementDelete(selectedElement.id)}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
            title="Eliminar elemento"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <div className="font-medium">{selectedElement.name}</div>
          <div className="text-xs text-gray-500">{selectedElement.category} • {selectedElement.type}</div>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          
          {/* General Properties */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              General
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={selectedElement.isVisible}
                  onChange={(e) => onElementUpdate(selectedElement.id, { isVisible: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="visible" className="text-sm text-gray-700 flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  Visible
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="locked"
                  checked={selectedElement.isLocked}
                  onChange={(e) => onElementUpdate(selectedElement.id, { isLocked: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="locked" className="text-sm text-gray-700 flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  Bloqueado
                </label>
              </div>
            </div>
          </div>

          {/* Position & Size */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Move className="w-4 h-4" />
              Posición y Tamaño
            </h3>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">X</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.position.x)}
                  onChange={(e) => updatePosition(parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.position.y)}
                  onChange={(e) => updatePosition(undefined, parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ancho</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.size.width)}
                  onChange={(e) => updateSize(parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alto</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.size.height)}
                  onChange={(e) => updateSize(undefined, parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Z-Index</label>
              <input
                type="number"
                value={selectedElement.position.z}
                onChange={(e) => updatePosition(undefined, undefined, parseInt(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Content */}
          {selectedElement.content?.text !== undefined && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Contenido
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Texto</label>
                <textarea
                  value={selectedElement.content.text || ''}
                  onChange={(e) => updateContent({ text: e.target.value })}
                  rows={3}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Ingresa el texto..."
                />
              </div>
            </div>
          )}

          {/* Header Image Upload */}
          {selectedElement.type === 'header-imagen' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Imagen
              </h3>
              
              {selectedElement.content?.imageUrl ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={selectedElement.content.imageUrl}
                      alt={selectedElement.content.imageAlt || 'Header'}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      onClick={() => updateContent({ imageUrl: undefined, imageAlt: undefined })}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remover imagen"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={selectedElement.content.imageAlt || ''}
                      onChange={(e) => updateContent({ imageAlt: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Descripción de la imagen"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded">
                  <p className="text-sm text-gray-500 mb-2">No hay imagen cargada</p>
                  <p className="text-xs text-gray-400">Haz clic en el elemento del canvas para subir una imagen</p>
                </div>
              )}
            </div>
          )}

          {/* Style Properties */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Estilo
            </h3>
            
            <div className="space-y-3">
              {/* Font Size */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño de fuente</label>
                <input
                  type="number"
                  value={selectedElement.style?.fontSize || 16}
                  onChange={(e) => updateStyle({ fontSize: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="8"
                  max="72"
                />
              </div>

              {/* Font Weight */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Peso de fuente</label>
                <select
                  value={selectedElement.style?.fontWeight || 'normal'}
                  onChange={(e) => updateStyle({ fontWeight: e.target.value as any })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                  <option value="extrabold">Extra Bold</option>
                </select>
              </div>

              {/* Text Align */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alineación</label>
                <select
                  value={selectedElement.style?.textAlign || 'left'}
                  onChange={(e) => updateStyle({ textAlign: e.target.value as any })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="left">Izquierda</option>
                  <option value="center">Centro</option>
                  <option value="right">Derecha</option>
                  <option value="justify">Justificado</option>
                </select>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color de texto</label>
                  <input
                    type="color"
                    value={selectedElement.style?.color || '#000000'}
                    onChange={(e) => updateStyle({ color: e.target.value })}
                    className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color de fondo</label>
                  <input
                    type="color"
                    value={selectedElement.style?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Border */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Borde</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={selectedElement.style?.borderWidth || 0}
                    onChange={(e) => updateStyle({ borderWidth: parseFloat(e.target.value) })}
                    placeholder="Grosor"
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                  />
                  <input
                    type="color"
                    value={selectedElement.style?.borderColor || '#000000'}
                    onChange={(e) => updateStyle({ borderColor: e.target.value })}
                    className="h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Radio del borde</label>
                <input
                  type="number"
                  value={selectedElement.style?.borderRadius || 0}
                  onChange={(e) => updateStyle({ borderRadius: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                />
              </div>

              {/* Opacity */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Opacidad ({Math.round((selectedElement.style?.opacity || 1) * 100)}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedElement.style?.opacity || 1}
                  onChange={(e) => updateStyle({ opacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Element Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Square className="w-4 h-4" />
              Información
            </h3>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>ID:</span>
                <span className="font-mono">{selectedElement.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span>{selectedElement.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Categoría:</span>
                <span>{selectedElement.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Arrastrable:</span>
                <span>{selectedElement.isDraggable ? 'Sí' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Redimensionable:</span>
                <span>{selectedElement.isResizable ? 'Sí' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Versión:</span>
                <span>{selectedElement.version}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => onElementDelete(selectedElement.id)}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar Elemento
        </button>
      </div>
    </div>
  );
}; 