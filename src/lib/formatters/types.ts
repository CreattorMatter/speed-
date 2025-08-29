/**
 * 🎭 Formatter Types
 * Tipos centralizados para todos los formatters
 */

export interface FormatOptions {
  locale?: string;
  fallback?: string;
}

export interface PriceFormatOptions extends FormatOptions {
  currency?: string;
  showCurrency?: boolean;
  precision?: number;
  useSuperscript?: boolean;
  useGrouping?: boolean;
  prefix?: boolean;
}

export interface DateFormatOptions extends FormatOptions {
  format?: 'short' | 'long' | 'iso' | 'custom';
  separator?: string;
  showRange?: boolean;
  forPrint?: boolean;
}

export interface NumberFormatOptions extends FormatOptions {
  precision?: number;
  useSuperscript?: boolean;
  useGrouping?: boolean;
  suffix?: string;
}

export interface PercentageFormatOptions extends FormatOptions {
  precision?: number;
  showSymbol?: boolean;
}

export interface TextFormatOptions extends FormatOptions {
  maxLength?: number;
  truncate?: boolean;
  ellipsis?: string;
}
