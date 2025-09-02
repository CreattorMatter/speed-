import { ProductoReal } from '../types/product';

// =====================================
// PRODUCTOS REALES DEL SISTEMA ERP
// =====================================

export const productos: ProductoReal[] = [
  // SECCIÓN ELECTRODOMÉSTICOS (12)
  {
    id: 'WHIR-001',
    tienda: 'E000',
    sku: 123001,
    ean: 7790123456789,
    eanPrincipal: true,
    descripcion: 'Heladera Whirlpool No Frost 375L',
    umvExt: 'Unidad',
    precio: 699999,
    precioAnt: 849999,
    basePrice: 578511,
    ppum: 699999,
    unidadPpumExt: 'Unidad',
    seccion: 'Electrodomésticos',
    grupo: 'Línea Blanca',
    rubro: 'Heladeras',
    subRubro: 'No Frost',
    origen: 'ARG',
    paisTexto: 'Argentina',
    marcaTexto: 'WHIRLPOOL',
    stockDisponible: 15,
    imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30',
    category: 'Electrodomésticos',
    subCategory: 'Heladeras',
    brand: 'WHIRLPOOL',
    packageType: 'Unidad',
    volume: '375L',
    name: 'Heladera Whirlpool No Frost 375L'
  },
  {
    id: 'DREAN-001',
    tienda: 'E000',
    sku: 123002,
    ean: 7790234567890,
    eanPrincipal: true,
    descripcion: 'Lavarropas Drean Next 8.14 Kg',
    umvExt: 'Unidad',
    precio: 259999,
    precioAnt: 299999,
    basePrice: 214875,
    ppum: 259999,
    unidadPpumExt: 'Unidad',
    seccion: 'Electrodomésticos',
    grupo: 'Línea Blanca',
    rubro: 'Lavarropas',
    subRubro: 'Automático',
    origen: 'ARG',
    paisTexto: 'Argentina',
    marcaTexto: 'DREAN',
    stockDisponible: 8,
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1',
    category: 'Electrodomésticos',
    subCategory: 'Lavarropas',
    brand: 'DREAN',
    packageType: 'Unidad',
    volume: '8Kg',
    name: 'Lavarropas Drean Next 8.14 Kg'
  },
  {
    id: 'SAMS-001',
    tienda: 'E000',
    sku: 123003,
    ean: 7790345678901,
    eanPrincipal: true,
    descripcion: 'Smart TV Samsung 55" 4K UHD',
    umvExt: 'Unidad',
    precio: 349999,
    precioAnt: 399999,
    basePrice: 289255,
    ppum: 349999,
    unidadPpumExt: 'Unidad',
    seccion: 'Tecnología',
    grupo: 'Audio y Video',
    rubro: 'Televisores',
    subRubro: 'Smart TV',
    origen: 'KOR',
    paisTexto: 'Corea del Sur',
    marcaTexto: 'SAMSUNG',
    stockDisponible: 12,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1',
    category: 'Tecnología',
    subCategory: 'Televisores',
    brand: 'SAMSUNG',
    packageType: 'Unidad',
    volume: '55"',
    name: 'Smart TV Samsung 55" 4K UHD'
  },

  // SECCIÓN BEBIDAS (2)
  {
    id: 'COCA-001',
    tienda: 'E000',
    sku: 234001,
    ean: 7790895000157,
    eanPrincipal: true,
    descripcion: 'Coca Cola Sabor Original',
    umvExt: 'L',
    precio: 1299,
    precioAnt: 1499,
    basePrice: 1074,
    ppum: 866,
    unidadPpumExt: 'mL',
    seccion: 'Bebidas',
    grupo: 'Gaseosas',
    rubro: 'Cola',
    subRubro: 'Original',
    origen: 'ARG',
    paisTexto: 'Argentina',
    marcaTexto: 'COCA COLA',
    stockDisponible: 150,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
    category: 'Bebidas',
    subCategory: 'Gaseosas',
    brand: 'COCA COLA',
    packageType: 'Botella de Plástico',
    volume: '1.5 L',
    name: 'Coca Cola Sabor Original'
  },
  {
    id: 'COCA-002',
    tienda: 'E000',
    sku: 234002,
    ean: 7790895000164,
    eanPrincipal: true,
    descripcion: 'Coca Cola Zero',
    umvExt: 'L',
    precio: 1199,
    precioAnt: 1399,
    basePrice: 991,
    ppum: 799,
    unidadPpumExt: 'mL',
    seccion: 'Bebidas',
    grupo: 'Gaseosas',
    rubro: 'Cola',
    subRubro: 'Zero',
    origen: 'ARG',
    paisTexto: 'Argentina',
    marcaTexto: 'COCA COLA',
    stockDisponible: 200,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
    category: 'Bebidas',
    subCategory: 'Gaseosas',
    brand: 'COCA COLA',
    packageType: 'Botella de Plástico',
    volume: '1.5 L',
    name: 'Coca Cola Zero'
  },

  // SECCIÓN ALMACÉN (1)
  {
    id: 'NATURA-001',
    tienda: 'E000',
    sku: 345001,
    ean: 7791234567123,
    eanPrincipal: true,
    descripcion: 'Aceite De Girasol Natura',
    umvExt: 'L',
    precio: 1599,
    precioAnt: 1799,
    basePrice: 1321,
    ppum: 1066,
    unidadPpumExt: 'mL',
    seccion: 'Almacén',
    grupo: 'Aceites',
    rubro: 'Aceites Comunes',
    subRubro: 'Girasol',
    origen: 'ARG',
    paisTexto: 'Argentina',
    marcaTexto: 'NATURA',
    stockDisponible: 85,
    imageUrl: '/products/aceite-natura.jpg',
    category: 'Almacén',
    subCategory: 'Aceites Comunes',
    brand: 'NATURA',
    packageType: 'Botella de Plástico',
    volume: '1.5 L',
    name: 'Aceite De Girasol Natura'
  },
  {
    id: 'CANUELAS-001',
    tienda: 'E000',
    sku: 345002,
    ean: 7791234567130,
    eanPrincipal: true,
    descripcion: 'Aceite Cañuelas De Girasol',
    umvExt: 'L',
    precio: 1499,
    precioAnt: 1699,
    basePrice: 1239,
    ppum: 999,
    unidadPpumExt: 'mL',
    seccion: 'Almacén',
    grupo: 'Aceites',
    rubro: 'Aceites Comunes',
    subRubro: 'Girasol',
    origen: 'ARG',
    paisTexto: 'Argentina',
    marcaTexto: 'CAÑUELAS',
    stockDisponible: 120,
    imageUrl: '/products/aceite-canuelas.jpg',
    category: 'Almacén',
    subCategory: 'Aceites Comunes',
    brand: 'CAÑUELAS',
    packageType: 'Botella de Plástico',
    volume: '1.5 L',
    name: 'Aceite Cañuelas De Girasol'
  },

  // SECCIÓN FERRETERÍA (13)
  {
    id: 'TALADRO-001',
    tienda: 'E000',
    sku: 456001,
    ean: 7792345678901,
    eanPrincipal: true,
    descripcion: 'Taladro Percutor Black & Decker 600W',
    umvExt: 'Unidad',
    precio: 35999,
    precioAnt: 42999,
    basePrice: 29751,
    ppum: 35999,
    unidadPpumExt: 'Unidad',
    seccion: 'Ferretería',
    grupo: 'Herramientas Eléctricas',
    rubro: 'Taladros',
    subRubro: 'Percutor',
    origen: 'CHN',
    paisTexto: 'China',
    marcaTexto: 'BLACK & DECKER',
    stockDisponible: 25,
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c',
    category: 'Ferretería',
    subCategory: 'Herramientas Eléctricas',
    brand: 'BLACK & DECKER',
    packageType: 'Caja',
    volume: '600W',
    name: 'Taladro Percutor Black & Decker 600W'
  },
  {
    id: 'DESTORNILLADOR-001',
    tienda: 'E000',
    sku: 456002,
    ean: 7792345678918,
    eanPrincipal: true,
    descripcion: 'Destornillador Phillips Set x6',
    umvExt: 'Set',
    precio: 8999,
    precioAnt: 10999,
    basePrice: 7437,
    ppum: 1500,
    unidadPpumExt: 'Unidad',
    seccion: 'Ferretería',
    grupo: 'Herramientas Manuales',
    rubro: 'Destornilladores',
    subRubro: 'Phillips',
    origen: 'ARG',
    paisTexto: 'Argentina',
    marcaTexto: 'BAHCO',
    stockDisponible: 45,
    imageUrl: 'https://images.unsplash.com/photo-1609205348077-7509c6a8b5c3',
    category: 'Ferretería',
    subCategory: 'Herramientas Manuales',
    brand: 'BAHCO',
    packageType: 'Set',
    volume: '6 piezas',
    name: 'Destornillador Phillips Set x6'
  },

  // SECCIÓN CONSTRUCCIÓN (14)
  {
    id: 'TABLON-001',
    tienda: 'E000',
    sku: 567001,
    ean: 7793456789012,
    eanPrincipal: true,
    descripcion: 'Tablón Pino 2x8x3.20m',
    umvExt: 'Metro',
    precio: 4599,
    precioAnt: 5299,
    basePrice: 3801,
    ppum: 1437,
    unidadPpumExt: 'Metro lineal',
    seccion: 'Construcción',
    grupo: 'Madera',
    rubro: 'Tablones',
    subRubro: 'Pino',
    origen: 'ARG',
    paisTexto: 'Argentina',
    marcaTexto: 'MADERAS DEL SUR',
    stockDisponible: 180,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
    category: 'Construcción',
    subCategory: 'Madera',
    brand: 'MADERAS DEL SUR',
    packageType: 'Unidad',
    volume: '2x8x3.20m',
    name: 'Tablón Pino 2x8x3.20m'
  },

  // SECCIÓN LIMPIEZA (3)
  {
    id: 'CIF-001',
    tienda: 'E000',
    sku: 678001,
    ean: 7794567890123,
    eanPrincipal: true,
    descripcion: 'Limpiador CIF Original',
    umvExt: 'mL',
    precio: 1899,
    precioAnt: 2199,
    basePrice: 1569,
    ppum: 3,
    unidadPpumExt: 'mL',
    seccion: 'Limpieza',
    grupo: 'Limpiadores',
    rubro: 'Multiuso',
    subRubro: 'Cremoso',
    origen: 'BRA',
    paisTexto: 'Brasil',
    marcaTexto: 'CIF',
    stockDisponible: 300,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
    category: 'Limpieza',
    subCategory: 'Limpiadores',
    brand: 'CIF',
    packageType: 'Frasco',
    volume: '500 mL',
    name: 'Limpiador CIF Original'
  }
];

