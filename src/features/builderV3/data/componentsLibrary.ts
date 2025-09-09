// =====================================
// BUILDER V3 - COMPONENTS LIBRARY (CODE-BASED)
// =====================================

import { ComponentDefinitionV3, ComponentsLibraryV3 } from '../types';

// =====================================
// DEFINICIONES DE COMPONENTES
// =====================================

const textComponents: ComponentDefinitionV3[] = [
  {
    type: 'field-dynamic-text',
    name: 'Texto Dinámico',
    description: 'Campo para mostrar cualquier información: productos, precios, etc.',
    icon: '📝',
    category: 'Texto y Datos',
    tags: ['texto', 'dinámico', 'productos', 'precios', 'sap'],
    defaultSize: { width: 300, height: 40, isProportional: false },
    defaultStyle: {
      typography: {
        fontSize: 16,
        fontStyle: 'normal',
        textAlign: 'left',
        fontFamily: 'Inter',
        fontWeight: 'normal',
        lineHeight: 1.4,
        letterSpacing: 0,
        textTransform: 'none',
        textDecoration: 'none'
      },
      color: {
        color: '#000000', // color del texto
        backgroundColor: 'transparent'
      }
    },
    defaultContent: {
      fieldType: 'static',
      staticValue: 'Texto estático'
    }
  }
];

const headerComponents: ComponentDefinitionV3[] = [
  {
    type: 'image-header',
    name: 'Imagen de Header',
    description: 'Imagen promocional principal para encabezados.',
    icon: '🏷️',
    category: 'Imagen de Header',
    tags: ['imagen', 'header', 'promocional', 'migration-header'],
    defaultSize: { width: 800, height: 200, isProportional: true },
    defaultStyle: {
      color: { backgroundColor: 'transparent', color: '#333333' }
    },
    defaultContent: {
      imageAlt: '',
      imageUrl: '',
      fieldType: 'static'
    }
  }
];

const footerComponents: ComponentDefinitionV3[] = [
  {
    type: 'image-footer',
    name: 'Imagen de Footer',
    description: 'Imagen de pie de página con información adicional.',
    icon: '📋',
    category: 'Imagen de Footer',
    tags: ['imagen', 'footer', 'información', 'migration-footer'],
    defaultSize: { width: 800, height: 150, isProportional: true },
    defaultStyle: {
      color: { backgroundColor: 'transparent', color: '#333333' }
    },
    defaultContent: {
      imageAlt: '',
      imageUrl: '',
      fieldType: 'static'
    }
  }
];

const backgroundComponents: ComponentDefinitionV3[] = [
  {
    type: 'image-background',
    name: 'Imagen de Fondo',
    description: 'Imagen de fondo que cubre toda la plantilla.',
    icon: '🌄',
    category: 'Imagen de Fondo',
    tags: ['imagen', 'fondo', 'plantilla', 'migration-background'],
    defaultSize: { width: 1080, height: 1350, isProportional: true },
    defaultStyle: {},
    defaultContent: {
      imageAlt: 'Fondo del cartel',
      imageUrl: '',
      fieldType: 'static'
    }
  }
];

const imageComponents: ComponentDefinitionV3[] = [
  {
    type: 'image-decorative',
    name: 'Imagen',
    description: 'Imagen genérica utilizable en cualquier parte del cartel.',
    icon: '🖼️',
    category: 'Imágenes y Media',
    tags: ['imagen', 'genérica', 'media', 'decorativa'],
    defaultSize: { width: 300, height: 200, isProportional: true },
    defaultStyle: {
      color: { backgroundColor: 'transparent', color: '#333333' }
    },
    defaultContent: {
      imageAlt: 'Imagen',
      imageUrl: '',
      fieldType: 'static'
    }
  },
  {
    type: 'image-dynamic',
    name: 'Imagen Dinámica',
    description: 'Imagen que se puede subir desde la carpeta local y se expande respetando las dimensiones del componente.',
    icon: '📁',
    category: 'Imágenes y Media',
    tags: ['imagen', 'dinámica', 'subir', 'local', 'personalizada', 'upload'],
    defaultSize: { width: 200, height: 150, isProportional: true },
    defaultStyle: {
      color: { backgroundColor: 'transparent', color: '#333333' }
    },
    defaultContent: {
      imageAlt: 'Imagen dinámica',
      imageUrl: '',
      fieldType: 'dynamic-upload'
    }
  }
];

