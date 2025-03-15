export type BlockType = 'container' | 'header' | 'footer' | 'sku' | 'image' | 'price' | 'discount' | 'promotion' | 'logo';

export interface BlockContent {
  text?: string;
  imageUrl?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: {
    text?: string;
    imageUrl?: string;
    data?: any;
  };
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  isContainer?: boolean;
  parentId?: string;
  children?: Block[];
  zIndex?: number;
  layerOrder?: number;
  rotation?: number;
  scale?: {
    x: number;
    y: number;
  };
  styles?: Record<string, any>;
  locked?: boolean;
  visible?: boolean;
  opacity?: number;
}

export interface PresetSize {
  width: number;
  height: number;
}

export interface BlockPresets {
  [key in BlockType]?: {
    small: PresetSize;
    medium: PresetSize;
    large: PresetSize;
  };
}

export interface PaperFormat {
  id: string;
  width: number;
  height: number;
  name: string;
  originalSize: string;
} 