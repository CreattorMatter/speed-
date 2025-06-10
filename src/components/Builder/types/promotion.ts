export type PromotionFamily = 
  | 'Superprecio'
  | 'Feria de descuentos'
  | 'Financiación'
  | 'Troncales'
  | 'Nuevo'
  | 'Temporada'
  | 'Oportuneasy'
  | 'Precios que la rompen'
  | 'Ladrillazos'
  | 'Herramientas'
  | 'Club Easy'
  | 'Cencopay'
  | 'Mundo Experto';

export type TemplateType =
  | 'Precio Lleno'
  | 'Antes/Ahora con dto'
  | 'Antes/Ahora'
  | 'Flooring'
  | 'Combo Cuotas'
  | 'Promo 3x2 con precio'
  | 'Descuento plano categoría'
  | 'Cuota simple 12 s/int'
  | 'Imágenes personalizadas';

export type FieldSource = 'SAP' | 'SPID' | 'Manual' | 'Macro';
export type FieldType = 'texto' | 'número' | 'moneda' | 'fecha' | 'booleano' | 'info';
export type FieldGroup = 'Precio' | 'Descripción' | 'Descuento' | 'SKU' | 'Imagen' | 'Otros';

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
  requerido_en_plantillas: TemplateType[];
  visibilidad_condicional?: {
    solo_si: string;
  };
}

export interface PromotionTemplate {
  id: string;
  nombre: TemplateType;
  familia: PromotionFamily;
  descripcion: string;
  campos_requeridos: string[];
  campos_opcionales: string[];
  imagen_preview: string;
  configuracion: {
    width: number;
    height: number;
    background?: string;
  };
}

export interface PromotionFamilyConfig {
  id: PromotionFamily;
  nombre: string;
  descripcion: string;
  plantillas_compatibles: TemplateType[];
  campos_disponibles: PromotionField[];
  imagen_preview?: string;
}

// Configuración de compatibilidad entre familias y plantillas
export const FAMILY_TEMPLATE_COMPATIBILITY: Record<PromotionFamily, TemplateType[]> = {
  'Superprecio': ['Precio Lleno', 'Antes/Ahora', 'Antes/Ahora con dto'],
  'Feria de descuentos': ['Precio Lleno', 'Antes/Ahora', 'Descuento plano categoría'],
  'Financiación': ['Combo Cuotas', 'Cuota simple 12 s/int'],
  'Troncales': ['Precio Lleno', 'Antes/Ahora'],
  'Nuevo': ['Precio Lleno', 'Imágenes personalizadas'],
  'Temporada': ['Precio Lleno', 'Antes/Ahora', 'Descuento plano categoría'],
  'Oportuneasy': ['Precio Lleno', 'Antes/Ahora', 'Combo Cuotas'],
  'Precios que la rompen': ['Precio Lleno', 'Antes/Ahora', 'Antes/Ahora con dto'],
  'Ladrillazos': ['Precio Lleno', 'Antes/Ahora', 'Descuento plano categoría'],
  'Herramientas': ['Precio Lleno', 'Antes/Ahora', 'Imágenes personalizadas'],
  'Club Easy': ['Precio Lleno', 'Antes/Ahora', 'Combo Cuotas'],
  'Cencopay': ['Combo Cuotas', 'Cuota simple 12 s/int'],
  'Mundo Experto': ['Precio Lleno', 'Imágenes personalizadas']
}; 