// Detecta qué campos utiliza cada plantilla específica

import { extractDynamicFields } from './productFieldsMap';

export interface TemplateFieldConfig {
  nombre: boolean;
  precioActual: boolean;
  porcentaje: boolean;
  sap: boolean;
  fechasDesde: boolean;
  fechasHasta: boolean;
  origen: boolean;
  precioSinImpuestos: boolean;
}

// Configuración de campos por familia de plantillas
const TEMPLATE_FIELD_CONFIGS: Record<string, TemplateFieldConfig> = {
  // Ladrillazos - Diferentes variantes según el tipo
  'Ladrillazos': {
    nombre: true,
    precioActual: true,
    porcentaje: true, // Depende del tipo específico
    sap: true,
    fechasDesde: true,
    fechasHasta: true,
    origen: true,
    precioSinImpuestos: true,
  },
  
  // Superprecio
  'Superprecio': {
    nombre: true,
    precioActual: true,
    porcentaje: true,
    sap: true,
    fechasDesde: true,
    fechasHasta: true,
    origen: false,
    precioSinImpuestos: true,
  },
  
  // Constructor
  'Constructor': {
    nombre: true,
    precioActual: true,
    porcentaje: false, // Constructor no usa porcentajes
    sap: true,
    fechasDesde: false,
    fechasHasta: false,
    origen: true,
    precioSinImpuestos: true,
  },
  
  // Mundo Experto
  'Mundo Experto': {
    nombre: true,
    precioActual: true,
    porcentaje: true,
    sap: true,
    fechasDesde: false,
    fechasHasta: false,
    origen: false,
    precioSinImpuestos: true,
  },
  
  // Feria de descuentos
  'Feria de descuentos': {
    nombre: true,
    precioActual: true,
    porcentaje: true,
    sap: true,
    fechasDesde: true,
    fechasHasta: true,
    origen: false,
    precioSinImpuestos: false,
  }
};

// Configuración específica por tipo de promoción de Ladrillazos
const LADRILLAZOS_SPECIFIC_CONFIGS: Record<string, Partial<TemplateFieldConfig>> = {
  'precio_lleno': {
    porcentaje: false, // Precio lleno no tiene descuento
  },
  'flooring': {
    porcentaje: false,
  },
  'combo_dto': {
    porcentaje: true,
  },
  'descuento_plano_categoria': {
    porcentaje: true,
  },
  'antes_ahora_dto': {
    porcentaje: true,
  },
  'antes_ahora_flooring_dto': {
    porcentaje: true,
  },
  'flooring_cuotas': {
    porcentaje: false,
  },
  'cuotas': {
    porcentaje: false,
  },
  'promo_3x2_precio': {
    porcentaje: false,
  },
  'promo_3x2_plano_categoria': {
    porcentaje: false,
  },
  'promo_3x2_plano_categoria_combinable': {
    porcentaje: false,
  },
  'descuento_2da_unidad': {
    porcentaje: true,
  },
  'antes_ahora_cuotas_dto': {
    porcentaje: true,
  }
};

export const getTemplateFields = (
  plantillaFamily: string, 
  plantillaType?: string
): TemplateFieldConfig => {
  // Configuración base de la familia
  const baseConfig = TEMPLATE_FIELD_CONFIGS[plantillaFamily] || {
    nombre: true,
    precioActual: true,
    porcentaje: true,
    sap: true,
    fechasDesde: true,
    fechasHasta: true,
    origen: true,
    precioSinImpuestos: true,
  };

  // Si es Ladrillazos, aplicar configuración específica del tipo
  if (plantillaFamily === 'Ladrillazos' && plantillaType) {
    const specificConfig = LADRILLAZOS_SPECIFIC_CONFIGS[plantillaType];
    if (specificConfig) {
      return {
        ...baseConfig,
        ...specificConfig
      };
    }
  }

  return baseConfig;
};

export const getAvailableFields = (config: TemplateFieldConfig): Array<keyof TemplateFieldConfig> => {
  return Object.entries(config)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([fieldName]) => fieldName as keyof TemplateFieldConfig);
};

export const getFieldLabel = (fieldName: keyof TemplateFieldConfig | string): string => {
  const labels: Record<string, string> = {
    nombre: 'Nombre del producto',
    precioActual: 'Precio actual',
    porcentaje: 'Porcentaje de descuento',
    sap: 'Código SAP',
    fechasDesde: 'Fecha desde',
    fechasHasta: 'Fecha hasta',
    origen: 'Origen',
    precioSinImpuestos: 'Precio sin impuestos',
    descripcion: 'Descripción del producto'
  };
  
  return labels[fieldName as string] || fieldName as string;
};

export type FieldType = 'text' | 'price' | 'percentage' | 'date' | 'sap' | 'currency';

