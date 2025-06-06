import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ====================================
// TIPOS Y INTERFACES
// ====================================

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  border?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
}

// Tipos específicos para cada elemento del cartel
export type ElementType = 
  | 'precio'
  | 'descuento' 
  | 'producto'
  | 'cuotas'
  | 'origen'
  | 'codigo'
  | 'fecha'
  | 'nota-legal'
  | 'imagen'
  | 'texto-libre'
  | 'logo';

export interface BaseElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  style: ElementStyle;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  createdAt: number;
  updatedAt: number;
}

// Elementos específicos con propiedades únicas
export interface PrecioElement extends BaseElement {
  type: 'precio';
  content: {
    precio: number;
    moneda: string;
    decimales: number;
    prefijo?: string;
    sufijo?: string;
  };
}

export interface DescuentoElement extends BaseElement {
  type: 'descuento';
  content: {
    porcentaje?: number;
    precioOriginal?: number;
    precioOferta?: number;
    tipoDescuento: 'porcentaje' | 'precio-fijo' | 'precio-tachado';
    etiqueta?: string;
  };
}

export interface ProductoElement extends BaseElement {
  type: 'producto';
  content: {
    nombre: string;
    marca?: string;
    descripcion?: string;
    categoria?: string;
  };
}

export interface CuotasElement extends BaseElement {
  type: 'cuotas';
  content: {
    numeroCuotas: number;
    valorCuota: number;
    interes: number;
    textoAdicional?: string;
  };
}

export interface OrigenElement extends BaseElement {
  type: 'origen';
  content: {
    pais: string;
    region?: string;
    certificacion?: string;
    icono?: string;
  };
}

export interface CodigoElement extends BaseElement {
  type: 'codigo';
  content: {
    codigo: string;
    tipo: 'barcode' | 'qr' | 'sku';
    mostrarCodigo: boolean;
  };
}

export interface FechaElement extends BaseElement {
  type: 'fecha';
  content: {
    fechaInicio?: Date;
    fechaFin?: Date;
    texto: string;
    formato: string;
  };
}

export interface NotaLegalElement extends BaseElement {
  type: 'nota-legal';
  content: {
    texto: string;
    tipoNota: 'condiciones' | 'restricciones' | 'garantia' | 'otros';
  };
}

export interface ImagenElement extends BaseElement {
  type: 'imagen';
  content: {
    src: string;
    alt: string;
    ajuste: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  };
}

export interface TextoLibreElement extends BaseElement {
  type: 'texto-libre';
  content: {
    texto: string;
    placeholder?: string;
  };
}

export interface LogoElement extends BaseElement {
  type: 'logo';
  content: {
    src: string;
    alt: string;
    empresa: string;
  };
}

// Union type para todos los elementos
export type CartelElement = 
  | PrecioElement 
  | DescuentoElement 
  | ProductoElement 
  | CuotasElement 
  | OrigenElement 
  | CodigoElement 
  | FechaElement 
  | NotaLegalElement 
  | ImagenElement 
  | TextoLibreElement 
  | LogoElement;

// Formatos de papel estándar
export interface PaperFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  unit: 'mm' | 'px' | 'cm';
}

export interface CanvasConfig {
  format: PaperFormat;
  zoom: number;
  showRulers: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  backgroundColor: string;
}

export interface HistoryState {
  elements: CartelElement[];
  canvasConfig: CanvasConfig;
  timestamp: number;
  description: string;
}

// Estado principal del builder
export interface BuilderState {
  // Elementos del cartel
  elements: CartelElement[];
  selectedElementIds: string[];
  
  // Configuración del canvas
  canvasConfig: CanvasConfig;
  
  // Estado de la interfaz
  currentTool: 'select' | 'pan' | 'zoom';
  isEditingText: boolean;
  isDragging: boolean;
  
  // Historial para undo/redo
  history: HistoryState[];
  historyIndex: number;
  maxHistorySize: number;
  
  // Templates y guardado
  currentTemplate: {
    id?: string;
    name: string;
    description?: string;
    tags: string[];
    isPublic: boolean;
  };
  
  // Estado de carga y errores
  isLoading: boolean;
  error: string | null;
  
  // Configuración de export
  exportConfig: {
    format: 'json' | 'pdf' | 'png' | 'jpg';
    quality: number;
    dpi: number;
  };
}

// ====================================
// FORMATOS DE PAPEL PREDEFINIDOS
// ====================================

