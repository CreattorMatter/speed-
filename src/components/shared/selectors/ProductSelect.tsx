import { Product } from '../../../types/index';

interface ProductSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  products: Product[];
  className?: string;
  menuPlacement?: 'top' | 'bottom' | 'auto';
} 