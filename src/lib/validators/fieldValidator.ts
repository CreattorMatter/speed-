/**
 * ✅ Field Validator
 * Validador universal para todos los tipos de campo
 */

import { ValidationResult, ValidatorOptions } from './types';
import { VALIDATION_LIMITS, ERROR_MESSAGES } from '../../constants/formatting';

export class FieldValidator {
  /**
   * Valida un campo según su tipo
   */
  static validate(fieldType: string, value: any, options?: ValidatorOptions): ValidationResult {
    // Validación de requerido
    if (options?.required && this.isEmpty(value)) {
      return {
        isValid: false,
        message: options.customMessage || 'Este campo es obligatorio',
        code: 'REQUIRED'
      };
    }

    // Validación por tipo
    if (this.isPriceField(fieldType)) {
      return this.validatePrice(value);
    }
    
    if (this.isPercentageField(fieldType)) {
      return this.validatePercentage(value);
    }
    
    if (this.isDateField(fieldType)) {
      return this.validateDate(value);
    }
    
    if (this.isInstallmentsField(fieldType)) {
      return this.validateInstallments(value);
    }
    
    if (this.isSKUField(fieldType)) {
      return this.validateSKU(value);
    }

    // Por defecto, válido
    return { isValid: true };
  }

  // Métodos de validación específicos
  private static validatePrice(value: any): ValidationResult {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : value;
    
    if (isNaN(numValue)) {
      return { isValid: false, message: ERROR_MESSAGES.PRICE.INVALID, code: 'INVALID_NUMBER' };
    }
    
    if (numValue < VALIDATION_LIMITS.PRICE.MIN) {
      return { isValid: false, message: ERROR_MESSAGES.PRICE.NEGATIVE, code: 'NEGATIVE_VALUE' };
    }
    
    if (numValue > VALIDATION_LIMITS.PRICE.MAX) {
      return { isValid: false, message: ERROR_MESSAGES.PRICE.TOO_HIGH, code: 'VALUE_TOO_HIGH' };
    }

    return { isValid: true };
  }

  private static validatePercentage(value: any): ValidationResult {
    const numValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
    
    if (isNaN(numValue)) {
      return { isValid: false, message: ERROR_MESSAGES.PERCENTAGE.INVALID, code: 'INVALID_NUMBER' };
    }
    
    if (numValue < VALIDATION_LIMITS.PERCENTAGE.MIN || numValue > VALIDATION_LIMITS.PERCENTAGE.MAX) {
      return { isValid: false, message: ERROR_MESSAGES.PERCENTAGE.OUT_OF_RANGE, code: 'OUT_OF_RANGE' };
    }

    return { isValid: true };
  }

  private static validateDate(value: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.DATE.EMPTY, code: 'EMPTY_VALUE' };
    }

    // Validación básica de formato DD/MM/YYYY
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = value.match(dateRegex);
    
    if (!match) {
      return { isValid: false, message: ERROR_MESSAGES.DATE.INVALID_FORMAT, code: 'INVALID_FORMAT' };
    }

    // Validar que la fecha sea válida
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    if (date.getDate() !== parseInt(day) || 
        date.getMonth() !== parseInt(month) - 1 || 
        date.getFullYear() !== parseInt(year)) {
      return { isValid: false, message: ERROR_MESSAGES.DATE.INVALID_FORMAT, code: 'INVALID_DATE' };
    }

    return { isValid: true };
  }

  private static validateInstallments(value: any): ValidationResult {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    
    if (isNaN(numValue)) {
      return { isValid: false, message: ERROR_MESSAGES.INSTALLMENTS.INVALID, code: 'INVALID_NUMBER' };
    }
    
    if (numValue < VALIDATION_LIMITS.INSTALLMENTS.MIN) {
      return { isValid: false, message: ERROR_MESSAGES.INSTALLMENTS.NEGATIVE, code: 'NEGATIVE_VALUE' };
    }
    
    if (numValue > VALIDATION_LIMITS.INSTALLMENTS.MAX) {
      return { isValid: false, message: ERROR_MESSAGES.INSTALLMENTS.TOO_HIGH, code: 'VALUE_TOO_HIGH' };
    }

    return { isValid: true };
  }

  private static validateSKU(value: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return { isValid: false, message: ERROR_MESSAGES.TEXT.EMPTY, code: 'EMPTY_VALUE' };
    }
    
    if (!/^[A-Za-z0-9\-_]+$/.test(value)) {
      return { isValid: false, message: ERROR_MESSAGES.TEXT.INVALID_SKU, code: 'INVALID_FORMAT' };
    }

    return { isValid: true };
  }

  // Métodos de utilidad
  private static isEmpty(value: any): boolean {
    return value === null || value === undefined || 
           (typeof value === 'string' && value.trim().length === 0);
  }

  private static isPriceField(fieldType: string): boolean {
    return fieldType.includes('price') || fieldType.includes('precio');
  }

  private static isPercentageField(fieldType: string): boolean {
    return fieldType.includes('percentage') || fieldType.includes('porcentaje');
  }

  private static isDateField(fieldType: string): boolean {
    return fieldType.includes('date') || fieldType.includes('fecha');
  }

  private static isInstallmentsField(fieldType: string): boolean {
    return fieldType.includes('cuota') || fieldType.includes('installment');
  }

  private static isSKUField(fieldType: string): boolean {
    return fieldType.includes('sku');
  }
}
