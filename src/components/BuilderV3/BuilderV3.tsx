// =====================================
// SPEED BUILDER V3 - MAIN COMPONENT
// =====================================

import React, { useState, useCallback, useEffect } from 'react';
import { useBuilderV3Integration } from '../../hooks/useBuilderV3Integration';
import { FamilySelectorV3 } from './components/FamilySelectorV3';
import { TemplateLibraryV3 } from './components/TemplateLibraryV3';
import { CanvasEditorV3 } from './components/CanvasEditorV3';
import { ComponentsPanelV3 } from './components/ComponentsPanelV3';
import { PropertiesPanelV3 } from './components/PropertiesPanelV3';
import { LayersPanelV3 } from './components/LayersPanelV3';
import { PreviewPanelV3 } from './components/PreviewPanelV3';
import { ToolbarV3 } from './components/ToolbarV3';
import { StatusBarV3 } from './components/StatusBarV3';
import { Header } from '../shared/Header';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { FamilyTypeV3, ComponentTypeV3, PositionV3 } from '../../types/builder-v3';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Download, 
  Undo, 
  Redo,
  Settings,
  Layout,
  Layers,
  Image,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  const { state, operations, families, templates, componentsLibrary, isReady, connectionStatus } = useBuilderV3Integration();
  const [currentStep, setCurrentStep] = useState<BuilderStepV3>('family-selection');
  const [showPreview, setShowPreview] = useState(false);

  // =====================
  // EFECTOS DE INICIALIZACIÓN
  // =====================

  useEffect(() => {
    // Auto-guardar cada cierto tiempo si está habilitado
    if (state.userPreferences.autoSave && state.hasUnsavedChanges) {
      const interval = setInterval(() => {
        operations.saveTemplate().catch((err: any) => 
          console.error('Error en auto-guardado:', err)
        );
      }, state.userPreferences.autoSaveInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [state.userPreferences.autoSave, state.hasUnsavedChanges, operations]);

  // =====================
  // NAVEGACIÓN ENTRE PASOS
  // =====================

  const handleFamilySelect = useCallback(async (familyType: FamilyTypeV3) => {
    try {
      const family = families.find(f => f.name === familyType);
      if (!family) {
        toast.error(`Familia "${familyType}" no encontrada`);
        console.error('Family not found:', familyType, 'Available families:', families.map(f => ({ id: f.id, name: f.name })));
        return;
      }
      
      console.log('Loading family:', { id: family.id, name: family.name, displayName: family.displayName });
      await operations.loadFamily(family.id);
      setCurrentStep('template-library');
      toast.success(`Familia "${family.displayName}" cargada`);
    } catch (error) {
      toast.error('Error al cargar familia');
      console.error('Error loading family:', error);
    }
  }, [families, operations]);

  const handleTemplateSelect = useCallback(async (templateId: string) => {
    try {
      await operations.loadTemplate(templateId);
      setCurrentStep('canvas-editor');
      toast.success('Plantilla cargada correctamente');
    } catch (error) {
      toast.error('Error al cargar plantilla');
      console.error('Error loading template:', error);
    }
  }, [operations]);

  // =====================
  // TOOLBAR FUNCTIONS
  // =====================

  const handleSave = useCallback(async () => {
    try {
      await operations.saveTemplate();
      toast.success('Plantilla guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar plantilla');
      console.error('Error saving template:', error);
    }
  }, [operations]);





  const handleUndo = useCallback(() => {
    try {
      operations.undo();
      toast.success('Acción deshecha');
    } catch (error) {
      toast.error('No hay acciones para deshacer');
    }
  }, [operations]);

  const handleRedo = useCallback(() => {
    try {
      operations.redo();
      toast.success('Acción rehecha');
    } catch (error) {
      toast.error('No hay acciones para rehacer');
    }
  }, [operations]);

  const handleCopy = useCallback(() => {
    if (state.canvas.selectedComponentIds.length > 0) {
      try {
        operations.copyComponents(state.canvas.selectedComponentIds);
        toast.success(`${state.canvas.selectedComponentIds.length} elemento(s) copiado(s)`);
      } catch (error) {
        toast.error('Error al copiar elementos');
      }
    } else {
      toast.error('Selecciona elementos para copiar');
    }
  }, [operations, state.canvas.selectedComponentIds]);

  const handlePaste = useCallback(() => {
    try {
      operations.pasteComponents();
      toast.success('Elementos pegados');
    } catch (error) {
      toast.error('No hay elementos para pegar');
    }
  }, [operations]);

  const handleDelete = useCallback(() => {
    if (state.canvas.selectedComponentIds.length > 0) {
      try {
        operations.removeComponents(state.canvas.selectedComponentIds);
        toast.success(`${state.canvas.selectedComponentIds.length} elemento(s) eliminado(s)`);
      } catch (error) {
        toast.error('Error al eliminar elementos');
      }
    } else {
      toast.error('Selecciona elementos para eliminar');
    }
  }, [operations, state.canvas.selectedComponentIds]);

  const handleAlignLeft = useCallback(() => {
    if (state.canvas.selectedComponentIds.length > 1) {
      try {
        operations.alignComponents(state.canvas.selectedComponentIds, 'left');
        toast.success('Elementos alineados a la izquierda');
      } catch (error) {
        toast.error('Error al alinear elementos');
      }
    } else {
      toast.error('Selecciona al menos 2 elementos para alinear');
    }
  }, [operations, state.canvas.selectedComponentIds]);

  const handleAlignCenter = useCallback(() => {
    if (state.canvas.selectedComponentIds.length > 1) {
      try {
        operations.alignComponents(state.canvas.selectedComponentIds, 'center');
        toast.success('Elementos alineados al centro');
      } catch (error) {
        toast.error('Error al alinear elementos');
      }
    } else {
      toast.error('Selecciona al menos 2 elementos para alinear');
    }
  }, [operations, state.canvas.selectedComponentIds]);

  const handleAlignRight = useCallback(() => {
    if (state.canvas.selectedComponentIds.length > 1) {
      try {
        operations.alignComponents(state.canvas.selectedComponentIds, 'right');
        toast.success('Elementos alineados a la derecha');
      } catch (error) {
        toast.error('Error al alinear elementos');
      }
    } else {
      toast.error('Selecciona al menos 2 elementos para alinear');
    }
  }, [operations, state.canvas.selectedComponentIds]);

  const handleZoomIn = useCallback(() => {
    operations.setZoom(Math.min(state.canvas.maxZoom, state.canvas.zoom + 0.1));
  }, [operations, state.canvas.zoom, state.canvas.maxZoom]);

  const handleZoomOut = useCallback(() => {
    operations.setZoom(Math.max(state.canvas.minZoom, state.canvas.zoom - 0.1));
  }, [operations, state.canvas.zoom, state.canvas.minZoom]);

  const handleZoomReset = useCallback(() => {
    operations.setZoom(1);
  }, [operations]);

  const handleToggleGrid = useCallback(() => {
    operations.toggleGrid();
    toast.success(`Grilla ${state.canvas.showGrid ? 'ocultada' : 'mostrada'}`);
  }, [operations, state.canvas.showGrid]);

  const handleToggleRulers = useCallback(() => {
    operations.toggleRulers();
    toast.success(`Reglas ${state.canvas.showRulers ? 'ocultadas' : 'mostradas'}`);
  }, [operations, state.canvas.showRulers]);



  const handleCreateNewTemplate = useCallback(async () => {
    try {
      if (!state.currentFamily) {
        toast.error('Selecciona una familia primero');
        return;
      }

      const newTemplate = await operations.createTemplate({
        name: 'Nueva Plantilla',
        familyType: state.currentFamily.name,
        description: 'Plantilla creada desde el Builder v3',
        thumbnail: '',
        tags: [],
        category: 'custom',
        canvas: {
          width: 1080,
          height: 1350,
          unit: 'px',
          dpi: 300,
          backgroundColor: '#ffffff'
        },
        defaultComponents: [],
        familyConfig: state.currentFamily.defaultStyle,
        validationRules: [],
        exportSettings: {
          defaultFormat: 'png',
          defaultQuality: 90,
          defaultDPI: 300,
          bleedArea: 0,
          cropMarks: false
        },
        isPublic: false,
        isActive: true,
        version: 1,
        createdBy: userEmail
      });

      await operations.loadTemplate(newTemplate.id);
      setCurrentStep('canvas-editor');
      toast.success('Nueva plantilla creada');
    } catch (error) {
      toast.error('Error al crear plantilla');
      console.error('Error creating template:', error);
    }
  }, [state.currentFamily, operations, userEmail]);

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
        setCurrentStep('template-library');
      }
    } else {
      setCurrentStep('template-library');
    }
  }, [state.hasUnsavedChanges]);

  // =====================
  // OPERACIONES DEL CANVAS
  // =====================

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | any>('all');
  const [favorites, setFavorites] = useState<ComponentTypeV3[]>([]);

  const handleComponentAdd = useCallback((type: ComponentTypeV3, position: PositionV3) => {
    try {
      const component = operations.createComponent(type, position);
      operations.addComponent(component);
      toast.success('Componente agregado');
    } catch (error) {
      toast.error('Error al agregar componente');
      console.error('Error adding component:', error);
    }
  }, [operations]);

  const handleComponentSelect = useCallback((componentId: string | null) => {
    if (componentId) {
      operations.selectComponent(componentId);
    } else {
      operations.clearSelection();
    }
  }, [operations]);

  const handleMultipleComponentSelect = useCallback((componentIds: string[]) => {
    operations.selectComponents(componentIds);
  }, [operations]);

  const handleComponentDragStart = useCallback((componentType: ComponentTypeV3) => {
    // Handler for drag start from component panel
    console.log('Dragging component:', componentType);
  }, []);

  const handleToggleFavorite = useCallback((componentType: ComponentTypeV3) => {
    setFavorites(prev => {
      if (prev.includes(componentType)) {
        return prev.filter(t => t !== componentType);
      } else {
        return [...prev, componentType];
      }
    });
  }, []);

  // =====================
  // ACCIONES DE TOOLBAR
  // =====================

  const handlePreview = useCallback(async () => {
    try {
      const previewUrl = await operations.generatePreview();
      setShowPreview(true);
      // Aquí podrías abrir un modal con el preview
      toast.success('Preview generado');
    } catch (error) {
      toast.error('Error al generar preview');
      console.error('Error generating preview:', error);
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
      
      toast.success('Cartel exportado correctamente');
    } catch (error) {
      toast.error('Error al exportar');
      console.error('Error exporting:', error);
    }
  }, [operations, state.exportConfig]);



  // =====================
  // MIGRACIÓN DE FAMILIAS
  // =====================

  const handleFamilyMigration = useCallback(async (
    fromFamilyId: string, 
    toFamilyId: string,
    options: {
      migrateAllTemplates: boolean;
      replaceHeaders: boolean;
      replaceColors: boolean;
      templateIds?: string[];
    }
  ) => {
    try {
      await operations.migrateFamily(fromFamilyId, toFamilyId, options);
      toast.success('Migración de familia completada');
    } catch (error) {
      toast.error('Error en la migración de familia');
      console.error('Error migrating family:', error);
    }
  }, [operations]);

  // =====================
  // CONEXIONES EXTERNAS
  // =====================

  const handleSAPConnection = useCallback(async () => {
    try {
      const success = await operations.connectToSAP({
        baseUrl: process.env.REACT_APP_SAP_URL || '',
        token: process.env.REACT_APP_SAP_TOKEN || ''
      });
      
      if (success) {
        toast.success('Conectado a SAP correctamente');
        await operations.syncWithSAP();
      } else {
        toast.error('Error al conectar con SAP');
      }
    } catch (error) {
      toast.error('Error en conexión SAP');
      console.error('SAP connection error:', error);
    }
  }, [operations]);

  const handlePromotionConnection = useCallback(async () => {
    try {
      const success = await operations.connectToPromotions({
        baseUrl: process.env.REACT_APP_PROMOTIONS_URL || '',
        token: process.env.REACT_APP_PROMOTIONS_TOKEN || ''
      });
      
      if (success) {
        toast.success('Conectado al sistema de promociones');
        await operations.syncWithPromotions();
      } else {
        toast.error('Error al conectar con promociones');
      }
    } catch (error) {
      toast.error('Error en conexión de promociones');
      console.error('Promotions connection error:', error);
    }
  }, [operations]);

  // =====================
  // BREADCRUMB
  // =====================

  const renderBreadcrumb = () => {
    const items = [
      { 
        label: 'Builder V3', 
        onClick: handleBackToFamilies, 
        active: currentStep === 'family-selection',
        icon: <Zap className="w-4 h-4" />
      }
    ];

    if (state.currentFamily) {
      items.push({ 
        label: state.currentFamily.displayName, 
        onClick: handleBackToTemplates, 
        active: currentStep === 'template-library',
        icon: <Layout className="w-4 h-4" />
      });
    }

    if (state.currentTemplate) {
      items.push({ 
        label: state.currentTemplate.name, 
        onClick: () => {}, 
        active: currentStep === 'canvas-editor',
        icon: <Image className="w-4 h-4" />
      });
    }

    return (
      <nav className="flex items-center justify-between text-sm text-gray-600 mb-6 bg-white px-4 py-3 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-2">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={item.onClick}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${
                  item.active 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
        
        {/* Indicador de conexión a Supabase */}
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${
            connectionStatus.isConnected ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-xs text-gray-500">
            {connectionStatus.isConnected ? 'Supabase Online' : 'Modo Offline'}
          </span>
          {connectionStatus.error && (
            <span className="text-xs text-red-500" title={connectionStatus.error}>
              ⚠️
            </span>
          )}
        </div>
      </nav>
    );
  };

  // =====================
  // RENDERIZADO PRINCIPAL
  // =====================

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-lg text-gray-600">Cargando Builder V3...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userEmail={userEmail}
        userName={userName}
        onLogout={onLogout}
        title="Speed Builder V3"
        subtitle="Constructor avanzado de carteles promocionales"
      />

      <div className="container mx-auto px-4 py-6">
        {renderBreadcrumb()}

        {/* ===== SELECCIÓN DE FAMILIA ===== */}
        {currentStep === 'family-selection' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Bienvenido al Builder V3! 🚀
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Crea carteles promocionales increíbles con nuestro constructor avanzado. 
                Selecciona una familia promocional para comenzar.
              </p>
            </div>

            <FamilySelectorV3
              families={families}
              onFamilySelect={handleFamilySelect}
              onFamilyMigration={handleFamilyMigration}
              userRole={userRole}
            />
          </div>
        )}

        {/* ===== BIBLIOTECA DE PLANTILLAS ===== */}
        {currentStep === 'template-library' && state.currentFamily && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Plantillas de {state.currentFamily.displayName}
                </h1>
                <p className="text-gray-600 mt-1">
                  Selecciona una plantilla existente o crea una nueva desde cero
                </p>
              </div>
              <button
                onClick={handleCreateNewTemplate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>Nueva Plantilla</span>
              </button>
            </div>

            <TemplateLibraryV3
              family={state.currentFamily}
              templates={templates.filter(t => t.familyType === state.currentFamily?.name)}
              onTemplateSelect={handleTemplateSelect}
              onTemplateCreate={handleCreateNewTemplate}
              userRole={userRole}
            />
          </div>
        )}

        {/* ===== EDITOR DE CANVAS ===== */}
        {currentStep === 'canvas-editor' && state.currentTemplate && (
          <div className="space-y-4">
            {/* Toolbar superior */}
            <ToolbarV3
              onSave={handleSave}
              onPreview={handlePreview}
              onExport={handleExport}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onConnectSAP={handleSAPConnection}
              onConnectPromotions={handlePromotionConnection}
              onToggleGrid={handleToggleGrid}
              onToggleRulers={handleToggleRulers}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomReset={handleZoomReset}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onAlignLeft={handleAlignLeft}
              onAlignCenter={handleAlignCenter}
              onAlignRight={handleAlignRight}
              onAlignJustify={handleAlignCenter}
              canUndo={state.canvas.canUndo}
              canRedo={state.canvas.canRedo}
              hasSelection={state.canvas.selectedComponentIds.length > 0}
              gridVisible={state.canvas.showGrid}
              rulersVisible={state.canvas.showRulers}
              zoomLevel={Math.round(state.canvas.zoom * 100)}
              isSaving={state.isSaving}
              isConnectedSAP={state.sapConnection.isConnected}
              isConnectedPromotions={state.promotionConnection.isConnected}
            />

            {/* Layout principal del editor */}
            <div className="flex gap-4 h-[calc(100vh-200px)]">
              {/* Panel izquierdo */}
              {state.ui.leftPanelOpen && (
                <div className="w-80 bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="border-b border-gray-200">
                    <nav className="flex">
                      {[
                        { id: 'components', label: 'Componentes', icon: Layout },
                        { id: 'layers', label: 'Capas', icon: Layers },
                        { id: 'assets', label: 'Assets', icon: Image }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            state.ui.activeLeftTab === tab.id
                              ? 'border-blue-500 text-blue-600 bg-blue-50'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <tab.icon className="w-4 h-4 mx-auto mb-1" />
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="h-full overflow-y-auto">
                    {state.ui.activeLeftTab === 'components' && (
                      <ComponentsPanelV3
                        componentsLibrary={componentsLibrary}
                        onComponentDragStart={handleComponentDragStart}
                      />
                    )}
                    {state.ui.activeLeftTab === 'layers' && (
                      <LayersPanelV3
                        components={state.components}
                        selectedComponentIds={state.canvas.selectedComponentIds}
                        onComponentSelect={handleComponentSelect}
                        onComponentMultiSelect={handleMultipleComponentSelect}
                        operations={operations}
                      />
                    )}
                    {state.ui.activeLeftTab === 'assets' && (
                      <div className="p-4">
                        <p className="text-gray-500 text-center">Assets panel - En desarrollo</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Canvas central */}
              <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
                <CanvasEditorV3
                  template={state.currentTemplate}
                  components={state.components}
                  canvasState={state.canvas}
                  selectedComponentIds={state.canvas.selectedComponentIds}
                  onComponentSelect={handleComponentSelect}
                  onMultipleComponentSelect={handleMultipleComponentSelect}
                  onComponentAdd={handleComponentAdd}
                  operations={operations}
                />
              </div>

              {/* Panel derecho con 4 pestañas */}
              {state.ui.rightPanelOpen && (
                <div className="w-80 bg-white rounded-lg shadow-sm border overflow-hidden">
                  <PropertiesPanelV3
                    state={state}
                    activeTab={state.ui.activeRightTab || 'properties'}
                    onTabChange={(tab) => {
                      // Actualizar estado del tab activo
                      operations.updateUIState({
                        activeRightTab: tab
                      });
                    }}
                    onComponentUpdate={operations.updateComponent}
                    onComponentDelete={operations.removeComponent}
                    onComponentDuplicate={operations.duplicateComponent}
                    onComponentToggleVisibility={(id) => operations.updateComponent(id, { isVisible: !state.components.find(c => c.id === id)?.isVisible })}
                    onComponentToggleLock={(id) => operations.updateComponent(id, { isLocked: !state.components.find(c => c.id === id)?.isLocked })}
                  />
                </div>
              )}
            </div>

            {/* Panel inferior (preview/export) */}
            {state.ui.bottomPanelOpen && (
              <div className="bg-white rounded-lg shadow-sm border">
                <PreviewPanelV3
                  template={state.currentTemplate}
                  components={state.components}
                  exportConfig={state.exportConfig}
                  onExport={handleExport}
                  operations={operations}
                />
              </div>
            )}

            {/* Barra de estado */}
            <StatusBarV3
              zoom={state.canvas.zoom}
              selectedCount={state.canvas.selectedComponentIds.length}
              totalComponents={state.components.length}
              canvasSize={state.currentTemplate.canvas}
              errors={state.errors}
              sapConnected={state.sapConnection.isConnected}
              promotionConnected={state.promotionConnection.isConnected}
              hasUnsavedChanges={state.hasUnsavedChanges}
            />
          </div>
        )}
      </div>
    </div>
  );
}; 