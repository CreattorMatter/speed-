// Mapeo de plantillas a sus tipos de promoción disponibles
import { COMBOS, Combos } from './combos';
import { PLANTILLAS, TemplateOption } from './templates';

// Define qué combos (tipos de promoción) están disponibles para cada plantilla
export const PLANTILLA_COMBOS: Record<string, string[]> = {
  "Superprecio": [
    "antes_ahora_dto",
    "antes_ahora_cuotas_dto",
    "antes_ahora_flooring_dto"
  ],
  "Feria de descuentos": [
    "combo_dto",
    "combo_cuotas_dto",
    "descuento_plano_categoria"
  ],
  "Financiación": [
    "antes_ahora_cuotas_dto",
    "combo_cuotas_dto"
  ],
  "Troncales": [
    "antes_ahora_dto",
    "combo_dto"
  ],
  "Nuevo": [
    "antes_ahora_dto",
    "combo_dto"
  ],
  "Temporada": [
    "antes_ahora_dto",
    "combo_dto",
    "promo_3x2_precio"
  ],
  "Hot Sale": [
    "antes_ahora_dto",
    "combo_dto",
    "promo_3x2_precio",
    "promo_3x2_plano_categoria",
    "promo_3x2_plano_categoria_combinable"
  ],
  "Precios que la rompen": [
    "antes_ahora_dto",
    "combo_dto"
  ],
  "Ladrillazos": [
    "descuento_plano_categoria",
    "antes_ahora_dto",
    "combo_dto",
    "promociones_especiales"
  ],
  "Mundo Experto": [
    "antes_ahora_dto",
    "combo_dto"
  ],
  "Constructor": [
    "antes_ahora_dto",
    "combo_dto",
    "descuento_plano_categoria"
  ],
  "Multi Productos": [
    "promo_3x2_precio",
    "promo_3x2_plano_categoria",
    "promo_3x2_plano_categoria_combinable",
    "descuento_2da_unidad",
    "descuento_plano_categoria"
  ]
};

// Función para obtener los combos disponibles para una plantilla específica
export const getCombosPorPlantilla = (plantillaValue: string | undefined): Combos[] => {
  if (!plantillaValue) return COMBOS; // Si no hay plantilla seleccionada, devolver todos los combos
  
  const comboIds = PLANTILLA_COMBOS[plantillaValue] || [];
  if (comboIds.length === 0) return COMBOS; // Si no hay combos definidos para esta plantilla, devolver todos
  
  return COMBOS.filter(combo => comboIds.includes(combo.value));
};

// Función para obtener las plantillas disponibles para un tipo de promoción específico
export const getPlantillasPorCombo = (comboValue: string | undefined): TemplateOption[] => {
  if (!comboValue) return PLANTILLAS; // Si no hay combo seleccionado, devolver todas las plantillas
  
  // Buscar todas las plantillas que incluyen este combo
  const plantillasCompatibles = Object.entries(PLANTILLA_COMBOS)
    .filter(([_, combos]) => combos.includes(comboValue))
    .map(([plantilla]) => plantilla);
  
  if (plantillasCompatibles.length === 0) return PLANTILLAS; // Si no hay plantillas compatibles, devolver todas
  
  return PLANTILLAS.filter(plantilla => plantillasCompatibles.includes(plantilla.value));
};
