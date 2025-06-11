// =====================================
// SPEED BUILDER V3 - TYPE DEFINITIONS
// =====================================

// =====================
// FAMILIAS PROMOCIONALES AVANZADAS
// =====================

export type FamilyTypeV3 = 
  | 'Hot Sale'
  | 'Black Friday'
  | 'Cyber Monday'
  | 'Club Easy'
  | 'Easy Week'
  | 'Superprecio'
  | 'Feria de descuentos'
  | 'Ladrillazos'
  | 'Financiación'
  | 'Troncales'
  | 'Nuevo'
  | 'Temporada'
  | 'Oportuneasy'
  | 'Precios que la rompen'
  | 'Herramientas'
  | 'Cencopay'
  | 'Mundo Experto'
  | 'Constructor'
  | 'Fleje Promocional'
  | 'Custom';

// =====================
// COMPONENTES ARRASTRABLES AVANZADOS
// =====================

export type ComponentTypeV3 = 
  // Texto personalizable
  | 'text-custom'
  | 'text-editable'
  | 'text-dynamic'
  
  // Campos dinámicos de producto
  | 'field-product-name'
  | 'field-product-description'
  | 'field-product-sku'
  | 'field-product-brand'
  | 'field-product-category'
  | 'field-product-origin'
  
  // Precios y descuentos dinámicos
  | 'field-price-original'
  | 'field-price-discount'
  | 'field-price-final'
  | 'field-discount-percentage'
  | 'field-discount-amount'
  | 'field-price-per-unit'
  | 'field-price-per-m2'
  | 'field-price-combo'
  
  // Campos financieros avanzados
  | 'field-installments'
  | 'field-installment-value'
  | 'field-financed-price'
  | 'field-cft'
  | 'field-tea'
  | 'field-tna'
  | 'field-financing-terms'
  
  // Imágenes personalizadas
  | 'image-header'
  | 'image-promotional'
  | 'image-product'
  | 'image-brand-logo'
  | 'image-background'
  | 'image-decoration'
  
  // QR Codes dinámicos
  | 'qr-product-info'
  | 'qr-promotion-link'
  | 'qr-custom-url'
  | 'qr-payment-link'
  
  // Fechas y períodos
  | 'field-date-from'
  | 'field-date-to'
  | 'field-promotion-period'
  | 'field-expiry-date'
  
  // Elementos decorativos
  | 'shape-rectangle'
  | 'shape-circle'
  | 'shape-polygon'
  | 'divider-line'
  | 'icon-custom'
  
  // Contenedores agrupadores
  | 'container-header'
  | 'container-product-info'
  | 'container-price-block'
  | 'container-footer';

// =====================
// CATEGORÍAS DE COMPONENTES
// =====================

export type ComponentCategoryV3 = 
  | 'Header & Branding'
  | 'Product Information'
  | 'Pricing & Discounts'
  | 'Financial Information'
  | 'Images & Media'
  | 'QR & Links'
  | 'Dates & Periods'
  | 'Decorative Elements'
  | 'Containers & Layout';

// =====================
// POSICIÓN Y TRANSFORMACIONES AVANZADAS
// =====================

export interface PositionV3 {
  x: number;
  y: number;
  z: number; // z-index para capas
  rotation: number; // rotación en grados
  scaleX: number; // escala horizontal
  scaleY: number; // escala vertical
}

export interface SizeV3 {
  width: number;
  height: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number; // para mantener proporción
  isProportional: boolean; // redimensionar manteniendo proporción
}

// =====================
// ESTILOS AVANZADOS
// =====================

export interface TypographyStyleV3 {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic' | 'oblique';
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textDecoration: 'none' | 'underline' | 'line-through' | 'overline';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow?: {
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    color: string;
  };
}

export interface ColorStyleV3 {
  color: string;
  backgroundColor: string;
  backgroundImage?: string;
  backgroundGradient?: {
    type: 'linear' | 'radial' | 'conic';
    direction: number; // en grados
    stops: Array<{
      color: string;
      position: number; // 0-100%
    }>;
  };
}

export interface BorderStyleV3 {
  width: number;
  style: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  color: string;
  radius: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
}

