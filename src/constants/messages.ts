/**
 * 💬 Messages Constants
 * Centralización de todos los mensajes y strings de la aplicación
 */

// =====================
// MENSAJES DE ÉXITO
// =====================

export const SUCCESS_MESSAGES = {
  // Guardado
  TEMPLATE_SAVED: 'Plantilla guardada exitosamente',
  FAMILY_SAVED: 'Familia guardada exitosamente',
  CHANGES_SAVED: 'Cambios guardados exitosamente',
  
  // Eliminación
  TEMPLATE_DELETED: 'Plantilla eliminada exitosamente',
  FAMILY_DELETED: 'Familia eliminada exitosamente',
  COMPONENT_DELETED: 'Componente eliminado exitosamente',
  
  // Exportación
  EXPORTED_SUCCESSFULLY: 'Exportado exitosamente',
  COPIED_TO_CLIPBOARD: 'Copiado al portapapeles',
  
  // Usuario y permisos
  USER_CREATED: 'Usuario creado exitosamente',
  ROLE_ASSIGNED: 'Rol asignado exitosamente',
  GROUP_CREATED: 'Grupo creado exitosamente',
  
  // Configuración
  SETTINGS_UPDATED: 'Configuración actualizada',
  PERMISSIONS_UPDATED: 'Permisos actualizados'
} as const;

// =====================
// MENSAJES DE ERROR
// =====================

export const ERROR_MESSAGES = {
  // Guardado
  SAVE_FAILED: 'Error al guardar',
  TEMPLATE_SAVE_FAILED: 'Error al guardar la plantilla',
  FAMILY_SAVE_FAILED: 'Error al guardar la familia',
  
  // Carga
  LOAD_FAILED: 'Error al cargar',
  TEMPLATE_LOAD_FAILED: 'Error al cargar la plantilla',
  FAMILY_LOAD_FAILED: 'Error al cargar la familia',
  DATA_LOAD_FAILED: 'Error al cargar los datos',
  
  // Eliminación
  DELETE_FAILED: 'Error al eliminar',
  TEMPLATE_DELETE_FAILED: 'Error al eliminar la plantilla',
  
  // Exportación
  EXPORT_FAILED: 'Error al exportar',
  PRINT_FAILED: 'Error al imprimir',
  
  // Validación
  INVALID_INPUT: 'Entrada inválida',
  REQUIRED_FIELD: 'Este campo es obligatorio',
  INVALID_FORMAT: 'Formato inválido',
  
  // Permisos
  ACCESS_DENIED: 'Acceso denegado',
  INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes',
  
  // Red
  NETWORK_ERROR: 'Error de conexión',
  SERVER_ERROR: 'Error del servidor',
  TIMEOUT_ERROR: 'Tiempo de espera agotado'
} as const;

// =====================
// MENSAJES DE ADVERTENCIA
// =====================

export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'Hay cambios sin guardar',
  LARGE_FILE: 'El archivo es muy grande',
  SLOW_OPERATION: 'Esta operación puede tomar tiempo',
  EXPERIMENTAL_FEATURE: 'Esta es una función experimental',
  DEPRECATED_FEATURE: 'Esta función está obsoleta',
  BROWSER_COMPATIBILITY: 'Esta función puede no funcionar en todos los navegadores'
} as const;

// =====================
// MENSAJES INFORMATIVOS
// =====================

export const INFO_MESSAGES = {
  LOADING: 'Cargando...',
  SAVING: 'Guardando...',
  EXPORTING: 'Exportando...',
  PROCESSING: 'Procesando...',
  UPLOADING: 'Subiendo archivo...',
  CONNECTING: 'Conectando...',
  
  // Estados
  NO_DATA: 'No hay datos disponibles',
  EMPTY_STATE: 'No hay elementos para mostrar',
  SEARCH_NO_RESULTS: 'No se encontraron resultados',
  
  // Ayuda
  CLICK_TO_EDIT: 'Click para editar',
  DRAG_TO_MOVE: 'Arrastra para mover',
  DOUBLE_CLICK_TO_EDIT: 'Doble click para editar',
  RIGHT_CLICK_FOR_OPTIONS: 'Click derecho para opciones'
} as const;

// =====================
// LABELS Y TEXTOS DE UI
// =====================

