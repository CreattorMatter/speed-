/**
 * 💰 Price Formatter
 * Formateo profesional de precios con soporte para superíndice
 */

import { PriceFormatOptions } from './types';
import { NUMBER_FORMAT } from '../../constants/formatting';
import { formatLog } from '../logger';

export class PriceFormatter {
  private static defaultOptions: Required<PriceFormatOptions> = {
    locale: 'es-AR',
    currency: '$',
    showCurrency: true,
    precision: 2,
    useSuperscript: false,
    useGrouping: true,
    prefix: true,
    fallback: '0'
  };

  /**
   * Formatea un precio con opciones configurables
   */
  static format(value: number | string, options: Partial<PriceFormatOptions> = {}): string {
    const opts = { ...this.defaultOptions, ...options };
    
    formatLog('Formateando precio', { value, options: opts }, 'PriceFormatter');
    
    // Validar y convertir valor
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(NUMBER_FORMAT.PATTERNS.NUMERIC_ONLY, '').replace(',', '.'))
      : value;
    
    if (isNaN(numericValue)) {
      formatLog('Valor inválido, usando fallback', { value, fallback: opts.fallback }, 'PriceFormatter');
      return opts.fallback;
    }

    try {
      let formattedValue: string;

      if (opts.useSuperscript && opts.precision > 0) {
        formattedValue = this.formatWithSuperscript(numericValue, opts);
      } else {
        formattedValue = this.formatNormal(numericValue, opts);
      }

      // Agregar símbolo de moneda si es necesario
      if (opts.showCurrency && opts.prefix) {
        formattedValue = `${opts.currency} ${formattedValue}`;
      } else if (opts.showCurrency && !opts.prefix) {
        formattedValue = `${formattedValue} ${opts.currency}`;
      }

      formatLog('Precio formateado', { 
        input: numericValue, 
        output: formattedValue 
      }, 'PriceFormatter');

      return formattedValue;
    } catch (error) {
      formatLog('Error formateando precio', { error, value }, 'PriceFormatter');
      return opts.fallback;
    }
  }

  /**
   * Formatea con decimales en superíndice
   */
  private static formatWithSuperscript(value: number, opts: Required<PriceFormatOptions>): string {
    const integerPart = Math.floor(value);
    const decimalPart = ((value - integerPart) * Math.pow(10, opts.precision))
      .toFixed(0)
      .padStart(opts.precision, '0');
    
    // Formatear parte entera con separadores
    const formattedInteger = new Intl.NumberFormat(opts.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: opts.useGrouping
    }).format(integerPart);
    
    // Convertir decimales a superíndice
    const superscriptDecimals = decimalPart
      .split('')
      .map(d => NUMBER_FORMAT.SUPERSCRIPT_MAP[d as keyof typeof NUMBER_FORMAT.SUPERSCRIPT_MAP] || d)
      .join('');
    
    return `${formattedInteger}${superscriptDecimals}`;
  }

  /**
   * Formatea con decimales normales
   */
  private static formatNormal(value: number, opts: Required<PriceFormatOptions>): string {
    return new Intl.NumberFormat(opts.locale, {
      minimumFractionDigits: opts.precision,
      maximumFractionDigits: opts.precision,
      useGrouping: opts.useGrouping
    }).format(value);
  }

  /**
   * Parse un string de precio a número
   */
  static parse(value: string): number {
    const cleaned = value
      .replace(NUMBER_FORMAT.PATTERNS.CURRENCY_SYMBOL, '')
      .replace(NUMBER_FORMAT.PATTERNS.NUMERIC_ONLY, '')
      .replace(',', '.');
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Detecta si un string tiene formato de superíndice
   */
  static hasSuperscriptFormat(value: string): boolean {
    return NUMBER_FORMAT.PATTERNS.SUPERSCRIPT.test(value);
  }

  /**
   * Cuenta decimales en un string formateado
   */
  static countDecimals(value: string): number {
    if (this.hasSuperscriptFormat(value)) {
      const superscriptChars = value.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g);
      return superscriptChars ? superscriptChars.length : 0;
    }
    
    if (value.includes(',')) {
      const afterComma = value.split(',')[1];
      return afterComma ? afterComma.replace(/[^\d]/g, '').length : 0;
    }
    
    return 0;
  }
}

// Export función de conveniencia
export const formatPrice = (value: number | string, options?: Partial<PriceFormatOptions>) => 
  PriceFormatter.format(value, options);
