/**
 * ✅ Validator Convenience Functions
 * Funciones de conveniencia para validación rápida
 */

import { FieldValidator } from './fieldValidator';
import { ValidationResult } from './types';

// =====================
// VALIDATION FUNCTIONS
// =====================

export const validatePrice = (value: string | number): ValidationResult => {
  return FieldValidator.validate('price', value);
};

export const validatePercentage = (value: string | number): ValidationResult => {
  return FieldValidator.validate('percentage', value);
};

export const validateDate = (value: string): ValidationResult => {
  return FieldValidator.validate('date', value);
};

export const validateInstallments = (value: string | number): ValidationResult => {
  return FieldValidator.validate('cuota', value);
};

export const validateSKU = (value: string): ValidationResult => {
  return FieldValidator.validate('sku', value);
};

export const validateText = (value: string, required = false): ValidationResult => {
  return FieldValidator.validate('text', value, { required });
};

export const validateRequired = (value: any): ValidationResult => {
  return FieldValidator.validate('text', value, { required: true });
};

// =====================
// UTILITY FUNCTIONS
// =====================

export const isValidField = (fieldType: string, value: any): boolean => {
  return FieldValidator.validate(fieldType, value).isValid;
};

export const getValidationError = (fieldType: string, value: any): string | undefined => {
  const result = FieldValidator.validate(fieldType, value);
  return result.isValid ? undefined : result.message;
};
