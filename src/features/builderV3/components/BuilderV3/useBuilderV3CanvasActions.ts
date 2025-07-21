// =====================================
// BUILDER V3 CANVAS ACTIONS HOOK - Main Component
// =====================================

import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ComponentTypeV3, PositionV3 } from '../../types';
import { UnitConverter } from '../../utils/unitConverter';
import { BuilderV3CanvasActions, PaperFormat, BuilderV3StateUpdaters } from './types';

interface UseBuilderV3CanvasActionsProps {
  operations: any;
  state: any;
  stateUpdaters: BuilderV3StateUpdaters;
  availablePaperFormats: PaperFormat[];
  orientation: 'portrait' | 'landscape';
}

export const useBuilderV3CanvasActions = ({
  operations,
  state,
  stateUpdaters,
  availablePaperFormats,
  orientation
}: UseBuilderV3CanvasActionsProps): BuilderV3CanvasActions => {
  
  // =====================
  // COMPONENT ACTIONS
  // =====================
  
  const handleComponentAdd = useCallback((type: ComponentTypeV3, position: PositionV3) => {
    const component = operations.createComponent(type, position);
    operations.addComponent(component);
  }, [operations]);

  const handleComponentSelect = useCallback((componentId: string | null) => {
    operations.selectComponent(componentId || '');
  }, [operations]);

  const handleMultipleComponentSelect = useCallback((componentIds: string[]) => {
    operations.selectComponents(componentIds);
  }, [operations]);

  // =====================
  // PAPER FORMAT ACTIONS
  // =====================
  
  const handlePaperFormatChange = useCallback((formatId: string) => {
    stateUpdaters.setPaperFormat(formatId);
    const format = availablePaperFormats.find(f => f.id === formatId);
    
    if (format && format.id !== 'CUSTOM' && state.currentTemplate) {
      // Considerar la orientación actual para determinar las dimensiones finales
      let finalWidth = format.width;
      let finalHeight = format.height;
      
      // Si estamos en landscape, intercambiar las dimensiones
      if (orientation === 'landscape') {
        finalWidth = format.height;
        finalHeight = format.width;
      }
      
      // Actualizar también las dimensiones personalizadas
      stateUpdaters.setCustomWidth(finalWidth);
      stateUpdaters.setCustomHeight(finalHeight);
      
      console.log(`📄 Formato cambiado a ${format.name} (${orientation}): ${finalWidth}×${finalHeight}mm`);
      
      operations.updateTemplate(state.currentTemplate.id, {
        canvas: {
          ...state.currentTemplate.canvas,
          width: finalWidth * UnitConverter.MM_TO_PX,
          height: finalHeight * UnitConverter.MM_TO_PX
        }
      });
    }
  }, [
    stateUpdaters,
    availablePaperFormats,
    state.currentTemplate,
    operations,
    orientation
  ]);

  const handleOrientationToggle = useCallback(() => {
    const newOrientation = orientation === 'portrait' ? 'landscape' : 'portrait';
    stateUpdaters.setOrientation(newOrientation);
    
    if (!state.currentTemplate) return;
    
    // Intercambiar las dimensiones del canvas
    const currentCanvas = state.currentTemplate.canvas;
    const newWidth = currentCanvas.height;
    const newHeight = currentCanvas.width;
    
    console.log(`📐 Cambiando orientación de ${orientation} a ${newOrientation}:`);
    console.log(`   ${Math.round(currentCanvas.width / UnitConverter.MM_TO_PX)}×${Math.round(currentCanvas.height / UnitConverter.MM_TO_PX)}mm → ${Math.round(newWidth / UnitConverter.MM_TO_PX)}×${Math.round(newHeight / UnitConverter.MM_TO_PX)}mm`);
    
    // Actualizar las dimensiones personalizadas también
    const newCustomWidth = Math.round(newWidth / UnitConverter.MM_TO_PX);
    const newCustomHeight = Math.round(newHeight / UnitConverter.MM_TO_PX);
    stateUpdaters.setCustomWidth(newCustomWidth);
    stateUpdaters.setCustomHeight(newCustomHeight);
    
    // Actualizar el template con las nuevas dimensiones
    operations.updateTemplate(state.currentTemplate.id, {
      canvas: {
        ...currentCanvas,
        width: newWidth,
        height: newHeight
      }
    });
    
    // TODO: Aquí podríamos agregar lógica para reposicionar componentes que queden fuera del canvas
    // Por ahora, solo hacemos el intercambio de dimensiones
    
    toast.success(`Orientación cambiada a ${newOrientation === 'portrait' ? 'vertical' : 'horizontal'}`);
  }, [
    orientation,
    stateUpdaters,
    state.currentTemplate,
    operations
  ]);

  return {
    handleComponentAdd,
    handleComponentSelect,
    handleMultipleComponentSelect,
    handlePaperFormatChange,
    handleOrientationToggle
  };
}; 