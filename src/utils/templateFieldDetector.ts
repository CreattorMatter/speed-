// Detecta qué campos utiliza cada plantilla específica

import { extractDynamicFields } from './productFieldsMap';
import { DraggableComponentV3 } from '../features/builderV3/types';

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
          'price_previous': 'precioAnt',
          'product_sku': 'sap',
          'product_ean': 'ean',
          'product_brand': 'marcaTexto',
          'product_origin': 'origen',
          'stock_available': 'stock',
          'price_original': 'precioActual',
          'price_final': 'precioActual',
          'price_discount': 'precioActual',
          'discount_percentage': 'porcentaje',
          'price_without_tax': 'precioSinImpuestos',
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

// =====================================
// DETECTOR AUTOMÁTICO DE CAMPOS EDITABLES
// PARA FUNCIONALIDAD INLINE ESTILO SPID VIEJO
// =====================================

export interface EditableFieldInfo {
  componentId: string;
  fieldType: string;
  fieldKey: string;
  inputType: 'text' | 'number' | 'email' | 'tel';
  placeholder: string;
  maxLength?: number;
  isEditable: boolean;
  category: 'product' | 'price' | 'date' | 'text' | 'code';
  priority: number; // Para ordenar por importancia
}

/**
 * Detecta automáticamente todos los campos editables en una plantilla
 */
export const detectEditableFields = (components: DraggableComponentV3[]): EditableFieldInfo[] => {
  const editableFields: EditableFieldInfo[] = [];

  components.forEach(component => {
    const fieldInfo = analyzeComponentForEditing(component);
    if (fieldInfo.isEditable) {
      editableFields.push(fieldInfo);
    }
  });

  // Ordenar por prioridad (campos más importantes primero)
  return editableFields.sort((a, b) => b.priority - a.priority);
};

/**
 * Analiza un componente individual para determinar si es editable
 */
export const analyzeComponentForEditing = (component: DraggableComponentV3): EditableFieldInfo => {
  const { type, content } = component;
  
  // Información base del campo
  const baseInfo: Partial<EditableFieldInfo> = {
    componentId: component.id,
    isEditable: false,
    priority: 0
  };

  // Analizar según tipo de componente
  switch (type) {
    case 'field-dynamic-text':
      return analyzeDynamicTextField(component, baseInfo);
    
    case 'field-dynamic-date':
      return analyzeDateField(component, baseInfo);
    
    default:
      return {
        ...baseInfo,
        fieldType: 'unknown',
        fieldKey: 'unknown',
        inputType: 'text',
        placeholder: 'Campo no editable',
        category: 'text',
        priority: 0,
        isEditable: false
      } as EditableFieldInfo;
  }
};

/**
 * Analiza campos de texto dinámico
 */
const analyzeDynamicTextField = (component: DraggableComponentV3, baseInfo: Partial<EditableFieldInfo>): EditableFieldInfo => {
  const { content } = component;
  
  // Detectar tipo de campo desde staticValue (que puede contener plantillas dinámicas)
  if (content?.staticValue) {
    const dynamicFields = extractDynamicFields(content.staticValue);
    
    if (dynamicFields.length > 0) {
      const primaryField = dynamicFields[0]; // Usar el primer campo como principal
      return createFieldInfo(primaryField, component, baseInfo);
    }
    
    // Si no hay campos dinámicos, analizar el valor estático
    const fieldType = detectFieldTypeFromStaticValue(content.staticValue);
    return createFieldInfo(fieldType, component, baseInfo);
  }
  
  // Detectar desde textConfig (sistema legacy)
  if (content?.textConfig?.contentType) {
    const fieldType = mapTextConfigToFieldType(content.textConfig.contentType);
    return createFieldInfo(fieldType, component, baseInfo);
  }
  
  // Detectar desde text (propiedad alternativa)
  if (content?.text) {
    const dynamicFields = extractDynamicFields(content.text);
    
    if (dynamicFields.length > 0) {
      const primaryField = dynamicFields[0];
      return createFieldInfo(primaryField, component, baseInfo);
    }
    
    const fieldType = detectFieldTypeFromStaticValue(content.text);
    return createFieldInfo(fieldType, component, baseInfo);
  }
  
  // Campo de texto genérico
  return {
    ...baseInfo,
    fieldType: 'texto',
    fieldKey: 'staticValue',
    inputType: 'text',
    placeholder: 'Editar texto',
    category: 'text',
    priority: 3,
    isEditable: true
  } as EditableFieldInfo;
};

/**
 * Analiza campos de fecha
 */
const analyzeDateField = (component: DraggableComponentV3, baseInfo: Partial<EditableFieldInfo>): EditableFieldInfo => {
  return {
    ...baseInfo,
    fieldType: 'fecha',
    fieldKey: 'dateValue',
    inputType: 'text',
    placeholder: 'DD/MM/AAAA',
    category: 'date',
    priority: 4,
    isEditable: true,
    maxLength: 10
  } as EditableFieldInfo;
};

/**
 * Crea información completa del campo basándose en el tipo detectado
 */
const createFieldInfo = (fieldType: string, component: DraggableComponentV3, baseInfo: Partial<EditableFieldInfo>): EditableFieldInfo => {
  const fieldConfig = getFieldConfiguration(fieldType);
  
  return {
    ...baseInfo,
    fieldType,
    fieldKey: fieldConfig.fieldKey,
    inputType: fieldConfig.inputType,
    placeholder: fieldConfig.placeholder,
    category: fieldConfig.category,
    priority: fieldConfig.priority,
    isEditable: fieldConfig.isEditable,
    maxLength: fieldConfig.maxLength
  } as EditableFieldInfo;
};

