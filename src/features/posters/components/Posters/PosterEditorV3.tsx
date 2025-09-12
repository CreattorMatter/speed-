import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LayoutTemplate, BoxSelect, FileSpreadsheet, Download, Upload, ArrowUpDown } from 'lucide-react';

// Importar hooks de Redux y el slice de poster
import { useSelector, useDispatch } from 'react-redux';
import {
  selectSelectedProductObjects,
  setSelectedProduct,
  setSelectedProducts,
  removeAllProducts,
  initializeWithProducts,
  selectIsProductSelectorOpen,
  setIsProductSelectorOpen,
  clearAllChanges,
} from '../../../../store/features/poster/posterSlice';
import { AppDispatch } from '../../../../store';

// Hooks adicionales
import { useMemo } from 'react';

// Servicios
import { posterTemplateService, PosterFamilyData, PosterTemplateData } from '../../../../services/posterTemplateService';
import { downloadSKUTemplate, importProductsFromExcel, exportSelectedProductsToExcel, validateExcelFile } from '../../../../services/excelTemplateService';

// Componentes
import { PreviewAreaV3 } from "./Editor/PreviewAreaV3";
import { Header } from "../../../../components/shared/Header";
import { HeaderProvider } from "../../../../components/shared/HeaderProvider";
import { LoadingModal } from "../../../../components/ui/LoadingModal";
import { ProductSelectionModal } from "./Editor/ProductSelectionModal";
import { FamilySelect } from "./Editor/Selectors/FamilySelect";
import { TemplateSelect } from "./Editor/Selectors/TemplateSelect";
import { templateRequiresProducts } from '../../../../utils/templateValidator';
import { type Product } from "../../../../data/products";
import { type ProductoReal } from "../../../../types/product";

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
  const navigate = useNavigate();
  
  // Estados de Redux
  const selectedProducts = useSelector(selectSelectedProductObjects);
  const isProductSelectorOpen = useSelector(selectIsProductSelectorOpen);
  
  // Estados locales para el nuevo sistema
  const [families, setFamilies] = useState<Omit<PosterFamilyData, 'templates'>[]>([]);
  const [cachedTemplates, setCachedTemplates] = useState<Record<string, PosterTemplateData[]>>({});
  const [selectedFamily, setSelectedFamily] = useState<PosterFamilyData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Estados para filtrado y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'name-asc' | 'name-desc'>('name-asc');
  
  // Estado para producto expandido
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // 🆕 Estados para funcionalidad Excel
  const [isImportingExcel, setIsImportingExcel] = useState(false);

  // Filtrar y ordenar plantillas de la familia seleccionada
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
    
    // Ordenar plantillas
    const sortedTemplates = [...templates].sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
    
    return sortedTemplates;
  }, [selectedFamily, searchTerm, selectedCategory, sortOrder]);


  // 🚀 PASO 1: Cargar solo las familias al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Cargando lista de familias...');
        const familyList = await posterTemplateService.getAllFamilies();
        setFamilies(familyList);

        // 🚀 PASO 2: Encontrar y cargar la familia por defecto ('Superprecio')
        const defaultFamily = familyList.find(f => f.name.toLowerCase() === 'superprecio');
        if (defaultFamily) {
          console.log(`✨ Familia por defecto encontrada: ${defaultFamily.displayName}. Cargando sus plantillas...`);
          const templates = await posterTemplateService.getTemplatesForFamily(defaultFamily.id, defaultFamily.name);
          setCachedTemplates(prev => ({ ...prev, [defaultFamily.id]: templates }));
          setSelectedFamily({ ...defaultFamily, templates });
        } else if (familyList.length > 0) {
          // Fallback si no se encuentra 'Superprecio'
          const firstFamily = familyList[0];
          console.log(`⚠️ Familia 'Superprecio' no encontrada. Usando fallback: ${firstFamily.displayName}`);
          const templates = await posterTemplateService.getTemplatesForFamily(firstFamily.id, firstFamily.name);
          setCachedTemplates(prev => ({ ...prev, [firstFamily.id]: templates }));
          setSelectedFamily({ ...firstFamily, templates });
        }

      } catch (error) {
        console.error("❌ Error en la carga inicial:", error);
        toast.error("Error al cargar los datos iniciales");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // Se ejecuta solo una vez

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


  // Handlers para selección de familia y plantilla
  const handleFamilySelect = async (family: Omit<PosterFamilyData, 'templates'>) => {
    try {
      setIsLoadingTemplates(true);
      console.log(`📋 Seleccionando familia: ${family.displayName}`);
      setSelectedTemplate(null); // Limpiar plantilla seleccionada

      // 🚀 PASO 3: Cargar plantillas bajo demanda con caché
      if (cachedTemplates[family.id]) {
        console.log('✅ Plantillas cargadas desde caché.');
        setSelectedFamily({ ...family, templates: cachedTemplates[family.id] });
      } else {
        console.log('🔄 Plantillas no encontradas en caché. Obteniendo del servicio...');
        const templates = await posterTemplateService.getTemplatesForFamily(family.id, family.name);
        setCachedTemplates(prev => ({ ...prev, [family.id]: templates }));
        setSelectedFamily({ ...family, templates });
      }
      
      // Limpiar filtros al cambiar de familia
      setSearchTerm('');
      setSelectedCategory('all');
      
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


  // NUEVO: Handler para confirmar selección múltiple desde el modal
  const handleProductSelectionConfirm = (selectedProductsList: Product[]) => {
    console.log('📋 Confirmando selección de productos:', selectedProductsList.length);
    
    // Actualizar Redux con todos los productos seleccionados
    dispatch(setSelectedProducts(selectedProductsList.map(p => p.id)));
    
    // Establecer el primer producto como producto único para compatibilidad
    if (selectedProductsList.length > 0) {
      dispatch(setSelectedProduct(selectedProductsList[0]));
    }
    
    // Cerrar el modal
    dispatch(setIsProductSelectorOpen(false));
  };

  // 🔄 Al montar el editor, iniciar sesión limpia: sin selección y sin cambios previos
  React.useEffect(() => {
    dispatch(setSelectedProducts([]));
    dispatch(setSelectedProduct(null));
    dispatch(clearAllChanges());
  }, [dispatch]);

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    console.log('📝 Actualizando producto:', productId, updates);
    // La lógica de actualización se maneja en PreviewAreaV3 a través de Redux
  };

  const handleRemoveAllProducts = () => {
    dispatch(removeAllProducts());
    dispatch(clearAllChanges());
  };

  // Handler para expansión de productos
  const handleExpandedProductChange = (productId: string | null) => {
    setExpandedProductId(productId);
  };

  // 🆕 Handlers para funcionalidad Excel
  const handleDownloadTemplate = () => {
    try {
      downloadSKUTemplate();
      toast.success('Template Excel descargado exitosamente');
    } catch (error) {
      console.error('Error descargando template:', error);
      toast.error('Error al descargar el template Excel');
    }
  };

  const handleImportFromExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validar archivo
      if (!validateExcelFile(file)) {
        toast.error('Formato de archivo no válido. Use .xlsx, .xls o .csv');
        return;
      }

      try {
        setIsImportingExcel(true);
        const result = await importProductsFromExcel(file);
        
        if (result.success && result.matchedProducts.length > 0) {
          const compatibleProducts: Product[] = result.matchedProducts;
          dispatch(setSelectedProducts(compatibleProducts.map(p => String(p.sku || p.id))));
          
          if (compatibleProducts.length > 0) {
            dispatch(setSelectedProduct(compatibleProducts[0]));
          }

          toast.success(`${result.matchedProducts.length} productos importados exitosamente`);
        } else if (result.success) {
          toast('No se encontraron productos con los SKUs del archivo');
        } else {
          toast.error(result.errorMessage || 'Error al procesar el archivo Excel');
        }
      } catch (error) {
        console.error('Error importando Excel:', error);
        toast.error('Error al importar productos desde Excel');
      } finally {
        setIsImportingExcel(false);
      }
    };
    input.click();
  };

  const handleExportToExcel = () => {
    try {
      if (selectedProducts.length === 0) {
        toast('No hay productos seleccionados para exportar');
        return;
      }

      // Los productos seleccionados ya son ProductoReal, solo filtrar los existentes
      const productsToExport = selectedProducts.filter(product => product != null) as ProductoReal[];

      exportSelectedProductsToExcel(productsToExport);
      toast.success('Productos exportados exitosamente');
    } catch (error) {
      console.error('Error exportando productos:', error);
      toast.error('Error al exportar productos a Excel');
    }
  };



  if (isLoading) {
    return <LoadingModal isOpen={true} />;
  }

  return (
    <HeaderProvider userEmail={userEmail} userName={userName}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
        <Header onBack={onBack} onLogout={onLogout} userName={userName} onGoToAdmin={() => navigate('/administration')} />
        
        <div className="poster-editor-container min-h-screen w-full flex flex-col bg-white">
          <main className="pt-4 sm:pt-6 lg:pt-8 px-2 xs:px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6 max-w-none mx-auto space-y-4 sm:space-y-6 min-h-[calc(100vh-3rem)] sm:min-h-[900px] lg:min-h-[1100px]">
            
            {/* Header del editor */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-medium text-gray-900">
                Editor de Carteles
              </h2>
            </div>

            {/* Layout principal */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 h-full">
              
              {/* Panel lateral - Selector de familias y plantillas */}
              <div className="w-full lg:col-span-3 order-2 lg:order-1">
                <div className="bg-white rounded-lg shadow-lg p-4 h-full overflow-y-auto">
                  
                  {/* Selector de familias */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <BoxSelect className="w-5 h-5 text-blue-500" />
                      Familias ({families.length})
                    </h3>
                    <FamilySelect
                      families={families}
                      selectedFamily={selectedFamily}
                      onFamilySelect={handleFamilySelect}
                      isLoading={isLoading}
                    />
                  </div>

                  {/* Selector de Plantillas (aparece cuando se selecciona una familia) */}
                  {selectedFamily && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <LayoutTemplate className="w-5 h-5 text-indigo-500" />
                          Plantillas ({filteredTemplates.length})
                        </h3>
                        {/* Selector de ordenamiento */}
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="w-4 h-4 text-gray-500" />
                          <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as any)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            <option value="name-asc">Nombre A-Z</option>
                            <option value="name-desc">Nombre Z-A</option>
                          </select>
                        </div>
                      </div>
                      <TemplateSelect
                        templates={filteredTemplates}
                        selectedTemplate={selectedTemplate}
                        onTemplateSelect={handleTemplateSelect}
                        isLoading={isLoadingTemplates}
                        disabled={!selectedFamily}
                      />
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
                      {(() => {
                        const requiresProducts = selectedTemplate ? templateRequiresProducts(selectedTemplate.template).requiresProducts : true;
                        return (
                          <button
                            onClick={() => requiresProducts && dispatch(setIsProductSelectorOpen(true))}
                            disabled={!requiresProducts}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                              requiresProducts
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            title={requiresProducts ? 'Agregar productos' : 'Esta plantilla no requiere productos'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {selectedProducts.length === 0 ? (requiresProducts ? 'Agregar' : 'No requiere') : 'Gestionar'}
                          </button>
                        );
                      })()}
                    </div>
                    
                    {selectedProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-sm font-medium">No hay productos seleccionados</p>
                        <p className="text-xs text-gray-400 mt-1">Haz click en "Agregar" para seleccionar productos</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Resumen de productos - Solo contador */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold">{selectedProducts.length}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-green-800">
                                  {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-green-600">
                                  {selectedProducts.length === 1 ? 'Seleccionado' : 'Seleccionados'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => dispatch(setIsProductSelectorOpen(true))}
                              className="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Gestionar selección
                            </button>
                            <button
                              onClick={handleRemoveAllProducts}
                              className="flex-1 px-3 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Limpiar todo
                            </button>
                          </div>
                          
                          {/* 🆕 BOTONES EXCEL */}
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleDownloadTemplate}
                              className="flex-1 px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                              title="Descargar template Excel con formato para SKUs"
                            >
                              <Download className="w-3 h-3" />
                              Template Excel
                            </button>
                            <button
                              onClick={handleImportFromExcel}
                              disabled={isImportingExcel}
                              className="flex-1 px-3 py-2 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              title="Importar productos desde Excel usando SKUs"
                            >
                              <Upload className="w-3 h-3" />
                              {isImportingExcel ? 'Importando...' : 'Importar Excel'}
                            </button>
                          </div>
                          
                          {selectedProducts.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={handleExportToExcel}
                                className="w-full px-3 py-2 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                                title="Exportar productos seleccionados a Excel"
                              >
                                <FileSpreadsheet className="w-3 h-3" />
                                Exportar a Excel
                              </button>
                            </div>
                          )}
                          
                          {/* Información adicional */}
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs text-green-700">
                              💡 Usa el área de preview para navegar entre productos individualmente
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Área de preview principal */}
              <div className="w-full lg:col-span-9 order-1 lg:order-2 min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
                <PreviewAreaV3
                  selectedFamily={selectedFamily}
                  selectedTemplate={selectedTemplate}
                  filteredTemplates={filteredTemplates}
                  onTemplateSelect={handleTemplateSelect}
                  onUpdateProduct={handleUpdateProduct}
                  expandedProductId={expandedProductId}
                  onExpandedProductChange={handleExpandedProductChange}
                  isLoadingTemplates={isLoadingTemplates}
                />
              </div>
            </div>

            {/* Modal selector de productos - MEJORADO */}
            <ProductSelectionModal
              isOpen={isProductSelectorOpen}
              onClose={() => dispatch(setIsProductSelectorOpen(false))}
              onConfirm={handleProductSelectionConfirm}
              initialSelectedProducts={selectedProducts}
              title="Seleccionar Productos para Carteles"
            />

          </main>
        </div>
      </div>

      <LoadingModal isOpen={isLoadingTemplates} />
    </HeaderProvider>
  );
}; 