import React, { useEffect, useState } from 'react';
import { CreditCard, ShoppingCart, Package, Filter, Settings, Printer } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

// Importar acciones y selectores del slice de poster
import {
  setPlantillaSeleccionada,
  setComboSeleccionado,
  setSelectedCategory,
  setSelectedProducts,
  setFormatoSeleccionado,
  toggleProductSelection,
  trackProductChange,
  selectPlantillaSeleccionada,
  selectComboSeleccionado,
  selectSelectedCategory,
  selectSelectedProducts,
  selectFormatoSeleccionado,
  selectSelectedFinancing,
  setIsFinancingModalOpen,
  selectPrintSettings,
  actualizarPrintSettings,
} from '../../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../../store';

import { PlantillaSelect } from './Selectors/PlantillaSelect';
import { ComboSelect } from './Selectors/ComboSelect';
import { ProductSelect } from './Selectors/ProductSelect';
import PaperFormatSelect from './Selectors/PaperFormatSelect';
import { products, type Product } from '../../../data/products';
import { FinancingOption } from '../../../types/financing';
import { ProductSelectionModal } from './ProductSelectionModal';
import { type PrintSettings } from '../../../types/index';

// Tipos que se mantienen
interface PaperFormatOption {
  label: string;
  value: string;
  width: string;
  height: string;
}
interface SelectOption {
  value: string;
  label: string;
}

// Props que aún necesitamos del componente padre
interface SidePanelProps {
  // Props que se mantienen (lógica local o computada en el padre)
  plantillasDisponibles: SelectOption[];
  combosDisponibles: SelectOption[];
  // Funciones que aún vienen del padre
  setIsFinancingModalOpen: (isOpen: boolean) => void;
  setSelectedProduct: (product: Product | null) => void; 
}

