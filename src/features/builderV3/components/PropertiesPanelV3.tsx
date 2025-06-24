// =====================================
// SPEED BUILDER V3 - ADVANCED PROPERTIES PANEL (4 TABS)
// =====================================

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Settings, 
  Type, 
  Palette, 
  Move, 
  RotateCw, 
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  Database,
  Link,
  Zap,
  DollarSign,
  Tag,
  Calendar,
  Hash,
  Droplet,
  Square,
  FileImage,
  QrCode,
  Upload
} from 'lucide-react';
import { BuilderStateV3, DraggableComponentV3, PositionV3, SizeV3 } from '../types';
import { processDynamicContent, defaultMockData, getAvailableFields } from '../../../utils/dynamicContentProcessor';

interface PropertiesPanelV3Props {
  state: BuilderStateV3;
  activeTab: 'properties' | 'styles' | 'content' | 'data';
  onTabChange: (tab: 'properties' | 'styles' | 'content' | 'data') => void;
  onComponentUpdate: (componentId: string, updates: Partial<DraggableComponentV3>) => void;
  onComponentDelete: (componentId: string) => void;
  onComponentDuplicate: (componentId: string) => void;
  onComponentToggleVisibility: (componentId: string) => void;
  onComponentToggleLock: (componentId: string) => void;
}

