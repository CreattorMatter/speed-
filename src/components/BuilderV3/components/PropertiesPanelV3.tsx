// =====================================
// SPEED BUILDER V3 - ADVANCED PROPERTIES PANEL
// =====================================

import React, { useState, useCallback } from 'react';
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
  QrCode
} from 'lucide-react';
import { BuilderStateV3, DraggableComponentV3, PositionV3, SizeV3 } from '../../../types/builder-v3';

interface PropertiesPanelV3Props {
  state: BuilderStateV3;
  onComponentUpdate: (componentId: string, updates: Partial<DraggableComponentV3>) => void;
  onComponentDelete: (componentId: string) => void;
  onComponentDuplicate: (componentId: string) => void;
  onComponentToggleVisibility: (componentId: string) => void;
  onComponentToggleLock: (componentId: string) => void;
}

export const PropertiesPanelV3: React.FC<PropertiesPanelV3Props> = ({
  state,
  onComponentUpdate,
  onComponentDelete,
  onComponentDuplicate,
  onComponentToggleVisibility,
  onComponentToggleLock
}) => {
  const [activeSection, setActiveSection] = useState<string>('position');
  const selectedComponent = state?.canvas?.selectedComponentIds?.length === 1 
    ? state.components?.find(c => c.id === state.canvas.selectedComponentIds[0])
    : null;

  const multipleSelection = (state?.canvas?.selectedComponentIds?.length || 0) > 1;

  // =====================
  // DYNAMIC DATA OPTIONS
  // =====================

  const sapFieldOptions = [
    { value: 'product-name', label: 'Nombre del Producto', icon: Tag },
    { value: 'product-sku', label: 'SKU', icon: Hash },
    { value: 'product-brand', label: 'Marca', icon: Tag },
    { value: 'product-category', label: 'Categoría', icon: Tag },
    { value: 'price-original', label: 'Precio Original', icon: DollarSign },
    { value: 'price-without-tax', label: 'Precio sin Impuestos', icon: DollarSign },
    { value: 'product-origin', label: 'Origen', icon: Tag },
    { value: 'product-description', label: 'Descripción', icon: Type }
  ];

  const promotionFieldOptions = [
    { value: 'price-now', label: 'Precio Ahora', icon: DollarSign },
    { value: 'discount-percentage', label: 'Descuento %', icon: DollarSign },
    { value: 'discount-amount', label: 'Descuento Monto', icon: DollarSign },
    { value: 'date-from', label: 'Fecha Desde', icon: Calendar },
    { value: 'date-to', label: 'Fecha Hasta', icon: Calendar },
    { value: 'promotion-name', label: 'Nombre Promoción', icon: Tag }
  ];

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
  };

  // =====================
  // RENDER FUNCTIONS
  // =====================

  const renderSection = (title: string, icon: React.ReactNode, sectionKey: string, children: React.ReactNode) => {
    const isActive = activeSection === sectionKey;
    
    return (
      <div className="mb-4">
        <button
          onClick={() => setActiveSection(isActive ? '' : sectionKey)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium text-sm">{title}</span>
          </div>
          {isActive ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        
        {isActive && (
          <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-white">
            {children}
          </div>
        )}
      </div>
    );
  };

  const renderPositionControls = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">X</label>
          <input
            type="number"
            value={selectedComponent?.position.x || 0}
            onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Y</label>
          <input
            type="number"
            value={selectedComponent?.position.y || 0}
            onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ancho</label>
          <input
            type="number"
            value={selectedComponent?.size.width || 0}
            onChange={(e) => handleSizeChange('width', parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Alto</label>
          <input
            type="number"
            value={selectedComponent?.size.height || 0}
            onChange={(e) => handleSizeChange('height', parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Rotación</label>
          <input
            type="number"
            value={selectedComponent?.position.rotation || 0}
            onChange={(e) => handlePositionChange('rotation', parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Z-Index</label>
          <input
            type="number"
            value={selectedComponent?.position.z || 0}
            onChange={(e) => handlePositionChange('z', parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderStyleControls = () => (
    <div className="space-y-4">
      {/* Color del texto */}
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
            className="w-8 h-8 rounded border border-gray-300"
          />
          <input
            type="text"
            value={selectedComponent?.style?.color?.color || '#000000'}
            onChange={(e) => handleStyleChange('color', { 
              ...selectedComponent?.style?.color, 
              color: e.target.value 
            })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Color de fondo */}
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
            className="w-8 h-8 rounded border border-gray-300"
          />
          <input
            type="text"
            value={selectedComponent?.style?.color?.backgroundColor || '#ffffff'}
            onChange={(e) => handleStyleChange('color', { 
              ...selectedComponent?.style?.color, 
              backgroundColor: e.target.value 
            })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tamaño de fuente */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño de fuente</label>
        <input
          type="number"
          value={selectedComponent?.style?.typography?.fontSize || 16}
          onChange={(e) => handleStyleChange('typography', { 
            ...selectedComponent?.style?.typography, 
            fontSize: parseFloat(e.target.value) || 16 
          })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Familia de fuente */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Fuente</label>
        <select
          value={selectedComponent?.style?.typography?.fontFamily || 'Inter'}
          onChange={(e) => handleStyleChange('typography', { 
            ...selectedComponent?.style?.typography, 
            fontFamily: e.target.value 
          })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Peso de fuente */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Peso</label>
        <select
          value={selectedComponent?.style?.typography?.fontWeight || 'normal'}
          onChange={(e) => handleStyleChange('typography', { 
            ...selectedComponent?.style?.typography, 
            fontWeight: e.target.value 
          })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="300">Ligera (300)</option>
          <option value="400">Normal (400)</option>
          <option value="500">Mediana (500)</option>
          <option value="600">Semi-negrita (600)</option>
          <option value="700">Negrita (700)</option>
          <option value="800">Extra-negrita (800)</option>
        </select>
      </div>

      {/* Alineación de texto */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Alineación</label>
        <select
          value={selectedComponent?.style?.typography?.textAlign || 'left'}
          onChange={(e) => handleStyleChange('typography', { 
            ...selectedComponent?.style?.typography, 
            textAlign: e.target.value 
          })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="left">Izquierda</option>
          <option value="center">Centro</option>
          <option value="right">Derecha</option>
          <option value="justify">Justificado</option>
        </select>
      </div>

      {/* Opacidad */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Opacidad</label>
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
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>{Math.round((selectedComponent?.style?.effects?.opacity || 1) * 100)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Bordes */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Borde</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              placeholder="Grosor"
              value={selectedComponent?.style?.border?.width || 0}
              onChange={(e) => handleStyleChange('border', { 
                ...selectedComponent?.style?.border, 
                width: parseFloat(e.target.value) || 0 
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="color"
              value={selectedComponent?.style?.border?.color || '#000000'}
              onChange={(e) => handleStyleChange('border', { 
                ...selectedComponent?.style?.border, 
                color: e.target.value 
              })}
              className="w-full h-8 rounded border border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Esquinas redondeadas */}
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
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderContentControls = () => (
    <div className="space-y-4">
      {/* Tipo de contenido */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Campo</label>
        <select
          value={(selectedComponent?.content as any)?.fieldType || 'static'}
          onChange={(e) => handleContentChange('fieldType', e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="static">Texto Estático</option>
          <option value="dynamic">Texto Dinámico</option>
          <option value="sap-product">SAP - Producto</option>
          <option value="promotion-data">Datos de Promoción</option>
          <option value="qr-code">Código QR</option>
          <option value="image">Imagen</option>
        </select>
      </div>

      {/* Contenido dinámico con variables */}
      {(selectedComponent?.content as any)?.fieldType === 'dynamic' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Contenido Dinámico
            <span className="text-blue-600 text-xs ml-1">(Usa [Variable] para insertar datos)</span>
          </label>
          <textarea
            value={(selectedComponent?.content as any)?.dynamicTemplate || ''}
            onChange={(e) => handleContentChange('dynamicTemplate', e.target.value)}
            placeholder="Ej: Precio sin impuestos: [PrecioSinImpuestos] - Descuento: [DescuentoPorcentaje]%"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-2">Variables disponibles:</p>
            <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
              {[...sapFieldOptions, ...promotionFieldOptions].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    const currentValue = (selectedComponent?.content as any)?.dynamicTemplate || '';
                    const variableName = option.value.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join('');
                    handleContentChange('dynamicTemplate', currentValue + `[${variableName}]`);
                  }}
                  className="text-left px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded flex items-center space-x-1"
                >
                  <option.icon className="w-3 h-3" />
                  <span>[{option.value.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join('')}]</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Texto estático */}
      {(selectedComponent?.content as any)?.fieldType === 'static' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Contenido</label>
          <textarea
            value={(selectedComponent?.content as any)?.staticValue || ''}
            onChange={(e) => handleContentChange('staticValue', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      )}

      {/* Campo directo SAP */}
      {(selectedComponent?.content as any)?.fieldType === 'sap-product' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Campo SAP</label>
          <select
            value={(selectedComponent?.content as any)?.sapField || ''}
            onChange={(e) => handleContentChange('sapField', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar campo...</option>
            {sapFieldOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Campo directo de promoción */}
      {(selectedComponent?.content as any)?.fieldType === 'promotion-data' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Campo de Promoción</label>
          <select
            value={(selectedComponent?.content as any)?.promotionField || ''}
            onChange={(e) => handleContentChange('promotionField', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar campo...</option>
            {promotionFieldOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Configuración QR */}
      {(selectedComponent?.content as any)?.fieldType === 'qr-code' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Contenido QR</label>
          <input
            type="text"
            value={(selectedComponent?.content as any)?.qrContent || ''}
            onChange={(e) => handleContentChange('qrContent', e.target.value)}
            placeholder="URL, texto o campo dinámico"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño QR</label>
            <select
              value={(selectedComponent?.content as any)?.qrSize || 'medium'}
              onChange={(e) => handleContentChange('qrSize', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      )}

      {/* Configuración de imagen */}
      {/* Controles específicos para componentes de imagen */}
      {(selectedComponent?.type === 'image-header' || 
        selectedComponent?.type === 'image-brand-logo' || 
        selectedComponent?.type === 'image-promotional' || 
        selectedComponent?.type === 'image-product') && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Imagen</label>
            
            {/* Mostrar información si hay imagen */}
            {(selectedComponent?.content as any)?.imageUrl && (
              <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-800">Imagen cargada</span>
                </div>
                <img 
                  src={(selectedComponent?.content as any)?.imageUrl} 
                  alt="Preview"
                  className="w-full h-16 object-cover rounded border"
                />
                {(selectedComponent?.content as any)?.imageAlt && (
                  <div className="text-xs text-green-600 mt-1">
                    Alt: {(selectedComponent?.content as any)?.imageAlt}
                  </div>
                )}
              </div>
            )}
            
            {/* URL manual */}
            <div className="space-y-2">
              <input
                type="text"
                value={(selectedComponent?.content as any)?.imageUrl || ''}
                onChange={(e) => handleContentChange('imageUrl', e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <input
                type="text"
                value={(selectedComponent?.content as any)?.imageAlt || ''}
                onChange={(e) => handleContentChange('imageAlt', e.target.value)}
                placeholder="Descripción de la imagen"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ajuste de Imagen</label>
            <select
              value={(selectedComponent?.content as any)?.imageFit || 'cover'}
              onChange={(e) => handleContentChange('imageFit', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cover">Cubrir (Crop automático)</option>
              <option value="contain">Contener (Imagen completa)</option>
              <option value="fill">Llenar (Estirar)</option>
              <option value="scale-down">Reducir si es necesario</option>
              <option value="none">Tamaño original</option>
            </select>
          </div>

          {/* Instrucciones de uso */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="text-xs font-medium text-blue-800 mb-1">💡 Cómo subir imágenes:</div>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Haz clic en el componente para ver la zona de upload</li>
              <li>• Arrastra archivos JPG/PNG directamente</li>
              <li>• O pega una URL en el campo de arriba</li>
              <li>• Formatos soportados: JPG, PNG, WebP</li>
              <li>• Tamaño máximo: 5MB</li>
            </ul>
          </div>
        </div>
      )}

      {(selectedComponent?.content as any)?.fieldType === 'image' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">URL de Imagen</label>
          <input
            type="text"
            value={(selectedComponent?.content as any)?.imageUrl || ''}
            onChange={(e) => handleContentChange('imageUrl', e.target.value)}
            placeholder="https://..."
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Ajuste</label>
            <select
              value={(selectedComponent?.content as any)?.imageFit || 'cover'}
              onChange={(e) => handleContentChange('imageFit', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cover">Cubrir</option>
              <option value="contain">Contener</option>
              <option value="fill">Llenar</option>
              <option value="none">Original</option>
            </select>
          </div>
        </div>
      )}

      {/* Vista previa del valor dinámico */}
      {((selectedComponent?.content as any)?.fieldType === 'dynamic' || 
        (selectedComponent?.content as any)?.fieldType === 'sap-product' || 
        (selectedComponent?.content as any)?.fieldType === 'promotion-data') && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">Vista Previa</span>
          </div>
          <div className="text-sm text-blue-700 font-mono bg-white p-2 rounded border">
            {renderPreviewValue()}
          </div>
        </div>
      )}

      {/* Conexión con datos */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Database className="w-4 h-4 text-gray-600" />
          <span className="text-xs font-medium text-gray-700">Estado de Conexión</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>SAP:</span>
            <span className="text-red-600">●Desconectado</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Promociones:</span>
            <span className="text-red-600">●Desconectado</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreviewValue = () => {
    if (!selectedComponent?.content) return 'Sin datos';
    
    const content = selectedComponent.content as any;
    const { fieldType, dynamicTemplate, sapField, promotionField } = content;
    
    // Datos mock para la vista previa
    const mockData = {
      ProductName: "Producto Ejemplo",
      ProductSku: "SKU123",
      PriceOriginal: "$1.999",
      PriceNow: "$1.499",
      DiscountPercentage: "25",
      DateFrom: "01/12/2024",
      DateTo: "31/12/2024"
    };
    
    if (fieldType === 'dynamic' && dynamicTemplate) {
      let preview = dynamicTemplate;
      Object.entries(mockData).forEach(([key, value]) => {
        preview = preview.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
      });
      return preview;
    }
    
    if (fieldType === 'sap-product' && sapField) {
      const fieldMap: Record<string, string> = {
        'product-name': mockData.ProductName,
        'product-sku': mockData.ProductSku,
        'price-original': mockData.PriceOriginal,
      };
      return fieldMap[sapField] || 'Campo no encontrado';
    }
    
    if (fieldType === 'promotion-data' && promotionField) {
      const fieldMap: Record<string, string> = {
        'price-now': mockData.PriceNow,
        'discount-percentage': mockData.DiscountPercentage + '%',
        'date-from': mockData.DateFrom,
        'date-to': mockData.DateTo,
      };
      return fieldMap[promotionField] || 'Campo no encontrado';
    }
    
    return 'Vista previa no disponible';
  };

  const renderDataControls = () => (
    <div className="space-y-4">
      {/* Asociar Datos - Menú rápido */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Asociar Datos Rápidamente</label>
        <div className="grid grid-cols-1 gap-2">
          <div className="border border-gray-200 rounded-lg p-2">
            <p className="text-xs font-medium text-gray-600 mb-2">Campos SAP</p>
            <div className="grid grid-cols-1 gap-1">
              {sapFieldOptions.slice(0, 4).map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleContentChange('fieldType', 'sap-product');
                    handleContentChange('sapField', option.value);
                  }}
                  className="flex items-center space-x-2 px-2 py-1 text-xs text-left hover:bg-blue-50 rounded"
                >
                  <option.icon className="w-3 h-3 text-gray-500" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-2">
            <p className="text-xs font-medium text-gray-600 mb-2">Campos de Promoción</p>
            <div className="grid grid-cols-1 gap-1">
              {promotionFieldOptions.slice(0, 4).map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleContentChange('fieldType', 'promotion-data');
                    handleContentChange('promotionField', option.value);
                  }}
                  className="flex items-center space-x-2 px-2 py-1 text-xs text-left hover:bg-green-50 rounded"
                >
                  <option.icon className="w-3 h-3 text-gray-500" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Validación y formato */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Validación</label>
        <div className="space-y-2">
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
            <span className="text-xs">Campo obligatorio</span>
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
            <span className="text-xs">Mostrar valor por defecto si no hay datos</span>
          </label>
        </div>
      </div>

      {/* Mapeo personalizado */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Mapeo de Datos</label>
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p>Configuración avanzada de mapeo de datos SAP y promociones disponible próximamente.</p>
        </div>
      </div>
    </div>
  );

  const renderActions = () => (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <button
          onClick={() => selectedComponent && onComponentToggleVisibility(selectedComponent.id)}
          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          {selectedComponent?.isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          <span>{selectedComponent?.isVisible ? 'Ocultar' : 'Mostrar'}</span>
        </button>
        
        <button
          onClick={() => selectedComponent && onComponentToggleLock(selectedComponent.id)}
          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          {selectedComponent?.isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          <span>{selectedComponent?.isLocked ? 'Desbloquear' : 'Bloquear'}</span>
        </button>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => selectedComponent && onComponentDuplicate(selectedComponent.id)}
          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
        >
          <Copy className="w-3 h-3" />
          <span>Duplicar</span>
        </button>
        
        <button
          onClick={() => selectedComponent && onComponentDelete(selectedComponent.id)}
          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );

  if (!selectedComponent && !multipleSelection) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <div className="text-center text-gray-500 mt-8">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">Selecciona un componente para ver sus propiedades</p>
          <p className="text-xs mt-2 text-gray-400">
            Arrastra elementos desde el panel izquierdo o haz clic en componentes existentes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Propiedades</h3>
          {selectedComponent && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
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
      <div className="p-4">
        {selectedComponent && (
          <>
            {renderSection('Posición y Tamaño', <Move className="w-4 h-4" />, 'position', renderPositionControls())}
            {renderSection('Estilos', <Palette className="w-4 h-4" />, 'style', renderStyleControls())}
            {renderSection('Contenido', <Type className="w-4 h-4" />, 'content', renderContentControls())}
            {renderSection('Datos', <Database className="w-4 h-4" />, 'data', renderDataControls())}
            {renderSection('Acciones', <Settings className="w-4 h-4" />, 'actions', renderActions())}
          </>
        )}

        {multipleSelection && (
          <div className="text-center text-gray-500">
            <p className="text-sm">Edición múltiple disponible próximamente</p>
          </div>
        )}
      </div>
    </div>
  );
}; 