export interface SpacingStyleV3 {
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface EffectsStyleV3 {
  opacity: number;
  boxShadow?: Array<{
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    spreadRadius: number;
    color: string;
    inset: boolean;
  }>;
  filter?: {
    blur: number;
    brightness: number;
    contrast: number;
    saturate: number;
    hueRotate: number;
    sepia: number;
    grayscale: number;
  };
  transform?: {
    translateX: number;
    translateY: number;
    rotate: number;
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
  };
}

export interface StyleV3 {
  typography: TypographyStyleV3;
  color: ColorStyleV3;
  border: BorderStyleV3;
  spacing: SpacingStyleV3;
  effects: EffectsStyleV3;
}

// =====================
// CONTENIDO DINÁMICO AVANZADO
// =====================

export interface DynamicContentV3 {
  // Tipo de campo dinámico
  fieldType: 'static' | 'sap-product' | 'promotion-data' | 'custom-formula' | 'user-input';
  
  // Configuración de conexión con SAP
  sapConnection?: {
    productId?: string;
    fieldName: string;
    formatters?: Array<{
      type: 'currency' | 'percentage' | 'date' | 'number' | 'text';
      options?: any;
    }>;
  };
  
  // Configuración de promociones
  promotionConnection?: {
    promotionId?: string;
    fieldName: string;
    fallbackValue?: string;
  };
  
  // Fórmulas personalizadas
  customFormula?: {
    expression: string; // ej: "{{price}} * (1 - {{discount}} / 100)"
    dependencies: string[]; // campos de los que depende
  };
  
  // Valor estático o por defecto
  staticValue?: string;
  text?: string;
  
  // Contenido de imágenes
  imageUrl?: string;
  imageAlt?: string;
  
  // Contenido QR
  qrUrl?: string;
  qrData?: string;
  
  // Formato de salida
  outputFormat?: {
    type: 'currency' | 'percentage' | 'date' | 'number' | 'text';
    locale?: string;
    currency?: string;
    decimals?: number;
    prefix?: string;
    suffix?: string;
  };
  
  // Validaciones
  validation?: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customValidator?: string; // función como string
  };
}

// =====================
// COMPONENTE ARRASTRABLE AVANZADO
// =====================

export interface DraggableComponentV3 {
  id: string;
  type: ComponentTypeV3;
  category: ComponentCategoryV3;
  
  // Información básica
  name: string;
  description: string;
  icon: string;
  
  // Propiedades físicas
  position: PositionV3;
  size: SizeV3;
  style: StyleV3;
  
  // Contenido dinámico
  content: DynamicContentV3;
  
  // Estado y comportamiento
  isVisible: boolean;
  isLocked: boolean;
  isDraggable: boolean;
  isResizable: boolean;
  isEditable: boolean;
  
  // Jerarquía y agrupación
  parentId?: string;
  childrenIds: string[];
  groupId?: string;
  
  // Restricciones de posicionamiento
  constraints?: {
    x?: { min: number; max: number };
    y?: { min: number; max: number };
    snapToGrid: boolean;
    snapToGuides: boolean;
    magneticEdges: boolean;
  };
  
  // Metadatos
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
  createdBy: string;
}

// =====================
// PLANTILLAS AVANZADAS
// =====================

export interface TemplateV3 {
  id: string;
  name: string;
  familyType: FamilyTypeV3;
  
  // Metadatos
  description: string;
  thumbnail: string;
  tags: string[];
  category: string;
  
  // Configuración del canvas
  canvas: {
    width: number;
    height: number;
    unit: 'px' | 'mm' | 'cm' | 'in';
    dpi: number;
    backgroundColor: string;
    backgroundImage?: string;
  };
  
  // Componentes por defecto
  defaultComponents: DraggableComponentV3[];
  
  // Configuración de la familia
  familyConfig: {
    headerImage?: string;
    brandColors: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
    };
    typography: {
      primaryFont: string;
      secondaryFont: string;
      headerFont: string;
    };
  };
  
  // Reglas de validación
  validationRules: Array<{
    id: string;
    type: 'required-component' | 'max-components' | 'position-constraint' | 'size-constraint' | 'custom';
    componentType?: ComponentTypeV3;
    constraint?: any;
    message: string;
  }>;
  
  // Configuración de exportación
  exportSettings: {
    defaultFormat: 'png' | 'jpg' | 'pdf' | 'svg';
    defaultQuality: number;
    defaultDPI: number;
    bleedArea: number;
    cropMarks: boolean;
  };
  
  // Metadatos de autoría
  isPublic: boolean;
  isActive: boolean;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

// =====================
// FAMILIAS PROMOCIONALES AVANZADAS
// =====================

