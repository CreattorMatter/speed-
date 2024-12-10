export interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount: string;
  bank?: string;
  cardType?: string;
  conditions?: string[];
  startDate?: string;
  endDate?: string;
  type?: 'percentage' | '2x1' | '3x2' | 'second-70';
} 