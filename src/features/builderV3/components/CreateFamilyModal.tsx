// =====================================
// CREATE FAMILY MODAL - BUILDERV3
// =====================================

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Copy, Check, ChevronRight, ChevronDown } from 'lucide-react';
import { FamilyV3, TemplateV3 } from '../types';

interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFamily: (familyData: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt' | 'templates'>) => Promise<void>;
  existingFamilies: FamilyV3[];
  onCloneTemplates?: (sourceTemplateIds: string[], targetFamilyId: string, replaceHeaders?: boolean) => Promise<void>;
}

interface CreateFamilyFormData {
  name: string;
  displayName: string;
  description: string;
  icon: string;
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
    icon: '🏷️',
    isActive: true
  });

  // Datos de clonación
  const [enableCloning, setEnableCloning] = useState(false);
  const [selectedSourceFamily, setSelectedSourceFamily] = useState<FamilyV3 | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [replaceHeaders, setReplaceHeaders] = useState(true);
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null);

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

  const handleFinalSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // Crear la familia
      const familyToCreate = {
        ...formData,
        name: formData.displayName.toLowerCase().replace(/\s+/g, '-') as any, // TODO: Mejorar tipado FamilyTypeV3
        featuredTemplates: [],
        defaultStyle: {
          brandColors: {
            primary: '#0066cc',
            secondary: '#ffffff',
            accent: '#00aaff',
            text: '#333333',
            background: '#ffffff'
          },
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
        headerImage: '',
        sortOrder: existingFamilies.length + 1
      };

      await onCreateFamily(familyToCreate);

      // Si hay clonación habilitada, clonar las plantillas seleccionadas
      if (enableCloning && selectedTemplateIds.length > 0 && onCloneTemplates) {
        // Nota: En una implementación real, necesitaríamos el ID de la familia recién creada
        // Por ahora simulamos que la clonación se hará después
        console.log('Clonando plantillas:', selectedTemplateIds);
      }

      // Resetear y cerrar
      handleReset();
      onClose();
    } catch (error) {
      console.error('Error creando familia:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, enableCloning, selectedTemplateIds, replaceHeaders, existingFamilies, onCreateFamily, onCloneTemplates, onClose]);

  const handleReset = useCallback(() => {
    setCurrentStep('basic');
    setFormData({
      name: '',
      displayName: '',
      description: '',
      icon: '🏷️',
      isActive: true
    });
    setEnableCloning(false);
    setSelectedSourceFamily(null);
    setSelectedTemplateIds([]);
    setReplaceHeaders(true);
    setExpandedFamily(null);
    setIsSubmitting(false);
  }, []);

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icono (emoji)
        </label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
          placeholder="🏷️"
          maxLength={2}
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
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={replaceHeaders}
              onChange={(e) => setReplaceHeaders(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-blue-700">
              Actualizar imágenes de header automáticamente
            </span>
          </label>
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
          <span className="text-2xl">{formData.icon}</span>
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
          <div className="text-sm text-blue-700">
            {selectedTemplateIds.length === 1 
              ? 'Se copiará 1 plantilla'
              : `Se copiarán ${selectedTemplateIds.length} plantillas`
            }
            {replaceHeaders && ' con headers actualizados'}
          </div>
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