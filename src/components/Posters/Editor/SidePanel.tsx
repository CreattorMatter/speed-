import React from 'react';
import { CreditCard } from 'lucide-react';
import { PlantillaSelect } from './Selectors/PlantillaSelect';
import { ComboSelect } from './Selectors/ComboSelect';
import { ProductSelect } from './Selectors/ProductSelect';
import PaperFormatSelect from './Selectors/PaperFormatSelect';
import { products, type Product } from '../../../data/products';
import { FinancingOption } from '../../../types/financing';

// Importar tipo de papel
interface PaperFormatOption {
  label: string;
  value: string;
  width: string;
  height: string;
}

// Tipos específicos para opciones de select
interface SelectOption {
  value: string;
  label: string;
}

interface SidePanelProps {
  plantillaSeleccionada: SelectOption | null;
  setPlantillaSeleccionada: (value: SelectOption | null) => void;
  comboSeleccionado: SelectOption | null;
  setComboSeleccionado: (value: SelectOption | null) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedProducts: Product[];
  handleSelectProduct: (product: Product | Product[] | null) => void;
  maxProductsReached: boolean;
  setIsFinancingModalOpen: (value: boolean) => void;
  selectedFinancing: FinancingOption[];
  formatoSeleccionado: PaperFormatOption | null;
  setFormatoSeleccionado: (value: PaperFormatOption | null) => void;
  plantillasDisponibles: SelectOption[];
  combosDisponibles: SelectOption[];
  categories: SelectOption[];
  setSelectedProduct: (value: Product | null) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  plantillaSeleccionada,
  setPlantillaSeleccionada,
  comboSeleccionado,
  setComboSeleccionado,
  selectedCategory,
  setSelectedCategory,
  selectedProducts,
  handleSelectProduct,
  maxProductsReached,
  setIsFinancingModalOpen,
  selectedFinancing,
  formatoSeleccionado,
  setFormatoSeleccionado,
  plantillasDisponibles,
  combosDisponibles,
  categories,
  setSelectedProduct
}) => {
  return (
    <div className="col-span-3 h-full flex flex-col">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-200 h-full flex flex-col w-full">
        
        {/* Selección de Plantillas */}
        <div className="border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plantillas:
          </label>
          <PlantillaSelect
            value={plantillaSeleccionada}
            onChange={(option) => {
              setPlantillaSeleccionada(option);
              if (option && comboSeleccionado && !combosDisponibles.some(c => c.value === comboSeleccionado.value)) {
                setComboSeleccionado(null);
              }
            }}
            opciones={plantillasDisponibles}
            className="bg-white/10 border-white/20 text-black placeholder:text-white/50 focus:border-white/30"
          />
        </div>

        {/* Selección de Tipo de Promoción */}
        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Promoción:
          </label>
          <ComboSelect
            value={comboSeleccionado}
            onChange={(option) => {
              setComboSeleccionado(option);
              if (option && plantillaSeleccionada && !plantillasDisponibles.some(p => p.value === plantillaSeleccionada.value)) {
                setPlantillaSeleccionada(null);
              }
            }}
            options={combosDisponibles}
            placeholder="Seleccionar tipo de promoción..."
          />
        </div>

        {/* Selección de Categorías */}
        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categorías:
          </label>
          <ComboSelect
            value={categories.find(cat => cat.value === selectedCategory) || null}
            onChange={(option) => {
              setSelectedCategory(option ? option.value : "");
              setSelectedProduct(null);
            }}
            options={categories}
            placeholder="Seleccionar categoría..."
          />
        </div>

        {/* Selección de Productos */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {plantillaSeleccionada?.value === "multiproductos" ||
              plantillaSeleccionada?.value?.includes("multiproductos")
                ? "Productos (seleccione hasta 9)"
                : "Producto"}
            </label>
            {(plantillaSeleccionada?.value === "multiproductos" ||
              plantillaSeleccionada?.value?.includes("multiproductos")) && (
              <span className="text-xs text-gray-500 mb-1">
                {selectedProducts.length}/9{" "}
                {maxProductsReached && "(Máximo alcanzado)"}
              </span>
            )}
          </div>
          
          <ProductSelect
            products={
              selectedCategory
                ? products.filter(p => p.category === selectedCategory)
                : products
            }
            value={
              selectedProducts.length > 0
                ? selectedProducts.map(p => ({ label: p.name, value: p }))
                : null
            }
            onChange={(selected) => {
              if (Array.isArray(selected)) {
                const limitedSelection = selected.slice(0, 9);
                handleSelectProduct(limitedSelection.map(s => s.value));
              } else {
                handleSelectProduct(selected ? selected.value : null);
              }
            }}
            isMulti={
              plantillaSeleccionada?.value === "multiproductos" ||
              plantillaSeleccionada?.value?.includes("multiproductos")
            }
            className="w-full"
            placeholder={
              plantillaSeleccionada?.value === "multiproductos" ||
              plantillaSeleccionada?.value?.includes("multiproductos")
                ? "Buscar productos por nombre o SKU..."
                : "Buscar producto por nombre o SKU..."
            }
          />
          
          {selectedProducts.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {selectedProducts.length} producto(s) seleccionado(s)
              {plantillaSeleccionada?.value === "multiproductos" &&
                selectedProducts.length >= 9 && (
                  <span className="ml-2 text-amber-600 font-medium">
                    (Máximo alcanzado)
                  </span>
                )}
            </div>
          )}
        </div>

        {/* Botón de Financiación */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"></label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFinancingModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 
                rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                <CreditCard className="w-5 h-5 text-gray-500" />
                <span>
                  {selectedFinancing.length > 0
                    ? `${selectedFinancing.length} financiación${
                        selectedFinancing.length > 1 ? "es" : ""
                      }`
                    : "Ver financiación"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Selección de Tamaño de Papel */}
        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño de papel:
          </label>
          <PaperFormatSelect
            value={formatoSeleccionado}
            onChange={setFormatoSeleccionado}
          />
        </div>
      </div>
    </div>
  );
}; 