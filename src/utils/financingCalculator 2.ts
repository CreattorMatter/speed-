// ==========================================
// CALCULADORA DE FINANCIACIÓN
// ==========================================

import { ProductoReal } from '../types/product';

// ==========================================
// INTERFACES
// ==========================================

export interface FinancingCalculation {
  cuotas: number;
  precio_cuota: number;
  precio_total: number;
  interes_aplicado?: number;
  tipo_financiacion?: string;
}

export interface FinancingOptions {
  cuotas: number;
  interes?: number; // Porcentaje de interés (0 = sin interés)
  tipo?: 'sin_interes' | 'con_interes' | 'promocional';
}

// ==========================================
// FUNCIONES DE CÁLCULO
// ==========================================

/**
 * Calcula el precio por cuota basado en el precio del producto y cantidad de cuotas
 * @param producto - Producto del cual calcular la financiación
 * @param opciones - Opciones de financiación (cuotas, interés, etc.)
 * @returns Cálculo completo de la financiación
 */
export const calculateFinancing = (
  producto: ProductoReal,
  opciones: FinancingOptions
): FinancingCalculation => {
  if (!producto || !opciones.cuotas || opciones.cuotas <= 0) {
    return {
      cuotas: 0,
      precio_cuota: 0,
      precio_total: 0,
      interes_aplicado: 0,
      tipo_financiacion: 'sin_interes'
    };
  }

  const precioBase = producto.precio || 0;
  const interes = opciones.interes || 0;
  const cuotas = opciones.cuotas;

  // Calcular precio total con interés (si aplica)
  let precioTotal = precioBase;
  if (interes > 0) {
    // Aplicar interés simple
    precioTotal = precioBase * (1 + (interes / 100));
  }

  // Calcular precio por cuota
  const precioCuota = precioTotal / cuotas;

  return {
    cuotas: cuotas,
    precio_cuota: Math.round(precioCuota), // Redondear a peso entero
    precio_total: Math.round(precioTotal),
    interes_aplicado: interes,
    tipo_financiacion: interes > 0 ? 'con_interes' : 'sin_interes'
  };
};

/**
 * Calcula solo el precio por cuota (versión simplificada)
 * @param precio - Precio del producto
 * @param cuotas - Cantidad de cuotas
 * @returns Precio por cuota
 */
export const calculatePricePorCuota = (precio: number, cuotas: number): number => {
  if (!precio || !cuotas || cuotas <= 0) return 0;
  // 🎯 Mantener decimales en lugar de redondear
  return Number((precio / cuotas).toFixed(2));
};

/**
 * Formatea un valor de precio por cuota para mostrar
 * @param precioCuota - Precio por cuota
 * @param incluirSimbolo - Si incluir el símbolo de peso
 * @returns Precio formateado
 */
export const formatPriceCuota = (precioCuota: number, incluirSimbolo: boolean = true): string => {
  if (!precioCuota || precioCuota <= 0) return incluirSimbolo ? '$ 0' : '0';
  
  const formatted = new Intl.NumberFormat('es-AR', {
    style: incluirSimbolo ? 'currency' : 'decimal',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precioCuota);

  return formatted;
};

/**
 * Obtiene opciones de financiación predeterminadas para diferentes bancos
 * @param banco - Nombre del banco
 * @returns Array de opciones de financiación
 */
export const getFinancingOptionsByBank = (banco: string): FinancingOptions[] => {
  const bankOptions: Record<string, FinancingOptions[]> = {
    'Visa': [
      { cuotas: 3, interes: 0, tipo: 'sin_interes' },
      { cuotas: 6, interes: 0, tipo: 'sin_interes' },
      { cuotas: 12, interes: 15, tipo: 'con_interes' }
    ],
    'Mastercard': [
      { cuotas: 3, interes: 0, tipo: 'sin_interes' },
      { cuotas: 6, interes: 0, tipo: 'sin_interes' },
      { cuotas: 12, interes: 18, tipo: 'con_interes' }
    ],
    'American Express': [
      { cuotas: 3, interes: 0, tipo: 'sin_interes' },
      { cuotas: 6, interes: 5, tipo: 'con_interes' }
    ],
    'Banco Nación': [
      { cuotas: 6, interes: 0, tipo: 'sin_interes' },
      { cuotas: 12, interes: 0, tipo: 'sin_interes' },
      { cuotas: 18, interes: 10, tipo: 'con_interes' }
    ],
    'Cencosud': [
      { cuotas: 6, interes: 0, tipo: 'sin_interes' },
      { cuotas: 12, interes: 0, tipo: 'sin_interes' },
      { cuotas: 18, interes: 0, tipo: 'promocional' }
    ],
    'CencoPay': [
      { cuotas: 3, interes: 0, tipo: 'promocional' },
      { cuotas: 6, interes: 0, tipo: 'sin_interes' },
      { cuotas: 12, interes: 0, tipo: 'sin_interes' }
    ]
  };

  return bankOptions[banco] || [
    { cuotas: 3, interes: 0, tipo: 'sin_interes' },
    { cuotas: 6, interes: 0, tipo: 'sin_interes' }
  ];
};

/**
 * Valida si una cantidad de cuotas es válida
 * @param cuotas - Cantidad de cuotas
 * @returns Si es válida
 */
export const isValidCuotas = (cuotas: number): boolean => {
  return cuotas > 0 && cuotas <= 60 && Number.isInteger(cuotas);
};

/**
 * Extrae el número de cuotas de un texto de plan de financiación
 * @param planText - Texto del plan (ej: "6 cuotas sin interés")
 * @returns Número de cuotas extraído
 */
export const extractCuotasFromPlan = (planText: string): number => {
  const match = planText.match(/(\d+)\s*cuotas?/i);
  return match ? parseInt(match[1], 10) : 0;
};

// ==========================================
// CONSTANTES
// ==========================================

export const DEFAULT_FINANCING_OPTIONS: FinancingOptions[] = [
  { cuotas: 3, interes: 0, tipo: 'sin_interes' },
  { cuotas: 6, interes: 0, tipo: 'sin_interes' },
  { cuotas: 12, interes: 15, tipo: 'con_interes' },
  { cuotas: 18, interes: 20, tipo: 'con_interes' }
];

export const MAX_CUOTAS = 60;
export const MIN_CUOTAS = 1;