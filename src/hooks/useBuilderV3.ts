// =====================================
// SPEED BUILDER V3 - MAIN HOOK
// =====================================

import { useState, useEffect, useCallback, useReducer } from 'react';
import { 
  BuilderStateV3, 
  BuilderOperationsV3, 
  UseBuilderV3Return,
  FamilyV3,
  TemplateV3,
  ComponentsLibraryV3,
  DraggableComponentV3,
  ComponentTypeV3,
  PositionV3,
  SizeV3,
  HistoryActionV3,
  FamilyTypeV3
} from '../types/builder-v3';
import { generateId } from '../utils/generateId';
import { toast } from 'react-hot-toast';

// =====================
// ESTADO INICIAL
// =====================

const createInitialState = (): BuilderStateV3 => ({
  currentFamily: undefined,
  currentTemplate: undefined,
  components: [],
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
  | { type: 'SET_COMPONENTS'; payload: DraggableComponentV3[] }
  | { type: 'ADD_COMPONENT'; payload: DraggableComponentV3 }
  | { type: 'UPDATE_COMPONENT'; payload: { id: string; updates: Partial<DraggableComponentV3> } }
  | { type: 'REMOVE_COMPONENT'; payload: string }
  | { type: 'SELECT_COMPONENTS'; payload: string[] }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'ADD_TO_HISTORY'; payload: HistoryActionV3 }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_SAP_CONNECTION'; payload: { isConnected: boolean; baseUrl?: string; token?: string } }
  | { type: 'SET_PROMOTION_CONNECTION'; payload: { isConnected: boolean; baseUrl?: string; token?: string } }
  | { type: 'SET_HAS_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'ADD_ERROR'; payload: { id: string; componentId?: string; type: 'error' | 'warning' | 'info'; message: string } }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'TOGGLE_UI_PANEL'; payload: { panel: 'left' | 'right' | 'bottom'; open?: boolean } }
  | { type: 'SET_UI_TAB'; payload: { panel: 'left' | 'right' | 'bottom'; tab: string } };

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
      return {
        ...state,
        components: state.components.map(component =>
          component.id === action.payload.id
            ? { ...component, ...action.payload.updates, updatedAt: new Date() }
            : component
        ),
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
      
      return {
        ...state,
        ui: {
          ...state.ui,
          [tabKey]: tab
        }
      };
    
    default:
      return state;
  }
};

// =====================
// DATOS MOCK (para desarrollo)
// =====================

const createMockFamilies = (): FamilyV3[] => [
  {
    id: 'family-hot-sale',
    name: 'Hot Sale',
    displayName: 'Hot Sale 2024',
    description: 'La mayor venta del año con descuentos increíbles',
    icon: '🔥',
    headerImage: '/images/headers/hot-sale.png',
    templates: [],
    featuredTemplates: [],
    defaultStyle: {
      brandColors: {
        primary: '#ff4444',
        secondary: '#ffaa00',
        accent: '#ff6600',
        text: '#333333',
        background: '#ffffff'
      },
      typography: {
        primaryFont: 'Inter',
        secondaryFont: 'Roboto',
        headerFont: 'Poppins'
      },
      visualEffects: {
        headerStyle: {
          typography: { fontSize: 48, fontWeight: 'bold' },
          color: { color: '#ffffff', backgroundColor: '#ff4444' }
        },
        priceStyle: {
          typography: { fontSize: 36, fontWeight: 'bold' },
          color: { color: '#ff4444' }
        },
        footerStyle: {
          typography: { fontSize: 12 },
          color: { color: '#666666' }
        }
      }
    },
    recommendedComponents: ['field-price-discount', 'field-discount-percentage', 'image-header'],
    migrationConfig: {
      allowMigrationFrom: ['Black Friday', 'Club Easy'],
      headerReplacement: {
        replaceHeaderImages: true,
        newHeaderImage: '/images/headers/hot-sale.png',
        replaceColors: true,
        newColors: {
          primary: '#ff4444',
          secondary: '#ffaa00',
          accent: '#ff6600',
          text: '#333333',
          background: '#ffffff'
        }
      }
    },
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'family-black-friday',
    name: 'Black Friday',
    displayName: 'Black Friday',
    description: 'Descuentos especiales de Black Friday',
    icon: '⚫',
    headerImage: '/images/headers/black-friday.png',
    templates: [],
    featuredTemplates: [],
    defaultStyle: {
      brandColors: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#ffaa00',
        text: '#ffffff',
        background: '#000000'
      },
      typography: {
        primaryFont: 'Inter',
        secondaryFont: 'Roboto',
        headerFont: 'Poppins'
      },
      visualEffects: {
        headerStyle: {
          typography: { fontSize: 48, fontWeight: 'bold' },
          color: { color: '#ffaa00', backgroundColor: '#000000' }
        },
        priceStyle: {
          typography: { fontSize: 36, fontWeight: 'bold' },
          color: { color: '#ffaa00' }
        },
        footerStyle: {
          typography: { fontSize: 12 },
          color: { color: '#cccccc' }
        }
      }
    },
    recommendedComponents: ['field-price-discount', 'field-discount-percentage', 'image-header'],
    migrationConfig: {
      allowMigrationFrom: ['Hot Sale', 'Club Easy'],
      headerReplacement: {
        replaceHeaderImages: true,
        newHeaderImage: '/images/headers/black-friday.png',
        replaceColors: true,
        newColors: {
          primary: '#000000',
          secondary: '#333333',
          accent: '#ffaa00',
          text: '#ffffff',
          background: '#000000'
        }
      }
    },
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const createMockComponentsLibrary = (): ComponentsLibraryV3 => ({
  'Header & Branding': [
    {
      type: 'image-header',
      name: 'Imagen de Header',
      description: 'Imagen promocional principal',
      icon: '🖼️',
      category: 'Header & Branding',
      defaultSize: { width: 400, height: 100, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'static' },
      tags: ['header', 'branding', 'image']
    },
    {
      type: 'image-brand-logo',
      name: 'Logo de Marca',
      description: 'Logo de la marca o empresa',
      icon: '🏷️',
      category: 'Header & Branding',
      defaultSize: { width: 150, height: 150, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'static' },
      tags: ['logo', 'brand', 'image']
    }
  ],
  'Product Information': [
    {
      type: 'field-product-name',
      name: 'Nombre del Producto',
      description: 'Nombre dinámico del producto desde SAP',
      icon: '📝',
      category: 'Product Information',
      defaultSize: { width: 300, height: 40, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['product', 'name', 'dynamic']
    },
    {
      type: 'field-product-description',
      name: 'Descripción del Producto',
      description: 'Descripción detallada del producto',
      icon: '📄',
      category: 'Product Information',
      defaultSize: { width: 400, height: 80, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['product', 'description', 'dynamic']
    },
    {
      type: 'field-product-sku',
      name: 'SKU del Producto',
      description: 'Código SKU del producto',
      icon: '#️⃣',
      category: 'Product Information',
      defaultSize: { width: 200, height: 25, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['product', 'sku', 'code']
    }
  ],
  'Pricing & Discounts': [
    {
      type: 'field-price-original',
      name: 'Precio Original',
      description: 'Precio original del producto',
      icon: '💰',
      category: 'Pricing & Discounts',
      defaultSize: { width: 100, height: 30, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['price', 'original', 'dynamic']
    },
    {
      type: 'field-price-discount',
      name: 'Precio con Descuento',
      description: 'Precio final con descuento aplicado',
      icon: '🏷️',
      category: 'Pricing & Discounts',
      defaultSize: { width: 120, height: 35, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['price', 'discount', 'final']
    },
    {
      type: 'field-discount-percentage',
      name: 'Porcentaje de Descuento',
      description: 'Porcentaje de descuento aplicado',
      icon: '📊',
      category: 'Pricing & Discounts',
      defaultSize: { width: 80, height: 30, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'promotion-data' },
      tags: ['discount', 'percentage', 'promotion']
    }
  ],
  'Financial Information': [
    {
      type: 'field-installments',
      name: 'Cuotas',
      description: 'Número de cuotas disponibles',
      icon: '💳',
      category: 'Financial Information',
      defaultSize: { width: 150, height: 30, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['financing', 'installments', 'payment']
    },
    {
      type: 'field-installment-value',
      name: 'Valor de Cuota',
      description: 'Valor de cada cuota',
      icon: '💵',
      category: 'Financial Information',
      defaultSize: { width: 120, height: 30, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['financing', 'installment', 'value']
    }
  ],
  'Images & Media': [
    {
      type: 'image-product',
      name: 'Imagen de Producto',
      description: 'Imagen principal del producto',
      icon: '📷',
      category: 'Images & Media',
      defaultSize: { width: 300, height: 300, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['image', 'product', 'photo']
    },
    {
      type: 'image-promotional',
      name: 'Imagen Promocional',
      description: 'Imagen decorativa promocional',
      icon: '🎨',
      category: 'Images & Media',
      defaultSize: { width: 200, height: 150, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'static' },
      tags: ['image', 'promotional', 'decoration']
    }
  ],
  'QR & Links': [
    {
      type: 'qr-product-info',
      name: 'QR Información del Producto',
      description: 'QR que enlaza a la página del producto',
      icon: '📱',
      category: 'QR & Links',
      defaultSize: { width: 100, height: 100, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'sap-product' },
      tags: ['qr', 'product', 'link']
    },
    {
      type: 'qr-promotion-link',
      name: 'QR Enlace Promocional',
      description: 'QR que enlaza a una promoción específica',
      icon: '🎯',
      category: 'QR & Links',
      defaultSize: { width: 100, height: 100, isProportional: true },
      defaultStyle: {},
      defaultContent: { fieldType: 'promotion-data' },
      tags: ['qr', 'promotion', 'link']
    }
  ],
  'Dates & Periods': [
    {
      type: 'field-date-from',
      name: 'Fecha de Inicio',
      description: 'Fecha de inicio de la promoción',
      icon: '📅',
      category: 'Dates & Periods',
      defaultSize: { width: 150, height: 25, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'promotion-data' },
      tags: ['date', 'start', 'promotion']
    },
    {
      type: 'field-date-to',
      name: 'Fecha de Fin',
      description: 'Fecha de fin de la promoción',
      icon: '🗓️',
      category: 'Dates & Periods',
      defaultSize: { width: 150, height: 25, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'promotion-data' },
      tags: ['date', 'end', 'promotion']
    }
  ],
  'Decorative Elements': [
    {
      type: 'shape-rectangle',
      name: 'Rectángulo',
      description: 'Forma rectangular decorativa',
      icon: '⬜',
      category: 'Decorative Elements',
      defaultSize: { width: 200, height: 100, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'static' },
      tags: ['shape', 'rectangle', 'decoration']
    },
    {
      type: 'divider-line',
      name: 'Línea Divisora',
      description: 'Línea para separar secciones',
      icon: '➖',
      category: 'Decorative Elements',
      defaultSize: { width: 300, height: 2, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'static' },
      tags: ['line', 'divider', 'separator']
    }
  ],
  'Containers & Layout': [
    {
      type: 'container-product-info',
      name: 'Contenedor de Producto',
      description: 'Contenedor para agrupar información del producto',
      icon: '📦',
      category: 'Containers & Layout',
      defaultSize: { width: 400, height: 200, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'static' },
      tags: ['container', 'product', 'group']
    },
    {
      type: 'container-price-block',
      name: 'Bloque de Precios',
      description: 'Contenedor para precios y descuentos',
      icon: '💰',
      category: 'Containers & Layout',
      defaultSize: { width: 300, height: 150, isProportional: false },
      defaultStyle: {},
      defaultContent: { fieldType: 'static' },
      tags: ['container', 'price', 'block']
    }
  ]
});

// =====================
// HOOK PRINCIPAL
// =====================

export const useBuilderV3 = (): UseBuilderV3Return => {
  const [state, dispatch] = useReducer(builderReducer, createInitialState());
  const [families] = useState<FamilyV3[]>(createMockFamilies());
  const [templates] = useState<TemplateV3[]>([]);
  const [componentsLibrary] = useState<ComponentsLibraryV3>(createMockComponentsLibrary());
  const [isReady, setIsReady] = useState(false);

  // =====================
  // INICIALIZACIÓN
  // =====================

  useEffect(() => {
    // Simular carga inicial
    setTimeout(() => {
      setIsReady(true);
    }, 1000);
  }, []);

  // =====================
  // OPERACIONES
  // =====================

  const operations: BuilderOperationsV3 = {
    // ===== GESTIÓN DE FAMILIAS =====
    loadFamily: useCallback(async (familyId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const family = families.find(f => f.id === familyId);
        if (!family) throw new Error('Familia no encontrada');
        
        dispatch({ type: 'SET_FAMILY', payload: family });
        return family;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, [families]),

    createFamily: useCallback(async (family) => {
      // Implementar creación de familia
      throw new Error('No implementado');
    }, []),

    updateFamily: useCallback(async (familyId, updates) => {
      // Implementar actualización de familia
      throw new Error('No implementado');
    }, []),

    deleteFamily: useCallback(async (familyId) => {
      // Implementar eliminación de familia
      throw new Error('No implementado');
    }, []),

    migrateFamily: useCallback(async (fromFamilyId, toFamilyId, options) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Simular migración
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('Migración completada');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, []),

    // ===== GESTIÓN DE PLANTILLAS =====
    loadTemplate: useCallback(async (templateId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Por ahora crear una plantilla mock
        const mockTemplate: TemplateV3 = {
          id: templateId,
          name: 'Plantilla Mock',
          familyType: state.currentFamily?.name || 'Hot Sale',
          description: 'Plantilla de ejemplo',
          thumbnail: '',
          tags: [],
          category: 'mock',
          canvas: {
            width: 1080,
            height: 1350,
            unit: 'px',
            dpi: 300,
            backgroundColor: '#ffffff'
          },
          defaultComponents: [],
          familyConfig: state.currentFamily?.defaultStyle || {
            brandColors: { primary: '#000000', secondary: '#666666', accent: '#0066cc', text: '#333333' },
            typography: { primaryFont: 'Inter', secondaryFont: 'Roboto', headerFont: 'Poppins' }
          },
          validationRules: [],
          exportSettings: {
            defaultFormat: 'png',
            defaultQuality: 90,
            defaultDPI: 300,
            bleedArea: 0,
            cropMarks: false
          },
          isPublic: false,
          isActive: true,
          version: 1,
          createdBy: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        dispatch({ type: 'SET_TEMPLATE', payload: mockTemplate });
        return mockTemplate;
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
      // Implementar actualización de plantilla
      throw new Error('No implementado');
    }, []),

    deleteTemplate: useCallback(async (templateId) => {
      // Implementar eliminación de plantilla
      throw new Error('No implementado');
    }, []),

    duplicateTemplate: useCallback(async (templateId, newName) => {
      // Implementar duplicación de plantilla
      throw new Error('No implementado');
    }, []),

    saveTemplate: useCallback(async () => {
      dispatch({ type: 'SET_SAVING', payload: true });
      try {
        // Simular guardado
        await new Promise(resolve => setTimeout(resolve, 1000));
        dispatch({ type: 'SET_HAS_UNSAVED_CHANGES', payload: false });
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    }, []),

    // ===== GESTIÓN DE COMPONENTES =====
    createComponent: useCallback((type: ComponentTypeV3, position: PositionV3) => {
      const component: DraggableComponentV3 = {
        id: generateId(),
        type,
        category: 'Product Information', // Determinar dinámicamente
        name: `Component ${type}`,
        description: '',
        icon: '📦',
        position,
        size: { width: 100, height: 50, isProportional: false },
        style: {
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
        },
        content: {
          fieldType: 'static',
          staticValue: 'Nuevo componente'
        },
        isVisible: true,
        isLocked: false,
        isDraggable: true,
        isResizable: true,
        isEditable: true,
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
      // Para cada propiedad actualizada, dispatch la acción correspondiente
      Object.entries(updates).forEach(([key, value]) => {
        if (key.endsWith('Tab')) {
          // Determinar panel (activeLeftTab, activeRightTab, activeBottomTab)
          const panel = key.includes('Left') ? 'left' : 
                       key.includes('Right') ? 'right' : 'bottom';
          dispatch({ type: 'SET_UI_TAB', payload: { panel, tab: value as string } });
        } else if (key.endsWith('PanelOpen')) {
          // Determinar panel (leftPanelOpen, rightPanelOpen, bottomPanelOpen)
          const panel = key.includes('left') ? 'left' : 
                       key.includes('right') ? 'right' : 'bottom';
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
      // Implementar toggle de grilla
      console.log('Toggle grid');
    }, []),

    toggleRulers: useCallback(() => {
      // Implementar toggle de reglas
      console.log('Toggle rulers');
    }, []),

    // ===== FUNCIONES ESPECIALES PARA SUPABASE =====
    setFamilyDirect: useCallback((family: FamilyV3) => {
      dispatch({ type: 'SET_FAMILY', payload: family });
    }, [])
  };

  return {
    state,
    operations,
    families,
    templates,
    componentsLibrary,
    isReady
  };
}; 