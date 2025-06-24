// =====================================
// SPEED BUILDER V3 - MAIN COMPONENT
// =====================================

import React, { useState, useCallback, useEffect } from 'react';
import { useBuilderV3Integration } from '../../../hooks/useBuilderV3Integration';
import { FamilySelectorV3 } from './FamilySelectorV3';
import { TemplateLibraryV3 } from './TemplateLibraryV3';
import { CanvasEditorV3 } from './CanvasEditorV3';
import { ComponentsPanelV3 } from './ComponentsPanelV3';
import { PropertiesPanelV3 } from './PropertiesPanelV3';
import { PreviewModalV3 } from './PreviewModalV3';
import { ToolbarV3 } from './ToolbarV3';
import { StatusBarV3 } from './StatusBarV3';
import { Header } from '../../../components/shared/Header';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';
import { ConfirmExitModal } from './ConfirmExitModal';
import { FamilyV3, FamilyTypeV3, ComponentTypeV3, PositionV3, DraggableComponentV3 } from '../types';
import { UnitConverter } from '../utils/unitConverter';
import {
  ArrowLeft,
  Save,
  Eye,
  Download,
  Undo,
  Redo,
  Zap,
  User,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConfigurationPortal } from '@/features/settings/components/ConfigurationPortal';
import { CreateFamilyModal } from './CreateFamilyModal';
import { AnimatePresence, motion } from 'framer-motion';
import { AppDispatch, RootState } from '@/store';

type BuilderView = 'builder' | 'admin';
type BuilderStepV3 = 'family-selection' | 'template-library' | 'canvas-editor';

interface BuilderV3Props {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
  userRole?: 'admin' | 'editor' | 'viewer';
}

