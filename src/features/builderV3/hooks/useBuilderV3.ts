// =====================================
// SPEED BUILDER V3 - MAIN HOOK
// =====================================

import { useReducer, useCallback, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  BuilderStateV3,
  BuilderOperationsV3,
  DraggableComponentV3,
  FamilyV3,
  TemplateV3,
  ComponentTypeV3,
  PositionV3,
  SizeV3,
  ComponentsLibraryV3,
  HistoryActionV3,
  CanvasStateV3,
  UseBuilderV3Return
} from '../types';
// 🆕 Campos Propios (Custom Fields)
import { resetCustomFields, exportCustomFields } from '../fields/fieldRegistry';
import { generateId } from '../../../utils/generateId';
import { templatesV3Service, familiesV3Service } from '../../../services/builderV3Service';
import { getComponentByType } from '../data/componentsLibrary';

// =====================
// ESTADO INICIAL
// =====================

const createInitialState = (): BuilderStateV3 => ({
  currentFamily: undefined,
  currentTemplate: undefined,
  components: [],
  componentsLibrary: {},
  canvas: {
    zoom: 1,
    minZoom: 0.1,
    maxZoom: 5,
    panX: 0,
    panY: 0,
    activeTool: 'select',
    selectedComponentIds: [],
    showGrid: true,
    gridSize: 20,
    gridColor: '#e5e7eb',
    showRulers: true,
    showGuides: true,
    guides: [],
    snapToGrid: true,
    snapToGuides: true,
    snapToObjects: true,
    snapTolerance: 5,
    selectionMode: 'multiple',
    selectionStyle: {
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      handleColor: '#3b82f6',
      handleSize: 8
    },
    canUndo: false,
    canRedo: false,
    historyIndex: -1,
    maxHistorySize: 50
  },
  history: [],
  sapConnection: {
    isConnected: false,
    baseUrl: undefined,
    token: undefined,
    lastSync: undefined
  },
  promotionConnection: {
    isConnected: false,
    baseUrl: undefined,
    token: undefined,
    lastSync: undefined
  },
  exportConfig: {
    format: 'png',
    quality: 90,
    dpi: 300,
    includeBleed: false,
    bleedSize: 3,
    cropMarks: false,
    colorSpace: 'RGB'
  },
  ui: {
    leftPanelOpen: true,
    rightPanelOpen: true,
    bottomPanelOpen: false,
    activeLeftTab: 'components',
    activeRightTab: 'properties',
    activeBottomTab: 'preview'
  },
  isLoading: false,
  isSaving: false,
  isExporting: false,
  isConnecting: false,
  hasUnsavedChanges: false,
  errors: [],
  userPreferences: {
    autoSave: true,
    autoSaveInterval: 30,
    gridSnap: true,
    showTooltips: true,
    theme: 'light',
    language: 'es'
  }
});

// =====================
// TIPOS DE ACCIONES
// =====================

type BuilderAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_EXPORTING'; payload: boolean }
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_FAMILY'; payload: FamilyV3 }
  | { type: 'SET_TEMPLATE'; payload: TemplateV3 }
  | { type: 'SET_TEMPLATE_DIRECT'; payload: TemplateV3 }
  | { type: 'UPDATE_TEMPLATE'; payload: { templateId: string; updates: Partial<TemplateV3> } }
  | { type: 'SET_COMPONENTS'; payload: DraggableComponentV3[] }
  | { type: 'ADD_COMPONENT'; payload: DraggableComponentV3 }
  | { type: 'UPDATE_COMPONENT'; payload: { id: string; updates: Partial<DraggableComponentV3> } }
  | { type: 'REMOVE_COMPONENT'; payload: string }
  | { type: 'SELECT_COMPONENTS'; payload: string[] }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_RULERS' }
  | { type: 'ADD_TO_HISTORY'; payload: HistoryActionV3 }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_SAP_CONNECTION'; payload: { isConnected: boolean; baseUrl?: string; token?: string } }
  | { type: 'SET_PROMOTION_CONNECTION'; payload: { isConnected: boolean; baseUrl?: string; token?: string } }
  | { type: 'SET_HAS_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'ADD_ERROR'; payload: { id: string; componentId?: string; type: 'error' | 'warning' | 'info'; message: string } }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'TOGGLE_UI_PANEL'; payload: { panel: 'left' | 'right' | 'bottom'; open?: boolean } }
  | { type: 'SET_UI_TAB'; payload: { panel: 'left' | 'right' | 'bottom'; tab: string } }
  | { type: 'SET_COMPONENTS_LIBRARY'; payload: ComponentsLibraryV3 };

// =====================
// REDUCER
// =====================

const builderReducer = (state: BuilderStateV3, action: BuilderAction): BuilderStateV3 => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    
    case 'SET_EXPORTING':
      return { ...state, isExporting: action.payload };
    
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };
    
    case 'SET_FAMILY':
      return { 
        ...state, 
        currentFamily: action.payload,
        hasUnsavedChanges: false
      };
    
    case 'SET_TEMPLATE':
      return { 
        ...state, 
        currentTemplate: action.payload,
        components: action.payload.defaultComponents || [],
        hasUnsavedChanges: false
      };
    
    case 'SET_TEMPLATE_DIRECT':
      return { 
        ...state, 
        currentTemplate: action.payload,
        components: action.payload.defaultComponents || [],
        hasUnsavedChanges: false
      };
    
    case 'UPDATE_TEMPLATE':
      if (state.currentTemplate && state.currentTemplate.id === action.payload.templateId) {
        return {
          ...state,
          currentTemplate: {
            ...state.currentTemplate,
            ...action.payload.updates,
            updatedAt: new Date()
          },
          hasUnsavedChanges: true
        };
      }
      return state;
    
    case 'SET_COMPONENTS':
      return { 
        ...state, 
        components: action.payload,
        hasUnsavedChanges: true
      };
    
    case 'ADD_COMPONENT':
      return { 
        ...state, 
        components: [...state.components, action.payload],
        hasUnsavedChanges: true
      };
    
    case 'UPDATE_COMPONENT':
      console.log(`🔄 UPDATE_COMPONENT reducer:`, {
        componentId: action.payload.id,
        updates: action.payload.updates,
        hasShowMockDataUpdate: 'showMockData' in action.payload.updates
      });
      
      const updatedComponents = state.components.map(component =>
        component.id === action.payload.id
          ? {
              ...component,
              ...action.payload.updates,
              // Merge profundo para el objeto content
              content: action.payload.updates.content
                ? {
                    ...component.content,
                    ...action.payload.updates.content
                  }
                : component.content,
              updatedAt: new Date()
            }
          : component
      );
      
      const updatedComponent = updatedComponents.find(c => c.id === action.payload.id);
      console.log(`✅ Componente actualizado:`, {
        id: action.payload.id,
        showMockData: updatedComponent?.showMockData
      });
      
      return {
        ...state,
        components: updatedComponents,
        hasUnsavedChanges: true
      };
    
    case 'REMOVE_COMPONENT':
      return {
        ...state,
        components: state.components.filter(component => component.id !== action.payload),
        canvas: {
          ...state.canvas,
          selectedComponentIds: state.canvas.selectedComponentIds.filter(id => id !== action.payload)
        },
        hasUnsavedChanges: true
      };
    
    case 'SELECT_COMPONENTS':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          selectedComponentIds: action.payload
        }
      };
    
    case 'SET_ZOOM':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          zoom: Math.max(state.canvas.minZoom, Math.min(state.canvas.maxZoom, action.payload))
        }
      };
    
    case 'SET_PAN':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          panX: action.payload.x,
          panY: action.payload.y
        }
      };
    
    case 'TOGGLE_GRID':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          showGrid: !state.canvas.showGrid
        }
      };
    
    case 'TOGGLE_RULERS':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          showRulers: !state.canvas.showRulers
        }
      };
    
    case 'ADD_TO_HISTORY':
      const newHistory = [...state.history.slice(0, state.canvas.historyIndex + 1), action.payload];
      return {
        ...state,
        history: newHistory.slice(-state.canvas.maxHistorySize),
        canvas: {
          ...state.canvas,
          historyIndex: Math.min(newHistory.length - 1, state.canvas.maxHistorySize - 1),
          canUndo: true,
          canRedo: false
        }
      };
    
    case 'UNDO':
      if (state.canvas.historyIndex >= 0) {
        const action = state.history[state.canvas.historyIndex];
        return {
          ...state,
          canvas: {
            ...state.canvas,
            historyIndex: state.canvas.historyIndex - 1,
            canUndo: state.canvas.historyIndex > 0,
            canRedo: true
          }
        };
      }
      return state;
    
    case 'REDO':
      if (state.canvas.historyIndex < state.history.length - 1) {
        const action = state.history[state.canvas.historyIndex + 1];
        return {
          ...state,
          canvas: {
            ...state.canvas,
            historyIndex: state.canvas.historyIndex + 1,
            canUndo: true,
            canRedo: state.canvas.historyIndex < state.history.length - 2
          }
        };
      }
      return state;
    
    case 'SET_SAP_CONNECTION':
      return {
        ...state,
        sapConnection: {
          ...state.sapConnection,
          ...action.payload,
          lastSync: action.payload.isConnected ? new Date() : state.sapConnection.lastSync
        }
      };
    
    case 'SET_PROMOTION_CONNECTION':
      return {
        ...state,
        promotionConnection: {
          ...state.promotionConnection,
          ...action.payload,
          lastSync: action.payload.isConnected ? new Date() : state.promotionConnection.lastSync
        }
      };
    
    case 'SET_HAS_UNSAVED_CHANGES':
      return {
        ...state,
        hasUnsavedChanges: action.payload
      };
    
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, { ...action.payload, timestamp: new Date() }]
      };
    
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload)
      };
    
    case 'TOGGLE_UI_PANEL':
      const { panel, open } = action.payload;
      const currentOpen = panel === 'left' ? state.ui.leftPanelOpen : 
                         panel === 'right' ? state.ui.rightPanelOpen : 
                         state.ui.bottomPanelOpen;
      
      return {
        ...state,
        ui: {
          ...state.ui,
          [`${panel}PanelOpen`]: open !== undefined ? open : !currentOpen
        }
      };
    
    case 'SET_UI_TAB':
      const { panel: tabPanel, tab } = action.payload;
      const tabKey = `active${tabPanel.charAt(0).toUpperCase() + tabPanel.slice(1)}Tab` as keyof typeof state.ui;
      
      const newState = {
        ...state,
        ui: {
          ...state.ui,
          [tabKey]: tab
        }
      };
      return newState;
    
    case 'SET_COMPONENTS_LIBRARY':
      return {
        ...state,
        componentsLibrary: action.payload
      };
    
    default:
      return state;
  }
};

// =====================
// HOOK PRINCIPAL
// =====================

