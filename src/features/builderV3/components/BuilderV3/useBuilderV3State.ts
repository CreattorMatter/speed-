// =====================================
// BUILDER V3 STATE HOOK - Main Component
// =====================================

import { useState, useCallback } from 'react';
import { BuilderV3State, BuilderView, BuilderStepV3, PaperFormat, BuilderV3StateUpdaters } from './types';

interface UseBuilderV3StateProps {
  initialStep?: BuilderStepV3;
}

export const useBuilderV3State = ({
  initialStep = 'family-selection'
}: UseBuilderV3StateProps = {}) => {
  
  // =====================
  // INITIAL STATE
  // =====================
  
  const [builderState, setBuilderState] = useState<BuilderV3State>({
    // View and step management
    currentView: 'builder',
    currentStep: initialStep,
    
    // Modal states
    showPreview: false,
    isCreateFamilyModalOpen: false,
    showConfirmExitModal: false,
    isPaperModalOpen: false,
    
    // Paper format settings
    paperFormat: 'A4',
    customWidth: 210,
    customHeight: 297,
    orientation: 'portrait',
    rulerUnit: 'mm',
    
    // Navigation state
    pendingNavigation: () => {}
  });

  // =====================
  // AVAILABLE PAPER FORMATS
  // =====================
  
  const availablePaperFormats: PaperFormat[] = [
    { id: 'A2', name: 'A2', width: 420, height: 594, description: '420 x 594 mm' },
    { id: 'A3', name: 'A3', width: 297, height: 420, description: '297 x 420 mm' },
    { id: 'A4', name: 'A4', width: 210, height: 297, description: '210 x 297 mm' },
    { id: 'LETTER', name: 'Carta', width: 216, height: 279, description: '8.5 x 11 in' },
    { id: 'CUSTOM', name: 'Personalizado', width: 0, height: 0, description: 'Dimensiones personalizadas' }
  ];

  // =====================
  // STATE UPDATERS
  // =====================
  
  const updateBuilderState = useCallback((updates: Partial<BuilderV3State>) => {
    setBuilderState(prev => ({ ...prev, ...updates }));
  }, []);

  const setCurrentView = useCallback((currentView: BuilderView) => {
    updateBuilderState({ currentView });
  }, [updateBuilderState]);

  const setCurrentStep = useCallback((currentStep: BuilderStepV3) => {
    updateBuilderState({ currentStep });
  }, [updateBuilderState]);

  const setShowPreview = useCallback((showPreview: boolean) => {
    updateBuilderState({ showPreview });
  }, [updateBuilderState]);

  const setIsCreateFamilyModalOpen = useCallback((isCreateFamilyModalOpen: boolean) => {
    updateBuilderState({ isCreateFamilyModalOpen });
  }, [updateBuilderState]);

  const setShowConfirmExitModal = useCallback((showConfirmExitModal: boolean) => {
    updateBuilderState({ showConfirmExitModal });
  }, [updateBuilderState]);

  const setPaperFormat = useCallback((paperFormat: string) => {
    updateBuilderState({ paperFormat });
  }, [updateBuilderState]);

  const setCustomWidth = useCallback((customWidth: number) => {
    updateBuilderState({ customWidth });
  }, [updateBuilderState]);

  const setCustomHeight = useCallback((customHeight: number) => {
    updateBuilderState({ customHeight });
  }, [updateBuilderState]);

  const setOrientation = useCallback((orientation: 'portrait' | 'landscape') => {
    updateBuilderState({ orientation });
  }, [updateBuilderState]);

  const setRulerUnit = useCallback((rulerUnit: 'mm' | 'cm') => {
    updateBuilderState({ rulerUnit });
  }, [updateBuilderState]);

  const setPendingNavigation = useCallback((pendingNavigation: () => void) => {
    updateBuilderState({ pendingNavigation });
  }, [updateBuilderState]);

  const setIsPaperModalOpen = useCallback((isPaperModalOpen: boolean) => {
    updateBuilderState({ isPaperModalOpen });
  }, [updateBuilderState]);

  // =====================
  // STATE UPDATERS INTERFACE
  // =====================
  
  const stateUpdaters: BuilderV3StateUpdaters = {
    setCurrentView,
    setCurrentStep,
    setShowPreview,
    setIsCreateFamilyModalOpen,
    setShowConfirmExitModal,
    setPaperFormat,
    setCustomWidth,
    setCustomHeight,
    setOrientation,
    setRulerUnit,
    setPendingNavigation,
    setIsPaperModalOpen
  };

  return {
    // State
    builderState,
    availablePaperFormats,
    
    // Individual updaters
    ...stateUpdaters,
    
    // Batch updater
    updateBuilderState
  };
}; 