import React, { useState, useEffect, useMemo } from "react";

// Hooks personalizados
import { usePosterState } from "../../hooks/usePosterState";
import { usePosterActions } from "../../hooks/usePosterActions";

// Componentes modulares
import { PosterEditorHeader } from "./Editor/PosterEditorHeader";
import { SidePanel } from "./Editor/SidePanel";
import { PreviewArea } from "./Editor/PreviewArea";
import { SearchModal } from "./Editor/SearchModal";

// Modales existentes
import { ProductSelectorModal } from "../Products/ProductSelectorModal";
import { SendingModal } from "./SendingModal";
import { PosterModal } from "./PosterModal";
import { FinancingModal } from "./FinancingModal";
import { TemplateSelect } from "./Editor/Selectors/TemplateSelect";

// Proveedores y utilidades
import { Header } from "../shared/Header";
import { HeaderProvider } from "../shared/HeaderProvider";
import { LoadingModal } from "../LoadingModal";

// Datos y constantes
import { COMPANIES } from "../../data/companies";
import { products, type Product } from "../../data/products";
import { PROMOTIONS, PLANTILLA_MODELOS, loadTemplateComponent, type TemplateModel } from "@/constants/posters";
import { getCombosPorPlantilla, getPlantillasPorCombo } from "@/constants/posters/plantillaCombos";

// Tipos específicos para las props del componente
interface InitialPromotion {
  id: string;
  [key: string]: unknown;
}

interface PosterEditorProps {
  onBack: () => void;
  onLogout: () => void;
  initialProducts?: string[];
  initialPromotion?: InitialPromotion;
  userEmail: string;
  userName: string;
}

// Extraer categorías únicas de los productos
const CATEGORIES = Array.from(new Set(products.map((p) => p.category))).map(
  (cat) => ({ label: cat, value: cat })
);

