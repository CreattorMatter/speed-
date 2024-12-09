import { Promotion } from './promotion';
import { Company } from '../data/companies';

export type BlockType = 
  | 'header'
  | 'footer'
  | 'sku'
  | 'image'
  | 'price'
  | 'price-per-unit'
  | 'points'
  | 'origin'
  | 'barcode'
  | 'brand'
  | 'pack-unit'
  | 'logo'
  | 'promotion';

export interface BlockContent {
  text?: string;
  imageUrl?: string;
  promotion?: Promotion;
  company?: Company;
  points?: string;
  origin?: string;
  barcode?: string;
  pricePerUnit?: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
}

export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface PaperFormat {
  id: string;
  width: string;
  height: string;
  name: string;
} 