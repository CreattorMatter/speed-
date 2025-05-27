import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../index'; // Ajusta la ruta si es necesario
import { Product } from '../../../data/products'; // Ajusta la ruta
import { PAPER_FORMATS } from '../../../constants/posters'; // Ajusta la ruta
import { FinancingOption } from '../../../types/financing';

// Tipos que ya podrías tener definidos y que usaremos
interface SelectOption {
  value: string;
  label: string;
}

interface PaperFormatOption {
  label: string;
  value: string;
  width: string;
  height: string;
}

// Tipo para resultados de búsqueda
interface SearchResult {
  name: string;
  url: string;
  created_at: string;
}

// Definición COMPLETA del estado del slice de posters
interface PosterState {
  // Estados principales
  company: string;
  promotion: string;
  selectedProducts: string[]; // IDs de productos
  selectedCategory: string;
  showLogo: boolean;
  showPesosCheck: boolean;
  viewMode: "grid" | "list";
  
  // Estados de UI (modales)
  isProductSelectorOpen: boolean;
  isLoading: boolean;
  isSendingModalOpen: boolean;
  selectedPoster: Product | null;
  isFinancingModalOpen: boolean;
  isTemplateModalOpen: boolean;
  isSearchModalOpen: boolean;
  
  // Estados de formato y zoom
  selectedFormat: any; // Tipo del PAPER_FORMATS
  showFormatSelector: boolean;
  zoom: number;
  cardSize: number;
  isLandscape: boolean;
  
  // Estados de plantillas
  plantillaSeleccionada: SelectOption | null;
  comboSeleccionado: SelectOption | null;
  selectedTemplate: string;
  selectedFinancing: FinancingOption[];
  formatoSeleccionado: PaperFormatOption | null;
  selectedProduct: Product | null; // Para producto único
  maxProductsReached: boolean;
  modeloSeleccionado: string | null;
  
  // Estados de búsqueda
  searchResults: SearchResult[];
  searchTerm: string;
  allPosters: SearchResult[];
}

// Estado inicial
const getA4Format = (): PaperFormatOption => {
  const a4Format = PAPER_FORMATS.find(format => format.id === 'A4');
  if (a4Format) {
    return {
      label: a4Format.name,
      value: a4Format.id,
      width: a4Format.width,
      height: a4Format.height
    };
  }
  return {
    label: 'A4 (210 × 297 mm)',
    value: 'A4',
    width: '210mm',
    height: '297mm'
  };
};

const initialState: PosterState = {
  // Estados principales
  company: "",
  promotion: "",
  selectedProducts: [],
  selectedCategory: "",
  showLogo: true,
  showPesosCheck: false,
  viewMode: "grid",
  
  // Estados de UI
  isProductSelectorOpen: false,
  isLoading: true,
  isSendingModalOpen: false,
  selectedPoster: null,
  isFinancingModalOpen: false,
  isTemplateModalOpen: false,
  isSearchModalOpen: false,
  
  // Estados de formato
  selectedFormat: PAPER_FORMATS[2], // Formato por defecto
  showFormatSelector: false,
  zoom: 1,
  cardSize: 0.85,
  isLandscape: false,
  
  // Estados de plantillas
  plantillaSeleccionada: null,
  comboSeleccionado: null,
  selectedTemplate: "",
  selectedFinancing: [],
  formatoSeleccionado: getA4Format(),
  selectedProduct: null,
  maxProductsReached: false,
  modeloSeleccionado: null,
  
  // Estados de búsqueda
  searchResults: [],
  searchTerm: "",
  allPosters: [],
};

export const posterSlice = createSlice({
  name: 'poster',
  initialState,
  reducers: {
    // Estados principales
    setCompany: (state, action: PayloadAction<string>) => {
      state.company = action.payload;
    },
    setPromotion: (state, action: PayloadAction<string>) => {
      state.promotion = action.payload;
    },
    setSelectedProducts: (state, action: PayloadAction<string[]>) => {
      state.selectedProducts = action.payload;
      state.maxProductsReached = false;
    },
    toggleProductSelection: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const currentIndex = state.selectedProducts.indexOf(productId);
      if (currentIndex === -1) {
        state.selectedProducts.push(productId);
      } else {
        state.selectedProducts.splice(currentIndex, 1);
      }
      state.maxProductsReached = false;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      // Resetear productos al cambiar categoría
      state.selectedProducts = [];
      state.selectedProduct = null;
      state.maxProductsReached = false;
    },
    setShowLogo: (state, action: PayloadAction<boolean>) => {
      state.showLogo = action.payload;
    },
    setShowPesosCheck: (state, action: PayloadAction<boolean>) => {
      state.showPesosCheck = action.payload;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
    
    // Estados de UI (modales)
    setIsProductSelectorOpen: (state, action: PayloadAction<boolean>) => {
      state.isProductSelectorOpen = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsSendingModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSendingModalOpen = action.payload;
    },
    setSelectedPoster: (state, action: PayloadAction<Product | null>) => {
      state.selectedPoster = action.payload;
    },
    setIsFinancingModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isFinancingModalOpen = action.payload;
    },
    setIsTemplateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isTemplateModalOpen = action.payload;
    },
    setIsSearchModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchModalOpen = action.payload;
    },
    
    // Estados de formato
    setSelectedFormat: (state, action: PayloadAction<any>) => {
      state.selectedFormat = action.payload;
    },
    setShowFormatSelector: (state, action: PayloadAction<boolean>) => {
      state.showFormatSelector = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    setCardSize: (state, action: PayloadAction<number>) => {
      state.cardSize = action.payload;
    },
    setIsLandscape: (state, action: PayloadAction<boolean>) => {
      state.isLandscape = action.payload;
    },
    
    // Estados de plantillas
    setPlantillaSeleccionada: (state, action: PayloadAction<SelectOption | null>) => {
      state.plantillaSeleccionada = action.payload;
      // Resetear combo si la plantilla cambia y el combo ya no es válido
      // Esta lógica se puede mover a un middleware o thunk si se vuelve compleja
    },
    setComboSeleccionado: (state, action: PayloadAction<SelectOption | null>) => {
      state.comboSeleccionado = action.payload;
    },
    setSelectedTemplate: (state, action: PayloadAction<string>) => {
      state.selectedTemplate = action.payload;
    },
    setSelectedFinancing: (state, action: PayloadAction<FinancingOption[]>) => {
      state.selectedFinancing = action.payload;
    },
    setFormatoSeleccionado: (state, action: PayloadAction<PaperFormatOption | null>) => {
      state.formatoSeleccionado = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setModeloSeleccionado: (state, action: PayloadAction<string | null>) => {
      state.modeloSeleccionado = action.payload;
    },
    
    // Estados de búsqueda
    setSearchResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.searchResults = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setAllPosters: (state, action: PayloadAction<SearchResult[]>) => {
      state.allPosters = action.payload;
    },
    
    // Acciones complejas
    removeProduct: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.selectedProducts = state.selectedProducts.filter(id => id !== productId);
      state.maxProductsReached = false;
    },
    removeAllProducts: (state) => {
      state.selectedProducts = [];
      state.selectedProduct = null;
      state.maxProductsReached = false;
    },
    
    // Acción para inicializar con productos iniciales
    initializeWithProducts: (state, action: PayloadAction<{ products: string[], promotion?: string }>) => {
      state.selectedProducts = action.payload.products;
      if (action.payload.promotion) {
        state.promotion = action.payload.promotion;
      }
      state.maxProductsReached = action.payload.products.length >= 9;
    },
  },
});

