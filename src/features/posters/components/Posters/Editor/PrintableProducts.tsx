import React from 'react';
import { type ProductoParaImprimir } from '../../../../../types/index';
import { type Product } from '../../../../../data/products';
import { type TemplateModel } from '../../../../../constants/posters/templates';

interface PrintableProductsProps {
  productosParaImprimir: ProductoParaImprimir[];
  templateComponents: Record<string, React.ComponentType<any>>;
  PLANTILLA_MODELOS: Record<string, TemplateModel[]>;
  getCurrentProductValue: (product: Product, field: string) => any;
}

export const PrintableProducts = React.forwardRef<HTMLDivElement, PrintableProductsProps>(
  ({ productosParaImprimir, templateComponents, PLANTILLA_MODELOS, getCurrentProductValue }, ref) => {
    
    // Función para generar props dinámicos para el componente de plantilla
    const generateTemplateProps = (producto: ProductoParaImprimir) => {
      const baseProps = {
        small: false,
        financiacion: producto.financing,
        productos: [producto.product],
        titulo: "Ofertas Especiales"
      };

      // Generar props dinámicos basados en los valores del producto
      const templateProps: Record<string, any> = {
        // Mapeo directo de campos
        nombre: getCurrentProductValue(producto.product, 'nombre'),
        precioActual: getCurrentProductValue(producto.product, 'precioActual')?.toString(),
        porcentaje: getCurrentProductValue(producto.product, 'porcentaje')?.toString(),
        sap: getCurrentProductValue(producto.product, 'sap')?.toString(),
        fechasDesde: getCurrentProductValue(producto.product, 'fechasDesde')?.toString(),
        fechasHasta: getCurrentProductValue(producto.product, 'fechasHasta')?.toString(),
        origen: getCurrentProductValue(producto.product, 'origen')?.toString(),
        precioSinImpuestos: getCurrentProductValue(producto.product, 'precioSinImpuestos')?.toString()
      };

      return { 
        ...baseProps, 
        ...templateProps 
      };
    };

    // Función para encontrar el componente de plantilla
    const getTemplateComponent = (producto: ProductoParaImprimir) => {
      if (!producto.plantillaSeleccionada || !producto.modeloSeleccionado) {
        return null;
      }

      const modelos = PLANTILLA_MODELOS[producto.plantillaSeleccionada] || [];
      const modelo = modelos.find(m => m.id === producto.modeloSeleccionado);
      
      if (!modelo) {
        return null;
      }

      return templateComponents[modelo.componentPath];
    };

    return (
      <div ref={ref} className="print-container">
        {/* Estilos específicos para impresión */}
        <style>{`
          @media print {
            .print-container {
              width: 100%;
              height: 100%;
            }
            
            .print-page {
              page-break-after: always;
              width: 100%;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            
            .print-page:last-child {
              page-break-after: avoid;
            }
            
            .print-content {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            /* Ocultar elementos no necesarios en impresión */
            .no-print {
              display: none !important;
            }
          }
          
          @media screen {
            .print-container {
              background: #f5f5f5;
              padding: 20px;
            }
            
            .print-page {
              background: white;
              margin-bottom: 20px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              padding: 20px;
              min-height: 400px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        `}</style>

        {productosParaImprimir.map((producto, index) => {
          const Component = getTemplateComponent(producto);
          
          return (
            <div key={producto.idUnico} className="print-page">
              <div className="print-content">
                {Component && typeof Component === "function" ? (
                  <Component 
                    {...generateTemplateProps(producto)} 
                  />
                ) : (
                  <div className="text-center p-8">
                    <h3 className="text-xl font-bold text-red-600 mb-4">
                      Error al cargar plantilla
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Producto: {producto.product.name}
                    </p>
                    <p className="text-gray-600 mb-2">
                      Plantilla: {producto.plantillaSeleccionada}
                    </p>
                    <p className="text-gray-600">
                      Modelo: {producto.modeloSeleccionado}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

PrintableProducts.displayName = 'PrintableProducts'; 