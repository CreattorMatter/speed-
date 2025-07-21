// =====================================
// CONFIRMATION STEP - CreateFamilyModal
// =====================================

import React from 'react';
import { Check } from 'lucide-react';
import { ConfirmationStepProps } from './types';

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  formData,
  enableCloning,
  selectedTemplateIds,
  replaceHeaders,
  headerFile,
  headerImageUrl
}) => {
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Confirmar creación de familia
        </h3>
      </div>

      {/* Family Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🏷️</span>
          <div>
            <div className="font-medium text-gray-900">{formData.displayName}</div>
            <div className="text-sm text-gray-500">{formData.description}</div>
          </div>
        </div>
      </div>

      {/* Cloning Summary */}
      {enableCloning && selectedTemplateIds.length > 0 && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-medium text-blue-900 mb-2">
            Plantillas a copiar ({selectedTemplateIds.length})
          </h4>
          <div className="text-sm text-blue-700 mb-2">
            {selectedTemplateIds.length === 1 
              ? 'Se copiará 1 plantilla'
              : `Se copiarán ${selectedTemplateIds.length} plantillas`
            }
          </div>
          
          {/* Header Replacement Summary */}
          {replaceHeaders && (
            <div className="mt-3 pt-3 border-t border-blue-300">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  Se reemplazarán las imágenes de header
                </span>
              </div>
              
              {/* Header Image Preview */}
              {headerImageUrl && (
                <div className="mt-2 flex items-center space-x-3 p-2 bg-white rounded border border-blue-200">
                  <img
                    src={headerImageUrl}
                    alt="Header preview"
                    className="w-10 h-6 object-cover rounded"
                  />
                  <div className="text-xs text-blue-600">
                    {headerFile?.name || 'Imagen personalizada'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Creation Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Notas importantes:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• La familia se creará con configuración por defecto</li>
          <li>• Las fuentes serán: Inter (primaria), Roboto (secundaria), Poppins (headers)</li>
          {enableCloning && selectedTemplateIds.length > 0 && (
            <>
              <li>• Las plantillas copiadas mantendrán su estructura original</li>
              {replaceHeaders && (
                <li>• Todas las imágenes de header serán reemplazadas por la imagen personalizada</li>
              )}
            </>
          )}
          <li>• Podrás modificar la configuración después de crear la familia</li>
        </ul>
      </div>
    </div>
  );
}; 