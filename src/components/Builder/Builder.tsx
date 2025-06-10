import React, { useRef, useCallback, memo, useState } from 'react';
import { useBuilderState } from './hooks/useBuilderState';
import { useBuilderOperations } from './hooks/useBuilderOperations';
import { useBuilderAuth } from './hooks/useBuilderAuth';
import { AdvancedSidebar } from './AdvancedSidebar';
import Canvas from './Canvas';
import Preview from './Preview';
import { SaveTemplateModal } from './SaveTemplateModal';
import { SearchTemplateModal } from './SearchTemplateModal';
import { ExportModal } from './ExportModal';
import { AIGeneratingModal } from './AIGeneratingModal';
import { toast } from 'react-hot-toast';
import ErrorBoundary from './ErrorBoundary';
import { BlockSize, BlockPosition } from './types/block';
import { Save, Search, Download, Eye, Wand2 } from 'lucide-react';
import FamilyManager from './FamilyManager';
import { useFamilyManager } from '../../hooks/useFamilyManager';
import { Header } from '../shared/Header';

interface BuilderProps {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
  userRole?: 'admin' | 'limited';
}

const Builder = memo(({ onBack, onLogout, userEmail, userName, userRole = 'admin' }: BuilderProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const {
    blocks,
    setBlocks,
    showPreview,
    setShowPreview,
    isSaveModalOpen,
    setIsSaveModalOpen,
    isSearchModalOpen,
    setIsSearchModalOpen,
    previewImage,
    setPreviewImage,
    isSaving,
    setIsSaving,
    savingStep,
    setSavingStep,
    isGeneratingAI,
    setIsGeneratingAI,
    session,
    templateName,
    setTemplateName,
    templateDescription,
    setTemplateDescription,
    isPublic,
    setIsPublic,
    selectedFormat,
    setSelectedFormat,
    isLandscape,
    setIsLandscape,
    scale,
    setScale,
    canvasSettings,
    isExportModalOpen,
    setIsExportModalOpen,
    updateBlocks
  } = useBuilderState();

  const { getCurrentUser } = useBuilderAuth();

  const {
    handleAddBlock,
    handleDropInContainer,
    handleSelectTemplate,
    getCanvasImage,
    handleSaveTemplate
  } = useBuilderOperations(blocks, setBlocks, canvasRef);

  const handleSaveClick = useCallback(async () => {
    try {
      setIsSaveModalOpen(true);
    } catch (error) {
      console.error('Error al abrir el modal de guardado:', error);
      toast.error('Error al abrir el modal de guardado');
    }
  }, [setIsSaveModalOpen]);

  const handleSearchClick = useCallback(() => {
    setIsSearchModalOpen(true);
  }, [setIsSearchModalOpen]);

  const handleExportClick = useCallback(() => {
    setIsExportModalOpen(true);
  }, [setIsExportModalOpen]);

  const handleGenerateAI = useCallback(async () => {
    try {
      setIsGeneratingAI(true);
      // Lógica de generación con IA
      toast.success('Plantilla generada con IA');
    } catch (error) {
      console.error('Error al generar con IA:', error);
      toast.error('Error al generar con IA');
    } finally {
      setIsGeneratingAI(false);
    }
  }, [setIsGeneratingAI]);

  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
  }, [setShowPreview]);

  const handleCloseSaveModal = useCallback(() => {
    setIsSaveModalOpen(false);
  }, [setIsSaveModalOpen]);

  const handleCloseSearchModal = useCallback(() => {
    setIsSearchModalOpen(false);
  }, [setIsSearchModalOpen]);

  const handleCloseExportModal = useCallback(() => {
    setIsExportModalOpen(false);
  }, [setIsExportModalOpen]);

  const handleCloseAIModal = useCallback(() => {
    setIsGeneratingAI(false);
  }, [setIsGeneratingAI]);

  // FUNCIONES ARREGLADAS PARA EL CANVAS
  const handleDeleteBlock = useCallback((index: number) => {
    updateBlocks(prev => {
      const newBlocks = [...prev];
      newBlocks.splice(index, 1);
      return newBlocks;
    });
  }, [updateBlocks]);

  const handleResizeBlock = useCallback((index: number, size: BlockSize) => {
    updateBlocks(prev => {
      const newBlocks = [...prev];
      if (newBlocks[index]) {
        newBlocks[index] = { ...newBlocks[index], size };
      }
      return newBlocks;
    });
  }, [updateBlocks]);

  const handleMoveBlock = useCallback((index: number, position: BlockPosition) => {
    updateBlocks(prev => {
      const newBlocks = [...prev];
      if (newBlocks[index]) {
        newBlocks[index] = { ...newBlocks[index], position };
      }
      return newBlocks;
    });
  }, [updateBlocks]);

  const handleImageUpload = useCallback((index: number, imageUrl: string) => {
    updateBlocks(prev => {
      const newBlocks = [...prev];
      if (newBlocks[index] && newBlocks[index].content) {
        newBlocks[index] = { 
          ...newBlocks[index], 
          content: { ...newBlocks[index].content, imageUrl }
        };
      }
      return newBlocks;
    });
  }, [updateBlocks]);

  const handleAddBlockToCanvas = useCallback((blockType: string, position: { x: number; y: number }) => {
    // Mapeo de contenido realista para cada tipo de elemento
    const elementContent: Record<string, any> = {
      // Elementos Básicos
      'header': { text: 'SÚPER OFERTA', fontSize: 32, fontWeight: 'bold', color: '#2563eb' },
      'footer': { text: 'Válido hasta agotar stock. No acumulable con otras promociones.', fontSize: 10, color: '#6b7280' },
      'image': { placeholder: 'Arrastra imagen del producto aquí' },
      'logo': { placeholder: 'Sube logo de marca aquí' },
      'text': { text: 'Texto personalizado', fontSize: 16, color: '#000000' },

      // Precios y Finanzas
      'price-final': { text: '$49.990', fontSize: 36, fontWeight: 'bold', color: '#dc2626' },
      'price-before': { text: '$89.990', fontSize: 18, textDecoration: 'line-through', color: '#6b7280' },
      'installments': { text: '12 CUOTAS SIN INTERÉS\nde $4.166', fontSize: 14, color: '#059669' },
      'discount': { text: '45% OFF', fontSize: 24, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#dc2626' },
      'savings': { text: 'AHORRAS $40.000', fontSize: 16, fontWeight: 'bold', color: '#059669' },

      // Información Producto
      'sku': { text: 'COD: EZ-HDW-2024-001', fontSize: 10, fontFamily: 'monospace', color: '#6b7280' },
      'product-name': { text: 'Taladro Percutor Dewalt 850W', fontSize: 18, fontWeight: 'semibold', color: '#1f2937' },
      'brand': { text: 'DEWALT', fontSize: 14, fontWeight: 'bold', color: '#fbbf24' },
      'category': { text: 'Herramientas Eléctricas', fontSize: 12, color: '#6366f1' },
      'stock': { text: '¡Solo quedan 3 unidades!', fontSize: 12, fontWeight: 'bold', color: '#dc2626' },

      // Promociones y Ofertas
      'promotion': { text: '2X1 EN TODA\nLA LÍNEA', fontSize: 20, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#dc2626' },
      'badge': { text: 'NUEVO', fontSize: 12, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#059669' },
      'gift': { text: 'REGALO:\nSet de brocas', fontSize: 14, fontWeight: 'semibold', color: '#7c3aed' },
      'combo': { text: 'KIT COMPLETO\n+ Maletín', fontSize: 14, fontWeight: 'bold', color: '#ea580c' },

      // Tiempo y Vigencia
      'validity': { text: 'Válido del 15 al 30 de Diciembre', fontSize: 12, color: '#dc2626' },
      'countdown': { text: '⏰ ¡Solo por 48 horas!', fontSize: 14, fontWeight: 'bold', color: '#dc2626' },
      'period': { text: 'Lunes a Viernes\n9:00 a 18:00 hs', fontSize: 12, color: '#6b7280' },

      // Ubicación y Contacto
      'store': { text: 'Easy Maipú\nAv. Maipú 1234', fontSize: 12, color: '#4338ca' },
      'contact': { text: '📞 0810-EASY-123\n💬 WhatsApp disponible', fontSize: 10, color: '#6b7280' },
      'schedule': { text: 'Lun a Dom: 8:00 a 22:00\nFeriados: 10:00 a 20:00', fontSize: 10, color: '#6b7280' },

      // Exclusivos Easy
      'club-easy': { text: 'PRECIO CLUB EASY\n$44.990', fontSize: 16, fontWeight: 'bold', color: '#dc2626' },
      'cencopay': { text: '15% EXTRA\ncon Cencopay', fontSize: 14, fontWeight: 'bold', color: '#059669' },
      'easy-points': { text: 'Acumulas 2.500 puntos\nCanjea por $500', fontSize: 12, color: '#7c3aed' },

      // Nuevo elemento 'title'
      'title': { text: 'SÚPER OFERTA', fontSize: 32, fontWeight: 'bold', color: '#2563eb' }
    };

    // Mapeo de tamaños por defecto según el tipo de elemento
    const elementSizes: Record<string, { width: number; height: number }> = {
      'header': { width: 400, height: 80 },
      'footer': { width: 600, height: 40 },
      'logo': { width: 120, height: 60 },
      'image': { width: 300, height: 200 },
      'price-final': { width: 180, height: 80 },
      'price-before': { width: 120, height: 40 },
      'installments': { width: 200, height: 60 },
      'discount': { width: 120, height: 60 },
      'savings': { width: 200, height: 50 },
      'sku': { width: 180, height: 30 },
      'product-name': { width: 300, height: 50 },
      'brand': { width: 100, height: 40 },
      'category': { width: 150, height: 30 },
      'stock': { width: 200, height: 40 },
      'promotion': { width: 200, height: 80 },
      'badge': { width: 80, height: 30 },
      'gift': { width: 150, height: 60 },
      'combo': { width: 150, height: 60 },
      'validity': { width: 250, height: 40 },
      'countdown': { width: 200, height: 50 },
      'period': { width: 180, height: 50 },
      'store': { width: 150, height: 50 },
      'contact': { width: 200, height: 50 },
      'schedule': { width: 200, height: 50 },
      'club-easy': { width: 150, height: 60 },
      'cencopay': { width: 150, height: 60 },
      'easy-points': { width: 180, height: 60 },
      'title': { width: 300, height: 80 }
    };

    const newBlock = {
      id: `block-${Date.now()}`,
      type: blockType as any,
      position: position || { x: 100, y: 100 },
      size: elementSizes[blockType] || { width: 200, height: 100 },
      content: elementContent[blockType] || { text: `Nuevo ${blockType}` },
      style: {
        backgroundColor: '#ffffff',
        color: '#000000',
        fontSize: 16,
        textAlign: 'center' as const,
        padding: 10,
        borderRadius: 4,
        border: '1px solid #e2e8f0'
      },
      isContainer: blockType === 'container'
    };
    updateBlocks(prev => [...prev, newBlock]);
  }, [updateBlocks]);

  const handleSaveTemplateSubmit = useCallback(async (name: string, description: string, isPublic: boolean) => {
    try {
      setIsSaving(true);
      setSavingStep('generating');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavingStep('uploading');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSaveModalOpen(false);
      toast.success('Plantilla guardada exitosamente');
      return true;
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error al guardar la plantilla');
      return false;
    } finally {
      setIsSaving(false);
      setSavingStep('idle');
    }
  }, [setIsSaving, setSavingStep, setIsSaveModalOpen]);

  // Tamaños predefinidos de carteles
  const posterSizes = {
    A4: { width: 210, height: 297, name: 'A4 (210x297mm)' },
    A3: { width: 297, height: 420, name: 'A3 (297x420mm)' },
    A2: { width: 420, height: 594, name: 'A2 (420x594mm)' },
    A1: { width: 594, height: 841, name: 'A1 (594x841mm)' },
    LETTER: { width: 216, height: 279, name: 'Carta (216x279mm)' },
    TABLOID: { width: 279, height: 432, name: 'Tabloide (279x432mm)' },
    BANNER_S: { width: 300, height: 200, name: 'Banner Pequeño (300x200mm)' },
    BANNER_M: { width: 600, height: 400, name: 'Banner Mediano (600x400mm)' },
    BANNER_L: { width: 900, height: 600, name: 'Banner Grande (900x600mm)' },
    SQUARE: { width: 300, height: 300, name: 'Cuadrado (300x300mm)' }
  };

  const [selectedPosterSize, setSelectedPosterSize] = useState<keyof typeof posterSizes>('A4');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Family Manager
  const familyManager = useFamilyManager();

  const [activeTab, setActiveTab] = useState('elements');

  return (
    <ErrorBoundary>
      <div className="h-screen bg-gray-50 flex flex-col">
        <Header onBack={onBack} onLogout={onLogout} userName={userName} />

        {/* Barra de Controles del Builder - Mejorada */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">
                {blocks.length} elemento{blocks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Controles de Zoom */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setScale(Math.max(0.25, scale - 0.1))}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-800 rounded-md transition-colors font-medium"
                title="Zoom Out"
              >
                −
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center px-2">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(Math.min(2, scale + 0.1))}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-800 rounded-md transition-colors font-medium"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setScale(1)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors font-medium ml-1"
                title="Reset Zoom"
              >
                Ajustar
              </button>
            </div>

            {/* Selector de Tamaño */}
            <select
              value={selectedPosterSize}
              onChange={(e) => setSelectedPosterSize(e.target.value as keyof typeof posterSizes)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {Object.entries(posterSizes).map(([key, size]) => (
                <option key={key} value={key}>
                  {size.name}
                </option>
              ))}
            </select>

            {/* Botones de Acción */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors font-medium"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Vista Previa</span>
              </button>

              <button
                onClick={handleSaveClick}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Guardar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Área Principal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden">
            <div className="p-4">
              <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                <button
                  onClick={() => setActiveTab('elements')}
                  className={`flex-1 px-2 py-2 rounded text-xs font-medium transition-colors text-center ${
                    activeTab === 'elements'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>🧩</span>
                    <span>Elementos</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`flex-1 px-2 py-2 rounded text-xs font-medium transition-colors text-center ${
                    activeTab === 'templates'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>🎨</span>
                    <span>Plantillas</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('families')}
                  className={`flex-1 px-2 py-2 rounded text-xs font-medium transition-colors text-center ${
                    activeTab === 'families'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>🏠</span>
                    <span>Familias</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-2 py-2 rounded text-xs font-medium transition-colors text-center ${
                    activeTab === 'history'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>📜</span>
                    <span>Historial</span>
                  </div>
                </button>
              </div>

              {/* Contenido basado en pestaña activa */}
              {activeTab === 'elements' && (
                <AdvancedSidebar onAddBlock={handleAddBlockToCanvas} />
              )}
              
              {activeTab === 'families' && (
                <FamilyManager
                  families={familyManager.families}
                  onCreateFamily={familyManager.createFamily}
                  onEditFamily={familyManager.editFamily}
                  onDeleteFamily={familyManager.deleteFamily}
                  onCopyTemplate={familyManager.copyTemplate}
                  onSelectTemplate={(template) => {
                    // Cargar la plantilla seleccionada en el canvas
                    setBlocks(template.blocks);
                    setSelectedPosterSize(template.posterSize);
                  }}
                />
              )}
              
              {activeTab === 'templates' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Plantillas</h3>
                  <p className="text-gray-500">Sistema de plantillas en desarrollo...</p>
                </div>
              )}
              
              {activeTab === 'history' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Historial</h3>
                  <p className="text-gray-500">Historial de cambios en desarrollo...</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Canvas Area - Con Scroll Mejorado */}
          <div className="flex-1 relative bg-gray-50 overflow-hidden">
            <div className="absolute inset-0 overflow-auto" style={{ 
              background: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}>
              <div className="min-h-full flex items-start justify-center py-8">
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}>
                  <Canvas
                    blocks={blocks}
                    onDeleteBlock={handleDeleteBlock}
                    onResizeBlock={handleResizeBlock}
                    onMoveBlock={handleMoveBlock}
                    onImageUpload={handleImageUpload}
                    onAddBlock={handleAddBlockToCanvas}
                    selectedFormat={selectedFormat}
                    isLandscape={isLandscape}
                    canvasRef={canvasRef}
                    zoom={scale}
                    scale={1}
                    posterSize={posterSizes[selectedPosterSize]}
                  />
                </div>
              </div>
            </div>

            {/* Stats overlay */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-4 text-sm z-10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="font-medium">{blocks.length}</span>
                <span className="text-gray-500">elementos</span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="text-gray-600">
                {selectedFormat.name} - {selectedFormat.originalSize}
              </div>
            </div>
          </div>
        </div>

        {/* Modales */}
        {showPreview && (
          <Preview 
            blocks={blocks} 
            onClose={handleClosePreview}
            selectedFormat={selectedFormat}
            isLandscape={isLandscape}
          />
        )}

        {isSaveModalOpen && (
          <SaveTemplateModal
            isOpen={isSaveModalOpen}
            onClose={handleCloseSaveModal}
            onSave={handleSaveTemplateSubmit}
            isSaving={isSaving}
            savingStep={savingStep}
          />
        )}

        {isSearchModalOpen && (
          <SearchTemplateModal
            isOpen={isSearchModalOpen}
            onClose={handleCloseSearchModal}
            onSelectTemplate={handleSelectTemplate}
          />
        )}

        {isExportModalOpen && (
          <ExportModal
            isOpen={isExportModalOpen}
            onClose={handleCloseExportModal}
            blocks={blocks}
            selectedFormat={selectedFormat}
            isLandscape={isLandscape}
            canvasRef={canvasRef}
          />
        )}

        {isGeneratingAI && (
          <AIGeneratingModal
            isOpen={isGeneratingAI}
            onClose={handleCloseAIModal}
          />
        )}
      </div>
    </ErrorBoundary>
  );
});

Builder.displayName = 'Builder';

export default Builder;