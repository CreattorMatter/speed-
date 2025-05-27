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
  onRemoveAllProducts?: () => void;
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
  onRemoveProduct,
  onRemoveAllProducts
}) => {
  // Estado para el producto expandido individualmente
  const [expandedProductIndex, setExpandedProductIndex] = React.useState<number | null>(null);

  // Determinar si estamos en modo multiproductos
  const isMultiProductMode = selectedProducts.length > 1;
  
  // Función para obtener el nombre del tipo de promoción basado en el ID del modelo
  const getPromoTypeFromModelId = (modelId: string): string => {
    const ladrillazoPromoTypes: Record<string, string> = {
      "ladrillazos-1": "PRECIO LLENO",
      "ladrillazos-2": "FLOORING", 
      "ladrillazos-3": "COMBO",
      "ladrillazos-4": "DESCUENTO PLANO",
      "ladrillazos-5": "ANTES/AHORA",
      "ladrillazos-6": "ANTES/AHORA FLOORING",
      "ladrillazos-7": "FLOORING CUOTAS",
      "ladrillazos-8": "CUOTAS",
      "ladrillazos-9": "ANTES/AHORA FLOORING",
      "ladrillazos-10": "FLOORING CUOTAS",
      "ladrillazos-11": "COMBO",
      "ladrillazos-12": "PROMO 3X2",
      "ladrillazos-13": "3X2 PLANO",
      "ladrillazos-14": "3X2 COMBINABLE", 
      "ladrillazos-15": "DESCUENTO PLANO",
      "ladrillazos-16": "2DA UNIDAD",
      "ladrillazos-17": "CUOTAS",
      "ladrillazos-18": "ANTES/AHORA CUOTAS"
    };
    
    return ladrillazoPromoTypes[modelId] || `Modelo ${modelId.split('-')[1] || modelId}`;
  };

  // Obtener y filtrar los modelos disponibles para la plantilla seleccionada
  const getFilteredModelos = () => {
    if (!plantillaSeleccionada?.value) return [];
    
    const modelos = PLANTILLA_MODELOS[plantillaSeleccionada.value] || [];
    
    // Para Ladrillazos, filtrar según la plantilla específica
    if (plantillaSeleccionada.value === 'Ladrillazos') {
      // Si no hay plantilla seleccionada, mostrar todas las 18
      if (!comboSeleccionado) return modelos;
      
      // Mapeo específico de plantillas a plantillas de Ladrillazos
      const ladrillazosMappings: Record<string, string[]> = {
        "precio_lleno": ["ladrillazos-1"], // PRECIO LLENO
        "flooring": ["ladrillazos-2"], // FLOORING
        "combo_dto": ["ladrillazos-3", "ladrillazos-11"], // COMBO
        "descuento_plano_categoria": ["ladrillazos-4", "ladrillazos-15"], // DESCUENTO PLANO CATEGORIA
        "antes_ahora_dto": ["ladrillazos-5"], // ANTES/AHORA CON DTO
        "antes_ahora_flooring_dto": ["ladrillazos-6", "ladrillazos-9"], // ANTES/AHORA FLOORING
        "flooring_cuotas": ["ladrillazos-7", "ladrillazos-10"], // FLOORING EN CUOTAS
        "cuotas": ["ladrillazos-8", "ladrillazos-17"], // CUOTAS
        "promo_3x2_precio": ["ladrillazos-12"], // PROMO 3X2 CON PRECIO
        "promo_3x2_plano_categoria": ["ladrillazos-13"], // PROMO 3X2 PLANO CATEGORIA
        "promo_3x2_plano_categoria_combinable": ["ladrillazos-14"], // PROMO 3X2 COMBINABLE
        "descuento_2da_unidad": ["ladrillazos-16"], // DESCUENTO EN LA 2DA UNIDAD
        "antes_ahora_cuotas_dto": ["ladrillazos-18"], // ANTES/AHORA EN CUOTAS CON DTO
      };
      
      const allowedIds = ladrillazosMappings[comboSeleccionado.value] || [];
      
      // Si no hay mapeo específico, mostrar todas
      if (allowedIds.length === 0) return modelos;
      
      // Filtrar solo las plantillas correspondientes al tipo de promoción
      return modelos.filter(modelo => allowedIds.includes(modelo.id));
    }
    
    // Si no hay plantilla seleccionada para otras plantillas, mostrar todas
    if (!comboSeleccionado) return modelos;
    
    // Aplicar filtros según la plantilla y plantilla para otras familias
    return modelos;
  };

  const filteredModelos = getFilteredModelos();
  
  return (
    <div className="col-span-7 h-full flex flex-col">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-1 overflow-hidden max-h-[800px] w-full">
        
        {/* Contenedor principal */}
        <div className="w-full h-full overflow-y-auto">
          
          {/* Mostrar mensaje cuando no hay plantilla seleccionada */}
          {!plantillaSeleccionada && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <div className="w-16 h-16 mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Selecciona una familia</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                Elige una familia de plantillas para ver los modelos disponibles
              </p>
            </div>
          )}

          {/* Mostrar mensaje cuando hay plantilla pero no hay modelos después del filtro */}
          {plantillaSeleccionada && filteredModelos.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <div className="w-16 h-16 mb-4 bg-orange-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No hay modelos disponibles</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                No se encontraron plantillas para la combinación seleccionada. Prueba cambiando la plantilla.
              </p>
            </div>
          )}

          {/* Renderizado para producto único o selección de modelo */}
          {!isMultiProductMode && filteredModelos.length > 0 && (
            <>
              {/* Si hay un modelo seleccionado, mostrar solo ese */}
              {modeloSeleccionado ? (
                (() => {
                  const modelo = filteredModelos.find((m: TemplateModel) => m.id === modeloSeleccionado);
                  const Component = modelo ? templateComponents[modelo.componentPath] : null;

                  return (
                    <div className="w-full h-full flex flex-col">
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
                            {getPromoTypeFromModelId(modelo?.id || '')} seleccionado
                          </div>
                        </div>
                        
                        {/* Información adicional */}
                        <div className="text-xs text-gray-500">
                          {filteredModelos.length} modelo{filteredModelos.length !== 1 ? 's' : ''} disponible{filteredModelos.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Contenedor de la plantilla seleccionada */}
                      <div className="flex-1 flex items-center justify-center p-4">
                        <div className="w-full h-full flex items-center justify-center max-w-[900px] max-h-[800px]">
                          {Component && typeof Component === "function" ? (
                            <Component
                              small={false}
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
                                modelo?.componentPath.toLowerCase().includes("multiproductos")
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
                })()
              ) : (
                /* Grid 3x3 para mostrar todas las plantillas con scroll */
                <div className="grid grid-cols-3 gap-6 p-6">
                  {filteredModelos.map((modelo: TemplateModel) => {
                    const Component = templateComponents[modelo.componentPath];

                    return (
                      <div
                        key={modelo.id}
                        className="cursor-pointer border rounded-lg hover:border-indigo-400 hover:shadow-md transition-all duration-300
                                  bg-white hover:bg-gray-50 relative overflow-hidden"
                        onClick={() => setModeloSeleccionado(modelo.id)}
                        title={`${getPromoTypeFromModelId(modelo.id)} - Click para seleccionar`}
                      >
                        {/* Contenedor de la plantilla */}
                        <div className="w-full h-[280px] flex items-center justify-center p-3 overflow-hidden">
                          {Component && typeof Component === "function" ? (
                            <div className="max-w-full max-h-full transform scale-[0.55]">
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
                          {getPromoTypeFromModelId(modelo.id)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Renderizado de múltiples productos */}
          {isMultiProductMode && filteredModelos.length > 0 && expandedProductIndex === null && (
            <>
              {/* Header con controles para múltiples productos */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b mb-4">
                <div className="text-lg font-medium text-gray-800">
                  {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} seleccionado{selectedProducts.length !== 1 ? 's' : ''}
                </div>
                
                {/* Botón eliminar todos */}
                {onRemoveAllProducts && selectedProducts.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de que deseas eliminar todos los ${selectedProducts.length} productos seleccionados?`)) {
                        onRemoveAllProducts();
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                    title="Eliminar todos los productos seleccionados"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Eliminar todos</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                {selectedProducts.map((product: Product, productIndex: number) => {
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
                      className="border rounded-lg p-3 hover:border-indigo-400 hover:shadow-md transition-all duration-300 relative bg-white cursor-pointer"
                      onClick={() => setExpandedProductIndex(productIndex)}
                      title={`Click para ver ${product.name} en grande`}
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
                      
                      {/* Indicador de que se puede expandir */}
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-80">
                        Click para ampliar
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Vista expandida de producto individual */}
          {isMultiProductMode && expandedProductIndex !== null && filteredModelos.length > 0 && (
            (() => {
              const product = selectedProducts[expandedProductIndex];
              const modelo = modeloSeleccionado 
                ? filteredModelos.find((m: TemplateModel) => m.id === modeloSeleccionado)
                : filteredModelos[0];

              if (!modelo || !product) {
                return (
                  <div className="flex items-center justify-center h-[500px]">
                    <div className="text-red-500 text-center">
                      <p>Error: No se pudo cargar el producto o plantilla</p>
                      <button 
                        onClick={() => setExpandedProductIndex(null)}
                        className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                );
              }

              const Component = templateComponents[modelo.componentPath];

              return (
                <div className="w-full h-full flex flex-col">
                  {/* Header con información del producto expandido */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                    <button
                      onClick={() => setExpandedProductIndex(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Volver al preview
                    </button>
                    
                    <div className="text-center flex-1">
                      <div className="text-lg font-bold text-gray-800">
                        Producto {expandedProductIndex + 1} de {selectedProducts.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getPromoTypeFromModelId(modelo.id)} - {product.name}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        SKU: {product.sku} | ${product.price}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Navegación entre productos */}
                      <button
                        onClick={() => setExpandedProductIndex(Math.max(0, expandedProductIndex - 1))}
                        disabled={expandedProductIndex === 0}
                        className={`p-2 rounded ${
                          expandedProductIndex === 0 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title="Producto anterior"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => setExpandedProductIndex(Math.min(selectedProducts.length - 1, expandedProductIndex + 1))}
                        disabled={expandedProductIndex === selectedProducts.length - 1}
                        className={`p-2 rounded ${
                          expandedProductIndex === selectedProducts.length - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title="Producto siguiente"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Contenedor de la plantilla expandida */}
                  <div className="flex-1 flex items-center justify-center p-4 bg-white">
                    <div className="flex-1 flex items-center justify-center max-w-[900px] max-h-[800px]">
                      {Component && typeof Component === "function" ? (
                        <Component
                          small={false}
                          nombre={product.name}
                          precioActual={product.price?.toString() || "999"}
                          porcentaje="20"
                          sap={product.sku || "SKU123"}
                          fechasDesde="15/05/2025"
                          fechasHasta="18/05/2025"
                          origen="ARG"
                          precioSinImpuestos={
                            product.price ? (product.price * 0.83).toFixed(2) : "829"
                          }
                          financiacion={selectedFinancing}
                          productos={[product]}
                          titulo="Ofertas Especiales"
                        />
                      ) : (
                        <div>Error al cargar el componente</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}; 