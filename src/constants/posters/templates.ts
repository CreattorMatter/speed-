/* eslint-disable @typescript-eslint/no-explicit-any */
// src/constants/posters/templates.ts
import React from 'react';

// Definir las interfaces
export interface TemplateOption {
  label: string;
  value: string;
}

export interface TemplateModel {
  id: string;
  componentPath: string;
}

// Lista de plantillas disponibles
export const PLANTILLAS: TemplateOption[] = [
  { label: "Superprecio", value: "Superprecio" },
  { label: "Feria de descuentos", value: "Feria de descuentos" },
  { label: "Financiación", value: "Financiación" },
  { label: "Troncales", value: "Troncales" },
  { label: "Nuevo", value: "Nuevo" },
  { label: "Temporada", value: "Temporada" },
  { label: "Hot Sale", value: "Hot Sale" },
  { label: "Precios que la rompen", value: "Precios que la rompen" },
  { label: "Ladrillazos", value: "Ladrillazos" },
  { label: "Mundo Experto", value: "Mundo Experto" },
  { label: "Constructor", value: "Constructor" },
  { label: "Multi Productos", value: "Multi Productos" },
];

// Mapeo de plantillas a sus modelos
export const PLANTILLA_MODELOS: Record<string, TemplateModel[]> = {
  "Superprecio": [
    { id: "superprecio-1", componentPath: "superprecio/Superprecio1" },
    { id: "superprecio-2", componentPath: "superprecio/Superprecio1" },
    { id: "superprecio-3", componentPath: "superprecio/Superprecio1" },
    { id: "superprecio-4", componentPath: "superprecio/Superprecio1" },
    { id: "superprecio-5", componentPath: "superprecio/Superprecio1" },
    { id: "superprecio-6", componentPath: "superprecio/Superprecio1" },
    { id: "superprecio-7", componentPath: "superprecio/Superprecio1" },
    { id: "superprecio-8", componentPath: "superprecio/Superprecio1" },
    { id: "superprecio-9", componentPath: "superprecio/Superprecio1" },
    { id: "superprecio-10", componentPath: "superprecio/Superprecio1" },
  ],
  "Ladrillazos": [
    { id: "ladrillazos-1", componentPath: "Ladrillazos/Ladrillazos1" },
    { id: "ladrillazos-2", componentPath: "Ladrillazos/Ladrillazos2" }, // Template para antes_ahora_dto
    { id: "ladrillazos-3", componentPath: "Ladrillazos/Ladrillazos3" }, // Template para combo_dto
    { id: "ladrillazos-4", componentPath: "Ladrillazos/Ladrillazos4" }, // Template para descuento_plano_categoria
  ],
  "Mundo Experto": [
    { id: "mundo-experto-1", componentPath: "mundoExperto/MundoExperto1" },
    { id: "mundo-experto-2", componentPath: "mundoExperto/MundoExperto1" },
    { id: "mundo-experto-3", componentPath: "mundoExperto/MundoExperto1" },
  ],
  "Constructor": [
    { id: "constructor-1", componentPath: "Constructor/Constructor1" },
    { id: "constructor-2", componentPath: "Constructor/Constructor1" },
    { id: "constructor-3", componentPath: "Constructor/Constructor1" },
  ],
  "Feria de descuentos": [
    { id: "feria-descuento-1", componentPath: "ferias de desc/FeriaDescuento1" },
    { id: "feria-descuento-2", componentPath: "ferias de desc/FeriaDescuento2" },
  ],
  "Hot sake": [
    { id: "hotsake-1", componentPath: "HotSake/HotSake" }
  ],
  "Super precio 2da unidad": [
    { id: "superprecio2da-1", componentPath: "Superprecio2daUnidad/Superprecio2daUnidad" }
  ],
  "Troncales": [
    { id: "troncal-1", componentPath: "Troncal/Troncal" }
  ],
  "Multi Productos": [
    { id: "multi-productos-1", componentPath: "MultiProductos/MultiProductos" }
  ],
};

// Caché de componentes para evitar cargas repetidas
const componentCache: Record<string, React.ComponentType<any>> = {};

// Función para cargar dinámicamente un componente
export const loadTemplateComponent = async (componentPath: string): Promise<React.ComponentType<any> | null> => {
  try {
    // Verificar si ya está en caché
    if (componentCache[componentPath]) {
      return componentCache[componentPath];
    }
    
    // Importar dinámicamente
    const module = await import(`../templates/${componentPath}`);
    const component = module.default;
    
    // Guardar en caché
    if (component) {
      componentCache[componentPath] = component;
    }
    
    return component;
  } catch (error) {
    console.error(`Error al cargar el componente ${componentPath}:`, error);
    return null;
  }
};