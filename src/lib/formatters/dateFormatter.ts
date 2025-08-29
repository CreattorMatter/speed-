/**
 * 📅 Date Formatter
 * Formateo profesional de fechas con soporte para rangos
 */

import { DateFormatOptions } from './types';

export class DateFormatter {
  private static defaultOptions: Required<DateFormatOptions> = {
    locale: 'es-AR',
    format: 'short',
    separator: ' - ',
    showRange: true,
    forPrint: false,
    fallback: 'Fecha inválida'
  };

  /**
   * Formatea una fecha individual
   */
  static format(value: string | Date, options: Partial<DateFormatOptions> = {}): string {
    const opts = { ...this.defaultOptions, ...options };
    
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
  }

  /**
   * Formatea un rango de fechas
   */
  static formatRange(
    startDate: string | Date, 
    endDate: string | Date, 
    options: Partial<DateFormatOptions> = {}
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    
    const start = this.format(startDate, opts);
    const end = this.format(endDate, opts);
    
    // Si es para impresión y las fechas son iguales, mostrar solo una
    if (opts.forPrint && start === end) {
      return start;
    }
    
    return `${start}${opts.separator}${end}`;
  }

  /**
   * Obtiene la fecha de hoy formateada
   */
  static today(options: Partial<DateFormatOptions> = {}): string {
    return this.format(new Date(), options);
  }

  /**
   * Obtiene la fecha de hoy en formato ISO (para inputs)
   */
  static todayISO(): string {
    return this.format(new Date(), { format: 'iso' });
  }

  /**
   * Valida si una fecha es válida
   */
  static isValid(value: string | Date): boolean {
    try {
      const date = typeof value === 'string' ? new Date(value) : value;
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }

  /**
   * Parse una fecha desde string
   */
  static parse(value: string): Date | null {
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }
}
