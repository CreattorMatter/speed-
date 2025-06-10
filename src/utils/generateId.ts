// =====================================
// ID GENERATOR UTILITY
// =====================================

/**
 * Genera un ID único usando timestamp y números aleatorios
 * @returns {string} ID único
 */
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
};

/**
 * Genera un ID único con prefijo personalizado
 * @param prefix - Prefijo para el ID
 * @returns {string} ID único con prefijo
 */
export const generateIdWithPrefix = (prefix: string): string => {
  const id = generateId();
  return `${prefix}-${id}`;
};

/**
 * Verifica si un ID es válido (no vacío y con formato correcto)
 * @param id - ID a validar
 * @returns {boolean} true si es válido
 */
export const isValidId = (id: string): boolean => {
  return typeof id === 'string' && id.trim().length > 0;
}; 