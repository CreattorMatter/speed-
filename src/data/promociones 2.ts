import { Promocion } from '../types/product';

// =====================================
// DATOS REALES DE PROMOCIONES
// =====================================

export const promociones: Promocion[] = [
  // Promoción 5x4 en Bebidas
  {
    estado: "ACTIVO",
    web: "SI",
    codigoJerarquia: 2,
    codPromoNCR: 1001,
    desde: new Date('2025-01-20'),
    hasta: new Date('2025-02-15'),
    seccion: 2, // Bebidas
    ean: 7790895000157,
    descripcion: "Coca Cola 2.25L",
    precioVentaPromocional: "5x4",
    local: "Todas las sucursales",
    motivo: "Liquidación stock verano",
    sistema: "NCR",
    modificacion: "PROMOCION NUEVA",
    fecha: new Date('2025-01-20')
  },
  
  // Combo construcción
  {
    estado: "ACTIVO", 
    web: "SI",
    codigoJerarquia: 14,
    codPromoNCR: 1002,
    desde: new Date('2025-01-15'),
    hasta: new Date('2025-03-31'),
    seccion: 14, // Construcción
    numeroCombo: 500,
    descripcionCombo: "TABLÓN PINO + BASTIDOR X 2 + DIAGONAL X 2",
    cantidadComponente: 5,
    ean: 7791234567890,
    descripcion: "Kit Construcción Completo",
    precioVentaPromocional: "$15999",
    local: "E000,E001,E002,E003",
    comoAccionaraLocal: "Aplicar descuento en caja",
    motivo: "Promoción construcción",
    sistema: "UNIFY",
    modificacion: "COMBO NUEVO",
    fecha: new Date('2025-01-15')
  },
  
  // Descuento porcentual Electrodomésticos
  {
    estado: "ACTIVO",
    web: "NO",
    codigoJerarquia: 12,
    codPromoNCR: 1003,
    desde: new Date('2025-01-10'),
    hasta: new Date('2025-02-29'),
    seccion: 12, // Electrodomésticos
    ean: 7790123456789,
    descripcion: "Heladeras marca Whirlpool",
    precioVentaPromocional: "15%",
    local: "Todas las sucursales",
    motivo: "Black Friday extendido",
    sistema: "NCR",
    modificacion: "DESCUENTO APLICADO",
    fecha: new Date('2025-01-10')
  },
  
  // Promoción 3x2 en Limpieza
  {
    estado: "ACTIVO",
    web: "SI",
    codigoJerarquia: 3,
    codPromoNCR: 1004,
    desde: new Date('2025-01-25'),
    hasta: new Date('2025-02-28'),
    seccion: 3, // Limpieza
    ean: 7790456789012,
    descripcion: "Productos limpieza marca CIF",
    precioVentaPromocional: "3x2",
    local: "E001,E003,E005,E007",
    comoAccionaraLocal: "Descuento automático en sistema",
    motivo: "Campaña limpieza hogar",
    sistema: "NCR",
    modificacion: "PROMOCION ACTIVA",
    fecha: new Date('2025-01-25')
  },
  
  // Precio especial Tecnología
  {
    estado: "ACTIVO",
    web: "SI", 
    codigoJerarquia: 11,
    codPromoNCR: 1005,
    desde: new Date('2025-01-05'),
    hasta: new Date('2025-01-31'),
    seccion: 11, // Tecnología
    ean: 7790789012345,
    descripcion: "Smart TV Samsung 55 pulgadas",
    precioVentaPromocional: "$299999",
    local: "Todas las sucursales",
    motivo: "Liquidación modelo anterior",
    sistema: "UNIFY",
    modificacion: "CAMBIO DE PRECIO",
    fecha: new Date('2025-01-05')
  },
  
  // Combo Jardinería
  {
    estado: "PENDIENTE",
    web: "NO",
    codigoJerarquia: 15,
    codPromoNCR: 1006,
    desde: new Date('2025-02-01'),
    hasta: new Date('2025-04-30'),
    seccion: 15, // Jardinería
    numeroCombo: 501,
    descripcionCombo: "MANGUERA 25M + PISTOLA RIEGO + SOPORTE",
    cantidadComponente: 3,
    ean: 7790234567890,
    descripcion: "Kit Riego Completo",
    precioVentaPromocional: "$8999",
    local: "E000,E001,E002",
    comoAccionaraLocal: "Armado manual en depósito",
    motivo: "Temporada verano",
    sistema: "UNIFY",
    modificacion: "COMBO FUTURO",
    fecha: new Date('2025-02-01')
  }
];

export const getPromocionesVigentes = (): Promocion[] => {
  const hoy = new Date();
  return promociones.filter(promo => 
    promo.estado === "ACTIVO" && 
    promo.desde && promo.hasta &&
    promo.desde <= hoy && 
    promo.hasta >= hoy
  );
};

export const getPromocionesPorSeccion = (seccion: number): Promocion[] => {
  return promociones.filter(promo => promo.seccion === seccion);
};

export const getPromocionesPorTienda = (tienda: string): Promocion[] => {
  return promociones.filter(promo => 
    promo.local === "Todas las sucursales" || 
    promo.local?.includes(tienda)
  );
}; 