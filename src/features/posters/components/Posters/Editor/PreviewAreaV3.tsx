import React, { useState, useEffect, useMemo, useRef } from 'react';
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

  // Ref y estado para el tamaño del contenedor de la vista previa
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
  });

  // Observer para el tamaño del contenedor del preview
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [selectedTemplate]); // Re-observar si la plantilla cambia
  
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
  
  const optimalScale = useMemo(() => {
    if (!selectedTemplate || !containerSize.width || !containerSize.height) {
      return 0.5; // Valor por defecto razonable
    }
    return getOptimalScale(
      selectedTemplate.template.canvas.width,
      selectedTemplate.template.canvas.height,
      containerSize.width,
      containerSize.height
    );
  }, [selectedTemplate, containerSize.width, containerSize.height]);
  
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
      console.log('✅ Mapeo automático disponible para renderización, pero NO se registra como cambios');
      // Solo trigger refresh para re-renderizar con nuevos productos/plantilla
      setRefreshKey(prev => prev + 1);
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

  // 🚀 NUEVOS EFECTOS PARA INICIALIZAR NAVEGACIÓN DE PRODUCTOS
  // Inicializar expandedProductIndex en 0 cuando hay productos y no hay índice expandido
  useEffect(() => {
    if (selectedProducts.length > 0 && expandedProductIndex === null) {
      console.log('🎯 Inicializando navegación con primer producto');
      setExpandedProductIndex(0);
    } else if (selectedProducts.length === 0) {
      setExpandedProductIndex(null);
    }
  }, [selectedProducts.length]);

  // 🔧 DETERMINAR QUÉ PRODUCTO MOSTRAR
  const currentProductIndex = expandedProductIndex ?? 0;
  const currentProduct = selectedProducts.length > 0 ? selectedProducts[currentProductIndex] : undefined;

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
    <div className="h-full flex flex-col bg-gray-50 rounded-lg shadow-inner">
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        
        {/* Header de la vista previa */}
        {selectedTemplate && (
          <div className="flex-shrink-0 flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onTemplateSelect?.(null)}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                title="Volver a la grilla de plantillas"
              >
                <Grid className="w-4 h-4 text-gray-600" />
              </button>
              <div>
                <h3 className="font-bold text-gray-800">{selectedTemplate.name}</h3>
                <p className="text-sm text-gray-500">{selectedFamily?.displayName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 🚀 NUEVO: Controles de navegación entre productos múltiples */}
              {selectedProducts.length > 1 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm">
                  <button
                    onClick={() => handleNavigateProduct('prev')}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="Producto anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
                    {currentProductIndex + 1} de {selectedProducts.length}
                  </span>
                  <button
                    onClick={() => handleNavigateProduct('next')}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="Producto siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 🆕 Información del producto actual */}
              {currentProduct && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 max-w-[200px] truncate">
                    {currentProduct.descripcion || currentProduct.name}
                  </span>
                </div>
              )}

              {selectedProducts.length > 0 && (
                <button
                  onClick={toggleInlineEdit}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                    isInlineEditEnabled
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg ring-2 ring-green-300'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border'
                  }`}
                  title={isInlineEditEnabled ? 'Deshabilitar edición inline' : 'Habilitar edición inline'}
                >
                  <Edit3 className={`w-4 h-4 transition-transform duration-300 ${isInlineEditEnabled ? 'rotate-12' : ''}`} />
                  <span className="text-sm">
                    {isInlineEditEnabled ? 'Modo Edición' : 'Editar Campos'}
                  </span>
                </button>
              )}
              
              <button
                onClick={handlePrintClick}
                disabled={selectedProducts.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm disabled:bg-gray-300"
              >
                Imprimir
              </button>
            </div>
          </div>
        )}

        {/* Área de renderizado central */}
        <div ref={previewContainerRef} className="flex-1 grid place-items-center relative overflow-hidden">
          {!selectedTemplate ? (
            <div className="text-center text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium">Selecciona una plantilla</h3>
              <p className="text-sm">Elige una familia y luego una plantilla para comenzar.</p>
            </div>
          ) : (
            <div 
              className="shadow-lg rounded-lg overflow-hidden transition-transform duration-300 bg-white"
              style={{ transform: `scale(${optimalScale})`, transformOrigin: 'center' }}
            >
              <BuilderTemplateRenderer 
                template={selectedTemplate.template}
                components={selectedTemplate.template.defaultComponents}
                product={currentProduct}
                productChanges={productChanges}
                isPreview={selectedProducts.length === 0}
                onEditField={handleInlineEdit}
                enableInlineEdit={isInlineEditEnabled}
                key={`${currentProduct?.id || 'no-product'}-${refreshKey}-${currentProductIndex}`}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Modales */}
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