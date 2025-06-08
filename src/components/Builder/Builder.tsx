import React, { useRef, useCallback, memo } from 'react';
import { useBuilderState } from './hooks/useBuilderState';
import { useBuilderOperations } from './hooks/useBuilderOperations';
import { useBuilderAuth } from './hooks/useBuilderAuth';
import { BuilderToolbar } from './components/BuilderToolbar';
import Canvas from './Canvas';
import Preview from './Preview';
import { SaveTemplateModal } from './SaveTemplateModal';
import { SearchTemplateModal } from './SearchTemplateModal';
import { ExportModal } from './ExportModal';
import { AIGeneratingModal } from './AIGeneratingModal';
import { HeaderProvider } from '../shared/HeaderProvider';
import { Header } from '../shared/Header';
import { toast } from 'react-hot-toast';
import ErrorBoundary from './ErrorBoundary';

interface BuilderProps {
  onBack: () => void;
  userEmail: string;
  userName: string;
  userRole?: 'admin' | 'limited';
}

const Builder = memo(({ onBack, userEmail, userName, userRole = 'admin' }: BuilderProps) => {
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
    setIsExportModalOpen
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

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col">
        <HeaderProvider userEmail={userEmail} userName={userName}>
          <Header
            onBack={onBack}
            onLogout={() => {}}
            userEmail={userEmail}
          />
        </HeaderProvider>

        <BuilderToolbar
          onBack={onBack}
          onAddBlock={handleAddBlock}
          onSave={handleSaveClick}
          onSearch={handleSearchClick}
          onExport={handleExportClick}
          onGenerateAI={handleGenerateAI}
        />

        <div className="flex-1 overflow-hidden">
          {showPreview ? (
            <Preview
              blocks={blocks}
              isOpen={showPreview}
              onClose={handleClosePreview}
            />
          ) : (
            <Canvas
              blocks={blocks}
              setBlocks={setBlocks}
              onDropInContainer={handleDropInContainer}
              selectedFormat={selectedFormat}
              isLandscape={isLandscape}
              scale={scale}
              canvasRef={canvasRef}
            />
          )}
        </div>

        <SaveTemplateModal
          isOpen={isSaveModalOpen}
          onClose={handleCloseSaveModal}
          onSave={handleSaveTemplate}
          isSaving={isSaving}
          savingStep={savingStep}
          templateName={templateName}
          setTemplateName={setTemplateName}
          templateDescription={templateDescription}
          setTemplateDescription={setTemplateDescription}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
        />

        <SearchTemplateModal
          isOpen={isSearchModalOpen}
          onClose={handleCloseSearchModal}
          onSelectTemplate={handleSelectTemplate}
        />

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={handleCloseExportModal}
          canvasRef={canvasRef}
        />

        <AIGeneratingModal
          isOpen={isGeneratingAI}
          onClose={handleCloseAIModal}
        />
      </div>
    </ErrorBoundary>
  );
});

Builder.displayName = 'Builder';

export default Builder;