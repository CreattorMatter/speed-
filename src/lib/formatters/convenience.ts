/**
 * 🎯 Convenience Functions
 * Funciones de conveniencia para formateo rápido
 */

import { PriceFormatter } from './priceFormatter';
import { DateFormatter } from './dateFormatter';
import { NumberFormatter } from './numberFormatter';
import { TextFormatter } from './textFormatter';
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

export const formatDate = (value: string | Date, options?: Partial<DateFormatOptions>) => 
  DateFormatter.format(value, options);

export const formatDateRange = (startDate: string | Date, endDate: string | Date, forPrint = false) => 
  DateFormatter.formatRange(startDate, endDate, { forPrint });

export const formatDateISO = (value: string | Date) => 
  DateFormatter.format(value, { format: 'iso' });

export const formatDateLong = (value: string | Date) => 
  DateFormatter.format(value, { format: 'long' });

export const todayFormatted = () => 
  DateFormatter.today();

export const todayISO = () => 
  DateFormatter.todayISO();

// =====================
// TEXT FORMATTERS
// =====================

export const formatText = (value: string, maxLength?: number) => 
  TextFormatter.format(value, { maxLength });

export const formatSKU = (value: string) => 
  TextFormatter.formatSKU(value);

export const formatProductName = (value: string) => 
  TextFormatter.formatProductName(value);

export const formatDescription = (value: string, maxLength = 100) => 
  TextFormatter.formatDescription(value, maxLength);

export const sanitizeText = (value: string) => 
  TextFormatter.sanitize(value);

export const generatePlaceholder = (fieldType: string) => 
  TextFormatter.generatePlaceholder(fieldType);

export const generateDynamicPlaceholder = (dynamicTemplate: string) => 
  TextFormatter.generateDynamicPlaceholder(dynamicTemplate);

// =====================
// UTILITY FUNCTIONS
// =====================

export const parseNumericValue = (value: string): number => 
  NumberFormatter.parse(value);

export const isNumericField = (fieldType: string): boolean => {
  return ['price', 'precio', 'percentage', 'porcentaje', 'number', 'calculated'].some(
    type => fieldType.includes(type)
  );
};

export const isPriceField = (fieldType: string): boolean => {
  return ['price', 'precio'].some(type => fieldType.includes(type));
};

export const isDateField = (fieldType: string): boolean => {
  return ['date', 'fecha', 'validity', 'vigencia'].some(type => fieldType.includes(type));
};

export const isTextField = (fieldType: string): boolean => {
  return ['text', 'description', 'name', 'sku'].some(type => fieldType.includes(type));
};
