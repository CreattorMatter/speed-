export const POSTER_TEMPLATES = [
  // Plantillas originales
  { id: 'promo-bancaria', name: 'Promoción Bancaria', description: 'Plantilla para ofertas con tarjetas' },
  { id: 'oferta-destacada', name: 'Oferta Destacada', description: 'Diseño para ofertas especiales' },
  { id: 'combo-productos', name: '2x1 Productos', description: 'Plantilla para promociones 2x1' },
  { id: 'descuento-categoria', name: 'Descuento Categoría', description: 'Diseño para descuentos por categoría' },
  { id: 'liquidacion', name: 'Liquidación', description: 'Plantilla para liquidaciones y rebajas' },
  
  // Nuevas plantillas basadas en la imagen 2
  { id: 'ladrillazos', name: 'Ladrillazos', description: 'Plantilla para promociones de Ladrillazos' },
  { id: 'mundo-experto', name: 'Mundo Experto', description: 'Plantilla para promociones de Mundo Experto' },
  { id: 'constructor', name: 'Constructor', description: 'Plantilla para promociones de Constructor' },
  { id: 'feria-descuento-combo', name: 'Feria Descuento Combo', description: 'Plantilla para combos de Feria de descuentos' },
  { id: 'feria-descuento-porcentaje', name: 'Feria Descuento Porcentaje', description: 'Plantilla para descuentos porcentuales' }
];

// Mapeo de IDs de plantillas a componentes
export const TEMPLATE_COMPONENTS = {
  'ladrillazos': () => import('./templates/Ladrillazos/Ladrillazos1'),
  'mundo-experto': () => import('./templates/mundoExperto/MundoExperto1'),
  'constructor': () => import('./templates/Constructor/Constructor1'),
  'feria-descuento-combo': () => import('./templates/ferias de desc/FeriaDescuento1'),
  'feria-descuento-porcentaje': () => import('./templates/ferias de desc/FeriaDescuento2'),
  'superprecio': () => import('./templates/superprecio/Superprecio1')
};