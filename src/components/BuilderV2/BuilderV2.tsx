// ===============================================
// SPEED BUILDER V2 - MAIN COMPONENT
// ===============================================

import React, { useState, useCallback } from 'react';
import { useBuilderV2 } from '../../hooks/useBuilderV2';
import { FamilySelector } from './components/FamilySelector';
import { CanvasEditor } from './components/CanvasEditor';
import { ElementsPanel } from './components/ElementsPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Header } from '../shared/Header';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { FamilyType, TemplateType, DraggableElementType, ElementPosition } from '../../types/builder-v2';
import { ArrowLeft, Save, Eye, Download, Undo, Redo } from 'lucide-react';
import { toast } from 'react-hot-toast';

type BuilderStep = 'family-selection' | 'template-selection' | 'canvas-editor';

interface BuilderV2Props {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
  userRole?: 'admin' | 'limited';
}

export const BuilderV2: React.FC<BuilderV2Props> = ({
  onBack,
  onLogout,
  userEmail,
  userName,
  userRole = 'admin'
}) => {
  const { state, operations, families, draggableElements } = useBuilderV2();
  const [currentStep, setCurrentStep] = useState<BuilderStep>('family-selection');
  const [showPreview, setShowPreview] = useState(false);



  // =====================
  // NAVEGACIÓN ENTRE PASOS
  // =====================

  const handleFamilySelect = useCallback(async (familyType: FamilyType) => {
    try {
      const family = families.find(f => f.name === familyType);
      if (family) {
        await operations.loadFamily(family.id);
        setCurrentStep('template-selection');
      }
    } catch (error) {
      toast.error('Error al cargar familia');
    }
  }, [families, operations]);

  const handleTemplateSelect = useCallback(async (templateType: TemplateType) => {
    try {
      // Por ahora creamos una plantilla mock basada en el tipo
      const mockTemplateId = `template-${templateType.toLowerCase().replace(/\s+/g, '-')}`;
      await operations.loadTemplate(mockTemplateId);
      setCurrentStep('canvas-editor');
    } catch (error) {
      toast.error('Error al cargar plantilla');
    }
  }, [operations]);

  const handleBackToFamilies = useCallback(() => {
    if (state.hasUnsavedChanges) {
      if (window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres volver?')) {
        setCurrentStep('family-selection');
      }
    } else {
      setCurrentStep('family-selection');
    }
  }, [state.hasUnsavedChanges]);

  const handleBackToTemplates = useCallback(() => {
    if (state.hasUnsavedChanges) {
      if (window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres volver?')) {
        setCurrentStep('template-selection');
      }
    } else {
      setCurrentStep('template-selection');
    }
  }, [state.hasUnsavedChanges]);

  // =====================
  // ACCIONES DE TOOLBAR
  // =====================

  const handleElementAdd = useCallback((type: DraggableElementType, position: ElementPosition) => {
    try {
      const element = operations.createElement(type, position);
      operations.addElement(element);
    } catch (error) {
      toast.error('Error al agregar elemento');
    }
  }, [operations]);

  const handleElementSelect = useCallback((elementId: string | null) => {
    // Para simplificar, solo manejo selección individual
    // Por ahora solo logueamos, ya que no tenemos acceso directo al updateCanvas del hook
    console.log('Element selected:', elementId);
  }, []);

  const handleElementMove = useCallback((elementId: string, position: ElementPosition) => {
    // Usar moveElements que requiere un array de IDs
    const currentElement = state.elements.find(el => el.id === elementId);
    if (currentElement) {
      const deltaX = position.x - currentElement.position.x;
      const deltaY = position.y - currentElement.position.y;
      operations.moveElements([elementId], deltaX, deltaY);
    }
  }, [operations, state.elements]);

  const handleZoomChange = useCallback((zoom: number) => {
    // Por ahora solo logueamos, ya que no tenemos acceso directo al updateCanvas del hook
    console.log('Zoom changed:', zoom);
  }, []);

  const handleGridToggle = useCallback(() => {
    // Por ahora solo logueamos, ya que no tenemos acceso directo al updateCanvas del hook
    console.log('Grid toggled');
  }, []);

  const handleSave = useCallback(async () => {
    if (!state.currentTemplate) return;

    try {
      const templateWithElements = {
        ...state.currentTemplate,
        defaultElements: state.elements,
        updatedAt: new Date()
      };
      
      await operations.saveTemplate(templateWithElements);
    } catch (error) {
      toast.error('Error al guardar plantilla');
    }
  }, [state.currentTemplate, state.elements, operations]);

  const handlePreview = useCallback(async () => {
    try {
      const previewUrl = await operations.generatePreview();
      setShowPreview(true);
      // Aquí podrías abrir un modal con el preview
      toast.success('Preview generado');
    } catch (error) {
      toast.error('Error al generar preview');
    }
  }, [operations]);

  const handleExport = useCallback(async () => {
    try {
      const blob = await operations.exportCanvas(state.exportConfig);
      
      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poster.${state.exportConfig.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error al exportar');
    }
  }, [operations, state.exportConfig]);

  // =====================
  // BREADCRUMB
  // =====================

  const renderBreadcrumb = () => {
    const items = [
      { label: 'Builder V2', onClick: handleBackToFamilies, active: currentStep === 'family-selection' }
    ];

    if (state.currentFamily) {
      items.push({ 
        label: state.currentFamily.displayName, 
        onClick: handleBackToTemplates, 
        active: currentStep === 'template-selection' 
      });
    }

    if (state.currentTemplate) {
      items.push({ 
        label: state.currentTemplate.name, 
        onClick: () => {}, 
        active: currentStep === 'canvas-editor' 
      });
    }

    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span>/</span>}
            <button
              onClick={item.onClick}
              className={`hover:text-gray-700 ${item.active ? 'text-blue-600 font-medium' : ''}`}
            >
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  // =====================
  // RENDER PRINCIPAL
  // =====================

  if (state.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        userName={userName}
        onBack={onBack}
        onLogout={onLogout}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb */}
        <div className="px-6 py-3 bg-white border-b">
          {renderBreadcrumb()}
        </div>

        {/* Paso 1: Selección de Familia */}
        {currentStep === 'family-selection' && (
          <div className="flex-1 overflow-auto">
            <FamilySelector
              families={families}
              onFamilySelect={handleFamilySelect}
              selectedFamily={state.currentFamily?.name}
            />
          </div>
        )}

        {/* Paso 2: Selección de Plantilla */}
        {currentStep === 'template-selection' && state.currentFamily && (
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleBackToFamilies}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Seleccionar Plantilla para {state.currentFamily.displayName}
                </h1>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.currentFamily.compatibleTemplates.map((template) => (
                  <div
                    key={template}
                    onClick={() => handleTemplateSelect(template)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{template}</h3>
                    <p className="text-sm text-gray-600">
                      Plantilla para promociones de {template.toLowerCase()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Editor de Canvas - Completo */}
        {currentStep === 'canvas-editor' && state.currentFamily && state.currentTemplate && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar principal */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToTemplates}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">
                  Editor - {state.currentTemplate.name}
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={operations.undo}
                  disabled={!state.canvas.canUndo}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg"
                  title="Deshacer"
                >
                  <Undo className="w-4 h-4" />
                </button>
                
                <button
                  onClick={operations.redo}
                  disabled={!state.canvas.canRedo}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg"
                  title="Rehacer"
                >
                  <Redo className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-gray-300" />

                <button
                  onClick={handlePreview}
                  disabled={state.isExporting}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>

                <button
                  onClick={handleSave}
                  disabled={state.isSaving || !state.hasUnsavedChanges}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {state.isSaving ? 'Guardando...' : 'Guardar'}
                </button>

                <button
                  onClick={handleExport}
                  disabled={state.isExporting}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {state.isExporting ? 'Exportando...' : 'Exportar'}
                </button>
              </div>
            </div>

            {/* Editor layout con paneles laterales */}
            <div className="flex-1 flex overflow-hidden">
              {/* Panel de elementos (izquierda) */}
              <ElementsPanel
                draggableElements={draggableElements}
                onElementAdd={handleElementAdd}
                recommendedElements={state.currentFamily?.recommendedElements}
              />

              {/* Canvas central */}
              <div className="flex-1 overflow-hidden">
                <CanvasEditor
                  elements={state.elements}
                  selectedElementId={state.canvas.selectedElementIds[0] || null}
                  canvasSize={state.currentTemplate.canvasSize}
                  zoom={state.canvas.zoom}
                  showGrid={state.canvas.showGrid}
                  onElementSelect={handleElementSelect}
                  onElementMove={handleElementMove}
                  onElementResize={operations.resizeElement}
                  onElementUpdate={operations.updateElement}
                  onElementDelete={operations.removeElement}
                  onElementDuplicate={operations.duplicateElement}
                  onZoomChange={handleZoomChange}
                  onGridToggle={handleGridToggle}
                />
              </div>

              {/* Panel de propiedades (derecha) */}
              <PropertiesPanel
                selectedElement={state.elements.find(el => state.canvas.selectedElementIds.includes(el.id)) || null}
                onElementUpdate={operations.updateElement}
                onElementDelete={operations.removeElement}
              />
            </div>
          </div>
        )}
      </div>

      {/* Errores de validación */}
      {state.errors.length > 0 && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          {state.errors.slice(0, 3).map((error, index) => (
            <div
              key={index}
              className={`mb-2 p-3 rounded-lg shadow-lg ${
                error.type === 'error' 
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              }`}
            >
              <p className="text-sm font-medium">{error.message}</p>
            </div>
          ))}
          {state.errors.length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{state.errors.length - 3} errores más
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 