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
import { supabase, isSupabaseConfigured } from '../../../../lib/supabaseClient';
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
                        // 1) Mostrar preview inmediata con URL local
                        const localUrl = URL.createObjectURL(file);
                        handlers.handleContentChange('imageUrl', localUrl);
                        handlers.handleContentChange('imageAlt', file.name);

                        // 2) Si Supabase está configurado, subir en segundo plano y reemplazar URL
                        if (isSupabaseConfigured) {
                          (async () => {
                            try {
                              const fileExt = file.name.split('.').pop();
                              const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                              const filePath = `builder/${fileName}`;
                              const { error: uploadError } = await supabase.storage
                                .from('assets')
                                .upload(filePath, file);
                              if (!uploadError) {
                                const { data: { publicUrl } } = supabase.storage
                                  .from('assets')
                                  .getPublicUrl(filePath);
                                if (publicUrl) {
                                  handlers.handleContentChange('imageUrl', publicUrl);
                                }
                              } else {
                                console.warn('Upload falló, se mantiene URL local:', uploadError);
                              }
                            } catch (err) {
                              console.warn('Upload exception, se mantiene URL local:', err);
                            }
                          })();
                        }
                      } catch (error) {
                        console.error('Error procesando imagen:', error);
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
    const isTextComponent = ['field-dynamic-text'].includes(selectedComponent.type);
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
              {(['field-dynamic-text'].includes(selectedComponent.type)) && 
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
                      const defaultContent = {
                        fieldType: 'dynamic',
                        dynamicTemplate: '[product_name]',
                        textConfig: { contentType: 'product-name' }
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



              {/* Toggle para mostrar datos mock vs nombres de campo - VERSIÓN LIMPIA */}
              {(['field-dynamic-text'].includes(selectedComponent.type)) && (
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
                  value={(() => {
                    const content = selectedComponent.content as any;
                    // Detectar si es fecha basado en dateConfig
                    if (content?.dateConfig?.type === 'validity-period') {
                      return 'date';
                    }
                    return content?.fieldType || 'static';
                  })()}
                  onChange={(e) => {
                    const fieldType = e.target.value;
                    
                    // 🔧 SOLUCIÓN DEFINITIVA: Resetear el contenido para evitar datos residuales
                    let newContent: any = { 
                      fieldType,
                      staticValue: undefined,
                      dynamicTemplate: undefined,
                      calculatedField: undefined,
                      dateConfig: undefined
                    };
                    
                    switch (fieldType) {
                      case 'static':
                        newContent.staticValue = (selectedComponent.content as any)?.staticValue || 'Texto estático';
                        break;
                      case 'dynamic':
                        newContent.dynamicTemplate = '[product_name]';
                        break;
                      case 'calculated':
                        newContent.calculatedField = { 
                          expression: '[product_price] * 0.9',
                          previewResult: 'Calculando...',
                          errorMessage: '' 
                        };
                        break;
                      case 'date':
                        // Al seleccionar 'date', configuramos todo lo necesario
                        newContent.fieldType = 'dynamic'; // Sigue siendo un tipo dinámico
                        newContent.dynamicTemplate = '[validity_period]'; // Template visual
                        // 🆕 Obtener fecha de hoy en formato YYYY-MM-DD
                        const today = new Date().toISOString().split('T')[0];
                        newContent.dateConfig = { 
                          type: 'validity-period', 
                          format: 'DD/MM/YYYY',
                          startDate: today,
                          endDate: today
                        };
                        break;
                    }
                    
                    // 🎯 LLAMAR A LA FUNCIÓN CORRECTA: handleContentChange
                    handlers.handleContentChange('content', newContent);
                  }}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="static">Texto estático</option>
                  <option value="dynamic">Campo dinámico</option>
                  <option value="calculated">Campo calculado</option>
                  <option value="date">Fecha</option>
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

              {(selectedComponent.content as any)?.fieldType === 'dynamic' && 
                (selectedComponent.content as any)?.dateConfig?.type !== 'validity-period' && (
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

                  {/* Lista de campos disponibles con buscador */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Campos disponibles</label>
                    <input
                      type="text"
                      placeholder="Buscar campo..."
                      className="w-full mb-2 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        const q = e.target.value.toLowerCase().trim();
                        const container = document.getElementById('field-options-container');
                        if (!container) return;
                        Array.from(container.querySelectorAll('button[data-label]')).forEach((el) => {
                          const label = (el as HTMLElement).dataset.label || '';
                          (el as HTMLElement).style.display = label.includes(q) ? '' : 'none';
                        });
                      }}
                    />
                    <div id="field-options-container" className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                      {productFieldOptions.map((field, index) => (
                        <button
                          key={index}
                          data-label={(field.label || '').toLowerCase()}
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

                  {/* 🆕 NUEVOS CONTROLES DE FORMATO PARA CAMPOS MONETARIOS */}
                  {(() => {
                    const dynamicTemplate = (selectedComponent.content as any)?.dynamicTemplate || '';
                    const isPriceField = ['product_price', 'price', 'precio', 'cuota'].some(priceKey => 
                      dynamicTemplate.toLowerCase().includes(priceKey)
                    );
                    
                    if (isPriceField) {
                      return (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                          <h5 className="text-sm font-medium text-green-900 flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Formato Monetario
                          </h5>
                          
                          <div className="space-y-2">
                            {/* Control para símbolo $ */}
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={(selectedComponent.content as any)?.outputFormat?.showCurrencySymbol !== false}
                                onChange={(e) => {
                                  const currentOutputFormat = (selectedComponent.content as any)?.outputFormat || {};
                                  const newOutputFormat = {
                                    ...currentOutputFormat,
                                    showCurrencySymbol: e.target.checked,
                                    prefix: e.target.checked ? '$' : undefined
                                  };
                                  handlers.handleContentChange('outputFormat', newOutputFormat);
                                }}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="text-xs text-gray-700">Mostrar símbolo $ (peso)</span>
                            </label>
                            
                            {/* Control para decimales */}
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={(selectedComponent.content as any)?.outputFormat?.showDecimals === true}
                                onChange={(e) => {
                                  const currentOutputFormat = (selectedComponent.content as any)?.outputFormat || {};
                                  const newOutputFormat = {
                                    ...currentOutputFormat,
                                    showDecimals: e.target.checked,
                                    precision: e.target.checked ? '2' : '0'
                                  };
                                  handlers.handleContentChange('outputFormat', newOutputFormat);
                                }}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="text-xs text-gray-700">Mostrar decimales (.00)</span>
                            </label>
                          </div>
                          
                          <p className="text-xs text-green-600">
                            ℹ️ Estos controles solo afectan campos de precio detectados automáticamente
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {(selectedComponent.content as any)?.fieldType === 'calculated' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">🧮 Campo Calculado</h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Expresión matemática
                    </label>
                    <textarea
                      value={(selectedComponent.content as any)?.calculatedField?.expression || ''}
                      onChange={(e) => {
                        console.log('🧮 Cambiando expresión calculada:', e.target.value);
                        handlers.handleCalculatedFieldChange(e.target.value);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="[product_price] * (1 - [discount_percentage] / 100)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Usa operadores: +, -, *, /, ( ) y campos entre []
                    </p>
                  </div>

                  {/* Selector de campos numéricos dinámico */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Campos numéricos disponibles</label>
                    <div className="max-h-28 overflow-y-auto border border-gray-200 rounded-md divide-y">
                      {productFieldOptions
                        .filter(opt => /price|precio|discount|descuento|stock|cuota/i.test(opt.value))
                        .map((opt, idx) => (
                          <button
                            key={`${opt.value}-${idx}`}
                            onClick={() => {
                              const currentExpression = (selectedComponent.content as any)?.calculatedField?.expression || '';
                              const newExpression = currentExpression + `[${opt.value}]`;
                              handlers.handleCalculatedFieldChange(newExpression);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <opt.icon className="w-3 h-3 text-gray-600" />
                            <span><strong>[{opt.value}]</strong> - {opt.label}</span>
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* OPCIONES DE FORMATO - CRÍTICAS PARA LA CARTELERA */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <span className="text-green-600">⚙️</span>
                      <span>Opciones de formato</span>
                    </h4>
                    
                    {/* Mostrar signo $ */}
                    <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          💰 Mostrar signo pesos ($)
                        </label>
                        <p className="text-xs text-gray-500">Agregar $ al inicio del resultado</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={(selectedComponent.content as any)?.outputFormat?.prefix !== false}
                        onChange={(e) => {
                          const currentContent = selectedComponent.content as any;
                          const outputFormat = currentContent?.outputFormat || {};
                          
                          const updatedContent = {
                            ...currentContent,
                            outputFormat: {
                              ...outputFormat,
                              prefix: e.target.checked
                            }
                          };
                          
                          handlers.handleContentChange('content', updatedContent);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>

                    {/* Mostrar decimales */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                        <span>🔢</span>
                        <span>Formato de decimales</span>
                      </label>
                      <select
                        value={(selectedComponent.content as any)?.outputFormat?.precision || '0'}
                        onChange={(e) => {
                          const currentContent = selectedComponent.content as any;
                          const outputFormat = currentContent?.outputFormat || {};
                          
                          const updatedContent = {
                            ...currentContent,
                            outputFormat: {
                              ...outputFormat,
                              precision: e.target.value
                            }
                          };
                          
                          handlers.handleContentChange('content', updatedContent);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="0">Sin decimales → 1234</option>
                        <option value="2">2 decimales → 1234.56</option>
                        <option value="2-small">2 decimales pequeños → 1234.⁵⁶</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        ⚠️ <strong>Importante:</strong> La cartelera usa estas opciones para el formato final
                      </p>
                    </div>

                    {/* Preview del formato */}
                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium mb-1">👁️ Preview del formato:</p>
                      <div className="text-sm font-mono bg-white px-2 py-1 rounded border">
                        {(() => {
                          const outputFormat = (selectedComponent.content as any)?.outputFormat || {};
                          const prefix = outputFormat.prefix !== false ? '$ ' : '';
                          const precision = outputFormat.precision || '0';
                          
                          let example = '1234';
                          if (precision === '2') example = '1234.56';
                          if (precision === '2-small') example = '1234.⁵⁶';
                          
                          return `${prefix}${example}`;
                        })()}
                      </div>
                    </div>
                  </div>


                </div>
              )}

              {/* Configuración específica para Fecha vigencia */}
              {(() => {
                const content = selectedComponent.content as any;
                return content?.dateConfig?.type === 'validity-period';
              })() && (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                      📅 Configurar rango de fechas
                    </h4>
                    
                    {/* Selectores de fecha */}
                    <div className="space-y-3">
                      {/* Fecha desde */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Fecha desde:
                        </label>
                        <input
                          type="date"
                          value={(selectedComponent.content as any)?.dateConfig?.startDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            const newDateConfig = {
                              ...(selectedComponent.content as any)?.dateConfig,
                              startDate: e.target.value
                            };
                            handlers.handleContentChange('dateConfig', newDateConfig);
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      {/* Fecha hasta */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Fecha hasta:
                        </label>
                        <input
                          type="date"
                          value={(selectedComponent.content as any)?.dateConfig?.endDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            const newDateConfig = {
                              ...(selectedComponent.content as any)?.dateConfig,
                              endDate: e.target.value
                            };
                            handlers.handleContentChange('dateConfig', newDateConfig);
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    {/* Información adicional */}
                    <div className="mt-3 text-xs text-blue-600">
                      💡 <strong>Uso en cartelera:</strong> Este campo se usará para validar si la fecha actual está dentro del rango permitido para impresión.
                    </div>
                  </div>
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