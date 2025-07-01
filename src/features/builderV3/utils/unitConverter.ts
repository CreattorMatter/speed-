// =====================================
// UNIT CONVERTER UTILITY - MEJORADO v2
// =====================================

export interface UnitConversion {
  mm: number;
  cm: number;
  px: number;
  inches: number;
}

export class UnitConverter {
  // Constantes de conversión
  static readonly MM_TO_PX = 3.779; // 300 DPI conversion
  static readonly PX_TO_MM = 1 / UnitConverter.MM_TO_PX;
  static readonly MM_TO_CM = 0.1;
  static readonly CM_TO_MM = 10;
  static readonly INCHES_TO_MM = 25.4;
  static readonly MM_TO_INCHES = 1 / UnitConverter.INCHES_TO_MM;

  // Cache para optimizar rendimiento
  private static rulerMarksCache = new Map<string, Array<{ position: number; value: number; isMajor: boolean; label?: string }>>();
  private static cacheMaxSize = 50;

  /**
   * Limpia el cache de marcas de reglas
   */
  static clearRulerMarksCache(): void {
    UnitConverter.rulerMarksCache.clear();
  }

  /**
   * Genera una clave única para el cache
   */
  private static getCacheKey(lengthPx: number, unit: 'mm' | 'cm', zoom: number): string {
    // Redondear valores para optimizar cache hits
    const roundedLength = Math.round(lengthPx);
    const roundedZoom = Math.round(zoom * 100) / 100;
    return `${roundedLength}-${unit}-${roundedZoom}`;
  }

  /**
   * Convierte píxeles a milímetros
   */
  static pxToMm(px: number): number {
    return px * UnitConverter.PX_TO_MM;
  }

  /**
   * Convierte milímetros a píxeles
   */
  static mmToPx(mm: number): number {
    return mm * UnitConverter.MM_TO_PX;
  }

  /**
   * Convierte milímetros a centímetros
   */
  static mmToCm(mm: number): number {
    return mm * UnitConverter.MM_TO_CM;
  }

  /**
   * Convierte centímetros a milímetros
   */
  static cmToMm(cm: number): number {
    return cm * UnitConverter.CM_TO_MM;
  }

  /**
   * Convierte píxeles a centímetros
   */
  static pxToCm(px: number): number {
    return UnitConverter.mmToCm(UnitConverter.pxToMm(px));
  }

  /**
   * Convierte centímetros a píxeles
   */
  static cmToPx(cm: number): number {
    return UnitConverter.mmToPx(UnitConverter.cmToMm(cm));
  }

  /**
   * Convierte píxeles a pulgadas
   */
  static pxToInches(px: number): number {
    return UnitConverter.pxToMm(px) * UnitConverter.MM_TO_INCHES;
  }

  /**
   * Convierte pulgadas a píxeles
   */
  static inchesToPx(inches: number): number {
    return UnitConverter.mmToPx(inches * UnitConverter.INCHES_TO_MM);
  }

  /**
   * Obtiene todas las conversiones de una medida en píxeles
   */
  static getAllConversions(px: number): UnitConversion {
    return {
      px: Math.round(px * 100) / 100,
      mm: Math.round(UnitConverter.pxToMm(px) * 100) / 100,
      cm: Math.round(UnitConverter.pxToCm(px) * 100) / 100,
      inches: Math.round(UnitConverter.pxToInches(px) * 1000) / 1000,
    };
  }

  /**
   * Formatea un valor con su unidad
   */
  static formatValue(value: number, unit: 'px' | 'mm' | 'cm' | 'in'): string {
    switch (unit) {
      case 'px':
        return `${Math.round(value)}px`;
      case 'mm':
        return `${Math.round(value * 10) / 10}mm`;
      case 'cm':
        return `${Math.round(value * 100) / 100}cm`;
      case 'in':
        return `${Math.round(value * 1000) / 1000}"`;
      default:
        return `${value}`;
    }
  }