export interface FamilyV3 {
  id: string;
  name: FamilyTypeV3;
  
  // Información visual
  displayName: string;
  description: string;
  icon: string;
  headerImage: string;
  
  // Plantillas disponibles
  templates: TemplateV3[];
  featuredTemplates: string[]; // IDs de plantillas destacadas
  
  // Configuración visual por defecto
  defaultStyle: {
    brandColors: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      background: string;
    };
    typography: {
      primaryFont: string;
      secondaryFont: string;
      headerFont: string;
    };
    visualEffects: {
      headerStyle: Partial<StyleV3>;
      priceStyle: Partial<StyleV3>;
      footerStyle: Partial<StyleV3>;
    };
  };
  
  // Componentes recomendados
  recommendedComponents: ComponentTypeV3[];
  excludedComponents?: ComponentTypeV3[];
  
  // Configuración de migración
  migrationConfig: {
    allowMigrationFrom: FamilyTypeV3[];
    headerReplacement: {
      replaceHeaderImages: boolean;
      newHeaderImage?: string;
      replaceColors: boolean;
      newColors?: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        background: string;
      };
    };
  };
  
  // Metadatos
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// =====================
// ESTADO DEL CANVAS AVANZADO
// =====================

export interface CanvasStateV3 {
  // Vista y navegación
  zoom: number;
  minZoom: number;
  maxZoom: number;
  panX: number;
  panY: number;
  
  // Herramientas activas
  activeTool: 'select' | 'pan' | 'zoom' | 'text' | 'image' | 'shape' | 'eyedropper' | 'ruler';
  selectedComponentIds: string[];
  
  // Configuración visual del canvas
  showGrid: boolean;
  gridSize: number;
  gridColor: string;
  showRulers: boolean;
  showGuides: boolean;
  guides: Array<{
    id: string;
    type: 'horizontal' | 'vertical';
    position: number;
    color: string;
  }>;
  
  // Configuración de ajuste
  snapToGrid: boolean;
  snapToGuides: boolean;
  snapToObjects: boolean;
  snapTolerance: number;
  
  // Configuración de selección
  selectionMode: 'single' | 'multiple';
  selectionStyle: {
    strokeColor: string;
    strokeWidth: number;
    handleColor: string;
    handleSize: number;
  };
  
  // Estado de navegación
  canUndo: boolean;
  canRedo: boolean;
  historyIndex: number;
  maxHistorySize: number;
}

// =====================
// OPERACIONES AVANZADAS
// =====================

export interface HistoryActionV3 {
  id: string;
  type: 'create' | 'delete' | 'move' | 'resize' | 'style' | 'content' | 'group' | 'ungroup' | 'duplicate';
  componentIds: string[];
  previousState?: { [componentId: string]: Partial<DraggableComponentV3> };
  newState?: { [componentId: string]: Partial<DraggableComponentV3> };
  timestamp: Date;
  description: string;
}

// =====================
// ESTADO GENERAL DEL BUILDER V3
// =====================

export interface BuilderStateV3 {
  // Configuración actual
  currentFamily?: FamilyV3;
  currentTemplate?: TemplateV3;
  
  // Componentes en el canvas
  components: DraggableComponentV3[];
  
  // Estado del canvas
  canvas: CanvasStateV3;
  
  // Historial de acciones
  history: HistoryActionV3[];
  
  // Configuración de conectividad
  sapConnection: {
    isConnected: boolean;
    baseUrl?: string;
    token?: string;
    lastSync?: Date;
  };
  
  promotionConnection: {
    isConnected: boolean;
    baseUrl?: string;
    token?: string;
    lastSync?: Date;
  };
  
  // Configuración de exportación
  exportConfig: {
    format: 'png' | 'jpg' | 'pdf' | 'svg';
    quality: number;
    dpi: number;
    includeBleed: boolean;
    bleedSize: number;
    cropMarks: boolean;
    colorSpace: 'RGB' | 'CMYK';
  };
  
  // Estados de la interfaz
  ui: {
    leftPanelOpen: boolean;
    rightPanelOpen: boolean;
    bottomPanelOpen: boolean;
    activeLeftTab: 'components' | 'layers' | 'assets';
    activeRightTab: 'properties' | 'styles' | 'data';
    activeBottomTab: 'preview' | 'export' | 'history';
  };
  