export const DEFAULT_PAPER_FORMATS: PaperFormat[] = [
  {
    id: 'a4-portrait',
    name: 'A4 Vertical',
    width: 210,
    height: 297,
    orientation: 'portrait',
    unit: 'mm'
  },
  {
    id: 'a4-landscape',
    name: 'A4 Horizontal',
    width: 297,
    height: 210,
    orientation: 'landscape',
    unit: 'mm'
  },
  {
    id: 'a5-portrait',
    name: 'A5 Vertical',
    width: 148,
    height: 210,
    orientation: 'portrait',
    unit: 'mm'
  },
  {
    id: 'a5-landscape',
    name: 'A5 Horizontal',
    width: 210,
    height: 148,
    orientation: 'landscape',
    unit: 'mm'
  },
  {
    id: 'custom-small',
    name: 'Cartel Pequeño',
    width: 100,
    height: 150,
    orientation: 'portrait',
    unit: 'mm'
  },
  {
    id: 'custom-medium',
    name: 'Cartel Mediano',
    width: 150,
    height: 200,
    orientation: 'portrait',
    unit: 'mm'
  },
  {
    id: 'custom-large',
    name: 'Cartel Grande',
    width: 300,
    height: 400,
    orientation: 'portrait',
    unit: 'mm'
  }
];

// ====================================
// ESTADO INICIAL
// ====================================

const initialState: BuilderState = {
  elements: [],
  selectedElementIds: [],
  
  canvasConfig: {
    format: DEFAULT_PAPER_FORMATS[0], // A4 Vertical por defecto
    zoom: 1,
    showRulers: true,
    showGrid: true,
    snapToGrid: true,
    gridSize: 10,
    backgroundColor: '#ffffff'
  },
  
  currentTool: 'select',
  isEditingText: false,
  isDragging: false,
  
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  
  currentTemplate: {
    name: 'Nuevo Cartel',
    description: '',
    tags: [],
    isPublic: false
  },
  
  isLoading: false,
  error: null,
  
  exportConfig: {
    format: 'json',
    quality: 100,
    dpi: 300
  }
};

// ====================================
// SLICE DE REDUX
// ====================================

