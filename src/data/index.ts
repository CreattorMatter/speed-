// =====================================
// EXPORTACIONES CENTRALES DEL SISTEMA ERP
// =====================================

// Entidades principales
export * from './products';
export * from './tiendas';
export * from './secciones';
export * from './promociones';

// Tipos específicos (evitar duplicación)
export type { ProductoReal, Tienda, Seccion, Promocion, EntidadERP } from '../types/product';

// Re-exportaciones para compatibilidad
import { productos, products } from './products';
import { tiendas } from './tiendas';
import { secciones } from './secciones';
import { promociones } from './promociones';

// =====================================
// FUNCIONES DE BÚSQUEDA GLOBAL
// =====================================

/**
 * Busca productos por término general
 */
export const buscarProductos = (termino: string) => {
  const terminoLower = termino.toLowerCase();
  return productos.filter(producto => 
    producto.descripcion?.toLowerCase().includes(terminoLower) ||
    producto.marcaTexto?.toLowerCase().includes(terminoLower) ||
    producto.seccion?.toLowerCase().includes(terminoLower) ||
    producto.sku?.toString().includes(termino) ||
    producto.ean?.toString().includes(termino)
  );
};

/**
 * Obtiene productos con promociones activas
 */
export const getProductosConPromociones = () => {
  const promocionesActivas = promociones.filter(p => p.estado === 'ACTIVO');
  const eansConPromo = new Set(promocionesActivas.map(p => p.ean).filter(Boolean));
  
  return productos.filter(producto => eansConPromo.has(producto.ean));
};

/**
 * Obtiene resumen de inventario por sección
 */
export const getResumenInventario = () => {
  const resumen: Record<string, {
    totalProductos: number;
    stockTotal: number;
    valorInventario: number;
  }> = {};

  productos.forEach(producto => {
    const seccion = producto.seccion || 'Sin clasificar';
    if (!resumen[seccion]) {
      resumen[seccion] = {
        totalProductos: 0,
        stockTotal: 0,
        valorInventario: 0
      };
    }

    resumen[seccion].totalProductos++;
    resumen[seccion].stockTotal += producto.stockDisponible || 0;
    resumen[seccion].valorInventario += (producto.precio || 0) * (producto.stockDisponible || 0);
  });

  return resumen;
};

// =====================================
// EXPORTACIONES ESPECÍFICAS
// =====================================

export {
  productos,
  products, // Alias para compatibilidad
  tiendas,
  secciones, 
  promociones
}; 