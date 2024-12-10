interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  // Campos comunes obligatorios
  sku?: string;
  description?: string;
  imageUrl?: string;
  // Nuevos campos opcionales
  subCategory?: string;
  brand?: string;
  image?: string;
  packageType?: string;
  volume?: string;
}

export const products: Product[] = [
  // Productos MDH (Easy) existentes
  {
    id: 'MDH-001',
    sku: 'MDH-001',
    name: 'Aire Acondicionado Split Surrey 3000FC',
    price: 449999.99,
    imageUrl: 'https://images.unsplash.com/photo-1631385309847-960f92ec3585',
    category: 'MDH',
    description: 'Split Inverter Frío/Calor 3000 Frigorías'
  },
  {
    id: 'MDH-002',
    sku: 'MDH-002',
    name: 'Heladera Whirlpool No Frost 375L',
    price: 699999.99,
    imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30',
    category: 'MDH',
    description: 'Heladera No Frost con freezer superior'
  },
  {
    id: 'MDH-003',
    sku: 'MDH-003',
    name: 'Lavarropas Drean Next 8.14',
    price: 259999.99,
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1',
    category: 'MDH',
    description: 'Lavarropas automático de 8kg con 1400RPM'
  },
  {
    id: 'MDH-004',
    sku: 'MDH-004',
    name: 'Smart TV Samsung 55" 4K',
    price: 349999.99,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1',
    category: 'MDH',
    description: 'Smart TV LED 55" UHD 4K'
  },
  {
    id: 'MDH-005',
    sku: 'MDH-005',
    name: 'Microondas BGH 28L',
    price: 89999.99,
    imageUrl: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d',
    category: 'MDH',
    description: 'Microondas digital 28L con grill'
  },
  {
    id: 'MDH-006',
    sku: 'MDH-006',
    name: 'Aspiradora Robot Gadnic',
    price: 79999.99,
    imageUrl: 'https://images.unsplash.com/photo-1563874257547-d19fbb71b46c',
    category: 'MDH',
    description: 'Aspiradora Robot con control remoto'
  },
  {
    id: 'MDH-007',
    sku: 'MDH-007',
    name: 'Ventilador de Pie Liliana',
    price: 29999.99,
    imageUrl: 'https://images.unsplash.com/photo-1575435349939-0ffbdad70905',
    category: 'MDH',
    description: 'Ventilador de pie 20" con control remoto'
  },
  {
    id: 'MDH-008',
    sku: 'MDH-008',
    name: 'Cafetera Oster',
    price: 49999.99,
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62',
    category: 'MDH',
    description: 'Cafetera automática con molinillo'
  },
  {
    id: 'TEC-001',
    sku: 'TEC-001',
    name: 'MacBook Pro M3 Pro 14"',
    price: 1299999.99,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    category: 'Tecnología',
    description: 'Laptop Apple M3 Pro 14 pulgadas'
  },
  {
    id: 'TEC-002',
    sku: 'TEC-002',
    name: 'iPad Pro 12.9"',
    price: 799999.99,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0',
    category: 'Tecnología',
    description: 'iPad Pro 12.9" M2 256GB'
  },
  {
    id: 'TEC-003',
    sku: 'TEC-003',
    name: 'iPhone 15 Pro Max',
    price: 999999.99,
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5',
    category: 'Tecnología',
    description: 'iPhone 15 Pro Max 256GB'
  },
  {
    id: 'TEC-004',
    sku: 'TEC-004',
    name: 'AirPods Pro 2',
    price: 199999.99,
    imageUrl: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5',
    category: 'Tecnología',
    description: 'AirPods Pro 2nd Generation'
  },
  {
    id: 'TEC-005',
    sku: 'TEC-005',
    name: 'Apple Watch Series 9',
    price: 299999.99,
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d',
    category: 'Tecnología',
    description: 'Apple Watch Series 9 GPS 45mm'
  },
  {
    id: 'TEC-006',
    sku: 'TEC-006',
    name: 'Samsung Galaxy S23 Ultra',
    price: 899999.99,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf',
    category: 'Tecnología',
    description: 'Smartphone Samsung 256GB'
  },
  {
    id: 'TEC-007',
    sku: 'TEC-007',
    name: 'Notebook HP Pavilion',
    price: 699999.99,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed',
    category: 'Tecnología',
    description: 'Laptop HP 15" Ryzen 7'
  },
  {
    id: 'BEB-001',
    sku: 'BEB-001',
    name: 'Coca Cola Pack x6',
    price: 4999.99,
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7',
    category: 'Bebidas',
    description: 'Pack x6 botellas de 2.25L'
  },
  {
    id: 'BEB-002',
    sku: 'BEB-002',
    name: 'Pepsi Pack x6',
    price: 4799.99,
    imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e',
    category: 'Bebidas',
    description: 'Pack x6 botellas de 2.25L'
  },
  {
    id: 'BEB-003',
    sku: 'BEB-003',
    name: 'Sprite Pack x6',
    price: 4599.99,
    imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3',
    category: 'Bebidas',
    description: 'Pack x6 botellas de 2.25L'
  },
  {
    id: 'BEB-004',
    sku: 'BEB-004',
    name: 'Fanta Pack x6',
    price: 4599.99,
    imageUrl: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca',
    category: 'Bebidas',
    description: 'Pack x6 botellas de 2.25L'
  },
  {
    id: 'BEB-005',
    sku: 'BEB-005',
    name: 'Cerveza Quilmes Pack x6',
    price: 3999.99,
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9',
    category: 'Bebidas',
    description: 'Pack x6 latas de 473ml'
  },
  {
    id: 'BEB-006',
    sku: 'BEB-006',
    name: 'Coca-cola Zero',
    price: 1299.99,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
    category: 'Bebidas',
    subCategory: 'Gaseosas',
    brand: 'COCA COLA',
    packageType: 'Botella de Plástico',
    volume: '2.25 L',
    description: 'Gaseosa cola zero sin azúcar'
  },
  {
    id: 'BEB-007',
    sku: 'BEB-007',
    name: 'Coca-cola Zero',
    price: 899.99,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
    category: 'Bebidas',
    subCategory: 'Gaseosas',
    brand: 'COCA COLA',
    packageType: 'Botella de Plástico',
    volume: '500 Ml',
    description: 'Gaseosa cola zero sin azúcar'
  },
  {
    id: 'BEB-008',
    sku: 'BEB-008',
    name: 'Coca-cola Sabor Liviano',
    price: 1199.99,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
    category: 'Bebidas',
    subCategory: 'Gaseosas',
    brand: 'COCA COLA',
    packageType: 'Botella de Plástico',
    volume: '1.75 L',
    description: 'Gaseosa cola sabor liviano'
  },
  {
    id: 'BEB-009',
    sku: 'BEB-009',
    name: 'Coca-cola Sabor Liviano',
    price: 1299.99,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
    category: 'Bebidas',
    subCategory: 'Gaseosas',
    brand: 'COCA COLA',
    packageType: 'Botella de Plástico',
    volume: '2.25 L',
    description: 'Gaseosa cola sabor liviano'
  },
  {
    id: 'BEB-010',
    sku: 'BEB-010',
    name: 'Coca-cola Zero',
    price: 699.99,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
    category: 'Bebidas',
    subCategory: 'Gaseosas',
    brand: 'COCA COLA',
    packageType: 'Lata',
    volume: '354 Ml',
    description: 'Gaseosa cola zero sin azúcar'
  },
  {
    id: 'BEB-011',
    sku: 'BEB-011',
    name: 'Coca-cola Sabor Liviano',
    price: 899.99,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
    category: 'Bebidas',
    subCategory: 'Gaseosas',
    brand: 'COCA COLA',
    packageType: 'Botella de Plástico',
    volume: '500 Ml',
    description: 'Gaseosa cola sabor liviano'
  },
  {
    id: 'BEB-012',
    sku: 'BEB-012',
    name: 'Coca-cola Sabor Original',
    price: 1099.99,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
    category: 'Bebidas',
    subCategory: 'Gaseosas',
    brand: 'COCA COLA',
    packageType: 'Botella de Plástico',
    volume: '1.25 L',
    description: 'Gaseosa cola sabor original'
  },
  {
    id: 'BEB-013',
    sku: 'BEB-013',
    name: 'Coca-cola Sabor Original',
    price: 599.99,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
    category: 'Bebidas',
    subCategory: 'Gaseosas',
    brand: 'COCA COLA',
    packageType: 'Botella de Vidrio',
    volume: '237 Ml',
    description: 'Gaseosa cola sabor original retornable'
  },
  // Nuevos productos de Aceites
  {
    id: 'aceite-natura-1.5',
    name: 'Aceite De Girasol Natura',
    category: 'Almacén',
    subCategory: 'Aceites Comunes',
    brand: 'NATURA',
    price: 1599.99,
    image: '/products/aceite-natura.jpg',
    imageUrl: '/products/aceite-natura.jpg',
    packageType: 'Botella de Plástico',
    volume: '1.5 L',
    description: 'Aceite de girasol 1.5L'
  },
  {
    id: 'aceite-canuelas-1.5',
    name: 'Aceite Cañuelas De Girasol',
    category: 'Almacén',
    subCategory: 'Aceites Comunes',
    brand: 'CAÑUELAS',
    price: 1499.99,
    image: '/products/aceite-canuelas.jpg',
    imageUrl: '/products/aceite-canuelas.jpg',
    packageType: 'Botella de Plástico',
    volume: '1.5 L',
    description: 'Aceite de girasol 1.5L'
  },
  {
    id: 'aceite-cocinero-1.5',
    name: 'Aceite De Girasol Cocinero',
    category: 'Almacén',
    subCategory: 'Aceites Comunes',
    brand: 'COCINERO',
    price: 1699.99,
    image: '/products/aceite-cocinero.jpg',
    imageUrl: '/products/aceite-cocinero.jpg',
    packageType: 'Botella de Plástico',
    volume: '1.5 L',
    description: 'Aceite de girasol 1.5L'
  },
  {
    id: 'aceite-oliva-cocinero-500',
    name: 'Aceite Oliva Extra Virgen Intenso Cocinero',
    category: 'Almacén',
    subCategory: 'Aceites Especiales',
    brand: 'COCINERO',
    price: 2499.99,
    image: '/products/aceite-oliva-cocinero.jpg',
    imageUrl: '/products/aceite-oliva-cocinero.jpg',
    packageType: 'Botella de Vidrio',
    volume: '500 Ml',
    description: 'Aceite de oliva extra virgen 500ml'
  },
  {
    id: 'aceite-oliva-nucete-2000',
    name: 'Aceite De Oliva Extra Virgen Nucete',
    category: 'Almacén',
    subCategory: 'Aceites Especiales',
    brand: 'NUCETE',
    price: 8999.99,
    image: '/products/aceite-oliva-nucete.jpg',
    imageUrl: '/products/aceite-oliva-nucete.jpg',
    packageType: 'Botella de Vidrio',
    volume: '2000 Ml',
    description: 'Aceite de oliva extra virgen 2L'
  }
];

export const categories = [
  'MDH',
  'Tecnología',
  'Electrodomésticos',
  'Bebidas',
  'Alimentos',
  'Bazar',
  'Almacén'
];

export const productCategories = [
  'Aceites Comunes',
  'Aceites Especiales',
  'Acetos',
  'Jugos de Limón',
  'Vinagres',
  'Gaseosas'
];

export const packageTypes = [
  'Aerosol',
  'Botella',
  'Botella de Plástico',
  'Botella de Vidrio',
  'Lata',
  'Pote',
  'Spray'
];

export const brands = [
  'ALCAZAR',
  'BEEPURE',
  'CASALTA',
  'CAÑUELAS',
  'CHIA GRAAL',
  'COCINERO',
  'COWS PURE',
  'CUISINE & CO NBE MP',
  'DICOMERE',
  'DOS ANCLAS',
  'NATURA',
  'NUCETE',
  'Samsung',
  'Apple',
  'HP',
  'Whirlpool',
  'BGH',
  'Drean',
  'Liliana',
  'Oster',
  'Gadnic',
  'Surrey',
  'COCA COLA'
]; 