const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    // ====================================
    // ELEMENTOS - CRUD Operations
    // ====================================
    
    addElement: (state, action: PayloadAction<CartelElement>) => {
      state.elements.push(action.payload);
      state.selectedElementIds = [action.payload.id];
      builderSlice.caseReducers.saveToHistory(state, { 
        payload: 'Elemento añadido', 
        type: 'builder/saveToHistory' 
      });
    },
    
    updateElement: (state, action: PayloadAction<{ id: string; updates: Partial<CartelElement> }>) => {
      const { id, updates } = action.payload;
      const elementIndex = state.elements.findIndex(el => el.id === id);
      
      if (elementIndex !== -1) {
        const currentElement = state.elements[elementIndex];
        state.elements[elementIndex] = {
          ...currentElement,
          ...updates,
          id: currentElement.id,
          type: currentElement.type,
          updatedAt: Date.now()
        } as CartelElement;
      }
    },
    
    removeElement: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.elements = state.elements.filter(el => el.id !== id);
      state.selectedElementIds = state.selectedElementIds.filter(selectedId => selectedId !== id);
      builderSlice.caseReducers.saveToHistory(state, { 
        payload: 'Elemento eliminado', 
        type: 'builder/saveToHistory' 
      });
    },
    
    duplicateElement: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const element = state.elements.find(el => el.id === id);
      
      if (element) {
        const duplicatedElement: CartelElement = {
          ...element,
          id: `${element.id}_copy_${Date.now()}`,
          position: {
            x: element.position.x + 20,
            y: element.position.y + 20
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        state.elements.push(duplicatedElement);
        state.selectedElementIds = [duplicatedElement.id];
        builderSlice.caseReducers.saveToHistory(state, { 
          payload: 'Elemento duplicado', 
          type: 'builder/saveToHistory' 
        });
      }
    },
    
    // ====================================
    // SELECCIÓN DE ELEMENTOS
    // ====================================
    
    selectElement: (state, action: PayloadAction<string>) => {
      state.selectedElementIds = [action.payload];
    },
    
    selectMultipleElements: (state, action: PayloadAction<string[]>) => {
      state.selectedElementIds = action.payload;
    },
    
    toggleElementSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const isSelected = state.selectedElementIds.includes(id);
      
      if (isSelected) {
        state.selectedElementIds = state.selectedElementIds.filter(selectedId => selectedId !== id);
      } else {
        state.selectedElementIds.push(id);
      }
    },
    
    clearSelection: (state) => {
      state.selectedElementIds = [];
    },
    
    // ====================================
    // POSICIONAMIENTO Y TRANSFORMACIONES
    // ====================================
    
    moveElement: (state, action: PayloadAction<{ id: string; position: Position }>) => {
      const { id, position } = action.payload;
      const elementIndex = state.elements.findIndex(el => el.id === id);
      
      if (elementIndex !== -1) {
        // Aplicar snap to grid si está habilitado
        let finalPosition = position;
        if (state.canvasConfig.snapToGrid) {
          const gridSize = state.canvasConfig.gridSize;
          finalPosition = {
            x: Math.round(position.x / gridSize) * gridSize,
            y: Math.round(position.y / gridSize) * gridSize
          };
        }
        
        state.elements[elementIndex].position = finalPosition;
        state.elements[elementIndex].updatedAt = Date.now();
      }
    },
    
    resizeElement: (state, action: PayloadAction<{ id: string; size: Size }>) => {
      const { id, size } = action.payload;
      const elementIndex = state.elements.findIndex(el => el.id === id);
      
      if (elementIndex !== -1) {
        state.elements[elementIndex].size = size;
        state.elements[elementIndex].updatedAt = Date.now();
      }
    },
    
    moveElementToFront: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const element = state.elements.find(el => el.id === id);
      
      if (element) {
        const maxZIndex = Math.max(...state.elements.map(el => el.zIndex), 0);
        element.zIndex = maxZIndex + 1;
        element.updatedAt = Date.now();
      }
    },
    
    moveElementToBack: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const element = state.elements.find(el => el.id === id);
      
      if (element) {
        const minZIndex = Math.min(...state.elements.map(el => el.zIndex), 0);
        element.zIndex = minZIndex - 1;
        element.updatedAt = Date.now();
      }
    },
    
    // ====================================
    // CONFIGURACIÓN DEL CANVAS
    // ====================================
    
    setCanvasFormat: (state, action: PayloadAction<PaperFormat>) => {
      state.canvasConfig.format = action.payload;
      builderSlice.caseReducers.saveToHistory(state, { 
        payload: 'Formato de canvas cambiado', 
        type: 'builder/saveToHistory' 
      });
    },
    
    setZoom: (state, action: PayloadAction<number>) => {
      // Limitar zoom entre 0.1x y 5x
      state.canvasConfig.zoom = Math.min(Math.max(action.payload, 0.1), 5);
    },
    
    toggleRulers: (state) => {
      state.canvasConfig.showRulers = !state.canvasConfig.showRulers;
    },
    
    toggleGrid: (state) => {
      state.canvasConfig.showGrid = !state.canvasConfig.showGrid;
    },
    
    toggleSnapToGrid: (state) => {
      state.canvasConfig.snapToGrid = !state.canvasConfig.snapToGrid;
    },
    
    setGridSize: (state, action: PayloadAction<number>) => {
      state.canvasConfig.gridSize = Math.max(action.payload, 1);
    },
    
    setBackgroundColor: (state, action: PayloadAction<string>) => {
      state.canvasConfig.backgroundColor = action.payload;
    },
    
    // ====================================
    // HERRAMIENTAS Y ESTADO DE UI
    // ====================================
    
    setCurrentTool: (state, action: PayloadAction<'select' | 'pan' | 'zoom'>) => {
      state.currentTool = action.payload;
    },
    
    setIsEditingText: (state, action: PayloadAction<boolean>) => {
      state.isEditingText = action.payload;
    },
    
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },
    
    // ====================================
    // HISTORIAL Y UNDO/REDO
    // ====================================
    
    saveToHistory: (state, action: PayloadAction<string>) => {
      const description = action.payload;
      const historyState: HistoryState = {
        elements: JSON.parse(JSON.stringify(state.elements)),
        canvasConfig: JSON.parse(JSON.stringify(state.canvasConfig)),
        timestamp: Date.now(),
        description
      };
      
      // Eliminar estados futuros si estamos en el medio del historial
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
      
      // Añadir nuevo estado al historial
      state.history.push(historyState);
      state.historyIndex = state.history.length - 1;
      
      // Limitar tamaño del historial
      if (state.history.length > state.maxHistorySize) {
        state.history = state.history.slice(-state.maxHistorySize);
        state.historyIndex = state.history.length - 1;
      }
    },
    
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        const historyState = state.history[state.historyIndex];
        state.elements = historyState.elements;
        state.canvasConfig = historyState.canvasConfig;
        state.selectedElementIds = [];
      }
    },
    
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const historyState = state.history[state.historyIndex];
        state.elements = historyState.elements;
        state.canvasConfig = historyState.canvasConfig;
        state.selectedElementIds = [];
      }
    },
    
    clearHistory: (state) => {
      state.history = [];
      state.historyIndex = -1;
    },
    
    // ====================================
    // TEMPLATES Y GUARDADO
    // ====================================
    
    setTemplateName: (state, action: PayloadAction<string>) => {
      state.currentTemplate.name = action.payload;
    },
    
    setTemplateDescription: (state, action: PayloadAction<string>) => {
      state.currentTemplate.description = action.payload;
    },
    
    setTemplateTags: (state, action: PayloadAction<string[]>) => {
      state.currentTemplate.tags = action.payload;
    },
    
    setTemplatePublic: (state, action: PayloadAction<boolean>) => {
      state.currentTemplate.isPublic = action.payload;
    },
    
    loadTemplate: (state, action: PayloadAction<{ elements: CartelElement[]; canvasConfig: CanvasConfig; templateInfo: any }>) => {
      const { elements, canvasConfig, templateInfo } = action.payload;
      state.elements = elements;
      state.canvasConfig = canvasConfig;
      state.currentTemplate = {
        ...templateInfo,
        tags: templateInfo.tags || []
      };
      state.selectedElementIds = [];
      builderSlice.caseReducers.saveToHistory(state, { 
        payload: 'Template cargado', 
        type: 'builder/saveToHistory' 
      });
    },
    
    clearCanvas: (state) => {
      state.elements = [];
      state.selectedElementIds = [];
      state.currentTemplate = {
        name: 'Nuevo Cartel',
        description: '',
        tags: [],
        isPublic: false
      };
      builderSlice.caseReducers.saveToHistory(state, { 
        payload: 'Canvas limpiado', 
        type: 'builder/saveToHistory' 
      });
    },
    
    // ====================================
    // CONFIGURACIÓN DE EXPORTACIÓN
    // ====================================
    
    setExportFormat: (state, action: PayloadAction<'json' | 'pdf' | 'png' | 'jpg'>) => {
      state.exportConfig.format = action.payload;
    },
    
    setExportQuality: (state, action: PayloadAction<number>) => {
      state.exportConfig.quality = Math.min(Math.max(action.payload, 1), 100);
    },
    
    setExportDPI: (state, action: PayloadAction<number>) => {
      state.exportConfig.dpi = Math.max(action.payload, 72);
    },
    
    // ====================================
    // ESTADO DE CARGA Y ERRORES
    // ====================================
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  }
});

