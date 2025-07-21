// =====================================
// CONTENT TAB - BuilderV3 
// =====================================

import React, { useState } from 'react';
import { 
  Type,
  FileImage,
  Upload,
  Trash2,
  Droplet,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Plus,
  Minus
} from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import { TabProps, PropertiesHandlers, ProductFieldOption } from './types';

interface ContentTabProps extends TabProps {
  handlers: PropertiesHandlers;
  productFieldOptions: ProductFieldOption[];
}

export const ContentTab: React.FC<ContentTabProps> = ({
  selectedComponent,
  multipleSelection,
  handlers,
  productFieldOptions
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['image', 'content']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (multipleSelection) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          Selecciona un solo componente para ver su contenido
        </p>
      </div>
    );
  }

  if (!selectedComponent) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          Selecciona un componente para ver su contenido
        </p>
      </div>
    );
  }

  // =====================
  // RENDER FUNCTIONS
  // =====================

  const renderImageContent = () => {
    if (!['image-header', 'image-footer', 'image-background', 'image-brand-logo', 'image-promotional', 'image-product', 'image-decorative'].includes(selectedComponent.type)) {
      return null;
    }

    return (
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <FileImage className="w-4 h-4 mr-2" />
          Imagen
        </h4>
        
        {(selectedComponent?.content as any)?.imageUrl ? (
          <div className="space-y-3">
            <div className="relative border rounded-lg overflow-hidden">
              <img
                src={(selectedComponent?.content as any).imageUrl}
                alt={(selectedComponent?.content as any).imageAlt || 'Imagen'}
                className="w-full h-32 object-cover"
              />
              <button
                onClick={() => selectedComponent && handlers.handleContentChange('imageUrl', '')}
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
                onChange={(e) => handlers.handleContentChange('imageAlt', e.target.value)}
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
                  onChange={(e) => handlers.handleStyleChange('color', { ...selectedComponent?.style?.color, backgroundColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 p-0.5"
                />
                <input
                  type="text"
                  value={selectedComponent?.style?.color?.backgroundColor || ''}
                  onChange={(e) => handlers.handleStyleChange('color', { ...selectedComponent?.style?.color, backgroundColor: e.target.value })}
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
                        handlers.handleStyleChange('color', { ...selectedComponent.style?.color, backgroundColor: result.sRGBHex });
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
                        // Generar nombre único para Supabase
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                        const filePath = `builder/${fileName}`;
                        
                        // Subir a Supabase Storage
                        const { error: uploadError } = await supabase.storage
                          .from('assets')
                          .upload(filePath, file);

                        if (uploadError) {
                          console.error('Error subiendo imagen:', uploadError);
                          alert('Error al subir la imagen. Intenta de nuevo.');
                          return;
                        }

                        // Obtener URL pública
                        const { data: { publicUrl } } = supabase.storage
                          .from('assets')
                          .getPublicUrl(filePath);

                        // Actualizar componente con la URL
                        handlers.handleContentChange('imageUrl', publicUrl);
                        handlers.handleContentChange('imageAlt', file.name);
                      } catch (error) {
                        console.error('Error procesando imagen:', error);
                        alert('Error al procesar la imagen.');
                      }
                    }
                  };
                  input.click();
                }}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Imagen
              </button>
            </div>

            {/* URL manual */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">O pegar URL de imagen</label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const url = (e.target as HTMLInputElement).value;
                      if (url) {
                        handlers.handleContentChange('imageUrl', url);
                        handlers.handleContentChange('imageAlt', 'Imagen externa');
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                    const url = input?.value;
                    if (url) {
                      handlers.handleContentChange('imageUrl', url);
                      handlers.handleContentChange('imageAlt', 'Imagen externa');
                      input.value = '';
                    }
                  }}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Usar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTextContent = () => {
    const isTextComponent = ['field-dynamic-text', 'field-dynamic-date'].includes(selectedComponent.type);
    if (!isTextComponent) return null;

    return (
      <div>
        {/* Sección de Contenido */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('content')}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
          >
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Type className="w-4 h-4 mr-2" />
              Contenido
            </h4>
            {expandedSections.has('content') ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </button>
          
          {expandedSections.has('content') && (
            <div className="p-3 border-t border-gray-200 space-y-3">
              {/* Botón para regenerar contenido dinámico si está mal configurado */}
              {(['field-dynamic-text', 'field-dynamic-date'].includes(selectedComponent.type)) && 
               (!selectedComponent.content || !(selectedComponent.content as any)?.fieldType) && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-yellow-600">⚠️</span>
                    <span className="text-sm font-medium text-yellow-800">Contenido no configurado</span>
                  </div>
                  <p className="text-xs text-yellow-700 mb-3">
                    Este componente no tiene contenido dinámico configurado correctamente.
                  </p>
                  <button
                    onClick={() => {
                      const defaultContent = selectedComponent.type === 'field-dynamic-text' 
                        ? {
                            fieldType: 'dynamic',
                            dynamicTemplate: '[product_name]',
                            textConfig: { contentType: 'product-name' }
                          }
                        : {
                            fieldType: 'dynamic', 
                            dynamicTemplate: '[current_date]',
                            dateConfig: { type: 'current-date', format: 'DD/MM/YYYY' }
                          };
                      
                      console.log('🔧 Regenerando contenido para:', selectedComponent.id, defaultContent);
                      // Usar 'content' para reemplazar completamente el objeto content
                      // y eliminar cualquier staticValue existente
                      handlers.handleContentChange('content', defaultContent);
                    }}
                    className="w-full text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded transition-colors"
                  >
                    Configurar contenido dinámico
                  </button>
                </div>
              )}

              {/* Botón de emergencia para limpiar staticValue en componentes existentes */}
              {(['field-dynamic-text', 'field-dynamic-date'].includes(selectedComponent.type)) && 
               selectedComponent.content && 
               (selectedComponent.content as any)?.staticValue === 'Nuevo componente' && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-red-600">🚨</span>
                    <span className="text-sm font-medium text-red-800">StaticValue bloqueando toggle</span>
                  </div>
                  <p className="text-xs text-red-700 mb-3">
                    Este componente tiene un staticValue que impide que funcione el toggle.
                  </p>
                  <button
                    onClick={() => {
                      // Eliminar solo el staticValue manteniendo el resto del content
                      const { staticValue, ...cleanContent } = selectedComponent.content as any;
                      console.log('🧹 Eliminando staticValue de:', selectedComponent.id);
                      handlers.handleContentChange('content', cleanContent);
                    }}
                    className="w-full text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
                  >
                    Limpiar staticValue bloqueante
                  </button>
                </div>
              )}

              {/* Toggle para mostrar datos mock vs nombres de campo - VERSIÓN LIMPIA */}
              {(['field-dynamic-text', 'field-dynamic-date'].includes(selectedComponent.type)) && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-blue-900">Vista en Canvas</label>
                      <p className="text-xs text-blue-600 mt-1">Alterna entre datos de ejemplo y nombres técnicos</p>
                    </div>
                    
                    {/* Estado actual visual */}
                    <div className="text-right">
                      <div className={`text-xs font-medium px-2 py-1 rounded ${
                        selectedComponent.showMockData !== false 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {selectedComponent.showMockData !== false ? 'Datos Mock' : 'Nombres Técnicos'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm ${selectedComponent.showMockData === false ? 'font-semibold text-orange-700' : 'text-gray-500'}`}>
                        🏷️ [product_name]
                      </span>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedComponent.showMockData !== false}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            // Forzar actualización del componente
                            handlers.handleContentChange('showMockData', newValue);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      
                      <span className={`text-sm ${selectedComponent.showMockData !== false ? 'font-semibold text-green-700' : 'text-gray-500'}`}>
                        🎭 Heladera Whirlpool
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tipo de campo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de contenido</label>
                <select
                  value={(selectedComponent.content as any)?.fieldType || 'static'}
                  onChange={(e) => {
                    const fieldType = e.target.value;
                    let defaultContent: any = { fieldType };
                    
                    switch (fieldType) {
                      case 'static':
                        defaultContent.staticValue = 'Texto estático';
                        break;
                      case 'dynamic':
                        defaultContent.dynamicTemplate = '[product_name]';
                        break;
                      case 'calculated':
                        defaultContent.calculatedField = { 
                          expression: '[product_price] * 0.9',
                          previewResult: 'Calculando...',
                          errorMessage: '' 
                        };
                        break;
                    }
                    
                    handlers.handleContentChange('fieldType', fieldType);
                    Object.keys(defaultContent).forEach(key => {
                      if (key !== 'fieldType') {
                        handlers.handleContentChange(key, defaultContent[key]);
                      }
                    });
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="static">Texto estático</option>
                  <option value="dynamic">Campo dinámico</option>
                  <option value="calculated">Campo calculado</option>
                </select>
              </div>

              {/* Renderizado condicional según el tipo */}
              {(selectedComponent.content as any)?.fieldType === 'static' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Texto</label>
                  <textarea
                    value={(selectedComponent.content as any)?.staticValue || ''}
                    onChange={(e) => handlers.handleContentChange('staticValue', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Escribe tu texto aquí..."
                  />
                </div>
              )}

              {(selectedComponent.content as any)?.fieldType === 'dynamic' && (
                <div className="space-y-3">
                  {/* Toggle para mostrar datos mock vs nombres de campo */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Plantilla dinámica</label>
                    <textarea
                      value={(selectedComponent.content as any)?.dynamicTemplate || ''}
                      onChange={(e) => handlers.handleContentChange('dynamicTemplate', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="[product_name] - $[product_price]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Usa [nombre_campo] para insertar campos dinámicos
                    </p>
                  </div>

                  {/* Lista de campos disponibles */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Campos disponibles</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                      {productFieldOptions.map((field, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const currentTemplate = (selectedComponent.content as any)?.dynamicTemplate || '';
                            const newTemplate = currentTemplate + `[${field.value}]`;
                            handlers.handleContentChange('dynamicTemplate', newTemplate);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex items-center space-x-2 border-b border-gray-100 last:border-b-0"
                        >
                          <field.icon className="w-3 h-3 text-gray-500" />
                          <span>{field.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(selectedComponent.content as any)?.fieldType === 'calculated' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Expresión matemática
                    </label>
                    <textarea
                      value={(selectedComponent.content as any)?.calculatedField?.expression || ''}
                      onChange={(e) => handlers.handleCalculatedFieldChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="[product_price] * (1 - [discount_percentage] / 100)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Usa operadores: +, -, *, /, ( ) y campos entre []
                    </p>
                  </div>

                  {/* Preview del resultado */}
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700">Vista previa:</span>
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-sm font-mono">
                      {(selectedComponent.content as any)?.calculatedField?.previewResult || 'Sin expresión'}
                    </div>
                    {(selectedComponent.content as any)?.calculatedField?.errorMessage && (
                      <div className="text-xs text-red-600 mt-1">
                        {(selectedComponent.content as any).calculatedField.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección de Formato de Salida */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('format')}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
          >
            <h4 className="text-sm font-medium text-gray-900">Formato de salida</h4>
            {expandedSections.has('format') ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </button>
          
          {expandedSections.has('format') && (
            <div className="p-3 border-t border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de formato</label>
                <select
                  value={(selectedComponent.content as any)?.outputFormat?.type || 'text'}
                  onChange={(e) => handlers.handleOutputFormatChange('type', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Texto</option>
                  <option value="currency">Moneda</option>
                  <option value="percentage">Porcentaje</option>
                  <option value="number">Número</option>
                  <option value="date">Fecha</option>
                </select>
              </div>

              {/* Opciones específicas por tipo */}
              {(selectedComponent.content as any)?.outputFormat?.type === 'currency' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Prefijo</label>
                    <input
                      type="text"
                      value={(selectedComponent.content as any)?.outputFormat?.prefix || '$'}
                      onChange={(e) => handlers.handleOutputFormatChange('prefix', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="$"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Decimales</label>
                    <input
                      type="number"
                      value={(selectedComponent.content as any)?.outputFormat?.precision || 0}
                      onChange={(e) => handlers.handleOutputFormatChange('precision', Number(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      min="0"
                      max="4"
                    />
                  </div>
                </div>
              )}

              {(selectedComponent.content as any)?.outputFormat?.type === 'percentage' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sufijo</label>
                  <input
                    type="text"
                    value={(selectedComponent.content as any)?.outputFormat?.suffix || '%'}
                    onChange={(e) => handlers.handleOutputFormatChange('suffix', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="%"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {renderImageContent()}
      {renderTextContent()}
    </div>
  );
}; 