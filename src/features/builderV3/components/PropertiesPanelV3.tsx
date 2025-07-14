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
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  Link,
  DollarSign,
  Tag,
  Calendar,
  Hash,
  Droplet,
  Square,
  FileImage,
  QrCode,
  Upload,
  Package,
  MapPin,
  Underline,
  Strikethrough
} from 'lucide-react';
import { BuilderStateV3, DraggableComponentV3, PositionV3, SizeV3, DynamicContentV3 } from '../types';
import { processDynamicContent, defaultMockData, getAvailableFields } from '../../../utils/dynamicContentProcessor';
import { supabase } from '../../../lib/supabaseClient';
import { UnitConverter } from '../utils/unitConverter';

interface PropertiesPanelV3Props {
  state: BuilderStateV3;
  activeTab: 'properties' | 'styles' | 'content';
  onTabChange: (tab: 'properties' | 'styles' | 'content') => void;
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


  // Debug logging para entender el problema de las pestañas
  useEffect(() => {
    console.log('🔍 PropertiesPanelV3 - activeTab changed:', activeTab);
  }, [activeTab]);

  // Función mejorada para cambio de pestañas con logging
  const handleTabChange = useCallback((tabId: 'properties' | 'styles' | 'content') => {
    console.log('🔄 PropertiesPanelV3 - handleTabChange called:', tabId);
    console.log('🔄 Current activeTab:', activeTab);
    onTabChange(tabId);
  }, [activeTab, onTabChange]);

  // =====================
  // DYNAMIC DATA OPTIONS (FILTRADOS SOLO PARA PRODUCTOS)
  // =====================

  const availableFields = getAvailableFields();
  
