import { useState, useCallback } from 'react';
import { Block } from '../types/block';
import { PromotionFamily, TemplateType } from '../types/promotion';

interface UseSaveTemplateProps {
  onSave: (template: {
    name: string;
    description: string;
    isPublic: boolean;
    family: PromotionFamily;
    type: TemplateType;
    blocks: Block[];
  }) => Promise<void>;
  onError: (error: Error) => void;
}

interface UseSaveTemplateReturn {
  isSaving: boolean;
  savingStep: 'idle' | 'validating' | 'saving' | 'complete';
  templateName: string;
  templateDescription: string;
  isPublic: boolean;
  setTemplateName: (name: string) => void;
  setTemplateDescription: (description: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  handleSave: (family: PromotionFamily, type: TemplateType, blocks: Block[]) => Promise<void>;
  resetSaveState: () => void;
}

export const useSaveTemplate = ({
  onSave,
  onError
}: UseSaveTemplateProps): UseSaveTemplateReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [savingStep, setSavingStep] = useState<'idle' | 'validating' | 'saving' | 'complete'>('idle');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSave = useCallback(async (
    family: PromotionFamily,
    type: TemplateType,
    blocks: Block[]
  ) => {
    try {
      setIsSaving(true);
      setSavingStep('validating');

      // Validate template data
      if (!templateName.trim()) {
        throw new Error('Template name is required');
      }

      if (!templateDescription.trim()) {
        throw new Error('Template description is required');
      }

      if (blocks.length === 0) {
        throw new Error('Template must contain at least one block');
      }

      setSavingStep('saving');

      // Save template
      await onSave({
        name: templateName.trim(),
        description: templateDescription.trim(),
        isPublic,
        family,
        type,
        blocks
      });

      setSavingStep('complete');
    } catch (error) {
      if (error instanceof Error) {
        onError(error);
      }
      setSavingStep('idle');
    } finally {
      setIsSaving(false);
    }
  }, [templateName, templateDescription, isPublic, onSave, onError]);

  const resetSaveState = useCallback(() => {
    setIsSaving(false);
    setSavingStep('idle');
    setTemplateName('');
    setTemplateDescription('');
    setIsPublic(false);
  }, []);

  return {
    isSaving,
    savingStep,
    templateName,
    templateDescription,
    isPublic,
    setTemplateName,
    setTemplateDescription,
    setIsPublic,
    handleSave,
    resetSaveState
  };
}; 