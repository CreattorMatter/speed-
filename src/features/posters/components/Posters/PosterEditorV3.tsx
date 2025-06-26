import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

// Importar hooks de Redux y el slice de poster
import { useSelector, useDispatch } from 'react-redux';
import {
  selectSelectedProductObjects,
  selectSelectedFinancing,
  selectFormatoSeleccionado,
  toggleProductSelection,
  setSelectedProduct,
  removeProduct,
  removeAllProducts,
  initializeWithProducts,
  setIsProductSelectorOpen,
} from '../../../../store/features/poster/posterSlice';
import { AppDispatch } from '../../../../store';

// Hooks adicionales
import { useMemo } from 'react';

// Servicios
import { posterTemplateService, PosterFamilyData, PosterTemplateData } from '../../../../services/posterTemplateService';

// Componentes
import { PosterEditorHeader } from "./Editor/PosterEditorHeader";
import { PreviewAreaV3 } from "./Editor/PreviewAreaV3";
import { Header } from "../../../../components/shared/Header";
import { HeaderProvider } from "../../../../components/shared/HeaderProvider";
import { LoadingModal } from "../../../../components/ui/LoadingModal";
import { ProductSelectorModal } from "../../../products/ProductSelectorModal";

// Datos
import { COMPANIES } from "../../../../data/companies";
import { products, type Product } from "../../../../data/products";

// Tipos específicos para las props del componente
interface InitialPromotion {
  id: string;
  [key: string]: unknown;
}

interface PosterEditorV3Props {
  onBack: () => void;
  onLogout: () => void;
  initialProducts?: string[];
  initialPromotion?: InitialPromotion;
  userEmail: string;
  userName: string;
}

