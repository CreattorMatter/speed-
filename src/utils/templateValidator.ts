// ========================================
// VALIDADOR DE PLANTILLAS DINÁMICO
// Detecta automáticamente qué plantillas requieren productos
// ========================================

import { extractDynamicFields } from './productFieldsMap';

export const FIELD_REQUIREMENTS = {
  STATIC_FIELDS: [
    'validity_period',
    'current_date',
    'current_time',
    'store_name',
    'store_address',
    'store_location',
    'static_text',
    'company_logo',
    'branch_info'
  ],
  PRODUCT_FIELDS: [
    'product_name',
    'product_description',
    'product_sku',
    'product_ean',
    'product_brand',
    'product_price',
    'price_original',
    'price_final',
    'price_discount',
    'price_previous',
    'price_base',
    'price_without_tax',
    'discount_percentage',
    'product_origin',
    'product_origin_code',
    'stock_available'
  ],
  LEGACY_PRODUCT_FIELDS: [
    'product-name',
    'product-description',
    'product-sku',
    'product-brand',
    'price-original',
    'price-final',
    'price-discount',
    'discount-percentage',
    'price-without-taxes'
  ]
} as const;

export const DYNAMIC_COMPONENT_TYPES = {
  FIELD_DYNAMIC_TEXT: 'field-dynamic-text',
  FIELD_CALCULATED: 'field-calculated',
  FIELD_SAP_CONNECTED: 'field-sap-product'
} as const;

export const fieldRequiresProducts = (fieldId: string): boolean => {
  if (FIELD_REQUIREMENTS.STATIC_FIELDS.includes(fieldId)) return false;
  if (FIELD_REQUIREMENTS.PRODUCT_FIELDS.includes(fieldId)) return true;
  if (FIELD_REQUIREMENTS.LEGACY_PRODUCT_FIELDS.includes(fieldId)) return true;
  // Por defecto considerar que requiere productos (fail-safe)
  return true;
};

export const extractFieldsFromComponent = (component: any): string[] => {
  const fields: string[] = [];
  if (component?.content?.fieldType === 'dynamic' && component?.content?.dynamicTemplate) {
    fields.push(...extractDynamicFields(component.content.dynamicTemplate));
  }
  if (component?.content?.textConfig?.contentType) {
    fields.push(component.content.textConfig.contentType);
  }
  if (component?.content?.fieldType === 'calculated' && component?.content?.calculatedField?.expression) {
    const expression = component.content.calculatedField.expression;
    fields.push(...extractDynamicFields(expression));
  }
  if (component?.content?.fieldType === 'sap-product' && component?.content?.sapConnection?.fieldName) {
    fields.push(component.content.sapConnection.fieldName);
  }
  return fields;
};

export const analyzeTemplateComponents = (template: any) => {
  const components = (
    template?.canvas?.components ||
    template?.defaultComponents ||
    template?.components ||
    []
  );
  if (!Array.isArray(components)) {
    return {
      hasComponents: false,
      totalComponents: 0,
      dynamicComponents: 0,
      staticComponents: 0,
      allFields: [],
      productFields: [],
      staticFields: []
    };
  }

  const allFields: string[] = [];
  const productFields: string[] = [];
  const staticFields: string[] = [];
  let dynamicComponents = 0;

  components.forEach((component: any) => {
    // Analizar todos los componentes; la función interna detecta si tienen campos relevantes
    const componentFields = extractFieldsFromComponent(component);
    if (componentFields.length > 0) {
      dynamicComponents++;
      allFields.push(...componentFields);
      componentFields.forEach((field) => {
        if (fieldRequiresProducts(field)) productFields.push(field);
        else staticFields.push(field);
      });
    }
  });

  return {
    hasComponents: true,
    totalComponents: components.length,
    dynamicComponents,
    staticComponents: components.length - dynamicComponents,
    allFields: Array.from(new Set(allFields)),
    productFields: Array.from(new Set(productFields)),
    staticFields: Array.from(new Set(staticFields))
  };
};

export const templateRequiresProducts = (template: any): {
  requiresProducts: boolean;
  reason: string;
  analysis: ReturnType<typeof analyzeTemplateComponents>;
} => {
  const analysis = analyzeTemplateComponents(template);
  if (!analysis.hasComponents) {
    return { requiresProducts: false, reason: 'La plantilla no tiene componentes', analysis };
  }
  if (analysis.dynamicComponents === 0) {
    return { requiresProducts: false, reason: 'La plantilla no tiene campos dinámicos', analysis };
  }
  if (analysis.productFields.length > 0) {
    return {
      requiresProducts: true,
      reason: `Campos que requieren productos: ${analysis.productFields.join(', ')}`,
      analysis
    };
  }
  return {
    requiresProducts: false,
    reason: `Solo campos estáticos: ${analysis.staticFields.join(', ')}`,
    analysis
  };
};

export const logTemplateAnalysis = (template: any, templateName?: string) => {
  const result = templateRequiresProducts(template);
  // Logs solo para desarrollo
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.group?.(`🔍 Análisis de plantilla: ${templateName || 'Sin nombre'}`);
    // eslint-disable-next-line no-console
    console.log?.(`Resultado: ${result.requiresProducts ? 'Requiere productos' : 'No requiere productos'}`);
    // eslint-disable-next-line no-console
    console.log?.(`Razón: ${result.reason}`);
    // eslint-disable-next-line no-console
    console.log?.(`Campos:`, result.analysis.allFields);
    // eslint-disable-next-line no-console
    console.groupEnd?.();
  }
  return result;
};


