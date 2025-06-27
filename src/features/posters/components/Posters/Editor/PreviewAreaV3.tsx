import React, { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff, Settings, X, ChevronLeft, ChevronRight, Grid, ArrowLeft, Package, AlertTriangle, Search } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';

// Servicios y datos
import { posterTemplateService, PosterFamilyData, PosterTemplateData } from '../../../../../services/posterTemplateService';
import { type Product } from '../../../../../data/products';

// Redux
import {
  selectSelectedProductObjects,
  selectSelectedFinancing,
  selectFormatoSeleccionado,
  selectProductChanges,
  removeProduct,
  removeAllProducts,
  trackProductChange
} from '../../../../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../../../../store';

// Componentes
import { EditableField } from './EditableField';
import { DeleteProductModal } from './DeleteProductModal';
import { BuilderTemplateRenderer } from './Renderers/BuilderTemplateRenderer';
import { EditModeIndicator } from './EditModeIndicator';

// Utilidades
import { 
  getTemplateFields, 
  getAvailableFields, 
  getFieldLabel, 
  getFieldType,
  detectTemplateFields,
  getFallbackFieldsForFamily 
} from '../../../../../utils/templateFieldDetector';

interface PreviewAreaV3Props {
  selectedFamily?: PosterFamilyData | null;
  selectedTemplate?: PosterTemplateData | null;
  filteredTemplates?: PosterTemplateData[];
  searchTerm?: string;
  selectedCategory?: string;
  onTemplateSelect?: (template: PosterTemplateData | null) => void;
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => void;
  expandedProductId?: string | null; // NUEVO: Para expandir producto desde el panel lateral
  onExpandedProductChange?: (productId: string | null) => void; // NUEVO: Callback para cambios de expansión
}

