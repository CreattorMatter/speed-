/**
 * 🎭 Format Context Types
 * Sistema para preservar configuraciones de formato durante la edición inline
 */

import { formatLog } from '../lib/logger';

export interface FormatPreferences {
  /** Usar decimales en superíndice (ej: 349.999⁰⁰) */
  useSuperscript?: boolean;
  
  /** Número de decimales a mostrar */
  decimalPlaces?: number;
  
  /** Mostrar símbolo de moneda ($) */
  showCurrency?: boolean;
  
  /** Mostrar separadores de miles */
  useGrouping?: boolean;
  
  /** Formato de porcentaje */
  isPercentage?: boolean;
  
  /** Configuración personalizada adicional */
  customFormat?: Record<string, any>;
}

export interface FormatContext {
  /** Configuración de formato original del componente */
  originalFormat: any;
  
  /** Tipo de campo (price, percentage, number, text, etc.) */
  fieldType: string;
  
  /** Si tiene formato especial que debe preservarse */
  hasSpecialFormat: boolean;
  
  /** Preferencias de formato detectadas o configuradas */
  formatPreferences: FormatPreferences;
  
  /** Valor renderizado original (para detección) */
  originalRenderedValue: string;
  
  /** ID del componente para tracking */
  componentId?: string;
  
  /** Metadatos adicionales */
  metadata?: {
    /** Si es un campo calculado */
    isCalculated?: boolean;
    
    /** Si es parte de un template complejo */
    isComplexTemplate?: boolean;
    
    /** Template original para campos complejos */
    originalTemplate?: string;
  };
}

/**
 * 🔍 Función para detectar formato desde valor renderizado
 */
export const detectFormatFromRendered = (
  renderedValue: string, 
  numericValue: number,
  fieldType: string
): FormatPreferences => {
  formatLog('Detectando formato', { renderedValue, numericValue, fieldType }, 'detectFormatFromRendered');
  
  const hasSuperscript = /[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(renderedValue);
  const hasNormalDecimals = renderedValue.includes(',');
  const hasCurrency = renderedValue.includes('$');
  const hasPercentage = renderedValue.includes('%');
  const hasGrouping = /\d{1,3}(\.\d{3})+/.test(renderedValue);

  formatLog('Análisis de formato', { 
    hasSuperscript, 
    hasNormalDecimals, 
    hasCurrency, 
    hasPercentage, 
    hasGrouping 
  }, 'detectFormatFromRendered');

  // Detectar número de decimales
  let decimalPlaces = 0;
  if (hasSuperscript) {
    // Contar caracteres de superíndice
    const superscriptChars = renderedValue.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g);
    decimalPlaces = superscriptChars ? superscriptChars.length : 0;
    formatLog('Superíndice detectado', { superscriptChars, decimalPlaces }, 'detectFormatFromRendered');
  } else if (hasNormalDecimals) {
    const afterComma = renderedValue.split(',')[1];
    if (afterComma) {
      decimalPlaces = afterComma.replace(/[^\d]/g, '').length;
    }
    formatLog('Decimales normales', { afterComma, decimalPlaces }, 'detectFormatFromRendered');
  }

  const result = {
    useSuperscript: hasSuperscript,
    decimalPlaces,
    showCurrency: hasCurrency,
    useGrouping: hasGrouping,
    isPercentage: hasPercentage
  };
  
  formatLog('Resultado detección', result, 'detectFormatFromRendered');
  return result;
};

/**
 * 🏗️ Función para crear FormatContext desde componente
 */
export const createFormatContext = (
  component: any,
  renderedValue: string,
  fieldType: string
): FormatContext => {
  formatLog('Creando FormatContext', { 
    componentId: component?.id,
    renderedValue, 
    fieldType,
    componentContent: component?.content 
  }, 'createFormatContext');
  
  const originalFormat = component?.content?.outputFormat || {};
  const numericValue = typeof component?.content?.value === 'number' 
    ? component.content.value 
    : parseFloat(renderedValue.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  formatLog('Formato original encontrado', originalFormat, 'createFormatContext');

  const formatPreferences = detectFormatFromRendered(renderedValue, numericValue, fieldType);
  
  const hasSpecialFormat = !!(
    formatPreferences.useSuperscript ||
    formatPreferences.isPercentage ||
    originalFormat.superscriptDecimals ||
    originalFormat.precision?.includes('-small')
  );

  formatLog('Evaluación formato especial', {
    'formatPreferences.useSuperscript': formatPreferences.useSuperscript,
    'formatPreferences.isPercentage': formatPreferences.isPercentage,
    'originalFormat.superscriptDecimals': originalFormat.superscriptDecimals,
    'originalFormat.precision': originalFormat.precision,
    'precision includes -small': originalFormat.precision?.includes('-small'),
    hasSpecialFormat
  }, 'createFormatContext');

  const result = {
    originalFormat,
    fieldType,
    hasSpecialFormat,
    formatPreferences,
    originalRenderedValue: renderedValue,
    componentId: component?.id,
    metadata: {
      isCalculated: component?.content?.fieldType === 'calculated',
      isComplexTemplate: component?.content?.fieldType === 'dynamic' && 
                        component?.content?.dynamicTemplate?.includes('[') &&
                        component?.content?.dynamicTemplate?.includes(']'),
      originalTemplate: component?.content?.dynamicTemplate
    }
  };
  
  formatLog('FormatContext creado', result, 'createFormatContext');
  return result;
};

/**
 * 🔄 Función para reconstruir outputFormat desde FormatContext
 */
export const reconstructOutputFormat = (formatContext: FormatContext): any => {
  formatLog('Reconstruyendo OutputFormat', formatContext, 'reconstructOutputFormat');
  
  const { formatPreferences, originalFormat } = formatContext;
  
  let precision = '0';
  if (formatPreferences.decimalPlaces === 1) {
    precision = formatPreferences.useSuperscript ? '1-small' : '1';
  } else if (formatPreferences.decimalPlaces === 2) {
    precision = formatPreferences.useSuperscript ? '2-small' : '2';
  }

  formatLog('Precisión calculada', { 
    decimalPlaces: formatPreferences.decimalPlaces,
    useSuperscript: formatPreferences.useSuperscript,
    precision 
  }, 'reconstructOutputFormat');

  const result = {
    ...originalFormat,
    precision,
    superscriptDecimals: formatPreferences.useSuperscript,
    showDecimals: formatPreferences.decimalPlaces > 0,
    showCurrencySymbol: formatPreferences.showCurrency,
    prefix: formatPreferences.showCurrency,
    useGrouping: formatPreferences.useGrouping !== false
  };
  
  formatLog('OutputFormat reconstruido', result, 'reconstructOutputFormat');
  return result;
};
