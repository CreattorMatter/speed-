// =====================================
// BUILDER V3 TEMPLATE ACTIONS HOOK - Main Component
// =====================================

import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { FamilyV3, FamilyTypeV3, TemplateV3 } from '../../types';
import { UnitConverter } from '../../utils/unitConverter';
import { builderV3Service } from '../../../../services/builderV3Service';
import { BuilderV3TemplateActions, BuilderV3StateUpdaters } from './types';

interface UseBuilderV3TemplateActionsProps {
  families: FamilyV3[];
  operations: any;
  state: any;
  stateUpdaters: BuilderV3StateUpdaters;
  customWidth: number;
  customHeight: number;
  orientation: 'portrait' | 'landscape';
  refreshData: () => Promise<void>;
}

export const useBuilderV3TemplateActions = ({
  families,
  operations,
  state,
  stateUpdaters,
  customWidth,
  customHeight,
  orientation,
  refreshData
}: UseBuilderV3TemplateActionsProps): BuilderV3TemplateActions => {
  
  // =====================
  // FAMILY ACTIONS
  // =====================
  
  const handleFamilySelect = useCallback(async (family: FamilyV3) => {
    console.log('🏠 Familia seleccionada:', family);
    
    try {
      // Usar loadFamily para cargar la familia Y sus plantillas
      await operations.loadFamily(family.id);
      stateUpdaters.setCurrentStep('template-library');
    } catch (error) {
      console.error('❌ Error cargando familia y plantillas:', error);
      toast.error('Error al cargar las plantillas de la familia');
    }
  }, [operations, stateUpdaters]);

  const handleCreateFamily = useCallback(() => {
    stateUpdaters.setIsCreateFamilyModalOpen(true);
  }, [stateUpdaters]);

  const handleFamilyCreated = useCallback(async (familyData: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt' | 'templates'>) => {
    try {
      const newFamily = await operations.createFamily(familyData);
      toast.success(`Familia "${familyData.displayName}" creada exitosamente.`);
      await refreshData();
      stateUpdaters.setIsCreateFamilyModalOpen(false);
      return newFamily; // Retornar la familia creada con su ID real
    } catch (error) {
      toast.error('Error al crear la familia.');
      console.error('Failed to create family:', error);
      throw error;
    }
  }, [operations, refreshData, stateUpdaters]);

  // =====================
  // TEMPLATE ACTIONS
  // =====================
  
  const handleTemplateSelect = useCallback(async (templateId: string) => {
    console.log('📋 Plantilla seleccionada:', templateId);
    
    try {
      // Cargar la plantilla completa
      const template = await operations.loadTemplate(templateId);
      console.log('📋 Plantilla cargada:', template);
      
      // Configurar canvas con dimensiones de la plantilla
      const canvasWidth = template.canvas.width;
      const canvasHeight = template.canvas.height;
      
      // Navegar al editor de canvas
      stateUpdaters.setCurrentStep('canvas-editor');
    } catch (error) {
      console.error('Error al cargar plantilla:', error);
      toast.error('Error al cargar la plantilla');
    }
  }, [operations, stateUpdaters]);

  const handleCreateNewTemplate = useCallback(async () => {
    if (!state.currentFamily) return;
    try {
      // Considerar la orientación actual para las dimensiones del canvas
      let canvasWidth = customWidth;
      let canvasHeight = customHeight;
      
      // Si estamos en landscape, las dimensiones ya están intercambiadas
      // porque customWidth y customHeight reflejan la orientación actual
      
      const canvasWidthInPx = canvasWidth * UnitConverter.MM_TO_PX;
      const canvasHeightInPx = canvasHeight * UnitConverter.MM_TO_PX;

      const newTemplate = await operations.createTemplate({
        name: 'Nueva Plantilla Sin Título',
        familyType: state.currentFamily.id,
        canvas: { 
          width: canvasWidthInPx, 
          height: canvasHeightInPx, 
          unit: 'px', 
          dpi: 300, 
          backgroundColor: '#ffffff' 
        },
      } as any);
      
      console.log(`🚀 Nueva plantilla creada (${orientation}) con dimensiones ${Math.round(canvasWidthInPx)}x${Math.round(canvasHeightInPx)}px (${canvasWidth}×${canvasHeight}mm)`);
      operations.setTemplateDirect(newTemplate);
      stateUpdaters.setCurrentStep('canvas-editor');
    } catch (error) {
      console.error('❌ Error creando plantilla:', error);
      toast.error('Error al crear nueva plantilla');
    }
  }, [state.currentFamily, operations, customWidth, customHeight, orientation, stateUpdaters]);

  const handleTitleChange = useCallback((newTitle: string) => {
    if (!state.currentTemplate) return;
    
    // Validar que el título no esté vacío
    const trimmedTitle = newTitle.trim();
    if (trimmedTitle.length === 0) {
      console.warn('⚠️ No se permite título vacío');
      return;
    }
    
    console.log('📝 Cambiando título de plantilla:', trimmedTitle);
    operations.updateTemplate(state.currentTemplate.id, {
      name: trimmedTitle
    });
  }, [state.currentTemplate, operations]);

  // =====================
  // CLONING ACTIONS
  // =====================
  
  const handleCloneTemplates = useCallback(async (
    sourceTemplateIds: string[], 
    targetFamilyId: string, 
    replaceHeaders?: boolean, 
    headerImageUrl?: string
  ) => {
    try {
      console.log('🔄 BuilderV3 - Iniciando clonación de plantillas:', {
        templateIds: sourceTemplateIds,
        targetFamilyId,
        replaceHeaders,
        hasHeaderImage: !!headerImageUrl
      });

      const clonedTemplates = await builderV3Service.templates.cloneTemplates(
        sourceTemplateIds,
        targetFamilyId,
        { replaceHeaders, headerImageUrl }
      );

      toast.success(`${clonedTemplates.length} plantillas copiadas exitosamente`);
      await refreshData();
    } catch (error) {
      console.error('❌ Error en clonación de plantillas:', error);
      toast.error('Error al clonar plantillas');
      throw error;
    }
  }, [refreshData]);

  return {
    handleFamilySelect,
    handleTemplateSelect,
    handleCreateNewTemplate,
    handleCreateFamily,
    handleFamilyCreated,
    handleCloneTemplates,
    handleTitleChange
  };
}; 