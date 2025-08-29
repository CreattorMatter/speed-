// ==========================================
// SPEED BUILDER V2 - MAIN HOOK
// ==========================================

import { useState, useCallback, useMemo, useRef } from 'react';
import { 
  BuilderState, 
  BuilderOperations, 
  FamilyConfig, 
  TemplateConfig,
  DraggableElement,
  DraggableElementType,
  ElementPosition,
  ElementSize,
  HistoryAction,
  CanvasState,
  UseBuilderReturn
} from '../types/builder-v2';
import { 
  FAMILY_CONFIGS, 
  DRAGGABLE_ELEMENTS_CONFIG,
  getAllFamilies,
  getFamilyById,
  getDraggableElementsByCategory,
  getAllDraggableElements
} from '../config/builder-v2-config';
import { toast } from 'react-hot-toast';

// Estado inicial del canvas
const initialCanvasState: CanvasState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  activeTool: 'select',
  selectedElementIds: [],
  showGrid: true,
  showRulers: true,
  showGuides: true,
  snapToGrid: true,
  snapToGuides: true,
  canUndo: false,
  canRedo: false,
  historyIndex: -1
};

// Estado inicial del Builder
const initialBuilderState: BuilderState = {
  currentFamily: undefined,
  currentTemplate: undefined,
  elements: [],
  canvas: initialCanvasState,
  history: [],
  exportConfig: {
    format: 'png',
    quality: 90,
    resolution: 300,
    includeBleed: false
  },
  isLoading: false,
  isSaving: false,
  isExporting: false,
  hasUnsavedChanges: false,
  errors: []
};