export const useBuilderV3 = (): UseBuilderV3Return => {
  // =====================
  // STATE MANAGEMENT
  // =====================
  
  const [state, dispatch] = useReducer(builderReducer, createInitialState());
  const [families, setFamilies] = useState<FamilyV3[]>([]);
  const [templates, setTemplates] = useState<TemplateV3[]>([]);

  // =====================
  // VARIABLES DE CONTROL PARA EVITAR BUCLES (PERSISTENTES)
  // =====================

  const isSavingTemplate = useRef(false);
  const thumbnailGenerationInProgress = useRef(false);

  // =====================
  // OPERACIONES
  // =====================

  const operations: BuilderOperationsV3 = {
    // ===== GESTIÓN DE FAMILIAS =====
    loadFamily: useCallback(async (familyId: string) => {
      try {
      dispatch({ type: 'SET_LOADING', payload: true });
        const family = await familiesV3Service.getById(familyId);
        if (!family) {
          throw new Error('Familia no encontrada');
        }
        dispatch({ type: 'SET_FAMILY', payload: family });
        return family;
      } catch (error) {
        console.error('Error loading family:', error);
        toast.error('Error al cargar familia');
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, []),

    createFamily: useCallback(async (family: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        const newFamily = await familiesV3Service.createFamily(family);
        toast.success('Familia creada exitosamente');
        return newFamily;
      } catch (error) {
        console.error('Error creating family:', error);
        toast.error('Error al crear familia');
        throw error;
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    }, []),

    updateFamily: useCallback(async (familyId: string, updates: Partial<FamilyV3>) => {
      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        const updatedFamily = await familiesV3Service.updateFamily(familyId, updates);
        dispatch({ type: 'SET_FAMILY', payload: updatedFamily });
        toast.success('Familia actualizada exitosamente');
        return updatedFamily;
      } catch (error) {
        console.error('Error updating family:', error);
        toast.error('Error al actualizar familia');
        throw error;
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    }, []),

    deleteFamily: useCallback(async (familyId: string) => {
      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        await familiesV3Service.deleteFamily(familyId);
        toast.success('Familia eliminada exitosamente');
      } catch (error) {
        console.error('Error deleting family:', error);
        toast.error('Error al eliminar familia');
        throw error;
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    }, []),

    migrateFamily: useCallback(async (fromFamilyId: string, toFamilyId: string, options: {
      migrateAllTemplates: boolean;
      replaceHeaders: boolean;
      replaceColors: boolean;
      templateIds?: string[];
    }) => {
      try {
      dispatch({ type: 'SET_LOADING', payload: true });
        
        // 1. Obtener familias origen y destino
        const fromFamily = await familiesV3Service.getById(fromFamilyId);
        const toFamily = await familiesV3Service.getById(toFamilyId);
        
        if (!fromFamily) {
          throw new Error('Familia origen no encontrada');
        }
        if (!toFamily) {
          throw new Error('Familia destino no encontrada');
        }
        
        // 2. Obtener plantillas a migrar
        const templatesToMigrate = options.migrateAllTemplates 
          ? fromFamily.templates 
          : fromFamily.templates.filter(t => options.templateIds?.includes(t.id));
        
        // 3. Crear plantillas migradas con tags automáticos
        const migratedTemplates = await Promise.all(
          templatesToMigrate.map(async (template) => {
            const migratedComponents = template.defaultComponents.map(component => {
              const migratedComponent = { ...component };
              
              // TODO: 🎯 MIGRACIÓN AUTOMÁTICA POR TAGS - necesita migrationTags en tipo DraggableComponentV3
              /*
              if (component.migrationTags?.autoReplace) {
                switch (component.migrationTags.migrationTag) {
                  case 'header':
                    if (options.replaceHeaders && toFamily.defaultStyle.visualEffects.headerStyle) {
                      migratedComponent.style = {
                        ...migratedComponent.style,
                        ...toFamily.defaultStyle.visualEffects.headerStyle
                      };
                      
                      // Reemplazar imagen de header si está disponible
                      if (toFamily.headerImage && migratedComponent.content.imageUrl) {
                        migratedComponent.content.imageUrl = toFamily.headerImage;
                      }
                    }
                    break;
                }
              }
              */
              
              // 🎨 MIGRACIÓN DE COLORES GLOBALES
              if (options.replaceColors && toFamily.migrationConfig?.headerReplacement?.replaceColors) {
                const newColors = toFamily.migrationConfig.headerReplacement.newColors;
                if (newColors) {
                  migratedComponent.style = {
                    ...migratedComponent.style,
                    color: {
                      ...migratedComponent.style?.color,
                      color: newColors.text || migratedComponent.style?.color?.color,
                      backgroundColor: newColors.background || migratedComponent.style?.color?.backgroundColor
                    }
                  };
                }
              }
              
              return migratedComponent;
            });
            
            // Crear nueva plantilla migrada
            const migratedTemplate: Omit<TemplateV3, 'id' | 'createdAt' | 'updatedAt'> = {
              name: `${template.name} (Migrado a ${toFamily.displayName})`,
              familyType: toFamily.name,
              description: `${template.description} - Migrado desde ${fromFamily.displayName}`,
              thumbnail: template.thumbnail,
              tags: [...template.tags, 'migrated', `from-${fromFamily.name}`],
              category: template.category,
              canvas: {
                ...template.canvas,
                backgroundColor: toFamily.templates[0]?.canvas.backgroundColor || template.canvas.backgroundColor,
                backgroundImage: toFamily.templates[0]?.canvas.backgroundImage || template.canvas.backgroundImage
              },
              defaultComponents: migratedComponents,
              familyConfig: {
                ...template.familyConfig,
                headerImage: toFamily.headerImage || template.familyConfig.headerImage,
                typography: toFamily.defaultStyle.typography || template.familyConfig.typography
              },
              validationRules: template.validationRules,
              exportSettings: template.exportSettings,
              isPublic: template.isPublic,
              isActive: template.isActive,
              version: 1,
              createdBy: template.createdBy,
              lastUsed: undefined
            };
            
            return await templatesV3Service.create(migratedTemplate);
          })
        );
        
        // 4. Actualizar familia destino con nuevas plantillas
        await familiesV3Service.updateFamily(toFamilyId, {
          templates: [...toFamily.templates, ...migratedTemplates]
        });
        
        toast.success(`${migratedTemplates.length} plantillas migradas exitosamente a ${toFamily.displayName}`);
        
      } catch (error) {
        console.error('Error migrating family:', error);
        toast.error('Error en la migración de familias');
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, []),

    // ===== GESTIÓN DE PLANTILLAS =====
    loadTemplate: useCallback(async (templateId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const template = await templatesV3Service.getById(templateId);
        if (!template) {
          toast.error(`La plantilla con ID ${templateId} no fue encontrada.`);
          throw new Error('Plantilla no encontrada');
        }
        
        dispatch({ type: 'SET_TEMPLATE', payload: template });
        // 🆕 Cargar Campos Propios desde la plantilla al registro en memoria
        try {
          resetCustomFields(template.customFields as any);
        } catch (e) {
          console.warn('No se pudieron cargar customFields del template:', e);
        }
        return template;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [state.currentFamily]),

    createTemplate: useCallback(async (template) => {
      const newTemplate: TemplateV3 = {
        ...template,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return newTemplate;
    }, []),

    updateTemplate: useCallback(async (templateId, updates) => {
      // Actualizar en estado local primero
      dispatch({ type: 'UPDATE_TEMPLATE', payload: { templateId, updates } });
      
      // Intentar actualizar en Supabase si está disponible
      try {
        if (state.currentTemplate && state.currentTemplate.id === templateId) {
          const result = await templatesV3Service.update(templateId, updates);
          toast.success('Plantilla actualizada correctamente');
          return result;
        }
        return state.currentTemplate!;
      } catch (error) {
        console.warn('Error updating in Supabase, keeping local changes:', error);
        // Mantener los cambios locales aunque falle Supabase
        if (state.currentTemplate) {
          return { ...state.currentTemplate, ...updates, updatedAt: new Date() };
        }
        throw error;
      }
    }, [state.currentTemplate]),

    deleteTemplate: useCallback(async (templateId) => {
      // Implementar eliminación de plantilla
      throw new Error('No implementado');
    }, []),

    duplicateTemplate: useCallback(async (templateId, newName) => {
      // Implementar duplicación de plantilla
      throw new Error('No implementado');
    }, []),

    // ===== SAVE TEMPLATE WITH THUMBNAIL WAIT
    saveTemplateAndWaitForThumbnail: useCallback(async (): Promise<void> => {
      // ⚠️ PROTECCIÓN CONTRA MÚLTIPLES LLAMADAS
      if (isSavingTemplate.current) {
        console.log('⚠️ Guardado ya en progreso, ignorando llamada adicional');
        return;
      }

      if (!state.currentTemplate) {
        throw new Error('No hay plantilla para guardar');
      }

      isSavingTemplate.current = true;
      dispatch({ type: 'SET_SAVING', payload: true });

      try {
        console.log('💾 Guardando plantilla con espera completa de thumbnail...');

        // =====================
        // PASO 1: GUARDAR PLANTILLA EN BD
        // =====================
        
        const templateToSave: Partial<TemplateV3> = {
          ...state.currentTemplate,
          defaultComponents: state.components,
          // 🆕 Persistir Campos Propios
          customFields: exportCustomFields() as any,
          updatedAt: new Date()
        };

        const updatedTemplate = await templatesV3Service.update(state.currentTemplate.id, templateToSave);
        
        dispatch({ type: 'SET_TEMPLATE_DIRECT', payload: updatedTemplate });
        dispatch({ type: 'SET_HAS_UNSAVED_CHANGES', payload: false });
        
        console.log('✅ Plantilla guardada en BD, iniciando generación SINCRONIZADA de thumbnail...');

        // =====================
        // PASO 2: GENERAR THUMBNAIL SINCRONAMENTE
        // =====================
        
        // Esperar un momento para que el canvas se renderice
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (thumbnailGenerationInProgress.current) {
          console.log('⚠️ Generación de thumbnail ya en progreso');
          return;
        }

        thumbnailGenerationInProgress.current = true;

        try {
          const canvasElement = document.querySelector('[data-canvas="builderv3"]') as HTMLElement;
          
          if (canvasElement) {
            console.log('🖼️ Generando thumbnail desde canvas...');
            
            const { generateThumbnailFromCanvas, deletePreviousThumbnail } = await import('../utils/thumbnailGenerator');
            
            if (updatedTemplate.thumbnail) {
              console.log('🗑️ Eliminando thumbnail anterior:', updatedTemplate.thumbnail);
              await deletePreviousThumbnail(updatedTemplate.thumbnail);
            }

            const thumbnailResult = await generateThumbnailFromCanvas(
              canvasElement,
              updatedTemplate.id,
              {
                width: 800,
                height: 500,
                quality: 0.8,
                backgroundColor: updatedTemplate.canvas.backgroundColor
              }
            );

            console.log('✅ Thumbnail generado:', thumbnailResult.url);

            const finalTemplate = await templatesV3Service.update(updatedTemplate.id, {
              thumbnail: thumbnailResult.url
            });

            dispatch({ type: 'SET_TEMPLATE_DIRECT', payload: finalTemplate });
            
            console.log('🎉 Plantilla guardada completamente con thumbnail - LISTA PARA NAVEGAR');
            
          } else {
            console.log('⚠️ Canvas no encontrado para generar thumbnail');
          }
          
        } catch (thumbnailError) {
          console.error('❌ Error generando thumbnail:', thumbnailError);
        } finally {
          thumbnailGenerationInProgress.current = false;
        }

      } catch (error) {
        console.error('❌ Error guardando plantilla con thumbnail completo:', error);
        dispatch({ type: 'SET_SAVING', payload: false });
        throw error;
      } finally {
        isSavingTemplate.current = false;
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    }, [state.currentTemplate, state.components]),

    // ===== SAVE TEMPLATE - VERSIÓN FINAL CON THUMBNAILS COMPLETOS
    saveTemplate: useCallback(async (): Promise<void> => {
      // ⚠️ PROTECCIÓN CONTRA MÚLTIPLES LLAMADAS
      if (isSavingTemplate.current) {
        console.log('⚠️ Guardado ya en progreso, ignorando llamada adicional');
        return;
      }

      if (!state.currentTemplate) {
        throw new Error('No hay plantilla para guardar');
      }

      isSavingTemplate.current = true; // ⚠️ ACTIVAR PROTECCIÓN
      dispatch({ type: 'SET_SAVING', payload: true });

      try {
        console.log('💾 Guardando plantilla con sistema de thumbnails completo...');

        // ===============================================
        // PASO 0: LIMPIAR Y SANITIZAR COMPONENTES (SOLUCIÓN DEFINITIVA)
        // ===============================================
        const sanitizedComponents = state.components.map(comp => {
          if (comp.type !== 'field-dynamic-text') return comp;

          const content = comp.content as any;
          const newContent = { ...content };
          let changed = false;

          // Regla 1: Si tiene un template dinámico, DEBE ser de tipo 'dynamic'
          if (newContent.dynamicTemplate) {
            if (newContent.fieldType !== 'dynamic') {
              console.warn(`🧼 Saneando: Componente ${comp.id} con dynamicTemplate forzado a 'dynamic'.`);
              newContent.fieldType = 'dynamic';
              // Limpiar staticValue si es un placeholder como "Nuevo Componente"
              if (newContent.staticValue === 'Nuevo componente' || newContent.staticValue === 'Texto estático') {
                newContent.staticValue = '';
              }
              changed = true;
            }
          } 
          // Regla 2: Si tiene staticValue que no parece un template, DEBE ser 'static'
          else if (newContent.staticValue && !/\[.*\]/.test(newContent.staticValue)) {
            if (newContent.fieldType !== 'static') {
              console.warn(`🧼 Saneando: Componente ${comp.id} con valor estático forzado a 'static'.`);
              newContent.fieldType = 'static';
              changed = true;
            }
          }
          // Regla 3: Si no tiene dynamicTemplate ni staticValue, es un error de datos.
          // Forzar a estático para que sea editable.
          else if (!newContent.dynamicTemplate && !newContent.staticValue) {
             console.warn(`🧼 Saneando: Componente ${comp.id} sin contenido. Forzado a 'static' para ser editable.`);
             newContent.fieldType = 'static';
             newContent.staticValue = 'Texto Vacío';
             changed = true;
          }

          if (changed) {
            return { ...comp, content: newContent };
          }
          return comp;
        });
        
        // =====================
        // PASO 1: GUARDAR PLANTILLA EN BD (SIN THUMBNAIL AÚN)
        // =====================
        
        const templateToSave: Partial<TemplateV3> = {
          ...state.currentTemplate,
          defaultComponents: sanitizedComponents, // USAR COMPONENTES LIMPIOS
          // 🆕 Persistir Campos Propios
          customFields: exportCustomFields() as any,
          updatedAt: new Date()
          // thumbnail se actualizará después
        };

        const updatedTemplate = await templatesV3Service.update(state.currentTemplate.id, templateToSave);
        
        // Actualizar estado inmediatamente
        dispatch({ type: 'SET_TEMPLATE_DIRECT', payload: updatedTemplate });
        dispatch({ type: 'SET_HAS_UNSAVED_CHANGES', payload: false });
        
        console.log('✅ Plantilla guardada en BD, iniciando generación de thumbnail...');

        // =====================
        // PASO 2: GENERAR THUMBNAIL EN BACKGROUND CON PROMISE
        // =====================
        
        // 🎯 CREAR PROMISE PARA PODER ESPERAR EL THUMBNAIL
        const thumbnailPromise = new Promise<void>((resolve) => {
          setTimeout(async () => {
            if (thumbnailGenerationInProgress.current) {
              console.log('⚠️ Generación de thumbnail ya en progreso');
              resolve();
              return;
            }

            thumbnailGenerationInProgress.current = true;

            try {
              const canvasElement = document.querySelector('[data-canvas="builderv3"]') as HTMLElement;
              
              if (canvasElement) {
                console.log('🖼️ Generando thumbnail desde canvas...');
                
                // =====================
                // IMPORTAR FUNCIONES DE THUMBNAIL
                // =====================
                const { generateThumbnailFromCanvas, deletePreviousThumbnail } = await import('../utils/thumbnailGenerator');
                
                // =====================
                // ELIMINAR THUMBNAIL ANTERIOR PRIMERO
                // =====================
                if (updatedTemplate.thumbnail) {
                  console.log('🗑️ Eliminando thumbnail anterior:', updatedTemplate.thumbnail);
                  await deletePreviousThumbnail(updatedTemplate.thumbnail);
                }

                // =====================
                // GENERAR NUEVO THUMBNAIL
                // =====================
                const thumbnailResult = await generateThumbnailFromCanvas(
                  canvasElement,
                  updatedTemplate.id,
                  {
                    width: 800,
                    height: 500,
                    quality: 0.8,
                    backgroundColor: updatedTemplate.canvas.backgroundColor
                  }
                );

                console.log('✅ Thumbnail generado:', thumbnailResult.url);

                // =====================
                // ACTUALIZAR BD CON THUMBNAIL URL
                // =====================
                const finalTemplate = await templatesV3Service.update(updatedTemplate.id, {
                  thumbnail: thumbnailResult.url
                });

                // =====================
                // ACTUALIZAR ESTADO CON THUMBNAIL
                // =====================
                dispatch({ type: 'SET_TEMPLATE_DIRECT', payload: finalTemplate });
                
                console.log('🎉 Plantilla guardada completamente con thumbnail');
                
              } else {
                console.log('⚠️ Canvas no encontrado para generar thumbnail');
              }
              
            } catch (thumbnailError) {
              console.error('❌ Error generando thumbnail:', thumbnailError);
              // No fallar el guardado por error de thumbnail
            } finally {
              thumbnailGenerationInProgress.current = false;
              resolve(); // ✅ RESOLVER PROMISE SIEMPRE
            }
          }, 1000); // Delay para asegurar que el canvas esté renderizado
        });

        // 🎯 GUARDAR PROMISE PARA QUE OTROS PUEDAN ESPERARLA
        (updatedTemplate as any)._thumbnailPromise = thumbnailPromise;

      } catch (error) {
        console.error('❌ Error guardando plantilla:', error);
        dispatch({ type: 'SET_SAVING', payload: false });
        throw error;
      } finally {
        isSavingTemplate.current = false;
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    }, [state.currentTemplate, state.components]),

    // ===== GESTIÓN DE COMPONENTES =====
    createComponent: useCallback((type: ComponentTypeV3, position: PositionV3) => {
      // Intentar tomar defaults desde la librería de componentes
      const definition = getComponentByType(type);

      const baseStyle: DraggableComponentV3['style'] = {
        typography: {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          lineHeight: 1.4,
          letterSpacing: 0,
          textAlign: 'left',
          textDecoration: 'none',
          textTransform: 'none'
        },
        color: {
          color: '#333333',
          backgroundColor: 'transparent'
        },
        border: {
          width: 0,
          style: 'none',
          color: '#000000',
          radius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }
        },
        spacing: {
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          margin: { top: 0, right: 0, bottom: 0, left: 0 }
        },
        effects: {
          opacity: 1
        }
      };

      // Merge de defaults con definición específica (si existe)
      const mergedStyle: DraggableComponentV3['style'] = {
        ...baseStyle,
        ...(definition?.defaultStyle || {}),
        // Merge explícito para objetos anidados comunes
        color: { ...baseStyle.color, ...(definition?.defaultStyle as any)?.color },
        border: { ...baseStyle.border, ...(definition?.defaultStyle as any)?.border },
        typography: { ...baseStyle.typography, ...(definition?.defaultStyle as any)?.typography },
        spacing: { ...baseStyle.spacing, ...(definition?.defaultStyle as any)?.spacing },
        effects: { ...baseStyle.effects, ...(definition?.defaultStyle as any)?.effects }
      };

      const component: DraggableComponentV3 = {
        id: generateId(),
        type,
        category: (definition?.category as any) || 'Texto y Datos',
        name: definition?.name || `Component ${type}`,
        description: definition?.description || '',
        icon: definition?.icon || '📦',
        position,
        size: definition?.defaultSize || { width: 100, height: 50, isProportional: false },
        style: mergedStyle,
        content: definition?.defaultContent || { fieldType: 'static', staticValue: 'Nuevo componente' },
        isVisible: true,
        isLocked: false,
        isDraggable: true,
        isResizable: true,
        isEditable: true,
        customLabel: {
          name: '',
          color: '#3b82f6',
          textColor: '#ffffff',
          show: false
        },
        childrenIds: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        createdBy: 'user'
      };
      
      return component;
    }, []),

    addComponent: useCallback((component: DraggableComponentV3) => {
      dispatch({ type: 'ADD_COMPONENT', payload: component });
      
      // Agregar al historial
      const historyAction: HistoryActionV3 = {
        id: generateId(),
        type: 'create',
        componentIds: [component.id],
        newState: { [component.id]: component },
        timestamp: new Date(),
        description: `Agregar ${component.name}`
      };
      dispatch({ type: 'ADD_TO_HISTORY', payload: historyAction });
    }, []),

    removeComponent: useCallback((componentId: string) => {
      dispatch({ type: 'REMOVE_COMPONENT', payload: componentId });
    }, []),

    removeComponents: useCallback((componentIds: string[]) => {
      componentIds.forEach(id => {
        dispatch({ type: 'REMOVE_COMPONENT', payload: id });
      });
    }, []),

    updateComponent: useCallback((componentId: string, updates: Partial<DraggableComponentV3>) => {
      dispatch({ type: 'UPDATE_COMPONENT', payload: { id: componentId, updates } });
    }, []),

    duplicateComponent: useCallback((componentId: string) => {
      const component = state.components.find(c => c.id === componentId);
      if (component) {
        const duplicated = {
          ...component,
          id: generateId(),
          position: {
            ...component.position,
            x: component.position.x + 20,
            y: component.position.y + 20
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return duplicated;
      }
      throw new Error('Componente no encontrado');
    }, [state.components]),

    duplicateComponents: useCallback((componentIds: string[]) => {
      return componentIds.map(id => {
        const component = state.components.find(c => c.id === id);
        if (component) {
          const duplicated = {
            ...component,
            id: generateId(),
            position: {
              ...component.position,
              x: component.position.x + 20,
              y: component.position.y + 20
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };
          return duplicated;
        }
        throw new Error('Componente no encontrado');
      });
    }, [state.components]),

    copyComponents: useCallback((componentIds: string[]) => {
      // Implementar copia de componentes - por ahora solo log
      console.log('Copy components:', componentIds);
    }, []),

    pasteComponents: useCallback(() => {
      // Implementar pegado de componentes - por ahora solo log
      console.log('Paste components');
    }, []),

    // ===== OPERACIONES DE TRANSFORMACIÓN =====
    moveComponent: useCallback((componentId: string, newPosition: PositionV3) => {
      dispatch({ type: 'UPDATE_COMPONENT', payload: { 
        id: componentId, 
        updates: { position: newPosition } 
      }});
    }, []),

    moveComponents: useCallback((componentIds: string[], deltaX: number, deltaY: number) => {
      componentIds.forEach(id => {
        const component = state.components.find(c => c.id === id);
        if (component) {
          const newPosition = {
            ...component.position,
            x: component.position.x + deltaX,
            y: component.position.y + deltaY
          };
          dispatch({ type: 'UPDATE_COMPONENT', payload: { 
            id, 
            updates: { position: newPosition } 
          }});
        }
      });
    }, [state.components]),

    resizeComponent: useCallback((componentId: string, newSize: SizeV3) => {
      dispatch({ type: 'UPDATE_COMPONENT', payload: { 
        id: componentId, 
        updates: { size: newSize } 
      }});
    }, []),

    rotateComponent: useCallback((componentId: string, angle: number) => {
      const component = state.components.find(c => c.id === componentId);
      if (component) {
        const newPosition = {
          ...component.position,
          rotation: angle
        };
        dispatch({ type: 'UPDATE_COMPONENT', payload: { 
          id: componentId, 
          updates: { position: newPosition } 
        }});
      }
    }, [state.components]),

    scaleComponent: useCallback((componentId: string, scaleX: number, scaleY: number) => {
      const component = state.components.find(c => c.id === componentId);
      if (component) {
        const newPosition = {
          ...component.position,
          scaleX,
          scaleY
        };
        dispatch({ type: 'UPDATE_COMPONENT', payload: { 
          id: componentId, 
          updates: { position: newPosition } 
        }});
      }
    }, [state.components]),

    // ===== OPERACIONES DE ALINEACIÓN =====
    alignComponents: useCallback((componentIds, alignment) => {
      // Implementar alineación
      console.log('Align components:', componentIds, alignment);
    }, []),

    distributeComponents: useCallback((componentIds, distribution) => {
      // Implementar distribución
      console.log('Distribute components:', componentIds, distribution);
    }, []),

    arrangeComponents: useCallback((componentIds, arrangement) => {
      // Implementar arreglo de capas
      console.log('Arrange components:', componentIds, arrangement);
    }, []),

    // ===== OPERACIONES DE AGRUPACIÓN =====
    groupComponents: useCallback((componentIds) => {
      // Implementar agrupación
      return generateId();
    }, []),

    ungroupComponents: useCallback((groupId) => {
      // Implementar desagrupación
      return [];
    }, []),

    // ===== GESTIÓN DE CAPAS =====
    reorderComponent: useCallback((componentId, newIndex) => {
      // Implementar reordenamiento
      console.log('Reorder component:', componentId, newIndex);
    }, []),

    lockComponent: useCallback((componentId, locked) => {
      dispatch({ type: 'UPDATE_COMPONENT', payload: { 
        id: componentId, 
        updates: { isLocked: locked } 
      }});
    }, []),

    hideComponent: useCallback((componentId, hidden) => {
      dispatch({ type: 'UPDATE_COMPONENT', payload: { 
        id: componentId, 
        updates: { isVisible: !hidden } 
      }});
    }, []),

    // ===== HISTORIAL Y DESHACER =====
    undo: useCallback(() => {
      dispatch({ type: 'UNDO' });
    }, []),

    redo: useCallback(() => {
      dispatch({ type: 'REDO' });
    }, []),

    addToHistory: useCallback((action: HistoryActionV3) => {
      dispatch({ type: 'ADD_TO_HISTORY', payload: action });
    }, []),

    clearHistory: useCallback(() => {
      // Implementar limpieza de historial
    }, []),

    // ===== SELECCIÓN =====
    selectComponent: useCallback((componentId: string, addToSelection = false) => {
      const currentSelection = state.canvas.selectedComponentIds;
      const newSelection = addToSelection 
        ? [...currentSelection, componentId]
        : [componentId];
      
      dispatch({ type: 'SELECT_COMPONENTS', payload: newSelection });
    }, [state.canvas.selectedComponentIds]),

    selectComponents: useCallback((componentIds: string[]) => {
      dispatch({ type: 'SELECT_COMPONENTS', payload: componentIds });
    }, []),

    selectAll: useCallback(() => {
      const allIds = state.components.map(c => c.id);
      dispatch({ type: 'SELECT_COMPONENTS', payload: allIds });
    }, [state.components]),

    clearSelection: useCallback(() => {
      dispatch({ type: 'SELECT_COMPONENTS', payload: [] });
    }, []),

    // ===== CANVAS =====
    zoomTo: useCallback((zoom: number) => {
      dispatch({ type: 'SET_ZOOM', payload: zoom });
    }, []),

    zoomIn: useCallback(() => {
      dispatch({ type: 'SET_ZOOM', payload: state.canvas.zoom * 1.2 });
    }, [state.canvas.zoom]),

    zoomOut: useCallback(() => {
      dispatch({ type: 'SET_ZOOM', payload: state.canvas.zoom / 1.2 });
    }, [state.canvas.zoom]),

    zoomToFit: useCallback(() => {
      dispatch({ type: 'SET_ZOOM', payload: 1 });
      dispatch({ type: 'SET_PAN', payload: { x: 0, y: 0 } });
    }, []),

    zoomToSelection: useCallback(() => {
      // Implementar zoom a selección
      console.log('Zoom to selection');
    }, []),

    panTo: useCallback((x: number, y: number) => {
      dispatch({ type: 'SET_PAN', payload: { x, y } });
    }, []),

    resetView: useCallback(() => {
      dispatch({ type: 'SET_ZOOM', payload: 1 });
      dispatch({ type: 'SET_PAN', payload: { x: 0, y: 0 } });
    }, []),

    // ===== VALIDACIÓN =====
    validateTemplate: useCallback(() => {
      return [];
    }, []),

    validateComponent: useCallback((componentId) => {
      return [];
    }, []),

    // ===== CONEXIONES EXTERNAS =====
    connectToSAP: useCallback(async (config) => {
      dispatch({ type: 'SET_CONNECTING', payload: true });
      try {
        // Simular conexión
        await new Promise(resolve => setTimeout(resolve, 1000));
        dispatch({ type: 'SET_SAP_CONNECTION', payload: { 
          isConnected: true, 
          baseUrl: config.baseUrl, 
          token: config.token 
        }});
        return true;
      } catch (error) {
        return false;
      } finally {
        dispatch({ type: 'SET_CONNECTING', payload: false });
      }
    }, []),

    syncWithSAP: useCallback(async (productId) => {
      // Implementar sincronización con SAP
      console.log('Sync with SAP:', productId);
    }, []),

    connectToPromotions: useCallback(async (config) => {
      dispatch({ type: 'SET_CONNECTING', payload: true });
      try {
        // Simular conexión
        await new Promise(resolve => setTimeout(resolve, 1000));
        dispatch({ type: 'SET_PROMOTION_CONNECTION', payload: { 
          isConnected: true, 
          baseUrl: config.baseUrl, 
          token: config.token 
        }});
        return true;
      } catch (error) {
        return false;
      } finally {
        dispatch({ type: 'SET_CONNECTING', payload: false });
      }
    }, []),

    syncWithPromotions: useCallback(async () => {
      // Implementar sincronización con promociones
      console.log('Sync with promotions');
    }, []),

    // ===== EXPORTACIÓN Y PREVIEW =====
    generatePreview: useCallback(async (config) => {
      dispatch({ type: 'SET_EXPORTING', payload: true });
      try {
        // Simular generación de preview
        await new Promise(resolve => setTimeout(resolve, 1000));
        return 'data:image/png;base64,mockpreview';
      } finally {
        dispatch({ type: 'SET_EXPORTING', payload: false });
      }
    }, []),

    exportCanvas: useCallback(async (config) => {
      dispatch({ type: 'SET_EXPORTING', payload: true });
      try {
        // Simular exportación
        await new Promise(resolve => setTimeout(resolve, 2000));
        return new Blob(['mock export'], { type: 'image/png' });
      } finally {
        dispatch({ type: 'SET_EXPORTING', payload: false });
      }
    }, []),

    exportToPDF: useCallback(async (config) => {
      dispatch({ type: 'SET_EXPORTING', payload: true });
      try {
        // Simular exportación a PDF
        await new Promise(resolve => setTimeout(resolve, 2000));
        return new Blob(['mock pdf'], { type: 'application/pdf' });
      } finally {
        dispatch({ type: 'SET_EXPORTING', payload: false });
      }
    }, []),

    // ===== GESTIÓN DE ASSETS =====
    uploadImage: useCallback(async (file) => {
      // Implementar subida de imagen
      return 'mock-image-url';
    }, []),

    deleteImage: useCallback(async (url) => {
      // Implementar eliminación de imagen
      console.log('Delete image:', url);
    }, []),

    optimizeImage: useCallback(async (url, options) => {
      // Implementar optimización de imagen
      return 'optimized-image-url';
    }, []),

    // ===== GESTIÓN DE UI =====
    updateUIState: useCallback((updates: Partial<BuilderStateV3['ui']>) => {
      console.log('🔄 updateUIState called with:', updates);
      // Para cada propiedad actualizada, dispatch la acción correspondiente
      Object.entries(updates).forEach(([key, value]) => {
        console.log('🔄 Processing UI update:', key, '=', value);
        if (key.endsWith('Tab')) {
          // Determinar panel (activeLeftTab, activeRightTab, activeBottomTab)
          const panel = key.includes('Left') ? 'left' : 
                       key.includes('Right') ? 'right' : 'bottom';
          console.log('🔄 Dispatching SET_UI_TAB:', { panel, tab: value });
          dispatch({ type: 'SET_UI_TAB', payload: { panel, tab: value as string } });
        } else if (key.endsWith('PanelOpen')) {
          // Determinar panel (leftPanelOpen, rightPanelOpen, bottomPanelOpen)
          const panel = key.includes('left') ? 'left' : 
                       key.includes('right') ? 'right' : 'bottom';
          console.log('🔄 Dispatching TOGGLE_UI_PANEL:', { panel, open: value });
          dispatch({ type: 'TOGGLE_UI_PANEL', payload: { panel, open: value as boolean } });
        }
      });
    }, []),

    toggleUIPanel: useCallback((panel: 'left' | 'right' | 'bottom', open?: boolean) => {
      dispatch({ type: 'TOGGLE_UI_PANEL', payload: { panel, open } });
    }, []),

    setUITab: useCallback((panel: 'left' | 'right' | 'bottom', tab: string) => {
      dispatch({ type: 'SET_UI_TAB', payload: { panel, tab } });
    }, []),

    // ===== OPERACIONES DE CANVAS ADICIONALES =====
    setZoom: useCallback((zoom: number) => {
      dispatch({ type: 'SET_ZOOM', payload: zoom });
    }, []),

    toggleGrid: useCallback(() => {
      dispatch({ type: 'TOGGLE_GRID' });
    }, []),

    toggleRulers: useCallback(() => {
      dispatch({ type: 'TOGGLE_RULERS' });
    }, []),

    // ===== FUNCIONES ESPECIALES PARA SUPABASE =====
    setFamilyDirect: useCallback((family: FamilyV3) => {
      dispatch({ type: 'SET_FAMILY', payload: family });
    }, []),

    setTemplateDirect: useCallback((template: TemplateV3) => {
      dispatch({ type: 'SET_TEMPLATE_DIRECT', payload: template });
    }, []),

    setComponentsLibrary: useCallback((library: ComponentsLibraryV3) => {
      dispatch({ type: 'SET_COMPONENTS_LIBRARY', payload: library });
    }, [])
  };

  return { state, operations, families, templates, componentsLibrary: state.componentsLibrary };
}; 