// ====================================
// EXPORTS
// ====================================

export const {
  // Elementos
  addElement,
  updateElement,
  removeElement,
  duplicateElement,
  
  // Selección
  selectElement,
  selectMultipleElements,
  toggleElementSelection,
  clearSelection,
  
  // Transformaciones
  moveElement,
  resizeElement,
  moveElementToFront,
  moveElementToBack,
  
  // Canvas
  setCanvasFormat,
  setZoom,
  toggleRulers,
  toggleGrid,
  toggleSnapToGrid,
  setGridSize,
  setBackgroundColor,
  
  // UI
  setCurrentTool,
  setIsEditingText,
  setIsDragging,
  
  // Historial
  saveToHistory,
  undo,
  redo,
  clearHistory,
  
  // Templates
  setTemplateName,
  setTemplateDescription,
  setTemplateTags,
  setTemplatePublic,
  loadTemplate,
  clearCanvas,
  
  // Export
  setExportFormat,
  setExportQuality,
  setExportDPI,
  
  // Estado
  setLoading,
  setError,
  clearError
} = builderSlice.actions;

export default builderSlice.reducer;

// ====================================
// SELECTORES
// ====================================

export const selectElements = (state: { builder: BuilderState }) => state.builder.elements;
export const selectSelectedElements = (state: { builder: BuilderState }) => {
  return state.builder.elements.filter(el => state.builder.selectedElementIds.includes(el.id));
};
export const selectCanvasConfig = (state: { builder: BuilderState }) => state.builder.canvasConfig;
export const selectCurrentTool = (state: { builder: BuilderState }) => state.builder.currentTool;
export const selectIsEditingText = (state: { builder: BuilderState }) => state.builder.isEditingText;
export const selectIsDragging = (state: { builder: BuilderState }) => state.builder.isDragging;
export const selectCanUndo = (state: { builder: BuilderState }) => state.builder.historyIndex > 0;
export const selectCanRedo = (state: { builder: BuilderState }) => state.builder.historyIndex < state.builder.history.length - 1;
export const selectCurrentTemplate = (state: { builder: BuilderState }) => state.builder.currentTemplate;
export const selectIsLoading = (state: { builder: BuilderState }) => state.builder.isLoading;
export const selectError = (state: { builder: BuilderState }) => state.builder.error; 