/**
 * ✅ SPID Plus - Validators Library
 * 
 * Librería centralizada para validaciones con mensajes de error consistentes
 */

export { FieldValidator } from './fieldValidator';
export { PriceValidator } from './priceValidator';
export { DateValidator } from './dateValidator';
export { TextValidator } from './textValidator';

// Re-export tipos
export type {
  ValidationResult,
  ValidatorOptions,
  PriceValidationOptions,
  DateValidationOptions,
  TextValidationOptions
} from './types';

// Export funciones de conveniencia
export {
  validatePrice,
  validatePercentage,
  validateDate,
  validateText,
  validateSKU,
  validateInstallments
} from './convenience';
