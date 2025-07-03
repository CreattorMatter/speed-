import React, { useRef, useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Grid, ChevronLeft, ChevronRight, Save, X, Printer } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedProducts, selectProductChanges, trackProductChange, selectHasAnyChanges } from '../../../../../store/features/poster/posterSlice';
import { PosterTemplateData, PosterFamilyData } from '../../../../../services/posterTemplateService';
import { Product } from '../../../../../data/products';
import { productos } from '../../../../../data/products';
import { TemplateGrid } from './Selectors/TemplateGrid';
import { BuilderTemplateRenderer } from './Renderers/BuilderTemplateRenderer';
import { detectEditableFields, getEditableFieldsStats, EditableFieldInfo } from '../../../../../utils/templateFieldDetector';
import { ProductChangesModal } from './ProductChangesModal';
import { PrintContainer } from './PrintContainer';
import { EmailService } from '../../../../../services/emailService';

interface PreviewAreaV3Props {
  selectedFamily?: PosterFamilyData | null;
  selectedTemplate?: PosterTemplateData | null;
  filteredTemplates?: PosterTemplateData[];
  onTemplateSelect?: (template: PosterTemplateData | null) => void;
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => void;
  expandedProductId?: string | null;
  onExpandedProductChange?: (productId: string | null) => void;
  isLoadingTemplates: boolean;
}

