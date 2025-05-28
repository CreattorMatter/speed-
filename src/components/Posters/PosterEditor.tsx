import React, { useState, useEffect, useMemo } from "react";
import { preloadCriticalImages } from "../../utils/imageUtils";

// Importar hooks de Redux y el slice de poster
import { useSelector, useDispatch } from 'react-redux';
import {
  // Selectores principales
  selectCompany,
  selectPromotion,
  selectSelectedProducts,
  selectSelectedCategory,
  selectShowLogo,
  selectShowPesosCheck,
  selectViewMode,
  
  // Selectores de UI
  selectIsProductSelectorOpen,
  selectIsLoading,
  selectIsSendingModalOpen,
  selectSelectedPoster,
  selectIsFinancingModalOpen,
  selectIsTemplateModalOpen,
  selectIsSearchModalOpen,
  
  // Selectores de formato
  selectSelectedFormat,
  selectShowFormatSelector,
  selectZoom,
  selectCardSize,
  selectIsLandscape,
  
  // Selectores de plantillas
  selectPlantillaSeleccionada,
  selectComboSeleccionado,
  selectSelectedTemplate,
  selectSelectedFinancing,
  selectFormatoSeleccionado,
  selectSelectedProduct,
  selectModeloSeleccionado,
  
  // Selectores de búsqueda
  selectSearchResults,
  selectSearchTerm,
  selectAllPosters,
  
  // Acciones principales
  setCompany,
  setPromotion,
  setSelectedProducts,
  toggleProductSelection,
  setSelectedCategory,
  setShowLogo,
  setShowPesosCheck,
  setViewMode,
  
  // Acciones de UI
  setIsProductSelectorOpen,
  setIsLoading,
  setIsSendingModalOpen,
  setSelectedPoster,
  setIsFinancingModalOpen,
  setIsTemplateModalOpen,
  setIsSearchModalOpen,
  
  // Acciones de formato
  setSelectedFormat,
  setShowFormatSelector,
  setZoom,
  setCardSize,
  setIsLandscape,
  
  // Acciones de plantillas
  setPlantillaSeleccionada,
  setComboSeleccionado,
  setSelectedTemplate,
  setSelectedFinancing,
  setFormatoSeleccionado,
  setSelectedProduct,
  setModeloSeleccionado,
  
  // Acciones de búsqueda
  setSearchResults,
  setSearchTerm,
  setAllPosters,
  
  // Acciones complejas
  removeProduct,
  removeAllProducts,
  initializeWithProducts,
} from '../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../store';

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

