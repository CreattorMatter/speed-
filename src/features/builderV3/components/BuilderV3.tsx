// =====================================
// SPEED BUILDER V3 - MAIN COMPONENT
// =====================================

import React, { useState, useCallback } from 'react';
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

type BuilderView = 'builder' | 'admin';
type BuilderStepV3 = 'family-selection' | 'template-library' | 'canvas-editor';

interface BuilderV3Props {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
  userRole?: 'admin' | 'limited';
}

export const BuilderV3: React.FC<BuilderV3Props> = ({
  onBack,
  onLogout,
  userEmail,
  userName,
  userRole = 'admin'
}) => {
  const { state, operations, families, templates, componentsLibrary, isReady } = useBuilderV3Integration();
  const [currentView, setCurrentView] = useState<BuilderView>('builder');
  const [currentStep, setCurrentStep] = useState<BuilderStepV3>('family-selection');
  const [showPreview, setShowPreview] = useState(false);
  const [paperFormat, setPaperFormat] = useState<string>('A4');
  const [customWidth] = useState<number>(210);
  const [customHeight] = useState<number>(297);
  const [rulerUnit, setRulerUnit] = useState<'mm' | 'cm'>('mm');

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
      const newTemplate = await operations.createTemplate({
        name: 'Nueva Plantilla Sin Título',
        familyType: state.currentFamily.id, // Usar ID en lugar de nombre
        canvas: { width: customWidth, height: customHeight, unit: 'px', dpi: 300, backgroundColor: '#ffffff' },
      } as any);
      
      // Optimización: Usar plantilla creada directamente en lugar de cargarla de nuevo
      console.log('🚀 Usando plantilla creada directamente, no necesito cargarla de Supabase');
      operations.setTemplateDirect(newTemplate);
      setCurrentStep('canvas-editor');
    } catch (error) {
      console.error('❌ Error creando plantilla:', error);
      toast.error('Error al crear nueva plantilla');
    }
  }, [state.currentFamily, operations, customWidth, customHeight]);

  const handleCreateFamily = useCallback(() => {
    console.log('🚀 Abriendo portal de administración para crear familia');
    setCurrentView('admin');
  }, []);

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
          userRole={userRole}
          onCreateFamily={handleCreateFamily}
        />;
      case 'template-library':
        if (!state.currentFamily) return <LoadingSpinner />;
        return (
          <TemplateLibraryV3
            family={state.currentFamily}
            templates={templates}
            onTemplateSelect={handleTemplateSelect}
            onTemplateCreate={handleCreateNewTemplate}
            userRole={userRole}
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
              />
            </div>
            <div className="w-80 bg-white border-l border-gray-300">
                <PropertiesPanelV3
                    state={state}
                    activeTab={'properties'}
                    onTabChange={() => {}}
                    onComponentUpdate={operations.updateComponent}
                    onComponentDelete={(id: string) => operations.removeComponents([id])}
                    onComponentDuplicate={(id: string) => operations.duplicateComponents([id])}
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
            onBack={onBack} 
            onLogout={onLogout} 
            userName={userName}
            onGoToAdmin={() => setCurrentView('admin')}
        />
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
    </div>
  );
};