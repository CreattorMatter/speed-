import React from 'react';
import { Trash2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';

// Importar selectores y acciones de Redux
import {
  selectModeloSeleccionado,
  selectSingleSelectedProduct,
  selectSelectedProductObjects,
  selectSelectedFinancing,
  selectFormatoSeleccionado,
  setModeloSeleccionado,
  removeProduct,
  removeAllProducts,
  trackProductChange
} from '../../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../../store';

import { type Product } from '../../../data/products';
import { type TemplateModel } from '../../../constants/posters/templates';
import { DeleteProductModal } from './DeleteProductModal';
import { PrintButtonAdvanced } from './PrintButtonAdvanced';
import { 
  getTemplateFields, 
  getAvailableFields
} from '../../../utils/templateFieldDetector';

// Importar hooks personalizados
import { useProductData } from './hooks/useProductData';
import { useTemplateLogic } from './hooks/useTemplateLogic';

// Importar componentes modulares
import { ProductPreview } from './components/ProductPreview';
import { EditPanel } from './components/EditPanel';
import { PreviewHeader } from './components/PreviewHeader';
import { TemplateSelectorView } from './components/TemplateSelectorView';

// Tipos específicos para el componente
interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  plan: string;
}

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
  
  // Usar hooks personalizados
  const { getEditedProduct, getCurrentProductValue, generateTemplateProps } = useProductData();
  const { 
    plantillaSeleccionada, 
    filteredModelos, 
    getPromoTypeFromModelId 
  } = useTemplateLogic(PLANTILLA_MODELOS);
  
  // Obtener estado de Redux
  const modeloSeleccionado = useSelector(selectModeloSeleccionado);
  const selectedProduct = useSelector(selectSingleSelectedProduct);
  const selectedProducts = useSelector(selectSelectedProductObjects);
  const selectedFinancing = useSelector(selectSelectedFinancing);
  const formatoSeleccionado = useSelector(selectFormatoSeleccionado);

  // Obtener configuración de campos para la plantilla actual
  const templateFields = getTemplateFields(
    plantillaSeleccionada?.value || '',
    selectedProducts.length > 0 ? 'combo' : undefined
  );
  const availableFields = getAvailableFields(templateFields);

  // Estados locales
  const [expandedProductIndex, setExpandedProductIndex] = React.useState<number | null>(null);
  const [isEditPanelVisible, setIsEditPanelVisible] = React.useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  const [refreshKeyState, setRefreshKeyState] = React.useState(0);

  // Handlers
  const handleProductEdit = (productId: string, field: string, newValue: string | number) => {
    const product = selectedProducts.find(p => p.id === productId);
    if (!product) return;

    const editedProduct = getEditedProduct(productId);
    const currentValue = getCurrentProductValue(product, field);
    
    dispatch(trackProductChange({
      productId,
      productName: product.name,
      field,
      originalValue: editedProduct?.changes.find(c => c.field === field)?.originalValue ?? currentValue,
      newValue
    }));

    if (onUpdateProduct) {
      onUpdateProduct(productId, { [field]: newValue });
    }

    setRefreshKeyState(prev => prev + 1);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      dispatch(removeProduct(productToDelete.id));
      
      if (selectedProducts.length === 1) {
        setExpandedProductIndex(null);
      } else if (expandedProductIndex !== null && expandedProductIndex >= selectedProducts.length - 1) {
        setExpandedProductIndex(Math.max(0, selectedProducts.length - 2));
      }
    }
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // Función para obtener el componente de plantilla
  const getTemplateComponent = (product: Product) => {
    if (!modeloSeleccionado || !plantillaSeleccionada?.value) return null;
    
    const modelo = filteredModelos.find(m => m.id === modeloSeleccionado);
    if (!modelo) return null;
    
    return templateComponents[modelo.componentPath] || null;
  };

  // Determinar qué vista mostrar
  const renderContent = () => {
    // 1. Sin plantilla seleccionada
    if (!plantillaSeleccionada) {
      return (
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
      );
    }

    // 2. Sin modelos disponibles
    if (filteredModelos.length === 0) {
      return (
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
      );
    }

    // 3. Vista de producto expandido
    if (expandedProductIndex !== null && selectedProducts[expandedProductIndex]) {
      const product = selectedProducts[expandedProductIndex];
      const templateComponent = getTemplateComponent(product);
      const templateProps = generateTemplateProps(product, selectedFinancing);
      const editedChanges = getEditedProduct(product.id);
      
      return (
        <div className="w-full h-full flex flex-col">
          <PreviewHeader
            viewType="expanded-product"
            product={product}
            productIndex={expandedProductIndex}
            totalProducts={selectedProducts.length}
            modelName={getPromoTypeFromModelId(modeloSeleccionado || '')}
            onBack={() => setExpandedProductIndex(null)}
            onPrevious={() => setExpandedProductIndex(Math.max(0, expandedProductIndex - 1))}
            onNext={() => setExpandedProductIndex(Math.min(selectedProducts.length - 1, expandedProductIndex + 1))}
            isEditPanelVisible={isEditPanelVisible}
            onToggleEditPanel={() => setIsEditPanelVisible(!isEditPanelVisible)}
            onDelete={() => handleDeleteClick(product)}
          />

          <div className="flex-1 flex overflow-hidden">
            {isEditPanelVisible && (
              <EditPanel
                product={product}
                availableFields={availableFields}
                getCurrentProductValue={getCurrentProductValue}
                onEditField={handleProductEdit}
                editedChanges={editedChanges}
              />
            )}
            
            <div className="flex-1 flex items-center justify-center p-6">
              <ProductPreview
                product={product}
                templateComponent={templateComponent}
                templateProps={templateProps}
                refreshKey={refreshKeyState}
                className="w-full h-full flex items-center justify-center max-w-[900px] max-h-[800px]"
                plantillaFamily={plantillaSeleccionada?.value}
                modeloSeleccionado={modeloSeleccionado}
              />
            </div>
          </div>
        </div>
      );
    }

    // 4. Producto único seleccionado
    if (selectedProducts.length === 1 && selectedProduct) {
      const templateComponent = getTemplateComponent(selectedProduct);
      const templateProps = generateTemplateProps(selectedProduct, selectedFinancing);
      const editedChanges = getEditedProduct(selectedProduct.id);
      
      return (
        <div className="w-full h-full flex flex-col">
          <PreviewHeader
            viewType="single-product"
            modelName={getPromoTypeFromModelId(modeloSeleccionado || '')}
            filteredModelosLength={filteredModelos.length}
            onBack={() => dispatch(setModeloSeleccionado(null))}
            isEditPanelVisible={isEditPanelVisible}
            onToggleEditPanel={() => setIsEditPanelVisible(!isEditPanelVisible)}
          />

          <div className="flex-1 flex overflow-hidden">
            {isEditPanelVisible && (
              <EditPanel
                product={selectedProduct}
                availableFields={availableFields}
                getCurrentProductValue={getCurrentProductValue}
                onEditField={handleProductEdit}
                editedChanges={editedChanges}
              />
            )}
            
            <div className="flex-1 flex items-center justify-center p-6">
              <ProductPreview
                product={selectedProduct}
                templateComponent={templateComponent}
                templateProps={templateProps}
                refreshKey={refreshKeyState}
                className="w-full h-full flex items-center justify-center max-w-[900px] max-h-[800px]"
                plantillaFamily={plantillaSeleccionada?.value}
                modeloSeleccionado={modeloSeleccionado}
              />
            </div>
          </div>
        </div>
      );
    }

    // 5. Múltiples productos
    if (selectedProducts.length > 1) {
      return (
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg">
            <button
              onClick={() => dispatch(setModeloSeleccionado(null))}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm text-gray-700">Volver</span>
            </button>
            
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-gray-800">
                {selectedProducts.length} productos seleccionados
              </div>
              <div className="text-sm text-gray-600">
                {getPromoTypeFromModelId(modeloSeleccionado || '')}
              </div>
            </div>
            
            <button
              onClick={() => dispatch(removeAllProducts())}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-md"
              title="Eliminar todos los productos"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto">
            {selectedProducts.map((product, index) => {
              const templateComponent = getTemplateComponent(product);
              const templateProps = generateTemplateProps(product, selectedFinancing);
              
              return (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer relative"
                  onClick={() => setExpandedProductIndex(index)}
                >
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(product);
                      }}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      title="Eliminar producto"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-sm font-medium text-gray-800 mb-2 pr-8">
                    {product.name}
                  </div>
                  
                  <div className="h-32 mb-2">
                    <ProductPreview
                      product={product}
                      templateComponent={templateComponent}
                      templateProps={templateProps}
                      refreshKey={refreshKeyState}
                      className="w-full h-full flex items-center justify-center"
                      scale="transform scale-[0.3]"
                      plantillaFamily={plantillaSeleccionada?.value}
                      modeloSeleccionado={modeloSeleccionado}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    SKU: {product.sku} | ${product.price}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 6. Selector de plantillas (sin productos, con o sin modelo seleccionado)
    if (modeloSeleccionado) {
      const modelo = filteredModelos.find(m => m.id === modeloSeleccionado);
      const Component = modelo ? templateComponents[modelo.componentPath] : null;
      
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
          <PreviewHeader
            viewType="template-selection"
            modelName={getPromoTypeFromModelId(modelo?.id || '')}
            filteredModelosLength={filteredModelos.length}
            onBack={() => dispatch(setModeloSeleccionado(null))}
          />

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Vista previa:</span> Selecciona productos para personalizar la plantilla
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <ProductPreview
              product={exampleProduct}
              templateComponent={Component}
              templateProps={generateTemplateProps(exampleProduct, selectedFinancing)}
              refreshKey={refreshKeyState}
              className="w-full h-full flex items-center justify-center max-w-[900px] max-h-[800px]"
              plantillaFamily={plantillaSeleccionada?.value}
              modeloSeleccionado={modeloSeleccionado}
            />
          </div>
        </div>
      );
    }

    // 7. Grid de selección de plantillas
    return (
      <TemplateSelectorView
        filteredModelos={filteredModelos}
        templateComponents={templateComponents}
        onSelectModelo={(modeloId) => dispatch(setModeloSeleccionado(modeloId))}
        generateTemplateProps={(product) => generateTemplateProps(product, selectedFinancing)}
        getPromoTypeFromModelId={getPromoTypeFromModelId}
        refreshKey={refreshKeyState}
      />
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 border border-gray-200 flex flex-1 overflow-hidden max-h-full lg:max-h-[800px] w-full">
        <div className="w-full h-full overflow-y-auto scrollbar-hide">
          {renderContent()}
        </div>
      </div>

      {/* Botón de impresión - solo si hay productos seleccionados y modelo */}
      {selectedProducts.length > 0 && modeloSeleccionado && (
        <div className="mt-4">
          <PrintButtonAdvanced 
            templateComponents={templateComponents}
            PLANTILLA_MODELOS={PLANTILLA_MODELOS}
            getCurrentProductValue={getCurrentProductValue}
            selectedProducts={selectedProducts}
            modeloSeleccionado={modeloSeleccionado}
            formatoSeleccionado={formatoSeleccionado}
            selectedFinancing={selectedFinancing}
          />
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteProductModal
        isOpen={deleteModalOpen}
        product={productToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};