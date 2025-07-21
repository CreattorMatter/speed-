// =====================================
// SPEED BUILDER V3 - MODULAR PROPERTIES PANEL
// =====================================

import React from 'react';
import { Settings, Palette, Type } from 'lucide-react';
import { BuilderStateV3, DraggableComponentV3 } from '../types';
import { 
  PropertiesTab, 
  StylesTab, 
  ContentTab, 
  usePropertiesPanel 
} from './PropertiesPanel';

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
  
  // =====================
  // STATE & CALCULATIONS
  // =====================
  
  const selectedComponent = state?.canvas?.selectedComponentIds?.length === 1 
    ? state.components.find((c: DraggableComponentV3) => c.id === state.canvas.selectedComponentIds[0]) || null
    : null;
    
  const multipleSelection = (state?.canvas?.selectedComponentIds?.length || 0) > 1;

  // =====================
  // CUSTOM HOOK
  // =====================
  
  const { productFieldOptions, handlers } = usePropertiesPanel({
    selectedComponent,
    onComponentUpdate
  });

  // =====================
  // TAB CHANGE HANDLER
  // =====================
  
  const handleTabChange = (tabId: 'properties' | 'styles' | 'content') => {
    onTabChange(tabId);
  };

  // =====================
  // NO TEMPLATE FALLBACK
  // =====================
  
  if (!state?.currentTemplate) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex items-center justify-center h-full">
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Panel de Propiedades</h3>
          <p className="text-sm text-gray-500">
            Carga una plantilla para comenzar a editar propiedades.
          </p>
        </div>
      </div>
    );
  }

  // =====================
  // MAIN RENDER
  // =====================
  
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
          {activeTab === 'properties' && (
            <PropertiesTab 
              selectedComponent={selectedComponent}
              multipleSelection={multipleSelection}
              onComponentUpdate={onComponentUpdate}
              onComponentDelete={onComponentDelete}
              onComponentDuplicate={onComponentDuplicate}
              onComponentToggleVisibility={onComponentToggleVisibility}
              onComponentToggleLock={onComponentToggleLock}
              handlers={handlers}
            />
          )}
          {activeTab === 'styles' && (
            <StylesTab 
              selectedComponent={selectedComponent}
              multipleSelection={multipleSelection}
              onComponentUpdate={onComponentUpdate}
              onComponentDelete={onComponentDelete}
              onComponentDuplicate={onComponentDuplicate}
              onComponentToggleVisibility={onComponentToggleVisibility}
              onComponentToggleLock={onComponentToggleLock}
              handlers={handlers}
            />
          )}
          {activeTab === 'content' && (
            <ContentTab 
              selectedComponent={selectedComponent}
              multipleSelection={multipleSelection}
              onComponentUpdate={onComponentUpdate}
              onComponentDelete={onComponentDelete}
              onComponentDuplicate={onComponentDuplicate}
              onComponentToggleVisibility={onComponentToggleVisibility}
              onComponentToggleLock={onComponentToggleLock}
              handlers={handlers}
              productFieldOptions={productFieldOptions}
            />
          )}
        </div>
      </div>
    </div>
  );
}; 