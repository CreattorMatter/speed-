// =====================================
// CREATE FAMILY MODAL - BUILDERV3 MODULARIZED
// =====================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import {
  CreateFamilyModalProps,
  BasicInfoStep,
  CloneTemplatesStep,
  ConfirmationStep,
  StepsIndicator,
  useCreateFamilyState,
  useCreateFamilyActions
} from './CreateFamilyModal/index';

export const CreateFamilyModal: React.FC<CreateFamilyModalProps> = ({
  isOpen,
  onClose,
  onCreateFamily,
  existingFamilies,
  onCloneTemplates
}) => {
  
  // =====================
  // STATE MANAGEMENT
  // =====================
  
  const {
    state,
    updateFormData,
    setCurrentStep,
    setIsSubmitting,
    setEnableCloning,
    setReplaceHeaders,
    setHeaderFile,
    setHeaderImageUrl,
    setIsUploadingHeader,
    handleTemplateToggle,
    handleFamilyExpand,
    handleReset
  } = useCreateFamilyState({ existingFamilies });

  // =====================
  // ACTIONS
  // =====================
  
  const {
    handleBasicFormSubmit,
    handleCloneSetup,
    handleFinalSubmit,
    handleClose,
    handlePreviousStep,
    handleHeaderFileSelect,
    handleRemoveHeaderImage,
    getStepActions
  } = useCreateFamilyActions({
    state,
    onCreateFamily,
    onCloneTemplates,
    onClose,
    existingFamilies,
    updateFormData,
    setCurrentStep,
    setIsSubmitting,
    setEnableCloning,
    setReplaceHeaders,
    setHeaderFile,
    setHeaderImageUrl,
    setIsUploadingHeader,
    handleTemplateToggle,
    handleFamilyExpand,
    handleReset
  });

  // =====================
  // RENDER HELPERS
  // =====================
  
  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'basic':
        return (
          <BasicInfoStep
            formData={state.formData}
            onFormDataChange={updateFormData}
            enableCloning={state.enableCloning}
            onEnableCloningChange={setEnableCloning}
          />
        );
      
      case 'clone':
        return (
          <CloneTemplatesStep
            existingFamilies={existingFamilies}
            selectedTemplateIds={state.selectedTemplateIds}
            onTemplateToggle={handleTemplateToggle}
            selectedSourceFamily={state.selectedSourceFamily}
            expandedFamily={state.expandedFamily}
            onFamilyExpand={handleFamilyExpand}
            replaceHeaders={state.replaceHeaders}
            onReplaceHeadersChange={setReplaceHeaders}
            headerFile={state.headerFile}
            headerImageUrl={state.headerImageUrl}
            isUploadingHeader={state.isUploadingHeader}
            onHeaderFileSelect={handleHeaderFileSelect}
            onRemoveHeaderImage={handleRemoveHeaderImage}
          />
        );
      
      case 'confirm':
        return (
          <ConfirmationStep
            formData={state.formData}
            enableCloning={state.enableCloning}
            selectedTemplateIds={state.selectedTemplateIds}
            replaceHeaders={state.replaceHeaders}
            headerFile={state.headerFile}
            headerImageUrl={state.headerImageUrl}
          />
        );
      
      default:
        return null;
    }
  };

  const renderStepButtons = () => {
    const stepActions = getStepActions();
    
    return (
      <div className="flex justify-end space-x-3">
        {stepActions.onCancel && (
          <button
            onClick={stepActions.onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        )}
        
        {stepActions.onPrevious && (
          <button
            onClick={stepActions.onPrevious}
            disabled={stepActions.isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors"
          >
            Anterior
          </button>
        )}
        
        {stepActions.onNext && (
          <button
            onClick={stepActions.onNext}
            disabled={!stepActions.canProceed}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            {stepActions.nextLabel || 'Siguiente'}
          </button>
        )}
        
        {stepActions.onSubmit && (
          <button
            onClick={stepActions.onSubmit}
            disabled={stepActions.isSubmitting || !stepActions.canProceed}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {stepActions.isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{stepActions.submitLabel || 'Confirmar'}</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  const getStepDescription = () => {
    switch (state.currentStep) {
      case 'basic': return 'Información básica de la familia';
      case 'clone': return 'Seleccionar plantillas para copiar';
      case 'confirm': return 'Confirmar y crear';
      default: return '';
    }
  };

  if (!isOpen) return null;

  // =====================
  // MAIN RENDER
  // =====================

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
                {getStepDescription()}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps Indicator */}
          <StepsIndicator
            currentStep={state.currentStep}
            enableCloning={state.enableCloning}
          />

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            {renderStepButtons()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 