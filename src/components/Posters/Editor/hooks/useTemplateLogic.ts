import { useSelector } from 'react-redux';
import { 
  selectPlantillaSeleccionada, 
  selectComboSeleccionado 
} from '../../../../store/features/poster/posterSlice';
import { type TemplateModel } from '../../../../constants/posters/templates';

export const useTemplateLogic = (PLANTILLA_MODELOS: Record<string, TemplateModel[]>) => {
  const plantillaSeleccionada = useSelector(selectPlantillaSeleccionada);
  const comboSeleccionado = useSelector(selectComboSeleccionado);

  // Función para obtener el nombre del tipo de promoción basado en el ID del modelo
  const getPromoTypeFromModelId = (modelId: string): string => {
    const ladrillazoPromoTypes: Record<string, string> = {
      "ladrillazos-1": "PRECIO LLENO",
      "ladrillazos-2": "FLOORING", 
      "ladrillazos-3": "COMBO",
      "ladrillazos-4": "DESCUENTO PLANO",
      "ladrillazos-5": "ANTES/AHORA",
      "ladrillazos-6": "ANTES/AHORA FLOORING",
      "ladrillazos-7": "FLOORING CUOTAS",
      "ladrillazos-8": "CUOTAS",
      "ladrillazos-9": "ANTES/AHORA FLOORING",
      "ladrillazos-10": "FLOORING CUOTAS",
      "ladrillazos-11": "COMBO",
      "ladrillazos-12": "PROMO 3X2",
      "ladrillazos-13": "3X2 PLANO",
      "ladrillazos-14": "3X2 COMBINABLE", 
      "ladrillazos-15": "DESCUENTO PLANO",
      "ladrillazos-16": "2DA UNIDAD",
      "ladrillazos-17": "CUOTAS",
      "ladrillazos-18": "ANTES/AHORA CUOTAS"
    };
    
    return ladrillazoPromoTypes[modelId] || `Modelo ${modelId.split('-')[1] || modelId}`;
  };

  // Obtener y filtrar los modelos disponibles para la plantilla seleccionada
  const getFilteredModelos = (): TemplateModel[] => {
    if (!plantillaSeleccionada?.value) {
      return [];
    }
    
    const modelos = PLANTILLA_MODELOS[plantillaSeleccionada.value] || [];
    
    // Para Ladrillazos, filtrar según la plantilla específica
    if (plantillaSeleccionada.value === 'Ladrillazos') {
      // Si no hay plantilla seleccionada, mostrar todas las 18
      if (!comboSeleccionado) {
        return modelos;
      }
      
      // Mapeo específico de plantillas a plantillas de Ladrillazos
      const ladrillazosMappings: Record<string, string[]> = {
        "precio_lleno": ["ladrillazos-1"], // PRECIO LLENO
        "flooring": ["ladrillazos-2"], // FLOORING
        "combo_dto": ["ladrillazos-3", "ladrillazos-11"], // COMBO
        "descuento_plano_categoria": ["ladrillazos-4", "ladrillazos-15"], // DESCUENTO PLANO CATEGORIA
        "antes_ahora_dto": ["ladrillazos-5"], // ANTES/AHORA CON DTO
        "antes_ahora_flooring_dto": ["ladrillazos-6", "ladrillazos-9"], // ANTES/AHORA FLOORING
        "flooring_cuotas": ["ladrillazos-7", "ladrillazos-10"], // FLOORING EN CUOTAS
        "cuotas": ["ladrillazos-8", "ladrillazos-17"], // CUOTAS
        "promo_3x2_precio": ["ladrillazos-12"], // PROMO 3X2 CON PRECIO
        "promo_3x2_plano_categoria": ["ladrillazos-13"], // PROMO 3X2 PLANO CATEGORIA
        "promo_3x2_plano_categoria_combinable": ["ladrillazos-14"], // PROMO 3X2 COMBINABLE
        "descuento_2da_unidad": ["ladrillazos-16"], // DESCUENTO EN LA 2DA UNIDAD
        "antes_ahora_cuotas_dto": ["ladrillazos-18"], // ANTES/AHORA EN CUOTAS CON DTO
      };
      
      const allowedIds = ladrillazosMappings[comboSeleccionado.value] || [];
      
      // Si no hay mapeo específico, mostrar todas
      if (allowedIds.length === 0) {
        return modelos;
      }
      
      // Filtrar solo las plantillas correspondientes al tipo de promoción
      const filtered = modelos.filter(modelo => allowedIds.includes(modelo.id));
      return filtered;
    }
    
    // Si no hay plantilla seleccionada para otras plantillas, mostrar todas
    if (!comboSeleccionado) {
      return modelos;
    }
    
    // Aplicar filtros según la plantilla y plantilla para otras familias
    return modelos;
  };

  const filteredModelos = getFilteredModelos();

  return {
    plantillaSeleccionada,
    comboSeleccionado,
    filteredModelos,
    getPromoTypeFromModelId,
    getFilteredModelos
  };
}; 