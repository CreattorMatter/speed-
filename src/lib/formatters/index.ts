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
  NumberFormatOptions
} from './types';

// Export funciones de conveniencia
export {
  formatPrice,
  formatDate,
  formatNumber,
  formatPercentage,
  formatCurrency
} from './convenience';
