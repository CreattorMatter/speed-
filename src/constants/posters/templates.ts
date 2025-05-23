/* eslint-disable @typescript-eslint/no-explicit-any */
// src/constants/posters/templates.ts
import React from 'react';

// Importaciones estáticas de todos los componentes de plantillas
import Superprecio1 from '../templates/superprecio/Superprecio1';
import Superprecio from '../templates/superprecio/Superprecio';
import Ladrillazos1 from '../templates/Ladrillazos/Ladrillazos1';
import Ladrillazos2 from '../templates/Ladrillazos/Ladrillazos2';
import Ladrillazos3 from '../templates/Ladrillazos/Ladrillazos3';
import Ladrillazos4 from '../templates/Ladrillazos/Ladrillazos4';
import MundoExperto1 from '../templates/mundoExperto/MundoExperto1';
import Constructor1 from '../templates/Constructor/Constructor1';
import FeriaDescuento1 from '../templates/ferias de desc/FeriaDescuento1';
import FeriaDescuento2 from '../templates/ferias de desc/FeriaDescuento2';
import MultiProductos from '../templates/MultiProductos/MultiProductos';

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
    // Las 18 plantillas exactas según las imágenes enviadas
    { id: "ladrillazos-1", componentPath: "Ladrillazos/Ladrillazos1" },    // PRECIO LLENO
    { id: "ladrillazos-2", componentPath: "Ladrillazos/Ladrillazos2" },    // FLOORING  
    { id: "ladrillazos-3", componentPath: "Ladrillazos/Ladrillazos3" },    // COMBO
    { id: "ladrillazos-4", componentPath: "Ladrillazos/Ladrillazos4" },    // DESCUENTO PLANO CATEGORIA
    { id: "ladrillazos-5", componentPath: "Ladrillazos/Ladrillazos5" },    // ANTES/AHORA CON DTO
    { id: "ladrillazos-6", componentPath: "Ladrillazos/Ladrillazos6" },    // ANTES/AHORA FLOORING
    { id: "ladrillazos-7", componentPath: "Ladrillazos/Ladrillazos7" },    // FLOORING EN CUOTAS
    { id: "ladrillazos-8", componentPath: "Ladrillazos/Ladrillazos8" },    // CUOTAS
    { id: "ladrillazos-9", componentPath: "Ladrillazos/Ladrillazos9" },    // ANTES/AHORA FLOORING CON DTO
    { id: "ladrillazos-10", componentPath: "Ladrillazos/Ladrillazos10" },  // FLOORING EN CUOTAS
    { id: "ladrillazos-11", componentPath: "Ladrillazos/Ladrillazos11" },  // COMBO CUOTAS
    { id: "ladrillazos-12", componentPath: "Ladrillazos/Ladrillazos12" },  // PROMO 3X2 CON PRECIO
    { id: "ladrillazos-13", componentPath: "Ladrillazos/Ladrillazos13" },  // PROMO 3X2 PLANO CATEGORIA
    { id: "ladrillazos-14", componentPath: "Ladrillazos/Ladrillazos14" },  // PROMO 3X2 PLANO CATEGORIA COMBINABLE
    { id: "ladrillazos-15", componentPath: "Ladrillazos/Ladrillazos15" },  // DESCUENTO PLANO CATEGORIA
    { id: "ladrillazos-16", componentPath: "Ladrillazos/Ladrillazos16" },  // DESCUENTO EN LA 2DA UNIDAD
    { id: "ladrillazos-17", componentPath: "Ladrillazos/Ladrillazos17" },  // CUOTAS
    { id: "ladrillazos-18", componentPath: "Ladrillazos/Ladrillazos18" },  // ANTES/AHORA EN CUOTAS CON DTO
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

// Mapa de componentes para cargar estáticamente
const componentMap: Record<string, React.ComponentType<any>> = {
  'superprecio/Superprecio1': Superprecio1,
  'superprecio/Superprecio': Superprecio,
  'Ladrillazos/Ladrillazos1': Ladrillazos1,
  'Ladrillazos/Ladrillazos2': Ladrillazos2,
  'Ladrillazos/Ladrillazos3': Ladrillazos3,
  'Ladrillazos/Ladrillazos4': Ladrillazos4,
  'mundoExperto/MundoExperto1': MundoExperto1,
  'Constructor/Constructor1': Constructor1,
  'ferias de desc/FeriaDescuento1': FeriaDescuento1,
  'ferias de desc/FeriaDescuento2': FeriaDescuento2,
  'MultiProductos/MultiProductos': MultiProductos
};

// Función para cargar componentes usando el mapa estático
export const loadTemplateComponent = async (componentPath: string): Promise<React.ComponentType<any> | null> => {
  try {
    // Buscar en el mapa de componentes estáticos
    const component = componentMap[componentPath];
    
    if (component) {
      return component;
    } else {
      console.error(`Componente no encontrado en el mapa: ${componentPath}`);
      return null;
    }
  } catch (error) {
    console.error(`Error al cargar el componente ${componentPath}:`, error);
    return null;
  }
};