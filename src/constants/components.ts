/**
 * 🧩 Component Configuration Constants
 * Configuraciones específicas para componentes del builder
 */

import { COLORS, SIZES, ANIMATION } from './theme';

// =====================
// CONFIGURACIÓN DE COMPONENTES
// =====================

export const COMPONENT_CONFIG = {
  // Tamaños por defecto
  DEFAULT_SIZES: {
    TEXT: { width: 200, height: 40 },
    IMAGE: { width: 200, height: 200 },
    PRICE: { width: 150, height: 50 },
    BUTTON: { width: 120, height: 40 },
    SHAPE: { width: 100, height: 100 }
  },

  // Límites de tamaño
  SIZE_LIMITS: {
    MIN_WIDTH: 20,
    MIN_HEIGHT: 20,
    MAX_WIDTH: 2000,
    MAX_HEIGHT: 2000
  },

  // Estilos por defecto
  DEFAULT_STYLES: {
    FONT_SIZE: 16,
    FONT_FAMILY: 'Inter',
    FONT_WEIGHT: 'normal',
    LINE_HEIGHT: 1.2,
    TEXT_ALIGN: 'left' as const,
    COLOR: COLORS.BUILDER.TEXT_DEFAULT,
    BACKGROUND_COLOR: 'transparent',
    BORDER_WIDTH: 0,
    BORDER_COLOR: COLORS.BUILDER.BORDER_DEFAULT,
    BORDER_RADIUS: 0,
    OPACITY: 1
  },

  // Configuración de edición inline
  INLINE_EDIT: {
    MULTILINE_THRESHOLD: 30,
    MAX_LENGTH: {
      DESCRIPTION: 100,
      SKU: 50,
      GENERAL: 200
    },
    
    // Estilos de edición
    EDIT_STYLES: {
      BORDER: `2px solid ${COLORS.PRIMARY[500]}`,
      BORDER_RADIUS: 4,
      PADDING: '2px 4px',
      BACKGROUND: COLORS.GRAY[50],
      SHADOW: '0 0 0 2px rgba(59, 130, 246, 0.3)'
    },

    // Estados visuales
    HOVER_STYLES: {
      BACKGROUND: COLORS.STATUS.WARNING + '1A', // 10% opacity
      RING: `1px solid ${COLORS.STATUS.WARNING}`,
      BORDER_RADIUS: 4,
      PADDING: '2px 4px'
    },

    PENDING_STYLES: {
      BACKGROUND: '#fef3c7', // Orange-100
      RING: `2px dashed ${COLORS.STATUS.WARNING}`,
      ANIMATION: 'pulse 2s infinite'
    }
  },

  // Configuración de placeholders
  PLACEHOLDERS: {
    TEXT: 'XXXX',
    PRICE: '000.000',
    PERCENTAGE: '00%',
    DATE: 'DD/MM/AAAA',
    NUMBER: '00',
    SKU: 'ABC123'
  }
} as const;

// =====================
// CONFIGURACIÓN DE CANVAS
// =====================

export const CANVAS_CONFIG = {
  // Configuración por defecto
  DEFAULT: {
    WIDTH: 1080,
    HEIGHT: 1350,
    DPI: 300,
    UNIT: 'px' as const,
    BACKGROUND_COLOR: COLORS.BUILDER.CANVAS_DEFAULT
  },

  // Grid y guías
  GRID: {
    SIZE: 20,
    COLOR: COLORS.BUILDER.GRID_COLOR,
    OPACITY: 0.3
  },

  // Zoom y navegación
  ZOOM: {
    MIN: 0.1,
    MAX: 5,
    DEFAULT: 1,
    STEP: 0.1,
    WHEEL_SENSITIVITY: 0.001
  },

  // Snap y alineación
  SNAP: {
    TOLERANCE: 5,
    GRID: true,
    GUIDES: true,
    OBJECTS: true
  },

  // Selección
  SELECTION: {
    STROKE_WIDTH: 2,
    STROKE_COLOR: COLORS.BUILDER.SELECTION_STROKE,
    HANDLE_SIZE: 8,
    HANDLE_COLOR: COLORS.BUILDER.SELECTION_HANDLE,
    MULTIPLE_COLOR: COLORS.PRIMARY[400]
  }
} as const;

// =====================
// CONFIGURACIÓN DE HERRAMIENTAS
// =====================

export const TOOL_CONFIG = {
  // Herramientas disponibles
  TOOLS: {
    SELECT: 'select',
    TEXT: 'text',
    IMAGE: 'image',
    SHAPE: 'shape',
    PAN: 'pan',
    ZOOM: 'zoom'
  },

  // Configuración de toolbar
  TOOLBAR: {
    HEIGHT: 60,
    PADDING: 12,
    SPACING: 8,
    BACKGROUND: COLORS.GRAY[50],
    BORDER: `1px solid ${COLORS.GRAY[200]}`
  },

  // Configuración de paneles
  PANELS: {
    WIDTH: 320,
    MIN_WIDTH: 280,
    MAX_WIDTH: 400,
    HEADER_HEIGHT: 48,
    BACKGROUND: COLORS.GRAY[50]
  }
} as const;

// =====================
// CONFIGURACIÓN DE VALIDACIÓN
// =====================

export const VALIDATION_CONFIG = {
  // Mensajes de error por componente
  ERROR_MESSAGES: {
    COMPONENT_NOT_FOUND: 'Componente no encontrado',
    INVALID_SIZE: 'Tamaño de componente inválido',
    INVALID_POSITION: 'Posición de componente inválida',
    MISSING_CONTENT: 'Contenido de componente faltante',
    INVALID_STYLE: 'Estilo de componente inválido'
  },

  // Configuración de validación por tipo
  FIELD_VALIDATION: {
    PRICE: {
      MIN: 0,
      MAX: 999_999_999,
      DECIMAL_PLACES: 2
    },
    TEXT: {
      MIN_LENGTH: 0,
      MAX_LENGTH: 200
    },
    PERCENTAGE: {
      MIN: 0,
      MAX: 100
    }
  }
} as const;

// =====================
// EXPORT TYPES
// =====================

export type ComponentConfigType = typeof COMPONENT_CONFIG;
export type CanvasConfigType = typeof CANVAS_CONFIG;
export type ToolConfigType = typeof TOOL_CONFIG;
export type ValidationConfigType = typeof VALIDATION_CONFIG;