export const PosterEditor: React.FC<PosterEditorProps> = ({
  onBack,
  onLogout,
  initialProducts = [],
  initialPromotion,
  userEmail,
  userName,
}) => {
  // Hooks de Redux
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectores principales
  const company = useSelector(selectCompany);
  const promotion = useSelector(selectPromotion);
  const selectedProductIds = useSelector(selectSelectedProducts);
  const selectedCategory = useSelector(selectSelectedCategory);
  const showLogo = useSelector(selectShowLogo);
  const showPesosCheck = useSelector(selectShowPesosCheck);
  const viewMode = useSelector(selectViewMode);
  
  // Selectores de UI
  const isProductSelectorOpen = useSelector(selectIsProductSelectorOpen);
  const isLoading = useSelector(selectIsLoading);
  const isSendingModalOpen = useSelector(selectIsSendingModalOpen);
  const selectedPoster = useSelector(selectSelectedPoster);
  const isFinancingModalOpen = useSelector(selectIsFinancingModalOpen);
  const isTemplateModalOpen = useSelector(selectIsTemplateModalOpen);
  const isSearchModalOpen = useSelector(selectIsSearchModalOpen);
  
  // Selectores de formato
  const selectedFormat = useSelector(selectSelectedFormat);
  const showFormatSelector = useSelector(selectShowFormatSelector);
  const zoom = useSelector(selectZoom);
  const cardSize = useSelector(selectCardSize);
  const isLandscape = useSelector(selectIsLandscape);
  
  // Selectores de plantillas
  const plantillaSeleccionada = useSelector(selectPlantillaSeleccionada);
  const comboSeleccionado = useSelector(selectComboSeleccionado);
  const selectedTemplate = useSelector(selectSelectedTemplate);
  const selectedFinancing = useSelector(selectSelectedFinancing);
  const formatoSeleccionado = useSelector(selectFormatoSeleccionado);
  const selectedProduct = useSelector(selectSelectedProduct);
  const modeloSeleccionado = useSelector(selectModeloSeleccionado);
  
  // Selectores de búsqueda
  const searchResults = useSelector(selectSearchResults);
  const searchTerm = useSelector(selectSearchTerm);
  const allPosters = useSelector(selectAllPosters);

  // Estados locales para componentes
  const [templateComponents, setTemplateComponents] = useState<Record<string, React.ComponentType<unknown>>>({});

  // Datos computados
  const selectedPromotion = PROMOTIONS.find((p) => p.id === promotion);
  const companyDetails = COMPANIES.find((c) => c.id === company);
  const empresaId = companyDetails?.empresaId || 0;
    
  // Filtrar combos y plantillas disponibles (basado en estado de Redux)
  const combosDisponibles = useMemo(() => {
    return getCombosPorPlantilla(plantillaSeleccionada?.value);
  }, [plantillaSeleccionada]);
  
  const plantillasDisponibles = useMemo(() => {
    return getPlantillasPorCombo(comboSeleccionado?.value);
  }, [comboSeleccionado]);

  // Helper para convertir IDs a Products (usa IDs de Redux)
  const getProductsFromIds = (productIds: string[]): Product[] => {
    return productIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  };
  const selectedProductsForPreview = useMemo(() => getProductsFromIds(selectedProductIds), [selectedProductIds]);

  // Handlers que despachan acciones de Redux
  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      // Siempre usar lógica de múltiples productos
      dispatch(toggleProductSelection(product.id));
      
      // Actualizar el producto único para compatibilidad (usar el primero de la lista)
      const currentProducts = selectedProductIds.includes(product.id) 
        ? selectedProductIds.filter(id => id !== product.id)
        : [...selectedProductIds, product.id];
      
      if (currentProducts.length > 0) {
        const firstProduct = products.find(p => p.id === currentProducts[0]);
        if (firstProduct) {
          dispatch(setSelectedProduct(firstProduct));
        }
    } else {
        dispatch(setSelectedProduct(null));
      }
    }
  };

  const handleRemoveProduct = (productId: string) => {
    dispatch(removeProduct(productId));
  };

  const handleRemoveAllProducts = () => {
    dispatch(removeAllProducts());
  };

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    console.log('Actualizando producto:', productId, updates);
    // TODO: Implementar la actualización real del producto en Redux si es necesario
    // Esto podría requerir un slice separado para productos editados
  };

  const handleSearch = (term: string) => {
    dispatch(setSearchTerm(term));
    if (!term.trim()) {
      dispatch(setSearchResults(allPosters));
      return;
    }
    const filtered = allPosters.filter((poster) =>
      poster.name.toLowerCase().includes(term.toLowerCase())
    );
    dispatch(setSearchResults(filtered));
  };

  const handleSearchPosters = () => {
    dispatch(setIsSearchModalOpen(true));
  };

  const handlePosterSelect = (poster: any) => {
    dispatch(setSelectedPoster(poster));
    dispatch(setIsSearchModalOpen(false));
  };

  // Inicialización con productos iniciales
  useEffect(() => {
    if (initialProducts.length > 0 || initialPromotion) {
      dispatch(initializeWithProducts({
        products: initialProducts,
        promotion: initialPromotion?.id
      }));
    }
  }, [dispatch, initialProducts, initialPromotion]);

  // Efectos
  useEffect(() => {
    const timer = setTimeout(() => dispatch(setIsLoading(false)), 3000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  useEffect(() => {
    preloadCriticalImages();
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
        console.error("❌ PosterEditor: Error al cargar los componentes:", error); 
      }
    };
    loadComponents();
  }, []);

  return (
    <HeaderProvider userEmail={userEmail} userName={userName}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
        <Header onBack={onBack} onLogout={onLogout} />
        
        <div className="poster-editor-container min-h-screen w-full flex flex-col bg-white">
          <main className="pt-4 sm:pt-6 lg:pt-10 px-2 xs:px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 min-h-[calc(100vh-4rem)] sm:min-h-[800px] lg:min-h-[1000px]">
            
            <PosterEditorHeader onSearchPosters={handleSearchPosters} />

            {/* Layout responsivo que cambia de stack a grid */}
            <div className="flex flex-col lg:grid lg:grid-cols-10 gap-4 sm:gap-6 h-full">
              <div className="w-full lg:col-span-3 order-2 lg:order-1">
                <SidePanel
                  plantillasDisponibles={plantillasDisponibles}
                  combosDisponibles={combosDisponibles}
                  setIsFinancingModalOpen={(open) => dispatch(setIsFinancingModalOpen(open))}
                  setSelectedProduct={(product) => dispatch(setSelectedProduct(product))}
                />
              </div>

              <div className="w-full lg:col-span-7 order-1 lg:order-2 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
                <PreviewArea
                  templateComponents={templateComponents}
                  PLANTILLA_MODELOS={PLANTILLA_MODELOS as Record<string, TemplateModel[]>}
                  onUpdateProduct={handleUpdateProduct}
                />
              </div>
            </div>

            <ProductSelectorModal
              products={
                selectedCategory === "Todos" || !selectedCategory
                  ? products
                  : products.filter((p) => p.category === selectedCategory)
              }
              onSelectProduct={handleProductSelect}
            />

            <SendingModal
              empresaId={empresaId}
            />

            <PosterModal
              promotion={selectedPromotion}
              company={companyDetails}
            />

            <FinancingModal />

            <TemplateSelect />

            <SearchModal
              onSearch={handleSearch}
              onPosterSelect={handlePosterSelect}
            />
          </main>
        </div>
      </div>

      <LoadingModal isOpen={isLoading} />
    </HeaderProvider>
  );
};