export interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, isPublic: boolean) => Promise<boolean | undefined>;
  isSaving: boolean;
  savingStep: 'idle' | 'generating' | 'uploading';
  templateName: string;
  setTemplateName: (name: string) => void;
  templateDescription: string;
  setTemplateDescription: (description: string) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
}

export interface AIGeneratingModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress?: number;
  status?: string;
}

export interface SearchTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: any) => void;
  selectedTemplate?: any;
} 