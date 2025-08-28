// =====================================
// CLONE TEMPLATES STEP - CreateFamilyModal
// =====================================

import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { CloneTemplatesStepProps } from './types';
import { ImageUploader } from './ImageUploader';
import { templatesV3Service } from '../../../../services/builderV3Service';
import { FamilyV3, TemplateV3 } from '../../types';

export const CloneTemplatesStep: React.FC<CloneTemplatesStepProps> = ({
  existingFamilies,
  selectedTemplateIds,
  onTemplateToggle,
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
  
  // =====================
  // LOCAL STATE FOR DYNAMIC TEMPLATE LOADING
  // =====================
  
  const [familiesWithTemplates, setFamiliesWithTemplates] = useState<Map<string, TemplateV3[]>>(new Map());
  const [loadingFamilies, setLoadingFamilies] = useState<Set<string>>(new Set());
  const [selectAllFamilies, setSelectAllFamilies] = useState<Set<string>>(new Set());

  // =====================
  // DYNAMIC TEMPLATE LOADING
  // =====================
  
  const loadFamilyTemplates = useCallback(async (familyId: string) => {
    if (familiesWithTemplates.has(familyId) || loadingFamilies.has(familyId)) {
      return; // Ya están cargadas o en proceso
    }

    setLoadingFamilies(prev => new Set(prev).add(familyId));
    
    try {
      console.log('🔄 Cargando plantillas para familia:', familyId);
      const templates = await templatesV3Service.getByFamily(familyId);
      console.log(`✅ ${templates.length} plantillas cargadas para familia ${familyId}`);
      
      setFamiliesWithTemplates(prev => new Map(prev).set(familyId, templates));
    } catch (error) {
      console.error('❌ Error cargando plantillas para familia:', familyId, error);
      // En caso de error, se mantiene vacío
      setFamiliesWithTemplates(prev => new Map(prev).set(familyId, []));
    } finally {
      setLoadingFamilies(prev => {
        const newSet = new Set(prev);
        newSet.delete(familyId);
        return newSet;
      });
    }
  }, [familiesWithTemplates, loadingFamilies]);

  // =====================
  // FAMILY EXPANSION HANDLER  
  // =====================
  
  const handleFamilyExpand = useCallback(async (familyId: string) => {
    // Llamar al handler original
    onFamilyExpand(familyId);
    
    // Si se está expandiendo (no colapsando), cargar plantillas
    if (expandedFamily !== familyId) {
      await loadFamilyTemplates(familyId);
    }
  }, [onFamilyExpand, expandedFamily, loadFamilyTemplates]);

  // =====================
  // SELECT ALL FAMILY TEMPLATES  
  // =====================
  
  const handleSelectAllFamily = useCallback((familyId: string) => {
    const templates = familiesWithTemplates.get(familyId) || [];
    const isSelected = selectAllFamilies.has(familyId);
    
    if (isSelected) {
      // Deseleccionar todas las plantillas de esta familia
      templates.forEach(template => {
        if (selectedTemplateIds.includes(template.id)) {
          onTemplateToggle(template.id);
        }
      });
      setSelectAllFamilies(prev => {
        const newSet = new Set(prev);
        newSet.delete(familyId);
        return newSet;
      });
    } else {
      // Seleccionar todas las plantillas de esta familia
      templates.forEach(template => {
        if (!selectedTemplateIds.includes(template.id)) {
          onTemplateToggle(template.id);
        }
      });
      setSelectAllFamilies(prev => new Set(prev).add(familyId));
    }
  }, [familiesWithTemplates, selectAllFamilies, selectedTemplateIds, onTemplateToggle]);

  // =====================
  // UTILITY FUNCTIONS
  // =====================
  
  const getFamilyTemplates = (familyId: string): TemplateV3[] => {
    return familiesWithTemplates.get(familyId) || [];
  };

  const isFamilyLoading = (familyId: string): boolean => {
    return loadingFamilies.has(familyId);
  };

  const getFamilyTemplateCount = (family: FamilyV3): number => {
    const loadedTemplates = familiesWithTemplates.get(family.id);
    if (loadedTemplates) {
      return loadedTemplates.length;
    }
    // Usar templatesCount si está disponible, sino usar templates.length
    return family.templatesCount ?? family.templates.length;
  };

  const isFamilyFullySelected = (familyId: string): boolean => {
    const templates = getFamilyTemplates(familyId);
    return templates.length > 0 && templates.every(template => selectedTemplateIds.includes(template.id));
  };

  const isFamilyPartiallySelected = (familyId: string): boolean => {
    const templates = getFamilyTemplates(familyId);
    return templates.some(template => selectedTemplateIds.includes(template.id)) && !isFamilyFullySelected(familyId);
  };

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
        {existingFamilies.map(family => {
          const familyTemplates = getFamilyTemplates(family.id);
          const templateCount = getFamilyTemplateCount(family);
          const isLoading = isFamilyLoading(family.id);
          const isExpanded = expandedFamily === family.id;
          const isFullySelected = isFamilyFullySelected(family.id);
          const isPartiallySelected = isFamilyPartiallySelected(family.id);

          return (
            <div key={family.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => handleFamilyExpand(family.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{family.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{family.displayName}</div>
                    <div className="text-sm text-gray-500">
                      {templateCount} plantilla{templateCount !== 1 ? 's' : ''}
                      {isPartiallySelected && <span className="text-blue-600 ml-1">(parcialmente seleccionada)</span>}
                      {isFullySelected && familyTemplates.length > 0 && <span className="text-green-600 ml-1">(todas seleccionadas)</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" />
                      <span className="text-sm text-gray-600">Cargando plantillas...</span>
                    </div>
                  ) : familyTemplates.length > 0 ? (
                    <div className="space-y-3">
                      {/* Botón para seleccionar/deseleccionar todas */}
                      <div className="border-b border-gray-300 pb-2 mb-3">
                        <button
                          onClick={() => handleSelectAllFamily(family.id)}
                          className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                            isFullySelected
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : isPartiallySelected
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {isFullySelected 
                            ? `✓ Todas seleccionadas (${familyTemplates.length})`
                            : isPartiallySelected
                            ? `Seleccionar todas (${familyTemplates.filter(t => !selectedTemplateIds.includes(t.id)).length} restantes)`
                            : `Seleccionar todas (${familyTemplates.length})`
                          }
                        </button>
                      </div>

                      {/* Lista de plantillas */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {familyTemplates.map(template => (
                          <label key={template.id} className="flex items-center p-2 rounded hover:bg-white">
                            <input
                              type="checkbox"
                              checked={selectedTemplateIds.includes(template.id)}
                              onChange={() => onTemplateToggle(template.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-gray-900">{template.name}</div>
                              {template.description && (
                                <div className="text-xs text-gray-500">{template.description}</div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Esta familia no tiene plantillas</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
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