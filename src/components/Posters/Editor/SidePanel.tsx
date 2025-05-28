import React from 'react';
import { CreditCard } from 'lucide-react';
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
  selectMaxProductsReached,
  selectSelectedFinancing,
} from '../../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../../store';

import { PlantillaSelect } from './Selectors/PlantillaSelect';
import { ComboSelect } from './Selectors/ComboSelect';
import { ProductSelect } from './Selectors/ProductSelect';
import PaperFormatSelect from './Selectors/PaperFormatSelect';
import { products, type Product } from '../../../data/products';
import { FinancingOption } from '../../../types/financing';

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
  categories: SelectOption[];
  // Funciones que aún vienen del padre
  setIsFinancingModalOpen: (value: boolean) => void;
  setSelectedProduct: (value: Product | null) => void; 
}

export const SidePanel: React.FC<SidePanelProps> = ({
  plantillasDisponibles,
  combosDisponibles,
  categories,
  setIsFinancingModalOpen,
  setSelectedProduct
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Obtener estado del store de Redux
  const plantillaSeleccionada = useSelector(selectPlantillaSeleccionada);
  const comboSeleccionado = useSelector(selectComboSeleccionado);
  const selectedCategory = useSelector(selectSelectedCategory);
  const selectedProductIds = useSelector(selectSelectedProducts);
  const formatoSeleccionado = useSelector(selectFormatoSeleccionado);
  const maxProductsReached = useSelector(selectMaxProductsReached);
  const selectedFinancing = useSelector(selectSelectedFinancing);

  // Convertir IDs de productos a objetos Product para el ProductSelect
  const selectedProductsForSelect: Product[] = React.useMemo(() => 
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

  const handleCategoryChange = (option: SelectOption | null) => {
    dispatch(setSelectedCategory(option ? option.value : ""));
    setSelectedProduct(null); // Este sigue siendo un prop local por ahora
  };

  const handleProductSelectionChange = (selectedOptions: Product[] | Product | null) => {
    if (Array.isArray(selectedOptions)) {
      // Eliminar límite de productos
      dispatch(setSelectedProducts(selectedOptions.map(s => s.id)));
      // Establecer el primer producto como producto único para compatibilidad
      if (selectedOptions.length > 0) {
        setSelectedProduct(selectedOptions[0]);
      } else {
        setSelectedProduct(null);
      }
    } else if (selectedOptions) {
      // Si se pasa un producto único, agregarlo a la lista
      dispatch(setSelectedProducts([selectedOptions.id]));
      setSelectedProduct(selectedOptions);
    } else {
      dispatch(setSelectedProducts([]));
      setSelectedProduct(null);
    }
  };

  const handleFormatoChange = (option: PaperFormatOption | null) => {
    dispatch(setFormatoSeleccionado(option));
  };

  return (
    <div className="col-span-3 h-full flex flex-col">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-200 h-full flex flex-col w-full">
        
        <div className="border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Familia:
          </label>
          <PlantillaSelect
            value={plantillaSeleccionada}
            onChange={handlePlantillaChange}
            opciones={plantillasDisponibles}
            className="bg-white/10 border-white/20 text-black placeholder:text-white/50 focus:border-white/30"
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plantilla:
          </label>
          <ComboSelect
            value={comboSeleccionado}
            onChange={handleComboChange}
            options={combosDisponibles}
            placeholder="Seleccionar plantilla..."
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categorías:
          </label>
          <ComboSelect
            value={categories.find(cat => cat.value === selectedCategory) || null}
            onChange={handleCategoryChange}
            options={categories}
            placeholder="Seleccionar categoría..."
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Productos (seleccione los que necesite)
            </label>
            <span className="text-xs text-gray-500 mb-1">
              {selectedProductIds.length} seleccionado{selectedProductIds.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <ProductSelect
            products={selectedCategory ? products.filter(p => p.category === selectedCategory) : products}
            value={selectedProductsForSelect.length > 0 ? selectedProductsForSelect.map(p => ({ label: p.name, value: p })) : null}
            onChange={(selected) => {
              if (Array.isArray(selected)) {
                handleProductSelectionChange(selected.map(s => s.value as Product));
              } else {
                handleProductSelectionChange(selected ? (selected.value as Product) : null);
              }
            }}
            isMulti={true}
            className="w-full"
            placeholder="Buscar productos..."
          />
          
          {selectedProductIds.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {selectedProductIds.length} producto(s) seleccionado(s)
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"></label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFinancingModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                <CreditCard className="w-5 h-5 text-gray-500" />
                <span>
                  {selectedFinancing.length > 0 ? `${selectedFinancing.length} financiación${
                        selectedFinancing.length > 1 ? "es" : ""
                      }` : "Ver financiación"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño de papel:
          </label>
          <PaperFormatSelect
            value={formatoSeleccionado}
            onChange={handleFormatoChange}
          />
        </div>
      </div>
    </div>
  );
}; 