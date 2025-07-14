// =====================================
// SPEED BUILDER V3 - SIMPLIFIED TEST VERSION
// =====================================

import React from 'react';
import { ComponentsPanelV3 } from './ComponentsPanelV3';
import { ComponentsLibraryV3, ComponentTypeV3, PositionV3 } from '../types';

// Mock components library for testing - ACTUALIZADA CON NUEVAS CATEGORÍAS
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
  'Imagen de Header': [
    {
      type: 'image-header',
      name: 'Header Promocional',
      description: 'Imagen principal de encabezado para promociones',
      icon: '🏷️',
      category: 'Imagen de Header',
      defaultSize: { width: 400, height: 120, isProportional: true },
      defaultStyle: {},
      defaultContent: { 
        fieldType: 'static', 
        imageUrl: '', 
        imageAlt: 'Header promocional' 
      },
      tags: ['image', 'header', 'promotion', 'migration-header']
    }
  ],
  'Imagen de Footer': [
    {
      type: 'image-footer',
      name: 'Footer Promocional',
      description: 'Imagen de pie de página con información adicional',
      icon: '📋',
      category: 'Imagen de Footer',
      defaultSize: { width: 400, height: 80, isProportional: true },
      defaultStyle: {},
      defaultContent: { 
        fieldType: 'static', 
        imageUrl: '', 
        imageAlt: 'Footer promocional' 
      },
      tags: ['image', 'footer', 'information', 'migration-footer']
    }
  ],
  'Imagen de Fondo': [
    {
      type: 'image-background',
      name: 'Fondo del Cartel',
      description: 'Imagen de fondo que cubre toda la plantilla',
      icon: '🖼️',
      category: 'Imagen de Fondo',
      defaultSize: { width: 600, height: 800, isProportional: true },
      defaultStyle: {},
      defaultContent: { 
        fieldType: 'static', 
        imageUrl: '', 
        imageAlt: 'Fondo del cartel' 
      },
      tags: ['image', 'background', 'template', 'migration-background']
    }
  ],
  'Imágenes y Media': [
    {
      type: 'image-product',
      name: 'Imagen de Producto',
      description: 'Imagen específica del producto',
      icon: '🖼️',
      category: 'Imágenes y Media',
      defaultSize: { width: 200, height: 200, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'static', imageUrl: '', imageAlt: 'Producto' },
      tags: ['image', 'product']
    },
    {
      type: 'image-brand-logo',
      name: 'Logo de Marca',
      description: 'Logo o marca del producto',
      icon: '🏪',
      category: 'Imágenes y Media',
      defaultSize: { width: 100, height: 50, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'static', imageUrl: '', imageAlt: 'Logo' },
      tags: ['image', 'brand', 'logo']
    },
    {
      type: 'image-decorative',
      name: 'Imagen Decorativa',
      description: 'Imagen decorativa o ilustrativa',
      icon: '🎨',
      category: 'Imágenes y Media',
      defaultSize: { width: 150, height: 150, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'static', imageUrl: '', imageAlt: 'Decorativa' },
      tags: ['image', 'decorative', 'illustration']
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
  'Fechas y Períodos': [
    {
      type: 'field-dynamic-date',
      name: 'Fecha Dinámica',
      description: 'Campo de fecha configurable',
      icon: '📅',
      category: 'Fechas y Períodos',
      defaultSize: { width: 200, height: 30, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'static', staticValue: new Date().toLocaleDateString() },
      tags: ['date', 'dynamic']
    }
  ],
  'Elementos Decorativos': [
    {
      type: 'shape-geometric',
      name: 'Forma Geométrica',
      description: 'Formas básicas como rectángulos, círculos',
      icon: '⬜',
      category: 'Elementos Decorativos',
      defaultSize: { width: 100, height: 100, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'static', shapeConfig: { type: 'rectangle' } },
      tags: ['shape', 'geometric']
    },
    {
      type: 'decorative-line',
      name: 'Línea Decorativa',
      description: 'Líneas para separar secciones',
      icon: '➖',
      category: 'Elementos Decorativos',
      defaultSize: { width: 200, height: 2, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'static', lineConfig: { type: 'solid' } },
      tags: ['line', 'separator']
    },
    {
      type: 'decorative-icon',
      name: 'Ícono Decorativo',
      description: 'Íconos y símbolos decorativos',
      icon: '⭐',
      category: 'Elementos Decorativos',
      defaultSize: { width: 50, height: 50, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'static', iconConfig: { type: 'star' } },
      tags: ['icon', 'decorative']
    }
  ],
  'Contenedores y Layout': [
    {
      type: 'container-flexible',
      name: 'Contenedor Flexible',
      description: 'Contenedor con layout flexible',
      icon: '📦',
      category: 'Contenedores y Layout',
      defaultSize: { width: 300, height: 200, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'static', containerConfig: { type: 'flexible' } },
      tags: ['container', 'layout', 'flexible']
    },
    {
      type: 'container-grid',
      name: 'Contenedor Grid',
      description: 'Contenedor con layout de grilla',
      icon: '🔲',
      category: 'Contenedores y Layout',
      defaultSize: { width: 300, height: 200, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'static', containerConfig: { type: 'grid' } },
      tags: ['container', 'layout', 'grid']
    }
  ]
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