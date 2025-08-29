/**
 * 🎨 SPID Plus - Theme System
 * 
 * Sistema centralizado de colores, tamaños y configuraciones de UI
 * Reemplaza valores hardcodeados por configuración centralizada
 */

// =====================
// SISTEMA DE COLORES
// =====================

export const COLORS = {
  // Colores principales del sistema
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },

  // Colores de estado
  STATUS: {
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6'
  },

  // Grises del sistema
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },

  // Colores específicos del builder
  BUILDER: {
    CANVAS_DEFAULT: '#FFFFFF',
    BORDER_DEFAULT: '#000000',
    TEXT_DEFAULT: '#000000',
    TEXT_MUTED: '#666666',
    TEXT_PLACEHOLDER: '#999999',
    
    // Elementos de UI
    SELECTION_STROKE: '#3b82f6',
    SELECTION_HANDLE: '#3b82f6',
    GRID_COLOR: '#e5e7eb',
    GUIDE_COLOR: '#f59e0b',
    
    // Estados de componentes
    HOVER_BACKGROUND: '#f3f4f6',
    ACTIVE_BACKGROUND: '#dbeafe',
    DISABLED_BACKGROUND: '#f9fafb',
    
    // Bordes y divisores
    BORDER_LIGHT: '#e5e7eb',
    BORDER_MEDIUM: '#d1d5db',
    BORDER_DARK: '#9ca3af',
    
    // Componentes específicos
    BUTTON_BACKGROUND: '#007bff',
    ERROR_BACKGROUND: '#ffe6e6',
    ERROR_BORDER: '#ff6b6b',
    ERROR_TEXT: '#d63031'
  },

  // Colores de financiación y promociones
  PROMOTION: {
    DISCOUNT_BACKGROUND: '#fef3c7',
    DISCOUNT_TEXT: '#92400e',
    FINANCING_BACKGROUND: '#dbeafe',
    FINANCING_TEXT: '#1e40af'
  }
} as const;

// =====================
// TAMAÑOS Y ESPACIADOS
// =====================

export const SIZES = {
  // Iconos
  ICON: {
    XS: 12,
    SM: 16,
    MD: 20,
    LG: 24,
    XL: 32,
    XXL: 48
  },

  // Inputs y controles
  INPUT: {
    HEIGHT: {
      SM: 32,
      MD: 40,
      LG: 48
    },
    WIDTH: {
      MIN: 60,
      SM: 120,
      MD: 200,
      LG: 300,
      XL: 400
    }
  },

  // Modales y paneles
  MODAL: {
    WIDTH: {
      SM: 400,
      MD: 600,
      LG: 800,
      XL: 1200
    },
    HEIGHT: {
      MAX_VH: 95,
      CONTENT_MAX_VH: 70
    }
  },

  // Builder específico
  BUILDER: {
    PANEL_WIDTH: 320,
    TOOLBAR_HEIGHT: 60,
    GRID_SIZE: 20,
    SNAP_TOLERANCE: 5,
    
    // Handles y controles
    SELECTION_HANDLE: 8,
    SELECTION_STROKE: 2,
    
    // Zoom
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 5,
    DEFAULT_ZOOM: 1
  },

  // Componentes
  COMPONENT: {
    MIN_WIDTH: 20,
    MIN_HEIGHT: 20,
    DEFAULT_WIDTH: 100,
    DEFAULT_HEIGHT: 40,
    
    // Padding interno
    PADDING: {
      XS: 2,
      SM: 4,
      MD: 8,
      LG: 16,
      XL: 24
    }
  }
} as const;

// =====================
// CONFIGURACIONES DE ANIMACIÓN
// =====================

export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000
  },

  EASING: {
    EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    EASE_IN: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    EASE_IN_OUT: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    SPRING: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },

  // Configuraciones para Framer Motion
  SPRING: {
    SOFT: { type: 'spring', stiffness: 300, damping: 30 },
    MEDIUM: { type: 'spring', stiffness: 400, damping: 25 },
    STIFF: { type: 'spring', stiffness: 500, damping: 20 }
  }
} as const;

// =====================
// CONFIGURACIONES DE TIPOGRAFÍA
// =====================

export const TYPOGRAPHY = {
  FONT_FAMILY: {
    PRIMARY: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    SECONDARY: "'Roboto', Arial, sans-serif",
    MONO: "'JetBrains Mono', 'Fira Code', monospace",
    DISPLAY: "'Poppins', 'Inter', sans-serif"
  },

  FONT_SIZE: {
    XS: '0.75rem',    // 12px
    SM: '0.875rem',   // 14px  
    BASE: '1rem',     // 16px
    LG: '1.125rem',   // 18px
    XL: '1.25rem',    // 20px
    '2XL': '1.5rem',  // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem'  // 36px
  },

  FONT_WEIGHT: {
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
    EXTRABOLD: 800
  },

  LINE_HEIGHT: {
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.75
  }
} as const;

// =====================
// CONFIGURACIONES DE LAYOUT
// =====================

export const LAYOUT = {
  // Breakpoints responsivos
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
  },

  // Contenedores
  CONTAINER: {
    MAX_WIDTH: 1280,
    PADDING: {
      SM: 16,
      MD: 24,
      LG: 32
    }
  },

  // Espaciados estándar
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    '2XL': 48,
    '3XL': 64
  }
} as const;

// =====================
// CONFIGURACIONES ESPECÍFICAS DE SPID
// =====================

export const SPID_CONFIG = {
  // Canvas por defecto
  CANVAS: {
    DEFAULT_WIDTH: 1080,
    DEFAULT_HEIGHT: 1350,
    DEFAULT_DPI: 300,
    DEFAULT_UNIT: 'px' as const,
    BACKGROUND_COLOR: COLORS.BUILDER.CANVAS_DEFAULT
  },

  // Formatos de papel comunes
  PAPER_FORMATS: {
    A4: { width: 210, height: 297, unit: 'mm' },
    A3: { width: 297, height: 420, unit: 'mm' },
    LETTER: { width: 8.5, height: 11, unit: 'in' }
  },

  // Configuraciones de exportación
  EXPORT: {
    DEFAULT_FORMAT: 'png' as const,
    DEFAULT_QUALITY: 90,
    DEFAULT_DPI: 300,
    SUPPORTED_FORMATS: ['png', 'jpg', 'pdf', 'svg'] as const
  }
} as const;

// =====================
// UTILIDADES DE TEMA
// =====================

export const getColor = (path: string): string => {
  const parts = path.split('.');
  let current: any = COLORS;
  
  for (const part of parts) {
    current = current[part];
    if (!current) break;
  }
  
  return current || '#000000';
};

export const getSize = (category: keyof typeof SIZES, size: string): number => {
  const sizeCategory = SIZES[category] as any;
  return sizeCategory?.[size] || 0;
};

// =====================
// EXPORT TYPES
// =====================

export type ColorPath = string;
export type ThemeColors = typeof COLORS;
export type ThemeSizes = typeof SIZES;
export type ThemeAnimation = typeof ANIMATION;
export type ThemeTypography = typeof TYPOGRAPHY;
export type ThemeLayout = typeof LAYOUT;