export const PosterEditor: React.FC<PosterEditorProps> = ({
  onBack,
  onLogout,
  initialProducts = [],
  initialPromotion,
  userEmail,
  userName,
}) => {
  // Estado centralizado
  const state = usePosterState(initialProducts, initialPromotion);
  const actions = usePosterActions(state);

  // Estados locales para componentes
  const [templateComponents, setTemplateComponents] = useState<Record<string, React.ComponentType<unknown>>>({});

  // Datos computados
  const selectedPromotion = PROMOTIONS.find((p) => p.id === state.promotion);
  const companyDetails = COMPANIES.find((c) => c.id === state.company);
  const empresaId = companyDetails?.empresaId || 0;
    
  // Filtrar combos y plantillas disponibles
  const combosDisponibles = useMemo(() => {
    return getCombosPorPlantilla(state.plantillaSeleccionada?.value);
  }, [state.plantillaSeleccionada]);
  
  const plantillasDisponibles = useMemo(() => {
    return getPlantillasPorCombo(state.comboSeleccionado?.value);
  }, [state.comboSeleccionado]);

  // Helper para convertir IDs a Products
  const getProductsFromIds = (productIds: string[]): Product[] => {
    return productIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  };

  // Helper para manejar selección de producto desde modal
  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
          if (product) {
      actions.handleSelectProduct(product);
    }
  };

  // Handlers específicos
  const handleSearch = (term: string) => {
    state.setSearchTerm(term);
    if (!term.trim()) {
      state.setSearchResults(state.allPosters);
      return;
    }
    const filtered = state.allPosters.filter((poster) =>
      poster.name.toLowerCase().includes(term.toLowerCase())
    );
    state.setSearchResults(filtered);
  };

  // Efectos
  useEffect(() => {
    const timer = setTimeout(() => state.setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.setIsLoading]);

  useEffect(() => {
    const loadComponents = async () => {
      try {
        const components: Record<string, React.ComponentType<unknown>> = {};
        const uniquePaths = new Set<string>();
        
        Object.values(PLANTILLA_MODELOS).forEach((models) => {
          (models as { componentPath: string }[]).forEach((model) => uniquePaths.add(model.componentPath));
        });

        for (const path of uniquePaths) {
          const component = await loadTemplateComponent(path);
          if (component) {
            components[path] = component;
          }
        }

        setTemplateComponents(components);
      } catch (error) {
        console.error("Error al cargar los componentes:", error);
      }
    };

    loadComponents();
  }, []);

  return (
    <HeaderProvider userEmail={userEmail} userName={userName}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
        <Header onBack={onBack} onLogout={onLogout} />
        
        <div className="poster-editor-container min-h-screen w-full flex flex-col bg-white">
          <main className="pt-10 px-6 pb-6 max-w-7xl mx-auto space-y-6 min-h-[1000px]">
            
            <PosterEditorHeader onSearchPosters={actions.handleSearchPosters} />

            <div className="grid grid-cols-10 gap-6 h-full">
              <SidePanel
                plantillaSeleccionada={state.plantillaSeleccionada}
                setPlantillaSeleccionada={state.setPlantillaSeleccionada}
                comboSeleccionado={state.comboSeleccionado}
                setComboSeleccionado={state.setComboSeleccionado}
                selectedCategory={state.selectedCategory}
                setSelectedCategory={state.setSelectedCategory}
                selectedProducts={getProductsFromIds(state.selectedProducts)}
                handleSelectProduct={actions.handleSelectProduct}
                maxProductsReached={state.maxProductsReached}
                setIsFinancingModalOpen={state.setIsFinancingModalOpen}
                selectedFinancing={state.selectedFinancing}
                formatoSeleccionado={state.formatoSeleccionado}
                setFormatoSeleccionado={state.setFormatoSeleccionado}
                plantillasDisponibles={plantillasDisponibles}
                combosDisponibles={combosDisponibles}
                categories={CATEGORIES}
                setSelectedProduct={state.setSelectedProduct}
              />

              <PreviewArea
                templateComponents={templateComponents}
                plantillaSeleccionada={state.plantillaSeleccionada}
                comboSeleccionado={state.comboSeleccionado}
                modeloSeleccionado={state.modeloSeleccionado}
                setModeloSeleccionado={state.setModeloSeleccionado}
                selectedProduct={state.selectedProduct}
                selectedProducts={getProductsFromIds(state.selectedProducts)}
                selectedFinancing={state.selectedFinancing}
                PLANTILLA_MODELOS={PLANTILLA_MODELOS as Record<string, TemplateModel[]>}
                onRemoveProduct={actions.handleRemoveProduct}
              />
            </div>

            {/* Modales */}
            <ProductSelectorModal
              isOpen={state.isProductSelectorOpen}
              onClose={() => state.setIsProductSelectorOpen(false)}
              products={
                state.selectedCategory === "Todos" || !state.selectedCategory
                  ? products
                  : products.filter((p) => p.category === state.selectedCategory)
              }
              selectedProducts={state.selectedProducts}
              onSelectProduct={handleProductSelect}
              category={state.selectedCategory}
            />

            <SendingModal
              isOpen={state.isSendingModalOpen}
              onClose={() => state.setIsSendingModalOpen(false)}
              productsCount={state.selectedProducts.length}
              empresaId={empresaId}
            />

            <PosterModal
              isOpen={!!state.selectedPoster}
              onClose={() => state.setSelectedPoster(null)}
              product={state.selectedPoster!}
              promotion={selectedPromotion}
              company={companyDetails}
              showLogo={state.showLogo}
            />

            <FinancingModal
              isOpen={state.isFinancingModalOpen}
              onClose={() => state.setIsFinancingModalOpen(false)}
              onSelect={state.setSelectedFinancing}
            />

            <TemplateSelect
              isOpen={state.isTemplateModalOpen}
              onClose={() => state.setIsTemplateModalOpen(false)}
              value={state.selectedTemplate}
              onChange={state.setSelectedTemplate}
            />

            <SearchModal
              isOpen={state.isSearchModalOpen}
              onClose={() => state.setIsSearchModalOpen(false)}
              searchTerm={state.searchTerm}
              onSearch={handleSearch}
              searchResults={state.searchResults}
              onPosterSelect={actions.handlePosterSelect}
            />
          </main>
        </div>
      </div>

      <LoadingModal isOpen={state.isLoading} />
    </HeaderProvider>
  );
};