  /**
   * Calcula marcas de regla para una dimensión dada - ALGORITMO MEJORADO v2
   */
  static getRulerMarks(
    lengthPx: number, 
    unit: 'mm' | 'cm' = 'mm',
    zoom: number = 1
  ): Array<{ position: number; value: number; isMajor: boolean; label?: string }> {
    const cacheKey = UnitConverter.getCacheKey(lengthPx, unit, zoom);
    if (UnitConverter.rulerMarksCache.has(cacheKey)) {
      return UnitConverter.rulerMarksCache.get(cacheKey)!;
    }

    const marks: Array<{ position: number; value: number; isMajor: boolean; label?: string }> = [];
    
    const lengthInUnit = unit === 'mm' ? UnitConverter.pxToMm(lengthPx) : UnitConverter.pxToCm(lengthPx);
    
    // ALGORITMO MEJORADO v2: Más granular y útil para mediciones precisas
    let majorInterval: number;
    let minorInterval: number;
    let labelInterval: number; // Nuevo: intervalo para etiquetas
    
    if (unit === 'mm') {
      // Sistema mejorado para milímetros - más granular
      if (zoom >= 5) {
        majorInterval = 10;   // cada 1cm - marcas principales
        minorInterval = 1;    // cada 1mm - marcas menores
        labelInterval = 5;    // etiquetas cada 5mm
      } else if (zoom >= 4) {
        majorInterval = 10;   // cada 1cm
        minorInterval = 2;    // cada 2mm
        labelInterval = 10;   // etiquetas cada 1cm
      } else if (zoom >= 3) {
        majorInterval = 10;   // cada 1cm
        minorInterval = 5;    // cada 5mm
        labelInterval = 10;   // etiquetas cada 1cm
      } else if (zoom >= 2) {
        majorInterval = 20;   // cada 2cm
        minorInterval = 5;    // cada 5mm
        labelInterval = 10;   // etiquetas cada 1cm
      } else if (zoom >= 1.5) {
        majorInterval = 20;   // cada 2cm
        minorInterval = 10;   // cada 1cm
        labelInterval = 20;   // etiquetas cada 2cm
      } else if (zoom >= 1) {
        majorInterval = 50;   // cada 5cm
        minorInterval = 10;   // cada 1cm
        labelInterval = 20;   // etiquetas cada 2cm
      } else if (zoom >= 0.75) {
        majorInterval = 50;   // cada 5cm
        minorInterval = 25;   // cada 2.5cm
        labelInterval = 50;   // etiquetas cada 5cm
      } else if (zoom >= 0.5) {
        majorInterval = 100;  // cada 10cm
        minorInterval = 25;   // cada 2.5cm
        labelInterval = 50;   // etiquetas cada 5cm
      } else {
        majorInterval = 100;  // cada 10cm
        minorInterval = 50;   // cada 5cm
        labelInterval = 100;  // etiquetas cada 10cm
      }
    } else { // cm - Sistema mejorado para centímetros
      if (zoom >= 5) {
        majorInterval = 1;     // cada 1cm
        minorInterval = 0.1;   // cada 1mm
        labelInterval = 0.5;   // etiquetas cada 5mm
      } else if (zoom >= 4) {
        majorInterval = 1;     // cada 1cm
        minorInterval = 0.2;   // cada 2mm
        labelInterval = 1;     // etiquetas cada 1cm
      } else if (zoom >= 3) {
        majorInterval = 1;     // cada 1cm
        minorInterval = 0.5;   // cada 5mm
        labelInterval = 1;     // etiquetas cada 1cm
      } else if (zoom >= 2) {
        majorInterval = 2;     // cada 2cm
        minorInterval = 0.5;   // cada 5mm
        labelInterval = 1;     // etiquetas cada 1cm
      } else if (zoom >= 1.5) {
        majorInterval = 2;     // cada 2cm
        minorInterval = 1;     // cada 1cm
        labelInterval = 2;     // etiquetas cada 2cm
      } else if (zoom >= 1) {
        majorInterval = 5;     // cada 5cm
        minorInterval = 1;     // cada 1cm
        labelInterval = 2;     // etiquetas cada 2cm
      } else if (zoom >= 0.75) {
        majorInterval = 5;     // cada 5cm
        minorInterval = 2.5;   // cada 2.5cm
        labelInterval = 5;     // etiquetas cada 5cm
      } else {
        majorInterval = 10;    // cada 10cm
        minorInterval = 5;     // cada 5cm
        labelInterval = 10;    // etiquetas cada 10cm
      }
    }

    // Limitar número máximo de marcas para rendimiento
    const maxMarks = 400; // Aumentado para permitir mayor granularidad
    const estimatedMinorMarks = Math.ceil(lengthInUnit / minorInterval);
    
    if (estimatedMinorMarks > maxMarks) {
      const factor = Math.ceil(estimatedMinorMarks / maxMarks);
      minorInterval *= factor;
      majorInterval = Math.max(majorInterval, minorInterval * 2);
      labelInterval = Math.max(labelInterval, majorInterval);
    }

    // GENERACIÓN MEJORADA: Comenzar desde 0 y generar marcas más precisas
    const allMarks = new Map<number, { isMajor: boolean; hasLabel: boolean }>();
    
    // Generar marcas menores (más granulares)
    for (let value = 0; value <= lengthInUnit; value += minorInterval) {
      if (value > lengthInUnit) break;
      const roundedValue = Math.round(value * 1000) / 1000;
      allMarks.set(roundedValue, { isMajor: false, hasLabel: false });
    }
    
    // Marcar las marcas principales
    for (let value = 0; value <= lengthInUnit; value += majorInterval) {
      if (value > lengthInUnit) break;
      const roundedValue = Math.round(value * 1000) / 1000;
      allMarks.set(roundedValue, { isMajor: true, hasLabel: false });
    }
    
    // Marcar las que deben tener etiquetas
    for (let value = 0; value <= lengthInUnit; value += labelInterval) {
      if (value > lengthInUnit) break;
      const roundedValue = Math.round(value * 1000) / 1000;
      const existing = allMarks.get(roundedValue);
      allMarks.set(roundedValue, { 
        isMajor: existing?.isMajor || false, 
        hasLabel: true 
      });
    }
    
    // Convertir a array y generar marcas finales
    Array.from(allMarks.entries()).sort((a, b) => a[0] - b[0]).forEach(([value, config]) => {
      const positionPx = unit === 'mm' ? UnitConverter.mmToPx(value) : UnitConverter.cmToPx(value);
      
      marks.push({
        position: positionPx,
        value,
        isMajor: config.isMajor,
        label: config.hasLabel ? UnitConverter.formatValue(value, unit) : undefined
      });
    });

    const sortedMarks = marks.sort((a, b) => a.position - b.position);
    
    // Gestión del cache
    if (UnitConverter.rulerMarksCache.size >= UnitConverter.cacheMaxSize) {
      const firstKey = UnitConverter.rulerMarksCache.keys().next().value;
      if (firstKey) {
        UnitConverter.rulerMarksCache.delete(firstKey);
      }
    }
    
    UnitConverter.rulerMarksCache.set(cacheKey, sortedMarks);
    return sortedMarks;
  }
}