export const getFieldType = (fieldName: keyof TemplateFieldConfig | string): FieldType => {
  const types: Record<string, FieldType> = {
    nombre: 'text',
    precioActual: 'currency',
    porcentaje: 'percentage',
    sap: 'sap',
    fechasDesde: 'date',
    fechasHasta: 'date',
    origen: 'text',
    precioSinImpuestos: 'currency',
    descripcion: 'text'
  };
  
  return types[fieldName as string] || 'text';
};

/**
 * 🚀 NUEVA: Detecta automáticamente los campos dinámicos disponibles en una plantilla
 * 🔧 ACTUALIZADA: Funciona con la estructura REAL de la BD (dynamicTemplate) usando sistema universal
 */
export const detectTemplateFields = (components: any[]): string[] => {
  const detectedFields = new Set<string>();

  components.forEach(component => {
    // 🔧 ESTRUCTURA REAL: Buscar fieldType: "dynamic" y dynamicTemplate
    if (component.type === 'field-dynamic-text' && 
        component.content?.fieldType === 'dynamic' && 
        component.content?.dynamicTemplate) {
      
      const dynamicTemplate = component.content.dynamicTemplate;
      
      // 🎯 NUEVA LÓGICA: Usar extractDynamicFields para extraer todos los campos de templates complejos
      const extractedFields = extractDynamicFields(dynamicTemplate);
      
      extractedFields.forEach((fieldId: string) => {
        // Mapear fieldId del sistema moderno a nuestros campos internos para compatibilidad
        const fieldMapping: Record<string, string> = {
          'product_name': 'nombre',
          'product_price': 'precioActual',
          'product_sku': 'sap',
          'product_brand': 'origen',
          'price_original': 'precioActual',
          'price_final': 'precioActual',
          'price_discount': 'precioActual',
          'discount_percentage': 'porcentaje',
          'price_without_tax': 'precioSinImpuestos', // ✅ CORREGIDO: era 'price_without_taxes'
          'price_without_taxes': 'precioSinImpuestos',
          'promotion_start_date': 'fechasDesde',
          'promotion_end_date': 'fechasHasta'
        };
        
        const internalField = fieldMapping[fieldId];
        if (internalField) {
          detectedFields.add(internalField);
          console.log(`🔍 Campo detectado BD: [${fieldId}] en "${dynamicTemplate}" → ${internalField}`);
        } else {
          console.warn(`⚠️ Campo no reconocido: [${fieldId}] en "${dynamicTemplate}"`);
        }
      });
    }
    
    // 🔧 COMPATIBILIDAD: Mantener soporte para textConfig (por si hay plantillas mixtas)
    if (component.type === 'field-dynamic-text' && component.content?.textConfig?.contentType) {
      const contentType = component.content.textConfig.contentType;
      
      // Mapear contentType a nuestros campos internos
      const fieldMapping: Record<string, string> = {
        'product-name': 'nombre',
        'product-description': 'descripcion',
        'product-sku': 'sap',
        'product-brand': 'origen',
        'price-original': 'precioActual',
        'price-final': 'precioActual',
        'price-discount': 'precioActual', // Se calcula desde precio original
        'discount-percentage': 'porcentaje',
        'price-without-taxes': 'precioSinImpuestos',
        'promotion-start-date': 'fechasDesde',
        'promotion-end-date': 'fechasHasta'
      };
      
      const internalField = fieldMapping[contentType];
      if (internalField) {
        detectedFields.add(internalField);
        console.log(`🔍 Campo detectado textConfig: ${contentType} → ${internalField}`);
      }
    }
  });

  const fieldsArray = Array.from(detectedFields);
  console.log(`📋 Campos totales detectados en plantilla:`, fieldsArray);
  return fieldsArray;
};

/**
 * 🚀 NUEVA: Obtiene campos por defecto según la familia cuando las plantillas están vacías
 * Fallback para when detectTemplateFields returns empty array
 */
export const getFallbackFieldsForFamily = (familyName: string): string[] => {
  const familyFieldMap: Record<string, string[]> = {
    'Black': ['nombre', 'precioActual', 'porcentaje', 'sap', 'fechasDesde', 'fechasHasta'],
    'Ladrillazos': ['nombre', 'precioActual', 'porcentaje', 'sap', 'fechasDesde', 'fechasHasta', 'origen', 'precioSinImpuestos'],
    'Hot Sale': ['nombre', 'precioActual', 'porcentaje', 'fechasDesde', 'fechasHasta'],
    'Superprecio': ['nombre', 'precioActual', 'sap', 'precioSinImpuestos'],
    'Constructor': ['nombre', 'precioActual', 'sap', 'origen', 'precioSinImpuestos'],
    'Mundo Experto': ['nombre', 'precioActual', 'porcentaje', 'sap', 'precioSinImpuestos'],
    'Feria de descuentos': ['nombre', 'precioActual', 'porcentaje', 'sap', 'fechasDesde', 'fechasHasta']
  };
  
  const fallbackFields = familyFieldMap[familyName] || ['nombre', 'precioActual', 'sap'];
  console.log(`🎯 Usando campos fallback para familia "${familyName}":`, fallbackFields);
  return fallbackFields;
}; 