// =====================================
// SPEED BUILDER V3 - SIMPLIFIED TEST VERSION
// =====================================

import React from 'react';
import { ComponentsPanelV3 } from './ComponentsPanelV3';
import { ComponentsLibraryV3, ComponentTypeV3, PositionV3 } from '../types';

// Mock components library for testing
const mockComponentsLibrary: ComponentsLibraryV3 = {
  'Texto y Datos': [
    {
      type: 'field-dynamic-text',
      name: 'Texto Dinámico',
      description: 'Campo de texto que puede mostrar cualquier información',
      icon: '📝',
      category: 'Texto y Datos',
      defaultSize: { width: 300, height: 40, isProportional: false },
      defaultStyle: {},
      defaultContent: { 
        fieldType: 'static', 
        staticValue: 'Texto de ejemplo',
        textConfig: { contentType: 'product-name' }
      },
      tags: ['text', 'dynamic', 'universal']
    }
  ],
  'Imágenes y Media': [
    {
      type: 'image-header',
      name: 'Imagen de Header',
      description: 'Imagen promocional principal',
      icon: '🖼️',
      category: 'Imágenes y Media',
      defaultSize: { width: 400, height: 120, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'static', imageUrl: '', imageAlt: 'Header' },
      tags: ['image', 'header']
    }
  ],
  'QR y Enlaces': [
    {
      type: 'qr-dynamic',
      name: 'QR Dinámico',
      description: 'Código QR configurable',
      icon: '📱',
      category: 'QR y Enlaces',
      defaultSize: { width: 100, height: 100, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'static', qrUrl: 'https://ejemplo.com' },
      tags: ['qr', 'dynamic']
    }
  ],
  'Fechas y Períodos': [],
  'Elementos Decorativos': [],
  'Contenedores y Layout': []
};

export const BuilderV3Simple: React.FC = () => {
  const handleComponentDragStart = (componentType: ComponentTypeV3) => {
    console.log('Component drag started:', componentType);
  };

  return (
    <div className="h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-sm border h-full">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Builder V3 - Test de ComponentsPanelV3
          </h1>
          <p className="text-gray-600 mt-1">
            Versión simplificada para probar ComponentsPanelV3
          </p>
        </div>
        
        <div className="flex h-[calc(100%-80px)]">
          <ComponentsPanelV3
            componentsLibrary={mockComponentsLibrary}
            onComponentDragStart={handleComponentDragStart}
          />
          
          <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">Canvas Area</h2>
              <p>Arrastra componentes desde el panel izquierdo</p>
              <p className="text-sm mt-2">Los componentes se mostrarán en consola</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 