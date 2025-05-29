import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { type Product } from '../../../../data/products';

interface PreviewHeaderProps {
  // Configuración de vista
  viewType: 'template-selection' | 'single-product' | 'multi-product' | 'expanded-product';
  
  // Datos del producto/modelo
  product?: Product;
  productIndex?: number;
  totalProducts?: number;
  modelName?: string;
  modeloSeleccionado?: string | null;
  filteredModelosLength?: number;
  
  // Controles de navegación
  onBack?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  
  // Controles de panel
  isEditPanelVisible?: boolean;
  onToggleEditPanel?: () => void;
  
  // Controles de eliminación
  onDelete?: () => void;
  
  // Estilos
  className?: string;
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  viewType,
  product,
  productIndex,
  totalProducts,
  modelName,
  modeloSeleccionado,
  filteredModelosLength,
  onBack,
  onPrevious,
  onNext,
  isEditPanelVisible,
  onToggleEditPanel,
  onDelete,
  className = "flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg"
}) => {
  const renderBackButton = () => (
    <button
      onClick={onBack}
      className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      title="Volver"
    >
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="text-sm text-gray-700">Volver</span>
    </button>
  );

  const renderToggleEditPanelButton = () => (
    onToggleEditPanel && (
      <button
        onClick={onToggleEditPanel}
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
    )
  );

  const renderNavigationButtons = () => (
    <div className="flex gap-2">
      <button
        onClick={onPrevious}
        disabled={productIndex === 0}
        className={`p-2 rounded ${
          productIndex === 0 
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
        onClick={onNext}
        disabled={productIndex === (totalProducts || 1) - 1}
        className={`p-2 rounded ${
          productIndex === (totalProducts || 1) - 1
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
  );

  const renderDeleteButton = () => (
    onDelete && (
      <button
        onClick={onDelete}
        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-md"
        title="Eliminar producto"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )
  );

  // Render según el tipo de vista
  switch (viewType) {
    case 'template-selection':
      return (
        <div className={className}>
          <div className="flex items-center space-x-2">
            {renderBackButton()}
            <div className="text-sm text-gray-600">
              {modelName} seleccionado
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {filteredModelosLength} modelo{(filteredModelosLength || 0) !== 1 ? 's' : ''} disponible{(filteredModelosLength || 0) !== 1 ? 's' : ''}
          </div>
        </div>
      );

    case 'single-product':
      return (
        <div className={className}>
          <div className="flex items-center space-x-2">
            {renderBackButton()}
            <div className="text-sm text-gray-600">
              {modelName} seleccionado
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {renderToggleEditPanelButton()}
            <div className="text-xs text-gray-500">
              {filteredModelosLength} modelo{(filteredModelosLength || 0) !== 1 ? 's' : ''} disponible{(filteredModelosLength || 0) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      );

    case 'expanded-product':
      return (
        <div className={className}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al preview
          </button>
          
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-gray-800">
              Producto {(productIndex || 0) + 1} de {totalProducts}
            </div>
            <div className="text-sm text-gray-600">
              {modelName} - {product?.name}
            </div>
            {product && (
              <div className="text-xs text-blue-600 mt-1">
                SKU: {product.sku} | ${product.price}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {renderToggleEditPanelButton()}
            {renderDeleteButton()}
            {renderNavigationButtons()}
          </div>
        </div>
      );

    default:
      return (
        <div className={className}>
          <div>Header por defecto</div>
        </div>
      );
  }
}; 