export const UI_LABELS = {
  // Botones comunes
  SAVE: 'Guardar',
  CANCEL: 'Cancelar',
  DELETE: 'Eliminar',
  EDIT: 'Editar',
  CREATE: 'Crear',
  EXPORT: 'Exportar',
  IMPORT: 'Importar',
  COPY: 'Copiar',
  PASTE: 'Pegar',
  UNDO: 'Deshacer',
  REDO: 'Rehacer',
  
  // Navegación
  BACK: 'Volver',
  NEXT: 'Siguiente',
  PREVIOUS: 'Anterior',
  HOME: 'Inicio',
  
  // Estados
  LOADING: 'Cargando...',
  SAVING: 'Guardando...',
  SAVED: 'Guardado',
  ERROR: 'Error',
  SUCCESS: 'Éxito',
  
  // Campos
  NAME: 'Nombre',
  DESCRIPTION: 'Descripción',
  TYPE: 'Tipo',
  SIZE: 'Tamaño',
  POSITION: 'Posición',
  STYLE: 'Estilo',
  CONTENT: 'Contenido',
  
  // Builder específico
  COMPONENT: 'Componente',
  TEMPLATE: 'Plantilla',
  FAMILY: 'Familia',
  CANVAS: 'Lienzo',
  PROPERTIES: 'Propiedades',
  LAYERS: 'Capas',
  ASSETS: 'Recursos',
  PREVIEW: 'Vista previa',
  EXPORT: 'Exportar',
  HISTORY: 'Historial'
} as const;

// =====================
// PLACEHOLDERS
// =====================

export const PLACEHOLDERS = {
  // Formularios
  TEMPLATE_NAME: 'Nombre de la plantilla',
  FAMILY_NAME: 'Nombre de la familia',
  DESCRIPTION: 'Descripción...',
  SEARCH: 'Buscar...',
  
  // Campos específicos
  PRODUCT_NAME: 'Nombre del producto',
  PRICE: 'Precio',
  SKU: 'Código SKU',
  DATE: 'DD/MM/AAAA',
  
  // Edición
  EDIT_TEXT: 'Editar texto...',
  EDIT_PRICE: 'Editar precio...',
  EDIT_DATE: 'Editar fecha...',
  
  // Imágenes
  IMAGE_ALT: 'Descripción de la imagen',
  IMAGE_UPLOAD: 'Subir imagen...'
} as const;

// =====================
// CONFIRMACIONES
// =====================

export const CONFIRMATIONS = {
  DELETE_TEMPLATE: '¿Estás seguro de que quieres eliminar esta plantilla?',
  DELETE_FAMILY: '¿Estás seguro de que quieres eliminar esta familia?',
  DELETE_COMPONENT: '¿Estás seguro de que quieres eliminar este componente?',
  DISCARD_CHANGES: '¿Quieres descartar los cambios sin guardar?',
  OVERWRITE_TEMPLATE: '¿Quieres sobrescribir la plantilla existente?',
  RESET_CANVAS: '¿Quieres resetear el lienzo?',
  CLEAR_HISTORY: '¿Quieres limpiar el historial?'
} as const;

// =====================
// TOOLTIPS Y AYUDA
// =====================

export const TOOLTIPS = {
  // Herramientas
  SELECT_TOOL: 'Herramienta de selección',
  TEXT_TOOL: 'Agregar texto',
  IMAGE_TOOL: 'Agregar imagen',
  SHAPE_TOOL: 'Agregar forma',
  
  // Controles
  ZOOM_IN: 'Acercar',
  ZOOM_OUT: 'Alejar',
  FIT_TO_SCREEN: 'Ajustar a pantalla',
  TOGGLE_GRID: 'Mostrar/ocultar cuadrícula',
  TOGGLE_GUIDES: 'Mostrar/ocultar guías',
  
  // Paneles
  TOGGLE_LEFT_PANEL: 'Mostrar/ocultar panel izquierdo',
  TOGGLE_RIGHT_PANEL: 'Mostrar/ocultar panel derecho',
  
  // Componentes
  MOVE_COMPONENT: 'Mover componente',
  RESIZE_COMPONENT: 'Redimensionar componente',
  DELETE_COMPONENT: 'Eliminar componente',
  DUPLICATE_COMPONENT: 'Duplicar componente'
} as const;

// =====================
// EXPORT TYPES
// =====================

export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type WarningMessage = typeof WARNING_MESSAGES[keyof typeof WARNING_MESSAGES];
export type InfoMessage = typeof INFO_MESSAGES[keyof typeof INFO_MESSAGES];
export type UILabel = typeof UI_LABELS[keyof typeof UI_LABELS];
export type Placeholder = typeof PLACEHOLDERS[keyof typeof PLACEHOLDERS];
export type Confirmation = typeof CONFIRMATIONS[keyof typeof CONFIRMATIONS];
export type Tooltip = typeof TOOLTIPS[keyof typeof TOOLTIPS];