export const PosterEditorV3: React.FC<PosterEditorV3Props> = ({
  onBack,
  onLogout,
  initialProducts = [],
  initialPromotion,
  userEmail,
  userName,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Estados de Redux
  const selectedProducts = useSelector(selectSelectedProductObjects);
  const selectedFinancing = useSelector(selectSelectedFinancing);
  const formatoSeleccionado = useSelector(selectFormatoSeleccionado);
  
  // Estados locales para el nuevo sistema
  const [families, setFamilies] = useState<PosterFamilyData[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<PosterFamilyData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Estados para filtrado y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSearchFilters, setShowSearchFilters] = useState(false);

  // Filtrar plantillas de la familia seleccionada
  const filteredTemplates = useMemo(() => {
    if (!selectedFamily) return [];
    
    let templates = selectedFamily.templates;
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      templates = templates.filter(template => 
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.familyName.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      templates = templates.filter(template => 
        template.template.category === selectedCategory
      );
    }
    
    return templates;
  }, [selectedFamily, searchTerm, selectedCategory]);

  // Obtener categorías disponibles de la familia seleccionada
  const availableCategories = useMemo(() => {
    if (!selectedFamily) return [];
    
    const categories = new Set<string>();
    selectedFamily.templates.forEach(template => {
      if (template.template.category) {
        categories.add(template.template.category);
      }
    });
    
    return Array.from(categories).sort();
  }, [selectedFamily]);

  // Cargar familias al montar el componente (solo una vez)
  useEffect(() => {
    const loadFamilies = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Cargando familias y plantillas...');
        
        const familiesWithTemplates = await posterTemplateService.getAllFamiliesWithTemplates();
        console.log(`✅ ${familiesWithTemplates.length} familias cargadas`);
        
        setFamilies(familiesWithTemplates);
        
      } catch (error) {
        console.error("❌ Error cargando familias:", error);
        toast.error("Error al cargar las familias de plantillas");
      } finally {
        setIsLoading(false);
      }
    };

    loadFamilies();
  }, []); // Sin dependencias - solo se ejecuta al montar

  // Inicialización con productos iniciales (solo una vez)
  useEffect(() => {
    if (!initialized && (initialProducts.length > 0 || initialPromotion)) {
      console.log('🚀 Inicializando con productos:', initialProducts);
      dispatch(initializeWithProducts({
        products: initialProducts,
        promotion: initialPromotion?.id
      }));
      setInitialized(true);
    }
  }, [dispatch, initialized, initialProducts.length, initialPromotion?.id]);

  // Efecto separado para seleccionar familia y plantilla cuando se cargan las familias
  useEffect(() => {
    if (families.length > 0 && !selectedFamily) {
      // Solo auto-seleccionar si hay productos iniciales reales (no el array vacío por defecto)
      const hasInitialProducts = initialProducts && initialProducts.length > 0;
      
      if (hasInitialProducts) {
        console.log('📋 Seleccionando familia y plantilla por defecto...');
        const firstFamily = families[0];
        if (firstFamily.templates.length > 0) {
          setSelectedFamily(firstFamily);
          setSelectedTemplate(firstFamily.templates[0]);
        }
      }
    }
  }, [families.length, selectedFamily]); // Solo depender de families.length y selectedFamily

  // Handlers para selección de familia y plantilla
  const handleFamilySelect = async (family: PosterFamilyData) => {
    try {
      setIsLoadingTemplates(true);
      console.log(`📋 Seleccionando familia: ${family.displayName}`);
      
      setSelectedFamily(family);
      setSelectedTemplate(null); // Limpiar plantilla seleccionada
      
      // Limpiar filtros al cambiar de familia
      setSearchTerm('');
      setSelectedCategory('all');
      setShowSearchFilters(false);
      
    } catch (error) {
      console.error("❌ Error seleccionando familia:", error);
      toast.error("Error al cargar plantillas de la familia");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = (template: PosterTemplateData | null) => {
    console.log(`📝 Seleccionando plantilla: ${template?.name || 'volviendo a grilla'}`);
    setSelectedTemplate(template);
  };

  // Handlers para productos
  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      dispatch(toggleProductSelection(product.id));
      
             // Actualizar el producto único para compatibilidad
       const isCurrentlySelected = selectedProducts.some(p => p.id === productId);
       if (!isCurrentlySelected) {
         dispatch(setSelectedProduct(product));
       }
     }
  };

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    console.log('📝 Actualizando producto:', productId, updates);
    // La lógica de actualización se maneja en PreviewAreaV3 a través de Redux
  };

  const handleRemoveProduct = (productId: string) => {
    dispatch(removeProduct(productId));
  };

  const handleRemoveAllProducts = () => {
    dispatch(removeAllProducts());
  };

  // Handlers para búsqueda (simplificado por ahora)
  const handleSearchPosters = () => {
    console.log('🔍 Búsqueda de carteles (por implementar)');
    toast('Funcionalidad de búsqueda en desarrollo');
  };

  if (isLoading) {
    return <LoadingModal isOpen={true} />;
  }

  return (
    <HeaderProvider userEmail={userEmail} userName={userName}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
        <Header onBack={onBack} onLogout={onLogout} userName={userName} onGoToAdmin={() => window.location.href = '/'} />
        
        <div className="poster-editor-container min-h-screen w-full flex flex-col bg-white">
          <main className="pt-4 sm:pt-6 lg:pt-10 px-2 xs:px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 min-h-[calc(100vh-4rem)] sm:min-h-[800px] lg:min-h-[1000px]">
            
            {/* Header del editor */}
            <PosterEditorHeader onSearchPosters={handleSearchPosters} />

            {/* Layout principal */}
            <div className="flex flex-col lg:grid lg:grid-cols-10 gap-4 sm:gap-6 h-full">
              
              {/* Panel lateral - Selector de familias y plantillas */}
              <div className="w-full lg:col-span-3 order-2 lg:order-1">
                <div className="bg-white rounded-lg shadow-lg p-4 h-full overflow-y-auto">
                  
                  {/* Selector de familias */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Familias ({families.length})
                    </h3>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {families.map((family) => (
                        <button
                          key={family.id}
                          onClick={() => handleFamilySelect(family)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                            selectedFamily?.id === family.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{family.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{family.displayName}</div>
                              <div className="text-sm text-gray-500 truncate">{family.templates.length} plantilla{family.templates.length !== 1 ? 's' : ''}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Información de la familia seleccionada */}
                  {selectedFamily && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-800">{selectedFamily.displayName}</h4>
                        <button
                          onClick={() => setShowSearchFilters(!showSearchFilters)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Mostrar/ocultar filtros"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-blue-600 mb-3">{selectedFamily.description}</p>
                      <div className="text-xs text-blue-500">
                        {filteredTemplates.length} de {selectedFamily.templates.length} plantilla{selectedFamily.templates.length !== 1 ? 's' : ''} 
                        {searchTerm || selectedCategory !== 'all' ? ' (filtradas)' : ''}
                      </div>
                      
                      {/* Filtros expandibles */}
                      {showSearchFilters && (
                        <div className="mt-4 pt-3 border-t border-blue-200 space-y-3">
                          {/* Buscador */}
                          <div>
                            <label className="block text-xs font-medium text-blue-700 mb-1">Buscar plantillas</label>
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Buscar por nombre, descripción..."
                              className="w-full px-3 py-2 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          {/* Filtro por categoría */}
                          {availableCategories.length > 0 && (
                            <div>
                              <label className="block text-xs font-medium text-blue-700 mb-1">Categoría</label>
                              <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="all">Todas las categorías</option>
                                {availableCategories.map(category => (
                                  <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Botón limpiar filtros */}
                          {(searchTerm || selectedCategory !== 'all') && (
                            <button
                              onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                              }}
                              className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Limpiar filtros
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selector de productos */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Productos ({selectedProducts.length})
                      </h3>
                                             <button
                         onClick={() => dispatch(setIsProductSelectorOpen(true))}
                         className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                       >
                         + Agregar
                       </button>
                    </div>
                    
                    {selectedProducts.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-sm">No hay productos seleccionados</p>
                        <p className="text-xs text-gray-400 mt-1">Haz click en "Agregar" para seleccionar productos</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedProducts.map((product, index) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                          >
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{product.name}</div>
                              <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                              <div className="text-xs font-bold text-green-600">${product.price?.toLocaleString()}</div>
                            </div>
                            <button
                              onClick={() => handleRemoveProduct(product.id)}
                              className="w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        
                        {selectedProducts.length > 1 && (
                          <button
                            onClick={handleRemoveAllProducts}
                            className="w-full mt-3 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Eliminar todos ({selectedProducts.length})
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Área de preview principal */}
              <div className="w-full lg:col-span-7 order-1 lg:order-2 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
                <PreviewAreaV3
                  selectedFamily={selectedFamily}
                  selectedTemplate={selectedTemplate}
                  filteredTemplates={filteredTemplates}
                  searchTerm={searchTerm}
                  selectedCategory={selectedCategory}
                  onTemplateSelect={handleTemplateSelect}
                  onUpdateProduct={handleUpdateProduct}
                />
              </div>
            </div>

                         {/* Modal selector de productos */}
             <ProductSelectorModal
               products={products}
               onSelectProduct={handleProductSelect}
             />

          </main>
        </div>
      </div>

      <LoadingModal isOpen={isLoadingTemplates} />
    </HeaderProvider>
  );
}; 