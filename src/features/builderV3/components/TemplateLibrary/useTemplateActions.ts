// =====================================
// TEMPLATE ACTIONS HOOK - BuilderV3
// =====================================

import { useCallback } from 'react';
import { TemplateV3, FamilyV3 } from '../../types';
import { templatesV3Service } from '../../../../services/builderV3Service';
import { toast } from 'react-hot-toast';
import { TemplateActionsReturn } from './types';

interface UseTemplateActionsProps {
  family: FamilyV3;
  onTemplateSelect: (templateId: string) => void;
  onTemplateDelete?: (templateId: string) => void;
  onRefresh?: () => void;
  isDuplicating: boolean;
  setIsDuplicating: (isDuplicating: boolean) => void;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
  setPreviewModal: (template: TemplateV3 | null) => void;
  setDeleteModal: (template: TemplateV3 | null) => void;
  templateToDelete: TemplateV3 | null;
}

export const useTemplateActions = ({
  family,
  onTemplateSelect,
  onTemplateDelete,
  onRefresh,
  isDuplicating,
  setIsDuplicating,
  isDeleting,
  setIsDeleting,
  setPreviewModal,
  setDeleteModal,
  templateToDelete
}: UseTemplateActionsProps): TemplateActionsReturn => {

  // =====================
  // TEMPLATE SELECTION
  // =====================
  
  const handleTemplateClick = useCallback((template: TemplateV3) => {
    onTemplateSelect(template.id);
  }, [onTemplateSelect]);

  // =====================
  // TEMPLATE PREVIEW
  // =====================
  
  const handleTemplatePreview = useCallback((template: TemplateV3, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewModal(template);
  }, [setPreviewModal]);

  const handleClosePreview = useCallback(() => {
    setPreviewModal(null);
  }, [setPreviewModal]);

  // =====================
  // TEMPLATE DUPLICATION
  // =====================
  
  const handleTemplateDuplicate = useCallback(async (template: TemplateV3, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isDuplicating) return; // Prevenir duplicaciones múltiples
    
    setIsDuplicating(true);
    
    try {
      // Generar nombre único para la copia
      const newName = `${template.name} - Copia`;
      
      // Duplicar la plantilla usando el servicio existente
      const duplicatedTemplate = await templatesV3Service.duplicate(template.id, newName);
      
      // Mostrar mensaje de éxito
      console.log('Plantilla duplicada exitosamente:', duplicatedTemplate.name);
      toast.success(`Plantilla "${duplicatedTemplate.name}" duplicada exitosamente`);
      
      // Refrescar la lista para mostrar la nueva plantilla
      if (onRefresh) {
        onRefresh();
      }
      
      // Navegar directamente al constructor con la plantilla duplicada
      onTemplateSelect(duplicatedTemplate.id);
      
    } catch (error) {
      console.error('Error al duplicar plantilla:', error);
      toast.error('Error al duplicar la plantilla. Inténtalo de nuevo.');
    } finally {
      setIsDuplicating(false);
    }
  }, [isDuplicating, onTemplateSelect, onRefresh, setIsDuplicating]);

  // =====================
  // TEMPLATE DELETION
  // =====================
  
  const handleTemplateDeleteClick = useCallback((template: TemplateV3, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal(template);
  }, [setDeleteModal]);

  const handleConfirmDelete = useCallback(async () => {
    if (!templateToDelete || isDeleting) return;

    setIsDeleting(true);

    try {
      // Eliminar usando el servicio
      await templatesV3Service.delete(templateToDelete.id);

      // Mostrar mensaje de éxito
      toast.success(`Plantilla "${templateToDelete.name}" eliminada exitosamente`);
      
      // Cerrar modal
      setDeleteModal(null);
      
      // Refrescar la lista para actualizar la vista
      if (onRefresh) {
        onRefresh();
      }

      // Llamar callback de eliminación si existe
      if (onTemplateDelete) {
        onTemplateDelete(templateToDelete.id);
      }
      
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      toast.error('Error al eliminar la plantilla. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  }, [templateToDelete, isDeleting, onRefresh, onTemplateDelete, setIsDeleting, setDeleteModal]);

  const handleCancelDelete = useCallback(() => {
    setDeleteModal(null);
  }, [setDeleteModal]);

  return {
    handleTemplateClick,
    handleTemplatePreview,
    handleTemplateDuplicate,
    handleTemplateDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleClosePreview
  };
}; 