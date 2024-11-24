export type BlockType = 
  | 'header'
  | 'footer'
  | 'sku'
  | 'image'
  | 'price'
  | 'discount'
  | 'promotion'
  | 'logo';

export interface Block {
  id: string;
  type: BlockType;
  content: any;
  position: {
    x: number;
    y: number;
  };
} 