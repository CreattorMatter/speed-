// =====================================
// VALIDADOR DE FECHAS DE VIGENCIA
// =====================================

export interface ValidityPeriodConfig {
  startDate: string; // formato: 'YYYY-MM-DD'
  endDate: string;   // formato: 'YYYY-MM-DD'
}

export interface ValidityValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isNotStarted: boolean;
  daysRemaining: number;
  daysSinceStart: number;
  message: string;
}

/**
 * Valida si una fecha de vigencia está activa
 */
export const validateValidityPeriod = (config: ValidityPeriodConfig): ValidityValidationResult => {
  const now = new Date();
  const startDate = new Date(config.startDate);
  const endDate = new Date(config.endDate);
  
  // Ajustar las fechas para que sean al inicio del día
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  now.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  
  const isExpired = now > endDate;
  const isNotStarted = now < startDate;
  const isValid = !isExpired && !isNotStarted;
  
  // Calcular días restantes
  const timeDiff = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Calcular días desde el inicio
  const timeSinceStart = now.getTime() - startDate.getTime();
  const daysSinceStart = Math.floor(timeSinceStart / (1000 * 3600 * 24));
  
  let message = '';
  if (isExpired) {
    message = `Promoción vencida hace ${Math.abs(daysRemaining)} días`;
  } else if (isNotStarted) {
    message = `Promoción inicia en ${Math.abs(daysRemaining)} días`;
  } else {
    message = `Válido por ${daysRemaining} días más`;
  }
  
  return {
    isValid,
    isExpired,
    isNotStarted,
    daysRemaining: Math.max(0, daysRemaining),
    daysSinceStart: Math.max(0, daysSinceStart),
    message
  };
};

/**
 * Formatea una fecha de vigencia para mostrar en la cartelera
 */
export const formatValidityPeriod = (config: ValidityPeriodConfig, forPrint: boolean = false): string => {
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const startFormatted = formatDate(config.startDate);
  const endFormatted = formatDate(config.endDate);
  
  // 🆕 Solo mostrar una fecha si es para impresión Y las fechas son iguales
  if (forPrint && startFormatted === endFormatted) {
    return startFormatted;
  }
  
  // En todos los demás casos, mostrar el rango completo
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Verifica si se puede imprimir una cartelera basada en su fecha de vigencia
 */
export const canPrintPoster = (config: ValidityPeriodConfig): boolean => {
  const validation = validateValidityPeriod(config);
  return validation.isValid;
};

/**
 * Obtiene el estado de la promoción para mostrar en la interfaz
 */
export const getPromotionStatus = (config: ValidityPeriodConfig): {
  status: 'active' | 'expired' | 'pending';
  color: string;
  text: string;
} => {
  const validation = validateValidityPeriod(config);
  
  if (validation.isExpired) {
    return {
      status: 'expired',
      color: '#ef4444', // rojo
      text: 'Vencida'
    };
  } else if (validation.isNotStarted) {
    return {
      status: 'pending',
      color: '#f59e0b', // naranja
      text: 'Pendiente'
    };
  } else {
    return {
      status: 'active',
      color: '#22c55e', // verde
      text: 'Activa'
    };
  }
}; 