// QR y Enlaces eliminados por solicitud del usuario

// Fechas y Períodos eliminados por solicitud del usuario

const decorativeComponents: ComponentDefinitionV3[] = [
  {
    type: 'shape-geometric',
    name: 'Forma Geométrica',
    description: 'Formas geométricas: círculos, rectángulos, líneas.',
    icon: '⬜',
    category: 'Elementos Decorativos',
    tags: ['forma', 'geométrico', 'decorativo'],
    defaultSize: { width: 200, height: 100, isProportional: false },
    defaultStyle: {
      color: {
        backgroundColor: 'transparent',
        color: '#333333'
      },
      border: {
        width: 1,
        style: 'solid',
        color: '#333333',
        radius: { topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 }
      }
    },
    defaultContent: {
      fieldType: 'static',
      shapeConfig: { type: 'rectangle' }
    }
  }
  // Línea decorativa e ícono decorativo eliminados por solicitud del usuario
];

// =====================================
// COMPONENTES DE FINANCIACIÓN
// =====================================

const financingComponents: ComponentDefinitionV3[] = [
  {
    type: 'image-financing',
    name: 'Logo de Financiación',
    description: 'Logo de financiación que se selecciona desde un modal, no editable manualmente.',
    icon: '💳',
    category: 'Financiación',
    tags: ['financiación', 'logo', 'banco', 'tarjeta', 'modal'],
    defaultSize: { width: 150, height: 100, isProportional: true },
    defaultStyle: {},
    defaultContent: {
      fieldType: 'financing-logo',
      imageAlt: 'Logo de financiación',
      imageUrl: '', // Se llenará desde el modal
      selectedBank: '', // Banco seleccionado
      selectedPlan: '' // Plan seleccionado
    }
  }
];

// Contenedores y Layout eliminados por solicitud del usuario

// =====================================
// LIBRERÍA COMPLETA
// =====================================

export const componentsLibrary: ComponentsLibraryV3 = {
  'Texto y Datos': textComponents,
  'Imagen de Header': headerComponents,
  'Imagen de Footer': footerComponents,
  'Imagen de Fondo': backgroundComponents,
  'Imágenes y Media': imageComponents,
  'Financiación': financingComponents,
  'Elementos Decorativos': decorativeComponents
};

// =====================================
// FUNCIONES HELPER
// =====================================

/**
 * Obtener un componente por su tipo
 */
export const getComponentByType = (type: string): ComponentDefinitionV3 | undefined => {
  for (const category of Object.values(componentsLibrary)) {
    const component = category?.find(comp => comp.type === type);
    if (component) return component;
  }
  return undefined;
};

/**
 * Obtener todos los componentes de una categoría
 */
export const getComponentsByCategory = (category: string): ComponentDefinitionV3[] => {
  return componentsLibrary[category as keyof ComponentsLibraryV3] || [];
};

/**
 * Buscar componentes por tags
 */
export const searchComponentsByTags = (tags: string[]): ComponentDefinitionV3[] => {
  const results: ComponentDefinitionV3[] = [];
  
  for (const category of Object.values(componentsLibrary)) {
    category?.forEach(component => {
      if (tags.some(tag => component.tags.includes(tag))) {
        results.push(component);
      }
    });
  }
  
  return results;
};

/**
 * Obtener estadísticas de la librería
 */
export const getLibraryStats = () => {
  const totalComponents = Object.values(componentsLibrary)
    .reduce((total, category) => total + (category?.length || 0), 0);
  
  const categoriesCount = Object.keys(componentsLibrary).length;
  
  const componentsByCategory = Object.entries(componentsLibrary)
    .map(([category, components]) => ({
      category,
      count: components?.length || 0
    }));

  return {
    totalComponents,
    categoriesCount,
    componentsByCategory
  };
};

// =====================================
// EXPORT POR DEFECTO
// =====================================

export default componentsLibrary; 