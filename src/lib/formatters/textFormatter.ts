/**
 * 📝 Text Formatter
 * Formateo y validación de texto con límites y transformaciones
 */

import { TextFormatOptions } from './types';

export class TextFormatter {
  private static defaultOptions: Required<TextFormatOptions> = {
    locale: 'es-AR',
    maxLength: 100,
    truncate: true,
    ellipsis: '...',
    fallback: ''
  };

  /**
   * Formatea texto con opciones configurables
   */
  static format(value: string, options: Partial<TextFormatOptions> = {}): string {
    const opts = { ...this.defaultOptions, ...options };
    
    if (!value || typeof value !== 'string') {
      return opts.fallback;
    }

    let formatted = value.trim();

    // Truncar si excede el límite
    if (opts.truncate && formatted.length > opts.maxLength) {
      formatted = formatted.substring(0, opts.maxLength - opts.ellipsis.length) + opts.ellipsis;
    }

    return formatted;
  }

  /**
   * Formatea SKU (solo caracteres válidos)
   */
  static formatSKU(value: string): string {
    return value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\-_]/g, '');
  }

  /**
   * Formatea nombre de producto (capitalización)
   */
  static formatProductName(value: string): string {
    return value
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Formatea descripción (límite de caracteres)
   */
  static formatDescription(value: string, maxLength = 100): string {
    return this.format(value, { maxLength, truncate: true });
  }

  /**
   * Limpia texto de caracteres especiales
   */
  static sanitize(value: string): string {
    return value
      .trim()
      .replace(/[<>]/g, '') // Remover caracteres peligrosos
      .replace(/\s+/g, ' '); // Normalizar espacios
  }

  /**
   * Valida si un texto es válido para SKU
   */
  static isValidSKU(value: string): boolean {
    return /^[A-Za-z0-9\-_]+$/.test(value.trim());
  }

  /**
   * Extrae solo números de un string
   */
  static extractNumbers(value: string): string {
    return value.replace(/[^\d]/g, '');
  }

  /**
   * Extrae solo letras de un string
   */
  static extractLetters(value: string): string {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
  }

  /**
   * Genera placeholder para campos individuales
   */
  static generatePlaceholder(fieldType: string): string {
    if (fieldType.includes('price') || fieldType.includes('precio')) {
      return '000.000';
    }
    if (fieldType.includes('percentage') || fieldType.includes('porcentaje')) {
      return '00%';
    }
    if (fieldType.includes('quantity') || fieldType.includes('cantidad')) {
      return '00';
    }
    if (fieldType.includes('date') || fieldType.includes('fecha')) {
      return 'DD/MM/AAAA';
    }
    return 'XXXX';
  }

  /**
   * Genera placeholders para templates dinámicos completos
   */
  static generateDynamicPlaceholder(dynamicTemplate: string): string {
    if (!dynamicTemplate) {
      return '';
    }

    let placeholderTemplate = dynamicTemplate;

    // Mapeo de campos a placeholders
    const fieldMappings = {
      // Precios y moneda
      '[product_price]': '000.000',
      '[price_previous]': '000.000',
      '[price_base]': '000.000',
      '[price_without_tax]': '000.000',
      '[discount_amount]': '000.000',
      '[price_unit_alt]': '000.000',
      '[currency_symbol]': '$',
      
      // Porcentajes
      '[discount_percentage]': '00%',
      
      // Cantidades
      '[cuota]': '00',
      '[stock_available]': '00',
      
      // Fechas
      '[current_date]': 'DD/MM/AAAA',
      '[promotion_end_date]': 'DD/MM/AAAA',
      '[validity_period]': 'DD/MM/AAAA',
      
      // Texto
      '[product_name]': 'XXXX',
      '[product_sku]': 'XXXX',
      '[product_brand]': 'XXXX',
      '[product_origin]': 'XXXX',
      '[store_code]': 'XXXX',
      '[classification_complete]': 'XXXX'
    };

    // Reemplazar cada campo con su placeholder
    for (const [field, placeholder] of Object.entries(fieldMappings)) {
      placeholderTemplate = placeholderTemplate.replace(new RegExp(field.replace(/[[\]]/g, '\\$&'), 'g'), placeholder);
    }

    // Fallback inteligente para campos no mapeados
    placeholderTemplate = placeholderTemplate.replace(/\[([^\]]+)\]/g, (match, fieldName) => {
      return this.generatePlaceholder(fieldName);
    });

    return placeholderTemplate;
  }
}