  // 🎯 SOLO CAMPOS DE PRODUCTOS (primeras 5 categorías)
  // Excluye fechas/promociones que se usan en la cartelera
  const productFieldOptions = availableFields.filter(field => {
    const productRelatedFields = [
      // Información básica del producto
      'product_name', 'product_sku', 'product_ean', 'product_description', 
      'product_brand', 'product_brand_upper', 'product_unit',
      
      // Clasificación y categorías  
      'product_seccion', 'product_grupo', 'product_rubro', 'product_subrubro',
      'classification_complete',
      
      // Sistema de precios
      'product_price', 'price_previous', 'price_base', 'price_without_tax',
      'price_unit_alt', 'discount_percentage', 'discount_amount', 
      'installment_price', 'currency_symbol',
      
      // Origen y ubicación
      'product_origin', 'product_origin_code', 'store_code',
      
      // Stock e inventario
      'stock_available', 'stock_status',
      
      // Formato y estilos básicos
      'price_large', 'price_small', 'product_name_upper', 'ean_formatted'
    ];
    
    return productRelatedFields.includes(field.value);
  }).map(field => ({
    ...field,
    icon: field.value.includes('price') || field.value.includes('discount') ? DollarSign : 
          field.value.includes('sku') || field.value.includes('ean') ? Hash :
          field.value.includes('stock') ? Package :
          field.value.includes('classification') || field.value.includes('seccion') ? Tag :
          field.value.includes('brand') || field.value.includes('name') ? Type : 
          field.value.includes('origin') || field.value.includes('store') ? MapPin : Tag
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
  };

  const handleOutputFormatChange = (field: keyof NonNullable<DynamicContentV3['outputFormat']>, value: any) => {
    if (!selectedComponent) return;
    const currentContent = selectedComponent.content as any;
    const currentOutputFormat = currentContent.outputFormat || {};

    onComponentUpdate(selectedComponent.id, {
        content: {
            ...currentContent,
            outputFormat: {
                ...currentOutputFormat,
                [field]: value
            }
        }
    });
  };

  // 🆕 Función auxiliar para manejar cambios en campo calculado con preview
  const handleCalculatedFieldChange = (expression: string) => {
    if (!selectedComponent) return;
    
    // Intentar calcular preview
    let previewResult = '';
    let errorMessage = '';
    
    try {
      // Reemplazar campos con valores de ejemplo para preview
      let previewExpression = expression
        .replace(/\[product_price\]/g, '99999')
        .replace(/\[discount_percentage\]/g, '15')
        .replace(/\[price_previous\]/g, '119999')
        .replace(/\[stock_available\]/g, '25')
        .replace(/\[price_base\]/g, '85000')
        .replace(/\[price_without_tax\]/g, '85000');
      
      // Validar que solo contenga números, operadores y espacios
      if (previewExpression && /^[0-9+\-*/().\s]+$/.test(previewExpression)) {
        const result = Function(`"use strict"; return (${previewExpression})`)();
        previewResult = isNaN(result) ? 'Error' : result.toString();
      } else if (previewExpression) {
        previewResult = 'Esperando campos...';
      }
    } catch (error) {
      errorMessage = 'Expresión inválida';
      previewResult = 'Error';
    }
    
    handleContentChange('calculatedField', {
      expression,
      availableFields: productFieldOptions.map((opt: any) => opt.value),
      operators: ['+', '-', '*', '/', '(', ')'],
      previewResult,
      errorMessage
    });
  };



  // =====================
  // TAB RENDER FUNCTIONS
  // =====================

  const renderPropertiesTab = () => (
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
                onChange={(e) => handlePositionChange('x', UnitConverter.mmToPx(Number(e.target.value)))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Y (mm)</label>
              <input
                type="number"
                value={Math.round(UnitConverter.pxToMm(selectedComponent?.position.y || 0))}
                onChange={(e) => handlePositionChange('y', UnitConverter.mmToPx(Number(e.target.value)))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ancho (mm)</label>
              <input
                type="number"
                value={Math.round(UnitConverter.pxToMm(selectedComponent?.size.width || 0))}
                onChange={(e) => handleSizeChange('width', UnitConverter.mmToPx(Number(e.target.value)))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Alto (mm)</label>
              <input
                type="number"
                value={Math.round(UnitConverter.pxToMm(selectedComponent?.size.height || 0))}
                onChange={(e) => handleSizeChange('height', UnitConverter.mmToPx(Number(e.target.value)))}
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

      {/* Configuración de Etiqueta Personalizable */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          Etiqueta Personalizada
        </h4>
        
        {/* Mostrar/Ocultar Etiqueta */}
        <div className="mb-2">
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
            <div className="mb-2">
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
                placeholder="Nombre de la etiqueta"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Colores en una sola fila */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fondo</label>
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
                  className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Texto</label>
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
                  className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Colores Predefinidos más compactos */}
            <div className="grid grid-cols-8 gap-1">
              {[
                '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                '#8b5cf6', '#06b6d4', '#f97316', '#6b7280'
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
                  className="w-5 h-5 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Transformación */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
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


    </div>
  );

  const renderStylesTab = () => (
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

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Decoración</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { value: 'underline', label: 'Subrayado', icon: <Underline className="w-4 h-4" /> },
                { value: 'line-through', label: 'Tachado', icon: <Strikethrough className="w-4 h-4" /> }
              ].map(deco => (
                <button
                  key={deco.value}
                  onClick={() => handleStyleChange('typography', { 
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
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Square className="w-4 h-4 mr-2" />
          Bordes
        </h4>
        <div className="space-y-3">
          {/* Checkbox para activar/desactivar borde */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={(selectedComponent?.style?.border?.width || 0) > 0}
                onChange={(e) => {
                  if (!selectedComponent) return;
                  const newWidth = e.target.checked ? 1 : 0;
                  const currentStyle = selectedComponent.style?.border?.style;
                  
                  // If enabling the border and the style is 'none', default it to 'solid' to make it visible.
                  const newStyle = e.target.checked && (!currentStyle || currentStyle === 'none') ? 'solid' : currentStyle;

                  handleStyleChange('border', { 
                    ...selectedComponent?.style?.border, 
                    width: newWidth,
                    color: selectedComponent?.style?.border?.color || '#000000',
                    style: newStyle || 'solid'
                  });
                }}
                className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-xs text-gray-700">Mostrar borde</span>
            </label>
          </div>

          {/* Controles de borde (solo visibles cuando está activado) */}
          {(selectedComponent?.style?.border?.width || 0) > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Grosor</label>
                  <input
                    type="number"
                    value={selectedComponent?.style?.border?.width || 1}
                    onChange={(e) => handleStyleChange('border', { 
                      ...selectedComponent?.style?.border, 
                      width: parseFloat(e.target.value) || 1 
                    })}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
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
             </>
           )}
        </div>
      </div>

      {/* Efectos */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
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
    <div className="space-y-3">
      {/* Sección específica para componentes de imagen - ACTUALIZADA */}
      {selectedComponent && ['image-header', 'image-footer', 'image-background', 'image-brand-logo', 'image-promotional', 'image-product', 'image-decorative'].includes(selectedComponent.type) && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
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

              {/* Color de Fondo con Cuentagotas */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Color de fondo del componente
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={
                      selectedComponent?.style?.color?.backgroundColor && selectedComponent.style.color.backgroundColor !== 'transparent'
                        ? selectedComponent.style.color.backgroundColor
                        : '#ffffff'
                    }
                    onChange={(e) => handleStyleChange('color', { ...selectedComponent?.style?.color, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded border border-gray-300 p-0.5"
                  />
                  <input
                    type="text"
                    value={selectedComponent?.style?.color?.backgroundColor || ''}
                    onChange={(e) => handleStyleChange('color', { ...selectedComponent?.style?.color, backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                    placeholder="transparent o #ffffff"
                  />
                  {'EyeDropper' in window && (
                    <button
                      onClick={async () => {
                        if (!selectedComponent) return;
                        const eyeDropper = new (window as any).EyeDropper();
                        try {
                          const result = await eyeDropper.open();
                          handleStyleChange('color', { ...selectedComponent.style?.color, backgroundColor: result.sRGBHex });
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
                <p className="text-xs text-gray-500 mt-1">Rellena el espacio sobrante si la imagen no tiene las mismas proporciones.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Botones de subida */}
              <div className="flex space-x-2">
                                <button
                   onClick={async () => {
                     if (!selectedComponent) return;
                     const input = document.createElement('input');
                     input.type = 'file';
                     input.accept = 'image/*';
                     input.onchange = async (e) => {
                       const file = (e.target as HTMLInputElement).files?.[0];
                       if (file && selectedComponent) {
                         try {
                           // 🚀 SUBIR A SUPABASE STORAGE EN LUGAR DE BLOB URL
                           
                           // 1. Generar nombre único para Supabase
                           const fileExt = file.name.split('.').pop();
                           const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                           const filePath = `builder/${fileName}`;
                           
                           // 2. Subir a Supabase Storage
                           const { error: uploadError } = await supabase.storage
                             .from('assets')
                             .upload(filePath, file, {
                               cacheControl: '3600',
                               upsert: false
                             });
                           
                           if (uploadError) {
                             throw new Error(`Error al subir: ${uploadError.message}`);
                           }
                           
                           // 3. Obtener URL pública REAL de Supabase
                           const { data } = supabase.storage
                             .from('assets')
                             .getPublicUrl(filePath);
                           
                           // 4. Actualizar componente con URL REAL
                           onComponentUpdate(selectedComponent.id, {
                             content: {
                               ...selectedComponent.content,
                               imageUrl: data.publicUrl, // ✅ URL PERMANENTE DE SUPABASE
                               imageAlt: file.name
                             }
                           });
                           
                           console.log('✅ Imagen subida a Supabase:', data.publicUrl);
                           
                         } catch (error) {
                           console.error('❌ Error subiendo imagen:', error);
                           alert('Error al subir la imagen. Inténtalo de nuevo.');
                         }
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

      {/* Tipo de contenido para componentes no-imagen - SIMPLIFICADO */}
      {selectedComponent && !['image-header', 'image-footer', 'image-background', 'image-brand-logo', 'image-promotional', 'image-product', 'image-decorative'].includes(selectedComponent.type) && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Type className="w-4 h-4 mr-2" />
            Tipo de Campo
          </h4>
          <select
            value={(selectedComponent?.content as any)?.fieldType || 'static'}
            onChange={(e) => {
              const newFieldType = e.target.value;
              handleContentChange('fieldType', newFieldType);
              
              // 🆕 Si se selecciona campo calculado, inicializar calculatedField
              if (newFieldType === 'calculated' && !(selectedComponent?.content as any)?.calculatedField) {
                handleContentChange('calculatedField', {
                  expression: '',
                  availableFields: productFieldOptions.map((opt: any) => opt.value),
                  operators: ['+', '-', '*', '/', '(', ')'],
                  previewResult: '',
                  errorMessage: ''
                });
              }
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="static">Campo Estático</option>
            <option value="dynamic">Campo Dinámico</option>
            <option value="calculated">Campo Calculado</option>
          </select>
        </div>
      )}

      {/* Campo de texto editable */}
      {(selectedComponent?.content as any)?.fieldType === 'static' && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Contenido de Texto</h4>
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
          <h4 className="text-sm font-medium text-gray-900 mb-2">Contenido Dinámico</h4>
                      <div className="space-y-2">
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

            {((selectedComponent?.content as any)?.dynamicTemplate || '').includes('price') && (
              <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <h5 className="text-xs font-bold text-gray-700 mb-2">Opciones de Formato de Precio</h5>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!(selectedComponent?.content as any)?.outputFormat?.prefix}
                      onChange={(e) => {
                        handleOutputFormatChange('prefix', e.target.checked ? '$ ' : undefined);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Incluir símbolo de moneda ($)</span>
                  </label>
                  
                  {/* 🆕 MEJORADO: Selector de decimales avanzado */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Formato de decimales</label>
                    <select
                      value={(selectedComponent?.content as any)?.outputFormat?.precision || '0'}
                      onChange={(e) => {
                        const value = e.target.value;
                                              if (value === '2-small') {
                        handleOutputFormatChange('precision', '2-small');
                      } else {
                        handleOutputFormatChange('precision', parseInt(value));
                      }
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="0">Sin decimales</option>
                      <option value="2">Decimales normales</option>
                      <option value="2-small">Decimales pequeños</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Selector de campos dinámicos SOLO PRODUCTOS */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                🎯 Insertar Campos de Producto
                <span className="text-blue-600 ml-1">(Para cartelera se agregan automáticamente)</span>
              </label>
              <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                {productFieldOptions.map((option: any) => (
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
              <p className="text-xs text-gray-500 mt-2">
                💡 <strong>Solo campos de productos</strong> - Al usar la plantilla en cartelera, estos campos se llenan automáticamente con el producto seleccionado
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 NUEVO: Campo Calculado con operaciones matemáticas */}
      {(selectedComponent?.content as any)?.fieldType === 'calculated' && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Hash className="w-4 h-4 mr-2" />
            Campo Calculado
          </h4>
          
          <div className="space-y-3">
            {/* Editor de expresión matemática */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Expresión Matemática
                <span className="text-blue-600 ml-1">(Usa [campo] + operadores: + - * / ( ))</span>
              </label>
              <textarea
                value={(selectedComponent?.content as any)?.calculatedField?.expression || ''}
                onChange={(e) => handleCalculatedFieldChange(e.target.value)}
                placeholder="Ej: [product_price] * (1 - [discount_percentage] / 100)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                rows={2}
              />
            </div>

            {/* Preview del resultado */}
            {(selectedComponent?.content as any)?.calculatedField?.expression && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Preview del cálculo:</span>
                  <span className={`text-sm font-mono px-2 py-1 rounded ${
                    (selectedComponent?.content as any)?.calculatedField?.errorMessage 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {(selectedComponent?.content as any)?.calculatedField?.errorMessage || 
                     (selectedComponent?.content as any)?.calculatedField?.previewResult || 
                     'Ingresa una expresión'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Usando valores de ejemplo: precio=99999, descuento=15%, precio_anterior=119999, stock=25, precio_base=85000
                </p>
              </div>
            )}

            {/* Selector de campos disponibles */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Campos Disponibles para Cálculo
              </label>
              <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                {productFieldOptions
                  .filter((option: any) => option.value.includes('price') || option.value.includes('discount') || option.value.includes('stock'))
                  .map((option: any) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const currentExpression = (selectedComponent?.content as any)?.calculatedField?.expression || '';
                      const newExpression = currentExpression + `[${option.value}]`;
                      
                      // Usar la función auxiliar para ejecutar el cálculo del preview
                      handleCalculatedFieldChange(newExpression);
                    }}
                    className="text-left px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded flex items-center space-x-1"
                  >
                    <option.icon className="w-3 h-3" />
                    <span className="truncate">[{option.value}]</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Operadores matemáticos */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Operadores Matemáticos
              </label>
              <div className="flex gap-1">
                {['+', '-', '*', '/', '(', ')'].map((operator) => (
                  <button
                    key={operator}
                    onClick={() => {
                      const currentExpression = (selectedComponent?.content as any)?.calculatedField?.expression || '';
                      const newExpression = currentExpression + operator;
                      
                      // Usar la función auxiliar para ejecutar el cálculo del preview
                      handleCalculatedFieldChange(newExpression);
                    }}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-mono font-bold"
                  >
                    {operator}
                  </button>
                ))}
              </div>
            </div>

            {/* Opciones de formato para resultado calculado */}
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <h5 className="text-xs font-bold text-gray-700 mb-2">Formato del Resultado</h5>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!!(selectedComponent?.content as any)?.outputFormat?.prefix}
                    onChange={(e) => {
                      handleOutputFormatChange('prefix', e.target.checked ? '$ ' : undefined);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Incluir símbolo de moneda ($)</span>
                </label>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Formato de decimales</label>
                  <select
                    value={(selectedComponent?.content as any)?.outputFormat?.precision || '0'}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '2-small') {
                        handleOutputFormatChange('precision', '2-small');
                      } else {
                        handleOutputFormatChange('precision', parseInt(value));
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="0">Sin decimales</option>
                    <option value="2">Decimales normales</option>
                    <option value="2-small">Decimales pequeños</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Ayuda y ejemplos */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="text-xs font-bold text-blue-700 mb-1">💡 Ejemplos de uso:</h5>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Precio con descuento: <code>[product_price] * (1 - [discount_percentage] / 100)</code></li>
                <li>• Ahorro total: <code>[price_previous] - [product_price]</code></li>
                <li>• Precio por unidad: <code>[product_price] / [stock_available]</code></li>
                <li>• Valor con impuestos: <code>[product_price] * 1.21</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}


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
              { id: 'content', label: 'Contenido', icon: Type }
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
        <div className="flex-1 flex flex-col overflow-hidden">
          <div 
            className="flex-1 flex items-center justify-center p-3 properties-panel-scroll"
            style={{ 
              maxHeight: 'calc(100vh - 140px)',
              height: '100%',
              minHeight: '250px',
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: 0
            }}
          >
            <div className="text-center text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Selecciona un componente para ver sus propiedades</p>
              <p className="text-xs mt-2 text-gray-400">
                Arrastra elementos desde el panel izquierdo o haz clic en componentes existentes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'properties', label: 'Propiedades', icon: Settings },
            { id: 'styles', label: 'Estilos', icon: Palette },
            { id: 'content', label: 'Contenido', icon: Type }
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

      {/* Content - SOLUCIÓN DE SCROLL DEFINITIVA CON FLEXBOX */}
      <div className="flex-1 overflow-y-auto properties-panel-scroll min-h-0">
        <div className="p-4 space-y-4">
          {activeTab === 'properties' && renderPropertiesTab()}
          {activeTab === 'styles' && renderStylesTab()}
          {activeTab === 'content' && renderContentTab()}
        </div>
      </div>
    </div>
  );
}; 