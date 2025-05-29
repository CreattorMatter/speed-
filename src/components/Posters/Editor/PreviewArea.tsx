import React from 'react';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';

// Importar selectores y acciones de Redux
import {
  selectPlantillaSeleccionada,
  selectComboSeleccionado,
  selectModeloSeleccionado,
  selectSingleSelectedProduct,
  selectSelectedProductObjects,
  selectSelectedFinancing,
  selectFormatoSeleccionado,
  selectProductChanges,
  setModeloSeleccionado,
  removeProduct,
  removeAllProducts,
  trackProductChange
} from '../../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../../store';

import { type Product } from '../../../data/products';
import { type TemplateModel } from '../../../constants/posters/templates';
import { type ProductChange } from '../../../store/features/poster/posterSlice';
import { EditableField } from './EditableField';
import { DeleteProductModal } from './DeleteProductModal';
import { PrintButtonAdvanced } from './PrintButtonAdvanced';
import { 
  getTemplateFields, 
  getAvailableFields, 
  getFieldLabel, 
  getFieldType 
} from '../../../utils/templateFieldDetector';
import { products } from '../../../data/products';

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

interface PaperFormatOption {
  label: string;
  value: string;
  width: string;
  height: string;
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
  PLANTILLA_MODELOS: Record<string, TemplateModel[]>;
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => void;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
  templateComponents,
  PLANTILLA_MODELOS,
  onUpdateProduct
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Obtener estado de Redux
  const plantillaSeleccionada = useSelector(selectPlantillaSeleccionada);
  const comboSeleccionado = useSelector(selectComboSeleccionado);
  const modeloSeleccionado = useSelector(selectModeloSeleccionado);
  const selectedProduct = useSelector(selectSingleSelectedProduct);
  const selectedProducts = useSelector(selectSelectedProductObjects);
  const selectedFinancing = useSelector(selectSelectedFinancing);
  const formatoSeleccionado = useSelector(selectFormatoSeleccionado);

  // Obtener cambios de productos desde Redux
  const productChanges = useSelector(selectProductChanges);
  
  // Función helper para obtener producto editado
  const getEditedProduct = (productId: string) => {
    return productChanges[productId] || null;
  };

  // Obtener configuración de campos para la plantilla actual
  const templateFields = getTemplateFields(
    plantillaSeleccionada?.value || '',
    comboSeleccionado?.value
  );
  const availableFields = getAvailableFields(templateFields);

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
    if (!plantillaSeleccionada?.value) {
      return [];
    }
    
    const modelos = PLANTILLA_MODELOS[plantillaSeleccionada.value] || [];
    
    // Para Ladrillazos, filtrar según la plantilla específica
    if (plantillaSeleccionada.value === 'Ladrillazos') {
      // Si no hay plantilla seleccionada, mostrar todas las 18
      if (!comboSeleccionado) {
        return modelos;
      }
      
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
      if (allowedIds.length === 0) {
        return modelos;
      }
      
      // Filtrar solo las plantillas correspondientes al tipo de promoción
      const filtered = modelos.filter(modelo => allowedIds.includes(modelo.id));
      return filtered;
    }
    
    // Si no hay plantilla seleccionada para otras plantillas, mostrar todas
    if (!comboSeleccionado) {
      return modelos;
    }
    
