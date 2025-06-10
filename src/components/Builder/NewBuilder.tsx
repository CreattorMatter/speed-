import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { UnifiedCanvas } from './UnifiedCanvas';
import { AdvancedFieldsPanel } from './AdvancedFieldsPanel';
import { FamilyTemplateManager } from './FamilyTemplateManager';
import { Block, BuilderStep, BlockType } from '../../types/builder';
import { PromotionField } from '../../types/fields';
import { 
  ChevronLeft, 
  Save, 
  Eye, 
  Download,
  Grid,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Layers,
  Palette,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

export const NewBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('family-selection');
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedField, setDraggedField] = useState<PromotionField | null>(null);
  
  // Estados del canvas
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  
  // Estados de preview y modo
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const handleFamilySelect = useCallback((familyId: string) => {
    setSelectedFamily(familyId);
    setCurrentStep('template-selection');
  }, []);

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    setCurrentStep('canvas-editor');
  }, []);

  const handleBackToFamilies = useCallback(() => {
    setCurrentStep('family-selection');
    setSelectedFamily('');
    setSelectedTemplate('');
    setBlocks([]);
  }, []);

  const handleBackToTemplates = useCallback(() => {
    setCurrentStep('template-selection');
    setSelectedTemplate('');
    setBlocks([]);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    
    if (event.active.data.current?.type === 'field') {
      setDraggedField(event.active.data.current.field);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedField(null);

    if (!over) return;

    // Campos promocionales
    if (active.data.current?.type === 'field' && over.id === 'canvas') {
      const field = active.data.current.field as PromotionField;
      
      // Calcular posición basada en el mouse
      const canvasRect = document.querySelector('[data-canvas="true"]')?.getBoundingClientRect();
      const dropPosition = {
        x: event.activatorEvent ? 
           Math.max(20, (event.activatorEvent.clientX - (canvasRect?.left || 0)) * (100 / canvasZoom) - 100) : 
           100,
        y: event.activatorEvent ? 
           Math.max(20, (event.activatorEvent.clientY - (canvasRect?.top || 0)) * (100 / canvasZoom) - 50) : 
           100
      };
      
      const newBlock: Block = {
        id: `field-${field.id}-${Date.now()}`,
        type: getBlockTypeFromField(field),
        position: dropPosition,
        size: getBlockSizeFromField(field),
        content: {
          text: field.etiqueta,
          fieldData: field,
          value: field.valor_defecto || ''
        },
        style: {
          backgroundColor: field.color || '#ffffff',
          color: '#000000',
          fontSize: 14,
          textAlign: 'center',
          padding: 8,
          borderRadius: 4,
          border: '1px solid #e2e8f0'
        }
      };

      setBlocks(prev => [...prev, newBlock]);
      return;
    }

    // Elementos básicos del panel de herramientas
    if (typeof active.id === 'string' && over.id === 'canvas') {
      const blockType = active.id as BlockType;
      
      const dropPosition = {
        x: event.activatorEvent ? 
           Math.max(20, (event.activatorEvent.clientX - 200) * (100 / canvasZoom) - 100) : 
           100,
        y: event.activatorEvent ? 
           Math.max(20, (event.activatorEvent.clientY - 100) * (100 / canvasZoom) - 50) : 
           100
      };
      
      const newBlock: Block = {
        id: `${blockType}-${Date.now()}`,
        type: blockType,
        position: dropPosition,
        size: getDefaultBlockSize(blockType),
        content: {
          text: getDefaultBlockText(blockType)
        },
        style: {
          backgroundColor: '#ffffff',
          color: '#000000',
          fontSize: 14,
          textAlign: 'center',
          padding: 8,
          borderRadius: 4,
          border: '1px solid #e2e8f0'
        }
      };

      setBlocks(prev => [...prev, newBlock]);
    }
  }, [canvasZoom]);

  const getBlockTypeFromField = (field: PromotionField): BlockType => {
    switch (field.tipo) {
      case 'moneda': return 'price';
      case 'numero': return 'discount';
      case 'texto': return field.grupo === 'Producto' ? 'sku' : 'text';
      case 'info': return 'image';
      default: return 'text';
    }
  };

  const getBlockSizeFromField = (field: PromotionField) => {
    switch (field.tipo) {
      case 'moneda': return { width: 150, height: 80 };
      case 'numero': return { width: 120, height: 60 };
      case 'info': return { width: 200, height: 150 };
      default: return { width: 180, height: 50 };
    }
  };

  const getDefaultBlockSize = (type: BlockType) => {
    switch (type) {
      case 'header': return { width: 300, height: 80 };
      case 'footer': return { width: 300, height: 60 };
      case 'price': return { width: 150, height: 80 };
      case 'discount': return { width: 120, height: 60 };
      case 'image': return { width: 200, height: 150 };
      case 'logo': return { width: 100, height: 80 };
      default: return { width: 200, height: 60 };
    }
  };

  const getDefaultBlockText = (type: BlockType): string => {
    switch (type) {
      case 'header': return 'HEADER';
      case 'footer': return 'Footer';
      case 'price': return '$999.99';
      case 'discount': return '-50%';
      case 'sku': return 'SKU123456';
      case 'promotion': return '🎁 Promoción';
      case 'logo': return 'LOGO';
      default: return 'Texto';
    }
  };

  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  }, []);

  const handleResizeBlock = useCallback((id: string, size: { width: number; height: number }) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, size } : block
    ));
  }, []);

  const handleImageUpload = useCallback((index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBlocks(prev => prev.map((block, i) => 
        i === index 
          ? { 
              ...block, 
              content: { 
                ...block.content, 
                imageUrl: e.target?.result as string 
              } 
            } 
          : block
      ));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClearCanvas = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres limpiar el canvas?')) {
      setBlocks([]);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setCanvasZoom(prev => Math.min(200, prev + 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCanvasZoom(prev => Math.max(25, prev - 10));
  }, []);

  const handleResetZoom = useCallback(() => {
    setCanvasZoom(100);
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Implementar guardado
    console.log('Guardando template...', { selectedFamily, selectedTemplate, blocks });
    alert('Template guardado (funcionalidad pendiente)');
  }, [selectedFamily, selectedTemplate, blocks]);

  const handleExport = useCallback(() => {
    // TODO: Implementar exportación
    console.log('Exportando template...', { selectedFamily, selectedTemplate, blocks });
    alert('Exportando template (funcionalidad pendiente)');
  }, [selectedFamily, selectedTemplate, blocks]);

  // Renderizado según el paso actual
  if (currentStep === 'family-selection') {
    return (
      <div className="h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ChevronLeft size={20} />
                <span>Constructor de Promociones</span>
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Bienvenido, Admin
            </div>
          </div>
        </div>

        <FamilyTemplateManager 
          onFamilySelect={handleFamilySelect}
          onTemplateSelect={handleTemplateSelect}
        />
      </div>
    );
  }

  if (currentStep === 'template-selection') {
    return (
      <div className="h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBackToFamilies}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft size={20} />
                <span>Volver a Familias</span>
              </button>
              <div className="text-lg font-semibold text-gray-900">
                {selectedFamily} - Seleccionar Plantilla
              </div>
            </div>
          </div>
        </div>

        <FamilyTemplateManager 
          selectedFamily={selectedFamily}
          onFamilySelect={handleFamilySelect}
          onTemplateSelect={handleTemplateSelect}
        />
      </div>
    );
  }

  // Canvas Editor
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen bg-gray-100 flex flex-col">
        
        {/* Toolbar Principal */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackToTemplates}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Volver</span>
            </button>
            <div className="border-l pl-4">
              <div className="font-semibold text-gray-900">
                {selectedFamily} - {selectedTemplate}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                Nueva Plantilla
                {autoSave && (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Auto-guardado
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Controles de Canvas */}
            <div className="flex items-center gap-1 border-r pr-3 mr-3">
              <button 
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded transition-colors ${showGrid ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Mostrar/Ocultar Grid"
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Alejar"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-sm text-gray-600 min-w-[4rem] text-center font-mono">
                {canvasZoom}%
              </span>
              <button 
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Acercar"
              >
                <ZoomIn size={18} />
              </button>
              <button 
                onClick={handleResetZoom}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Restablecer Zoom"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {/* Modo Preview */}
            <button 
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                isPreviewMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {isPreviewMode ? <Pause size={16} /> : <Play size={16} />}
              {isPreviewMode ? 'Editar' : 'Preview'}
            </button>
            
            {/* Acciones principales */}
            <div className="flex gap-2">
              <button 
                onClick={() => setAutoSave(!autoSave)}
                className={`p-2 rounded transition-colors ${
                  autoSave ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={autoSave ? 'Desactivar auto-guardado' : 'Activar auto-guardado'}
              >
                <RefreshCw size={16} />
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Save size={16} />
                Guardar
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <Download size={16} />
                Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Panel de Campos Avanzados */}
          {!isPreviewMode && (
            <div className="w-80 bg-white border-r shadow-sm">
              <AdvancedFieldsPanel 
                selectedTemplate={selectedTemplate}
              />
            </div>
          )}

          {/* Canvas Principal */}
          <div className="flex-1 relative" data-canvas="true">
            <UnifiedCanvas 
              blocks={blocks}
              onDeleteBlock={handleDeleteBlock}
              onResizeBlock={handleResizeBlock}
              onImageUpload={handleImageUpload}
              showGrid={showGrid && !isPreviewMode}
              showRulers={showRulers && !isPreviewMode}
              zoom={canvasZoom}
            />

            {/* Toolbar Flotante del Canvas */}
            {!isPreviewMode && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">
                  {blocks.length} {blocks.length === 1 ? 'elemento' : 'elementos'}
                </span>
                <div className="border-l pl-3 flex gap-1">
                  <button 
                    onClick={handleClearCanvas}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Limpiar canvas"
                    disabled={blocks.length === 0}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    title="Gestionar capas"
                  >
                    <Layers size={16} />
                  </button>
                  <button 
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    title="Paleta de colores"
                  >
                    <Palette size={16} />
                  </button>
                  <button 
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    title="Configuración"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && draggedField && (
          <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-lg">{draggedField.icono}</span>
              <div>
                <div className="font-medium text-sm">{draggedField.etiqueta}</div>
                <div className="text-xs text-gray-500">{draggedField.tipo}</div>
              </div>
            </div>
          </div>
        )}
        {activeId && !draggedField && blocks.find(b => b.id === activeId) && (
          <div className="opacity-75">
            <div className="bg-white border-2 border-blue-500 rounded p-2 shadow-xl">
              Moviendo elemento...
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}; 