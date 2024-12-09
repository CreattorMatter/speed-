import { Product } from '../types/product';

export const products: Product[] = [
  {
    id: '1',
    sku: 'PRD001',
    name: 'Producto 1',
    description: 'Descripción del producto 1',
    price: 1999.99,
    imageUrl: 'https://example.com/product1.jpg',
    category: 'Categoría 1'
  },
  {
    id: '2',
    sku: 'PRD002',
    name: 'Producto 2',
    description: 'Descripción del producto 2',
    price: 2999.99,
    imageUrl: 'https://example.com/product2.jpg',
    category: 'Categoría 2'
  },
  // ... más productos ...
]; 