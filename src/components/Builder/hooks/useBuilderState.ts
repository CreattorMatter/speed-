import { useState } from 'react';
import { Block, PaperFormat } from '../../../types/builder';
import { PAPER_FORMATS } from '../../../constants/paperFormats';

interface CanvasSettings {
  width: number;
  height: number;
  background: string;
}

interface BuilderState {
  blocks: Block[];
  showPreview: boolean;
  isSaveModalOpen: boolean;
  isSearchModalOpen: boolean;
  previewImage: string;
  isSaving: boolean;
  savingStep: 'idle' | 'generating' | 'uploading';
  isGeneratingAI: boolean;
  session: any;
  templateName: string;
  templateDescription: string;
  isPublic: boolean;
  selectedFormat: PaperFormat;
  isLandscape: boolean;
  scale: number;
  canvasSettings: CanvasSettings;
  isExportModalOpen: boolean;
}

export const useBuilderState = (): BuilderState & {
  setBlocks: (blocks: Block[]) => void;
  setShowPreview: (show: boolean) => void;
  setIsSaveModalOpen: (isOpen: boolean) => void;
  setIsSearchModalOpen: (isOpen: boolean) => void;
  setPreviewImage: (image: string) => void;
  setIsSaving: (isSaving: boolean) => void;
  setSavingStep: (step: 'idle' | 'generating' | 'uploading') => void;
  setIsGeneratingAI: (isGenerating: boolean) => void;
  setSession: (session: any) => void;
  setTemplateName: (name: string) => void;
  setTemplateDescription: (description: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  setSelectedFormat: (format: PaperFormat) => void;
  setIsLandscape: (isLandscape: boolean) => void;
  setScale: (scale: number) => void;
  setCanvasSettings: (settings: CanvasSettings) => void;
  setIsExportModalOpen: (isOpen: boolean) => void;
} => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [savingStep, setSavingStep] = useState<'idle' | 'generating' | 'uploading'>('idle');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(PAPER_FORMATS[2]); // A4 por defecto
  const [isLandscape, setIsLandscape] = useState(false);
  const [scale, setScale] = useState(1);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    width: 800,
    height: 1200,
    background: '#ffffff'
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return {
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
    setSession,
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
    setCanvasSettings,
    isExportModalOpen,
    setIsExportModalOpen
  };
}; 