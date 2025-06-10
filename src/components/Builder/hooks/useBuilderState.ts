import { useState, useCallback } from 'react';
import { Block, PaperFormat } from '../../../types/builder';
import { PAPER_FORMATS } from '../../../constants/paperFormats';
import { PromotionFamily, TemplateType } from '../types/promotion';

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
  selectedFamily: PromotionFamily | null;
  selectedTemplate: TemplateType | null;
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
  setSelectedFamily: (family: PromotionFamily | null) => void;
  setSelectedTemplate: (template: TemplateType | null) => void;
  updateBlocks: (updater: (prev: Block[]) => Block[]) => void;
  handleFamilySelect: (family: PromotionFamily) => void;
  handleTemplateSelect: (template: TemplateType) => void;
  resetState: () => void;
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
  const [selectedFamily, setSelectedFamily] = useState<PromotionFamily | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);

  const updateBlocks = useCallback((updater: (prev: Block[]) => Block[]) => {
    setBlocks(updater);
  }, []);

  const handleFamilySelect = useCallback((family: PromotionFamily) => {
    setSelectedFamily(family);
    setSelectedTemplate(null); // Reset template when family changes
  }, []);

  const handleTemplateSelect = useCallback((template: TemplateType) => {
    setSelectedTemplate(template);
    // Here you would typically initialize the canvas with the template's default blocks
    // This would be implemented based on your template configuration
  }, []);

  const resetState = useCallback(() => {
    setBlocks([]);
    setSelectedFamily(null);
    setSelectedTemplate(null);
    setIsGeneratingAI(false);
    setIsSaveModalOpen(false);
    setTemplateName('');
    setTemplateDescription('');
    setIsPublic(false);
    setIsSaving(false);
    setSavingStep('idle');
  }, []);

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
    setIsExportModalOpen,
    selectedFamily,
    setSelectedFamily,
    selectedTemplate,
    setSelectedTemplate,
    updateBlocks,
    handleFamilySelect,
    handleTemplateSelect,
    resetState
  };
}; 