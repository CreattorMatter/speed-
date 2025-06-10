export type FieldSource = 'SAP' | 'SPID' | 'Manual' | 'Macro';
export type FieldType = 'texto' | 'numero' | 'moneda' | 'fecha' | 'booleano' | 'info';
export type FieldGroup = 'Precio' | 'Descripción' | 'Descuento' | 'Producto' | 'Legal' | 'Promoción' | 'Imagen' | 'Fecha';

export interface FieldDependency {
  field: string;
  condition?: string;
}

export interface VisibilityRule {
  solo_si?: string;
  ocultar_si?: string;
  conditions?: FieldDependency[];
}

export interface PromotionField {
  id: string;
  etiqueta: string;
  grupo: FieldGroup;
  fuente: FieldSource;
  tipo: FieldType;
  editable: boolean;
  tooltip: string;
  dependencias: string[];
  logica: string;
  requerido_en_plantillas: string[];
  visibilidad_condicional?: VisibilityRule;
  valor_defecto?: string | number | boolean;
  formato?: string; // Para formatear números, fechas, etc.
  validacion?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
  opciones?: string[]; // Para campos tipo select
  icono?: string;
  color?: string;
}

export interface FieldCategory {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  campos: PromotionField[];
}

// Campos predefinidos del sistema
export const PROMOTION_FIELDS: PromotionField[] = [
  // GRUPO: Precio
  {
    id: "precio_ahora_contado",
    etiqueta: "Precio AHORA contado",
    grupo: "Precio",
    fuente: "SAP",
    tipo: "moneda",
    editable: false,
    tooltip: "Se carga automáticamente desde SAP si hay SKU definido.",
    dependencias: ["sku"],
    logica: "Extraído desde SAP. Corresponde al precio final con descuento aplicado.",
    requerido_en_plantillas: ["Antes/Ahora", "Combo Cuotas"],
    visibilidad_condicional: {
      solo_si: "hay_descuento"
    },
    icono: "💰",
    color: "#10b981"
  },
  {
    id: "precio_antes",
    etiqueta: "Precio ANTES",
    grupo: "Precio",
    fuente: "SAP",
    tipo: "moneda",
    editable: false,
    tooltip: "Precio original sin descuento aplicado.",
    dependencias: ["sku"],
    logica: "Precio base extraído desde SAP antes de aplicar descuentos.",
    requerido_en_plantillas: ["Antes/Ahora", "Precio Lleno"],
    icono: "🏷️",
    color: "#ef4444"
  },
  {
    id: "precio_cuota",
    etiqueta: "Precio en cuotas",
    grupo: "Precio",
    fuente: "SAP",
    tipo: "moneda",
    editable: true,
    tooltip: "Precio financiado dividido en cuotas.",
    dependencias: ["sku", "cantidad_cuotas"],
    logica: "Calcula el precio financiado según las cuotas disponibles.",
    requerido_en_plantillas: ["Combo Cuotas", "Cuota simple 12 s/int"],
    icono: "💳",
    color: "#3b82f6"
  },
  {
    id: "precio_lista",
    etiqueta: "Precio de lista",
    grupo: "Precio",
    fuente: "SAP",
    tipo: "moneda",
    editable: false,
    tooltip: "Precio de lista oficial del fabricante.",
    dependencias: ["sku"],
    logica: "Precio sugerido por el fabricante extraído desde SAP.",
    requerido_en_plantillas: ["Precio Lleno"],
    icono: "📋",
    color: "#8b5cf6"
  },

  // GRUPO: Descuento
  {
    id: "porcentaje_descuento",
    etiqueta: "% Descuento",
    grupo: "Descuento",
    fuente: "SPID",
    tipo: "numero",
    editable: true,
    tooltip: "Porcentaje de descuento aplicado al producto.",
    dependencias: ["precio_antes", "precio_ahora_contado"],
    logica: "Calcula automáticamente según diferencia de precios o se ingresa manual.",
    requerido_en_plantillas: ["Antes/Ahora con dto", "Descuento plano categoría"],
    formato: "0%",
    validacion: { min: 0, max: 100 },
    icono: "🎯",
    color: "#dc2626"
  },
  {
    id: "descuento_pesos",
    etiqueta: "Descuento en $",
    grupo: "Descuento",
    fuente: "SPID",
    tipo: "moneda",
    editable: true,
    tooltip: "Monto fijo de descuento en pesos.",
    dependencias: ["precio_antes"],
    logica: "Diferencia entre precio antes y precio final.",
    requerido_en_plantillas: ["Descuento plano categoría"],
    icono: "💸",
    color: "#dc2626"
  },

  // GRUPO: Producto
  {
    id: "sku",
    etiqueta: "SKU",
    grupo: "Producto",
    fuente: "Manual",
    tipo: "texto",
    editable: true,
    tooltip: "Código único del producto para vincular con SAP.",
    dependencias: [],
    logica: "Código que vincula con la base de datos de productos.",
    requerido_en_plantillas: ["Antes/Ahora", "Precio Lleno", "Combo Cuotas"],
    validacion: { pattern: "^[A-Z0-9]{6,12}$", required: true },
    icono: "🏷️",
    color: "#f59e0b"
  },
  {
    id: "nombre_producto",
    etiqueta: "Nombre del producto",
    grupo: "Producto",
    fuente: "SAP",
    tipo: "texto",
    editable: true,
    tooltip: "Nombre comercial del producto.",
    dependencias: ["sku"],
    logica: "Se extrae desde SAP usando el SKU o se ingresa manualmente.",
    requerido_en_plantillas: ["Flooring", "Imágenes personalizadas"],
    icono: "📦",
    color: "#06b6d4"
  },
  {
    id: "marca",
    etiqueta: "Marca",
    grupo: "Producto",
    fuente: "SAP",
    tipo: "texto",
    editable: false,
    tooltip: "Marca del producto extraída desde SAP.",
    dependencias: ["sku"],
    logica: "Información de marca vinculada al SKU en SAP.",
    requerido_en_plantillas: ["Mundo Experto"],
    icono: "🏢",
    color: "#6366f1"
  },
  {
    id: "imagen_producto",
    etiqueta: "Imagen del producto",
    grupo: "Producto",
    fuente: "Manual",
    tipo: "info",
    editable: true,
    tooltip: "Imagen principal del producto para mostrar en la promoción.",
    dependencias: [],
    logica: "Imagen subida manualmente o extraída desde catálogo.",
    requerido_en_plantillas: ["Imágenes personalizadas", "Flooring"],
    icono: "🖼️",
    color: "#8b5cf6"
  },

  // GRUPO: Promoción
  {
    id: "tipo_promocion",
    etiqueta: "Tipo de promoción",
    grupo: "Promoción",
    fuente: "Manual",
    tipo: "texto",
    editable: true,
    tooltip: "Tipo de oferta (2x1, 3x2, combo, etc.)",
    dependencias: [],
    logica: "Define el tipo de promoción a mostrar.",
    requerido_en_plantillas: ["Promo 3x2 con precio"],
    opciones: ["2x1", "3x2", "Combo", "Pack", "Liquidación"],
    icono: "🎁",
    color: "#ec4899"
  },
  {
    id: "cantidad_cuotas",
    etiqueta: "Cantidad de cuotas",
    grupo: "Promoción",
    fuente: "Manual",
    tipo: "numero",
    editable: true,
    tooltip: "Número de cuotas para financiación.",
    dependencias: [],
    logica: "Define en cuántas cuotas se puede financiar la compra.",
    requerido_en_plantillas: ["Combo Cuotas", "Cuota simple 12 s/int"],
    validacion: { min: 1, max: 60 },
    icono: "🔢",
    color: "#10b981"
  },
  {
    id: "texto_promocion",
    etiqueta: "Texto promocional",
    grupo: "Promoción",
    fuente: "Manual",
    tipo: "texto",
    editable: true,
    tooltip: "Texto libre para describir la promoción.",
    dependencias: [],
    logica: "Mensaje promocional personalizado.",
    requerido_en_plantillas: ["Imágenes personalizadas"],
    icono: "✨",
    color: "#f59e0b"
  },

  // GRUPO: Legal
  {
    id: "condiciones",
    etiqueta: "Condiciones",
    grupo: "Legal",
    fuente: "Macro",
    tipo: "texto",
    editable: true,
    tooltip: "Condiciones legales de la promoción.",
    dependencias: [],
    logica: "Texto legal estándar o personalizado según la promoción.",
    requerido_en_plantillas: ["Antes/Ahora", "Combo Cuotas"],
    valor_defecto: "Promoción válida hasta agotar stock. No acumulable con otras ofertas.",
    icono: "⚖️",
    color: "#6b7280"
  },
  {
    id: "vigencia",
    etiqueta: "Vigencia",
    grupo: "Legal",
    fuente: "Manual",
    tipo: "fecha",
    editable: true,
    tooltip: "Fecha hasta la cual es válida la promoción.",
    dependencias: [],
    logica: "Fecha límite de la promoción.",
    requerido_en_plantillas: ["Temporada"],
    formato: "DD/MM/YYYY",
    icono: "📅",
    color: "#059669"
  }
];

