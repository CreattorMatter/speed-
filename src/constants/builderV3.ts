/**
 * 🏗️ Builder V3 Constants
 * Constantes específicas para el Builder V3
 */

import { COLORS, SIZES, ANIMATION } from './theme';

// =====================
// CONFIGURACIÓN DEL CANVAS
// =====================

export const CANVAS_DEFAULTS = {
  WIDTH: 1080,
  HEIGHT: 1350,
  DPI: 300,
  UNIT: 'px' as const,
  BACKGROUND_COLOR: COLORS.BUILDER.CANVAS_DEFAULT,
  
  // Grid
  GRID_SIZE: 20,
  GRID_COLOR: COLORS.BUILDER.GRID_COLOR,
  SHOW_GRID: true,
  
  // Zoom
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5.0,
  DEFAULT_ZOOM: 1.0,
  
  // Snap
  SNAP_TOLERANCE: 5,
  SNAP_TO_GRID: true,
  SNAP_TO_GUIDES: true,
  SNAP_TO_OBJECTS: true
} as const;

// =====================
// HERRAMIENTAS Y CONTROLES
// =====================

export const TOOLS = {
  SELECT: 'select',
  TEXT: 'text', 
  IMAGE: 'image',
  SHAPE: 'shape',
  PAN: 'pan',
  ZOOM: 'zoom'
} as const;

export const SELECTION_CONFIG = {
  STROKE_WIDTH: 2,
  STROKE_COLOR: COLORS.BUILDER.SELECTION_STROKE,
  HANDLE_SIZE: 8,
  HANDLE_COLOR: COLORS.BUILDER.SELECTION_HANDLE,
  
  // Estilos de selección
  SELECTION_STYLE: {
    strokeColor: COLORS.BUILDER.SELECTION_STROKE,
    strokeWidth: 2,
    handleColor: COLORS.BUILDER.SELECTION_HANDLE,
    handleSize: 8
  }
} as const;

// =====================
// CONFIGURACIÓN DE PANELES
// =====================

export const PANELS = {
  // Dimensiones
  WIDTH: 320,
  MIN_WIDTH: 280,
  MAX_WIDTH: 400,
  
  // Tabs
  TABS: {
    LEFT: ['components', 'layers', 'assets'] as const,
    RIGHT: ['properties', 'styles', 'content'] as const,
    BOTTOM: ['preview', 'export', 'history'] as const
  },
  
  // Estados por defecto
  DEFAULT_STATE: {
    leftPanelOpen: true,
    rightPanelOpen: true,
    bottomPanelOpen: false,
    activeLeftTab: 'components' as const,
    activeRightTab: 'properties' as const,
    activeBottomTab: 'preview' as const
  }
} as const;

// =====================
// CONFIGURACIÓN DE HISTORIAL
// =====================

export const HISTORY_CONFIG = {
  MAX_SIZE: 50,
  AUTO_SAVE_INTERVAL: 30000, // 30 segundos
  DEBOUNCE_DELAY: 500
} as const;

// =====================
// CONFIGURACIÓN DE COMPONENTES
// =====================

export const COMPONENT_TYPES = {
  // Texto
  TEXT: 'field-dynamic-text',
  STATIC_TEXT: 'field-static-text',
  
  // Imágenes
  IMAGE: 'image-upload',
  BACKGROUND_IMAGE: 'background-image',
  
  // Formas
  RECTANGLE: 'shape-geometric',
  CIRCLE: 'shape-circle',
  
  // Financiación
  FINANCING_IMAGE: 'financing-image',
  
  // Fechas
  VALIDITY_PERIOD: 'validity-period'
} as const;

// =====================
// CONFIGURACIÓN DE EXPORTACIÓN
// =====================

export const EXPORT_CONFIG = {
  FORMATS: ['png', 'jpg', 'pdf', 'svg'] as const,
  DEFAULT_FORMAT: 'png' as const,
  DEFAULT_QUALITY: 90,
  DEFAULT_DPI: 300,
  
  // Configuración por formato
  FORMAT_CONFIG: {
    png: { quality: 90, dpi: 300 },
    jpg: { quality: 85, dpi: 300 },
    pdf: { quality: 100, dpi: 300 },
    svg: { vectorize: true }
  }
} as const;

// =====================
// MENSAJES DEL SISTEMA
// =====================

export const MESSAGES = {
  ERRORS: {
    COMPONENT_NOT_FOUND: 'Componente no encontrado',
    INVALID_TEMPLATE: 'Plantilla inválida',
    SAVE_FAILED: 'Error al guardar',
    LOAD_FAILED: 'Error al cargar',
    EXPORT_FAILED: 'Error al exportar'
  },
  
  SUCCESS: {
    SAVED: 'Guardado exitosamente',
    EXPORTED: 'Exportado exitosamente',
    COPIED: 'Copiado al portapapeles'
  },
  
  WARNINGS: {
    UNSAVED_CHANGES: 'Hay cambios sin guardar',
    LARGE_FILE: 'Archivo muy grande',
    SLOW_OPERATION: 'Esta operación puede tomar tiempo'
  }
} as const;

// =====================
// CONFIGURACIÓN DE PERFORMANCE
// =====================

export const PERFORMANCE_CONFIG = {
  // Límites de renderizado
  MAX_COMPONENTS: 100,
  MAX_HISTORY_SIZE: HISTORY_CONFIG.MAX_SIZE,
  
  // Debounce delays
  DEBOUNCE: {
    TYPING: 300,
    RESIZE: 100,
    SCROLL: 50,
    SEARCH: 500
  },
  
  // Lazy loading
  LAZY_LOAD_THRESHOLD: 10,
  VIRTUAL_SCROLL_ITEM_HEIGHT: 60
} as const;

// =====================
// UTILIDADES
// =====================

export const getComponentDefaultSize = (type: string) => {
  if (type.includes('text')) return COMPONENT_CONFIG.DEFAULT_SIZES.TEXT;
  if (type.includes('image')) return COMPONENT_CONFIG.DEFAULT_SIZES.IMAGE;
  if (type.includes('price')) return COMPONENT_CONFIG.DEFAULT_SIZES.PRICE;
  if (type.includes('shape')) return COMPONENT_CONFIG.DEFAULT_SIZES.SHAPE;
  return COMPONENT_CONFIG.DEFAULT_SIZES.TEXT;
};

export const getToolName = (tool: string): string => {
  const toolNames = {
    [TOOLS.SELECT]: 'Seleccionar',
    [TOOLS.TEXT]: 'Texto',
    [TOOLS.IMAGE]: 'Imagen',
    [TOOLS.SHAPE]: 'Forma',
    [TOOLS.PAN]: 'Mover',
    [TOOLS.ZOOM]: 'Zoom'
  };
  return toolNames[tool as keyof typeof toolNames] || tool;
};
