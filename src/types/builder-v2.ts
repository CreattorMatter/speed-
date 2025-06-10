// =====================================
// SPEED BUILDER V2 - TYPE DEFINITIONS
// =====================================

// Familias de promoción disponibles
export type FamilyType = 
  | 'Superprecio'
  | 'Feria de descuentos'
  | 'Financiación'
  | 'Troncales'
  | 'Nuevo'
  | 'Temporada'
  | 'Oportuneasy'
  | 'Precios que la rompen'
  | 'Ladrillazos'
  | 'Herramientas'
  | 'Club Easy'
  | 'Cencopay'
  | 'Mundo Experto'
  | 'Constructor'
  | 'Fleje Promocional'
  | 'Imágenes personalizadas';

// Plantillas detalladas disponibles
export type TemplateType = 
  | 'Precio Lleno'
  | 'Antes/Ahora con dto'
  | 'Antes/Ahora'
  | 'Flooring'
  | 'Antes/Ahora Flooring'
  | 'Flooring en cuotas'
  | 'Antes/Ahora en cuotas'
  | 'Combo'
  | 'Combo Cuotas'
  | 'Promo 3x2 con precio'
  | 'Promo 3x2 plano categoría'
  | 'Promo 3x2 plano categoría combinable'
  | 'Descuento plano categoría'
  | 'Descuento en la segunda unidad'
  | 'Cuotas'
  | 'Antes/Ahora en cuotas con descuento'
  | 'Antes/Ahora Flooring con descuento'
  | 'Flooring antes/ahora en cuotas'
  | 'Combo con Descuento'
  | 'Combo Cuotas con Descuento'
  | 'Precio Lleno sin mensaje'
  | 'Fleje promocional (SPID+)'
  | 'Cuota simple 12 s/int'
  | 'Cuota simple 12 Antes/Ahora s/int c/desc'
  | 'Imágenes personalizadas';

// Categorías de elementos arrastrables
export type DraggableElementCategory = 
  | 'Header'
  | 'SKU'
  | 'Descripción'
  | 'Footer'
  | 'Descuento'
  | 'Fechas'
  | 'Precio'
  | 'Finanzas'
  | 'QR';

// Elementos arrastrables específicos
export type DraggableElementType = 
  // Header
  | 'header-imagen'
  // SKU
  | 'sku-sap'
  | 'rubro-grupo-articulos'
  | 'sub-rubro-grupo-articulos'
  | 'ean-sku'
  // Descripción
  | 'descripcion-producto'
  | 'descripcion-combo'
  | 'descripcion-texto-variable'
  // Footer
  | 'origen'
  | 'texto-no-acumulable'
  // Descuento
  | 'porcentaje-descuento'
  | 'porcentaje-descuento-segunda-unidad'
  | 'porcentaje-descuento-especial'
  // Fechas
  | 'fecha-desde'
  | 'fecha-hasta'
  // Precio
  | 'precio-contado'
  | 'precio-sin-impuestos-nacionales'
  | 'precio-con-descuento'
  | 'precio-ahora-contado'
  | 'precio-regular-m2'
  | 'precio-regular-caja'
  | 'precio-ahora-contado-m2'
  | 'precio-ahora-contado-caja'
  | 'precio-antes-regular-m2'
  | 'precio-antes-regular-caja'
  | 'precio-combo'
  | 'precio-combo-descuento'
  | 'precio-unidad-promo'
  | 'precio-unidad-combo-promo'
  | 'precio-segunda-unidad'
  | 'precio-antes'
  // Finanzas
  | 'cuotas'
  | 'valor-cuota'
  | 'precio-financiado-cft'
  // QR
  | 'informacion-qr';

// Posición y tamaño de elementos
export interface ElementPosition {
  x: number;
  y: number;
  z: number; // para z-index
}

export interface ElementSize {
  width: number;
  height: number;
}

// Estilo visual de elementos
export interface ElementStyle {
  // Texto
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  
  // Colores
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  
  // Bordes y espaciado
  borderWidth?: number;
  borderRadius?: number;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // Efectos
  opacity?: number;
  shadow?: boolean;
  gradient?: {
    from: string;
    to: string;
    direction: 'horizontal' | 'vertical' | 'diagonal';
  };
}

// Contenido específico del elemento
export interface ElementContent {
  // Texto dinámico
  text?: string;
  placeholder?: string;
  
  // Imagen
  imageUrl?: string;
  imageAlt?: string;
  
  // Datos específicos del retail
  sku?: string;
  price?: number;
  currency?: string;
  discount?: number;
  
  // Fechas
  dateFrom?: Date;
  dateTo?: Date;
  
  // Información QR
  qrUrl?: string;
  qrData?: string;
  
  // Finanzas
  installments?: number;
  installmentValue?: number;
  cft?: number;
  tea?: number;
  tna?: number;
  
  // Flags de estado
  isEditable?: boolean;
  isRequired?: boolean;
  isLocked?: boolean;
}

// Validaciones para elementos
export interface ElementValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean | string;
}

// Elemento arrastrable completo
export interface DraggableElement {
  id: string;
  type: DraggableElementType;
  category: DraggableElementCategory;
  
  // Propiedades visuales
  position: ElementPosition;
  size: ElementSize;
  style: ElementStyle;
  content: ElementContent;
  
  // Metadatos
  name: string;
  description: string;
  icon?: string;
  
  // Comportamiento
  isVisible: boolean;
  isLocked: boolean;
  isDraggable: boolean;
  isResizable: boolean;
  
