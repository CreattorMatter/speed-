export type BlockType = 'header' | 'title' | 'footer' | 'image' | 'price' | 'discount' | 'sku' | 'promotion' | 'logo' | 'text' | 'price-final' | 'price-before' | 'installments' | 'savings' | 'product-name' | 'brand' | 'category' | 'stock' | 'promo-badge' | 'gift' | 'combo' | 'validity' | 'countdown' | 'period' | 'branch' | 'contact' | 'schedule' | 'club-easy' | 'cencopay' | 'easy-points';

export interface BlockPosition {
  x: number;
  y: number;
}

export interface BlockSize {
  width: number;
  height: number;
}

export interface BlockContent {
  text?: string;
  imageUrl?: string;
  data?: any;
  fieldData?: any; // Para campos promocionales
  value?: string | number; // Valor del campo
  placeholder?: string; // Para placeholders de imágenes
  // Propiedades de estilo que pueden ser parte del contenido
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textDecoration?: string;
  fontFamily?: string;
}

export interface BlockStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
  borderRadius?: number;
  border?: string;
  fontFamily?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  position: BlockPosition;
  size: BlockSize;
  content?: BlockContent;
  style?: BlockStyle;
  isContainer?: boolean;
  zIndex?: number;
  locked?: boolean; // Para prevenir edición
  visible?: boolean; // Para mostrar/ocultar
}

export type BuilderStep = 'family-selection' | 'template-selection' | 'canvas-editor';

export interface PaperFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  originalSize: string;
}

// Familias de promoción
export interface PromotionFamily {
  id: string;
  name: string;
  description: string;
  headerImage?: string; // Header principal de la familia
  color: string; // Color tema de la familia
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  templates: Template[];
}

// Templates
export interface PromotionTemplate {
  id: string;
  name: string;
  description: string;
  familyId: string;
  preview: string;
  requiredFields: string[];
  layout: 'portrait' | 'landscape';
  size: PaperFormat;
}

// Estados del canvas
export interface CanvasState {
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  selectedBlockId: string | null;
  mode: 'select' | 'pan' | 'zoom';
}

// Event handlers
export interface CanvasHandlers {
  onBlockAdd: (type: BlockType, position: BlockPosition) => void;
  onBlockDelete: (id: string) => void;
  onBlockUpdate: (id: string, updates: Partial<Block>) => void;
  onBlockSelect: (id: string | null) => void;
  onCanvasStateChange: (state: Partial<CanvasState>) => void;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  familyId: string;
  blocks: Block[];
  posterSize: PosterSizeKey;
  previewImage?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export type PosterSizeKey = 'A4' | 'A3' | 'A2' | 'A1' | 'LETTER' | 'TABLOID' | 'BANNER_S' | 'BANNER_M' | 'BANNER_L' | 'SQUARE';

export interface TemplateCopyOptions {
  replaceHeader: boolean;
  newHeaderImage?: string;
  targetFamilyId: string;
  newTemplateName: string;
} 