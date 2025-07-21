// =====================================
// CREATE FAMILY STATE HOOK - BuilderV3
// =====================================

import { useState, useCallback } from 'react';
import { CreateFamilyState, CreateFamilyFormData, CreateFamilyStep } from './types';
import { FamilyV3 } from '../../types';

interface UseCreateFamilyStateProps {
  existingFamilies: FamilyV3[];
}

export const useCreateFamilyState = ({ existingFamilies }: UseCreateFamilyStateProps) => {
  
  // =====================
  // INITIAL STATE
  // =====================
  
  const initialFormData: CreateFamilyFormData = {
    name: '',
    displayName: '',
    description: '',
    isActive: true
  };

  const [state, setState] = useState<CreateFamilyState>({
    currentStep: 'basic',
    isSubmitting: false,
    formData: initialFormData,
    enableCloning: false,
    selectedSourceFamily: null,
    selectedTemplateIds: [],
    replaceHeaders: true,
    expandedFamily: null,
    headerFile: null,
    headerImageUrl: '',
    isUploadingHeader: false
  });

  // =====================
  // STATE UPDATERS
  // =====================
  
  const updateState = useCallback((updates: Partial<CreateFamilyState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateFormData = useCallback((updates: Partial<CreateFamilyFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates }
    }));
  }, []);

  const setCurrentStep = useCallback((step: CreateFamilyStep) => {
    updateState({ currentStep: step });
  }, [updateState]);

  const setIsSubmitting = useCallback((isSubmitting: boolean) => {
    updateState({ isSubmitting });
  }, [updateState]);

  const setEnableCloning = useCallback((enableCloning: boolean) => {
    updateState({ 
      enableCloning,
      // Reset cloning-related state when disabled
      ...(enableCloning ? {} : {
        selectedSourceFamily: null,
        selectedTemplateIds: [],
        expandedFamily: null
      })
    });
  }, [updateState]);

  const setSelectedTemplateIds = useCallback((selectedTemplateIds: string[]) => {
    updateState({ selectedTemplateIds });
  }, [updateState]);

  const setReplaceHeaders = useCallback((replaceHeaders: boolean) => {
    updateState({ replaceHeaders });
  }, [updateState]);

  const setExpandedFamily = useCallback((expandedFamily: string | null) => {
    updateState({ 
      expandedFamily,
      selectedSourceFamily: expandedFamily 
        ? existingFamilies.find(f => f.id === expandedFamily) || null
        : null
    });
  }, [updateState, existingFamilies]);

  const setHeaderFile = useCallback((headerFile: File | null) => {
    updateState({ headerFile });
  }, [updateState]);

  const setHeaderImageUrl = useCallback((headerImageUrl: string) => {
    updateState({ headerImageUrl });
  }, [updateState]);

  const setIsUploadingHeader = useCallback((isUploadingHeader: boolean) => {
    updateState({ isUploadingHeader });
  }, [updateState]);

  // =====================
  // COMPLEX OPERATIONS
  // =====================
  
  const handleTemplateToggle = useCallback((templateId: string) => {
    setState(prev => ({
      ...prev,
      selectedTemplateIds: prev.selectedTemplateIds.includes(templateId)
        ? prev.selectedTemplateIds.filter(id => id !== templateId)
        : [...prev.selectedTemplateIds, templateId]
    }));
  }, []);

  const handleFamilyExpand = useCallback((familyId: string) => {
    setState(prev => {
      const newExpandedFamily = prev.expandedFamily === familyId ? null : familyId;
      return {
        ...prev,
        expandedFamily: newExpandedFamily,
        selectedSourceFamily: newExpandedFamily 
          ? existingFamilies.find(f => f.id === newExpandedFamily) || null
          : null
      };
    });
  }, [existingFamilies]);

  const handleReset = useCallback(() => {
    setState({
      currentStep: 'basic',
      isSubmitting: false,
      formData: initialFormData,
      enableCloning: false,
      selectedSourceFamily: null,
      selectedTemplateIds: [],
      replaceHeaders: true,
      expandedFamily: null,
      headerFile: null,
      headerImageUrl: '',
      isUploadingHeader: false
    });
  }, []);

  // =====================
  // VALIDATION
  // =====================
  
  const isBasicStepValid = useCallback(() => {
    return state.formData.displayName.trim().length > 0;
  }, [state.formData.displayName]);

  const isCloneStepValid = useCallback(() => {
    if (!state.enableCloning) return true;
    return state.selectedTemplateIds.length > 0;
  }, [state.enableCloning, state.selectedTemplateIds]);

  const canProceedToNext = useCallback(() => {
    switch (state.currentStep) {
      case 'basic':
        return isBasicStepValid();
      case 'clone':
        return isCloneStepValid();
      case 'confirm':
        return true;
      default:
        return false;
    }
  }, [state.currentStep, isBasicStepValid, isCloneStepValid]);

  // =====================
  // RETURN STATE AND ACTIONS
  // =====================
  
  return {
    // State
    state,
    
    // Basic updaters
    updateState,
    updateFormData,
    setCurrentStep,
    setIsSubmitting,
    setEnableCloning,
    setSelectedTemplateIds,
    setReplaceHeaders,
    setExpandedFamily,
    setHeaderFile,
    setHeaderImageUrl,
    setIsUploadingHeader,
    
    // Complex operations
    handleTemplateToggle,
    handleFamilyExpand,
    handleReset,
    
    // Validation
    isBasicStepValid,
    isCloneStepValid,
    canProceedToNext
  };
}; 