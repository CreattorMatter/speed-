import { products } from '../data/products';
import { Product } from '../types';

/**
 * Simula la obtención de todos los productos.
 * En el futuro, esto hará una llamada a una API real.
 * @returns Una promesa que resuelve a un array de productos.
 */
export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching products from mock data...');
  // Simular un retraso de red
  await new Promise(resolve => setTimeout(resolve, 200));
  return products;
};

/**
 * Simula la obtención de un producto por su ID.
 * @param id - El ID del producto a obtener.
 * @returns Una promesa que resuelve al producto encontrado o undefined.
 */
export const getProductById = async (id: string): Promise<Product | undefined> => {
  console.log(`Fetching product with id ${id} from mock data...`);
  await new Promise(resolve => setTimeout(resolve, 100));
  return products.find(p => p.id === id);
};

// Aquí se podrían añadir más funciones como:
// - createProduct
// - updateProduct
// - deleteProduct 