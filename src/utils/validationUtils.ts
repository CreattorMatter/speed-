// Utilidades para validación y formateo de campos editables

export const formatPrice = (value: string | number): string => {
  // Convertir a número y formatear con separador de miles y decimales
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : value;
  
  if (isNaN(numValue)) return '';
  
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(numValue);
};

export const parsePrice = (formattedValue: string): number => {
  // Convertir valor formateado a número
  const cleaned = formattedValue.replace(/[^\d,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const validatePrice = (value: string | number): { isValid: boolean; error?: string } => {
  const numValue = typeof value === 'string' ? parsePrice(value) : value;
  
  if (isNaN(numValue) || numValue < 0) {
    return { isValid: false, error: 'El precio debe ser un número positivo' };
  }
  
  if (numValue === 0) {
    return { isValid: false, error: 'El precio no puede ser cero' };
  }
  
  return { isValid: true };
};

export const validatePercentage = (value: string | number): { isValid: boolean; error?: string } => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Debe ser un número válido' };
  }
  
  // Removido: restricción de rango para permitir edición libre
  // if (numValue < 0 || numValue > 100) {
  //   return { isValid: false, error: 'El porcentaje debe estar entre 0 y 100' };
  // }
  
  return { isValid: true };
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

// 🆕 VALIDACIÓN Y FORMATEO PARA CAMPO PROMO
export const validatePromo = (value: string): { isValid: boolean; message?: string } => {
  if (!value.trim()) {
    return { isValid: false, message: 'El campo promoción no puede estar vacío' };
  }
  
  // Verificar formato numeroxnumero
  const promoRegex = /^\d+x\d+$/;
  if (!promoRegex.test(value)) {
    return { isValid: false, message: 'El formato debe ser numeroxnumero (ej: 3x2, 5x4)' };
  }
  
  // Verificar que no sean 0x0 (debe tener al menos un número > 0)
  const [left, right] = value.split('x').map(n => parseInt(n, 10));
  if (left === 0 && right === 0) {
    return { isValid: false, message: 'La promoción debe tener al menos un número mayor a 0' };
  }
  
  return { isValid: true };
};

export const formatPromo = (value: string): string => {
  // Limpiar y formatear valor de promo
  const cleanValue = value.replace(/[^\dx]/gi, '').toLowerCase();
  
  // Si no tiene 'x', agregar uno por defecto
  if (!cleanValue.includes('x')) {
    return '0x0';
  }
  
  const parts = cleanValue.split('x');
  if (parts.length !== 2) {
    return '0x0';
  }
  
  const left = parseInt(parts[0], 10) || 0;
  const right = parseInt(parts[1], 10) || 0;
  
  return `${left}x${right}`;
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
    'precioSinImpuestos': 'Precio sin impuestos',
    'promo': 'Promoción'
  };
  
  return fieldNames[fieldName] || fieldName;
}; 