    // Aplicar filtros según la plantilla y plantilla para otras familias
    return modelos;
  };

  const filteredModelos = getFilteredModelos();
  
  // Funciones para manejar edición y eliminación
  const handleProductEdit = (productId: string, field: string, newValue: string | number) => {
    const product = selectedProducts.find(p => p.id === productId);
    if (!product) return;

    const originalValue = getCurrentProductValue(product, field);
    
    // Trackear el cambio usando Redux
    dispatch(trackProductChange({
      productId,
      productName: product.name,
      field,
      originalValue: originalValue as string | number,
      newValue
    }));
    
    // Actualizar el producto si la función está disponible
    if (onUpdateProduct) {
      onUpdateProduct(productId, { [field]: newValue });
    }
    
    // Forzar re-render para actualizar la vista previa
    setRefreshKeyState(prev => prev + 1);
  };

  // Handlers que despachan acciones de Redux
  const handleRemoveProduct = (productId: string) => {
    dispatch(removeProduct(productId));
  };

  const handleRemoveAllProducts = () => {
    dispatch(removeAllProducts());
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      handleRemoveProduct(productToDelete.id);
      
      // Si era el último producto, también limpiar el producto único
      if (selectedProducts.length === 1) {
        // El selectedProduct se limpiará automáticamente en el reducer
      }
      
      // Si estamos expandiendo este producto, colapsar
      const productIndex = selectedProducts.findIndex(p => p.id === productToDelete.id);
      if (expandedProductIndex === productIndex) {
        setExpandedProductIndex(null);
      }
      
      // Ajustar el índice expandido si es necesario
      if (expandedProductIndex !== null && productIndex < expandedProductIndex) {
        setExpandedProductIndex(expandedProductIndex - 1);
      }
    }
    
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const getCurrentProductValue = (product: Product, field: string): any => {
    const editedProduct = getEditedProduct(product.id);
    
    // Primero verificar si hay un valor editado
    if (editedProduct && editedProduct.changes.length > 0) {
      const change = editedProduct.changes.find(c => c.field === field);
      if (change) {
        return change.newValue;
      }
    }
    
    // Mapeo directo de campos del producto
    const productFieldMapping: Record<string, keyof Product> = {
      nombre: 'name',
      precioActual: 'price',
      sap: 'sku'
    };
    
    const productField = productFieldMapping[field];
    if (productField && product[productField] !== undefined) {
      return product[productField];
    }
    
    // Valores por defecto para campos que no están en Product
    const defaultValues: Record<string, any> = {
      porcentaje: 20,
      fechasDesde: '15/05/2025',
      fechasHasta: '18/05/2025',
      origen: 'ARG',
      precioSinImpuestos: product.price ? (product.price * 0.83).toFixed(2) : '0'
    };
    
    return defaultValues[field] || '';
  };

  // Función para generar props dinámicos para el componente de plantilla
  const generateTemplateProps = (product: Product) => {
    const baseProps = {
      small: false,
      financiacion: selectedFinancing,
      productos: [product],
      titulo: "Ofertas Especiales"
    };

    // Generar props dinámicos basados en los valores actuales del producto
    const templateProps: Record<string, any> = {
      // Mapeo directo de campos
      nombre: getCurrentProductValue(product, 'nombre'),
      precioActual: getCurrentProductValue(product, 'precioActual')?.toString(),
      porcentaje: getCurrentProductValue(product, 'porcentaje')?.toString(),
      sap: getCurrentProductValue(product, 'sap')?.toString(),
      fechasDesde: getCurrentProductValue(product, 'fechasDesde')?.toString(),
      fechasHasta: getCurrentProductValue(product, 'fechasHasta')?.toString(),
      origen: getCurrentProductValue(product, 'origen')?.toString(),
      precioSinImpuestos: getCurrentProductValue(product, 'precioSinImpuestos')?.toString()
    };

    return { 
      ...baseProps, 
      ...templateProps 
    };
  };

  // Estado para el producto expandido individualmente
  const [expandedProductIndex, setExpandedProductIndex] = React.useState<number | null>(null);
  
  // Estado para controlar la visibilidad del panel de edición
  const [isEditPanelVisible, setIsEditPanelVisible] = React.useState(true);
  
  // Estado para el modal de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  
  // Estado para forzar re-renders cuando hay cambios
  const [refreshKeyState, setRefreshKeyState] = React.useState(0);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 border border-gray-200 flex flex-1 overflow-hidden max-h-full lg:max-h-[800px] w-full">
        
        {/* Contenedor principal */}
        <div className="w-full h-full overflow-y-auto scrollbar-hide">
          
          {/* Mostrar mensaje cuando no hay plantilla seleccionada */}
          {!plantillaSeleccionada && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4">
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 mb-3 xs:mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-base xs:text-lg font-medium text-gray-700 mb-1 xs:mb-2">Selecciona una familia</h3>
              <p className="text-xs xs:text-sm text-gray-500 text-center max-w-xs xs:max-w-sm sm:max-w-md">
                Elige una familia de plantillas para ver los modelos disponibles
              </p>
            </div>
          )}

          {/* Mostrar mensaje cuando hay plantilla pero no hay modelos después del filtro */}
          {plantillaSeleccionada && filteredModelos.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4">
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 mb-3 xs:mb-4 bg-orange-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-base xs:text-lg font-medium text-gray-700 mb-1 xs:mb-2">No hay modelos disponibles</h3>
              <p className="text-xs xs:text-sm text-gray-500 text-center max-w-xs xs:max-w-sm sm:max-w-md">
                No se encontraron plantillas para la combinación seleccionada. Prueba cambiando la plantilla.
              </p>
            </div>
          )}

          {/* Renderizado cuando no hay productos seleccionados - mostrar plantillas con datos de ejemplo */}
          {selectedProducts.length === 0 && filteredModelos.length > 0 && (
            <>
              {/* Si hay un modelo seleccionado, mostrar solo ese */}
              {modeloSeleccionado ? (
                (() => {
                  const modelo = filteredModelos.find((m: TemplateModel) => m.id === modeloSeleccionado);
                  const Component = modelo ? templateComponents[modelo.componentPath] : null;

                  // Datos de ejemplo para mostrar la plantilla
                  const exampleProduct: Product = {
                    id: 'example-product',
                    name: 'Producto de Ejemplo',
                    price: 99999,
                    sku: 'EJ001',
                    category: 'Ejemplo',
                    description: 'Producto de ejemplo para vista previa',
                    imageUrl: '/images/placeholder-product.jpg'
                  };

                  return (
                    <div className="w-full h-full flex flex-col">
                      {/* Botón para volver atrás */}
                      <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => dispatch(setModeloSeleccionado(null))}
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

                      {/* Mensaje informativo */}
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Vista previa:</span> Selecciona productos para personalizar la plantilla
                        </p>
                      </div>

                      {/* Preview de la plantilla con datos de ejemplo */}
                      <div className="flex-1 flex items-center justify-center p-4">
                        <div className="w-full h-full flex items-center justify-center max-w-[900px] max-h-[800px] print-content" data-preview-content>
                          {Component && typeof Component === "function" ? (
                            <Component 
                              key={`example-product-${refreshKeyState}`}
                              {...generateTemplateProps(exampleProduct)} 
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
                /* Grid responsivo para mostrar todas las plantillas con scroll */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 p-3 xs:p-4 sm:p-6">
                  {/* Mensaje informativo */}
                  <div className="col-span-full mb-3 xs:mb-4 p-2 xs:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs xs:text-sm text-blue-700 text-center">
                      <span className="font-medium">Vista previa de plantillas:</span> Haz click en cualquier plantilla para verla en detalle
                    </p>
                  </div>
                  
                  {filteredModelos.map((modelo: TemplateModel) => {
                    const Component = templateComponents[modelo.componentPath];

                    // Datos de ejemplo para mostrar la plantilla
                    const exampleProduct: Product = {
                      id: 'example-product',
                      name: 'Producto de Ejemplo',
                      price: 99999,
                      sku: 'EJ001',
                      category: 'Ejemplo',
                      description: 'Producto de ejemplo para vista previa',
                      imageUrl: '/images/placeholder-product.jpg'
                    };

                    return (
                      <div
                        key={modelo.id}
                        className="cursor-pointer border rounded-lg hover:border-indigo-400 hover:shadow-md transition-all duration-300
                                  bg-white hover:bg-gray-50 relative overflow-hidden"
                        onClick={() => dispatch(setModeloSeleccionado(modelo.id))}
                        title={`${getPromoTypeFromModelId(modelo.id)} - Click para seleccionar`}
                      >
                        {/* Contenedor de la plantilla */}
                        <div className="w-full h-[200px] xs:h-[240px] sm:h-[280px] flex items-center justify-center p-2 xs:p-3 overflow-hidden">
                          {Component && typeof Component === "function" ? (
                            <div className="max-w-full max-h-full transform scale-[0.45] xs:scale-[0.5] sm:scale-[0.55]">
                              <Component 
                                key={`example-${modelo.id}-${refreshKeyState}`}
                                {...generateTemplateProps(exampleProduct)} 
                              />
                            </div>
                          ) : (
                            <div className="text-red-500 text-xs xs:text-sm text-center">
                              Error al cargar componente: {modelo.componentPath}
                              <br />
                              <small>Component: {Component ? 'exists' : 'missing'}</small>
                            </div>
                          )}
                        </div>
                        
                        {/* Etiqueta del modelo */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xxs xs:text-xs text-center py-1.5 xs:py-2 px-2">
                          {getPromoTypeFromModelId(modelo.id)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Renderizado para producto único o selección de modelo */}
          {selectedProducts.length === 1 && filteredModelos.length > 0 && (
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
                            onClick={() => dispatch(setModeloSeleccionado(null))}
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
                        
                        <div className="flex items-center gap-2">
                          {/* Botón para ocultar/mostrar panel de edición */}
                          <button
                            onClick={() => setIsEditPanelVisible(!isEditPanelVisible)}
                            className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title={isEditPanelVisible ? "Ocultar panel de edición" : "Mostrar panel de edición"}
                          >
                            {isEditPanelVisible ? (
                              <>
                                <EyeOff className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">Ocultar panel</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">Mostrar panel</span>
                              </>
                            )}
                          </button>
                          
                          {/* Información adicional */}
                          <div className="text-xs text-gray-500">
                            {filteredModelos.length} modelo{filteredModelos.length !== 1 ? 's' : ''} disponible{filteredModelos.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Contenedor de la plantilla seleccionada */}
                      <div className="flex-1 flex flex-col lg:flex-row bg-white">
                        {/* Panel de edición lateral para producto único - responsivo y condicional */}
                        {selectedProduct && isEditPanelVisible && (
                          <div className="w-full lg:w-80 bg-gray-50 border-b lg:border-b-0 lg:border-r p-3 xs:p-4 overflow-y-auto order-2 lg:order-1">
                            <h3 className="text-base xs:text-lg font-semibold text-gray-800 mb-3 xs:mb-4 flex items-center gap-2">
                              <svg className="w-4 h-4 xs:w-5 xs:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="truncate">Editar Producto</span>
                            </h3>
                            
                            <div className="space-y-3 xs:space-y-4">
                              {/* Renderizar solo campos disponibles para esta plantilla */}
                              {availableFields.map(field => {
                                const fieldType = getFieldType(field);
                                const fieldLabel = getFieldLabel(field);
                                const isRequired = field === 'nombre';
                                
                                return (
                                  <div key={field}>
                                    <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
                                      {fieldLabel} {isRequired && <span className="text-red-500">*</span>}
                                    </label>
                                    <EditableField
                                      value={getCurrentProductValue(selectedProduct, field)}
                                      fieldName={field}
                                      fieldType={fieldType}
                                      isRequired={isRequired}
                                      onSave={(newValue) => handleProductEdit(selectedProduct.id, field, newValue)}
                                      className="w-full"
                                    />
                                  </div>
                                );
                              })}
                            </div>

                            {/* Información de cambios */}
                            {(() => {
                              const editedProduct = getEditedProduct(selectedProduct.id);
                              return editedProduct && editedProduct.changes.length > 0 && (
                                <div className="mt-4 xs:mt-6 p-2 xs:p-3 bg-blue-50 border border-blue-200 rounded">
                                  <h4 className="text-xs xs:text-sm font-medium text-blue-800 mb-1.5 xs:mb-2">
                                    Cambios realizados ({editedProduct.changes.length})
                                  </h4>
                                  <div className="space-y-1">
                                    {editedProduct.changes.map((change: ProductChange, index: number) => (
                                      <div key={index} className="text-xxs xs:text-xs text-blue-700">
                                        <span className="font-medium">{change.field}:</span> {change.originalValue} → {change.newValue}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Preview de la plantilla con responsividad mejorada */}
                        <div className={`flex-1 flex items-center justify-center bg-gray-50 p-3 xs:p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] overflow-auto ${
                          isEditPanelVisible ? 'order-1 lg:order-2' : 'order-1'
                        }`}>
                          <div className="w-full h-full flex items-center justify-center max-w-full lg:max-w-[900px] max-h-[400px] sm:max-h-[600px] lg:max-h-[800px] print-content overflow-visible" data-preview-content>
                            {Component && typeof Component === "function" ? (
                              <Component 
                                key={`${selectedProduct?.id || 'no-product'}-${refreshKeyState}`}
                                {...generateTemplateProps(selectedProduct || {} as Product)} 
                              />
                            ) : (
                              <div>Error al cargar el componente</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* Grid responsivo para mostrar todas las plantillas con scroll */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 p-3 xs:p-4 sm:p-6">
                  {/* Mensaje informativo */}
                  <div className="col-span-full mb-3 xs:mb-4 p-2 xs:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs xs:text-sm text-blue-700 text-center">
                      <span className="font-medium">Vista previa de plantillas:</span> Haz click en cualquier plantilla para verla en detalle
                    </p>
                  </div>
                  
                  {filteredModelos.map((modelo: TemplateModel) => {
                    const Component = templateComponents[modelo.componentPath];

                    // Datos de ejemplo para mostrar la plantilla
                    const exampleProduct: Product = {
                      id: 'example-product',
                      name: 'Producto de Ejemplo',
                      price: 99999,
                      sku: 'EJ001',
                      category: 'Ejemplo',
                      description: 'Producto de ejemplo para vista previa',
                      imageUrl: '/images/placeholder-product.jpg'
                    };

                    return (
                      <div
                        key={modelo.id}
                        className="cursor-pointer border rounded-lg hover:border-indigo-400 hover:shadow-md transition-all duration-300
                                  bg-white hover:bg-gray-50 relative overflow-hidden"
                        onClick={() => dispatch(setModeloSeleccionado(modelo.id))}
                        title={`${getPromoTypeFromModelId(modelo.id)} - Click para seleccionar`}
                      >
                        {/* Contenedor de la plantilla */}
                        <div className="w-full h-[200px] xs:h-[240px] sm:h-[280px] flex items-center justify-center p-2 xs:p-3 overflow-hidden">
                          {Component && typeof Component === "function" ? (
                            <div className="max-w-full max-h-full transform scale-[0.45] xs:scale-[0.5] sm:scale-[0.55]">
                              <Component 
                                key={`example-${modelo.id}-${refreshKeyState}`}
                                {...generateTemplateProps(exampleProduct)} 
                              />
                            </div>
                          ) : (
                            <div className="text-red-500 text-xs xs:text-sm text-center">
                              Error al cargar componente: {modelo.componentPath}
                              <br />
                              <small>Component: {Component ? 'exists' : 'missing'}</small>
                            </div>
                          )}
                        </div>
                        
                        {/* Etiqueta del modelo */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xxs xs:text-xs text-center py-1.5 xs:py-2 px-2">
                          {getPromoTypeFromModelId(modelo.id)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Renderizado de múltiples productos con diseño mejorado tipo cartel */}
          {selectedProducts.length >= 2 && filteredModelos.length > 0 && expandedProductIndex === null && (
            <>
              {/* Header mejorado con controles para múltiples productos */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b mb-4 rounded-t-lg">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {selectedProducts.length}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Carteles Generados
                    </h2>
                    <p className="text-sm text-gray-600">
                      {getPromoTypeFromModelId(modeloSeleccionado || filteredModelos[0]?.id || '')}
                    </p>
                  </div>
                </div>
                
                {/* Información del modelo y controles */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Modelo actual</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {modeloSeleccionado ? getPromoTypeFromModelId(modeloSeleccionado) : 'Sin modelo específico'}
                    </p>
                  </div>
                  
                  {/* Botón eliminar todos mejorado */}
                  {handleRemoveAllProducts && selectedProducts.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Estás seguro de que deseas eliminar todos los ${selectedProducts.length} carteles generados?`)) {
                          handleRemoveAllProducts();
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                      title="Eliminar todos los carteles generados"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Eliminar todos</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Grid de carteles con diseño mejorado tipo cartel real */}
              <div className="px-4 sm:px-6 pb-6 print-content" data-preview-content>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                  {selectedProducts.map((product: Product, productIndex: number) => {
                    // Para multiproductos, usar el modelo seleccionado o el primero disponible
                    const modelo = modeloSeleccionado 
                      ? filteredModelos.find((m: TemplateModel) => m.id === modeloSeleccionado)
                      : filteredModelos[0];

                    if (!modelo) {
                      return (
                        <div key={`no-template-${productIndex}`} className="p-6 border-2 border-red-200 rounded-xl bg-red-50">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {productIndex + 1}
                            </div>
                            <p className="font-medium text-red-800">Error en cartel</p>
                          </div>
                          <p className="text-red-600 text-sm">
                            No hay plantilla disponible para: <span className="font-medium">{product.name}</span>
                          </p>
                        </div>
                      );
                    }

                    const Component = templateComponents[modelo.componentPath];

                    return (
                      <div
                        key={`${product.id}-${productIndex}`}
                        className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-300"
                        onClick={() => setExpandedProductIndex(productIndex)}
                        title={`Click para editar el cartel de ${product.name}`}
                      >
                        {/* Header del cartel individual */}
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-3 z-20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                                {productIndex + 1}
                              </div>
                              <span className="text-sm font-medium truncate">Cartel #{productIndex + 1}</span>
                            </div>
                            
                            {/* Botón de eliminar cartel individual */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProduct(product.id);
                              }}
                              className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-full flex items-center justify-center transition-colors shadow-md opacity-0 group-hover:opacity-100"
                              title={`Eliminar cartel de ${product.name}`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Contenedor del cartel con aspecto profesional */}
                        <div className="relative mt-12 p-4 bg-gray-50" data-cartel-content>
                          {/* Marco del cartel */}
                          <div className="relative bg-white rounded-lg shadow-inner border-2 border-gray-200 overflow-hidden">
                            {/* Área del cartel con tamaño fijo proporcional */}
                            <div className="w-full h-64 sm:h-72 lg:h-80 flex items-center justify-center bg-white">
                              {Component && typeof Component === "function" ? (
                                <div className="max-w-full max-h-full scale-75 sm:scale-80 lg:scale-85 transform">
                                  <Component 
                                    key={`${product.id}-${refreshKeyState}`}
                                    {...generateTemplateProps(product)} 
                                  />
                                </div>
                              ) : (
                                <div className="text-red-500 text-center p-4">
                                  <svg className="w-12 h-12 mx-auto mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  <p className="text-sm font-medium">Error al cargar</p>
                                  <p className="text-xs text-gray-500">{product.name}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Footer con información del producto */}
                        <div className="p-4 bg-white border-t border-gray-100">
                          <div className="text-center space-y-2">
                            <h3 className="font-bold text-gray-900 text-sm truncate" title={product.name}>
                              {product.name}
                            </h3>
                            <div className="flex justify-between items-center text-xs text-gray-600">
                              <span>SKU: {product.sku || 'N/A'}</span>
                              <span className="font-bold text-green-600">${product.price?.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.category}
                            </div>
                          </div>
                        </div>
                        
                        {/* Indicador de expansión */}
                        <div className="absolute bottom-3 right-3 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-90 transition-opacity">
                          Editar →
                        </div>
                        
                        {/* Overlay de hover */}
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    );
                  })}
                </div>
                
                {/* Información adicional del lote */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-medium text-blue-900">Información del lote</h4>
                      <p className="text-sm text-blue-700">
                        {selectedProducts.length} carteles generados • Modelo: {getPromoTypeFromModelId(modeloSeleccionado || filteredModelos[0]?.id || '')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">Listos para imprimir</p>
                      <p className="text-xs text-blue-500">Click en cualquier cartel para editarlo</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Vista expandida de producto individual */}
          {selectedProducts.length >= 2 && expandedProductIndex !== null && filteredModelos.length > 0 && (
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
                      {/* Botón para ocultar/mostrar panel de edición */}
                      <button
                        onClick={() => setIsEditPanelVisible(!isEditPanelVisible)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        title={isEditPanelVisible ? "Ocultar panel de edición" : "Mostrar panel de edición"}
                      >
                        {isEditPanelVisible ? (
                          <>
                            <EyeOff className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">Mostrar</span>
                          </>
                        )}
                      </button>
                      
                      {/* Botón eliminar */}
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-md"
                        title="Eliminar producto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      
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

                  {/* Contenedor principal con panel de edición y preview */}
                  <div className="flex-1 flex bg-white">
                    {/* Panel de edición lateral - condicional */}
                    {isEditPanelVisible && (
                      <div className="w-80 bg-gray-50 border-r p-4 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar Producto
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Renderizar solo campos disponibles para esta plantilla */}
                          {availableFields.map(field => {
                            const fieldType = getFieldType(field);
                            const fieldLabel = getFieldLabel(field);
                            const isRequired = field === 'nombre';
                            
                            return (
                              <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {fieldLabel} {isRequired && <span className="text-red-500">*</span>}
                                </label>
                                <EditableField
                                  value={getCurrentProductValue(product, field)}
                                  fieldName={field}
                                  fieldType={fieldType}
                                  isRequired={isRequired}
                                  onSave={(newValue) => handleProductEdit(product.id, field, newValue)}
                                  className="w-full"
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* Información de cambios */}
                        {(() => {
                          const editedProduct = getEditedProduct(product.id);
                          return editedProduct && editedProduct.changes.length > 0 && (
                            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
                              <h4 className="text-sm font-medium text-blue-800 mb-2">
                                Cambios realizados ({editedProduct.changes.length})
                              </h4>
                              <div className="space-y-1">
                                {editedProduct.changes.map((change: ProductChange, index: number) => (
                                  <div key={index} className="text-xs text-blue-700">
                                    <span className="font-medium">{change.field}:</span> {change.originalValue} → {change.newValue}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Preview de la plantilla */}
                    <div className="flex-1 flex items-center justify-center p-6">
                      <div className="w-full h-full flex items-center justify-center max-w-[900px] max-h-[800px] print-content" data-preview-content>
                        {Component && typeof Component === "function" ? (
                          <Component 
                            key={`${selectedProduct?.id || 'no-product'}-${refreshKeyState}`}
                            {...generateTemplateProps(product)} 
                          />
                        ) : (
                          <div>Error al cargar el componente</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
      
      {/* PrintButton integrado - ahora trabaja directamente con productos seleccionados */}
      <PrintButtonAdvanced 
        key={`print-button-${refreshKeyState}`}
        templateComponents={templateComponents}
        PLANTILLA_MODELOS={PLANTILLA_MODELOS}
        getCurrentProductValue={getCurrentProductValue}
        disabled={selectedProducts.length === 0}
        plantillaFamily={plantillaSeleccionada?.label || 'Sin especificar'}
        plantillaType={comboSeleccionado?.label || 'Sin especificar'}
        selectedProducts={selectedProducts}
        modeloSeleccionado={modeloSeleccionado}
        formatoSeleccionado={formatoSeleccionado}
        selectedFinancing={selectedFinancing}
      />
      
      {/* Modal de eliminación */}
      <DeleteProductModal
        isOpen={deleteModalOpen}
        product={productToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        productNumber={productToDelete ? selectedProducts.findIndex(p => p.id === productToDelete.id) + 1 : undefined}
        totalProducts={selectedProducts.length}
      />
    </div>
  );
};