// =====================================
// FUNCIONES DE UTILIDAD
// =====================================

export const getProductoByEan = (ean: number): ProductoReal | undefined => {
  return productos.find(producto => producto.ean === ean);
};

export const getProductosBySku = (sku: number): ProductoReal | undefined => {
  return productos.find(producto => producto.sku === sku);
};

export const getProductosBySeccion = (seccion: string): ProductoReal[] => {
  return productos.filter(producto => producto.seccion === seccion);
};

export const getProductosByTienda = (tienda: string): ProductoReal[] => {
  return productos.filter(producto => producto.tienda === tienda);
};

export const getProductosConDescuento = (): ProductoReal[] => {
  return productos.filter(producto => 
    producto.precio && producto.precioAnt && 
    producto.precio < producto.precioAnt
  );
};

export const calcularDescuentoPorcentaje = (producto: ProductoReal): number => {
  if (!producto.precio || !producto.precioAnt) return 0;
  // 🔧 CÁLCULO EXACTO: Mantener 2 decimales en porcentajes
  return Number((((producto.precioAnt - producto.precio) / producto.precioAnt) * 100).toFixed(2));
};

export const getProductosConStock = (minimo: number = 1): ProductoReal[] => {
  return productos.filter(producto => 
    producto.stockDisponible && producto.stockDisponible >= minimo
  );
};

// =====================================
// EXPORTS PARA COMPATIBILIDAD
// =====================================

// Alias para compatibilidad con código existente
export const products = productos;
export type Product = ProductoReal;

// Arrays de categorías para UI
export const categorias = [...new Set(productos.map(p => p.seccion).filter(Boolean))];
export const marcas = [...new Set(productos.map(p => p.marcaTexto).filter(Boolean))];
export const paises = [...new Set(productos.map(p => p.paisTexto).filter(Boolean))];

// Legacy exports
export const categories = categorias;
export const productCategories = [...new Set(productos.map(p => p.rubro).filter(Boolean))];
export const packageTypes = [...new Set(productos.map(p => p.packageType).filter(Boolean))];
export const brands = marcas; 