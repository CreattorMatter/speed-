// =====================================
// CLONE TEMPLATES STEP - CreateFamilyModal
// =====================================

import React from 'react';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { CloneTemplatesStepProps } from './types';
import { ImageUploader } from './ImageUploader';

export const CloneTemplatesStep: React.FC<CloneTemplatesStepProps> = ({
  existingFamilies,
  selectedTemplateIds,
  onTemplateToggle,
  selectedSourceFamily,
  expandedFamily,
  onFamilyExpand,
  replaceHeaders,
  onReplaceHeadersChange,
  headerFile,
  headerImageUrl,
  isUploadingHeader,
  onHeaderFileSelect,
  onRemoveHeaderImage
}) => {
  
  const handleReplaceHeadersToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onReplaceHeadersChange(e.target.checked);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Seleccionar plantillas para copiar
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Elige las plantillas que deseas copiar a la nueva familia.
        </p>
      </div>

      {/* Families and Templates Selection */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {existingFamilies.map(family => (
          <div key={family.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => onFamilyExpand(family.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{family.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{family.displayName}</div>
                  <div className="text-sm text-gray-500">{family.templates.length} plantillas</div>
                </div>
              </div>
              {expandedFamily === family.id ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedFamily === family.id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {family.templates.length > 0 ? (
                  <div className="space-y-2">
                    {family.templates.map(template => (
                      <label key={template.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTemplateIds.includes(template.id)}
                          onChange={() => onTemplateToggle(template.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">{template.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Esta familia no tiene plantillas</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Clone Options */}
      {selectedTemplateIds.length > 0 && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-medium text-blue-900 mb-2">Opciones de copia</h4>
          
          {/* Replace Headers Option */}
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={replaceHeaders}
              onChange={handleReplaceHeadersToggle}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-blue-700">
              Reemplazar imágenes de header con imagen personalizada
            </span>
          </label>
          
          {/* Custom Header Image Upload */}
          {replaceHeaders && (
            <div className="mt-4 border border-blue-300 rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Imagen de Header Personalizada</span>
                {headerImageUrl && (
                  <button
                    onClick={onRemoveHeaderImage}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Remover
                  </button>
                )}
              </div>
              
              <ImageUploader
                headerFile={headerFile}
                headerImageUrl={headerImageUrl}
                isUploadingHeader={isUploadingHeader}
                onFileSelect={onHeaderFileSelect}
                onRemoveImage={onRemoveHeaderImage}
                className="w-full"
              />
              
              <div className="text-xs text-gray-500 mt-2">
                JPG, PNG, WebP • Máximo 5MB
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 