  // Estados del sistema
  isLoading: boolean;
  isSaving: boolean;
  isExporting: boolean;
  isConnecting: boolean;
  hasUnsavedChanges: boolean;
  
  // Errores y validaciones
  errors: Array<{
    id: string;
    componentId?: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
  
  // Configuración de usuario
  userPreferences: {
    autoSave: boolean;
    autoSaveInterval: number;
    gridSnap: boolean;
    showTooltips: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

// =====================
// OPERACIONES DEL BUILDER V3
// =====================

export interface BuilderOperationsV3 {
  // ===== GESTIÓN DE FAMILIAS =====
  loadFamily: (familyId: string) => Promise<FamilyV3>;
  createFamily: (family: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FamilyV3>;
  updateFamily: (familyId: string, updates: Partial<FamilyV3>) => Promise<FamilyV3>;
  deleteFamily: (familyId: string) => Promise<void>;
  migrateFamily: (fromFamilyId: string, toFamilyId: string, options: {
    migrateAllTemplates: boolean;
    replaceHeaders: boolean;
    replaceColors: boolean;
    templateIds?: string[];
  }) => Promise<void>;
  setFamilyDirect: (family: FamilyV3) => void; // Función especial para actualizar estado desde Supabase
  
  // ===== GESTIÓN DE PLANTILLAS =====
  loadTemplate: (templateId: string) => Promise<TemplateV3>;
  createTemplate: (template: Omit<TemplateV3, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TemplateV3>;
  updateTemplate: (templateId: string, updates: Partial<TemplateV3>) => Promise<TemplateV3>;
  deleteTemplate: (templateId: string) => Promise<void>;
  duplicateTemplate: (templateId: string, newName?: string) => Promise<TemplateV3>;
  saveTemplate: () => Promise<void>;
  
  // ===== GESTIÓN DE COMPONENTES =====
  createComponent: (type: ComponentTypeV3, position: PositionV3) => DraggableComponentV3;
  addComponent: (component: DraggableComponentV3) => void;
  removeComponent: (componentId: string) => void;
  removeComponents: (componentIds: string[]) => void;
  updateComponent: (componentId: string, updates: Partial<DraggableComponentV3>) => void;
  duplicateComponent: (componentId: string) => DraggableComponentV3;
  duplicateComponents: (componentIds: string[]) => DraggableComponentV3[];
  copyComponents: (componentIds: string[]) => void;
  pasteComponents: () => void;
  
  // ===== OPERACIONES DE TRANSFORMACIÓN =====
  moveComponent: (componentId: string, newPosition: PositionV3) => void;
  moveComponents: (componentIds: string[], deltaX: number, deltaY: number) => void;
  resizeComponent: (componentId: string, newSize: SizeV3) => void;
  rotateComponent: (componentId: string, angle: number) => void;
  scaleComponent: (componentId: string, scaleX: number, scaleY: number) => void;
  
  // ===== OPERACIONES DE ALINEACIÓN =====
  alignComponents: (componentIds: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeComponents: (componentIds: string[], distribution: 'horizontal' | 'vertical') => void;
  arrangeComponents: (componentIds: string[], arrangement: 'bring-to-front' | 'send-to-back' | 'bring-forward' | 'send-backward') => void;
  
  // ===== OPERACIONES DE AGRUPACIÓN =====
  groupComponents: (componentIds: string[]) => string; // retorna ID del grupo
  ungroupComponents: (groupId: string) => string[]; // retorna IDs de componentes
  
  // ===== GESTIÓN DE CAPAS =====
  reorderComponent: (componentId: string, newIndex: number) => void;
  lockComponent: (componentId: string, locked: boolean) => void;
  hideComponent: (componentId: string, hidden: boolean) => void;
  
  // ===== HISTORIAL Y DESHACER =====
  undo: () => void;
  redo: () => void;
  addToHistory: (action: HistoryActionV3) => void;
  clearHistory: () => void;
  
  // ===== SELECCIÓN =====
  selectComponent: (componentId: string, addToSelection?: boolean) => void;
  selectComponents: (componentIds: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // ===== CANVAS =====
  zoomTo: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  zoomToSelection: () => void;
  panTo: (x: number, y: number) => void;
  resetView: () => void;
  
  // ===== VALIDACIÓN =====
  validateTemplate: () => Array<{ componentId?: string; message: string; type: 'error' | 'warning' }>;
  validateComponent: (componentId: string) => Array<{ message: string; type: 'error' | 'warning' }>;
  
  // ===== CONEXIONES EXTERNAS =====
  connectToSAP: (config: { baseUrl: string; token: string }) => Promise<boolean>;
  syncWithSAP: (productId?: string) => Promise<void>;
  connectToPromotions: (config: { baseUrl: string; token: string }) => Promise<boolean>;
  syncWithPromotions: () => Promise<void>;
  
  // ===== EXPORTACIÓN Y PREVIEW =====
  generatePreview: (config?: Partial<BuilderStateV3['exportConfig']>) => Promise<string>;
  exportCanvas: (config?: Partial<BuilderStateV3['exportConfig']>) => Promise<Blob>;
  exportToPDF: (config?: { 
    includeBleed: boolean; 
    cropMarks: boolean; 
    colorSpace: 'RGB' | 'CMYK' 
  }) => Promise<Blob>;
  
  // ===== GESTIÓN DE ASSETS =====
  uploadImage: (file: File) => Promise<string>; // retorna URL de la imagen
  deleteImage: (url: string) => Promise<void>;
  optimizeImage: (url: string, options: { 
    width?: number; 
    height?: number; 
    quality?: number 
  }) => Promise<string>;

  // ===== GESTIÓN DE UI =====
  updateUIState: (updates: Partial<BuilderStateV3['ui']>) => void;
  toggleUIPanel: (panel: 'left' | 'right' | 'bottom', open?: boolean) => void;
  setUITab: (panel: 'left' | 'right' | 'bottom', tab: string) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
}

// =====================
// CONFIGURACIÓN DE COMPONENTES DISPONIBLES
// =====================

export type ComponentsLibraryV3 = {
  [K in ComponentCategoryV3]: Array<{
    type: ComponentTypeV3;
    name: string;
    description: string;
    icon: string;
    category: K;
    defaultSize: SizeV3;
    defaultStyle: Partial<StyleV3>;
    defaultContent: Partial<DynamicContentV3>;
    tags: string[];
    isProOnly?: boolean;
  }>;
};

// =====================
// HOOK DE RETORNO
// =====================

export interface UseBuilderV3Return {
  state: BuilderStateV3;
  operations: BuilderOperationsV3;
  families: FamilyV3[];
  templates: TemplateV3[];
  componentsLibrary: ComponentsLibraryV3;
  isReady: boolean;
}

// =====================
// CONFIGURACIÓN DE MIGRACIÓN ENTRE FAMILIAS
// =====================

export interface FamilyMigrationConfig {
  sourceFamilyId: string;
  targetFamilyId: string;
  options: {
    migrateAllTemplates: boolean;
    templateIds?: string[]; // específicos a migrar
    
    // Configuración de Headers
    replaceHeaders: boolean;
    newHeaderImage?: string;
    
    // Configuración de colores
    replaceColors: boolean;
    colorMapping?: {
      [oldColor: string]: string;
    };
    
    // Configuración de tipografías
    replaceFonts: boolean;
    fontMapping?: {
      [oldFont: string]: string;
    };
    
    // Otras opciones
    keepOriginalNames: boolean;
    addSuffix?: string;
    preserveCustomizations: boolean;
  };
}

// =====================
// CONFIGURACIÓN DE INTEGRACIÓN SAP
// =====================

export interface SAPIntegrationConfig {
  endpoint: string;
  apiKey: string;
  version: string;
  timeout: number;
  retryAttempts: number;
  
  // Mapeo de campos
  fieldMapping: {
    productId: string;
    productName: string;
    description: string;
    sku: string;
    brand: string;
    category: string;
    price: string;
    discountPrice?: string;
    stock: string;
    images: string[];
    attributes: { [key: string]: string };
  };
  
  // Configuración de cache
  cacheConfig: {
    enabled: boolean;
    ttl: number; // tiempo de vida en segundos
    maxSize: number; // máximo número de productos en cache
  };
}

// =====================
// CONFIGURACIÓN DE SISTEMA DE PROMOCIONES
// =====================

export interface PromotionSystemConfig {
  endpoint: string;
  apiKey: string;
  companyId: string;
  
  // Mapeo de campos de promoción
  fieldMapping: {
    promotionId: string;
    name: string;
    description: string;
    discountType: 'percentage' | 'amount';
    discountValue: string;
    startDate: string;
    endDate: string;
    conditions: string;
    applicableProducts: string[];
  };
} 