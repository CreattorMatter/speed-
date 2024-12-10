export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  pricePerUnit: string;
  points: string;
  origin: string;
  barcode: string;
  brand: string;
  packUnit: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl: string;
  category: 'Bancaria' | 'Especial' | 'Categoría';
  conditions: string[];
  startDate: string;
  endDate: string;
  bank?: string;
  cardType?: string;
  type?: 'percentage' | '2x1' | '3x2' | 'second-70';
  isActive?: boolean;
  selectedBanks?: string[];
  cardOptions?: string[];
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
}

export interface PaperFormat {
  id: string;
  width: string;
  height: string;
  name: string;
} 