/**
 * Configuración de diferentes tipos de campos
 */
const getFieldConfiguration = (fieldType: string) => {
  const configurations: Record<string, any> = {
    // Campos de producto
    'product_name': {
      fieldKey: 'descripcion',
      inputType: 'text',
      placeholder: 'Nombre del producto',
      category: 'product',
      priority: 10,
      isEditable: true,
      maxLength: 100
    },
    'product_sku': {
      fieldKey: 'sku',
      inputType: 'text',
      placeholder: 'Código SKU',
      category: 'code',
      priority: 6,
      isEditable: true,
      maxLength: 20
    },
    'product_brand': {
      fieldKey: 'marcaTexto',
      inputType: 'text',
      placeholder: 'Marca del producto',
      category: 'product',
      priority: 7,
      isEditable: true,
      maxLength: 50
    },
    
    // Campos de precios
    'product_price': {
      fieldKey: 'precio',
      inputType: 'number',
      placeholder: 'Ej: 99999',
      category: 'price',
      priority: 9,
      isEditable: true
    },
    'price_previous': {
      fieldKey: 'precioAnt',
      inputType: 'number',
      placeholder: 'Precio anterior',
      category: 'price',
      priority: 8,
      isEditable: true
    },
    'discount_percentage': {
      fieldKey: 'porcentaje',
      inputType: 'number',
      placeholder: 'Ej: 15',
      category: 'price',
      priority: 8,
      isEditable: true
    },
    
    // Campos de fechas
    'current_date': {
      fieldKey: 'fecha',
      inputType: 'text',
      placeholder: 'DD/MM/AAAA',
      category: 'date',
      priority: 4,
      isEditable: true,
      maxLength: 10
    },
    'promotion_end_date': {
      fieldKey: 'fechaFin',
      inputType: 'text',
      placeholder: 'DD/MM/AAAA',
      category: 'date',
      priority: 5,
      isEditable: true,
      maxLength: 10
    },
    
    // Campos de origen
    'product_origin': {
      fieldKey: 'paisTexto',
      inputType: 'text',
      placeholder: 'País de origen',
      category: 'product',
      priority: 3,
      isEditable: true,
      maxLength: 30
    }
  };
  
  // Configuración por defecto para campos no reconocidos
  return configurations[fieldType] || {
    fieldKey: 'staticValue',
    inputType: 'text',
    placeholder: `Editar ${fieldType}`,
    category: 'text',
    priority: 2,
    isEditable: true
  };
};

/**
 * Mapea tipos de textConfig legacy a tipos de campo modernos
 */
const mapTextConfigToFieldType = (contentType: string): string => {
  const mapping: Record<string, string> = {
    'product-name': 'product_name',
    'product-sku': 'product_sku',
    'product-brand': 'product_brand',
    'price-original': 'product_price',
    'price-final': 'product_price',
    'price-discount': 'product_price',
    'discount-percentage': 'discount_percentage',
    'promotion-start-date': 'current_date',
    'promotion-end-date': 'promotion_end_date'
  };
  
  return mapping[contentType] || 'texto';
};

/**
 * Detecta el tipo de campo desde un valor estático
 */
const detectFieldTypeFromStaticValue = (staticValue: string): string => {
  const value = staticValue.toLowerCase();
  
  if (value.includes('$') || value.includes('precio') || value.includes('price')) {
    return 'product_price';
  }
  if (value.includes('%') || value.includes('descuento') || value.includes('discount')) {
    return 'discount_percentage';
  }
  if (value.includes('fecha') || value.includes('date') || /\d{2}\/\d{2}\/\d{4}/.test(value)) {
    return 'current_date';
  }
  if (value.includes('sku') || value.includes('código') || value.includes('code')) {
    return 'product_sku';
  }
  if (value.includes('nombre') || value.includes('producto') || value.includes('product')) {
    return 'product_name';
  }
  
  return 'texto';
};

/**
 * Obtiene una lista de campos editables categorizados
 */
export const getEditableFieldsByCategory = (components: DraggableComponentV3[]) => {
  const editableFields = detectEditableFields(components);
  
  const categorized = {
    product: editableFields.filter(f => f.category === 'product'),
    price: editableFields.filter(f => f.category === 'price'),
    date: editableFields.filter(f => f.category === 'date'),
    code: editableFields.filter(f => f.category === 'code'),
    text: editableFields.filter(f => f.category === 'text')
  };
  
  return categorized;
};

/**
 * Verifica si una plantilla tiene campos editables
 */
export const hasEditableFields = (components: DraggableComponentV3[]): boolean => {
  return detectEditableFields(components).length > 0;
};

/**
 * Obtiene estadísticas de campos editables
 */
export const getEditableFieldsStats = (components: DraggableComponentV3[]) => {
  const editableFields = detectEditableFields(components);
  const categorized = getEditableFieldsByCategory(components);
  
  return {
    total: editableFields.length,
    byCategory: {
      product: categorized.product.length,
      price: categorized.price.length,
      date: categorized.date.length,
      code: categorized.code.length,
      text: categorized.text.length
    },
    highPriority: editableFields.filter(f => f.priority >= 8).length,
    mostImportant: editableFields.slice(0, 3) // Top 3 campos más importantes
  };
}; 