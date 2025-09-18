/* eslint-disable @typescript-eslint/no-explicit-any */
// =====================================
// BUILDER V3 - CUSTOM FIELD REGISTRY (Campos Propios)
// =====================================

export type FieldSourceV3 = 'sap' | 'speed' | 'user' | 'alias' | 'calculated';
export type FieldDataTypeV3 = 'number' | 'money' | 'text' | 'date' | 'boolean';

export interface BaseFieldDefV3 {
  slug: string;           // identificador técnico estable (snake_case)
  label: string;          // nombre visible editable
  source: FieldSourceV3;  // origen del campo
  dataType: FieldDataTypeV3;
  aliases?: string[];     // nombres anteriores para compatibilidad
  format?: {
    showCurrencySymbol?: boolean;
    showDecimals?: boolean;
    superscriptDecimals?: boolean;
    precision?: string | number;
    locale?: string;
    prefix?: string;
    suffix?: string;
  };
}

export interface ManualFieldDefV3 extends BaseFieldDefV3 {
  source: 'user';
  value: string | number | boolean;
}

export interface AliasFieldDefV3 extends BaseFieldDefV3 {
  source: 'alias';
  target: string; // slug o ID de otro campo (SAP/SPEED/Custom)
}

export interface CalculatedFieldDefV3 extends BaseFieldDefV3 {
  source: 'calculated';
  expression: string; // expresión con sintaxis [slug]
}

export type CustomFieldDefV3 = ManualFieldDefV3 | AliasFieldDefV3 | CalculatedFieldDefV3;

// =====================
// REGISTRY (in-memory singleton)
// =====================

const registry: Record<string, CustomFieldDefV3> = {};
const aliasIndex: Record<string, string> = {}; // alias -> slug

// Utils
const slugify = (text: string) =>
  (text || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

export const isNumericDataType = (t: FieldDataTypeV3) => t === 'number' || t === 'money';

// =====================
// CRUD API
// =====================

export const listCustomFields = (): CustomFieldDefV3[] => Object.values(registry);

export const getCustomFieldBySlug = (slugOrAlias: string): CustomFieldDefV3 | undefined => {
  const key = slugOrAlias in registry ? slugOrAlias : aliasIndex[slugOrAlias];
  return key ? registry[key] : registry[slugOrAlias];
};

export const upsertCustomField = (partial: Partial<CustomFieldDefV3> & { label: string; source: FieldSourceV3; dataType: FieldDataTypeV3 }): CustomFieldDefV3 => {
  const slug = partial.slug ? slugify(partial.slug) : slugify(partial.label);
  const base: BaseFieldDefV3 = {
    slug,
    label: partial.label,
    source: partial.source,
    dataType: partial.dataType,
    aliases: (partial as any).aliases || registry[slug]?.aliases || [],
    format: (partial as any).format || registry[slug]?.format,
  };

  let def: CustomFieldDefV3;
  if (partial.source === 'user') {
    def = { ...base, source: 'user', value: (partial as any).value ?? '' };
  } else if (partial.source === 'alias') {
    def = { ...base, source: 'alias', target: (partial as any).target || '' };
  } else {
    def = { ...base, source: 'calculated', expression: (partial as any).expression || '' };
  }

  registry[slug] = def;
  // Indexar alias (si existen)
  (def.aliases || []).forEach(a => { aliasIndex[a] = slug; });
  return def;
};

export const removeCustomField = (slug: string) => {
  const def = registry[slug];
  if (!def) return;
  delete registry[slug];
  (def.aliases || []).forEach(a => { delete aliasIndex[a]; });
};

/**
 * Reemplaza completamente el contenido del registro con una lista provista (por ejemplo al cargar una plantilla)
 */
export const resetCustomFields = (fields: CustomFieldDefV3[] = []) => {
  // Limpiar
  Object.keys(registry).forEach(k => delete registry[k]);
  Object.keys(aliasIndex).forEach(k => delete aliasIndex[k]);
  // Cargar
  fields.forEach(f => {
    registry[f.slug] = f;
    (f.aliases || []).forEach(a => { aliasIndex[a] = f.slug; });
  });
};

/** Serializa el contenido del registro para persistir en TemplateV3 */
export const exportCustomFields = (): CustomFieldDefV3[] => listCustomFields();

// =====================
// Helpers de resolución (utilizados por dynamicContentProcessor)
// =====================

/**
 * Retorna true si existe un campo propio con ese slug o alias
 */
export const hasCustomField = (slugOrAlias: string): boolean => !!getCustomFieldBySlug(slugOrAlias);

/**
 * Obtiene el valor crudo de un campo manual, o el target de un alias.
 * Para calculados, retorna la expresión para que el caller decida cómo evaluarla.
 */
export const getCustomFieldRaw = (slug: string): { kind: 'user' | 'alias' | 'calculated'; value?: string | number | boolean; target?: string; expression?: string; dataType: FieldDataTypeV3; format?: BaseFieldDefV3['format'] } | undefined => {
  const def = getCustomFieldBySlug(slug);
  if (!def) return undefined;
  if (def.source === 'user') {
    return { kind: 'user', value: def.value, dataType: def.dataType, format: def.format };
    } else if (def.source === 'alias') {
    return { kind: 'alias', target: def.target, dataType: def.dataType, format: def.format };
  } else {
    return { kind: 'calculated', expression: def.expression, dataType: def.dataType, format: def.format };
  }
};

// Exponer utilidades de conveniencia para la UI
export const utils = { slugify };
