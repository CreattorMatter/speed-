// =====================================
// CREATE FAMILY ACTIONS HOOK - BuilderV3
// =====================================

import { useCallback } from 'react';
import { CreateFamilyModalProps, CreateFamilyFormData, CreateFamilyState } from './types';
import { builderV3Service } from '../../../../services/builderV3Service';

interface UseCreateFamilyActionsProps {
  state: CreateFamilyState;
  onCreateFamily: CreateFamilyModalProps['onCreateFamily'];
  onCloneTemplates: CreateFamilyModalProps['onCloneTemplates'];
  onClose: () => void;
  existingFamilies: CreateFamilyModalProps['existingFamilies'];
  updateFormData: (updates: Partial<CreateFamilyFormData>) => void;
  setCurrentStep: (step: CreateFamilyState['currentStep']) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setEnableCloning: (enabled: boolean) => void;
  setReplaceHeaders: (replace: boolean) => void;
  setHeaderFile: (file: File | null) => void;
  setHeaderImageUrl: (url: string) => void;
  setIsUploadingHeader: (uploading: boolean) => void;
  handleTemplateToggle: (templateId: string) => void;
  handleFamilyExpand: (familyId: string) => void;
  handleReset: () => void;
}

export const useCreateFamilyActions = ({
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
}: UseCreateFamilyActionsProps) => {
  
  // =====================
  // STEP NAVIGATION
  // =====================
  
  const handleBasicFormSubmit = useCallback(() => {
    if (!state.formData.displayName.trim()) return;
    
    if (state.enableCloning) {
      setCurrentStep('clone');
    } else {
      setCurrentStep('confirm');
    }
  }, [state.formData.displayName, state.enableCloning, setCurrentStep]);

  const handleCloneSetup = useCallback(() => {
    setCurrentStep('confirm');
  }, [setCurrentStep]);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // =====================
  // FILE UPLOAD
  // =====================
  
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
  }, [setHeaderFile, setHeaderImageUrl, setIsUploadingHeader]);

  const handleRemoveHeaderImage = useCallback(() => {
    if (state.headerImageUrl && state.headerImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(state.headerImageUrl);
    }
    setHeaderFile(null);
    setHeaderImageUrl('');
  }, [state.headerImageUrl, setHeaderFile, setHeaderImageUrl]);

  // =====================
  // FINAL SUBMIT
  // =====================
  
  const handleFinalSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // Subir imagen a Supabase si existe
      let uploadedImageUrl = '';
      if (state.headerFile) {
        console.log('📷 Subiendo imagen de header a Supabase...');
        try {
          uploadedImageUrl = await builderV3Service.imageUpload.uploadImage(
            state.headerFile, 
            'assets', 
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
        ...state.formData,
        name: state.formData.displayName.toLowerCase().replace(/\s+/g, '-') as any, // TODO: Mejorar tipado FamilyTypeV3
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
            replaceHeaderImages: state.replaceHeaders,
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
      if (state.enableCloning && state.selectedTemplateIds.length > 0 && onCloneTemplates) {
        console.log('🔄 Iniciando clonación de plantillas...');
        try {
          await onCloneTemplates(
            state.selectedTemplateIds, 
            newFamily.id, 
            state.replaceHeaders, 
            uploadedImageUrl || undefined
          );
          console.log('✅ Plantillas clonadas exitosamente');
        } catch (cloneError) {
          console.error('❌ Error clonando plantillas:', cloneError);
          // No fallar la creación de familia si falla la clonación
        }
      }

      // Limpiar blob URL temporal si existe
      if (state.headerImageUrl && state.headerImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(state.headerImageUrl);
      }

      // Resetear y cerrar
      handleReset();
      onClose();
    } catch (error) {
      console.error('Error creando familia:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    state.headerFile,
    state.formData,
    state.replaceHeaders,
    state.enableCloning,
    state.selectedTemplateIds,
    state.headerImageUrl,
    existingFamilies,
    onCreateFamily,
    onCloneTemplates,
    setIsSubmitting,
    handleReset,
    onClose
  ]);

  // =====================
  // STEP BUTTON ACTIONS
  // =====================
  
  const handlePreviousStep = useCallback(() => {
    switch (state.currentStep) {
      case 'clone':
        setCurrentStep('basic');
        break;
      case 'confirm':
        setCurrentStep(state.enableCloning ? 'clone' : 'basic');
        break;
    }
  }, [state.currentStep, state.enableCloning, setCurrentStep]);

  const getStepActions = useCallback(() => {
    switch (state.currentStep) {
      case 'basic':
        return {
          onCancel: handleClose,
          onNext: handleBasicFormSubmit,
          nextLabel: state.enableCloning ? 'Siguiente' : 'Crear Familia',
          canProceed: state.formData.displayName.trim().length > 0
        };
      
      case 'clone':
        return {
          onPrevious: handlePreviousStep,
          onNext: handleCloneSetup,
          nextLabel: 'Confirmar',
          canProceed: true
        };
      
      case 'confirm':
        return {
          onPrevious: handlePreviousStep,
          onSubmit: handleFinalSubmit,
          submitLabel: 'Crear Familia',
          isSubmitting: state.isSubmitting,
          canProceed: true
        };
      
      default:
        return {};
    }
  }, [
    state.currentStep,
    state.enableCloning,
    state.formData.displayName,
    state.isSubmitting,
    handleClose,
    handleBasicFormSubmit,
    handlePreviousStep,
    handleCloneSetup,
    handleFinalSubmit
  ]);

  return {
    // Navigation
    handleBasicFormSubmit,
    handleCloneSetup,
    handleFinalSubmit,
    handleClose,
    handlePreviousStep,
    
    // File upload
    handleHeaderFileSelect,
    handleRemoveHeaderImage,
    
    // Data updates
    updateFormData,
    setEnableCloning,
    setReplaceHeaders,
    
    // Template & family selection
    handleTemplateToggle,
    handleFamilyExpand,
    
    // Step actions
    getStepActions
  };
}; 