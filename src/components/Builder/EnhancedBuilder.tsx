import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { DroppableCanvas } from './DroppableCanvas';
import { DraggableBlock } from './DraggableBlock';
import { AdvancedFieldsPanel } from './AdvancedFieldsPanel';
import { FamilyTemplateManager } from './FamilyTemplateManager';
import { Block } from '../../types/builder';
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
  Palette
} from 'lucide-react';

type BuilderStep = 'family-selection' | 'template-selection' | 'canvas-editor';

export const EnhancedBuilder: React.FC = () => {
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

    // Si es un campo que se está arrastrando al canvas
    if (active.data.current?.type === 'field' && over.id === 'canvas') {
      const field = active.data.current.field as PromotionField;
      
      const newBlock: Block = {
        id: `field-${field.id}-${Date.now()}`,
        type: field.tipo === 'moneda' ? 'price' : 
              field.tipo === 'texto' ? 'header' :
              field.tipo === 'numero' ? 'discount' : 'header',
        position: {
          x: Math.max(0, (event.delta?.x || 0) + 100),
          y: Math.max(0, (event.delta?.y || 0) + 100)
        },
        size: {
          width: field.tipo === 'moneda' ? 150 : 200,
          height: field.tipo === 'moneda' ? 80 : 60
        },
        content: {
          text: field.etiqueta,
          fieldData: field
        }
      };

      setBlocks(prev => [...prev, newBlock]);
      return;
    }

    // Elementos básicos del toolpanel
    if (active.id !== over.id && over.id === 'canvas') {
      const activeType = active.id as string;
      
      const newBlock: Block = {
        id: `${activeType}-${Date.now()}`,
        type: activeType as any,
        position: {
          x: Math.max(0, (event.delta?.x || 0) + 100),
          y: Math.max(0, (event.delta?.y || 0) + 100)
        },
        size: {
          width: 200,
          height: 100
        }
      };

      setBlocks(prev => [...prev, newBlock]);
    }
  }, []);

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
    setBlocks([]);
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
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackToTemplates}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              <span>Volver</span>
            </button>
            <div className="border-l pl-4">
              <div className="font-semibold text-gray-900">
                {selectedFamily} - {selectedTemplate}
              </div>
              <div className="text-sm text-gray-500">
                Nueva Plantilla
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded ${showGrid ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Mostrar/Ocultar Grid"
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Alejar"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-sm text-gray-600 min-w-[4rem] text-center">
              {canvasZoom}%
            </span>
            <button 
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Acercar"
            >
              <ZoomIn size={18} />
            </button>
            <button 
              onClick={handleResetZoom}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Restablecer Zoom"
            >
              <RotateCcw size={18} />
            </button>
            
            <div className="border-l pl-2 ml-2 flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                <Eye size={16} />
                Vista Previa
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                <Save size={16} />
                Guardar
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                <Download size={16} />
                Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Panel de Campos Avanzados */}
          <div className="w-80 bg-white border-r">
            <AdvancedFieldsPanel 
              selectedTemplate={selectedTemplate}
            />
          </div>

          {/* Canvas Principal */}
          <div className="flex-1 relative">
            <DroppableCanvas 
              showGrid={showGrid}
              showRulers={showRulers}
              zoom={canvasZoom}
            >
              {blocks.map((block, index) => (
                <DraggableBlock
                  key={block.id}
                  block={block}
                  index={index}
                  onDelete={handleDeleteBlock}
                  onResize={handleResizeBlock}
                  onImageUpload={handleImageUpload}
                  isDragging={activeId === block.id}
                />
              ))}
            </DroppableCanvas>

            {/* Toolbar Flotante del Canvas */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {blocks.length} elementos
              </span>
              <div className="border-l pl-2 flex gap-1">
                <button 
                  onClick={handleClearCanvas}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Limpiar canvas"
                  disabled={blocks.length === 0}
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                  title="Capas"
                >
                  <Layers size={16} />
                </button>
                <button 
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                  title="Colores"
                >
                  <Palette size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && draggedField && (
          <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-lg">
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
          <DraggableBlock
            block={blocks.find(b => b.id === activeId)!}
            index={0}
            onDelete={() => {}}
            onResize={() => {}}
            onImageUpload={() => {}}
            isDragging={true}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}; 