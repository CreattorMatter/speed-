import { ReactNode, RefObject } from 'react';
import { Block } from './builder';

export interface HeaderProps {
  onBack: () => void;
  onLogout: () => void;
  userName: string;
}

export interface HeaderProviderProps {
  children: ReactNode;
  userEmail: string;
  userName: string;
}

export interface PreviewProps {
  blocks: Block[];
  isOpen: boolean;
  onClose: () => void;
}

export interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, isPublic: boolean) => Promise<void>;
  isSaving: boolean;
  savingStep: 'idle' | 'generating' | 'uploading';
  templateName: string;
  setTemplateName: (name: string) => void;
  templateDescription: string;
  setTemplateDescription: (description: string) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
}

export interface SearchTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: any) => void;
}

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: RefObject<HTMLDivElement>;
}

export interface AIGeneratingModalProps {
  isOpen: boolean;
  onClose: () => void;
} 