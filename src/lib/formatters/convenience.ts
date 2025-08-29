/**
 * 🎯 Convenience Functions
 * Funciones de conveniencia para formateo rápido
 */

import { PriceFormatter } from './priceFormatter';
import { PriceFormatOptions, DateFormatOptions, NumberFormatOptions } from './types';

// =====================
// PRICE FORMATTERS
// =====================

export const formatPrice = (value: number | string, options?: Partial<PriceFormatOptions>) => 
  PriceFormatter.format(value, options);

export const formatCurrency = (value: number | string, currency = '$') => 
  PriceFormatter.format(value, { currency, showCurrency: true });

export const formatPriceWithSuperscript = (value: number | string) => 
  PriceFormatter.format(value, { useSuperscript: true, precision: 2 });

export const formatPriceNoDecimals = (value: number | string) => 
  PriceFormatter.format(value, { precision: 0 });

// =====================
// NUMBER FORMATTERS
// =====================

export const formatNumber = (value: number | string, options?: Partial<NumberFormatOptions>) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return '0';
  
  const opts = {
    precision: 0,
    useGrouping: true,
    locale: 'es-AR',
    ...options
  };
  
  return new Intl.NumberFormat(opts.locale, {
    minimumFractionDigits: opts.precision,
    maximumFractionDigits: opts.precision,
    useGrouping: opts.useGrouping
  }).format(numericValue);
};

export const formatPercentage = (value: number | string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return '0%';
  return `${numericValue}%`;
};

// =====================
// DATE FORMATTERS
// =====================

export const formatDate = (value: string | Date, options?: Partial<DateFormatOptions>) => {
  const opts = {
    format: 'short' as const,
    locale: 'es-AR',
    fallback: 'Fecha inválida',
    ...options
  };
  
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) {
      return opts.fallback;
    }
    
    switch (opts.format) {
      case 'iso':
        return date.toISOString().split('T')[0];
      case 'long':
        return date.toLocaleDateString(opts.locale, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'short':
      default:
        return date.toLocaleDateString(opts.locale);
    }
  } catch (error) {
    return opts.fallback;
  }
};

export const formatDateRange = (startDate: string | Date, endDate: string | Date, forPrint = false) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  // Si es para impresión y las fechas son iguales, mostrar solo una
  if (forPrint && start === end) {
    return start;
  }
  
  return `${start} - ${end}`;
};

// =====================
// UTILITY FUNCTIONS
// =====================

export const parseNumericValue = (value: string): number => {
  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const isNumericField = (fieldType: string): boolean => {
  return ['price', 'precio', 'percentage', 'porcentaje', 'number', 'calculated'].some(
    type => fieldType.includes(type)
  );
};

export const isPriceField = (fieldType: string): boolean => {
  return ['price', 'precio'].some(type => fieldType.includes(type));
};
