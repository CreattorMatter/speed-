// Lista de plantillas disponibles

// Definir las interfaces
export interface Combos {
    label: string;
    value: string;
  }
export const COMBOS: Combos[] = [
    { label: "ANTES/AHORA con DTO", value: "antes_ahora_dto" },
    { label: "ANTES/AHORA EN CUOTAS con DTO", value: "antes_ahora_cuotas_dto" },
    { label: "ANTES/AHORA FLOORING con DTO", value: "antes_ahora_flooring_dto" },
    { label: "COMBO con DTO", value: "combo_dto" },
    { label: "COMBO CUOTAS con DTO", value: "combo_cuotas_dto" },
    { label: "PROMO 3x2 CON PRECIO", value: "promo_3x2_precio" },
    { label: "PROMO 3x2 PLANO CATEGORIA COMBINABLE", value: "promo_3x2_plano_categoria_combinable" },
    { label: "PROMO 3x2 PLANO CATEGORIA", value: "promo_3x2_plano_categoria" },
    { label: "DESCUENTO EN LA 2da UNIDAD", value: "descuento_2da_unidad" },
    { label: "DESCUENTO PLANO CATEGORIA", value: "descuento_plano_categoria" },
];