export const PreviewAreaV3: React.FC<PreviewAreaV3Props> = ({
  selectedFamily,
  selectedTemplate,
  filteredTemplates = [],
  onTemplateSelect,
  isLoadingTemplates
}) => {
  const selectedProducts = useSelector(selectSelectedProducts);
  const productChanges = useSelector(selectProductChanges);
  const hasAnyChanges = useSelector(selectHasAnyChanges);
  const dispatch = useDispatch();
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Estado para navegación entre productos
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  
  // Estados para edición inline estilo SPID viejo
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  
  // Estados para sistema de impresión
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Observer para el tamaño del contenedor
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });
    if (previewContainerRef.current) {
      observer.observe(previewContainerRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  // Función para calcular escala óptima - MAXIMIZAR ESPACIO HORIZONTAL
  const getOptimalScale = (templateWidth: number, templateHeight: number, containerWidth: number, containerHeight: number): number => {
    // Usar 95% del ancho disponible y 85% de la altura
    const availableWidth = containerWidth * 0.95;
    const availableHeight = containerHeight * 0.85; // Un poco menos altura para dejar espacio al header
    
    const scaleX = availableWidth / templateWidth;
    const scaleY = availableHeight / templateHeight;
    
    // Usar la escala menor pero permitir hasta 5x para plantillas muy pequeñas
    const calculatedScale = Math.min(scaleX, scaleY);
    
    // Asegurar una escala mínima de 1.0 y máxima de 5.0 para mejor aprovechamiento
    return Math.max(1.0, Math.min(calculatedScale, 5.0));
  };

  const optimalScale = selectedTemplate && containerSize.width > 0 && containerSize.height > 0
    ? getOptimalScale(
        selectedTemplate.template.canvas.width,
        selectedTemplate.template.canvas.height,
        containerSize.width,
        containerSize.height
      )
    : 1.0; // Escala inicial más grande

  // Resetear índice cuando cambian los productos seleccionados
  useEffect(() => {
    if (currentProductIndex >= selectedProducts.length) {
      setCurrentProductIndex(0);
    }
  }, [selectedProducts.length, currentProductIndex]);

  // Obtener el objeto del producto actual basado en el índice
  const currentProduct = useMemo(() => {
    if (selectedProducts.length === 0) return undefined;
    const productId = selectedProducts[currentProductIndex] || selectedProducts[0];
    return productos.find(p => p.id === productId);
  }, [selectedProducts, currentProductIndex]);

  // Calcular si hay cambios basándose en Redux + cambios pendientes
  const hasUnsavedChanges = useMemo(() => {
    const hasReduxChanges = currentProduct && productChanges[currentProduct.id]?.isEdited;
    const hasPendingChanges = Object.keys(pendingChanges).length > 0;
    return hasReduxChanges || hasPendingChanges;
  }, [currentProduct, productChanges, pendingChanges]);

  // Funciones de navegación
  const goToPreviousProduct = () => {
    setCurrentProductIndex(prev => 
      prev > 0 ? prev - 1 : selectedProducts.length - 1
    );
  };

  const goToNextProduct = () => {
    setCurrentProductIndex(prev => 
      prev < selectedProducts.length - 1 ? prev + 1 : 0
    );
  };

  // Función helper para obtener valor original de un campo
  const getOriginalFieldValue = (product: Product, fieldType: string): string | number => {
    switch (fieldType) {
      case 'descripcion':
      case 'product_name':
        return product.descripcion || '';
      case 'precio':
      case 'product_price':
        return product.precio || 0;
      case 'sku':
      case 'product_sku':
        return product.sku || '';
      case 'marcaTexto':
      case 'product_brand':
        return product.marcaTexto || '';
      case 'precioAnt':
      case 'price_previous':
        return product.precioAnt || 0;
      case 'basePrice':
      case 'price_base':
        return product.basePrice || 0;
      case 'origen':
      case 'product_origin':
        return product.origen || '';
      case 'stockDisponible':
      case 'stock_available':
        return product.stockDisponible || 0;
      // 🆕 CAMPOS ESTÁTICOS: No pertenecen al producto, usar valores por defecto
      case 'fecha':
        return new Date().toLocaleDateString('es-AR'); // Fecha actual como valor original
      case 'icono':
        return '★'; // Icono por defecto
      case 'texto':
      case 'texto_estatico':
        return 'Texto estático'; // Texto por defecto para campos estáticos
      default:
        console.warn(`⚠️ Campo no mapeado: ${fieldType}`);
        // Para campos desconocidos, intentar usar un valor genérico
        return fieldType.includes('precio') || fieldType.includes('price') ? 0 : '';
    }
  };

  // Funciones para edición inline estilo SPID viejo
  const handleToggleEditMode = () => {
    if (isEditModeActive && hasUnsavedChanges) {
      // Si hay cambios pendientes, preguntar al usuario
      const confirmDiscard = window.confirm(
        '¿Descartar los cambios pendientes? Los cambios no guardados se perderán.'
      );
      if (!confirmDiscard) return;
    }
    
    setIsEditModeActive(prev => !prev);
    setPendingChanges({});
  };

  const handlePendingChange = (fieldType: string, newValue: string | number) => {
    console.log(`📝 Cambio pendiente: ${fieldType} = ${newValue}`);
    setPendingChanges(prev => ({
      ...prev,
      [fieldType]: newValue
    }));
  };

  const handleFieldEdit = (fieldType: string, newValue: string | number) => {
    if (!currentProduct) return;
    
    console.log(`📝 Editando campo directamente: ${fieldType} = ${newValue}`);
    
    // 🆕 MANEJAR CAMPOS ESTÁTICOS CON ID ÚNICO
    let originalValue: string | number;
    let baseFieldType = fieldType;
    
    // Si es un campo estático con ID único, extraer el tipo base
    if (fieldType.includes('_') && fieldType.match(/_[a-f0-9-]+$/)) {
      baseFieldType = fieldType.split('_')[0];
      console.log(`🔍 Campo estático detectado: ${fieldType} → tipo base: ${baseFieldType}`);
    }
    
    // Obtener valor original usando el tipo base
    originalValue = getOriginalFieldValue(currentProduct, baseFieldType);
    
    // Para campos estáticos, usar un valor por defecto si no se encuentra
    if (baseFieldType === 'texto_estatico' || baseFieldType === 'icono' || baseFieldType === 'fecha') {
      originalValue = baseFieldType === 'texto_estatico' ? 'Texto estático' :
                     baseFieldType === 'icono' ? '★' :
                     baseFieldType === 'fecha' ? new Date().toLocaleDateString('es-AR') : '';
    }
    
    // Registrar el cambio en Redux usando el fieldType completo (con ID único)
    dispatch(trackProductChange({
      productId: currentProduct.id,
      productName: currentProduct.descripcion,
      field: fieldType, // Usar el fieldType completo con ID único
      originalValue,
      newValue
    }));
  };

  const handleConfirmAllChanges = () => {
    if (!currentProduct) return;
    
    console.log('💾 Confirmando todos los cambios:', pendingChanges);
    
    // Aplicar cambios pendientes a Redux
    Object.entries(pendingChanges).forEach(([fieldType, newValue]) => {
      // 🆕 MANEJAR CAMPOS ESTÁTICOS CON ID ÚNICO
      let baseFieldType = fieldType;
      
      // Si es un campo estático con ID único, extraer el tipo base
      if (fieldType.includes('_') && fieldType.match(/_[a-f0-9-]+$/)) {
        baseFieldType = fieldType.split('_')[0];
      }
      
      let originalValue = getOriginalFieldValue(currentProduct, baseFieldType);
      
      // Para campos estáticos, usar un valor por defecto si no se encuentra
      if (baseFieldType === 'texto_estatico' || baseFieldType === 'icono' || baseFieldType === 'fecha') {
        originalValue = baseFieldType === 'texto_estatico' ? 'Texto estático' :
                       baseFieldType === 'icono' ? '★' :
                       baseFieldType === 'fecha' ? new Date().toLocaleDateString('es-AR') : '';
      }
      
      dispatch(trackProductChange({
        productId: currentProduct.id,
        productName: currentProduct.descripcion,
        field: fieldType, // Usar el fieldType completo con ID único
        originalValue,
        newValue
      }));
    });
    
    setPendingChanges({});
  };

  const handleCancelAllChanges = () => {
    console.log('❌ Cancelando todos los cambios');
    setPendingChanges({});
  };

  // Funciones para sistema de impresión
  const handlePrintClick = () => {
    // Verificar si hay productos seleccionados
    if (selectedProducts.length === 0) {
      alert('Debes seleccionar al menos un producto para imprimir.');
      return;
    }

    // Verificar si hay una plantilla seleccionada
    if (!selectedTemplate) {
      alert('Debes seleccionar una plantilla para imprimir.');
      return;
    }

    // Determinar la orientación de la plantilla y actualizar el estado
    const isLandscape = selectedTemplate.template.canvas.width > selectedTemplate.template.canvas.height;
    setPrintOrientation(isLandscape ? 'landscape' : 'portrait');

    // Si hay cambios pendientes, confirmarlos primero
    if (Object.keys(pendingChanges).length > 0) {
      const confirmChanges = window.confirm(
        'Tienes cambios pendientes. ¿Deseas confirmarlos antes de imprimir?'
      );
      if (confirmChanges) {
        handleConfirmAllChanges();
      } else {
        setPendingChanges({});
      }
    }

    // Si hay cambios guardados, mostrar modal de confirmación
    if (hasAnyChanges) {
      setShowChangesModal(true);
    } else {
      // Imprimir directamente si no hay cambios
      handleDirectPrint();
    }
  };

  const handleDirectPrint = () => {
    console.log('🖨️ Imprimiendo sin cambios...');
    setIsPrinting(true);
    
    // Preparar datos para impresión
    const printData = {
      templates: selectedProducts.map(productId => {
        const product = productos.find(p => p.id === productId);
        return product && selectedTemplate ? {
          product,
          template: selectedTemplate.template
        } : null;
      }).filter(Boolean),
      productChanges: {},
      hasChanges: false
    };

    console.log('📄 Datos de impresión preparados:', printData);
    
    // Usar setTimeout para asegurar que el DOM se actualice
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleConfirmPrintWithChanges = async (justification: string) => {
    console.log('🖨️ Imprimiendo con cambios y justificación:', justification);
    
    try {
      setIsPrinting(true);
      setShowChangesModal(false);

      // Preparar datos para impresión con cambios
      const printData = {
        templates: selectedProducts.map(productId => {
          const product = productos.find(p => p.id === productId);
          return product && selectedTemplate ? {
            product,
            template: selectedTemplate.template
          } : null;
        }).filter(Boolean),
        productChanges,
        hasChanges: true,
        justification,
        timestamp: new Date().toISOString()
      };

      console.log('📄 Datos de impresión con cambios preparados:', printData);

      // Enviar reporte por email si hay cambios
      if (hasAnyChanges) {
        console.log('📧 Enviando reporte de cambios por email...');
        try {
          // Convertir EditedProduct del posterSlice al formato esperado por EmailService
          const editedProductsForEmail = Object.values(productChanges).map(editedProduct => {
            const product = productos.find(p => p.id === editedProduct.productId);
            return {
              id: editedProduct.productId,
              name: editedProduct.productName,
              sku: Number(product?.sku) || 0,
              price: product?.precio || 0,
              changes: editedProduct.changes,
              isEdited: editedProduct.isEdited,
              // Campos adicionales requeridos por el tipo EmailService
              ean: Number(product?.ean) || 0,
              descripcion: editedProduct.productName,
              tienda: '', // No disponible en este contexto
              imageUrl: product?.imageUrl || '',
              category: product?.category || '',
              pricePerUnit: '',
              points: '',
              origin: product?.origen || '',
              barcode: Number(product?.ean) || 0,
              brand: product?.marcaTexto || '',
              packUnit: ''
            };
          });

          const emailSent = await EmailService.sendChangeReport({
            plantillaFamily: selectedFamily?.displayName || 'N/A',
            plantillaType: selectedTemplate?.name || 'N/A',
            editedProducts: editedProductsForEmail,
            reason: justification,
            userEmail: 'usuario@ejemplo.com', // TODO: Obtener del contexto de usuario
            userName: 'Usuario Sistema', // TODO: Obtener del contexto de usuario
            timestamp: new Date()
          });

          if (emailSent) {
            console.log('✅ Reporte de cambios enviado exitosamente por email');
          } else {
            console.warn('⚠️ No se pudo enviar el reporte por email, pero se procederá con la impresión');
          }
        } catch (emailError) {
          console.error('❌ Error enviando reporte por email:', emailError);
          // No bloquear la impresión por error de email
        }
      }

      // Imprimir
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100);

    } catch (error) {
      console.error('❌ Error en impresión con cambios:', error);
      setIsPrinting(false);
      alert('Error al procesar la impresión. Inténtalo de nuevo.');
    }
  };

  // Navegación con teclado y atajos para edición inline
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Navegación entre productos
      if (selectedProducts.length > 1) {
        if (event.key === 'ArrowLeft' && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          goToPreviousProduct();
        } else if (event.key === 'ArrowRight' && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          goToNextProduct();
        }
      }
      
      // Atajos para edición inline estilo SPID viejo
      if (selectedProducts.length > 0) {
        // Ctrl/Cmd + E: Activar/desactivar modo edición
        if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
          event.preventDefault();
          handleToggleEditMode();
        }
        
        // Ctrl/Cmd + S: Confirmar cambios (solo si hay cambios pendientes)
        if ((event.ctrlKey || event.metaKey) && event.key === 's' && hasUnsavedChanges) {
          event.preventDefault();
          handleConfirmAllChanges();
        }
        
        // Escape: Cancelar cambios pendientes
        if (event.key === 'Escape' && hasUnsavedChanges) {
          event.preventDefault();
          const confirmCancel = window.confirm('¿Cancelar todos los cambios pendientes?');
          if (confirmCancel) {
            handleCancelAllChanges();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedProducts.length, hasUnsavedChanges]);

  // Detectar campos editables automáticamente
  const editableFieldsStats = useMemo(() => {
    if (!selectedTemplate?.template?.defaultComponents) return null;
    const stats = getEditableFieldsStats(selectedTemplate.template.defaultComponents);
    console.log('📊 Estadísticas de campos editables:', stats);
    return stats;
  }, [selectedTemplate]);

  const editableFields = useMemo(() => {
    if (!selectedTemplate?.template?.defaultComponents) return [];
    const fields = detectEditableFields(selectedTemplate.template.defaultComponents);
    console.log('🔍 Campos editables detectados:', fields);
    return fields;
  }, [selectedTemplate]);

  const renderContent = () => {
    // CASO 1: Plantilla seleccionada, renderizar editor básico
    if (selectedTemplate) {
      return (
        <>
          <div className="flex-shrink-0 flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
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
              {/* Controles de navegación de productos */}
              {selectedProducts.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousProduct}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    title="Producto anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm font-medium text-blue-800">
                      {currentProductIndex + 1} de {selectedProducts.length}
                    </span>
                  </div>
                  
                  <button
                    onClick={goToNextProduct}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    title="Producto siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Estadísticas de campos editables */}
              {editableFieldsStats && editableFieldsStats.total > 0 && (
                <div className="bg-white rounded-lg px-3 py-2 shadow-md border">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">📝</span>
                    <span className="font-medium text-gray-800">
                      {editableFieldsStats.total} campos editables
                    </span>
                    {editableFieldsStats.highPriority > 0 && (
                      <span className="text-orange-600 font-medium">
                        ({editableFieldsStats.highPriority} prioritarios)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {editableFieldsStats.byCategory.product > 0 && `${editableFieldsStats.byCategory.product} producto • `}
                    {editableFieldsStats.byCategory.price > 0 && `${editableFieldsStats.byCategory.price} precio • `}
                    {editableFieldsStats.byCategory.date > 0 && `${editableFieldsStats.byCategory.date} fecha • `}
                    {editableFieldsStats.byCategory.text > 0 && `${editableFieldsStats.byCategory.text} texto`}
                  </div>
                </div>
              )}

              {/* Controles de edición inline estilo SPID viejo */}
              {selectedProducts.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleEditMode}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isEditModeActive
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title={isEditModeActive ? 'Desactivar edición inline' : 'Activar edición inline'}
                  >
                    ✏️ {isEditModeActive ? 'Editando' : 'Editar Inline'}
                  </button>

                  {/* Botones de confirmación/cancelación cuando hay cambios pendientes */}
                  {hasUnsavedChanges && (
                    <>
                      <button
                        onClick={handleConfirmAllChanges}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm text-sm font-medium"
                        title="Confirmar todos los cambios (Ctrl+S)"
                      >
                        <Save className="w-4 h-4 mr-1 inline" />
                        Confirmar
                      </button>
                      
                      <button
                        onClick={handleCancelAllChanges}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm text-sm font-medium"
                        title="Cancelar todos los cambios (Escape)"
                      >
                        <X className="w-4 h-4 mr-1 inline" />
                        Cancelar
                      </button>
                    </>
                  )}
                  
                  {/* Indicador de atajos de teclado */}
                  {isEditModeActive && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border">
                      <span className="font-mono">Ctrl+E</span>: Edición | 
                      <span className="font-mono">Ctrl+S</span>: Guardar | 
                      <span className="font-mono">Esc</span>: Cancelar
                    </div>
                  )}

                  {/* Botón de imprimir */}
                  <button
                    onClick={handlePrintClick}
                    disabled={selectedProducts.length === 0 || !selectedTemplate || isPrinting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      selectedProducts.length === 0 || !selectedTemplate || isPrinting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : hasAnyChanges
                          ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
                          : 'bg-purple-500 text-white hover:bg-purple-600 shadow-md'
                    }`}
                    title={
                      selectedProducts.length === 0 
                        ? 'Selecciona productos para imprimir'
                        : !selectedTemplate
                          ? 'Selecciona una plantilla para imprimir'
                          : hasAnyChanges
                            ? 'Imprimir con reporte de cambios'
                            : 'Imprimir plantillas'
                    }
                  >
                    <Printer className="w-4 h-4" />
                    {isPrinting ? 'Imprimiendo...' : hasAnyChanges ? 'Imprimir con Cambios' : 'Imprimir'}
                    {hasAnyChanges && (
                      <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full ml-1">
                        {Object.keys(productChanges).length}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

                    {/* Información del producto actual */}
          {selectedProducts.length > 0 && currentProduct && (
            <div className="flex-shrink-0 mb-2">
              <div className={`border rounded-lg p-3 ${
                hasUnsavedChanges 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-semibold ${
                      hasUnsavedChanges ? 'text-orange-800' : 'text-blue-800'
                    }`}>
                      {currentProduct.descripcion}
                    </h4>
                    <p className={`text-sm ${
                      hasUnsavedChanges ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      SKU: {currentProduct.sku} | Precio: ${currentProduct.precio?.toLocaleString() || 'N/A'}
                    </p>
                    
                    {/* Indicador de cambios pendientes y guardados */}
                    {hasUnsavedChanges && (
                      <div className="mt-2 space-y-1">
                        {/* Cambios pendientes */}
                        {Object.keys(pendingChanges).length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-orange-700 font-medium">
                              {Object.keys(pendingChanges).length} cambio{Object.keys(pendingChanges).length !== 1 ? 's' : ''} pendiente{Object.keys(pendingChanges).length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        
                        {/* Cambios guardados en Redux */}
                        {currentProduct && productChanges[currentProduct.id]?.changes?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-700 font-medium">
                              {productChanges[currentProduct.id].changes.length} cambio{productChanges[currentProduct.id].changes.length !== 1 ? 's' : ''} guardado{productChanges[currentProduct.id].changes.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Modo edición activo */}
                    {isEditModeActive && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-yellow-700 font-medium">
                          Modo edición activo - Haz clic en cualquier texto para editarlo
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    {selectedProducts.length > 1 && (
                      <div className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">
                        Producto {currentProductIndex + 1}/{selectedProducts.length}
                      </div>
                    )}
                    
                    {isEditModeActive && (
                      <div className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        ✏️ Edición Inline
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

                    <div ref={previewContainerRef} className="flex-1 flex items-center justify-center relative overflow-hidden p-1">
            <div 
              className="shadow-xl rounded-lg overflow-hidden transition-all duration-300 bg-white"
              style={{ 
                width: `${selectedTemplate?.template.canvas.width || 400}px`,
                height: `${selectedTemplate?.template.canvas.height || 600}px`,
                transform: `scale(${optimalScale})`, 
                transformOrigin: 'center',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <BuilderTemplateRenderer 
                template={selectedTemplate.template}
                components={selectedTemplate.template.defaultComponents || []}
                product={currentProduct}
                isPreview={!isEditModeActive}
                scale={1}
                productChanges={productChanges}
                enableInlineEdit={isEditModeActive}
                onEditField={handleFieldEdit}
                onPendingChange={handlePendingChange}
              />
            </div>
          </div>
        </>
      );
    }

    // CASO 2: Familia seleccionada, pero no plantilla -> Renderizar la grilla de plantillas
    if (selectedFamily) {
      return (
        <TemplateGrid
          templates={filteredTemplates}
          selectedTemplate={selectedTemplate || null}
          onTemplateSelect={(template) => onTemplateSelect?.(template)}
          isLoading={isLoadingTemplates}
        />
      );
    }
    
    // CASO 3: Estado inicial, nada seleccionado
    return (
      <div className="h-full flex flex-col items-center justify-center text-center bg-gray-100 rounded-lg p-8">
        <LayoutDashboard className="w-20 h-20 text-gray-300 mb-6" />
        <h3 className="text-2xl font-bold text-gray-700 mb-2">Selecciona una familia</h3>
        <p className="text-gray-500 max-w-sm">
          Elige una familia de plantillas desde el panel izquierdo para ver todos los modelos disponibles y comenzar a crear tu cartel.
        </p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-lg shadow-inner">
      <div className="flex-1 flex flex-col p-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Modal de confirmación de cambios */}
      <ProductChangesModal
        isOpen={showChangesModal}
        onClose={() => setShowChangesModal(false)}
        onConfirmPrint={handleConfirmPrintWithChanges}
      />

      {/* Contenedor oculto para impresión */}
      <div className="print-container-wrapper">
        <PrintContainer
          ref={printContainerRef}
          templates={selectedProducts.map(productId => {
            const product = productos.find(p => p.id === productId);
            return product && selectedTemplate ? {
              product,
              template: selectedTemplate.template
            } : null;
          }).filter(Boolean) as Array<{ product: Product; template: any }>}
          productChanges={productChanges}
        />
        
        {/* Estilos adicionales para impresión */}
        <style type="text/css">
          {`
            @media screen {
              .print-container-wrapper {
                display: none !important;
              }
            }
            
            @media print {
              /* Ocultar todo excepto el contenido de impresión */
              body * {
                visibility: hidden;
              }
              
              .print-only, .print-only * {
                visibility: visible;
              }
              
              .print-only {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
              }
              
              /* Configuración de página dinámica */
              @page {
                margin: 0;
                size: A4 ${printOrientation};
              }
              
              /* Saltos de página y centrado */
              .page-break {
                page-break-after: always;
                page-break-inside: avoid;
                width: 100vw;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                padding: 1cm;
              }
              
              .page-break:last-child {
                page-break-after: avoid;
              }

              /* Contenedor del renderer con escalado */
              .renderer-print-container {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              /* Asegurar que el contenido se vea bien */
              .print-only img {
                max-width: 100% !important;
                height: auto !important;
                object-fit: contain;
              }
              
              .print-only text {
                font-family: Arial, sans-serif !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}; 