import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../index'; // Ajusta la ruta si es necesario
import { products, type Product } from '../../../data/products'; // Ajustar import para incluir products
import { PAPER_FORMATS } from '../../../constants/posters'; // Ajusta la ruta
import { COMPANIES } from '../../../data/companies'; // Agregar import de COMPANIES
import { PROMOTIONS } from '../../../constants/posters'; // Agregar import de PROMOTIONS
import { FinancingOption } from '../../../types/financing';
import type { ProductoParaImprimir, PreviewSettings, PrintSettings } from '../../../types/index';
import { createSelector } from '@reduxjs/toolkit';

// Tipos para el manejo de cambios de productos
export interface ProductChange {
  productId: string;
  field: string;
  originalValue: string | number;
  newValue: string | number;
  timestamp: Date;
}

export interface EditedProduct {
  productId: string;
  productName: string;
  changes: ProductChange[];
  isEdited: boolean;
}

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
  modeloSeleccionado: string | null;
  
  // Estados de búsqueda
  searchResults: SearchResult[];
  searchTerm: string;
  allPosters: SearchResult[];
  
  // Estados de cambios de productos
  productChanges: Record<string, EditedProduct>; // productId -> EditedProduct
  hasAnyChanges: boolean;
  
  // Nuevas acciones para impresión
  printInProgress: boolean;
  printConfiguration: any;
  
  // Nuevos campos para el sistema de preview e impresión
  productosParaImprimir: ProductoParaImprimir[];
  previewSettings: PreviewSettings;
  printSettings: PrintSettings;
  isPreviewAreaExpanded: boolean;
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
  plantillaSeleccionada: { label: "Superprecio", value: "Superprecio" },
  comboSeleccionado: null,
  selectedTemplate: "",
  selectedFinancing: [],
  formatoSeleccionado: getA4Format(),
  selectedProduct: null,
  modeloSeleccionado: null,
  
  // Estados de búsqueda
  searchResults: [],
  searchTerm: "",
  allPosters: [],
  
  // Estados de cambios de productos
  productChanges: {},
  hasAnyChanges: false,
  
  // Nuevas acciones para impresión
  printInProgress: false,
  printConfiguration: null,
  
  // Nuevos campos iniciales
  productosParaImprimir: [],
  previewSettings: {
    showMiniatures: true,
    scaleToFit: true,
    maxItemsPerRow: 4,
    aspectRatioMode: 'original'
  },
  printSettings: {
    pageBreakBetweenProducts: true,
    includeProductInfo: false,
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
  },
  isPreviewAreaExpanded: false
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
    },
    toggleProductSelection: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const currentIndex = state.selectedProducts.indexOf(productId);
      if (currentIndex === -1) {
        state.selectedProducts.push(productId);
      } else {
        state.selectedProducts.splice(currentIndex, 1);
      }
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      // Resetear productos al cambiar categoría
      state.selectedProducts = [];
      state.selectedProduct = null;
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
    
    // Estados de plantillas con mejor manejo de cambios
    setPlantillaSeleccionada: (state, action: PayloadAction<SelectOption | null>) => {
      const previousPlantilla = state.plantillaSeleccionada;
      state.plantillaSeleccionada = action.payload;
      
      // Si cambia la plantilla, resetear el modelo seleccionado para evitar incompatibilidades
      if (previousPlantilla?.value !== action.payload?.value) {
        state.modeloSeleccionado = null;
        console.log('🔄 Plantilla cambiada, reseteando modelo seleccionado');
      }
      
      // Si no hay plantilla seleccionada, limpiar también el combo
      if (!action.payload) {
        state.comboSeleccionado = null;
        state.modeloSeleccionado = null;
      }
    },
    setComboSeleccionado: (state, action: PayloadAction<SelectOption | null>) => {
      const previousCombo = state.comboSeleccionado;
      state.comboSeleccionado = action.payload;
      
      // Si cambia el combo, resetear el modelo seleccionado para evitar incompatibilidades
      if (previousCombo?.value !== action.payload?.value) {
        state.modeloSeleccionado = null;
        console.log('🔄 Combo cambiado, reseteando modelo seleccionado');
      }
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
      console.log('🎨 Modelo seleccionado:', action.payload);
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
    },
    removeAllProducts: (state) => {
      state.selectedProducts = [];
      state.selectedProduct = null;
    },
    
    // Acción para inicializar con productos iniciales
    initializeWithProducts: (state, action: PayloadAction<{ products: string[], promotion?: string }>) => {
      state.selectedProducts = action.payload.products;
      if (action.payload.promotion) {
        state.promotion = action.payload.promotion;
      }
    },
    
    // Acciones para manejo de cambios de productos mejoradas
    trackProductChange: (state, action: PayloadAction<{
      productId: string;
      productName: string;
      field: string;
      originalValue: string | number;
      newValue: string | number;
    }>) => {
      const { productId, productName, field, originalValue, newValue } = action.payload;
      
      // Crear el registro del producto editado si no existe
      if (!state.productChanges[productId]) {
        state.productChanges[productId] = {
          productId,
          productName,
          changes: [],
          isEdited: false
        };
      }
      
      const editedProduct = state.productChanges[productId];
      
      // Buscar si ya existe un cambio para este campo
      const existingChangeIndex = editedProduct.changes.findIndex(change => change.field === field);
      
      if (existingChangeIndex !== -1) {
        // Si ya existe un cambio para este campo, actualizar el nuevo valor
        const existingChange = editedProduct.changes[existingChangeIndex];
        
        // Si el nuevo valor es igual al valor original, remover el cambio
        if (newValue === existingChange.originalValue) {
          editedProduct.changes.splice(existingChangeIndex, 1);
          console.log(`🔄 Campo '${field}' restaurado a su valor original, removiendo cambio`);
        } else {
          // Actualizar solo el nuevo valor, manteniendo el valor original
          existingChange.newValue = newValue;
          existingChange.timestamp = new Date();
          console.log(`✏️ Campo '${field}' actualizado: ${existingChange.originalValue} → ${newValue}`);
        }
      } else {
        // Si el nuevo valor es diferente al original, crear un nuevo cambio
        if (newValue !== originalValue) {
          editedProduct.changes.push({
            productId,
            field,
            originalValue,
            newValue,
            timestamp: new Date()
          });
          console.log(`➕ Nuevo cambio registrado en '${field}': ${originalValue} → ${newValue}`);
        }
      }
      
      // Actualizar el estado isEdited y hasAnyChanges
      editedProduct.isEdited = editedProduct.changes.length > 0;
      
      // Si no hay cambios, remover el producto del registro
      if (editedProduct.changes.length === 0) {
        delete state.productChanges[productId];
        console.log(`🗑️ Producto '${productName}' removido del registro (sin cambios)`);
      }
      
      // Actualizar el flag global de cambios
      state.hasAnyChanges = Object.keys(state.productChanges).length > 0;
      
      console.log(`📊 Estado de cambios: ${Object.keys(state.productChanges).length} productos editados`);
    },
    
    clearProductChanges: (state) => {
      const previousCount = Object.keys(state.productChanges).length;
      state.productChanges = {};
      state.hasAnyChanges = false;
      console.log(`🧹 Limpiados todos los cambios de productos (${previousCount} productos afectados)`);
    },
    
    removeProductChanges: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const productName = state.productChanges[productId]?.productName || productId;
      const changeCount = state.productChanges[productId]?.changes.length || 0;
      
      delete state.productChanges[productId];
      state.hasAnyChanges = Object.keys(state.productChanges).length > 0;
      
      console.log(`🗑️ Cambios removidos para producto '${productName}' (${changeCount} cambios)`);
    },
    
    // Nuevas acciones para impresión
    setPrintInProgress: (state, action: PayloadAction<boolean>) => {
      state.printInProgress = action.payload;
    },
    
    setPrintConfiguration: (state, action: PayloadAction<any>) => {
      state.printConfiguration = action.payload;
    },
    
    // Nuevas acciones para el sistema de preview e impresión
    agregarProductoParaImprimir: (state, action: PayloadAction<Omit<ProductoParaImprimir, 'idUnico'>>) => {
      const nuevoProducto: ProductoParaImprimir = {
        ...action.payload,
        idUnico: `${action.payload.idProductoOriginal}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      state.productosParaImprimir.push(nuevoProducto);
    },
    
    eliminarProductoParaImprimir: (state, action: PayloadAction<string>) => {
      state.productosParaImprimir = state.productosParaImprimir.filter(
        producto => producto.idUnico !== action.payload
      );
    },
    
    limpiarProductosParaImprimir: (state) => {
      state.productosParaImprimir = [];
    },
    
    actualizarProductoParaImprimir: (state, action: PayloadAction<{ idUnico: string; updates: Partial<ProductoParaImprimir> }>) => {
      const index = state.productosParaImprimir.findIndex(p => p.idUnico === action.payload.idUnico);
      if (index !== -1) {
        state.productosParaImprimir[index] = { ...state.productosParaImprimir[index], ...action.payload.updates };
      }
    },
    
    actualizarPreviewSettings: (state, action: PayloadAction<Partial<PreviewSettings>>) => {
      state.previewSettings = { ...state.previewSettings, ...action.payload };
    },
    
    actualizarPrintSettings: (state, action: PayloadAction<Partial<PrintSettings>>) => {
      state.printSettings = { ...state.printSettings, ...action.payload };
    },
    
    togglePreviewAreaExpanded: (state) => {
      state.isPreviewAreaExpanded = !state.isPreviewAreaExpanded;
    },
    
    convertirProductosSeleccionadosParaImprimir: (state) => {
      // Convertir productos seleccionados actuales a productos para imprimir
      if (state.selectedProducts.length > 0 && state.plantillaSeleccionada && state.modeloSeleccionado) {
        state.selectedProducts.forEach(productId => {
          const product = products.find(p => p.id === productId);
          if (product) {
            const nuevoProducto: ProductoParaImprimir = {
              idUnico: `${productId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              idProductoOriginal: productId,
              idModeloPlantilla: state.modeloSeleccionado || '',
              plantillaHTML: '', // Se rellenará dinámicamente
              estilosCSS: '', // Se rellenará dinámicamente
              datosPersonalizados: state.productChanges[productId] || {},
              dimensionesFisicas: {
                ancho: state.formatoSeleccionado?.width ? parseFloat(state.formatoSeleccionado.width) : 21,
                alto: state.formatoSeleccionado?.height ? parseFloat(state.formatoSeleccionado.height) : 29.7,
                unidad: 'cm'
              },
              plantillaSeleccionada: state.plantillaSeleccionada?.value,
              comboSeleccionado: state.comboSeleccionado?.value,
              modeloSeleccionado: state.modeloSeleccionado || undefined,
              formatoSeleccionado: state.formatoSeleccionado?.value,
              financing: state.selectedFinancing,
              product: {
                id: product.id,
                sku: product.sku,
                name: product.name,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl,
                category: product.category,
                pricePerUnit: '',
                points: '',
                origin: '',
                barcode: '',
                brand: product.brand || '',
                packUnit: ''
              },
              empresa: state.company ? COMPANIES.find(c => c.id === state.company) : undefined,
              promotion: state.promotion ? PROMOTIONS.find(p => p.id === state.promotion) : undefined
            };
            
            // Solo agregar si no existe ya
            const existe = state.productosParaImprimir.some(p => 
              p.idProductoOriginal === productId && 
              p.idModeloPlantilla === nuevoProducto.idModeloPlantilla
            );
            
            if (!existe) {
              state.productosParaImprimir.push(nuevoProducto);
            }
          }
        });
      }
    }
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
  
  // Acciones para manejo de cambios de productos
  trackProductChange,
  clearProductChanges,
  removeProductChanges,
  
  // Nuevas acciones para impresión
  setPrintInProgress,
  setPrintConfiguration,
  
  // Nuevas acciones para el sistema de preview e impresión
  agregarProductoParaImprimir,
  eliminarProductoParaImprimir,
  limpiarProductosParaImprimir,
  actualizarProductoParaImprimir,
  actualizarPreviewSettings,
  actualizarPrintSettings,
  togglePreviewAreaExpanded,
  convertirProductosSeleccionadosParaImprimir
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
export const selectModeloSeleccionado = (state: RootState) => state.poster.modeloSeleccionado;

