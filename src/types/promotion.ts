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
  isActive: boolean;
  selectedBanks: string[];
  cardOptions: string[];
} 