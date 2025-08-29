/**
 * 🎭 Constantes de Formato y Validación
 * Centralizamos todos los magic numbers y strings hardcodeados
 */

// =====================
// FORMATO DE NÚMEROS
// =====================

export const NUMBER_FORMAT = {
  // Precisión de decimales
  PRECISION: {
    NONE: '0',
    ONE_DECIMAL: '1',
    TWO_DECIMALS: '2',
    ONE_DECIMAL_SMALL: '1-small',
    TWO_DECIMALS_SMALL: '2-small'
  },
  
  // Separadores y símbolos
  SEPARATORS: {
    THOUSANDS: '.',
    DECIMALS: ',',
    CURRENCY: '$',
    PERCENTAGE: '%'
  },
  
  // Caracteres de superíndice
  SUPERSCRIPT_MAP: {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
  },
  
  // Regex patterns
  PATTERNS: {
    SUPERSCRIPT: /[⁰¹²³⁴⁵⁶⁷⁸⁹]/,
    THOUSANDS_GROUPING: /\d{1,3}(\.\d{3})+/,
    NUMERIC_ONLY: /[^\d.,]/g,
    CURRENCY_SYMBOL: /\$/,
    PERCENTAGE_SYMBOL: /%/
  }
} as const;

// =====================
// LÍMITES DE VALIDACIÓN
// =====================

export const VALIDATION_LIMITS = {
  // Precios
  PRICE: {
    MIN: 0,
    MAX: 999_999_999,
    MAX_DECIMAL_PLACES: 2
  },
  
  // Porcentajes
  PERCENTAGE: {
    MIN: 0,
    MAX: 100
  },
  
  // Cuotas
  INSTALLMENTS: {
    MIN: 0,
    MAX: 60
  },
  
  // Texto
  TEXT: {
    DESCRIPTION_MAX_LENGTH: 100,
    SKU_MAX_LENGTH: 50,
    TEMPLATE_NAME_MAX_LENGTH: 200,
    MULTILINE_THRESHOLD: 30
  },
  
  // Fechas
  DATE: {
    FORMAT: 'DD/MM/YYYY',
    MAX_LENGTH: 15
  }
} as const;

// =====================
// MENSAJES DE ERROR
// =====================

export const ERROR_MESSAGES = {
  PRICE: {
    INVALID: 'El precio debe ser un número válido',
    NEGATIVE: 'El precio no puede ser negativo',
    TOO_HIGH: 'El precio es demasiado alto',
    EMPTY: 'El precio no puede estar vacío'
  },
  
  PERCENTAGE: {
    INVALID: 'El porcentaje debe ser un número válido',
    OUT_OF_RANGE: 'El porcentaje debe estar entre 0% y 100%'
  },
  
  INSTALLMENTS: {
    INVALID: 'Las cuotas deben ser un número entero válido',
    NEGATIVE: 'Las cuotas no pueden ser negativas. Usa 0 para "sin financiación"',
    TOO_HIGH: 'Máximo 60 cuotas permitidas'
  },
  
  TEXT: {
    EMPTY: 'El campo no puede estar vacío',
    TOO_LONG: 'El texto es demasiado largo',
    INVALID_SKU: 'El SKU solo puede contener letras, números, guiones y guiones bajos'
  },
  
  DATE: {
    EMPTY: 'El campo de fecha no puede estar vacío',
    INVALID_FORMAT: 'Formato de fecha inválido'
  }
} as const;

// =====================
// CONFIGURACIONES DE CAMPO
// =====================

export const FIELD_CONFIG = {
  // Tipos de campo que requieren formato especial
  SPECIAL_FORMAT_FIELDS: [
    'price', 'precio', 'percentage', 'porcentaje',
    'installments', 'cuotas', 'discount', 'descuento'
  ],
  
  // Tipos de campo numéricos
  NUMERIC_FIELDS: [
    'price', 'precio', 'percentage', 'porcentaje', 
    'installments', 'cuotas', 'discount', 'descuento',
    'calculated'
  ],
  
  // Tipos de campo de texto
  TEXT_FIELDS: [
    'description', 'descripcion', 'name', 'nombre',
    'sku', 'text', 'static'
  ],
  
  // Tipos de campo de fecha
  DATE_FIELDS: [
    'date', 'fecha', 'validity', 'vigencia', 'validity_period'
  ]
} as const;

// =====================
// CONFIGURACIONES UI
// =====================

export const UI_CONFIG = {
  // Tamaños de componentes
  SIZES: {
    ICON: {
      SMALL: 16,
      MEDIUM: 20,
      LARGE: 24
    },
    
    INPUT: {
      HEIGHT: 40,
      MIN_WIDTH: 60,
      MAX_WIDTH: 300
    },
    
    MODAL: {
      MAX_HEIGHT_VH: 95,
      MAX_WIDTH: 800
    }
  },
  
  // Colores del sistema
  COLORS: {
    PRIMARY: '#3b82f6',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    GRAY: '#6b7280'
  },
  
  // Duraciones de animación
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  }
} as const;

// =====================
// CONFIGURACIONES DE CACHE
// =====================

export const CACHE_CONFIG = {
  // Duración de cache en milisegundos
  DURATION: {
    PERMISSIONS: 5 * 60 * 1000,  // 5 minutos
    TEMPLATES: 10 * 60 * 1000,   // 10 minutos
    PRODUCTS: 15 * 60 * 1000,    // 15 minutos
    IMAGES: 30 * 60 * 1000       // 30 minutos
  },
  
  // Límites de cache
  LIMITS: {
    MAX_ENTRIES: 1000,
    MAX_LOG_ENTRIES: 1000,
    MAX_HISTORY_SIZE: 50
  }
} as const;

// =====================
// EXPORT TYPES
// =====================

export type PrecisionType = typeof NUMBER_FORMAT.PRECISION[keyof typeof NUMBER_FORMAT.PRECISION];
export type ValidationLimit = typeof VALIDATION_LIMITS;
export type ErrorMessage = typeof ERROR_MESSAGES;
export type FieldConfigType = typeof FIELD_CONFIG;
export type UIConfigType = typeof UI_CONFIG;
