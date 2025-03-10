import { Product } from '../../types/product';

interface ProductSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  products: Product[];
  className?: string;
  menuPlacement?: 'top' | 'bottom' | 'auto';
} 