// Selectores de búsqueda
export const selectSearchResults = (state: RootState) => state.poster.searchResults;
export const selectSearchTerm = (state: RootState) => state.poster.searchTerm;
export const selectAllPosters = (state: RootState) => state.poster.allPosters;

// Selectores de cambios de productos
export const selectProductChanges = (state: RootState) => state.poster.productChanges;
export const selectHasAnyChanges = (state: RootState) => state.poster.hasAnyChanges;
export const selectProductChangesByProductId = (productId: string) => (state: RootState) => 
  state.poster.productChanges[productId];
export const selectChangedProductsCount = (state: RootState) => 
  Object.keys(state.poster.productChanges).length;

// Nuevos selectores para impresión
export const selectPrintInProgress = (state: RootState) => state.poster.printInProgress;
export const selectPrintConfiguration = (state: RootState) => state.poster.printConfiguration;

// Nuevos selectores
export const selectProductosParaImprimir = (state: RootState) => state.poster.productosParaImprimir;
export const selectPreviewSettings = (state: RootState) => state.poster.previewSettings;
export const selectPrintSettings = (state: RootState) => state.poster.printSettings;
export const selectIsPreviewAreaExpanded = (state: RootState) => state.poster.isPreviewAreaExpanded;

// Selector memoizado para convertir IDs a objetos Product
export const selectSelectedProductObjects = createSelector(
  [selectSelectedProducts],
  (selectedProductIds) => 
    selectedProductIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean) as Product[]
);

// Selector computado para obtener el producto único cuando hay exactamente uno seleccionado
export const selectSingleSelectedProduct = createSelector(
  [selectSelectedProductObjects],
  (selectedProducts) => 
    selectedProducts.length === 1 ? selectedProducts[0] : null
);

// Exportar el reducer del slice
export default posterSlice.reducer; 