export const PreviewAreaV3: React.FC<PreviewAreaV3Props> = ({
  selectedFamily,
  selectedTemplate,
  filteredTemplates = [],
  searchTerm = '',
  selectedCategory = 'all',
  onTemplateSelect,
  onUpdateProduct,
  expandedProductId,
  onExpandedProductChange
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Estados de Redux
  const selectedProducts = useSelector(selectSelectedProductObjects);
  const selectedFinancing = useSelector(selectSelectedFinancing);
  const formatoSeleccionado = useSelector(selectFormatoSeleccionado);
  const productChanges = useSelector(selectProductChanges);
  
  // Estados locales
  const [expandedProductIndex, setExpandedProductIndex] = useState<number | null>(null);
  const [isEditPanelVisible, setIsEditPanelVisible] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editPanelMode, setEditPanelMode] = useState<'sidebar' | 'floating' | 'hidden'>('floating');

  // Sincronizar estado local con props externas para expansión
  useEffect(() => {
    if (expandedProductId) {
      const productIndex = selectedProducts.findIndex(p => p.sku?.toString() === expandedProductId);
      if (productIndex !== -1) {
        setExpandedProductIndex(productIndex);
      }
    } else {
      setExpandedProductIndex(null);
    }
  }, [expandedProductId, selectedProducts]);
  
  // Función helper para obtener producto editado
  const getEditedProduct = (productId: string) => {
    return productChanges[productId] || null;
  };

  // Funciones para manejar expansión de productos
  const handleExpandProduct = (productIndex: number) => {
    setExpandedProductIndex(productIndex);
    const product = selectedProducts[productIndex];
    if (product && onExpandedProductChange) {
      onExpandedProductChange(product.sku?.toString() || null);
    }
  };

  const handleCollapseProduct = () => {
    setExpandedProductIndex(null);
    if (onExpandedProductChange) {
      onExpandedProductChange(null);
    }
  };

  const handleNavigateProduct = (direction: 'prev' | 'next') => {
    if (expandedProductIndex === null) return;
    
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = expandedProductIndex > 0 ? expandedProductIndex - 1 : selectedProducts.length - 1;
    } else {
      newIndex = expandedProductIndex < selectedProducts.length - 1 ? expandedProductIndex + 1 : 0;
    }
    
    handleExpandProduct(newIndex);
  };

  // 🔍 DETECTAR CAMPOS DINÁMICAMENTE: Analizar la plantilla para encontrar campos editables
  const availableFields = selectedTemplate 
    ? detectTemplateFields(selectedTemplate.template.defaultComponents || [])
    : [];
  
  // 🚀 FALLBACK: Si la plantilla no tiene componentes, usar campos por defecto según la familia
  const fallbackFields = !availableFields.length && selectedFamily 
    ? getFallbackFieldsForFamily(selectedFamily.name)
    : [];
  
  const finalAvailableFields = availableFields.length > 0 ? availableFields : fallbackFields;
  
  // Log para debugging
  useEffect(() => {
    if (selectedTemplate) {
      console.log('🔍 Analizando plantilla para campos dinámicos:', {
        templateName: selectedTemplate.name,
        components: selectedTemplate.template.defaultComponents?.length || 0,
        detectedFields: availableFields,
        fallbackFields: fallbackFields,
        finalFields: finalAvailableFields
      });
    }
  }, [selectedTemplate, availableFields.length, fallbackFields.length]);

  // 🚀 MAPEO AUTOMÁTICO MEJORADO - Llenar campos automáticamente cuando se selecciona producto
  useEffect(() => {
    console.log('🔄 useEffect mapeo automático ejecutándose...', {
      selectedProductsLength: selectedProducts.length,
      hasTemplate: !!selectedTemplate,
      availableFieldsLength: finalAvailableFields.length,
      availableFields: finalAvailableFields
    });

    if (selectedProducts.length > 0 && selectedTemplate && finalAvailableFields.length > 0) {
      let changesMade = false;

      selectedProducts.forEach(product => {
        // Solo mapear si no hay cambios previos para este producto
        const existingChanges = getEditedProduct(product.id);
        if (!existingChanges) {
          console.log(`🎯 Mapeando automáticamente campos para: ${product.name}`);
          
          // Mapear cada campo disponible en la plantilla
          finalAvailableFields.forEach((field: string) => {
            const productValue = getAutoMappedValue(product, field);
            if (productValue !== null && productValue !== undefined) {
              console.log(`📝 Mapeando ${field}: ${productValue}`);
              
              dispatch(trackProductChange({
                productId: product.sku?.toString() || '',
                productName: product.descripcion || '',
                field,
                originalValue: '',
                newValue: productValue
              }));
              
              changesMade = true;
            }
          });
        } else {
          console.log(`ℹ️ Producto ${product.name} ya tiene cambios, saltando mapeo automático`);
        }
      });
      
      // Trigger refresh SOLO si se hicieron cambios
      if (changesMade) {
        console.log('🔄 Refrescando vista con mapeo automático...');
        setRefreshKey(prev => prev + 1);
      }
    } else {
      console.log('⚠️ Condiciones no cumplidas para mapeo automático:', {
        hasProducts: selectedProducts.length > 0,
        hasTemplate: !!selectedTemplate,
        hasFields: finalAvailableFields.length > 0
      });
    }
  }, [selectedProducts, selectedTemplate, finalAvailableFields.length]); // Solo cuando cambian productos o plantilla

  // Función para mapear automáticamente valores del producto a campos de plantilla
  const getAutoMappedValue = (product: Product, field: string): string | number | null => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const fieldMapping: Record<string, any> = {
      // Mapeo directo desde el producto
      nombre: product.descripcion || 'Sin nombre',
      precioActual: product.precio || 0,
      sap: product.sku || 'N/A',
      
      // Valores calculados o por defecto
      porcentaje: 20, // Descuento por defecto del 20%
      fechasDesde: now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      fechasHasta: nextWeek.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      origen: 'ARG',
      precioSinImpuestos: product.precio ? Math.round(product.precio * 0.83) : 0
    };
    
    const mappedValue = fieldMapping[field];
    console.log(`🗺️ Mapeo ${field} = ${mappedValue} (de ${product.name})`);
    return mappedValue !== undefined ? mappedValue : null;
  };

  // Handlers para edición y eliminación
  const handleProductEdit = (productId: string, field: string, newValue: string | number) => {
    const product = selectedProducts.find(p => p.id === productId);
    if (!product) return;

    const originalValue = getCurrentProductValue(product, field);
    
    dispatch(trackProductChange({
      productId,
      productName: product.descripcion || '',
      field,
      originalValue: originalValue as string | number,
      newValue
    }));
    
    if (onUpdateProduct) {
      onUpdateProduct(productId, { [field]: newValue });
    }
    
    setRefreshKey(prev => prev + 1);
  };

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
      
      const productIndex = selectedProducts.findIndex(p => p.id === productToDelete.id);
      if (expandedProductIndex === productIndex) {
        setExpandedProductIndex(null);
      }
      
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
    
    if (editedProduct && editedProduct.changes.length > 0) {
      const change = editedProduct.changes.find(c => c.field === field);
      if (change) {
        return change.newValue;
      }
    }
    
    // Si no hay cambios, usar el valor mapeado automáticamente
    return getAutoMappedValue(product, field);
  };

  // 🎨 PANEL DE EDICIÓN FLOTANTE - Componente mejorado
  const EditPanel = ({ product }: { product: Product }) => {
    if (editPanelMode === 'hidden') return null;

    const panelClasses = editPanelMode === 'floating' 
      ? "fixed top-20 right-4 w-80 bg-white shadow-2xl rounded-lg z-50 max-h-[calc(100vh-100px)] overflow-y-auto border border-gray-200"
      : "w-full lg:w-80 bg-gray-50 border-b lg:border-b-0 lg:border-r p-3 xs:p-4 overflow-y-auto order-2 lg:order-1";

    return (
      <div className={panelClasses}>
        {/* Header del panel flotante */}
        {editPanelMode === 'floating' && (
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Settings className="w-4 h-4 text-green-500" />
              ✏️ Modo Edición Activo
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                Edita en tiempo real
              </span>
              <button
                onClick={() => setEditPanelMode('hidden')}
                className="w-6 h-6 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors flex items-center justify-center"
                title="Cerrar panel de edición"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Contenido del panel */}
        <div className={editPanelMode === 'floating' ? "p-4" : ""}>
          {editPanelMode === 'sidebar' && (
            <div className="mb-3 xs:mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <h3 className="text-base xs:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Settings className="w-4 h-4 xs:w-5 xs:h-5 text-green-500" />
                <span className="truncate">✏️ Modo Edición Activo</span>
              </h3>
              <p className="text-xs text-green-600 mt-1">Edita valores en tiempo real</p>
            </div>
          )}
          
          {/* Info del producto */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-800 truncate" title={product.descripcion}>
              {product.descripcion}
            </div>
            <div className="text-xs text-blue-600">SKU: {product.sku}</div>
            <div className="text-xs text-green-600 font-bold">${product.precio?.toLocaleString()}</div>
          </div>
          
          <div className="space-y-3 xs:space-y-4">
            {finalAvailableFields.map((field: string) => {
              const fieldType = getFieldType(field);
              const fieldLabel = getFieldLabel(field);
              const isRequired = field === 'nombre';
              
              return (
                <div key={field}>
                  <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
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

          {/* Tips de uso y estado */}
          <div className="mt-4 space-y-3">
            {/* Indicador de cambios automáticos */}
            <div className="p-2 bg-green-50 rounded-lg border border-green-200">
              <div className="text-xs text-green-700 font-medium">✅ Campos llenados automáticamente</div>
              <div className="text-xs text-green-600">Los valores se actualizaron al seleccionar el producto</div>
            </div>
            
            {/* Tips de edición */}
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-700 font-medium">💡 Tips de edición rápida:</div>
              <div className="text-xs text-blue-600 mt-1 space-y-1">
                <div>• <strong>Hover</strong> en cualquier campo para ver el ícono de edición</div>
                <div>• <strong>Click</strong> para empezar a editar</div>
                <div>• <strong>Enter</strong> para guardar, <strong>Escape</strong> para cancelar</div>
                <div>• Los cambios se aplican <strong>instantáneamente</strong> en el preview</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🎯 FUNCIÓN PARA CALCULAR ESCALA ÓPTIMA DINÁMICAMENTE
  const getOptimalScale = (templateWidth: number, templateHeight: number, containerWidth: number, containerHeight: number): number => {
    // Factores de escala para cada dimensión (balance entre tamaño y proporciones)
    const scaleX = (containerWidth * 0.92) / templateWidth;
    const scaleY = (containerHeight * 0.92) / templateHeight;
    
    // Usar el menor para asegurar que toda la plantilla quepa
    let scale = Math.min(scaleX, scaleY);
    
    // Factor de ajuste especial para plantillas verticales en contenedores horizontales
    const aspectRatioTemplate = templateWidth / templateHeight;
    const aspectRatioContainer = containerWidth / containerHeight;
    
    if (aspectRatioTemplate < 1 && aspectRatioContainer > 1) {
      // Plantilla vertical en contenedor horizontal - aumentar moderadamente la escala
      scale = scale * 1.3;
    }
    
    // Límites de escala equilibrados para buen tamaño sin distorsión
    return Math.max(0.25, Math.min(scale, 1.0));
  };

  // Renderizado principal
  return (
    <div className="h-full flex flex-col">
      {/* Indicador de modo de edición activo */}
      <EditModeIndicator
        isActive={selectedProducts.length > 0 && editPanelMode !== 'hidden'}
        mode={editPanelMode}
        onToggle={() => setEditPanelMode(editPanelMode === 'hidden' ? 'floating' : 'hidden')}
      />
      
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 border border-gray-200 flex flex-1 overflow-hidden max-h-full lg:max-h-[800px] w-full">
        
        <div className="w-full h-full overflow-y-auto scrollbar-hide">
          
          {/* Estado 1: Sin familia seleccionada */}
          {!selectedFamily && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4">
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 mb-3 xs:mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base xs:text-lg font-medium text-gray-700 mb-1 xs:mb-2">Selecciona una familia</h3>
              <p className="text-xs xs:text-sm text-gray-500 text-center max-w-xs xs:max-w-sm sm:max-w-md">
                Elige una familia de plantillas para ver los modelos disponibles
              </p>
            </div>
          )}

          {/* Estado 2: Familia seleccionada pero sin plantillas */}
          {selectedFamily && selectedFamily.templates.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4">
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 mb-3 xs:mb-4 bg-orange-200 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-orange-400" />
              </div>
              <h3 className="text-base xs:text-lg font-medium text-gray-700 mb-1 xs:mb-2">No hay plantillas disponibles</h3>
              <p className="text-xs xs:text-sm text-gray-500 text-center max-w-xs xs:max-w-sm sm:max-w-md">
                La familia "{selectedFamily.displayName}" no tiene plantillas configuradas.
              </p>
            </div>
          )}

          {/* Estado 3: Familia seleccionada, mostrar grilla de plantillas (SIN plantilla específica seleccionada) */}
          {selectedFamily && selectedFamily.templates.length > 0 && !selectedTemplate && (
            <div className="w-full h-full">
              {/* Header informativo */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{selectedFamily.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-blue-800">{selectedFamily.displayName}</h3>
                    <p className="text-sm text-blue-600">{selectedFamily.description}</p>
                  </div>
                </div>
                
                {/* Información sobre filtros activos */}
                {(searchTerm || selectedCategory !== 'all') && (
                  <div className="mt-3 p-2 bg-white/60 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">Filtros activos:</span>
                      {searchTerm && <span className="ml-1">Búsqueda: "{searchTerm}"</span>}
                      {searchTerm && selectedCategory !== 'all' && <span>, </span>}
                      {selectedCategory !== 'all' && <span className="ml-1">Categoría: {selectedCategory}</span>}
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-blue-500 mt-2">
                  {filteredTemplates.length > 0 
                    ? `Mostrando ${filteredTemplates.length} de ${selectedFamily.templates.length} plantillas - Haz click en cualquiera para trabajar con ella`
                    : "No se encontraron plantillas con los filtros aplicados"
                  }
                </p>
              </div>
              
              {/* Grilla de plantillas filtradas */}
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredTemplates.map((template) => {
                    // Calcular escala óptima para esta plantilla específica
                    const containerWidth = 500; // Equilibrio entre tamaño y proporciones
                    const containerHeight = 320; // Proporciones más equilibradas
                    const optimalScale = getOptimalScale(
                      template.template.canvas.width, 
                      template.template.canvas.height, 
                      containerWidth, 
                      containerHeight
                    );
                    
                    return (
                    <div
                      key={template.id}
                      className="group cursor-pointer border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition-all duration-300 bg-white hover:bg-gray-50 relative overflow-hidden"
                      onClick={() => onTemplateSelect?.(template)}
                      title={`${template.name} - Click para trabajar con esta plantilla`}
                    >
                      {/* Preview de la plantilla */}
                      <div className="w-full h-[320px] xs:h-[340px] sm:h-[360px] flex items-center justify-center p-2 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        <div 
                          className="max-w-full max-h-full transition-transform duration-300 shadow-lg rounded-lg overflow-hidden"
                          style={{
                            transform: `scale(${optimalScale})`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = `scale(${optimalScale * 1.05})`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = `scale(${optimalScale})`;
                          }}
                        >
                          <BuilderTemplateRenderer 
                            template={template.template}
                            components={template.template.defaultComponents}
                            isPreview={true}
                          />
                        </div>
                      </div>
                      
                      {/* Información de la plantilla */}
                      <div className="p-4 border-t border-gray-100">
                        <h4 className="font-bold text-gray-800 text-sm mb-2 truncate">{template.name}</h4>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-blue-600 font-medium">{selectedFamily.displayName}</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4 text-indigo-500" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Overlay de hover */}
                      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    );
                  })}
                </div>
              ) : (
                /* Mensaje cuando no hay resultados */
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Search className="w-16 h-16 mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No se encontraron plantillas</h3>
                  <p className="text-sm text-gray-500 text-center max-w-md">
                    {searchTerm 
                      ? `No hay plantillas que coincidan con "${searchTerm}"`
                      : `No hay plantillas en la categoría "${selectedCategory}"`
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Prueba ajustando los filtros de búsqueda</p>
                </div>
              )}
            </div>
          )}

          {/* Estado 4: Plantilla específica seleccionada - Vista ampliada para trabajar */}
          {selectedTemplate && (
            <div className="w-full h-full flex flex-col">
              {/* Header con controles */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onTemplateSelect?.(null)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    title="Volver a la grilla de plantillas"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Volver</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{selectedFamily?.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-indigo-800">{selectedTemplate.name}</div>
                      <div className="text-xs text-indigo-600">{selectedFamily?.displayName}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* BOTÓN PRINCIPAL DE MODO EDICIÓN - MUY VISIBLE */}
                  {selectedProducts.length > 0 && (
                    <div className="flex items-center gap-3">
                      {/* Botón principal prominente */}
                      <button
                        onClick={() => setEditPanelMode(editPanelMode === 'hidden' ? 'floating' : 'hidden')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md ${
                          editPanelMode === 'hidden' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-blue-200' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-green-200'
                        }`}
                        title={editPanelMode === 'hidden' ? "Activar modo edición" : "Desactivar modo edición"}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">
                          {editPanelMode === 'hidden' ? '✏️ Editar Campos' : '✅ Editando'}
                        </span>
                      </button>
                      
                      {/* Selector de modo del panel (solo visible cuando está activo) */}
                      {editPanelMode !== 'hidden' && (
                        <select
                          value={editPanelMode}
                          onChange={(e) => setEditPanelMode(e.target.value as 'sidebar' | 'floating' | 'hidden')}
                          className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          title="Cambiar posición del panel"
                        >
                          <option value="floating">📋 Panel flotante</option>
                          <option value="sidebar">📌 Panel lateral</option>
                        </select>
                      )}
                    </div>
                  )}
                  
                  {/* Indicador de productos */}
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500 px-2 py-1 bg-white/60 rounded">
                      {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''}
                    </div>
                    
                    {/* Indicador de modo edición activo */}
                    {selectedProducts.length > 0 && editPanelMode !== 'hidden' && (
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Modo edición activo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenido principal de la plantilla seleccionada */}
              {selectedProducts.length === 0 ? (
                // Sin productos: mostrar vista previa grande de la plantilla
                <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 rounded-lg">
                  <div className="text-center w-full">
                    <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200 max-w-5xl mx-auto">
                      <div 
                        className="max-w-full max-h-full overflow-visible flex justify-center"
                        style={{
                          transform: `scale(${getOptimalScale(
                            selectedTemplate.template.canvas.width,
                            selectedTemplate.template.canvas.height,
                            900, // Más equilibrado
                            650  // Proporciones mejores
                          )})`
                        }}
                      >
                        <BuilderTemplateRenderer 
                          template={selectedTemplate.template}
                          components={selectedTemplate.template.defaultComponents}
                          isPreview={true}
                        />
                      </div>
                    </div>
                    <div className="text-gray-500">
                      <h4 className="text-lg font-medium mb-2">Plantilla lista para usar</h4>
                      <p className="text-sm mb-4">Agrega productos desde el panel lateral para empezar a trabajar</p>
                      
                      {/* Instrucciones de edición */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                        <h5 className="text-sm font-semibold text-blue-800 mb-2">
                          🚀 ¿Cómo editar en tiempo real?
                        </h5>
                        <div className="text-xs text-blue-700 space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">1.</span>
                            <span>Agrega productos desde el panel lateral</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">2.</span>
                            <span>Haz click en el botón <strong>"✏️ Editar Campos"</strong></span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">3.</span>
                            <span>Edita valores y ve los cambios instantáneamente</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedProducts.length === 1 ? (
                // Un producto: vista de edición con panel mejorado
                <div className="flex-1 flex flex-col lg:flex-row bg-white relative">
                  {/* Panel de edición - sidebar mode */}
                  {editPanelMode === 'sidebar' && (
                    <EditPanel product={selectedProducts[0]} />
                  )}

                  {/* Vista previa de la plantilla */}
                  <div className={`flex-1 flex items-center justify-center bg-gray-50 p-3 xs:p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] overflow-auto ${
                    editPanelMode === 'sidebar' ? 'order-1 lg:order-2' : 'order-1'
                  }`}>
                    <div className="w-full h-full flex items-center justify-center print-content overflow-visible" data-preview-content>
                      <BuilderTemplateRenderer 
                        template={selectedTemplate.template}
                        components={selectedTemplate.template.defaultComponents}
                        product={selectedProducts[0]}
                        productChanges={productChanges}
                        key={`${selectedProducts[0]?.id || 'no-product'}-${refreshKey}`}
                      />
                    </div>
                  </div>

                  {/* Panel de edición - floating mode */}
                  {editPanelMode === 'floating' && (
                    <EditPanel product={selectedProducts[0]} />
                  )}

                  {/* Quick Actions cuando el panel está oculto */}
                  {editPanelMode === 'hidden' && (
                    <div className="fixed bottom-4 right-4 z-40">
                      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-3">
                        <div className="text-xs text-gray-600 mb-2 text-center">
                          Edición disponible
                        </div>
                        <button
                          onClick={() => setEditPanelMode('floating')}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          ✏️ Editar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : expandedProductIndex !== null ? (
                // Vista expandida de producto individual con navegación
                <div className="flex-1 flex flex-col">
                  {/* Header de navegación */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCollapseProduct}
                        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        title="Volver a vista de grilla"
                      >
                        <Grid className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Vista grilla</span>
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {expandedProductIndex + 1}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-green-800">
                            {selectedProducts[expandedProductIndex]?.descripcion}
                          </div>
                          <div className="text-xs text-green-600">
                            Producto {expandedProductIndex + 1} de {selectedProducts.length}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Navegación entre productos */}
                      <button
                        onClick={() => handleNavigateProduct('prev')}
                        className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
                        title="Producto anterior"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      <span className="text-xs text-gray-500 px-2">
                        {expandedProductIndex + 1}/{selectedProducts.length}
                      </span>
                      
                      <button
                        onClick={() => handleNavigateProduct('next')}
                        className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
                        title="Producto siguiente"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      {/* Botón eliminar producto actual */}
                      <button
                        onClick={() => handleDeleteClick(selectedProducts[expandedProductIndex])}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm flex items-center justify-center"
                        title="Eliminar este producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Vista expandida del producto */}
                  <div className="flex-1 flex flex-col lg:flex-row bg-white relative">
                    {/* Panel de edición - sidebar mode */}
                    {editPanelMode === 'sidebar' && (
                      <EditPanel product={selectedProducts[expandedProductIndex]} />
                    )}

                    {/* Vista previa expandida */}
                    <div className={`flex-1 flex items-center justify-center bg-gray-50 p-6 min-h-[500px] overflow-auto ${
                      editPanelMode === 'sidebar' ? 'order-1 lg:order-2' : 'order-1'
                    }`}>
                      <div className="w-full h-full flex items-center justify-center print-content overflow-visible" data-preview-content>
                        <BuilderTemplateRenderer 
                          template={selectedTemplate.template}
                          components={selectedTemplate.template.defaultComponents}
                          product={selectedProducts[expandedProductIndex]}
                          productChanges={productChanges}
                          key={`${selectedProducts[expandedProductIndex]?.sku || 'no-product'}-${refreshKey}`}
                        />
                      </div>
                    </div>

                    {/* Panel de edición - floating mode */}
                    {editPanelMode === 'floating' && (
                      <EditPanel product={selectedProducts[expandedProductIndex]} />
                    )}
                  </div>
                </div>
              ) : (
                // Múltiples productos: vista de grilla de carteles
                <div className="flex-1 overflow-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
                    {selectedProducts.map((product, productIndex) => (
                      <div
                        key={`${product.sku}-${productIndex}`}
                        className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-300"
                        onClick={() => handleExpandProduct(productIndex)}
                      >
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-3 z-20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                                {productIndex + 1}
                              </div>
                              <span className="text-sm font-medium truncate">Cartel #{productIndex + 1}</span>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProduct(product.id);
                              }}
                              className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="relative mt-12 p-4 bg-gray-50">
                          <div className="relative bg-white rounded-lg shadow-inner border-2 border-gray-200 overflow-hidden">
                            <div className="w-full h-64 sm:h-72 lg:h-80 flex items-center justify-center bg-white">
                              <div className="max-w-full max-h-full scale-50 sm:scale-60 lg:scale-70 transform">
                                <BuilderTemplateRenderer 
                                  template={selectedTemplate.template}
                                  components={selectedTemplate.template.defaultComponents}
                                  product={product}
                                  productChanges={productChanges}
                                  key={`${product.id}-${refreshKey}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-white border-t border-gray-100">
                          <div className="text-center space-y-2">
                            <h3 className="font-bold text-gray-900 text-sm truncate" title={product.descripcion}>
                              {product.descripcion}
                            </h3>
                            <div className="flex justify-between items-center text-xs text-gray-600">
                              <span>SKU: {product.sku || 'N/A'}</span>
                              <span className="font-bold text-green-600">${product.precio?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
      {/* Botón de impresión */}
      <div className="mt-4">
        <button
          disabled={selectedProducts.length === 0 || !selectedTemplate}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            selectedProducts.length === 0 || !selectedTemplate
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
          }`}
        >
          {!selectedTemplate
            ? 'Selecciona una plantilla para continuar'
            : selectedProducts.length === 0 
              ? 'Agrega productos para imprimir' 
              : `Imprimir ${selectedProducts.length} cartel${selectedProducts.length > 1 ? 'es' : ''}`
          }
        </button>
      </div>
      
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