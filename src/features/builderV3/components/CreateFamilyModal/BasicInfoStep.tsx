// =====================================
// BASIC INFO STEP - CreateFamilyModal
// =====================================

import React from 'react';
import { BasicInfoStepProps } from './types';

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onFormDataChange,
  enableCloning,
  onEnableCloningChange
}) => {
  
  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ displayName: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onFormDataChange({ description: e.target.value });
  };

  const handleCloningToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEnableCloningChange(e.target.checked);
  };

  return (
    <div className="space-y-6">
      {/* Nombre de la familia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la familia *
        </label>
        <input
          type="text"
          value={formData.displayName}
          onChange={handleDisplayNameChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="ej: Ofertas de Verano"
          required
        />
        {formData.displayName.trim() && (
          <p className="mt-1 text-xs text-gray-500">
            Se creará con ID: "{formData.displayName.toLowerCase().replace(/\s+/g, '-')}"
          </p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={handleDescriptionChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Describe el propósito de esta familia de plantillas..."
        />
      </div>

      {/* Opción de clonación */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={enableCloning}
            onChange={handleCloningToggle}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-3 text-sm font-medium text-gray-700">
            Copiar plantillas de una familia existente
          </span>
        </label>
        {enableCloning && (
          <p className="mt-2 text-xs text-gray-500">
            Podrás seleccionar plantillas de otras familias para copiar a la nueva familia.
          </p>
        )}
      </div>
    </div>
  );
}; 