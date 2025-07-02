import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Eye, EyeOff, Settings, X, ChevronLeft, ChevronRight, Grid, ArrowLeft, Package, AlertTriangle, Search, Edit3, Lock, Unlock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useReactToPrint } from 'react-to-print';

// Servicios y datos
import { posterTemplateService, PosterFamilyData, PosterTemplateData } from '../../../../../services/posterTemplateService';
import { EmailService } from '../../../../../services/emailService';
import { type EditedProduct as ServiceEditedProduct } from '../../../../../hooks/useProductChanges';
import { type Product } from '../../../../../data/products';

// Redux
import {
  selectSelectedProductObjects,
  selectSelectedFinancing,
  selectFormatoSeleccionado,
  selectProductChanges,
  selectHasAnyChanges,
  removeProduct,
  removeAllProducts,
  trackProductChange,
  type EditedProduct as ReduxEditedProduct,
} from '../../../../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../../../../store';

// Componentes
import { EditableField } from './EditableField';
import { DeleteProductModal } from './DeleteProductModal';
import { ProductChangesModal } from './ProductChangesModal';
import { BuilderTemplateRenderer } from './Renderers/BuilderTemplateRenderer';
import { PrintContainer } from './PrintContainer';

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
  const hasAnyChanges = useSelector(selectHasAnyChanges);
  
  // Estados locales
  const [expandedProductIndex, setExpandedProductIndex] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInlineEditEnabled, setIsInlineEditEnabled] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Ref para el contenedor de impresión
  const printComponentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
  });

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

  // 🆕 NUEVA FUNCIÓN: Toggle para habilitar/deshabilitar edición
  const toggleInlineEdit = () => {
    setIsInlineEditEnabled(prev => !prev);
    console.log(`🎯 Edición inline ${!isInlineEditEnabled ? 'HABILITADA' : 'DESHABILITADA'}`);
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
      // Mapeo directo desde el producto usando fieldKey correctos
      descripcion: product.descripcion || 'Sin nombre',
      precio: product.precio || 0,
      sku: product.sku || 'N/A',
      ean: product.ean || '',
      marcaTexto: product.marcaTexto || '',
      precioAnt: product.precioAnt || 0,
      basePrice: product.basePrice || 0,
      stockDisponible: product.stockDisponible || 0,
      paisTexto: product.paisTexto || 'Argentina',
      origen: product.origen || 'ARG',
      
      // Valores calculados o por defecto
      porcentaje: 20, // Descuento por defecto del 20%
      fechasDesde: now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      fechasHasta: nextWeek.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      precioSinImpuestos: product.precio ? Math.round(product.precio * 0.83) : 0
    };
    
    const mappedValue = fieldMapping[field];
    console.log(`🗺️ Mapeo ${field} = ${mappedValue} (de ${product.descripcion})`);
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

  // 🆕 CALLBACK PARA EDICIÓN INLINE DIRECTA
  const handleInlineEdit = (fieldType: string, newValue: string) => {
    if (selectedProducts.length === 1) {
      // Para vista de un producto
      const product = selectedProducts[0];
      console.log(`🖱️ Edición inline directa: ${fieldType} = ${newValue} para ${product.descripcion}`);
      handleProductEdit(product.id, fieldType, newValue);
    } else if (expandedProductIndex !== null) {
      // Para vista expandida de producto individual
      const product = selectedProducts[expandedProductIndex];
      console.log(`🖱️ Edición inline directa: ${fieldType} = ${newValue} para ${product.descripcion}`);
      handleProductEdit(product.id, fieldType, newValue);
    }
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

  // 🚀 LÓGICA DE IMPRESIÓN
  const handlePrintClick = () => {
    if (hasAnyChanges) {
      // Si hay cambios, abrir el modal de reporte
      setIsReportModalOpen(true);
    } else {
      // Si no hay cambios, proceder directamente a la lógica de impresión final
      console.log('🖨️ No hay cambios detectados. Procediendo a imprimir directamente...');
      executeFinalPrintLogic();
    }
  };

  const handleConfirmPrint = async (justification: string) => {
    console.log('✅ Reporte confirmado. Justificación:', justification);

    if (!selectedFamily || !selectedTemplate) {
      console.error('No se puede enviar el reporte: falta familia o plantilla seleccionada.');
      alert('Error: No se ha seleccionado una familia o plantilla.');
      return;
    }

    // 🚀 MAPEAR DATOS DE REDUX AL FORMATO DEL SERVICIO
    const reduxEditedProducts: ReduxEditedProduct[] = Object.values(productChanges);
    const serviceEditedProducts: ServiceEditedProduct[] = [];

    for (const reduxProduct of reduxEditedProducts) {
      const originalProduct = selectedProducts.find(p => p.sku?.toString() === reduxProduct.productId);
      if (originalProduct) {
        const productForService: ServiceEditedProduct = {
          ...originalProduct,
          changes: reduxProduct.changes,
          isEdited: reduxProduct.isEdited,
          name: reduxProduct.productName, // Sobrescribir con el nombre (posiblemente editado) de Redux
        };
        serviceEditedProducts.push(productForService);
      }
    }

    // Preparar los datos para el reporte
    const reportData = {
      plantillaFamily: selectedFamily.displayName,
      plantillaType: selectedTemplate.name,
      editedProducts: serviceEditedProducts,
      reason: justification,
      // TODO: Obtener datos del usuario logueado
      // userName: currentUser.name,
      // userEmail: currentUser.email,
      timestamp: new Date()
    };
    
    console.log('📧 Enviando email de notificación...');
    const emailSent = await EmailService.sendChangeReport(reportData);

    if (emailSent) {
      console.log('✅ Email enviado con éxito.');
      // Opcional: mostrar un toast de éxito
    } else {
      console.error('❌ Falló el envío del email.');
      alert('Hubo un error al enviar el reporte por email. La impresión se ha cancelado.');
      setIsReportModalOpen(false);
      return;
    }

    console.log('🖨️ Iniciando proceso de impresión final...');
    executeFinalPrintLogic();
    
    setIsReportModalOpen(false);
  };
  
  const executeFinalPrintLogic = () => {
    console.log('📄 Preparando contenido para impresión...');
    // Llamar a la función de impresión del hook
    handlePrint();
  };
  // FIN LÓGICA DE IMPRESIÓN

  // Renderizado principal
  return (
    <div className="h-full flex flex-col">
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
                <div className="max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100 rounded-lg">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2">
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
                
                <div className="flex items-center gap-3">
                  {/* 🆕 NUEVO: Botón para habilitar/deshabilitar edición */}
                  <button
                    onClick={toggleInlineEdit}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                      isInlineEditEnabled
                        ? 'bg-green-500 text-white hover:bg-green-600 ring-2 ring-green-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title={isInlineEditEnabled ? 'Deshabilitar edición inline' : 'Habilitar edición inline'}
                  >
                    {isInlineEditEnabled ? (
                      <Unlock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {isInlineEditEnabled ? 'Edición Activa' : 'Edición Bloqueada'}
                    </span>
                  </button>
                  
                  {/* Indicador de productos */}
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500 px-2 py-1 bg-white/60 rounded">
                      {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* 🆕 NUEVO: Banner informativo cuando la edición está habilitada */}
              {isInlineEditEnabled && selectedProducts.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Modo edición activo</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Haz <strong>hover</strong> sobre cualquier campo en la plantilla y <strong>click</strong> para editarlo en tiempo real
                  </p>
                </div>
              )}

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
                            <span>Haz click en <strong>"Edición Activa"</strong> para habilitar la edición</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">3.</span>
                            <span>Haz <strong>hover</strong> sobre cualquier campo en el preview</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">4.</span>
                            <span>Haz <strong>click</strong> para editar y ve los cambios instantáneamente</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedProducts.length === 1 ? (
                // Un producto: vista de edición con panel mejorado
                <div className="flex-1 flex flex-col lg:flex-row bg-white relative">
                  {/* Vista previa de la plantilla */}
                  <div className={`flex-1 flex items-center justify-center bg-gray-50 p-3 xs:p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] overflow-auto ${
                    'order-1'
                  }`}>
                    <div className="w-full h-full flex items-center justify-center print-content overflow-visible relative" data-preview-content>
                      {/* Container de la plantilla con borde de edición */}
                      <div className={`transition-all duration-300 ${
                        isInlineEditEnabled ? 'ring-4 ring-green-400 ring-opacity-50 shadow-2xl rounded-lg overflow-hidden' : 'shadow-lg rounded-lg overflow-hidden'
                      }`}>
                        <BuilderTemplateRenderer 
                          template={selectedTemplate.template}
                          components={selectedTemplate.template.defaultComponents}
                          product={selectedProducts[0]}
                          productChanges={productChanges}
                          onEditField={handleInlineEdit}
                          enableInlineEdit={isInlineEditEnabled}
                          key={`${selectedProducts[0]?.id || 'no-product'}-${refreshKey}`}
                        />
                      </div>
                    </div>
                  </div>
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
                  <div className={`flex-1 flex items-center justify-center bg-gray-50 p-6 min-h-[500px] overflow-auto ${
                    'order-1'
                  }`}>
                    <div className="w-full h-full flex items-center justify-center print-content overflow-visible relative" data-preview-content>
                      {/* Container de la plantilla con borde de edición */}
                      <div className={`transition-all duration-300 ${
                        isInlineEditEnabled ? 'ring-4 ring-green-400 ring-opacity-50 shadow-2xl rounded-lg overflow-hidden' : 'shadow-lg rounded-lg overflow-hidden'
                      }`}>
                        <BuilderTemplateRenderer 
                          template={selectedTemplate.template}
                          components={selectedTemplate.template.defaultComponents}
                          product={selectedProducts[expandedProductIndex]}
                          productChanges={productChanges}
                          onEditField={handleInlineEdit}
                          enableInlineEdit={isInlineEditEnabled}
                          key={`${selectedProducts[expandedProductIndex]?.sku || 'no-product'}-${refreshKey}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Múltiples productos: vista de grilla de carteles
                <div className="flex-1 overflow-auto">
                  {/* 🔄 MEJORA: Contenedor con scroll optimizado para múltiples productos */}
                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                                {(() => {
                                    const containerWidth = 300; // Ancho aproximado del contenedor de la tarjeta
                                    const containerHeight = 288; // sm:h-72 -> 18rem -> 288px
                                    const optimalScale = getOptimalScale(
                                        selectedTemplate.template.canvas.width,
                                        selectedTemplate.template.canvas.height,
                                        containerWidth,
                                        containerHeight
                                    );
            
                                    return (
                                        <div
                                            className="max-w-full max-h-full transition-transform duration-300"
                                            style={{ transform: `scale(${optimalScale})` }}
                                        >
                                            <BuilderTemplateRenderer 
                                                template={selectedTemplate.template}
                                                components={selectedTemplate.template.defaultComponents}
                                                product={product}
                                                productChanges={productChanges}
                                                onEditField={(fieldType: string, newValue: string) => {
                                                  console.log(`🖱️ Edición inline directa (grilla): ${fieldType} = ${newValue} para ${product.descripcion}`);
                                                  handleProductEdit(product.id, fieldType, newValue);
                                                }}
                                                enableInlineEdit={isInlineEditEnabled}
                                                key={`${product.id}-${refreshKey}`}
                                              />
                                        </div>
                                    );
                                })()}
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
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
      {/* Botón de impresión */}
      <div className="mt-4">
        <button
          onClick={handlePrintClick}
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

      {/* 🚀 MODAL DE REPORTE DE CAMBIOS */}
      <ProductChangesModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onConfirmPrint={handleConfirmPrint}
      />

      {/* CONTENEDOR DE IMPRESIÓN (OCULTO) */}
      {selectedTemplate && (
        <PrintContainer
          ref={printComponentRef}
          templates={selectedProducts.map(product => ({
            product: product,
            template: selectedTemplate.template,
          }))}
          productChanges={productChanges}
        />
      )}
    </div>
  );
}; 