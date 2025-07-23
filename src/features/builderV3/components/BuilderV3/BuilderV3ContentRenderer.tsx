// =====================================
// BUILDER V3 CONTENT RENDERER - Main Component
// =====================================

import React from 'react';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { FamilySelectorV3 } from '../FamilySelectorV3';
import { TemplateLibraryV3 } from '../TemplateLibraryV3';
import { CanvasEditorV3 } from '../CanvasEditorV3';
import { ComponentsPanelV3 } from '../ComponentsPanelV3';
import { PropertiesPanelV3 } from '../PropertiesPanelV3';
import { ToolbarV3 } from '../ToolbarV3';
import { DraggableComponentV3 } from '../../types';
import { ContentRendererProps } from './types';

export const BuilderV3ContentRenderer: React.FC<ContentRendererProps> = ({
  currentStep,
  families,
  templates,
  componentsLibrary,
  state,
  operations,
  userRole,
  templateActions,
  canvasActions,
  paperFormat,
  orientation,
  availablePaperFormats,
  rulerUnit,
  refreshData,
  setShowPreview
}) => {
  
  // =====================
  // HANDLERS WITH REFRESH
  // =====================
  
  const handleSaveWithRefresh = async () => {
    try {
      // 🎯 USAR LA NUEVA FUNCIÓN QUE ESPERA EL THUMBNAIL COMPLETO
      await operations.saveTemplateAndWaitForThumbnail();
      
      // 🔄 Refrescar datos después de que el thumbnail esté listo
      if (refreshData) {
        await refreshData();
        console.log('🔄 Datos refrescados con thumbnail completo desde toolbar');
      }
    } catch (error) {
      console.error('Error en handleSaveWithRefresh:', error);
      throw error;
    }
  };
  
  // =====================
  // RENDER BY STEP
  // =====================
  
  switch (currentStep) {
    case 'family-selection':
      return (
        <div className="h-full overflow-y-auto">
          <FamilySelectorV3 
            families={families} 
            onFamilySelect={templateActions.handleFamilySelect}
            onFamilyMigration={operations.migrateFamily}
            userRole={userRole === 'admin' ? 'admin' : 'limited'}
            onCreateFamily={templateActions.handleCreateFamily}
            onFamilyDelete={operations.deleteFamily}
            onFamilyUpdate={operations.updateFamily}
          />
        </div>
      );
      
    case 'template-library':
      if (!state.currentFamily) return <LoadingSpinner />;
      return (
        <div className="h-full overflow-y-auto">
          <TemplateLibraryV3
            family={state.currentFamily}
            templates={templates}
            onTemplateSelect={templateActions.handleTemplateSelect}
            onTemplateCreate={templateActions.handleCreateNewTemplate}
            onTemplateDelete={async (templateId: string) => {
              try {
                await operations.deleteTemplate(templateId);
                await refreshData(); // Refrescar datos después de eliminar
                toast.success('Plantilla eliminada exitosamente');
              } catch (error) {
                console.error('Error eliminando plantilla desde BuilderV3:', error);
                toast.error('Error al eliminar la plantilla');
              }
            }}
            userRole={userRole === 'admin' ? 'admin' : 'limited'}
            onRefresh={refreshData}
          />
        </div>
      );
      
    case 'canvas-editor':
      if (!state.currentTemplate) return <LoadingSpinner />;
      return (
        <div className="flex h-full bg-gray-200 overflow-hidden">
          {/* Components Panel */}
          <ComponentsPanelV3 
            componentsLibrary={componentsLibrary} 
            onComponentDragStart={() => {}} 
          />
          
          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Toolbar */}
            <ToolbarV3
              onSave={handleSaveWithRefresh}
              onPreview={() => setShowPreview(true)}
              onToggleGrid={operations.toggleGrid}
              onToggleRulers={operations.toggleRulers}
              onZoomIn={() => operations.setZoom(state.canvas.zoom + 0.1)}
              onZoomOut={() => operations.setZoom(state.canvas.zoom - 0.1)}
              onZoomReset={() => operations.setZoom(1)}
              onDelete={() => operations.removeComponents(state.canvas.selectedComponentIds)}
              onPaperFormatChange={canvasActions.handlePaperFormatChange}
              onTitleChange={templateActions.handleTitleChange}
              onOrientationToggle={canvasActions.handleOrientationToggle}
              templateTitle={state.currentTemplate.name}
              hasUnsavedChanges={state.hasUnsavedChanges}
              hasSelection={state.canvas.selectedComponentIds.length > 0}
              gridVisible={state.canvas.showGrid}
              rulersVisible={state.canvas.showRulers}
              zoomLevel={state.canvas.zoom * 100}
              isSaving={state.isSaving}
              paperFormat={paperFormat}
              orientation={orientation}
              availablePaperFormats={availablePaperFormats}
            />
            
            {/* Canvas */}
            <CanvasEditorV3
              template={state.currentTemplate}
              components={state.components}
              canvasState={state.canvas}
              selectedComponentIds={state.canvas.selectedComponentIds}
              onComponentSelect={canvasActions.handleComponentSelect}
              onMultipleComponentSelect={canvasActions.handleMultipleComponentSelect}
              onComponentAdd={canvasActions.handleComponentAdd}
              operations={operations}
              rulerUnit={rulerUnit}
              activeTool={state.canvas.activeTool as 'select' | 'pan' | 'zoom'}
            />
          </div>
          
          {/* Properties Panel */}
          <div className="w-80 bg-white border-l border-gray-300 flex flex-col">
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
              onComponentToggleVisibility={(id: string) => 
                operations.updateComponent(id, { 
                  isVisible: !state.components.find((c: DraggableComponentV3) => c.id === id)?.isVisible 
                })
              }
              onComponentToggleLock={(id: string) => 
                operations.updateComponent(id, { 
                  isLocked: !state.components.find((c: DraggableComponentV3) => c.id === id)?.isLocked 
                })
              }
            />
          </div>
        </div>
      );
      
    default:
      return <div>Paso desconocido</div>;
  }
}; 