// =====================================
// CREATE FAMILY MODAL TYPES - BuilderV3
// =====================================

import { FamilyV3, TemplateV3 } from '../../types';

export interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFamily: (familyData: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt' | 'templates'>) => Promise<FamilyV3>;
  existingFamilies: FamilyV3[];
  onCloneTemplates?: (sourceTemplateIds: string[], targetFamilyId: string, replaceHeaders?: boolean, headerImageUrl?: string) => Promise<void>;
}

export interface CreateFamilyFormData {
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
}

export type CreateFamilyStep = 'basic' | 'clone' | 'confirm';

export interface CreateFamilyState {
  currentStep: CreateFamilyStep;
  isSubmitting: boolean;
  formData: CreateFamilyFormData;
  enableCloning: boolean;
  selectedSourceFamily: FamilyV3 | null;
  selectedTemplateIds: string[];
  replaceHeaders: boolean;
  expandedFamily: string | null;
  headerFile: File | null;
  headerImageUrl: string;
  isUploadingHeader: boolean;
}

export interface BasicInfoStepProps {
  formData: CreateFamilyFormData;
  onFormDataChange: (updates: Partial<CreateFamilyFormData>) => void;
  enableCloning: boolean;
  onEnableCloningChange: (enabled: boolean) => void;
}

export interface CloneTemplatesStepProps {
  existingFamilies: FamilyV3[];
  selectedTemplateIds: string[];
  onTemplateToggle: (templateId: string) => void;
  selectedSourceFamily: FamilyV3 | null;
  expandedFamily: string | null;
  onFamilyExpand: (familyId: string) => void;
  replaceHeaders: boolean;
  onReplaceHeadersChange: (replace: boolean) => void;
  headerFile: File | null;
  headerImageUrl: string;
  isUploadingHeader: boolean;
  onHeaderFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveHeaderImage: () => void;
}

export interface ConfirmationStepProps {
  formData: CreateFamilyFormData;
  enableCloning: boolean;
  selectedTemplateIds: string[];
  replaceHeaders: boolean;
  headerFile: File | null;
  headerImageUrl: string;
}

export interface StepsIndicatorProps {
  currentStep: CreateFamilyStep;
  enableCloning: boolean;
}

export interface ImageUploaderProps {
  headerFile: File | null;
  headerImageUrl: string;
  isUploadingHeader: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  className?: string;
}

export interface CreateFamilyActions {
  handleBasicFormSubmit: () => void;
  handleCloneSetup: () => void;
  handleFinalSubmit: () => Promise<void>;
  handleClose: () => void;
  handleReset: () => void;
  handleTemplateToggle: (templateId: string) => void;
  handleFamilyExpand: (familyId: string) => void;
  handleHeaderFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveHeaderImage: () => void;
  updateFormData: (updates: Partial<CreateFamilyFormData>) => void;
  setEnableCloning: (enabled: boolean) => void;
  setReplaceHeaders: (replace: boolean) => void;
  setCurrentStep: (step: CreateFamilyStep) => void;
} 