  // Validaciones
  validation?: ElementValidation;
  
  // Relaciones con otros elementos
  parentId?: string;
  childrenIds?: string[];
  
  // Historial y versiones
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Configuración de plantilla
export interface TemplateConfig {
  id: string;
  name: string;
  type: TemplateType;
  familyType: FamilyType;
  
  // Descripción y metadatos
  description: string;
  tags: string[];
  category: string;
  
  // Dimensiones del canvas
  canvasSize: {
    width: number;
    height: number;
    unit: 'px' | 'mm' | 'cm' | 'in';
  };
  
  // Elementos por defecto
  defaultElements: DraggableElement[];
  
  // Restricciones y reglas
  allowedElements: DraggableElementType[];
  requiredElements: DraggableElementType[];
  maxElements?: number;
  
  // Configuración visual
  backgroundImage?: string;
  backgroundColor?: string;
  border?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  
  // Metadatos de autoría
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  isPublic: boolean;
  isActive: boolean;
}

// Configuración de familia
export interface FamilyConfig {
  id: string;
  name: FamilyType;
  
  // Información visual
  displayName: string;
  description: string;
  color: string;
  icon: string;
  headerImage?: string;
  
  // Plantillas disponibles
  compatibleTemplates: TemplateType[];
  featuredTemplates: TemplateType[];
  
  // Elementos recomendados por familia
  recommendedElements: DraggableElementType[];
  excludedElements?: DraggableElementType[];
  
  // Configuración de branding
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Patrones visuales específicos
  visualPatterns: {
    headerStyle: ElementStyle;
    priceStyle: ElementStyle;
    footerStyle: ElementStyle;
  };
  
  // Metadatos
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Estado del canvas
export interface CanvasState {
  // Zoom y vista
  zoom: number;
  panX: number;
  panY: number;
  
  // Herramientas activas
  activeTool: 'select' | 'pan' | 'zoom' | 'text' | 'image';
  selectedElementIds: string[];
  
  // Configuración visual
  showGrid: boolean;
  showRulers: boolean;
  showGuides: boolean;
  snapToGrid: boolean;
  snapToGuides: boolean;
  
  // Historia de cambios
  canUndo: boolean;
  canRedo: boolean;
  historyIndex: number;
}

// Historial de acciones para undo/redo
export interface HistoryAction {
  id: string;
  type: 'add' | 'remove' | 'move' | 'resize' | 'style' | 'content';
  elementId: string;
  previousState?: Partial<DraggableElement>;
  newState?: Partial<DraggableElement>;
  timestamp: Date;
}

// Estado completo del Builder
export interface BuilderState {
  // Configuración actual
  currentFamily?: FamilyConfig;
  currentTemplate?: TemplateConfig;
  
  // Elementos en el canvas
  elements: DraggableElement[];
  
  // Estado del canvas
  canvas: CanvasState;
  
  // Historial
  history: HistoryAction[];
  
  // Configuración de exportación
  exportConfig: {
    format: 'png' | 'jpg' | 'pdf' | 'svg';
    quality: number;
    resolution: number;
    includeBleed: boolean;
  };
  
  // Estados de UI
  isLoading: boolean;
  isSaving: boolean;
  isExporting: boolean;
  hasUnsavedChanges: boolean;
  
  // Errores y validaciones
  errors: Array<{
    elementId?: string;
    message: string;
    type: 'warning' | 'error';
  }>;
}

// Operaciones disponibles en el Builder
export interface BuilderOperations {
  // Gestión de familias y plantillas
  loadFamily: (familyId: string) => Promise<FamilyConfig>;
  loadTemplate: (templateId: string) => Promise<TemplateConfig>;
  saveTemplate: (template: TemplateConfig) => Promise<void>;
  duplicateTemplate: (templateId: string, newName?: string) => Promise<TemplateConfig>;
  
  // Gestión de elementos
  createElement: (type: DraggableElementType, position: ElementPosition) => DraggableElement;
  addElement: (element: DraggableElement) => void;
  removeElement: (elementId: string) => void;
  updateElement: (elementId: string, updates: Partial<DraggableElement>) => void;
  duplicateElement: (elementId: string) => DraggableElement;
  
  // Operaciones de canvas
  moveElements: (elementIds: string[], deltaX: number, deltaY: number) => void;
  resizeElement: (elementId: string, newSize: ElementSize) => void;
  alignElements: (elementIds: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeElements: (elementIds: string[], distribution: 'horizontal' | 'vertical') => void;
  
  // Historial
  undo: () => void;
  redo: () => void;
  addToHistory: (action: HistoryAction) => void;
  
  // Validación
  validateTemplate: () => Array<{ elementId?: string; message: string; type: 'warning' | 'error' }>;
  
  // Exportación
  exportCanvas: (config: BuilderState['exportConfig']) => Promise<Blob>;
  generatePreview: () => Promise<string>;
}

// Configuración de elementos arrastrables por categoría
export type DraggableElementsConfig = {
  [K in DraggableElementCategory]: Array<{
    type: DraggableElementType;
    name: string;
    description: string;
    icon: string;
    defaultSize: ElementSize;
    defaultStyle: ElementStyle;
    category: K;
  }>;
};

// Hook para el estado del Builder
export interface UseBuilderReturn {
  state: BuilderState;
  operations: BuilderOperations;
  families: FamilyConfig[];
  templates: TemplateConfig[];
  draggableElements: DraggableElementsConfig;
} 