export const PropertiesPanelV3: React.FC<PropertiesPanelV3Props> = ({
  state,
  activeTab,
  onTabChange,
  onComponentUpdate,
  onComponentDelete,
  onComponentDuplicate,
  onComponentToggleVisibility,
  onComponentToggleLock
}) => {
  const selectedComponent = state?.canvas?.selectedComponentIds?.length === 1 
    ? state.components?.find(c => c.id === state.canvas.selectedComponentIds[0])
    : null;

  const multipleSelection = (state?.canvas?.selectedComponentIds?.length || 0) > 1;
  const [dynamicPreview, setDynamicPreview] = useState<string>('');

  // Debug logging para entender el problema de las pestañas
  useEffect(() => {
    console.log('🔍 PropertiesPanelV3 - activeTab changed:', activeTab);
  }, [activeTab]);

  // Función mejorada para cambio de pestañas con logging
  const handleTabChange = useCallback((tabId: 'properties' | 'styles' | 'content' | 'data') => {
    console.log('🔄 PropertiesPanelV3 - handleTabChange called:', tabId);
    console.log('🔄 Current activeTab:', activeTab);
    onTabChange(tabId);
  }, [activeTab, onTabChange]);

  // =====================
  // DYNAMIC DATA OPTIONS (usando procesador compartido)
  // =====================

  const availableFields = getAvailableFields();
  
  const sapFieldOptions = availableFields.slice(0, 8).map(field => ({
    ...field,
    icon: field.value.includes('price') ? DollarSign : 
          field.value.includes('sku') ? Hash :
          field.value.includes('description') ? Type : Tag
  }));

  const promotionFieldOptions = availableFields.slice(8).map(field => ({
    ...field,
    icon: field.value.includes('price') || field.value.includes('amount') ? DollarSign :
          field.value.includes('date') ? Calendar : Tag
  }));

  // =====================
  // EVENT HANDLERS
  // =====================

  const handlePositionChange = (field: keyof PositionV3, value: number) => {
    if (!selectedComponent) return;
    
    onComponentUpdate(selectedComponent.id, {
      position: {
        ...selectedComponent.position,
        [field]: value
      }
    });
  };

  const handleSizeChange = (field: keyof SizeV3, value: number) => {
    if (!selectedComponent) return;
    
    onComponentUpdate(selectedComponent.id, {
      size: {
        ...selectedComponent.size,
        [field]: value
      }
    });
  };

  const handleStyleChange = (field: string, value: any) => {
    if (!selectedComponent) return;

    onComponentUpdate(selectedComponent.id, {
      style: {
        ...selectedComponent.style,
        [field]: value
      } as any
    });
  };

  const handleContentChange = (field: string, value: any) => {
    if (!selectedComponent) return;

    onComponentUpdate(selectedComponent.id, {
      content: {
        ...selectedComponent.content,
        [field]: value
      } as any
    });

    // Actualizar vista previa en tiempo real
    updateDynamicPreview(value, field);
  };

  // =====================
  // DYNAMIC PREVIEW LOGIC (actualizado para usar procesador compartido)
  // =====================

  const updateDynamicPreview = (content: string, field: string) => {
    if (field !== 'staticValue' && field !== 'dynamicTemplate') return;

    if (!selectedComponent) return;

    // Crear un componente temporal con el nuevo contenido para procesarlo
    const tempComponent = {
      ...selectedComponent,
      content: {
        ...selectedComponent.content,
        [field]: content
      }
    };

    const processedValue = processDynamicContent(tempComponent, defaultMockData);
    setDynamicPreview(processedValue);
  };

  const renderPreviewValue = () => {
    if (!selectedComponent) {
      return 'Sin componente seleccionado';
    }
    
    // Usar el procesador compartido para obtener el valor real
    const processedValue = processDynamicContent(selectedComponent, defaultMockData);
    return processedValue;
  };

  // =====================
  // TAB RENDER FUNCTIONS
  // =====================

  const renderPropertiesTab = () => (
    <div className="space-y-6">
      {/* Posición */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Move className="w-4 h-4 mr-2" />
          Posición
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">X</label>
            <input
              type="number"
              value={Math.round(selectedComponent?.position.x || 0)}
              onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Y</label>
            <input
              type="number"
              value={Math.round(selectedComponent?.position.y || 0)}
              onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tamaño */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Move className="w-4 h-4 mr-2" />
          Tamaño
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ancho</label>
            <input
              type="number"
              value={Math.round(selectedComponent?.size.width || 0)}
              onChange={(e) => handleSizeChange('width', Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alto</label>
            <input
              type="number"
              value={Math.round(selectedComponent?.size.height || 0)}
              onChange={(e) => handleSizeChange('height', Number(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Checkbox proporcional */}
        <div className="mt-3">
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

      {/* Configuración de Etiqueta Personalizable */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          Etiqueta Personalizada
        </h4>
        
        {/* Mostrar/Ocultar Etiqueta */}
        <div className="mb-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedComponent?.customLabel?.show !== false}
              onChange={(e) => {
                if (!selectedComponent) return;
                onComponentUpdate(selectedComponent.id, {
                  customLabel: {
                    ...selectedComponent.customLabel,
                    name: selectedComponent.customLabel?.name || 'Texto Dinámico',
                    color: selectedComponent.customLabel?.color || '#3b82f6',
                    show: e.target.checked
                  }
                });
              }}
              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-xs text-gray-700">Mostrar etiqueta</span>
          </label>
        </div>

        {selectedComponent?.customLabel?.show !== false && (
          <>
            {/* Nombre de la Etiqueta */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nombre de la etiqueta
              </label>
              <input
                type="text"
                value={selectedComponent?.customLabel?.name || ''}
                onChange={(e) => {
                  if (!selectedComponent) return;
                  onComponentUpdate(selectedComponent.id, {
                    customLabel: {
                      ...selectedComponent.customLabel,
                      name: e.target.value,
                      color: selectedComponent.customLabel?.color || '#3b82f6',
                      show: selectedComponent.customLabel?.show !== false
                    }
                  });
                }}
                placeholder="Ej: Título Principal, Precio Oferta..."
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Color de Fondo */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Color de fondo
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedComponent?.customLabel?.color || '#3b82f6'}
                  onChange={(e) => onComponentUpdate(selectedComponent?.id || '', {
                    customLabel: {
                      ...selectedComponent?.customLabel,
                      name: selectedComponent?.customLabel?.name || 'Texto Dinámico',
                      color: e.target.value,
                      show: selectedComponent?.customLabel?.show !== false
                    }
                  })}
                  className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-500">
                  {selectedComponent?.customLabel?.color || '#3b82f6'}
                </span>
              </div>
            </div>

            {/* Colores Predefinidos */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Colores rápidos
              </label>
              <div className="grid grid-cols-6 gap-1">
                {[
                  '#3b82f6', // Azul
                  '#ef4444', // Rojo  
                  '#10b981', // Verde
                  '#f59e0b', // Amarillo
                  '#8b5cf6', // Púrpura
                  '#06b6d4', // Cian
                  '#f97316', // Naranja
                  '#84cc16', // Lima
                  '#ec4899', // Rosa
                  '#6b7280', // Gris
                  '#1f2937', // Gris oscuro
                  '#dc2626'  // Rojo oscuro
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => onComponentUpdate(selectedComponent?.id || '', {
                      customLabel: {
                        ...selectedComponent?.customLabel,
                        name: selectedComponent?.customLabel?.name || 'Texto Dinámico',
                        color: color,
                        show: selectedComponent?.customLabel?.show !== false
                      }
                    })}
                    className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Color del Texto */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Color del texto
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedComponent?.customLabel?.textColor || '#ffffff'}
                  onChange={(e) => onComponentUpdate(selectedComponent?.id || '', {
                    customLabel: {
                      ...selectedComponent?.customLabel,
                      name: selectedComponent?.customLabel?.name || 'Texto Dinámico',
                      color: selectedComponent?.customLabel?.color || '#3b82f6',
                      textColor: e.target.value,
                      show: selectedComponent?.customLabel?.show !== false
                    }
                  })}
                  className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-500">
                  {selectedComponent?.customLabel?.textColor || '#ffffff'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transformación */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <RotateCw className="w-4 h-4 mr-2" />
          Transformación
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Rotación (°)</label>
            <input
              type="number"
              value={selectedComponent?.position.rotation || 0}
              onChange={(e) => handlePositionChange('rotation', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="360"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Escala</label>
            <input
              type="number"
              value={selectedComponent?.position.scaleX || 1}
              onChange={(e) => {
                if (!selectedComponent) return;
                const scale = parseFloat(e.target.value) || 1;
                onComponentUpdate(selectedComponent.id, {
                  position: {
                    ...selectedComponent.position,
                    scaleX: scale,
                    scaleY: scale
                  }
                });
              }}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0.1"
              max="5"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Acciones
        </h4>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => selectedComponent && onComponentToggleVisibility(selectedComponent.id)}
              className="flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {selectedComponent?.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{selectedComponent?.isVisible ? 'Ocultar' : 'Mostrar'}</span>
            </button>
            
            <button
              onClick={() => selectedComponent && onComponentToggleLock(selectedComponent.id)}
              className="flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {selectedComponent?.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{selectedComponent?.isLocked ? 'Desbloquear' : 'Bloquear'}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => selectedComponent && onComponentDuplicate(selectedComponent.id)}
              className="flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Duplicar</span>
            </button>
            
            <button
              onClick={() => selectedComponent && onComponentDelete(selectedComponent.id)}
              className="flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStylesTab = () => (
    <div className="space-y-6">
      {/* Tipografía */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Type className="w-4 h-4 mr-2" />
          Tipografía
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fuente</label>
            <select
              value={selectedComponent?.style?.typography?.fontFamily || 'Inter'}
              onChange={(e) => handleStyleChange('typography', { 
                ...selectedComponent?.style?.typography, 
                fontFamily: e.target.value 
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Poppins">Poppins</option>
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
                onChange={(e) => handleStyleChange('typography', { 
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
                onChange={(e) => handleStyleChange('typography', { 
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
                  onClick={() => handleStyleChange('typography', { 
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
        </div>
      </div>

      {/* Colores */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
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
                onChange={(e) => handleStyleChange('color', { 
                  ...selectedComponent?.style?.color, 
                  color: e.target.value 
                })}
                className="w-10 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={selectedComponent?.style?.color?.color || '#000000'}
                onChange={(e) => handleStyleChange('color', { 
                  ...selectedComponent?.style?.color, 
                  color: e.target.value 
                })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Color de fondo</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={selectedComponent?.style?.color?.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('color', { 
                  ...selectedComponent?.style?.color, 
                  backgroundColor: e.target.value 
                })}
                className="w-10 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={selectedComponent?.style?.color?.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('color', { 
                  ...selectedComponent?.style?.color, 
                  backgroundColor: e.target.value 
                })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bordes */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
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
                onChange={(e) => handleStyleChange('border', { 
                  ...selectedComponent?.style?.border, 
                  width: parseFloat(e.target.value) || 0 
                })}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                value={selectedComponent?.style?.border?.color || '#000000'}
                onChange={(e) => handleStyleChange('border', { 
                  ...selectedComponent?.style?.border, 
                  color: e.target.value 
                })}
                className="w-full h-10 rounded border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Radio de esquinas</label>
            <input
              type="number"
              value={selectedComponent?.style?.border?.radius?.topLeft || 0}
              onChange={(e) => {
                const radius = parseFloat(e.target.value) || 0;
                handleStyleChange('border', { 
                  ...selectedComponent?.style?.border, 
                  radius: { topLeft: radius, topRight: radius, bottomLeft: radius, bottomRight: radius }
                });
              }}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Estilo</label>
            <select
              value={selectedComponent?.style?.border?.style || 'solid'}
              onChange={(e) => handleStyleChange('border', { 
                ...selectedComponent?.style?.border, 
                style: e.target.value 
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="solid">Sólido</option>
              <option value="dashed">Punteado</option>
              <option value="dotted">Puntos</option>
              <option value="double">Doble</option>
            </select>
          </div>
        </div>
      </div>

      {/* Efectos */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Droplet className="w-4 h-4 mr-2" />
          Efectos
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Opacidad ({Math.round((selectedComponent?.style?.effects?.opacity || 1) * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedComponent?.style?.effects?.opacity || 1}
              onChange={(e) => handleStyleChange('effects', { 
                ...selectedComponent?.style?.effects, 
                opacity: parseFloat(e.target.value) 
              })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentTab = () => (
    <div className="space-y-6">
      {/* Sección específica para componentes de imagen */}
      {selectedComponent && ['image-header', 'image-brand-logo', 'image-promotional', 'image-product'].includes(selectedComponent.type) && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <FileImage className="w-4 h-4 mr-2" />
            Imagen
          </h4>
          
                     {/* Imagen actual */}
           {(selectedComponent?.content as any)?.imageUrl ? (
             <div className="space-y-3">
               <div className="relative border rounded-lg overflow-hidden">
                 <img
                   src={(selectedComponent?.content as any).imageUrl}
                   alt={(selectedComponent?.content as any).imageAlt || 'Imagen'}
                   className="w-full h-32 object-cover"
                 />
                 <button
                   onClick={() => selectedComponent && onComponentUpdate(selectedComponent.id, {
                     content: {
                       ...selectedComponent.content,
                       imageUrl: '',
                       imageAlt: ''
                     }
                   })}
                   className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                 >
                   <Trash2 className="w-3 h-3" />
                 </button>
               </div>
              
              {/* Campo Alt Text */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Texto Alternativo
                </label>
                                 <input
                   type="text"
                   value={(selectedComponent?.content as any)?.imageAlt || ''}
                   onChange={(e) => selectedComponent && onComponentUpdate(selectedComponent.id, {
                     content: {
                       ...selectedComponent.content,
                       imageAlt: e.target.value
                     }
                   })}
                  placeholder="Descripción de la imagen"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Botones de subida */}
              <div className="flex space-x-2">
                <button
                                       onClick={() => {
                     if (!selectedComponent) return;
                     const input = document.createElement('input');
                     input.type = 'file';
                     input.accept = 'image/*';
                     input.onchange = (e) => {
                       const file = (e.target as HTMLInputElement).files?.[0];
                       if (file && selectedComponent) {
                         const url = URL.createObjectURL(file);
                         onComponentUpdate(selectedComponent.id, {
                           content: {
                             ...selectedComponent.content,
                             imageUrl: url,
                             imageAlt: file.name
                           }
                         });
                       }
                     };
                     input.click();
                   }}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Archivo</span>
                </button>
                
                                 <button
                   onClick={() => {
                     if (!selectedComponent) return;
                     const url = prompt('Ingresa la URL de la imagen:');
                     if (url && url.trim()) {
                       onComponentUpdate(selectedComponent.id, {
                         content: {
                           ...selectedComponent.content,
                           imageUrl: url.trim(),
                           imageAlt: 'Imagen desde URL'
                         }
                       });
                     }
                   }}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Link className="w-4 h-4" />
                  <span>URL</span>
                </button>
              </div>
              
              {/* Instrucciones */}
              <p className="text-xs text-gray-500 text-center">
                Sube una imagen o pégala desde una URL
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tipo de contenido para componentes no-imagen */}
      {selectedComponent && !['image-header', 'image-brand-logo', 'image-promotional', 'image-product'].includes(selectedComponent.type) && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Type className="w-4 h-4 mr-2" />
            Tipo de Campo
          </h4>
          <select
            value={(selectedComponent?.content as any)?.fieldType || 'static'}
            onChange={(e) => handleContentChange('fieldType', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="static">Texto Estático</option>
            <option value="dynamic">Texto Dinámico</option>
            <option value="sap-product">SAP - Producto</option>
            <option value="promotion-data">Datos de Promoción</option>
            <option value="qr-code">Código QR</option>
            <option value="image">Imagen</option>
          </select>
        </div>
      )}

      {/* Campo de texto editable */}
      {(selectedComponent?.content as any)?.fieldType === 'static' && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Contenido de Texto</h4>
          <textarea
            value={(selectedComponent?.content as any)?.staticValue || ''}
            onChange={(e) => handleContentChange('staticValue', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Escribe tu contenido aquí..."
          />
        </div>
      )}

      {/* Contenido dinámico con inserción de campos */}
      {(selectedComponent?.content as any)?.fieldType === 'dynamic' && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Contenido Dinámico</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Plantilla de Texto
                <span className="text-blue-600 ml-1">(Usa [campo] para insertar datos)</span>
              </label>
              <textarea
                value={(selectedComponent?.content as any)?.dynamicTemplate || ''}
                onChange={(e) => handleContentChange('dynamicTemplate', e.target.value)}
                placeholder="Ej: Precio: [product_price] - Descuento: [discount_percentage]%"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Selector de campos dinámicos */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Insertar Campos SAP</label>
              <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                {sapFieldOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const currentValue = (selectedComponent?.content as any)?.dynamicTemplate || '';
                      handleContentChange('dynamicTemplate', currentValue + `[${option.value}]`);
                    }}
                    className="text-left px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded flex items-center space-x-2"
                  >
                    <option.icon className="w-3 h-3" />
                    <span>[{option.value}]</span>
                    <span className="text-gray-500">({option.example})</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Insertar Campos de Promoción</label>
              <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                {promotionFieldOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const currentValue = (selectedComponent?.content as any)?.dynamicTemplate || '';
                      handleContentChange('dynamicTemplate', currentValue + `[${option.value}]`);
                    }}
                    className="text-left px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded flex items-center space-x-2"
                  >
                    <option.icon className="w-3 h-3" />
                    <span>[{option.value}]</span>
                    <span className="text-gray-500">({option.example})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Previsualización en tiempo real */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Previsualización en Tiempo Real</span>
        </div>
        <div className="text-sm text-blue-900 font-mono bg-white p-3 rounded border min-h-[2rem] flex items-center">
          {renderPreviewValue()}
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Este es el resultado final que aparecerá en el cartel
        </p>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      {/* Estado de conexión */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Database className="w-4 h-4 mr-2" />
          Estado de Conexiones
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-gray-600" />
              <span className="text-sm">SAP</span>
            </div>
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
              ● Desconectado
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Promociones</span>
            </div>
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
              ● Desconectado
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Supabase</span>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
              ● Conectado
            </span>
          </div>
        </div>
      </div>

      {/* Validación de campos */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Validación</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={(selectedComponent?.content as any)?.validation?.required || false}
              onChange={(e) => handleContentChange('validation', { 
                ...((selectedComponent?.content as any)?.validation || {}), 
                required: e.target.checked 
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Campo obligatorio</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={(selectedComponent?.content as any)?.validation?.showFallback || false}
              onChange={(e) => handleContentChange('validation', { 
                ...((selectedComponent?.content as any)?.validation || {}), 
                showFallback: e.target.checked 
              })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Mostrar valor por defecto si no hay datos</span>
          </label>
        </div>
      </div>

      {/* Campos disponibles */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Campos Disponibles</h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Campos SAP</span>
              <button className="text-xs text-blue-600 hover:text-blue-800">Actualizar</button>
            </div>
            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              <p>{sapFieldOptions.length} campos disponibles</p>
              <p className="mt-1">Última actualización: Nunca</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Campos de Promoción</span>
              <button className="text-xs text-blue-600 hover:text-blue-800">Actualizar</button>
            </div>
            <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
              <p>{promotionFieldOptions.length} campos disponibles</p>
              <p className="mt-1">Última actualización: Nunca</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mapeo personalizado */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Configuración Avanzada</h4>
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p>Configuración avanzada de mapeo de datos SAP y promociones disponible próximamente.</p>
          <p className="mt-2">Incluirá:</p>
          <ul className="list-disc ml-4 mt-1">
            <li>Transformaciones de datos personalizadas</li>
            <li>Formatos de moneda y fecha</li>
            <li>Reglas de validación avanzadas</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // =====================
  // MAIN RENDER
  // =====================

  if (!selectedComponent && !multipleSelection) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'properties', label: 'Propiedades', icon: Settings },
              { id: 'styles', label: 'Estilos', icon: Palette },
              { id: 'content', label: 'Contenido', icon: Type },
              { id: 'data', label: 'Datos', icon: Database }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex-1 px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mx-auto mb-1" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="text-center text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Selecciona un componente para ver sus propiedades</p>
            <p className="text-xs mt-2 text-gray-400">
              Arrastra elementos desde el panel izquierdo o haz clic en componentes existentes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'properties', label: 'Propiedades', icon: Settings },
            { id: 'styles', label: 'Estilos', icon: Palette },
            { id: 'content', label: 'Contenido', icon: Type },
            { id: 'data', label: 'Datos', icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex-1 px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mx-auto mb-1" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">
            {activeTab === 'properties' && 'Propiedades'}
            {activeTab === 'styles' && 'Estilos'}
            {activeTab === 'content' && 'Contenido'}
            {activeTab === 'data' && 'Datos'}
          </h3>
          {selectedComponent && (
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
              {selectedComponent.type}
            </span>
          )}
        </div>
        {multipleSelection && (
          <p className="text-xs text-gray-500 mt-1">
            {state?.canvas?.selectedComponentIds?.length} componentes seleccionados
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-200px)]">
        {selectedComponent && (
          <>
            {activeTab === 'properties' && renderPropertiesTab()}
            {activeTab === 'styles' && renderStylesTab()}
            {activeTab === 'content' && renderContentTab()}
            {activeTab === 'data' && renderDataTab()}
          </>
        )}

        {multipleSelection && (
          <div className="text-center text-gray-500">
            <p className="text-sm">Edición múltiple disponible próximamente</p>
            <p className="text-xs mt-2">
              Podrás editar propiedades comunes de varios elementos a la vez
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 