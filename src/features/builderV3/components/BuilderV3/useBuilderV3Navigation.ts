// =====================================
// BUILDER V3 NAVIGATION HOOK - Main Component
// =====================================

import React, { useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BuilderStepV3, BreadcrumbItem, BuilderV3Navigation, BuilderV3StateUpdaters } from './types';

interface UseBuilderV3NavigationProps {
  currentStep: BuilderStepV3;
  hasUnsavedChanges: boolean;
  currentFamilyDisplayName?: string;
  currentTemplateName?: string;
  onBack: () => void;
  operations: any;
  stateUpdaters: BuilderV3StateUpdaters;
  showConfirmExitModal: boolean;
  showPreview: boolean;
  isCreateFamilyModalOpen: boolean;
}

export const useBuilderV3Navigation = ({
  currentStep,
  hasUnsavedChanges,
  currentFamilyDisplayName,
  currentTemplateName,
  onBack,
  operations,
  stateUpdaters,
  showConfirmExitModal,
  showPreview,
  isCreateFamilyModalOpen
}: UseBuilderV3NavigationProps): BuilderV3Navigation => {
  
  // =====================
  // NAVIGATION EXECUTION
  // =====================
  
  const executeNavigation = useCallback((navigationFn: () => void) => {
    console.log('🔙 Ejecutando navegación...');
    navigationFn();
  }, []);

  // =====================
  // INTELLIGENT NAVIGATION
  // =====================
  
  const handleIntelligentBack = useCallback(() => {
    console.log('🔙 Navegación inteligente desde:', currentStep);
    
    const getNavigationFunction = (): () => void => {
      switch (currentStep) {
        case 'canvas-editor':
          return () => {
            console.log('🔙 Volviendo a librería de plantillas de:', currentFamilyDisplayName);
            stateUpdaters.setCurrentStep('template-library');
          };
        case 'template-library':
          return () => {
            console.log('🔙 Volviendo a selección de familias');
            stateUpdaters.setCurrentStep('family-selection');
          };
        case 'family-selection':
          return () => {
            console.log('🔙 Volviendo al dashboard principal');
            onBack();
          };
        default:
          return () => {
            console.log('🔙 Paso desconocido, volviendo al dashboard');
            onBack();
          };
      }
    };

    const navigationFn = getNavigationFunction();

    // Si estamos en el canvas editor y hay cambios sin guardar, mostrar modal de confirmación
    if (currentStep === 'canvas-editor' && hasUnsavedChanges) {
      stateUpdaters.setPendingNavigation(() => navigationFn);
      stateUpdaters.setShowConfirmExitModal(true);
    } else {
      // Ejecutar navegación directamente
      executeNavigation(navigationFn);
    }
  }, [
    currentStep,
    hasUnsavedChanges,
    currentFamilyDisplayName,
    onBack,
    stateUpdaters,
    executeNavigation
  ]);

  // =====================
  // SAVE AND EXIT ACTIONS
  // =====================
  
  const handleSaveAndExit = useCallback(async () => {
    try {
      await operations.saveTemplate();
      toast.success('Plantilla guardada exitosamente');
      stateUpdaters.setShowConfirmExitModal(false);
      
      // Get the pending navigation function
      // Note: In a real implementation, we'd need to access the pending navigation
      // For now, we'll use the intelligent back logic
      const navigationFn = () => {
        if (currentStep === 'canvas-editor') {
          stateUpdaters.setCurrentStep('template-library');
        }
      };
      executeNavigation(navigationFn);
    } catch (error) {
      toast.error('Error al guardar plantilla');
      console.error('Error guardando:', error);
    }
  }, [operations, stateUpdaters, executeNavigation, currentStep]);

  const handleExitWithoutSaving = useCallback(() => {
    stateUpdaters.setShowConfirmExitModal(false);
    
    // Execute the pending navigation
    const navigationFn = () => {
      if (currentStep === 'canvas-editor') {
        stateUpdaters.setCurrentStep('template-library');
      }
    };
    executeNavigation(navigationFn);
  }, [stateUpdaters, executeNavigation, currentStep]);

  // =====================
  // BREADCRUMBS LOGIC
  // =====================
  
  const getBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const breadcrumbs = [
      { label: 'Dashboard', active: false }
    ];

    switch (currentStep) {
      case 'family-selection':
        breadcrumbs.push({ label: 'Seleccionar Familia', active: true });
        break;
      case 'template-library':
        breadcrumbs.push({ label: 'Familias', active: false });
        breadcrumbs.push({ 
          label: currentFamilyDisplayName || 'Familia', 
          active: true 
        });
        break;
      case 'canvas-editor':
        breadcrumbs.push({ label: 'Familias', active: false });
        breadcrumbs.push({ 
          label: currentFamilyDisplayName || 'Familia', 
          active: false 
        });
        breadcrumbs.push({ 
          label: currentTemplateName || 'Plantilla', 
          active: true 
        });
        break;
    }

    return breadcrumbs;
  }, [currentStep, currentFamilyDisplayName, currentTemplateName]);

  const renderBreadcrumbs = useCallback((): JSX.Element => {
    const breadcrumbs = getBreadcrumbs();
    
    return React.createElement('div', {
      className: 'bg-slate-800/50 border-b border-white/10 px-4 py-2'
    }, React.createElement('div', {
      className: 'flex items-center space-x-2 text-sm'
    }, breadcrumbs.map((breadcrumb, index) => 
      React.createElement(React.Fragment, { key: index }, [
        index > 0 && React.createElement('span', {
          key: `separator-${index}`,
          className: 'text-white/40'
        }, '>'),
        React.createElement('span', {
          key: `breadcrumb-${index}`,
          className: `${
            breadcrumb.active 
              ? 'text-violet-300 font-medium' 
              : 'text-white/70 hover:text-white cursor-pointer'
          } transition-colors`,
          onClick: () => {
            // Permitir navegar a pasos anteriores haciendo clic en breadcrumbs
            if (!breadcrumb.active && index < breadcrumbs.length - 1) {
              if (index === 0) {
                // Usar la navegación inteligente que maneja la confirmación
                handleIntelligentBack();
              } else if (index === 1 && currentStep === 'canvas-editor') {
                // Si hay cambios sin guardar en canvas-editor, usar modal de confirmación
                if (hasUnsavedChanges) {
                  stateUpdaters.setPendingNavigation(() => () => stateUpdaters.setCurrentStep('template-library'));
                  stateUpdaters.setShowConfirmExitModal(true);
                } else {
                  stateUpdaters.setCurrentStep('template-library');
                }
              } else if (index === 1 && currentStep === 'template-library') {
                stateUpdaters.setCurrentStep('family-selection');
              }
            }
          }
        }, breadcrumb.label)
      ])
    )));
  }, [
    getBreadcrumbs,
    handleIntelligentBack,
    currentStep,
    hasUnsavedChanges,
    stateUpdaters
  ]);

  // =====================
  // KEYBOARD SHORTCUTS
  // =====================
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !showConfirmExitModal && !showPreview && !isCreateFamilyModalOpen) {
        event.preventDefault();
        handleIntelligentBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleIntelligentBack, showConfirmExitModal, showPreview, isCreateFamilyModalOpen]);

  return {
    handleIntelligentBack,
    executeNavigation,
    handleSaveAndExit,
    handleExitWithoutSaving,
    getBreadcrumbs,
    renderBreadcrumbs
  };
}; 