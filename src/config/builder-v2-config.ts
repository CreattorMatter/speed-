// ===============================================
// SPEED BUILDER V2 - CONFIGURATION & DATA
// ===============================================

import { 
  FamilyType, 
  TemplateType, 
  FamilyConfig, 
  TemplateConfig,
  DraggableElementsConfig,
  DraggableElementCategory,
  ElementSize,
  ElementStyle 
} from '../types/builder-v2';

// ======================
// CONFIGURACIÓN DE FAMILIAS
// ======================

export const FAMILY_CONFIGS: Record<FamilyType, FamilyConfig> = {
  'Superprecio': {
    id: 'superprecio',
    name: 'Superprecio',
    displayName: 'Superprecio',
    description: 'Promociones con precios especiales y ofertas destacadas',
    color: '#2563eb',
    icon: '💰',
    headerImage: '/images/families/superprecio-header.jpg',
    compatibleTemplates: ['Precio Lleno', 'Antes/Ahora con dto', 'Antes/Ahora'],
    featuredTemplates: ['Precio Lleno', 'Antes/Ahora con dto'],
    recommendedElements: ['header-imagen', 'precio-contado', 'descripcion-producto', 'sku-sap', 'porcentaje-descuento'],
    brandColors: {
      primary: '#2563eb',
      secondary: '#dbeafe',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#2563eb'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#dc2626'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Feria de descuentos': {
    id: 'feria-descuentos',
    name: 'Feria de descuentos',
    displayName: 'Feria de Descuentos',
    description: 'Eventos especiales de descuentos con ambiente festivo',
    color: '#dc2626',
    icon: '🎪',
    headerImage: '/images/families/feria-header.jpg',
    compatibleTemplates: ['Descuento plano categoría', 'Antes/Ahora con dto', 'Combo con Descuento'],
    featuredTemplates: ['Descuento plano categoría'],
    recommendedElements: ['porcentaje-descuento', 'precio-antes', 'precio-contado', 'descripcion-producto'],
    brandColors: {
      primary: '#dc2626',
      secondary: '#fecaca',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#dc2626'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#dc2626'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Financiación': {
    id: 'financiacion',
    name: 'Financiación',
    displayName: 'Financiación',
    description: 'Opciones de pago en cuotas y financiamiento',
    color: '#059669',
    icon: '💳',
    compatibleTemplates: ['Cuotas', 'Combo Cuotas', 'Cuota simple 12 s/int'],
    featuredTemplates: ['Cuotas'],
    recommendedElements: ['cuotas', 'valor-cuota', 'precio-financiado-cft'],
    brandColors: {
      primary: '#059669',
      secondary: '#a7f3d0',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#059669'
      },
      priceStyle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#059669'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Troncales': {
    id: 'troncales',
    name: 'Troncales',
    displayName: 'Troncales',
    description: 'Productos principales y categorías troncales',
    color: '#7c3aed',
    icon: '🏪',
    compatibleTemplates: ['Precio Lleno', 'Antes/Ahora'],
    featuredTemplates: ['Precio Lleno'],
    recommendedElements: ['precio-contado', 'descripcion-producto', 'sku-sap'],
    brandColors: {
      primary: '#7c3aed',
      secondary: '#ddd6fe',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#7c3aed'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#7c3aed'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 4,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Nuevo': {
    id: 'nuevo',
    name: 'Nuevo',
    displayName: 'Nuevo',
    description: 'Productos nuevos y lanzamientos',
    color: '#fbbf24',
    icon: '✨',
    compatibleTemplates: ['Precio Lleno', 'Imágenes personalizadas'],
    featuredTemplates: ['Precio Lleno'],
    recommendedElements: ['precio-contado', 'descripcion-producto'],
    brandColors: {
      primary: '#fbbf24',
      secondary: '#fef3c7',
      accent: '#dc2626'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
        backgroundColor: '#fbbf24'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#dc2626'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Temporada': {
    id: 'temporada',
    name: 'Temporada',
    displayName: 'Temporada',
    description: 'Ofertas y promociones estacionales',
    color: '#ea580c',
    icon: '🌟',
    compatibleTemplates: ['Precio Lleno', 'Antes/Ahora', 'Descuento plano categoría'],
    featuredTemplates: ['Antes/Ahora'],
    recommendedElements: ['precio-contado', 'precio-antes', 'fecha-desde', 'fecha-hasta'],
    brandColors: {
      primary: '#ea580c',
      secondary: '#fed7aa',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#ea580c'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#ea580c'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 6,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Oportuneasy': {
    id: 'oportuneasy',
    name: 'Oportuneasy',
    displayName: 'Oportuneasy',
    description: 'Ofertas especiales y oportunidades únicas Easy',
    color: '#0891b2',
    icon: '🎯',
    compatibleTemplates: ['Precio Lleno', 'Antes/Ahora', 'Combo Cuotas'],
    featuredTemplates: ['Antes/Ahora'],
    recommendedElements: ['precio-contado', 'precio-antes', 'porcentaje-descuento'],
    brandColors: {
      primary: '#0891b2',
      secondary: '#a5f3fc',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#0891b2'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#0891b2'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 7,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Precios que la rompen': {
    id: 'precios-rompen',
    name: 'Precios que la rompen',
    displayName: 'Precios que la Rompen',
    description: 'Precios increíbles que no puedes dejar pasar',
    color: '#ec4899',
    icon: '💥',
    compatibleTemplates: ['Precio Lleno', 'Antes/Ahora', 'Antes/Ahora con dto'],
    featuredTemplates: ['Antes/Ahora con dto'],
    recommendedElements: ['precio-contado', 'precio-antes', 'porcentaje-descuento'],
    brandColors: {
      primary: '#ec4899',
      secondary: '#fbcfe8',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#ec4899'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#ec4899'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 8,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Ladrillazos': {
    id: 'ladrillazos',
    name: 'Ladrillazos',
    displayName: 'Ladrillazos',
    description: 'Ofertas especiales en construcción y materiales',
    color: '#d97706',
    icon: '🧱',
    compatibleTemplates: [
      'Precio Lleno', 'Flooring', 'Combo', 'Descuento plano categoría',
      'Antes/Ahora con dto', 'Antes/Ahora Flooring', 'Flooring en cuotas',
      'Cuotas', 'Promo 3x2 con precio', 'Descuento en la segunda unidad'
    ],
    featuredTemplates: ['Flooring', 'Antes/Ahora Flooring'],
    recommendedElements: [
      'precio-regular-m2', 'precio-regular-caja', 'precio-antes-regular-m2', 
      'precio-antes-regular-caja', 'descripcion-producto', 'sku-sap'
    ],
    brandColors: {
      primary: '#d97706',
      secondary: '#fed7aa',
      accent: '#dc2626'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#d97706'
      },
      priceStyle: {
        fontSize: 42,
        fontWeight: 'extrabold',
        color: '#dc2626'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 9,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Herramientas': {
    id: 'herramientas',
    name: 'Herramientas',
    displayName: 'Herramientas',
    description: 'Equipos y herramientas profesionales',
    color: '#6b7280',
    icon: '🔧',
    compatibleTemplates: ['Precio Lleno', 'Antes/Ahora', 'Imágenes personalizadas'],
    featuredTemplates: ['Precio Lleno'],
    recommendedElements: ['precio-contado', 'descripcion-producto', 'sku-sap'],
    brandColors: {
      primary: '#6b7280',
      secondary: '#f3f4f6',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#6b7280'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#dc2626'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 10,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Club Easy': {
    id: 'club-easy',
    name: 'Club Easy',
    displayName: 'Club Easy',
    description: 'Beneficios exclusivos para miembros del Club Easy',
    color: '#4338ca',
    icon: '👥',
    compatibleTemplates: ['Precio Lleno', 'Antes/Ahora', 'Combo Cuotas'],
    featuredTemplates: ['Antes/Ahora'],
    recommendedElements: ['precio-contado', 'precio-antes', 'porcentaje-descuento'],
    brandColors: {
      primary: '#4338ca',
      secondary: '#c7d2fe',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#4338ca'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#4338ca'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 11,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Cencopay': {
    id: 'cencopay',
    name: 'Cencopay',
    displayName: 'Cencopay',
    description: 'Opciones de pago y financiamiento Cencopay',
    color: '#0d9488',
    icon: '💎',
    compatibleTemplates: ['Combo Cuotas', 'Cuota simple 12 s/int'],
    featuredTemplates: ['Combo Cuotas'],
    recommendedElements: ['cuotas', 'valor-cuota', 'precio-financiado-cft'],
    brandColors: {
      primary: '#0d9488',
      secondary: '#99f6e4',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#0d9488'
      },
      priceStyle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#0d9488'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 12,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Mundo Experto': {
    id: 'mundo-experto',
    name: 'Mundo Experto',
    displayName: 'Mundo Experto',
    description: 'Asesoría profesional y productos especializados',
    color: '#059669',
    icon: '🎓',
    compatibleTemplates: ['Precio Lleno', 'Imágenes personalizadas'],
    featuredTemplates: ['Precio Lleno'],
    recommendedElements: ['precio-contado', 'descripcion-producto', 'porcentaje-descuento-especial'],
    brandColors: {
      primary: '#059669',
      secondary: '#a7f3d0',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#059669'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#059669'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 13,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Constructor': {
    id: 'constructor',
    name: 'Constructor',
    displayName: 'Constructor',
    description: 'Herramientas y materiales para construcción profesional',
    color: '#374151',
    icon: '🏗️',
    compatibleTemplates: ['Precio Lleno', 'Antes/Ahora', 'Descuento plano categoría'],
    featuredTemplates: ['Precio Lleno'],
    recommendedElements: ['precio-contado', 'descripcion-producto', 'sku-sap'],
    brandColors: {
      primary: '#374151',
      secondary: '#f3f4f6',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#374151'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#dc2626'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 14,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Fleje Promocional': {
    id: 'fleje-promocional',
    name: 'Fleje Promocional',
    displayName: 'Fleje Promocional',
    description: 'Promociones especiales con destaque SPID+',
    color: '#dc2626',
    icon: '🎯',
    compatibleTemplates: ['Fleje promocional (SPID+)'],
    featuredTemplates: ['Fleje promocional (SPID+)'],
    recommendedElements: ['precio-con-descuento', 'porcentaje-descuento', 'descripcion-producto'],
    brandColors: {
      primary: '#dc2626',
      secondary: '#fecaca',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#dc2626'
      },
      priceStyle: {
        fontSize: 42,
        fontWeight: 'extrabold',
        color: '#dc2626'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 15,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },

  'Imágenes personalizadas': {
    id: 'imagenes-personalizadas',
    name: 'Imágenes personalizadas',
    displayName: 'Imágenes Personalizadas',
    description: 'Plantillas con imágenes totalmente personalizables',
    color: '#8b5cf6',
    icon: '🖼️',
    compatibleTemplates: ['Imágenes personalizadas'],
    featuredTemplates: ['Imágenes personalizadas'],
    recommendedElements: ['descripcion-texto-variable', 'precio-contado'],
    brandColors: {
      primary: '#8b5cf6',
      secondary: '#ddd6fe',
      accent: '#fbbf24'
    },
    visualPatterns: {
      headerStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#8b5cf6'
      },
      priceStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#8b5cf6'
      },
      footerStyle: {
        fontSize: 10,
        color: '#6b7280'
      }
    },
    isActive: true,
    sortOrder: 16,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
};

// ======================
// ELEMENTOS ARRASTRABLES
// ======================

export const DRAGGABLE_ELEMENTS_CONFIG: DraggableElementsConfig = {
  'Header': [
    {
      type: 'header-imagen',
      name: 'Header con Imagen',
      description: 'Cabecera con imagen personalizada (JPG/PNG)',
      icon: '🖼️',
      defaultSize: { width: 400, height: 120 },
      defaultStyle: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#d1d5db'
      },
      category: 'Header'
    }
  ],

  'SKU': [
    {
      type: 'sku-sap',
      name: 'SKU - SAP',
      description: 'Código de producto SAP',
      icon: '🔢',
      defaultSize: { width: 150, height: 24 },
      defaultStyle: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#6b7280',
        textAlign: 'left'
      },
      category: 'SKU'
    },
    {
      type: 'rubro-grupo-articulos',
      name: 'Rubro - Grupo de Artículos',
      description: 'Categoría principal del producto',
      icon: '📂',
      defaultSize: { width: 180, height: 28 },
      defaultStyle: {
        fontSize: 14,
        fontWeight: 'medium',
        color: '#4b5563',
        textAlign: 'left'
      },
      category: 'SKU'
    },
    {
      type: 'sub-rubro-grupo-articulos',
      name: 'Sub rubro - Grupo de Artículos',
      description: 'Subcategoría del producto',
      icon: '📁',
      defaultSize: { width: 180, height: 24 },
      defaultStyle: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'left'
      },
      category: 'SKU'
    },
    {
      type: 'ean-sku',
      name: 'EAN SKU',
      description: 'Código de barras EAN',
      icon: '📊',
      defaultSize: { width: 120, height: 20 },
      defaultStyle: {
        fontSize: 10,
        fontFamily: 'monospace',
        color: '#6b7280',
        textAlign: 'left'
      },
      category: 'SKU'
    }
  ],

  'Descripción': [
    {
      type: 'descripcion-producto',
      name: 'Descripción Producto',
      description: 'Nombre y descripción del producto',
      icon: '📝',
      defaultSize: { width: 300, height: 60 },
      defaultStyle: {
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#1f2937',
        textAlign: 'left'
      },
      category: 'Descripción'
    },
    {
      type: 'descripcion-combo',
      name: 'Descripción Combo',
      description: 'Descripción para productos en combo',
      icon: '🎁',
      defaultSize: { width: 280, height: 50 },
      defaultStyle: {
        fontSize: 16,
        fontWeight: 'medium',
        color: '#374151',
        textAlign: 'left'
      },
      category: 'Descripción'
    },
    {
      type: 'descripcion-texto-variable',
      name: 'Descripción Texto Variable',
      description: 'Texto personalizable',
      icon: '✏️',
      defaultSize: { width: 250, height: 40 },
      defaultStyle: {
        fontSize: 16,
        color: '#1f2937',
        textAlign: 'left'
      },
      category: 'Descripción'
    }
  ],

  'Footer': [
    {
      type: 'origen',
      name: 'Origen',
      description: 'País o región de origen',
      icon: '🌍',
      defaultSize: { width: 120, height: 20 },
      defaultStyle: {
        fontSize: 10,
        color: '#6b7280',
        textAlign: 'left'
      },
      category: 'Footer'
    },
    {
      type: 'texto-no-acumulable',
      name: 'No acumulable con otras promociones',
      description: 'Texto legal estándar',
      icon: '⚠️',
      defaultSize: { width: 300, height: 24 },
      defaultStyle: {
        fontSize: 10,
        color: '#6b7280',
        textAlign: 'left'
      },
      category: 'Footer'
    }
  ],

  'Descuento': [
    {
      type: 'porcentaje-descuento',
      name: '% de descuento',
      description: 'Porcentaje de descuento aplicado',
      icon: '🏷️',
      defaultSize: { width: 80, height: 40 },
      defaultStyle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#dc2626',
        textAlign: 'center',
        borderRadius: 4
      },
      category: 'Descuento'
    },
    {
      type: 'porcentaje-descuento-segunda-unidad',
      name: '% descuento segunda unidad',
      description: 'Descuento en la segunda unidad',
      icon: '🏷️',
      defaultSize: { width: 100, height: 35 },
      defaultStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#ea580c',
        textAlign: 'center',
        borderRadius: 4
      },
      category: 'Descuento'
    },
    {
      type: 'porcentaje-descuento-especial',
      name: '% Descuento especial',
      description: 'Descuento especial (letras grandes)',
      icon: '💥',
      defaultSize: { width: 120, height: 60 },
      defaultStyle: {
        fontSize: 36,
        fontWeight: 'extrabold',
        color: '#ffffff',
        backgroundColor: '#dc2626',
        textAlign: 'center',
        borderRadius: 8
      },
      category: 'Descuento'
    }
  ],

  'Fechas': [
    {
      type: 'fecha-desde',
      name: 'Fecha desde (o única)',
      description: 'Fecha de inicio de la promoción',
      icon: '📅',
      defaultSize: { width: 120, height: 24 },
      defaultStyle: {
        fontSize: 12,
        color: '#dc2626',
        textAlign: 'left'
      },
      category: 'Fechas'
    },
    {
      type: 'fecha-hasta',
      name: 'Fecha hasta (opcional)',
      description: 'Fecha de fin de la promoción',
      icon: '📅',
      defaultSize: { width: 120, height: 24 },
      defaultStyle: {
        fontSize: 12,
        color: '#dc2626',
        textAlign: 'left'
      },
      category: 'Fechas'
    }
  ],

  'Precio': [
    {
      type: 'precio-contado',
      name: 'Precio/Precio Contado',
      description: 'Precio principal del producto',
      icon: '💰',
      defaultSize: { width: 150, height: 60 },
      defaultStyle: {
        fontSize: 48,
        fontWeight: 'extrabold',
        color: '#dc2626',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-sin-impuestos-nacionales',
      name: 'Precio sin impuestos nacionales',
      description: 'Precio antes de impuestos',
      icon: '💸',
      defaultSize: { width: 130, height: 40 },
      defaultStyle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#059669',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-con-descuento',
      name: 'Precio con descuento',
      description: 'Precio final con descuento aplicado',
      icon: '💸',
      defaultSize: { width: 140, height: 50 },
      defaultStyle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#dc2626',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-ahora-contado',
      name: 'Precio AHORA (con dto/Contado)',
      description: 'Precio actual con descuento',
      icon: '🎯',
      defaultSize: { width: 160, height: 55 },
      defaultStyle: {
        fontSize: 42,
        fontWeight: 'extrabold',
        color: '#dc2626',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-regular-m2',
      name: 'Precio regular x M2',
      description: 'Precio por metro cuadrado',
      icon: '📐',
      defaultSize: { width: 120, height: 40 },
      defaultStyle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#374151',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-regular-caja',
      name: 'Precio regular x caja',
      description: 'Precio por caja',
      icon: '📦',
      defaultSize: { width: 120, height: 40 },
      defaultStyle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#374151',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-ahora-contado-m2',
      name: 'Precio AHORA contado x M2',
      description: 'Precio actual por metro cuadrado',
      icon: '📐',
      defaultSize: { width: 140, height: 45 },
      defaultStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#dc2626',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-ahora-contado-caja',
      name: 'Precio AHORA contado x Caja',
      description: 'Precio actual por caja',
      icon: '📦',
      defaultSize: { width: 140, height: 45 },
      defaultStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#dc2626',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-antes-regular-m2',
      name: 'Precio ANTES regular x M2',
      description: 'Precio anterior por metro cuadrado',
      icon: '📐',
      defaultSize: { width: 120, height: 35 },
      defaultStyle: {
        fontSize: 20,
        textDecoration: 'line-through',
        color: '#6b7280',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-antes-regular-caja',
      name: 'Precio ANTES regular x Caja',
      description: 'Precio anterior por caja',
      icon: '📦',
      defaultSize: { width: 120, height: 35 },
      defaultStyle: {
        fontSize: 20,
        textDecoration: 'line-through',
        color: '#6b7280',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-combo',
      name: 'Precio COMBO',
      description: 'Precio del combo',
      icon: '🎁',
      defaultSize: { width: 150, height: 55 },
      defaultStyle: {
        fontSize: 42,
        fontWeight: 'extrabold',
        color: '#ea580c',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-combo-descuento',
      name: 'Precio COMBO con descuento',
      description: 'Precio del combo con descuento',
      icon: '🎁',
      defaultSize: { width: 160, height: 50 },
      defaultStyle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#dc2626',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-unidad-promo',
      name: 'Precio x Unidad (Promo)',
      description: 'Precio unitario en promoción',
      icon: '🏷️',
      defaultSize: { width: 130, height: 40 },
      defaultStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#059669',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-unidad-combo-promo',
      name: 'Precio x Unidad en combo (Promo)',
      description: 'Precio unitario en combo promocional',
      icon: '🎁',
      defaultSize: { width: 140, height: 35 },
      defaultStyle: {
        fontSize: 24,
        fontWeight: 'medium',
        color: '#7c3aed',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-segunda-unidad',
      name: 'Precio 2da Unidad',
      description: 'Precio de la segunda unidad',
      icon: '2️⃣',
      defaultSize: { width: 120, height: 40 },
      defaultStyle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ea580c',
        textAlign: 'center'
      },
      category: 'Precio'
    },
    {
      type: 'precio-antes',
      name: 'Precio ANTES',
      description: 'Precio original antes del descuento',
      icon: '❌',
      defaultSize: { width: 120, height: 30 },
      defaultStyle: {
        fontSize: 20,
        textDecoration: 'line-through',
        color: '#6b7280',
        textAlign: 'center'
      },
      category: 'Precio'
    }
  ],

  'Finanzas': [
    {
      type: 'cuotas',
      name: 'Cuotas',
      description: 'Número de cuotas disponibles',
      icon: '📊',
      defaultSize: { width: 120, height: 40 },
      defaultStyle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#059669',
        textAlign: 'center'
      },
      category: 'Finanzas'
    },
    {
      type: 'valor-cuota',
      name: 'Valor cuota',
      description: 'Valor de cada cuota',
      icon: '💳',
      defaultSize: { width: 100, height: 35 },
      defaultStyle: {
        fontSize: 20,
        fontWeight: 'semibold',
        color: '#059669',
        textAlign: 'center'
      },
      category: 'Finanzas'
    },
    {
      type: 'precio-financiado-cft',
      name: 'Precio financiado/CFT',
      description: 'Información completa de financiación',
      icon: '📋',
      defaultSize: { width: 200, height: 80 },
      defaultStyle: {
        fontSize: 12,
        color: '#4b5563',
        textAlign: 'left'
      },
      category: 'Finanzas'
    }
  ],

  'QR': [
    {
      type: 'informacion-qr',
      name: 'Información QR',
      description: 'Código QR con enlace personalizado',
      icon: '📱',
      defaultSize: { width: 80, height: 80 },
      defaultStyle: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db'
      },
      category: 'QR'
    }
  ]
};

// ======================
// HELPER FUNCTIONS
// ======================

export const getFamilyById = (id: string): FamilyConfig | undefined => {
  return Object.values(FAMILY_CONFIGS).find(family => family.id === id);
};

export const getFamilyByName = (name: FamilyType): FamilyConfig => {
  return FAMILY_CONFIGS[name];
};

export const getCompatibleTemplates = (familyName: FamilyType): TemplateType[] => {
  return FAMILY_CONFIGS[familyName]?.compatibleTemplates || [];
};

export const getAllFamilies = (): FamilyConfig[] => {
  return Object.values(FAMILY_CONFIGS)
    .filter(family => family.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getDraggableElementsByCategory = (category: DraggableElementCategory) => {
  return DRAGGABLE_ELEMENTS_CONFIG[category] || [];
};

export const getAllDraggableElements = () => {
  return Object.values(DRAGGABLE_ELEMENTS_CONFIG).flat();
}; 