export const FIELD_CATEGORIES: FieldCategory[] = [
  {
    id: "precio",
    nombre: "Precios",
    descripcion: "Información de precios y valores monetarios",
    icono: "💰",
    color: "#10b981",
    campos: PROMOTION_FIELDS.filter(f => f.grupo === "Precio")
  },
  {
    id: "descuento",
    nombre: "Descuentos",
    descripcion: "Porcentajes y montos de descuento",
    icono: "🎯",
    color: "#dc2626",
    campos: PROMOTION_FIELDS.filter(f => f.grupo === "Descuento")
  },
  {
    id: "producto",
    nombre: "Producto",
    descripcion: "Información del producto y SKU",
    icono: "📦",
    color: "#06b6d4",
    campos: PROMOTION_FIELDS.filter(f => f.grupo === "Producto")
  },
  {
    id: "promocion",
    nombre: "Promoción",
    descripcion: "Detalles específicos de la oferta",
    icono: "🎁",
    color: "#ec4899",
    campos: PROMOTION_FIELDS.filter(f => f.grupo === "Promoción")
  },
  {
    id: "legal",
    nombre: "Legal",
    descripcion: "Términos y condiciones",
    icono: "⚖️",
    color: "#6b7280",
    campos: PROMOTION_FIELDS.filter(f => f.grupo === "Legal")
  }
]; 