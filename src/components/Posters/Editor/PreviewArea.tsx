import React from 'react';
import { type Product } from '../../../data/products';
import { type TemplateModel } from '../../../constants/posters/templates';

// Tipos específicos para el componente
interface PlantillaOption {
  value: string;
  label: string;
}

interface ComboOption {
  value: string;
  label: string;
}

interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  plan: string;
}

// Interfaz para las props de los componentes de plantilla
interface PlantillaComponentProps {
  small?: boolean;
  nombre?: string;
  precioActual?: string;
  porcentaje?: string;
  sap?: string;
  fechasDesde?: string;
  fechasHasta?: string;
  origen?: string;
  precioSinImpuestos?: string;
  financiacion?: FinancingOption[];
  productos?: Product[];
  titulo?: string;
  [key: string]: unknown;
}

interface PreviewAreaProps {
  templateComponents: Record<string, React.ComponentType<PlantillaComponentProps>>;
  plantillaSeleccionada: PlantillaOption | null;
  comboSeleccionado: ComboOption | null;
  modeloSeleccionado: string | null;
  setModeloSeleccionado: (value: string | null) => void;
  selectedProduct: Product | null;
  selectedProducts: Product[];
  selectedFinancing: FinancingOption[];
  PLANTILLA_MODELOS: Record<string, TemplateModel[]>;
  onRemoveProduct?: (productId: string) => void;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
  templateComponents,
  plantillaSeleccionada,
  comboSeleccionado,
  modeloSeleccionado,
  setModeloSeleccionado,
  selectedProduct,
  selectedProducts,
  selectedFinancing,
  PLANTILLA_MODELOS,
  onRemoveProduct
}) => {
  // Determinar si estamos en modo multiproductos
  const isMultiProductMode = selectedProducts.length > 1;
  
  // Obtener y filtrar los modelos disponibles para la plantilla seleccionada
  const getFilteredModelos = () => {
    if (!plantillaSeleccionada?.value) return [];
    
    const modelos = PLANTILLA_MODELOS[plantillaSeleccionada.value] || [];
    
    // Si no hay tipo de promoción seleccionado, mostrar todos
    if (!comboSeleccionado) return modelos;
    
    // Aplicar filtros según la plantilla y tipo de promoción
    return modelos.filter((modelo: TemplateModel) => {
      if (plantillaSeleccionada.value === 'Ladrillazos') {
        const modeloNum = parseInt(modelo.id.split('-')[1]);
        
        switch(comboSeleccionado.value) {
          case 'descuento_plano_categoria':
            // Modelos 1-4: Descuento plano categoría
            return modeloNum >= 1 && modeloNum <= 4;
          case 'antes_ahora_dto':
            // Modelos 5-10: Antes/Ahora con DTO
            return modeloNum >= 5 && modeloNum <= 10;
          case 'combo_dto':
            // Modelos 11-14: Combo DTO
            return modeloNum >= 11 && modeloNum <= 14;
          case 'promociones_especiales':
            // Modelos 15-18: Promociones especiales
            return modeloNum >= 15 && modeloNum <= 18;
          default:
            // Sin filtro: mostrar todos
            return true;
        }
      }
      
      return true; // Para otras plantillas, mostrar todos por ahora
    });
  };

  const filteredModelos = getFilteredModelos();
  
  return (
    <div className="col-span-7 h-full flex flex-col">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-1 overflow-hidden max-h-[800px] w-full">
        
        {/* Contenedor principal con scroll si es necesario */}
        <div className="w-full h-full overflow-y-auto">
          
          {/* Grid responsive para mostrar plantillas */}
          <div className={`w-full h-full ${
            isMultiProductMode 
              ? 'grid grid-cols-2 lg:grid-cols-3 gap-4 p-2' 
              : filteredModelos.length > 1 && !modeloSeleccionado
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2'
                : 'flex items-center justify-center'
          } transition-all duration-500`}>
            
            {/* Mostrar mensaje cuando no hay plantilla seleccionada */}
            {!plantillaSeleccionada && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="w-16 h-16 mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Selecciona una plantilla</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  Elige una familia de plantillas para ver los modelos disponibles
                </p>
              </div>
            )}

            {/* Mostrar mensaje cuando hay plantilla pero no hay modelos después del filtro */}
            {plantillaSeleccionada && filteredModelos.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="w-16 h-16 mb-4 bg-orange-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No hay modelos disponibles</h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  No se encontraron plantillas para la combinación seleccionada. Prueba cambiando el tipo de promoción.
                </p>
              </div>
            )}

            {/* Renderizado de múltiples productos */}
            {isMultiProductMode && filteredModelos.length > 0
              ? selectedProducts.map((product: Product, productIndex: number) => {
                  // Para multiproductos, usar el modelo seleccionado o el primero disponible
                  const modelo = modeloSeleccionado 
                    ? filteredModelos.find((m: TemplateModel) => m.id === modeloSeleccionado)
                    : filteredModelos[0];

                  if (!modelo) {
                    return (
                      <div key={`no-template-${productIndex}`} className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <p className="text-red-600 text-sm">
                          No hay plantilla disponible para: {product.name}
                        </p>
                      </div>
                    );
                  }

                  const Component = templateComponents[modelo.componentPath];

                  return (
                    <div
                      key={`${product.id}-${productIndex}`}
                      className="border rounded-lg p-3 hover:border-indigo-400 hover:shadow-md transition-all duration-300 relative bg-white"
                    >
                      {/* Número de orden del producto */}
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-indigo-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
                        {productIndex + 1}
                      </div>
                      
                      {/* Botón de eliminar producto */}
                      {onRemoveProduct && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveProduct(product.id);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-20 hover:bg-red-600 transition-colors shadow-md"
                          title={`Eliminar ${product.name} de la selección`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      
                      <div className="w-full h-[280px] flex items-center justify-center overflow-hidden">
                        {Component && typeof Component === "function" ? (
                          <div className="max-w-full max-h-full scale-90 transform">
                            <Component
                              small={true}
                              nombre={product.name}
                              precioActual={product.price?.toString()}
                              porcentaje="20"
                              sap={product.sku || ""}
                              fechasDesde="15/05/2025"
                              fechasHasta="18/05/2025"
                              origen="ARG"
                              precioSinImpuestos={
                                product.price ? (product.price * 0.83).toFixed(2) : ""
                              }
                              financiacion={selectedFinancing}
                              productos={[product]}
                              titulo="Ofertas Especiales"
                            />
                          </div>
                        ) : (
                          <div className="text-red-500 text-sm text-center">
                            Error al cargar el componente para: {product.name}
                          </div>
                        )}
                      </div>
                      
                      {/* Información del producto */}
                      <div className="mt-2 p-2 bg-gray-50 rounded text-center">
                        <p className="text-xs font-medium text-gray-800 truncate" title={product.name}>
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-600">SKU: {product.sku || 'N/A'}</p>
                        <p className="text-sm font-bold text-indigo-600">${product.price}</p>
                      </div>
                    </div>
                  );
                })
              : // Renderizado para producto único o selección de modelo
                !isMultiProductMode && filteredModelos.length > 0 && 
                filteredModelos.map((modelo: TemplateModel) => {
                  const isSelected = modeloSeleccionado === modelo.id;
                  const isAnySelected = modeloSeleccionado !== null;
                  const Component = templateComponents[modelo.componentPath];

                  // Si hay un modelo seleccionado, mostrar solo ese centrado y grande
                  if (isAnySelected && isSelected) {
                    return (
                      <div
                        key={modelo.id}
                        className="col-span-full w-full h-full flex flex-col"
                      >
                        {/* Botón para volver atrás */}
                        <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setModeloSeleccionado(null)}
                              className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              title="Volver a ver todas las plantillas"
                            >
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              <span className="text-sm text-gray-700">Volver</span>
                            </button>
                            <div className="text-sm text-gray-600">
                              Modelo {modelo.id.split('-')[1] || modelo.id} seleccionado
                            </div>
                          </div>
                          
                          {/* Información adicional */}
                          <div className="text-xs text-gray-500">
                            {filteredModelos.length} modelo{filteredModelos.length !== 1 ? 's' : ''} disponible{filteredModelos.length !== 1 ? 's' : ''}
                          </div>
                        </div>

                        {/* Contenedor de la plantilla seleccionada */}
                        <div className="flex-1 flex items-center justify-center p-4">
                          <div className="max-w-[600px] max-h-[500px] w-full h-full flex items-center justify-center">
                            {Component && typeof Component === "function" ? (
                              <Component
                                small={false} // Tamaño completo
                                nombre={selectedProduct?.name || "Producto de ejemplo"}
                                precioActual={selectedProduct?.price?.toString() || "999"}
                                porcentaje="20"
                                sap={selectedProduct?.sku || "SKU123"}
                                fechasDesde="15/05/2025"
                                fechasHasta="18/05/2025"
                                origen="ARG"
                                precioSinImpuestos={
                                  selectedProduct?.price
                                    ? (selectedProduct.price * 0.83).toFixed(2)
                                    : "829"
                                }
                                financiacion={selectedFinancing}
                                productos={
                                  modelo.componentPath.toLowerCase().includes("multiproductos")
                                    ? selectedProducts.length > 0 ? selectedProducts : []
                                    : selectedProduct
                                    ? [selectedProduct]
                                    : []
                                }
                                titulo="Ofertas Especiales"
                              />
                            ) : (
                              <div>Error al cargar el componente</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Si no hay ninguno seleccionado, mostrar grid de opciones para seleccionar
                  if (!isAnySelected) {
                    return (
                      <div
                        key={modelo.id}
                        className="cursor-pointer border rounded-lg hover:border-indigo-400 hover:shadow-md transition-all duration-300
                                  bg-white hover:bg-gray-50 relative overflow-hidden"
                        onClick={() => setModeloSeleccionado(modelo.id)}
                        title={`Modelo ${modelo.id} - Click para seleccionar`}
                      >
                        {/* Contenedor de la plantilla con tamaño fijo */}
                        <div className="w-full h-[250px] flex items-center justify-center p-3 overflow-hidden">
                          {Component && typeof Component === "function" ? (
                            <div className="max-w-full max-h-full scale-75 transform">
                              <Component
                                small={true}
                                nombre={selectedProduct?.name || "Producto de ejemplo"}
                                precioActual={selectedProduct?.price?.toString() || "999"}
                                porcentaje="20"
                                sap={selectedProduct?.sku || "SKU123"}
                                fechasDesde="15/05/2025"
                                fechasHasta="18/05/2025"
                                origen="ARG"
                                precioSinImpuestos={
                                  selectedProduct?.price
                                    ? (selectedProduct.price * 0.83).toFixed(2)
                                    : "829"
                                }
                                financiacion={selectedFinancing}
                                productos={
                                  modelo.componentPath.toLowerCase().includes("multiproductos")
                                    ? selectedProducts.length > 0 ? selectedProducts : []
                                    : selectedProduct
                                    ? [selectedProduct]
                                    : []
                                }
                                titulo="Ofertas Especiales"
                              />
                            </div>
                          ) : (
                            <div className="text-red-500 text-sm text-center">Error al cargar componente</div>
                          )}
                        </div>
                        
                        {/* Etiqueta del modelo */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs text-center py-2 px-2">
                          Modelo {modelo.id.split('-')[1] || modelo.id}
                        </div>
                      </div>
                    );
                  }

                  // Ocultar los no seleccionados cuando hay uno seleccionado
                  return null;
                })}
          </div>
        </div>
      </div>
    </div>
  );
}; 