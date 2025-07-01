// =====================================
// CREATE FAMILY MODAL - BUILDERV3
// =====================================

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Copy, Check, ChevronRight, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react';
import { FamilyV3, TemplateV3 } from '../types';
import { builderV3Service } from '../../../services/builderV3Service';

interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFamily: (familyData: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt' | 'templates'>) => Promise<FamilyV3>;
  existingFamilies: FamilyV3[];
  onCloneTemplates?: (sourceTemplateIds: string[], targetFamilyId: string, replaceHeaders?: boolean, headerImageUrl?: string) => Promise<void>;
}

interface CreateFamilyFormData {
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
}

export const CreateFamilyModal: React.FC<CreateFamilyModalProps> = ({
  isOpen,
  onClose,
  onCreateFamily,
  existingFamilies,
  onCloneTemplates
}) => {
  const [currentStep, setCurrentStep] = useState<'basic' | 'clone' | 'confirm'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Datos del formulario básico
  const [formData, setFormData] = useState<CreateFamilyFormData>({
    name: '',
    displayName: '',
    description: '',
    isActive: true
  });

  // Datos de clonación
  const [enableCloning, setEnableCloning] = useState(false);
  const [selectedSourceFamily, setSelectedSourceFamily] = useState<FamilyV3 | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [replaceHeaders, setReplaceHeaders] = useState(true);
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null);
  
  // Estado para el upload de header
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [headerImageUrl, setHeaderImageUrl] = useState<string>('');
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);

  const handleBasicFormSubmit = useCallback(() => {
    if (!formData.displayName.trim()) return;
    
    if (enableCloning) {
      setCurrentStep('clone');
    } else {
      setCurrentStep('confirm');
    }
  }, [formData, enableCloning]);

  const handleCloneSetup = useCallback(() => {
    setCurrentStep('confirm');
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep('basic');
    setFormData({
      name: '',
      displayName: '',
      description: '',
      isActive: true
    });
    setEnableCloning(false);
    setSelectedSourceFamily(null);
    setSelectedTemplateIds([]);
    setReplaceHeaders(true);
    setExpandedFamily(null);
    setIsSubmitting(false);
    // Limpiar estado de header upload
    setHeaderFile(null);
    setHeaderImageUrl('');
    setIsUploadingHeader(false);
  }, []);

  const handleFinalSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // Subir imagen a Supabase si existe
      let uploadedImageUrl = '';
      if (headerFile) {
        console.log('📷 Subiendo imagen de header a Supabase...');
        try {
          uploadedImageUrl = await builderV3Service.imageUpload.uploadImage(
            headerFile, 
            'template-images', 
            'family-headers'
          );
          console.log('✅ Imagen subida exitosamente:', uploadedImageUrl);
        } catch (uploadError) {
          console.error('❌ Error subiendo imagen:', uploadError);
          // Continuar sin imagen si falla el upload
        }
      }

      // Crear la familia con la imagen subida
      const familyToCreate = {
        ...formData,
        name: formData.displayName.toLowerCase().replace(/\s+/g, '-') as any, // TODO: Mejorar tipado FamilyTypeV3
        icon: '🏷️', // Icono por defecto
        featuredTemplates: [],
        defaultStyle: {
          typography: {
            primaryFont: 'Inter',
            secondaryFont: 'Roboto',
            headerFont: 'Poppins'
          },
          visualEffects: {
            headerStyle: {},
            priceStyle: {},
            footerStyle: {}
          }
        },
        recommendedComponents: ['field-dynamic-text', 'image-header', 'image-product'] as any, // TODO: Mejorar tipado ComponentTypeV3
        migrationConfig: {
          allowMigrationFrom: [],
          headerReplacement: {
            replaceHeaderImages: replaceHeaders,
            replaceColors: false
          }
        },
        headerImage: uploadedImageUrl,
        sortOrder: existingFamilies.length + 1
      };

      console.log('➕ Creando familia:', familyToCreate.displayName);
      const newFamily = await onCreateFamily(familyToCreate);
      console.log('✅ Familia creada con ID:', newFamily.id);

      // Si hay clonación habilitada, clonar las plantillas seleccionadas
      if (enableCloning && selectedTemplateIds.length > 0 && onCloneTemplates) {
        console.log('🔄 Iniciando clonación de plantillas...');
        try {
          await onCloneTemplates(
            selectedTemplateIds, 
            newFamily.id, 
            replaceHeaders, 
            uploadedImageUrl || undefined
          );
          console.log('✅ Plantillas clonadas exitosamente');
        } catch (cloneError) {
          console.error('❌ Error clonando plantillas:', cloneError);
          // No fallar la creación de familia si falla la clonación
        }
      }

      // Limpiar blob URL temporal si existe
      if (headerImageUrl && headerImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(headerImageUrl);
      }

      // Resetear y cerrar
      handleReset();
      onClose();
    } catch (error) {
      console.error('Error creando familia:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, enableCloning, selectedTemplateIds, replaceHeaders, headerFile, headerImageUrl, existingFamilies, onCreateFamily, onCloneTemplates, onClose, handleReset]);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleTemplateToggle = useCallback((templateId: string) => {
    setSelectedTemplateIds(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  }, []);

  const handleFamilyExpand = useCallback((familyId: string) => {
    setExpandedFamily(prev => prev === familyId ? null : familyId);
    setSelectedSourceFamily(existingFamilies.find(f => f.id === familyId) || null);
  }, [existingFamilies]);

  // Handlers para upload de header
  const handleHeaderFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }
      
      setHeaderFile(file);
      setIsUploadingHeader(true);
      
      // Crear URL temporal para preview
      const url = URL.createObjectURL(file);
      setHeaderImageUrl(url);
      setIsUploadingHeader(false);
    }
  }, []);

  const handleRemoveHeaderImage = useCallback(() => {
    if (headerImageUrl && headerImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(headerImageUrl);
    }
    setHeaderFile(null);
    setHeaderImageUrl('');
  }, [headerImageUrl]);

  const renderBasicStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la familia *
        </label>
        <input
          type="text"
          value={formData.displayName}
          onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="ej: Ofertas de Verano"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Describe el propósito de esta familia de plantillas..."
        />
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={enableCloning}
            onChange={(e) => setEnableCloning(e.target.checked)}
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

  const renderCloneStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Seleccionar plantillas para copiar
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Elige las plantillas que deseas copiar a la nueva familia "{formData.displayName}".
        </p>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {existingFamilies.map(family => (
          <div key={family.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => handleFamilyExpand(family.id)}
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
                          onChange={() => handleTemplateToggle(template.id)}
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

      {selectedTemplateIds.length > 0 && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-medium text-blue-900 mb-2">Opciones de copia</h4>
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={replaceHeaders}
              onChange={(e) => setReplaceHeaders(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-blue-700">
              Reemplazar imágenes de header con imagen personalizada
            </span>
          </label>
          
          {replaceHeaders && (
            <div className="mt-4 border border-blue-300 rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Imagen de Header Personalizada</span>
                {headerImageUrl && (
                  <button
                    onClick={handleRemoveHeaderImage}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Remover
                  </button>
                )}
              </div>
              
              {!headerImageUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    Sube una imagen para reemplazar todos los headers
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderFileSelect}
                    className="hidden"
                    id="header-upload"
                  />
                  <label
                    htmlFor="header-upload"
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Seleccionar Imagen
                  </label>
                  <div className="text-xs text-gray-500 mt-1">
                    JPG, PNG, WebP • Máximo 5MB
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded border">
                  <img
                    src={headerImageUrl}
                    alt="Header preview"
                    className="w-12 h-8 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {headerFile?.name || 'Imagen seleccionada'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {headerFile?.size ? `${(headerFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                    </div>
                  </div>
                  <div className="text-green-600">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Confirmar creación de familia
        </h3>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🏷️</span>
          <div>
            <div className="font-medium text-gray-900">{formData.displayName}</div>
            <div className="text-sm text-gray-500">{formData.description}</div>
          </div>
        </div>
      </div>

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
          
          {replaceHeaders && (
            <div className="mt-3 pt-3 border-t border-blue-300">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  Se reemplazarán las imágenes de header
                </span>
              </div>
              
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
    </div>
  );

  const getStepButtons = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleBasicFormSubmit}
              disabled={!formData.displayName.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              {enableCloning ? 'Siguiente' : 'Crear Familia'}
            </button>
          </>
        );
      
      case 'clone':
        return (
          <>
            <button
              onClick={() => setCurrentStep('basic')}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={handleCloneSetup}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Confirmar
            </button>
          </>
        );
      
      case 'confirm':
        return (
          <>
            <button
              onClick={() => setCurrentStep(enableCloning ? 'clone' : 'basic')}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Crear Familia</span>
                </>
              )}
            </button>
          </>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Crear Nueva Familia
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentStep === 'basic' && 'Información básica de la familia'}
                {currentStep === 'clone' && 'Seleccionar plantillas para copiar'}
                {currentStep === 'confirm' && 'Confirmar y crear'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps indicator */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${currentStep === 'basic' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep === 'basic' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Información</span>
              </div>
              
              {enableCloning && (
                <>
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <div className={`flex items-center ${currentStep === 'clone' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      currentStep === 'clone' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      2
                    </div>
                    <span className="ml-2 text-sm font-medium">Plantillas</span>
                  </div>
                </>
              )}
              
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className={`flex items-center ${currentStep === 'confirm' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {enableCloning ? '3' : '2'}
                </div>
                <span className="ml-2 text-sm font-medium">Confirmar</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {currentStep === 'basic' && renderBasicStep()}
            {currentStep === 'clone' && renderCloneStep()}
            {currentStep === 'confirm' && renderConfirmStep()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            {getStepButtons()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 