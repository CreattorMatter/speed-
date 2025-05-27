// Detecta qué campos utiliza cada plantilla específica

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

export const getFieldLabel = (fieldName: keyof TemplateFieldConfig): string => {
  const labels: Record<keyof TemplateFieldConfig, string> = {
    nombre: 'Nombre del producto',
    precioActual: 'Precio actual',
    porcentaje: 'Porcentaje de descuento',
    sap: 'Código SAP',
    fechasDesde: 'Fecha desde',
    fechasHasta: 'Fecha hasta',
    origen: 'Origen',
    precioSinImpuestos: 'Precio sin impuestos'
  };
  
  return labels[fieldName];
};

export const getFieldType = (fieldName: keyof TemplateFieldConfig): 'text' | 'price' | 'percentage' | 'date' | 'sap' => {
  const types: Record<keyof TemplateFieldConfig, 'text' | 'price' | 'percentage' | 'date' | 'sap'> = {
    nombre: 'text',
    precioActual: 'price',
    porcentaje: 'percentage',
    sap: 'sap',
    fechasDesde: 'date',
    fechasHasta: 'date',
    origen: 'text',
    precioSinImpuestos: 'price'
  };
  
  return types[fieldName];
}; 