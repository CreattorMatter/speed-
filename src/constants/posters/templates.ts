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
  "Hot sake": [
    { id: "hotsake-1", componentPath: "HotSake/HotSake" }
  ],
  "Super precio 2da unidad": [
    { id: "superprecio2da-1", componentPath: "Superprecio2daUnidad/Superprecio2daUnidad" }
  ],
  "Troncales": [
    { id: "troncal-1", componentPath: "Troncal/Troncal" }
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