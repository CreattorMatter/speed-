// AI Configuration
export const AI_CONFIG = {
  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4',
    visionModel: 'gpt-4-vision-preview',
    maxTokens: 1000,
    temperature: 0.3
  },

  // Analysis Settings
  analysis: {
    enabled: import.meta.env.VITE_AI_ANALYSIS_ENABLED !== 'false',
    realTime: import.meta.env.VITE_AI_REALTIME_ANALYSIS !== 'false',
    debounceMs: parseInt(import.meta.env.VITE_AI_ANALYSIS_DEBOUNCE_MS || '2000'),
    maxRetries: 3,
    timeout: 10000
  },

  // Agent Configuration
  agents: {
    visualDesigner: {
      enabled: true,
      priority: 1,
      tools: ['canvas_analyzer', 'color_validator', 'layout_optimizer']
    },
    priceAssistant: {
      enabled: true,
      priority: 2,
      tools: ['price_validator', 'template_checker', 'sku_manager']
    },
    fieldValidator: {
      enabled: true,
      priority: 3,
      tools: ['field_checker', 'data_validator', 'template_matcher']
    }
  },

  // Template-specific field mappings
  templateFields: {
    ladrillazo: {
      required: ['name', 'price', 'sku'],
      optional: ['description', 'brand', 'category'],
      validation: {
        price: { type: 'number', min: 0 },
        sku: { type: 'string', minLength: 3 }
      }
    },
    oferta: {
      required: ['name', 'originalPrice', 'salePrice', 'discount', 'sku'],
      optional: ['description', 'validUntil'],
      validation: {
        originalPrice: { type: 'number', min: 0 },
        salePrice: { type: 'number', min: 0 },
        discount: { type: 'number', min: 0, max: 100 }
      }
    },
    combo: {
      required: ['name', 'price', 'items', 'sku'],
      optional: ['savings', 'description'],
      validation: {
        price: { type: 'number', min: 0 },
        items: { type: 'array', minLength: 2 }
      }
    },
    institucional: {
      required: ['title', 'message'],
      optional: ['logo', 'contact'],
      validation: {
        title: { type: 'string', maxLength: 50 },
        message: { type: 'string', maxLength: 200 }
      }
    }
  },

  // Visual analysis prompts
  prompts: {
    visualAnalysis: `
      Analiza este diseño de cartel comercial y evalúa:
      
      1. JERARQUÍA VISUAL:
      - ¿El elemento más importante es el más prominente?
      - ¿Los precios son claramente visibles?
      - ¿La información está bien organizada?
      
      2. LEGIBILIDAD:
      - ¿Los textos son legibles a distancia?
      - ¿Hay suficiente contraste?
      - ¿Los tamaños de fuente son apropiados?
      
      3. USO DEL ESPACIO:
      - ¿Se aprovecha bien el espacio disponible?
      - ¿Hay elementos superpuestos problemáticos?
      - ¿Los márgenes son adecuados?
      
      4. COHERENCIA VISUAL:
      - ¿Los colores funcionan bien juntos?
      - ¿El estilo es consistente?
      - ¿Se respeta la identidad de marca?
      
      Proporciona sugerencias concretas y accionables.
    `,

    priceValidation: `
      Valida la información de precios considerando:
      
      1. COMPLETITUD:
      - ¿Están todos los campos de precio necesarios?
      - ¿Falta información crítica como SKU?
      - ¿Los descuentos están bien calculados?
      
      2. CONSISTENCIA:
      - ¿Los precios son realistas?
      - ¿Las promociones tienen sentido?
      - ¿Los formatos son correctos?
      
      3. PLANTILLA:
      - ¿Se respetan los campos requeridos para este tipo de cartel?
      - ¿Hay campos innecesarios o faltantes?
      
      Da recomendaciones específicas para mejorar.
    `,

    fieldSuggestions: `
      Basándote en la información del producto, sugiere:
      
      1. MEJORAS DE CONTENIDO:
      - Textos más atractivos
      - Información adicional relevante
      - Llamadas a la acción efectivas
      
      2. OPTIMIZACIONES:
      - Palabras clave para SEO interno
      - Términos que generen urgencia
      - Beneficios destacables
      
      3. COMPLETITUD:
      - Datos faltantes importantes
      - Información que añadiría valor
      - Elementos diferenciadores
      
      Sé específico y orientado a ventas.
    `
  }
};

// Utility functions
export const getFieldRequirements = (templateType: string) => {
  return AI_CONFIG.templateFields[templateType as keyof typeof AI_CONFIG.templateFields] || {
    required: ['name'],
    optional: [],
    validation: {}
  };
};

export const validateField = (fieldName: string, value: any, templateType: string) => {
  const requirements = getFieldRequirements(templateType);
  const validation = requirements.validation[fieldName as keyof typeof requirements.validation] as any;
  
  if (!validation) return { valid: true };
  
  const errors: string[] = [];
  
  if (validation.type === 'number') {
    if (isNaN(parseFloat(value))) {
      errors.push(`${fieldName} debe ser un número válido`);
    } else {
      const numValue = parseFloat(value);
      if (validation.min !== undefined && numValue < validation.min) {
        errors.push(`${fieldName} debe ser mayor o igual a ${validation.min}`);
      }
      if (validation.max !== undefined && numValue > validation.max) {
        errors.push(`${fieldName} debe ser menor o igual a ${validation.max}`);
      }
    }
  }
  
  if (validation.type === 'string') {
    if (typeof value !== 'string') {
      errors.push(`${fieldName} debe ser un texto`);
    } else {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`${fieldName} debe tener al menos ${validation.minLength} caracteres`);
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`${fieldName} debe tener máximo ${validation.maxLength} caracteres`);
      }
    }
  }
  
  if (validation.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`${fieldName} debe ser una lista`);
    } else {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`${fieldName} debe tener al menos ${validation.minLength} elementos`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default AI_CONFIG; 