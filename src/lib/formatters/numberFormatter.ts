/**
 * 🔢 Number Formatter
 * Formateo profesional de números con soporte para diferentes tipos
 */

import { NumberFormatOptions } from './types';
import { NUMBER_FORMAT } from '../../constants/formatting';

export class NumberFormatter {
  private static defaultOptions: Required<NumberFormatOptions> = {
    locale: 'es-AR',
    precision: 0,
    useSuperscript: false,
    useGrouping: true,
    suffix: '',
    fallback: '0'
  };

  /**
   * Formatea un número con opciones configurables
   */
  static format(value: number | string, options: Partial<NumberFormatOptions> = {}): string {
    const opts = { ...this.defaultOptions, ...options };
    
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'))
      : value;
    
    if (isNaN(numericValue)) {
      return opts.fallback;
    }

    try {
      let formattedValue: string;

      if (opts.useSuperscript && opts.precision > 0) {
        formattedValue = this.formatWithSuperscript(numericValue, opts);
      } else {
        formattedValue = new Intl.NumberFormat(opts.locale, {
          minimumFractionDigits: opts.precision,
          maximumFractionDigits: opts.precision,
          useGrouping: opts.useGrouping
        }).format(numericValue);
      }

      // Agregar sufijo si es necesario
      if (opts.suffix) {
        formattedValue = `${formattedValue}${opts.suffix}`;
      }

      return formattedValue;
    } catch (error) {
      return opts.fallback;
    }
  }

  /**
   * Formatea con decimales en superíndice
   */
  private static formatWithSuperscript(value: number, opts: Required<NumberFormatOptions>): string {
    const integerPart = Math.floor(value);
    const decimalPart = ((value - integerPart) * Math.pow(10, opts.precision))
      .toFixed(0)
      .padStart(opts.precision, '0');
    
    // Formatear parte entera
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
   * Formatea porcentaje
   */
  static formatPercentage(value: number | string, precision = 0): string {
    return this.format(value, { 
      precision, 
      suffix: '%',
      useGrouping: false 
    });
  }

  /**
   * Formatea número entero
   */
  static formatInteger(value: number | string): string {
    return this.format(value, { precision: 0 });
  }

  /**
   * Formatea con separadores de miles
   */
  static formatWithGrouping(value: number | string, precision = 0): string {
    return this.format(value, { 
      precision, 
      useGrouping: true 
    });
  }

  /**
   * Parse un string numérico
   */
  static parse(value: string): number {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
}
