// =====================================
// SPEED BUILDER V3 - SIMPLIFIED TEST VERSION
// =====================================

import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/shared/Header';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { FamilySelectorV3 } from './FamilySelectorV3';
import { ComponentsPanelV3 } from './ComponentsPanelV3';
import { DraggableComponentV3, FamilyV3, TemplateV3 } from '../types';
import { componentsLibrary } from '../data/componentsLibrary';

// ✅ AHORA USAMOS LA LIBRERÍA MODULARIZADA DEL CÓDIGO

export const BuilderV3Simple: React.FC = () => {
  const handleComponentDragStart = (componentType: any) => {
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
            componentsLibrary={componentsLibrary}
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