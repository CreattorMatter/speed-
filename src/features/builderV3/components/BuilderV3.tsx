// =====================================
// SPEED BUILDER V3 - MAIN COMPONENT MODULARIZED
// =====================================

import React from 'react';
import { useBuilderV3Integration } from '../../../hooks/useBuilderV3Integration';
import { Header } from '../../../components/shared/Header';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { PreviewModalV3 } from './PreviewModalV3';
import { ConfirmExitModal } from './ConfirmExitModal';
import { CreateFamilyModal } from './CreateFamilyModal';
import { useNavigate } from 'react-router-dom';
import {
  BuilderV3Props,
  useBuilderV3State,
  useBuilderV3Navigation,
  useBuilderV3TemplateActions,
  useBuilderV3CanvasActions,
  BuilderV3ContentRenderer
} from './BuilderV3/index';

// Importar debug helper en desarrollo
if (import.meta.env.DEV) {
  import('../utils/debugThumbnails');
}

export const BuilderV3: React.FC<BuilderV3Props> = ({
  onBack,
  onLogout,
  userName,
  userRole = 'editor'
}) => {
  const navigate = useNavigate();
  
  // =====================
  // INTEGRATION & DATA
  // =====================
  
  const { 
    state, 
    operations, 
    families, 
    templates, 
    componentsLibrary, 
    isReady, 
    refreshData 
  } = useBuilderV3Integration();

  // =====================
  // MODULAR STATE MANAGEMENT
  // =====================
  
  const {
    builderState,
    availablePaperFormats,
    updateBuilderState,
    ...allStateUpdaters
  } = useBuilderV3State();

  // Extract specific updaters for direct use
  const { 
    setShowPreview,
    setIsCreateFamilyModalOpen,
    setShowConfirmExitModal 
  } = allStateUpdaters;

  // =====================
  // MODULAR NAVIGATION
  // =====================
  
  const navigation = useBuilderV3Navigation({
    currentStep: builderState.currentStep,
    hasUnsavedChanges: state.hasUnsavedChanges,
    currentFamilyDisplayName: state.currentFamily?.displayName,
    currentTemplateName: state.currentTemplate?.name,
    onBack,
    operations,
    stateUpdaters: allStateUpdaters,
    showConfirmExitModal: builderState.showConfirmExitModal,
    showPreview: builderState.showPreview,
    isCreateFamilyModalOpen: builderState.isCreateFamilyModalOpen,
    refreshData // 🔄 Pasar refreshData para actualizar thumbnails
  });

  // =====================
  // MODULAR TEMPLATE ACTIONS
  // =====================
  
  const templateActions = useBuilderV3TemplateActions({
    families,
    operations,
    state,
    stateUpdaters: allStateUpdaters,
    customWidth: builderState.customWidth,
    customHeight: builderState.customHeight,
    orientation: builderState.orientation,
    refreshData
  });

  // =====================
  // MODULAR CANVAS ACTIONS
  // =====================
  
  const canvasActions = useBuilderV3CanvasActions({
    operations,
    state,
    stateUpdaters: allStateUpdaters,
    availablePaperFormats,
    orientation: builderState.orientation
  });

  // =====================
  // LOADING STATE
  // =====================
  
  if (!isReady) return <LoadingSpinner />;

  // =====================
  // MAIN RENDER
  // =====================
  
  return (
    <div className="h-screen w-screen flex flex-col font-sans">
      {/* Header */}
      <Header 
        onBack={navigation.handleIntelligentBack} 
        onLogout={onLogout} 
        userName={userName}
        onGoToAdmin={() => navigate('/administration')}
      />
      
      {/* Breadcrumbs */}
      {navigation.renderBreadcrumbs()}
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <BuilderV3ContentRenderer
          currentStep={builderState.currentStep}
          families={families}
          templates={templates}
          componentsLibrary={componentsLibrary}
          state={state}
          operations={operations}
          userRole={userRole}
          templateActions={templateActions}
          canvasActions={canvasActions}
          paperFormat={builderState.paperFormat}
          orientation={builderState.orientation}
          availablePaperFormats={availablePaperFormats}
          rulerUnit={builderState.rulerUnit}
          refreshData={refreshData}
          setShowPreview={setShowPreview}
        />
      </div>

      {/* Modals */}
      {builderState.showPreview && state.currentTemplate && (
        <PreviewModalV3
          isOpen={builderState.showPreview}
          onClose={() => setShowPreview(false)}
          state={state}
          template={state.currentTemplate}
        />
      )}

      {builderState.isCreateFamilyModalOpen && (
        <CreateFamilyModal
          isOpen={builderState.isCreateFamilyModalOpen}
          onClose={() => setIsCreateFamilyModalOpen(false)}
          onCreateFamily={templateActions.handleFamilyCreated}
          existingFamilies={families}
          onCloneTemplates={templateActions.handleCloneTemplates}
        />
      )}

      <ConfirmExitModal
        isOpen={builderState.showConfirmExitModal}
        onClose={() => setShowConfirmExitModal(false)}
        onSaveAndExit={navigation.handleSaveAndExit}
        onExitWithoutSaving={navigation.handleExitWithoutSaving}
        templateName={state.currentTemplate?.name || 'la plantilla'}
        destinationText="la librería de plantillas"
      />
    </div>
  );
};