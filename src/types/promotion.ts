export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  category: 'Bancaria' | 'Producto' | 'Categoría' | 'Especial';
  conditions: string[];
  isActive: boolean;
  bank?: string;
  cardType?: string;
  selectedBanks: string[];
  cardOptions: {
    debit: boolean;
    credit: boolean;
    cardBrands: string[];
  };
} 