// Exportar acciones
export const {
  // Estados principales
  setCompany,
  setPromotion,
  setSelectedProducts,
  toggleProductSelection,
  setSelectedCategory,
  setShowLogo,
  setShowPesosCheck,
  setViewMode,
  
  // Estados de UI
  setIsProductSelectorOpen,
  setIsLoading,
  setIsSendingModalOpen,
  setSelectedPoster,
  setIsFinancingModalOpen,
  setIsTemplateModalOpen,
  setIsSearchModalOpen,
  
  // Estados de formato
  setSelectedFormat,
  setShowFormatSelector,
  setZoom,
  setCardSize,
  setIsLandscape,
  
  // Estados de plantillas
  setPlantillaSeleccionada,
  setComboSeleccionado,
  setSelectedTemplate,
  setSelectedFinancing,
  setFormatoSeleccionado,
  setSelectedProduct,
  setModeloSeleccionado,
  
  // Estados de búsqueda
  setSearchResults,
  setSearchTerm,
  setAllPosters,
  
  // Acciones complejas
  removeProduct,
  removeAllProducts,
  initializeWithProducts,
} = posterSlice.actions;

// Selectores
export const selectCompany = (state: RootState) => state.poster.company;
export const selectPromotion = (state: RootState) => state.poster.promotion;
export const selectSelectedProducts = (state: RootState) => state.poster.selectedProducts;
export const selectSelectedCategory = (state: RootState) => state.poster.selectedCategory;
export const selectShowLogo = (state: RootState) => state.poster.showLogo;
export const selectShowPesosCheck = (state: RootState) => state.poster.showPesosCheck;
export const selectViewMode = (state: RootState) => state.poster.viewMode;

// Selectores de UI
export const selectIsProductSelectorOpen = (state: RootState) => state.poster.isProductSelectorOpen;
export const selectIsLoading = (state: RootState) => state.poster.isLoading;
export const selectIsSendingModalOpen = (state: RootState) => state.poster.isSendingModalOpen;
export const selectSelectedPoster = (state: RootState) => state.poster.selectedPoster;
export const selectIsFinancingModalOpen = (state: RootState) => state.poster.isFinancingModalOpen;
export const selectIsTemplateModalOpen = (state: RootState) => state.poster.isTemplateModalOpen;
export const selectIsSearchModalOpen = (state: RootState) => state.poster.isSearchModalOpen;

// Selectores de formato
export const selectSelectedFormat = (state: RootState) => state.poster.selectedFormat;
export const selectShowFormatSelector = (state: RootState) => state.poster.showFormatSelector;
export const selectZoom = (state: RootState) => state.poster.zoom;
export const selectCardSize = (state: RootState) => state.poster.cardSize;
export const selectIsLandscape = (state: RootState) => state.poster.isLandscape;

// Selectores de plantillas
export const selectPlantillaSeleccionada = (state: RootState) => state.poster.plantillaSeleccionada;
export const selectComboSeleccionado = (state: RootState) => state.poster.comboSeleccionado;
export const selectSelectedTemplate = (state: RootState) => state.poster.selectedTemplate;
export const selectSelectedFinancing = (state: RootState) => state.poster.selectedFinancing;
export const selectFormatoSeleccionado = (state: RootState) => state.poster.formatoSeleccionado;
export const selectSelectedProduct = (state: RootState) => state.poster.selectedProduct;
export const selectMaxProductsReached = (state: RootState) => state.poster.maxProductsReached;
export const selectModeloSeleccionado = (state: RootState) => state.poster.modeloSeleccionado;

// Selectores de búsqueda
export const selectSearchResults = (state: RootState) => state.poster.searchResults;
export const selectSearchTerm = (state: RootState) => state.poster.searchTerm;
export const selectAllPosters = (state: RootState) => state.poster.allPosters;

// Exportar el reducer del slice
export default posterSlice.reducer; 