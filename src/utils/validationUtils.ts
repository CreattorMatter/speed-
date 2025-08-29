// Utilidades para validación y formateo de campos editables
// 🔄 MIGRADO: Importar nueva librería de formatters y validators
import { formatPrice as newFormatPrice, formatDate as newFormatDate } from '../lib/formatters';
import { 
  validatePrice as newValidatePrice,
  validatePercentage as newValidatePercentage,
  validateDate as newValidateDate,
  validateRequired as newValidateRequired
} from '../lib/validators/convenience';

// 🔄 MIGRADO: Usar nueva librería de formatters
export const formatPrice = (value: string | number): string => {
  return newFormatPrice(value, { showCurrency: false, precision: 2 });
};

export const parsePrice = (formattedValue: string): number => {
  // Convertir valor formateado a número
  const cleaned = formattedValue.replace(/[^\d,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// 🔄 MIGRADO: Usar nueva librería de validators (con adaptador para compatibilidad)
export const validatePrice = (value: string | number): { isValid: boolean; error?: string } => {
  const result = newValidatePrice(value);
  return {
    isValid: result.isValid,
    error: result.message
  };
};

// 🔄 MIGRADO: Usar nueva librería de validators
export const validatePercentage = (value: string | number): { isValid: boolean; error?: string } => {
  const result = newValidatePercentage(value);
  return {
    isValid: result.isValid,
    error: result.message
  };
};

export const validateDate = (dateString: string): { isValid: boolean; error?: string } => {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);
  
  if (!match) {
    return { isValid: false, error: 'Formato debe ser DD/MM/YYYY' };
  }
  
  const [, day, month, year] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  // Verificar que la fecha es válida
  if (
    date.getDate() !== parseInt(day) ||
    date.getMonth() !== parseInt(month) - 1 ||
    date.getFullYear() !== parseInt(year)
  ) {
    return { isValid: false, error: 'Fecha inválida' };
  }
  
  return { isValid: true };
};

export const validateRequired = (value: string): { isValid: boolean; error?: string } => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: 'Este campo es obligatorio' };
  }
  
  return { isValid: true };
};

export const formatDate = (dateString: string): string => {
  // Asegurar formato DD/MM/YYYY
  const cleaned = dateString.replace(/[^\d]/g, '');
  
  if (cleaned.length >= 8) {
    const day = cleaned.substring(0, 2);
    const month = cleaned.substring(2, 4);
    const year = cleaned.substring(4, 8);
    return `${day}/${month}/${year}`;
  } else if (cleaned.length >= 4) {
    const day = cleaned.substring(0, 2);
    const month = cleaned.substring(2, 4);
    const year = cleaned.substring(4);
    return `${day}/${month}/${year}`;
  } else if (cleaned.length >= 2) {
    const day = cleaned.substring(0, 2);
    const month = cleaned.substring(2);
    return `${day}/${month}`;
  }
  
  return cleaned;
};

export const getFieldDisplayName = (fieldName: string): string => {
  const fieldNames: Record<string, string> = {
    'nombre': 'Nombre del producto',
    'precioActual': 'Precio actual',
    'porcentaje': 'Porcentaje de descuento',
    'sap': 'Código SAP',
    'fechasDesde': 'Fecha desde',
    'fechasHasta': 'Fecha hasta',
    'origen': 'Origen',
    'precioSinImpuestos': 'Precio sin impuestos'
  };
  
  return fieldNames[fieldName] || fieldName;
}; 