export const BuilderV3: React.FC<BuilderV3Props> = ({
  onBack,
  onLogout,
  userEmail,
  userName,
  userRole = 'admin'
}) => {
  const { state, operations, families, templates, componentsLibrary, isReady, refreshData } = useBuilderV3Integration();
  const [currentView, setCurrentView] = useState<BuilderView>('builder');
  const [currentStep, setCurrentStep] = useState<BuilderStepV3>('family-selection');
  const [showPreview, setShowPreview] = useState(false);
  const [isCreateFamilyModalOpen, setIsCreateFamilyModalOpen] = useState(false);
  const [paperFormat, setPaperFormat] = useState<string>('A4');
  const [customWidth, setCustomWidth] = useState<number>(210);
  const [customHeight, setCustomHeight] = useState<number>(297);
  const [rulerUnit, setRulerUnit] = useState<'mm' | 'cm'>('mm');
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [showConfirmExitModal, setShowConfirmExitModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => {});

  const availablePaperFormats = [
    { id: 'A4', name: 'A4', width: 210, height: 297, description: '210 x 297 mm' },
    { id: 'A3', name: 'A3', width: 297, height: 420, description: '297 x 420 mm' },
    { id: 'LETTER', name: 'Carta', width: 216, height: 279, description: '8.5 x 11 in' },
    { id: 'CUSTOM', name: 'Personalizado', width: 0, height: 0, description: 'Dimensiones personalizadas' }
  ];

  const handleFamilySelect = useCallback(async (familyType: FamilyTypeV3) => {
    try {
      const family = families.find((f: FamilyV3) => f.name === familyType);
      if (family) {
        await operations.loadFamily(family.id);
        setCurrentStep('template-library');
      }
    } catch (e) { toast.error("Error al cargar familia"); }
  }, [families, operations]);

  const handleTemplateSelect = useCallback(async (templateId: string) => {
    try {
      await operations.loadTemplate(templateId);
      setCurrentStep('canvas-editor');
    } catch (e) { toast.error("Error al cargar plantilla"); }
  }, [operations]);
  
  const handleCreateNewTemplate = useCallback(async () => {
    if (!state.currentFamily) return;
    try {
      const canvasWidthInPx = customWidth * UnitConverter.MM_TO_PX;
      const canvasHeightInPx = customHeight * UnitConverter.MM_TO_PX;

      const newTemplate = await operations.createTemplate({
        name: 'Nueva Plantilla Sin Título',
        familyType: state.currentFamily.id,
        canvas: { width: canvasWidthInPx, height: canvasHeightInPx, unit: 'px', dpi: 300, backgroundColor: '#ffffff' },
      } as any);
      
      console.log(`🚀 Nueva plantilla creada con dimensiones ${Math.round(canvasWidthInPx)}x${Math.round(canvasHeightInPx)}px`);
      operations.setTemplateDirect(newTemplate);
      setCurrentStep('canvas-editor');
    } catch (error) {
      console.error('❌ Error creando plantilla:', error);
      toast.error('Error al crear nueva plantilla');
    }
  }, [state.currentFamily, operations, customWidth, customHeight]);

  const handleCreateFamily = useCallback(() => {
    setIsCreateFamilyModalOpen(true);
  }, []);

  const handleFamilyCreated = useCallback(async (familyData: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt' | 'templates'>) => {
    try {
      await operations.createFamily(familyData);
      toast.success(`Familia "${familyData.displayName}" creada exitosamente.`);
      await refreshData();
      setIsCreateFamilyModalOpen(false);
    } catch (error) {
      toast.error('Error al crear la familia.');
      console.error('Failed to create family:', error);
    }
  }, [operations, refreshData]);

  const handlePaperFormatChange = useCallback((formatId: string) => {
    setPaperFormat(formatId);
    const format = availablePaperFormats.find(f => f.id === formatId);
    if (format && format.id !== 'CUSTOM' && state.currentTemplate) {
      operations.updateTemplate(state.currentTemplate.id, {
        canvas: {
          ...state.currentTemplate.canvas,
          width: format.width * UnitConverter.MM_TO_PX,
          height: format.height * UnitConverter.MM_TO_PX
        }
      });
    }
  }, [availablePaperFormats, state.currentTemplate, operations]);

  const handleComponentAdd = useCallback((type: ComponentTypeV3, position: PositionV3) => {
    const component = operations.createComponent(type, position);
    operations.addComponent(component);
  }, [operations]);

  const handleComponentSelect = useCallback((componentId: string | null) => {
    operations.selectComponent(componentId || '');
  }, [operations]);

  const handleMultipleComponentSelect = useCallback((componentIds: string[]) => {
    operations.selectComponents(componentIds);
  }, [operations]);

  const handleTitleChange = useCallback((newTitle: string) => {
    if (!state.currentTemplate) return;
    
    // Validar que el título no esté vacío
    const trimmedTitle = newTitle.trim();
    if (trimmedTitle.length === 0) {
      console.warn('⚠️ No se permite título vacío');
      return;
    }
    
    console.log('📝 Cambiando título de plantilla:', trimmedTitle);
    operations.updateTemplate(state.currentTemplate.id, {
      name: trimmedTitle
    });
  }, [state.currentTemplate, operations]);

  const executeNavigation = useCallback((navigationFn: () => void) => {
    console.log('🔙 Ejecutando navegación...');
    navigationFn();
  }, []);

  const handleIntelligentBack = useCallback(() => {
    console.log('🔙 Navegación inteligente desde:', currentStep);
    
    const getNavigationFunction = (): () => void => {
      switch (currentStep) {
        case 'canvas-editor':
          return () => {
            console.log('🔙 Volviendo a librería de plantillas de:', state.currentFamily?.displayName);
            setCurrentStep('template-library');
          };
        case 'template-library':
          return () => {
            console.log('🔙 Volviendo a selección de familias');
            setCurrentStep('family-selection');
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
    if (currentStep === 'canvas-editor' && state.hasUnsavedChanges) {
      setPendingNavigation(() => navigationFn);
      setShowConfirmExitModal(true);
    } else {
      // Ejecutar navegación directamente
      executeNavigation(navigationFn);
    }
  }, [currentStep, state.hasUnsavedChanges, state.currentFamily, onBack, executeNavigation]);

  const handleSaveAndExit = useCallback(async () => {
    try {
      await operations.saveTemplate();
      toast.success('Plantilla guardada exitosamente');
      setShowConfirmExitModal(false);
      executeNavigation(pendingNavigation);
    } catch (error) {
      toast.error('Error al guardar plantilla');
      console.error('Error guardando:', error);
    }
  }, [operations, executeNavigation, pendingNavigation]);

  const handleExitWithoutSaving = useCallback(() => {
    setShowConfirmExitModal(false);
    executeNavigation(pendingNavigation);
  }, [executeNavigation, pendingNavigation]);

  const getBreadcrumbs = () => {
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
          label: state.currentFamily?.displayName || 'Familia', 
          active: true 
        });
        break;
      case 'canvas-editor':
        breadcrumbs.push({ label: 'Familias', active: false });
        breadcrumbs.push({ 
          label: state.currentFamily?.displayName || 'Familia', 
          active: false 
        });
        breadcrumbs.push({ 
          label: state.currentTemplate?.name || 'Plantilla', 
          active: true 
        });
        break;
    }

    return breadcrumbs;
  };

  const renderBreadcrumbs = () => {
    const breadcrumbs = getBreadcrumbs();
    
    return (
      <div className="bg-slate-800/50 border-b border-white/10 px-4 py-2">
        <div className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="text-white/40">{'>'}</span>
              )}
              <span 
                className={`${
                  breadcrumb.active 
                    ? 'text-violet-300 font-medium' 
                    : 'text-white/70 hover:text-white cursor-pointer'
                } transition-colors`}
                onClick={() => {
                  // Permitir navegar a pasos anteriores haciendo clic en breadcrumbs
                  if (!breadcrumb.active && index < breadcrumbs.length - 1) {
                    if (index === 0) {
                      // Usar la navegación inteligente que maneja la confirmación
                      handleIntelligentBack();
                    } else if (index === 1 && currentStep === 'canvas-editor') {
                      // Si hay cambios sin guardar en canvas-editor, usar modal de confirmación
                      if (state.hasUnsavedChanges) {
                        setPendingNavigation(() => () => setCurrentStep('template-library'));
                        setShowConfirmExitModal(true);
                      } else {
                        setCurrentStep('template-library');
                      }
                    } else if (index === 1 && currentStep === 'template-library') {
                      setCurrentStep('family-selection');
                    }
                  }
                }}
              >
                {breadcrumb.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Soporte para navegación con teclado (Escape)
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

  if (!isReady) return <LoadingSpinner />;

  if (currentView === 'admin') {
    // Crear objeto de usuario con la información disponible
    const userObject = {
      id: userEmail,
      email: userEmail,
      name: userName,
      role: userRole,
      status: 'active' as const,
      lastLogin: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    return <ConfigurationPortal 
      isOpen={true} 
      onClose={() => setCurrentView('builder')} 
      currentUser={userObject} 
    />;
  }

  const renderContent = () => {
    switch (currentStep) {
      case 'family-selection':
        return <FamilySelectorV3 
          families={families} 
          onFamilySelect={handleFamilySelect}
          onFamilyMigration={operations.migrateFamily}
          userRole={userRole === 'admin' ? 'admin' : 'limited'}
          onCreateFamily={handleCreateFamily}
          onFamilyDelete={operations.deleteFamily}
        />;
      case 'template-library':
        if (!state.currentFamily) return <LoadingSpinner />;
        return (
          <TemplateLibraryV3
            family={state.currentFamily}
            templates={templates}
            onTemplateSelect={handleTemplateSelect}
            onTemplateCreate={handleCreateNewTemplate}
            userRole={userRole === 'admin' ? 'admin' : 'limited'}
          />
        );
      case 'canvas-editor':
        if (!state.currentTemplate) return <LoadingSpinner />;
        return (
          <div className="flex h-full bg-gray-200">
            <ComponentsPanelV3 componentsLibrary={componentsLibrary} onComponentDragStart={() => {}} />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <ToolbarV3
                onSave={operations.saveTemplate}
                onPreview={() => setShowPreview(true)}
                onExport={() => operations.exportCanvas(state.exportConfig)}
                onUndo={operations.undo}
                onRedo={operations.redo}
                onConnectSAP={operations.connectToSAP as any}
                onConnectPromotions={operations.connectToPromotions as any}
                onToggleGrid={operations.toggleGrid}
                onToggleRulers={operations.toggleRulers}
                onZoomIn={() => operations.setZoom(state.canvas.zoom + 0.1)}
                onZoomOut={() => operations.setZoom(state.canvas.zoom - 0.1)}
                onZoomReset={() => operations.setZoom(1)}
                onCopy={() => operations.copyComponents(state.canvas.selectedComponentIds)}
                onDelete={() => operations.removeComponents(state.canvas.selectedComponentIds)}
                onAlignLeft={() => operations.alignComponents(state.canvas.selectedComponentIds, 'left')}
                onAlignCenter={() => operations.alignComponents(state.canvas.selectedComponentIds, 'center')}
                onAlignRight={() => operations.alignComponents(state.canvas.selectedComponentIds, 'right')}
                onAlignJustify={() => {}}
                onPaperFormatChange={handlePaperFormatChange}
                onTitleChange={handleTitleChange}
                templateTitle={state.currentTemplate.name}
                hasUnsavedChanges={state.hasUnsavedChanges}
                canUndo={state.canvas.canUndo}
                canRedo={state.canvas.canRedo}
                hasSelection={state.canvas.selectedComponentIds.length > 0}
                gridVisible={state.canvas.showGrid}
                rulersVisible={state.canvas.showRulers}
                zoomLevel={state.canvas.zoom * 100}
                isSaving={state.isSaving}
                isConnectedSAP={state.sapConnection.isConnected}
                isConnectedPromotions={state.promotionConnection.isConnected}
                paperFormat={paperFormat}
                availablePaperFormats={availablePaperFormats}
              />
              <CanvasEditorV3
                template={state.currentTemplate}
                components={state.components}
                canvasState={state.canvas}
                selectedComponentIds={state.canvas.selectedComponentIds}
                onComponentSelect={handleComponentSelect}
                onMultipleComponentSelect={handleMultipleComponentSelect}
                onComponentAdd={handleComponentAdd}
                operations={operations}
                rulerUnit={rulerUnit}
                activeTool={state.canvas.activeTool as 'select' | 'pan' | 'zoom'}
              />
            </div>
            <div className="w-80 bg-white border-l border-gray-300">
                <PropertiesPanelV3
                    state={state}
                    activeTab={state.ui.activeRightTab}
                    onTabChange={(tab) => {
                      console.log('🔄 BuilderV3 - onTabChange called with:', tab);
                      console.log('🔄 Current activeRightTab:', state.ui.activeRightTab);
                      operations.updateUIState({ activeRightTab: tab });
                    }}
                    onComponentUpdate={operations.updateComponent}
                    onComponentDelete={(id: string) => operations.removeComponents([id])}
                    onComponentDuplicate={(id: string) => {
                      const duplicated = operations.duplicateComponent(id);
                      if (duplicated) operations.addComponent(duplicated);
                    }}
                    onComponentToggleVisibility={(id: string) => operations.updateComponent(id, { isVisible: !state.components.find((c: DraggableComponentV3) => c.id === id)?.isVisible })}
                    onComponentToggleLock={(id: string) => operations.updateComponent(id, { isLocked: !state.components.find((c: DraggableComponentV3) => c.id === id)?.isLocked })}
                />
            </div>
          </div>
        );
      default:
        return <div>Paso desconocido</div>;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans">
        <Header 
            onBack={handleIntelligentBack} 
            onLogout={onLogout} 
            userName={userName}
            onGoToAdmin={() => setCurrentView('admin')}
        />
        {renderBreadcrumbs()}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
      <StatusBarV3
        state={state}
        zoomLevel={state.canvas.zoom * 100}
        isConnectedSAP={state.sapConnection.isConnected}
        isConnectedPromotions={state.promotionConnection.isConnected}
        gridVisible={state.canvas.showGrid}
        rulersVisible={state.canvas.showRulers}
      />
      {showPreview && state.currentTemplate && (
        <PreviewModalV3
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          state={state}
          template={state.currentTemplate}
        />
      )}
      {isCreateFamilyModalOpen && (
        <CreateFamilyModal
          isOpen={isCreateFamilyModalOpen}
          onClose={() => setIsCreateFamilyModalOpen(false)}
          onCreateFamily={handleFamilyCreated}
          existingFamilies={families}
          onCloneTemplates={async (sourceTemplateIds, targetFamilyId, replaceHeaders) => {
            console.log('Cloning:', { sourceTemplateIds, targetFamilyId, replaceHeaders });
          }}
        />
      )}

      <ConfirmExitModal
        isOpen={showConfirmExitModal}
        onClose={() => setShowConfirmExitModal(false)}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
        templateName={state.currentTemplate?.name || 'la plantilla'}
        destinationText="la librería de plantillas"
      />
    </div>
  );
};