export const SidePanel: React.FC<SidePanelProps> = ({
  plantillasDisponibles,
  combosDisponibles,
  setIsFinancingModalOpen,
  setSelectedProduct
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Estado para el modal de selección de productos
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Obtener estado del store de Redux
  const plantillaSeleccionada = useSelector(selectPlantillaSeleccionada);
  const comboSeleccionado = useSelector(selectComboSeleccionado);
  const selectedCategory = useSelector(selectSelectedCategory);
  const selectedProductIds = useSelector(selectSelectedProducts);
  const formatoSeleccionado = useSelector(selectFormatoSeleccionado);
  const selectedFinancing = useSelector(selectSelectedFinancing);
  const printSettings = useSelector(selectPrintSettings);

  // Convertir IDs de productos a objetos Product para el modal
  const selectedProductsForModal: Product[] = React.useMemo(() => 
    selectedProductIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[]
  , [selectedProductIds]);

  // Manejadores que despachan acciones de Redux
  const handlePlantillaChange = (option: SelectOption | null) => {
    dispatch(setPlantillaSeleccionada(option));
    if (option && comboSeleccionado && !combosDisponibles.some(c => c.value === comboSeleccionado.value)) {
      dispatch(setComboSeleccionado(null));
    }
  };

  const handleComboChange = (option: SelectOption | null) => {
    dispatch(setComboSeleccionado(option));
  };

  // Handler para el modal de selección de productos
  const handleProductModalConfirm = (selectedProducts: Product[]) => {
    dispatch(setSelectedProducts(selectedProducts.map(p => p.id)));
    setIsProductModalOpen(false);
  };

  const handleRemoveProduct = (productId: string) => {
    const newSelectedProducts = selectedProductIds.filter(id => id !== productId);
    dispatch(setSelectedProducts(newSelectedProducts));
  };

  const handleClearAllProducts = () => {
    dispatch(setSelectedProducts([]));
  };

  const handleFormatoChange = (option: PaperFormatOption | null) => {
    dispatch(setFormatoSeleccionado(option));
  };

  const handlePrintSettingsChange = (settings: PrintSettings) => {
    dispatch(actualizarPrintSettings(settings));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 space-y-3 xs:space-y-4 sm:space-y-6 border border-gray-200 h-full flex flex-col w-full">
        
        <div className="border-gray-200 pt-3 xs:pt-4 sm:pt-6">
          <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
            Familia:
          </label>
          <PlantillaSelect
            value={plantillaSeleccionada}
            onChange={handlePlantillaChange}
            opciones={plantillasDisponibles}
            className="bg-white/10 border-white/20 text-black placeholder:text-white/50 focus:border-white/30"
          />
        </div>

        <div className="border-t border-gray-200 pt-3 xs:pt-4 sm:pt-6">
          <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
            Plantilla:
          </label>
          <ComboSelect
            value={comboSeleccionado}
            onChange={handleComboChange}
            options={combosDisponibles}
            placeholder="Seleccionar plantilla..."
          />
        </div>

        <div className="mb-3 xs:mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs xs:text-sm font-medium text-gray-700">
              <Package className="w-4 h-4 inline mr-1" />
              Productos
            </label>
            <span className="text-xxs xs:text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {selectedProductIds.length} seleccionado{selectedProductIds.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="w-full flex items-center justify-between p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">
                  {selectedProductIds.length > 0 
                    ? `Gestionar ${selectedProductIds.length} producto${selectedProductIds.length !== 1 ? 's' : ''}`
                    : 'Seleccionar Productos'
                  }
                </div>
                <div className="text-xs text-gray-500">
                  {selectedProductIds.length > 0 
                    ? 'Click para modificar la selección'
                    : 'Buscar y seleccionar múltiples productos'
                  }
                </div>
              </div>
            </div>
            <Filter className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </button>
          
          {selectedProductIds.length > 0 && (
            <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
              {selectedProductsForModal.slice(0, 3).map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate" title={product.name}>
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${product.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveProduct(product.id);
                    }}
                    className="w-5 h-5 text-gray-400 hover:text-red-500 flex items-center justify-center rounded transition-colors"
                    title={`Eliminar ${product.name}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {selectedProductIds.length > 3 && (
                <div className="text-xs text-gray-500 text-center py-1">
                  +{selectedProductIds.length - 3} producto{selectedProductIds.length - 3 !== 1 ? 's' : ''} más...
                </div>
              )}
              
              {selectedProductIds.length > 1 && (
                <button
                  onClick={handleClearAllProducts}
                  className="w-full text-xs text-red-600 hover:text-red-700 py-1 text-center border border-red-200 rounded hover:bg-red-50 transition-colors"
                >
                  Limpiar todo ({selectedProductIds.length})
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 xs:gap-4">
          <div>
            <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1"></label>
            <div className="flex items-center gap-2 xs:gap-3">
              <button
                onClick={() => setIsFinancingModalOpen(true)}
                className="flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1.5 xs:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-xs xs:text-sm"
              >
                <CreditCard className="w-4 h-4 xs:w-5 xs:h-5 text-gray-500" />
                <span className="truncate">
                  {selectedFinancing.length > 0 ? `${selectedFinancing.length} financiación${
                        selectedFinancing.length > 1 ? "es" : ""
                      }` : "Ver financiación"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 xs:pt-4 sm:pt-6">
          <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
            <Settings className="w-4 h-4 inline mr-1" />
            Configuración de impresión:
          </label>
          
          <div className="space-y-3 bg-gray-50 p-3 rounded-lg border">
            {/* Tamaño de página */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tamaño de página
              </label>
              <select
                value={printSettings.pageSize}
                onChange={(e) => handlePrintSettingsChange({
                  ...printSettings,
                  pageSize: e.target.value as 'A4' | 'A3' | 'Letter' | 'Custom'
                })}
                className="w-full p-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="A4">A4 (210×297mm)</option>
                <option value="A3">A3 (297×420mm)</option>
                <option value="Letter">Letter (216×279mm)</option>
              </select>
            </div>

            {/* Orientación */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Orientación
              </label>
              <div className="flex gap-2">
                <label className="flex items-center flex-1">
                  <input
                    type="radio"
                    value="portrait"
                    checked={printSettings.orientation === 'portrait'}
                    onChange={(e) => handlePrintSettingsChange({
                      ...printSettings,
                      orientation: e.target.value as 'portrait' | 'landscape'
                    })}
                    className="mr-1 scale-75"
                  />
                  <span className="text-xs">Vertical</span>
                </label>
                <label className="flex items-center flex-1">
                  <input
                    type="radio"
                    value="landscape"
                    checked={printSettings.orientation === 'landscape'}
                    onChange={(e) => handlePrintSettingsChange({
                      ...printSettings,
                      orientation: e.target.value as 'portrait' | 'landscape'
                    })}
                    className="mr-1 scale-75"
                  />
                  <span className="text-xs">Horizontal</span>
                </label>
              </div>
            </div>

            {/* Opciones adicionales */}
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printSettings.pageBreakBetweenProducts}
                  onChange={(e) => handlePrintSettingsChange({
                    ...printSettings,
                    pageBreakBetweenProducts: e.target.checked
                  })}
                  className="mr-2 scale-75"
                />
                <span className="text-xs text-gray-700">
                  Salto de página entre productos
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printSettings.includeProductInfo}
                  onChange={(e) => handlePrintSettingsChange({
                    ...printSettings,
                    includeProductInfo: e.target.checked
                  })}
                  className="mr-2 scale-75"
                />
                <span className="text-xs text-gray-700">
                  Incluir información adicional
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onConfirm={handleProductModalConfirm}
        initialSelectedProducts={selectedProductsForModal}
        title="Seleccionar Productos para Carteles"
      />
    </div>
  );
}; 