// =====================================
// ENTIDADES REALES DEL SISTEMA ERP
// =====================================

// 🏪 ENTIDAD TIENDA
export interface Tienda {
  numero: string;        // Código de tienda (ej: "E000")
  tienda: string;        // Nombre de la tienda (ej: "Easy Casa Central")
}

// 📦 ENTIDAD SECCIÓN
export interface Seccion {
  numero: number;        // Código numérico (ej: 13)
  seccion: string;       // Nombre de sección (ej: "Ferretería")
}

// 🎁 ENTIDAD PROMOCIÓN
export interface Promocion {
  estado?: string;                          // Flag de estado
  web?: string;                            // Flag web
  codigoJerarquia?: number;                // SKU o código adicional
  codPromoNCR?: number;                    // ID sistema promociones
  desde?: Date;                            // Fecha inicio vigencia
  hasta?: Date;                            // Fecha fin vigencia
  seccion?: number;                        // Familia productos (referencia a Seccion)
  numeroCombo?: number;                    // ID del combo
  descripcionCombo?: string;               // "TABLÓN + BASTIDOR X 2 + DIAGONAL X 2"
  cantidadComponente?: number;             // Cantidad de cada SKU en combo
  ean?: number;                            // EAN del producto afectado
  descripcion?: string;                    // Descripción del producto
  precioVentaPromocional?: string;         // "5x4", "3x2", "20%", precio fijo
  local?: string;                          // Tiendas donde aplica
  comoAccionaraLocal?: string;            // Instrucciones para tienda
  motivo?: string;                         // Razón de la promoción
  bpm?: string;                            // Campo BPM
  sistema?: string;                        // "NCR" / "UNIFY"
  modificacion?: string;                   // "CAMBIO DE PRECIO", "BAJA COMERCIAL"
  fecha?: Date;                            // Fecha de aplicación/impresión
}

// 🛍️ ENTIDAD PRODUCTO REAL (Reemplaza Product completamente)
export interface ProductoReal {
  // 🏷️ IDENTIFICADORES ÚNICOS
  id: string;                              // ID interno (para compatibilidad)
  tienda: string;                          // Código de tienda (ej: "E000")
  sku: number;                             // Código identificador del producto
  ean: number;                             // Código de barras
  eanPrincipal?: boolean;                  // Si es EAN principal (true/false)
  
  // 📝 INFORMACIÓN DESCRIPTIVA
  descripcion: string;                     // Nombre del producto
  umvExt?: string;                         // Unidad de medida (Kg, L, Unidad)
  
  // 💰 SISTEMA DE PRECIOS COMPLETO
  precio?: number;                         // Precio actual de venta al público
  precioAnt?: number;                      // Precio anterior (para antes/ahora)
  basePrice?: number;                      // Precio sin impuestos nacionales
  ppum?: number;                           // Precio por unidad alternativa
  unidadPpumExt?: string;                  // Unidad de medida alternativa
  
  // 📦 CLASIFICACIÓN JERÁRQUICA COMPLETA
  seccion?: string;                        // Familia (ej: "Ferretería")
  grupo?: string;                          // Clasificación intermedia
  rubro?: string;                          // Categoría específica  
  subRubro?: string;                       // Subcategoría específica
  
  // 🌍 ORIGEN Y MARCA
  origen?: string;                         // Código país de origen
  paisTexto?: string;                      // Descripción del país
  marcaTexto?: string;                     // Marca del producto
  
  // 📦 INVENTARIO
  stockDisponible?: number;                // Stock disponible en tienda
  
  // 🎨 CAMPOS ADICIONALES (para compatibilidad y UI)
  imageUrl?: string;                       // URL de imagen del producto
  category?: string;                       // Categoría (mapeada desde seccion)
  subCategory?: string;                    // Subcategoría (mapeada desde rubro)
  brand?: string;                          // Marca (mapeada desde marcaTexto)
  packageType?: string;                    // Tipo de empaque
  volume?: string;                         // Volumen (mapeado desde umvExt)
  name?: string;                           // Nombre (mapeado desde descripcion)
}

// =====================================
// TIPOS DE COMPATIBILIDAD
// =====================================

// Alias para compatibilidad con código existente
export type Product = ProductoReal;

// Tipo unión para todas las entidades
export type EntidadERP = ProductoReal | Tienda | Seccion | Promocion; 