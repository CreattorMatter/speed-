/**
 * 🎭 SPID Plus - Formatters Library
 * 
 * Librería centralizada y bien tipada para formateo de valores
 * Reemplaza la lógica dispersa de formateo por toda la app
 */

export { PriceFormatter } from './priceFormatter';
export { DateFormatter } from './dateFormatter';
export { NumberFormatter } from './numberFormatter';
export { TextFormatter } from './textFormatter';

// Re-export tipos comunes
export type {
  FormatOptions,
  PriceFormatOptions,
  DateFormatOptions,
  NumberFormatOptions,
  TextFormatOptions
} from './types';

// Export funciones de conveniencia
export {
  // Price formatters
  formatPrice,
  formatCurrency,
  formatPriceWithSuperscript,
  formatPriceNoDecimals,
  
  // Number formatters
  formatNumber,
  formatPercentage,
  
  // Date formatters
  formatDate,
  formatDateRange,
  formatDateISO,
  formatDateLong,
  todayFormatted,
  todayISO,
  
  // Text formatters
  formatText,
  formatSKU,
  formatProductName,
  formatDescription,
  sanitizeText,
  generatePlaceholder,
  generateDynamicPlaceholder,
  
  // Utility functions
  parseNumericValue,
  isNumericField,
  isPriceField,
  isDateField,
  isTextField
} from './convenience';
