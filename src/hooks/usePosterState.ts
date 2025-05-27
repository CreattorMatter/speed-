import { useState } from 'react';
import { type Product } from '../data/products'; // Usar Product de data/products
import { PAPER_FORMATS } from '../constants/posters';
import { FinancingOption } from '../types/financing';

// Tipo para opciones de select
interface SelectOption {
  value: string;
  label: string;
}

// Tipo para formato de papel
interface PaperFormatOption {
  label: string;
  value: string;
  width: string;
  height: string;
}

// Tipo para promoción inicial
interface InitialPromotion {
  id: string;
  [key: string]: unknown;
}

export const usePosterState = (initialProducts: string[] = [], initialPromotion?: InitialPromotion) => {
  // Estados principales
  const [company, setCompany] = useState("");
  const [promotion, setPromotion] = useState(initialPromotion?.id || "");
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showLogo, setShowLogo] = useState(true);
  const [showPesosCheck, setShowPesosCheck] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Estados de UI
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<Product | null>(null);
  const [isFinancingModalOpen, setIsFinancingModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  // Estados de formato y zoom
  const [selectedFormat, setSelectedFormat] = useState(PAPER_FORMATS[2]);
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cardSize, setCardSize] = useState(0.85);
  const [isLandscape, setIsLandscape] = useState(false);
  
  // Estados de plantillas - TIPOS CORREGIDOS
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedFinancing, setSelectedFinancing] = useState<FinancingOption[]>([]);
  const [comboSeleccionado, setComboSeleccionado] = useState<SelectOption | null>(null);
  const [formatoSeleccionado, setFormatoSeleccionado] = useState<PaperFormatOption | null>({
    label: 'A4 (210 × 297 mm)',
    value: 'A4',
    width: '210mm',
    height: '297mm'
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [maxProductsReached, setMaxProductsReached] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<SelectOption | null>(null);
  const [modeloSeleccionado, setModeloSeleccionado] = useState<string | null>(null);
  
  // Estados de búsqueda
  const [searchResults, setSearchResults] = useState<Array<{
    name: string;
    url: string;
    created_at: string;
  }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allPosters, setAllPosters] = useState<Array<{
    name: string;
    url: string;
    created_at: string;
  }>>([]);

  return {
    // Estados principales
    company, setCompany,
    promotion, setPromotion,
    selectedProducts, setSelectedProducts,
    selectedCategory, setSelectedCategory,
    showLogo, setShowLogo,
    showPesosCheck, setShowPesosCheck,
    viewMode, setViewMode,
    
    // Estados de UI
    isProductSelectorOpen, setIsProductSelectorOpen,
    isLoading, setIsLoading,
    isSendingModalOpen, setIsSendingModalOpen,
    selectedPoster, setSelectedPoster,
    isFinancingModalOpen, setIsFinancingModalOpen,
    isTemplateModalOpen, setIsTemplateModalOpen,
    isSearchModalOpen, setIsSearchModalOpen,
    
    // Estados de formato
    selectedFormat, setSelectedFormat,
    showFormatSelector, setShowFormatSelector,
    zoom, setZoom,
    cardSize, setCardSize,
    isLandscape, setIsLandscape,
    
    // Estados de plantillas
    selectedTemplate, setSelectedTemplate,
    selectedFinancing, setSelectedFinancing,
    comboSeleccionado, setComboSeleccionado,
    formatoSeleccionado, setFormatoSeleccionado,
    selectedProduct, setSelectedProduct,
    maxProductsReached, setMaxProductsReached,
    plantillaSeleccionada, setPlantillaSeleccionada,
    modeloSeleccionado, setModeloSeleccionado,
    
    // Estados de búsqueda
    searchResults, setSearchResults,
    searchTerm, setSearchTerm,
    allPosters, setAllPosters,
  };
}; 