export const useBuilderV2 = (): UseBuilderReturn => {
  const [state, setState] = useState<BuilderState>(initialBuilderState);
  const nextElementId = useRef(1);

  // =====================
  // HELPER FUNCTIONS
  // =====================

  const generateElementId = useCallback(() => {
    return `element-${nextElementId.current++}`;
  }, []);

  const updateState = useCallback((updates: Partial<BuilderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateCanvas = useCallback((updates: Partial<CanvasState>) => {
    setState(prev => ({
      ...prev,
      canvas: { ...prev.canvas, ...updates }
    }));
  }, []);

  const addToHistory = useCallback((action: HistoryAction) => {
    setState(prev => {
      const newHistory = [...prev.history.slice(0, prev.canvas.historyIndex + 1), action];
      return {
        ...prev,
        history: newHistory,
        canvas: {
          ...prev.canvas,
          historyIndex: newHistory.length - 1,
          canUndo: true,
          canRedo: false
        },
        hasUnsavedChanges: true
      };
    });
  }, []);

  // =====================
  // OPERACIONES PRINCIPALES
  // =====================

  const loadFamily = useCallback(async (familyId: string): Promise<FamilyConfig> => {
    try {
      updateState({ isLoading: true });
      
      const family = getFamilyById(familyId);
      if (!family) {
        throw new Error(`Familia con ID ${familyId} no encontrada`);
      }

      updateState({ 
        currentFamily: family,
        currentTemplate: undefined,
        elements: [],
        isLoading: false 
      });

      toast.success(`Familia "${family.displayName}" cargada correctamente`);
      return family;
    } catch (error) {
      updateState({ isLoading: false });
      toast.error(`Error al cargar familia: ${error}`);
      throw error;
    }
  }, []);

  const loadTemplate = useCallback(async (templateId: string): Promise<TemplateConfig> => {
    try {
      updateState({ isLoading: true });
      
      // Aquí iría la lógica para cargar desde Supabase
      // Por ahora simulamos la carga
      const mockTemplate: TemplateConfig = {
        id: templateId,
        name: 'Plantilla de ejemplo',
        type: 'Precio Lleno',
        familyType: 'Superprecio',
        description: 'Plantilla de ejemplo para desarrollo',
        tags: ['ejemplo'],
        category: 'promocional',
        canvasSize: {
          width: 800,
          height: 600,
          unit: 'px'
        },
        defaultElements: [],
        allowedElements: ['precio-contado', 'descripcion-producto'],
        requiredElements: ['precio-contado'],
        backgroundColor: '#ffffff',
        createdBy: 'sistema',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        isPublic: true,
        isActive: true
      };

      updateState({ 
        currentTemplate: mockTemplate,
        elements: mockTemplate.defaultElements,
        isLoading: false 
      });

      toast.success(`Plantilla "${mockTemplate.name}" cargada correctamente`);
      return mockTemplate;
    } catch (error) {
      updateState({ isLoading: false });
      toast.error(`Error al cargar plantilla: ${error}`);
      throw error;
    }
  }, []);

  const saveTemplate = useCallback(async (template: TemplateConfig): Promise<void> => {
    try {
      updateState({ isSaving: true });
      
      // Aquí iría la lógica para guardar en Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      updateState({ 
        isSaving: false,
        hasUnsavedChanges: false 
      });

      toast.success('Plantilla guardada correctamente');
    } catch (error) {
      updateState({ isSaving: false });
      toast.error(`Error al guardar plantilla: ${error}`);
      throw error;
    }
  }, []);

  const duplicateTemplate = useCallback(async (templateId: string, newName?: string): Promise<TemplateConfig> => {
    try {
      const originalTemplate = await loadTemplate(templateId);
      const duplicatedTemplate: TemplateConfig = {
        ...originalTemplate,
        id: `${originalTemplate.id}-copy`,
        name: newName || `${originalTemplate.name} (Copia)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      };

      updateState({ currentTemplate: duplicatedTemplate });
      toast.success('Plantilla duplicada correctamente');
      return duplicatedTemplate;
    } catch (error) {
      toast.error(`Error al duplicar plantilla: ${error}`);
      throw error;
    }
  }, [loadTemplate]);

  // =====================
  // GESTIÓN DE ELEMENTOS
  // =====================

  const createElement = useCallback((type: DraggableElementType, position: ElementPosition): DraggableElement => {
    const elementConfig = getAllDraggableElements().find(el => el.type === type);
    
    if (!elementConfig) {
      throw new Error(`Tipo de elemento ${type} no encontrado`);
    }

    const newElement: DraggableElement = {
      id: generateElementId(),
      type,
      category: elementConfig.category,
      position,
      size: elementConfig.defaultSize,
      style: elementConfig.defaultStyle,
      content: {
        text: `${elementConfig.name}`,
        placeholder: elementConfig.description,
        isEditable: true,
        isRequired: false,
        isLocked: false
      },
      name: elementConfig.name,
      description: elementConfig.description,
      icon: elementConfig.icon,
      isVisible: true,
      isLocked: false,
      isDraggable: true,
      isResizable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    return newElement;
  }, [generateElementId]);

  const addElement = useCallback((element: DraggableElement) => {
    setState(prev => ({
      ...prev,
      elements: [...prev.elements, element]
    }));

    addToHistory({
      id: generateElementId(),
      type: 'add',
      elementId: element.id,
      newState: element,
      timestamp: new Date()
    });

    toast.success(`Elemento "${element.name}" agregado`);
  }, [addToHistory, generateElementId]);

  const removeElement = useCallback((elementId: string) => {
    setState(prev => {
      const elementToRemove = prev.elements.find(el => el.id === elementId);
      if (!elementToRemove) return prev;

      const updatedElements = prev.elements.filter(el => el.id !== elementId);
      
      addToHistory({
        id: generateElementId(),
        type: 'remove',
        elementId,
        previousState: elementToRemove,
        timestamp: new Date()
      });

      toast.success(`Elemento "${elementToRemove.name}" eliminado`);

      return {
        ...prev,
        elements: updatedElements,
        canvas: {
          ...prev.canvas,
          selectedElementIds: prev.canvas.selectedElementIds.filter(id => id !== elementId)
        }
      };
    });
  }, [addToHistory, generateElementId]);

  const updateElement = useCallback((elementId: string, updates: Partial<DraggableElement>) => {
    setState(prev => {
      const elementIndex = prev.elements.findIndex(el => el.id === elementId);
      if (elementIndex === -1) return prev;

      const previousElement = prev.elements[elementIndex];
      const updatedElement = {
        ...previousElement,
        ...updates,
        updatedAt: new Date(),
        version: previousElement.version + 1
      };

      const updatedElements = [...prev.elements];
      updatedElements[elementIndex] = updatedElement;

      addToHistory({
        id: generateElementId(),
        type: 'style',
        elementId,
        previousState: previousElement,
        newState: updatedElement,
        timestamp: new Date()
      });

      return {
        ...prev,
        elements: updatedElements,
        hasUnsavedChanges: true
      };
    });
  }, [addToHistory, generateElementId]);

  const duplicateElement = useCallback((elementId: string): DraggableElement => {
    const originalElement = state.elements.find(el => el.id === elementId);
    if (!originalElement) {
      throw new Error(`Elemento con ID ${elementId} no encontrado`);
    }

    const duplicatedElement: DraggableElement = {
      ...originalElement,
      id: generateElementId(),
      position: {
        ...originalElement.position,
        x: originalElement.position.x + 20,
        y: originalElement.position.y + 20
      },
      name: `${originalElement.name} (Copia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    addElement(duplicatedElement);
    return duplicatedElement;
  }, [state.elements, generateElementId, addElement]);

  // =====================
  // OPERACIONES DE CANVAS
  // =====================

  const moveElements = useCallback((elementIds: string[], deltaX: number, deltaY: number) => {
    setState(prev => {
      const updatedElements = prev.elements.map(element => {
        if (elementIds.includes(element.id)) {
          return {
            ...element,
            position: {
              ...element.position,
              x: element.position.x + deltaX,
              y: element.position.y + deltaY
            },
            updatedAt: new Date()
          };
        }
        return element;
      });

      return {
        ...prev,
        elements: updatedElements,
        hasUnsavedChanges: true
      };
    });
  }, []);

  const resizeElement = useCallback((elementId: string, newSize: ElementSize) => {
    updateElement(elementId, { size: newSize });
  }, [updateElement]);

  const alignElements = useCallback((elementIds: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (elementIds.length < 2) return;

    setState(prev => {
      const elementsToAlign = prev.elements.filter(el => elementIds.includes(el.id));
      if (elementsToAlign.length < 2) return prev;

      let referenceValue: number;
      
      switch (alignment) {
        case 'left':
          referenceValue = Math.min(...elementsToAlign.map(el => el.position.x));
          break;
        case 'right':
          referenceValue = Math.max(...elementsToAlign.map(el => el.position.x + el.size.width));
          break;
        case 'center':
          const leftMost = Math.min(...elementsToAlign.map(el => el.position.x));
          const rightMost = Math.max(...elementsToAlign.map(el => el.position.x + el.size.width));
          referenceValue = (leftMost + rightMost) / 2;
          break;
        case 'top':
          referenceValue = Math.min(...elementsToAlign.map(el => el.position.y));
          break;
        case 'bottom':
          referenceValue = Math.max(...elementsToAlign.map(el => el.position.y + el.size.height));
          break;
        case 'middle':
          const topMost = Math.min(...elementsToAlign.map(el => el.position.y));
          const bottomMost = Math.max(...elementsToAlign.map(el => el.position.y + el.size.height));
          referenceValue = (topMost + bottomMost) / 2;
          break;
        default:
          return prev;
      }

      const updatedElements = prev.elements.map(element => {
        if (elementIds.includes(element.id)) {
          let newPosition = { ...element.position };

          switch (alignment) {
            case 'left':
              newPosition.x = referenceValue;
              break;
            case 'right':
              newPosition.x = referenceValue - element.size.width;
              break;
            case 'center':
              newPosition.x = referenceValue - element.size.width / 2;
              break;
            case 'top':
              newPosition.y = referenceValue;
              break;
            case 'bottom':
              newPosition.y = referenceValue - element.size.height;
              break;
            case 'middle':
              newPosition.y = referenceValue - element.size.height / 2;
              break;
          }

          return {
            ...element,
            position: newPosition,
            updatedAt: new Date()
          };
        }
        return element;
      });

      return {
        ...prev,
        elements: updatedElements,
        hasUnsavedChanges: true
      };
    });

    toast.success(`Elementos alineados: ${alignment}`);
  }, []);

  const distributeElements = useCallback((elementIds: string[], distribution: 'horizontal' | 'vertical') => {
    if (elementIds.length < 3) return;

    setState(prev => {
      const elementsToDistribute = prev.elements
        .filter(el => elementIds.includes(el.id))
        .sort((a, b) => distribution === 'horizontal' ? a.position.x - b.position.x : a.position.y - b.position.y);

      if (elementsToDistribute.length < 3) return prev;

      const first = elementsToDistribute[0];
      const last = elementsToDistribute[elementsToDistribute.length - 1];
      
      const totalSpace = distribution === 'horizontal' 
        ? (last.position.x + last.size.width) - first.position.x
        : (last.position.y + last.size.height) - first.position.y;

      const totalElementSize = elementsToDistribute.reduce((sum, el) => 
        sum + (distribution === 'horizontal' ? el.size.width : el.size.height), 0);

      const availableSpace = totalSpace - totalElementSize;
      const spacing = availableSpace / (elementsToDistribute.length - 1);

      let currentPosition = distribution === 'horizontal' ? first.position.x : first.position.y;

      const updatedElements = prev.elements.map(element => {
        const elementIndex = elementsToDistribute.findIndex(el => el.id === element.id);
        if (elementIndex !== -1 && elementIndex > 0 && elementIndex < elementsToDistribute.length - 1) {
          const previousElement = elementsToDistribute[elementIndex - 1];
          currentPosition = distribution === 'horizontal' 
            ? previousElement.position.x + previousElement.size.width + spacing
            : previousElement.position.y + previousElement.size.height + spacing;

          return {
            ...element,
            position: {
              ...element.position,
              [distribution === 'horizontal' ? 'x' : 'y']: currentPosition
            },
            updatedAt: new Date()
          };
        }
        return element;
      });

      return {
        ...prev,
        elements: updatedElements,
        hasUnsavedChanges: true
      };
    });

    toast.success(`Elementos distribuidos: ${distribution}`);
  }, []);

  // =====================
  // HISTORIAL
  // =====================

  const undo = useCallback(() => {
    setState(prev => {
      if (!prev.canvas.canUndo || prev.canvas.historyIndex < 0) return prev;

      const action = prev.history[prev.canvas.historyIndex];
      let updatedElements = [...prev.elements];

      switch (action.type) {
        case 'add':
          updatedElements = updatedElements.filter(el => el.id !== action.elementId);
          break;
        case 'remove':
          if (action.previousState) {
            updatedElements.push(action.previousState as DraggableElement);
          }
          break;
        case 'move':
        case 'resize':
        case 'style':
        case 'content':
          if (action.previousState) {
            const elementIndex = updatedElements.findIndex(el => el.id === action.elementId);
            if (elementIndex !== -1) {
              updatedElements[elementIndex] = {
                ...updatedElements[elementIndex],
                ...action.previousState
              };
            }
          }
          break;
      }

      const newHistoryIndex = prev.canvas.historyIndex - 1;

      return {
        ...prev,
        elements: updatedElements,
        canvas: {
          ...prev.canvas,
          historyIndex: newHistoryIndex,
          canUndo: newHistoryIndex >= 0,
          canRedo: true
        },
        hasUnsavedChanges: true
      };
    });

    toast.success('Acción deshecha');
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (!prev.canvas.canRedo || prev.canvas.historyIndex >= prev.history.length - 1) return prev;

      const newHistoryIndex = prev.canvas.historyIndex + 1;
      const action = prev.history[newHistoryIndex];
      let updatedElements = [...prev.elements];

      switch (action.type) {
        case 'add':
          if (action.newState) {
            updatedElements.push(action.newState as DraggableElement);
          }
          break;
        case 'remove':
          updatedElements = updatedElements.filter(el => el.id !== action.elementId);
          break;
        case 'move':
        case 'resize':
        case 'style':
        case 'content':
          if (action.newState) {
            const elementIndex = updatedElements.findIndex(el => el.id === action.elementId);
            if (elementIndex !== -1) {
              updatedElements[elementIndex] = {
                ...updatedElements[elementIndex],
                ...action.newState
              };
            }
          }
          break;
      }

      return {
        ...prev,
        elements: updatedElements,
        canvas: {
          ...prev.canvas,
          historyIndex: newHistoryIndex,
          canUndo: true,
          canRedo: newHistoryIndex < prev.history.length - 1
        },
        hasUnsavedChanges: true
      };
    });

    toast.success('Acción rehecha');
  }, []);

  // =====================
  // VALIDACIÓN
  // =====================

  const validateTemplate = useCallback(() => {
    const errors: Array<{ elementId?: string; message: string; type: 'warning' | 'error' }> = [];

    // Validar elementos requeridos
    if (state.currentTemplate) {
      const requiredElements = state.currentTemplate.requiredElements;
      const existingElementTypes = state.elements.map(el => el.type);

      requiredElements.forEach(requiredType => {
        if (!existingElementTypes.includes(requiredType)) {
          errors.push({
            message: `Elemento requerido faltante: ${requiredType}`,
            type: 'error'
          });
        }
      });
    }

    // Validar elementos individuales
    state.elements.forEach(element => {
      if (element.validation?.required && !element.content.text) {
        errors.push({
          elementId: element.id,
          message: `${element.name} es requerido`,
          type: 'error'
        });
      }

      if (element.validation?.minLength && element.content.text && element.content.text.length < element.validation.minLength) {
        errors.push({
          elementId: element.id,
          message: `${element.name} debe tener al menos ${element.validation.minLength} caracteres`,
          type: 'warning'
        });
      }

      if (element.validation?.maxLength && element.content.text && element.content.text.length > element.validation.maxLength) {
        errors.push({
          elementId: element.id,
          message: `${element.name} no puede tener más de ${element.validation.maxLength} caracteres`,
          type: 'warning'
        });
      }
    });

    updateState({ errors });
    return errors;
  }, [state.currentTemplate, state.elements]);

  // =====================
  // EXPORTACIÓN
  // =====================

  const exportCanvas = useCallback(async (config: BuilderState['exportConfig']): Promise<Blob> => {
    try {
      updateState({ isExporting: true });
      
      // Aquí iría la lógica real de exportación
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
      
      // Crear un blob de ejemplo
      const blob = new Blob(['Exported canvas data'], { type: 'text/plain' });
      
      updateState({ isExporting: false });
      toast.success(`Canvas exportado como ${config.format.toUpperCase()}`);
      
      return blob;
    } catch (error) {
      updateState({ isExporting: false });
      toast.error(`Error al exportar canvas: ${error}`);
      throw error;
    }
  }, []);

  const generatePreview = useCallback(async (): Promise<string> => {
    try {
      // Aquí iría la lógica para generar preview
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Retornar una URL de preview de ejemplo
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    } catch (error) {
      toast.error(`Error al generar preview: ${error}`);
      throw error;
    }
  }, []);

  // =====================
  // OPERACIONES OBJECT
  // =====================

  const operations: BuilderOperations = useMemo(() => ({
    loadFamily,
    loadTemplate,
    saveTemplate,
    duplicateTemplate,
    createElement,
    addElement,
    removeElement,
    updateElement,
    duplicateElement,
    moveElements,
    resizeElement,
    alignElements,
    distributeElements,
    undo,
    redo,
    addToHistory,
    validateTemplate,
    exportCanvas,
    generatePreview
  }), [
    loadFamily, loadTemplate, saveTemplate, duplicateTemplate,
    createElement, addElement, removeElement, updateElement, duplicateElement,
    moveElements, resizeElement, alignElements, distributeElements,
    undo, redo, addToHistory, validateTemplate, exportCanvas, generatePreview
  ]);

  // =====================
  // DATOS MEMORIZADOS
  // =====================

  const families = useMemo(() => getAllFamilies(), []);
  const templates = useMemo(() => [], []); // Se cargarían desde Supabase
  const draggableElements = useMemo(() => DRAGGABLE_ELEMENTS_CONFIG, []);

  return {
    state,
    operations,
    families,
    templates,
    draggableElements
  };
}; 