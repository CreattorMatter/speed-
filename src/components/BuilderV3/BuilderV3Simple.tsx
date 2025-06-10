// =====================================
// SPEED BUILDER V3 - SIMPLIFIED TEST VERSION
// =====================================

import React from 'react';
import { ComponentsPanelV3 } from './components/ComponentsPanelV3';
import { ComponentsLibraryV3, ComponentTypeV3, PositionV3 } from '../../types/builder-v3';

// Mock components library for testing
const mockComponentsLibrary: ComponentsLibraryV3 = {
  'Header & Branding': [
    {
      type: 'image-header',
      name: 'Imagen de Header',
      description: 'Imagen promocional principal',
      icon: '🖼️',
      category: 'Header & Branding',
      defaultSize: { width: 400, height: 100, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'static' },
      tags: ['header', 'branding', 'image']
    }
  ],
  'Product Information': [
    {
      type: 'field-product-name',
      name: 'Nombre del Producto',
      description: 'Nombre dinámico del producto desde SAP',
      icon: '📝',
      category: 'Product Information',
      defaultSize: { width: 300, height: 40, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['product', 'name', 'dynamic']
    },
    {
      type: 'field-product-description',
      name: 'Descripción del Producto',
      description: 'Descripción completa del producto',
      icon: '📄',
      category: 'Product Information',
      defaultSize: { width: 350, height: 60, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['product', 'description', 'dynamic']
    }
  ],
  'Pricing & Discounts': [
    {
      type: 'field-price-original',
      name: 'Precio Original',
      description: 'Precio original del producto',
      icon: '💰',
      category: 'Pricing & Discounts',
      defaultSize: { width: 100, height: 30, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['price', 'original', 'dynamic']
    },
    {
      type: 'field-discount-percentage',
      name: 'Porcentaje de Descuento',
      description: 'Porcentaje de descuento aplicado',
      icon: '🏷️',
      category: 'Pricing & Discounts',
      defaultSize: { width: 80, height: 25, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['discount', 'percentage', 'dynamic']
    }
  ],
  'Financial Information': [],
  'Images & Media': [],
  'QR & Links': [],
  'Dates & Periods': [],
  'Decorative Elements': [],
  'Containers & Layout': []
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