export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  subCategory?: string;
  brand?: string;
  packageType?: string;
  volume?: string;
} 