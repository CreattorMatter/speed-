/**
 * ✅ Validator Types
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  code?: string;
}

export interface ValidatorOptions {
  required?: boolean;
  customMessage?: string;
}

export interface PriceValidationOptions extends ValidatorOptions {
  min?: number;
  max?: number;
  allowZero?: boolean;
  maxDecimals?: number;
}

export interface DateValidationOptions extends ValidatorOptions {
  minDate?: Date;
  maxDate?: Date;
  format?: string;
}

export interface TextValidationOptions extends ValidatorOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowEmpty?: boolean;
}

export interface PercentageValidationOptions extends ValidatorOptions {
  min?: number;
  max?: number;
}

export interface InstallmentsValidationOptions extends ValidatorOptions {
  min?: number;
  max?: number;
}
