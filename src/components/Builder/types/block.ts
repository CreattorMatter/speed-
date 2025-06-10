export interface Block {
  id: string;
  type: string;
  content?: string;
  imageUrl?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    padding?: number;
    borderRadius?: number;
    border?: string;
  };
  isContainer?: boolean;
  children?: string[];
}

export interface BlockSize {
  width: number;
  height: number;
}

export interface BlockPosition {
  x: number;
  y: number;
}

export type BlockType = 'text' | 'image' | 'container' | 'price' | 'discount' | 'product'; 