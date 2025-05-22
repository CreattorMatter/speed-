import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft,
  LayoutGrid,
  List,
  Minus,
  Plus,
  LayoutTemplate,
  Search,
} from "lucide-react";
import { CompanySelect } from "./CompanySelect";
import { RegionSelect } from "./RegionSelect";
import { LocationSelect } from "./LocationSelect";
import { PromotionSelect } from "./PromotionSelect";
import { ProductSelect } from "./ProductSelect";
import { CategorySelect } from "./CategorySelect";
import { PosterPreview } from "./PosterPreview";
import { useNavigate } from "react-router-dom";
import { Header } from "../shared/Header";
import { useTheme } from "../../hooks/useTheme";
import { ProductSelectorModal } from "../Products/ProductSelectorModal";
import { PosterModal } from "./PosterModal";
import { COMPANIES } from "../../data/companies";
import { LOCATIONS, REGIONS } from "../../data/locations";
import { LoadingModal } from "../LoadingModal";
import { products } from "../../data/products";
import { SendingModal } from "./SendingModal";
import { TemplateSelect } from "./TemplateSelect";
import { FinancingModal } from "./FinancingModal";
import { CreditCard } from "lucide-react";
import { POSTER_TEMPLATES } from "../../constants/templates";
import { HeaderProvider } from "../shared/HeaderProvider";
import { toast } from "react-hot-toast";
import { uploadToBucket } from "../../lib/supabaseClient-carteles";
import domtoimage from "dom-to-image-improved";
import { Product } from "../../types/product";
import { Promotion } from "../../types/promotion";
import { supabase } from "../../lib/supabaseClient";
import { ExportPoster } from "./ExportPoster";
import ReactDOM from "react-dom/client";
import { FinancingOption } from "../../types/financing";
import { PlantillaSelect } from "./PlantillaSelect";
import {
  PAPER_FORMATS,
  PLANTILLA_MODELOS,
  PLANTILLAS,
  PROMOTIONS,
  loadTemplateComponent,
  Combos,
  COMBOS,
} from "@/constants/posters";
import { getCombosPorPlantilla } from "@/constants/posters/plantillaCombos";

// Definimos las interfaces necesarias
interface PlantillaOption {
  value: string;
  label: string;
}

interface ModeloOption {
  id: string;
  componentPath: string;
  name?: string;
}
import { ComboSelect } from "./ComboSelect";
import PaperFormatSelect from "./PaperFormatSelect";

interface PosterEditorProps {
  onBack: () => void;
  onLogout: () => void;
  initialProducts?: string[];
  initialPromotion?: any;
  userEmail: string;
  userName: string;
}

console.log("Importación de productos:", { products });

// Extraer categorías únicas de los productos
const CATEGORIES = Array.from(new Set(products.map((p) => p.category))).map(
  (cat) => ({
    label: cat,
    value: cat,
  })
);
console.log("Categorías encontradas:", CATEGORIES);

// Función para limpiar el texto para el nombre del archivo
const cleanFileName = (text: string): string => {
  return text
    .toLowerCase()
    .replace(
      /[áéíóúñü]/g,
      (c) =>
        ({ á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n", ü: "u" }[c] || c)
    )
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};

export const PosterEditor: React.FC<PosterEditorProps> = ({
  onBack,
  onLogout,
  initialProducts = [],
  initialPromotion,
  userEmail,
  userName,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [company, setCompany] = useState("");
  const [promotion, setPromotion] = useState(initialPromotion?.id || "");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(
    initialProducts
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as Product[]
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();
  const [showLogo, setShowLogo] = useState(true);
  const [showPesosCheck, setShowPesosCheck] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<Product | null>(null);
  const [selectedFormat, setSelectedFormat] = useState(PAPER_FORMATS[2]); // A4 por defecto
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cardSize, setCardSize] = useState(0.85);
  const [isLandscape, setIsLandscape] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isFinancingModalOpen, setIsFinancingModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedFinancing, setSelectedFinancing] = useState<FinancingOption[]>(
    []
  );
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{
      name: string;
      url: string;
      created_at: string;
    }>
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allPosters, setAllPosters] = useState<
    Array<{
      name: string;
      url: string;
      created_at: string;
    }>
  >([]);

  const [comboSeleccionado, setComboSeleccionado] = useState<Combos | null>(
    null
  );
  const [formatoSeleccionado, setFormatoSeleccionado] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState<
    import("../../types/product").Product | null
  >(null);
  const [maxProductsReached, setMaxProductsReached] = useState<boolean>(false);

  console.log("LOCATIONS imported:", LOCATIONS); // Debug
  console.log("COMPANIES imported:", COMPANIES); // Debug
  console.log("Productos disponibles:", products);

  // Limpiar empresa cuando cambia
  const handleCompanyChange = (newCompany: string) => {
    setCompany(newCompany);
  };

  // Filtrar ubicaciones basado en la empresa seleccionada
  const availableRegions = React.useMemo(() => {
    console.log("Calculating regions for company:", company);
    const locations =
      company && company !== "no-logo"
        ? LOCATIONS.filter((loc) => {
            const matches = loc.id.startsWith(company.toLowerCase());
            console.log(`Checking location ${loc.id} for regions: ${matches}`);
            return matches;
          })
        : LOCATIONS;

    const regions = new Set(locations.map((loc) => loc.region));
    console.log("Available regions:", regions);

    const result = [
      { id: "todos", name: "Todas las Regiones" },
      ...REGIONS.filter((r) => r.id !== "todos" && regions.has(r.id)),
    ];
    console.log("Final regions list:", result);
    return result;
  }, [company]);

  const selectedPromotion = PROMOTIONS.find((p) => p.id === promotion) as
    | Promotion
    | undefined;

  // Modificar el mapeo de productos para asegurar que tienen todos los campos requeridos
  const mappedProducts = selectedProducts.map((product) => {
    // Asegurarnos de que el producto tiene todos los campos requeridos
    return {
      ...product,
      description: product.description || product.name,
      sku: product.sku || product.id,
      imageUrl: product.imageUrl || (product as any).image || "",
    } as Product;
  });

  const handlePrint = () => {
    const printData = {
      products: mappedProducts,
      promotion: selectedPromotion,
    };
    navigate("/print-view", { state: printData });
  };

  const companyDetails = COMPANIES.find((c) => c.id === company);
  const empresaId = companyDetails?.empresaId || 0;
  const [plantillaSeleccionada, setPlantillaSeleccionada] =
    useState<PlantillaOption | null>(null);
    
  // Filtrar los combos disponibles según la plantilla seleccionada
  const combosDisponibles = useMemo(() => {
    return getCombosPorPlantilla(plantillaSeleccionada?.value);
  }, [plantillaSeleccionada]);
  const [modeloSeleccionado, setModeloSeleccionado] = useState<string | null>(
    null
  );
  console.log("Company selected:", company);
  console.log("Company details:", companyDetails);
  console.log("Empresa ID:", empresaId);

  const handlePreview = (product: Product) => {
    navigate("/poster-preview", {
      state: {
        product,
        promotion: selectedPromotion,
        company: companyDetails,
        showLogo,
      },
    });
  };

  const handleSelectProduct = (product: Product | Product[] | null) => {
    console.log("handleSelectProduct recibiendo:", product);

    if (Array.isArray(product)) {
      // Si recibimos un array, actualizamos directamente
      setSelectedProducts(product);
      // Actualizamos el estado de máximo alcanzado
      setMaxProductsReached(product.length >= 9);
    } else if (product) {
      // Si recibimos un solo producto, lo agregamos o quitamos del array
      setSelectedProducts((prev) => {
        const isSelected = prev.some((p) => p.id === product.id);
        if (isSelected) {
          // Si ya está seleccionado, lo quitamos
          const newProducts = prev.filter((p) => p.id !== product.id);
          setMaxProductsReached(newProducts.length >= 9);
          return newProducts;
        }
        // Si no está seleccionado y no hemos alcanzado el máximo, lo agregamos
        if (prev.length < 9) {
          const newProducts = [...prev, product];
          setMaxProductsReached(newProducts.length >= 9);
          return newProducts;
        }
        // Si ya alcanzamos el máximo, no hacemos nada
        return prev;
      });
    } else {
      // Si recibimos null, limpiamos la selección
      setSelectedProducts([]);
      setMaxProductsReached(false);
    }

    // También actualizamos el producto individual seleccionado para plantillas que solo usan uno
    if (product && !Array.isArray(product)) {
      setSelectedProduct(product);
    } else if (Array.isArray(product) && product.length > 0) {
      setSelectedProduct(product[0]);
    } else {
      setSelectedProduct(null);
      console.log("Productos seleccionados (limpiados): []");
    }
  };

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Cambiado de 2000 a 2500 para que dure 2.5 segundos

    return () => clearTimeout(timer);
  }, []);

  // Modificar handleSavePosters para usar dom-to-image en lugar de html2canvas
  const handleSavePosters = async () => {
    try {
      setIsLoading(true);
      const toastId = toast.loading("Guardando cartel...");

      const posterElement = document.querySelector(".poster-content");

      if (!posterElement) {
        throw new Error("No se encontró el elemento del cartel");
      }

      // Esperar a que todas las imágenes estén cargadas
      const images = Array.from(posterElement.getElementsByTagName("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        })
      );

      const result = await domtoimage.toPng(posterElement, {
        quality: 1,
        bgcolor: "#ffffff",
        cacheBust: true,
        scale: window.devicePixelRatio * 2,
        style: {
          transform: "none",
        },
      });

      // Convertir dataUrl a Blob
      const response = await fetch(result);
      const blob = await response.blob();

      // Obtener los detalles necesarios para el nombre del archivo
      const companyName = companyDetails?.name || "sin_empresa";

      // Si hay productos seleccionados, crear un archivo por cada producto
      if (selectedProducts.length > 0) {
        for (const productId of selectedProducts) {
          const product = products.find((p) => p.id === productId);
          if (product) {
            const productName = cleanFileName(product.name);
            const sku = product.sku || product.id;
            const fileName = `${cleanFileName(
              companyName
            )}_${productName}_${sku}.png`;

            await uploadToBucket(fileName, blob);
            toast.success(`Cartel guardado: ${fileName}`, { id: toastId });
          }
        }
      } else if (selectedCategory) {
        // Si es un cartel de categoría
        const fileName = `${cleanFileName(
          companyName
        )}_categoria_${cleanFileName(selectedCategory)}.png`;
        await uploadToBucket(fileName, blob);
        toast.success(`Cartel guardado: ${fileName}`, { id: toastId });
      }
    } catch (error: any) {
      console.error("Error al guardar el cartel:", error);
      toast.error(error.message || "Error al guardar el cartel");
    } finally {
      setIsLoading(false);
    }
  };

  // Modificar donde se usan los productos
  const filteredProducts =
    selectedCategory === "Todos" || !selectedCategory
      ? products
      : products.filter((p) => p.category === selectedCategory);

  console.log("Categoría seleccionada:", selectedCategory);
  console.log("Productos filtrados:", filteredProducts);

  // Agregar el handler para enviar a sucursales
  const handleSendToLocations = () => {
    if (!selectedProducts.length || !company) {
      alert("Por favor seleccione al menos un producto y una empresa");
      return;
    }

    // Cerrar el modal si está abierto y volver a abrirlo para reiniciar la animación
    setIsSendingModalOpen(false);
    setTimeout(() => {
      setIsSendingModalOpen(true);
    }, 100);
  };

  // Agregar las funciones de zoom
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  const handleCardSizeChange = (newSize: number) => {
    // Redondeamos al múltiplo de 5 más cercano
    const roundedSize = Math.round(newSize * 20) / 20;
    // Limitamos entre 50% y 120%
    setCardSize(Math.max(0.5, Math.min(roundedSize, 1.2)));
  };

  const handleCCChange = (selectedIds: string[]) => {
    setCC(selectedIds);
  };

  const selectedTemplateDetails = POSTER_TEMPLATES.find(
    (t) => t.id === selectedTemplate
  );

  const renderPosters = () => {
    if (selectedProducts.length > 0) {
      // Renderizar carteles de productos seleccionados
      return mappedProducts.map((product) => (
        <div
          key={product.id}
          className={`flex justify-center ${
            viewMode === "list" ? "bg-gray-100 rounded-lg p-4" : ""
          }`}
        >
          <PosterPreview
            product={product}
            promotion={selectedPromotion}
            company={companyDetails}
            showTopLogo={showLogo}
            pricePerUnit={`${product.price * 2}`}
            points="49"
            origin="ARGENTINA"
            barcode="7790895000782"
            compact={viewMode === "list"}
            selectedFormat={selectedFormat}
            zoom={zoom}
            cardSize={cardSize}
            isLandscape={isLandscape}
            financing={selectedFinancing}
          />
        </div>
      ));
    } else if (selectedCategory) {
      // Renderizar cartel de categoría
      return (
        <div className="flex justify-center">
          <PosterPreview
            category={selectedCategory}
            promotion={selectedPromotion}
            company={companyDetails}
            showTopLogo={showLogo}
            selectedFormat={selectedFormat}
            zoom={zoom}
            cardSize={cardSize}
            isLandscape={isLandscape}
            financing={selectedFinancing}
          />
        </div>
      );
    }

    return null;
  };

  // Agregar la función de descarga
  const handleDownload = async () => {
    try {
      const toastId = toast.loading("Preparando descarga...");

      const posterElement = document.querySelector(".poster-content");
      if (!posterElement) {
        throw new Error("No se encontró el elemento del cartel");
      }

      // Esperar a que todas las imágenes estén cargadas
      const images = Array.from(posterElement.getElementsByTagName("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        })
      );

      const result = await domtoimage.toPng(posterElement as HTMLElement, {
        quality: 1,
        bgcolor: "#ffffff",
        cacheBust: true,
        scale: window.devicePixelRatio * 2,
        style: {
          transform: "none",
        },
      });

      // Crear el enlace de descarga
      const link = document.createElement("a");

      // Generar nombre del archivo
      const companyName = companyDetails?.name || "sin_empresa";
      let fileName;

      if (selectedProducts.length > 0) {
        const product = products.find((p) => p.id === selectedProducts[0]);
        if (product) {
          const productName = cleanFileName(product.name);
          const sku = product.sku || product.id;
          fileName = `${cleanFileName(companyName)}_${productName}_${sku}.png`;
        } else {
          fileName = `${cleanFileName(companyName)}_cartel.png`;
        }
      } else if (selectedCategory) {
        fileName = `${cleanFileName(companyName)}_categoria_${cleanFileName(
          selectedCategory
        )}.png`;
      } else {
        fileName = `${cleanFileName(companyName)}_cartel.png`;
      }

      link.download = fileName;
      link.href = result;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Cartel descargado exitosamente", { id: toastId });
    } catch (error: any) {
      console.error("Error al descargar el cartel:", error);
      toast.error(error.message || "Error al descargar el cartel");
    }
  };

  const handleSearchPosters = async () => {
    let toastId: string | undefined;
    try {
      setIsSearchModalOpen(true);
      toastId = toast.loading("Buscando carteles...");

      const { data, error } = await supabase.storage.from("posters").list();

      if (error) {
        throw error;
      }

      if (data) {
        const sortedResults = await Promise.all(
          data
            .filter((file) => file.name.endsWith(".png"))
            .map(async (file) => {
              const { data: urlData } = supabase.storage
                .from("posters")
                .getPublicUrl(file.name);
              return {
                name: file.name,
                url: urlData.publicUrl,
                created_at: file.created_at || "",
              };
            })
        );

        const orderedResults = sortedResults.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setAllPosters(orderedResults);
        setSearchResults(orderedResults);
        if (toastId) {
          toast.success(`Se encontraron ${orderedResults.length} carteles`, {
            id: toastId,
          });
        }
      }
    } catch (error: any) {
      console.error("Error al buscar carteles:", error);
      if (toastId) {
        toast.error(error.message || "Error al buscar carteles", {
          id: toastId,
        });
      }
      setIsSearchModalOpen(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults(allPosters);
      return;
    }

    const filtered = allPosters.filter((poster) =>
      poster.name.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handlePosterSelect = async (poster: { name: string; url: string }) => {
    try {
      const toastId = toast.loading("Cargando cartel...");

      // Extraer información del nombre del archivo
      const [companyName, ...rest] = poster.name.split("_");

      // Si es un cartel de categoría
      if (rest.includes("categoria")) {
        const categoryName = rest[rest.length - 1].replace(".png", "");
        setSelectedCategory(categoryName);
        setSelectedProducts([]);
      } else {
        // Si es un cartel de producto
        const sku = rest[rest.length - 1].replace(".png", "");
        const product = products.find((p) => p.sku === sku || p.id === sku);
        if (product) {
          setSelectedProducts([product.id]);
          setSelectedCategory(product.category);
        }
      }

      // Establecer la empresa
      const company = COMPANIES.find(
        (c) => cleanFileName(c.name).toLowerCase() === companyName.toLowerCase()
      );
      if (company) {
        setCompany(company.id);
      }

      setIsSearchModalOpen(false);
      toast.success("Cartel cargado exitosamente", { id: toastId });
    } catch (error) {
      console.error("Error al cargar el cartel:", error);
      toast.error("Error al cargar el cartel");
    }
  };

  // Dentro del componente PosterEditor
  const [templateComponents, setTemplateComponents] = useState<
    Record<string, React.ComponentType<any>>
  >({});

  // Cargar los componentes al inicializar
  useEffect(() => {
    const loadComponents = async () => {
      try {
        const components: Record<string, React.ComponentType<any>> = {};

        // Cargar todos los componentes únicos
        const uniquePaths = new Set<string>();
        Object.values(PLANTILLA_MODELOS).forEach((models) => {
          models.forEach((model) => uniquePaths.add(model.componentPath));
        });

        // Cargar cada componente
        for (const path of uniquePaths) {
          console.log(`Cargando componente: ${path}`);
          const component = await loadTemplateComponent(path);
          console.log(`Componente cargado: ${path}`, !!component);
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

  // Luego, al renderizar los modelos:

  return (
    <HeaderProvider userEmail={userEmail} userName={userName}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
        <Header onBack={onBack} onLogout={onLogout} />
        <div className="poster-editor-container min-h-screen w-full flex flex-col bg-white">
          <main className="pt-10 px-6 pb-6 max-w-7xl mx-auto space-y-6 min-h-[1000px]">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-medium text-gray-900">
                Editor de Carteles
              </h2>
              {/* Botón de Buscar Cartel */}
              <button
                onClick={handleSearchPosters}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 
                          text-white font-medium hover:from-indigo-600 hover:to-indigo-700 
                          transition-all flex items-center gap-2 shadow-md"
              >
                <Search className="w-5 h-5" />
                Buscar Cartel
              </button>
            </div>

            <div className="grid grid-cols-10 gap-10 h-full">
              <div className="col-span-3 h-full flex flex-col">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-200 h-full flex flex-col">
                  {/* Primera fila: Solo empresa */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">
                        Empresa
                      </label>
                      <CompanySelect
                        value={company}
                        onChange={handleCompanyChange}
                        companies={COMPANIES}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                      />
                    </div>
                  </div>
                  {/* Selección visual de Plantilla y Modelo */}
                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plantillas:
                    </label>
                    <PlantillaSelect
                      value={plantillaSeleccionada}
                      onChange={setPlantillaSeleccionada}
                      opciones={PLANTILLAS}
                      className="bg-white/10 border-white/20 text-black placeholder:text-white/50 focus:border-white/30"
                    />
                  </div>

                  {/* Selección visual de Plantilla y Modelo */}
                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Promoción:
                    </label>
                    <ComboSelect
                      value={comboSeleccionado}
                      onChange={setComboSeleccionado}
                      options={combosDisponibles}
                      placeholder="Seleccionar tipo de promoción..."
                    />
                  </div>

                  {/* Selección visual de Categoria */}
                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categorias:
                    </label>
                    <ComboSelect
                      value={
                        CATEGORIES.find(
                          (cat) => cat.value === selectedCategory
                        ) || null
                      }
                      onChange={(option) => {
                        setSelectedCategory(option ? option.value : null);
                        setSelectedProduct(null);
                      }}
                      options={CATEGORIES}
                      placeholder="Seleccionar categoru00eda..."
                    />
                  </div>

                  {/* Selección visual de Productos */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {plantillaSeleccionada?.value === "multiproductos" ||
                        plantillaSeleccionada?.value?.includes("multiproductos")
                          ? "Productos (seleccione hasta 9)"
                          : "Producto"}
                      </label>
                      {(plantillaSeleccionada?.value === "multiproductos" ||
                        plantillaSeleccionada?.value?.includes(
                          "multiproductos"
                        )) && (
                        <span className="text-xs text-gray-500 mb-1">
                          {selectedProducts.length}/9{" "}
                          {maxProductsReached && "(Máximo alcanzado)"}
                        </span>
                      )}
                    </div>
                    <ProductSelect
                      products={
                        selectedCategory
                          ? products.filter(
                              (p) => p.category === selectedCategory
                            )
                          : products
                      }
                      value={
                        selectedProducts.length > 0
                          ? selectedProducts.map((p) => ({
                              label: p.name,
                              value: p,
                            }))
                          : null
                      }
                      onChange={(selected) => {
                        console.log("ProductSelect onChange:", selected);
                        if (Array.isArray(selected)) {
                          // Limitar a 9 productos para MultiProductos
                          const limitedSelection = selected.slice(0, 9);
                          handleSelectProduct(
                            limitedSelection.map((s) => s.value)
                          );
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
                          ? "Seleccione hasta 9 productos..."
                          : "Seleccionar producto..."
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
                  {/* Segunda fila: Plantilla y botón de Financiación */}
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

                  {/* Selección visual de Plantilla y Modelo */}
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

              <div className="col-span-7 h-full flex flex-col">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-200 flex flex-1 overflow-y-auto max-h-[700px]">
                  <div className="grid grid-cols-3 gap-2 transition-all duration-500 h-[800px]">
                    {/* Si hay mu00faltiples productos seleccionados y un modelo seleccionado, generar un cartel para cada producto */}
                    {modeloSeleccionado !== null && selectedProducts.length > 1
                      ? // Mapear cada producto seleccionado a un cartel individual
                        selectedProducts.map((product, productIndex) => {
                          const modelo = (
                            PLANTILLA_MODELOS[
                              plantillaSeleccionada?.value || ""
                            ] || []
                          ).find(
                            (m: ModeloOption) => m.id === modeloSeleccionado
                          );

                          if (!modelo) return null;

                          const Component =
                            templateComponents[modelo.componentPath];

                          return (
                            <div
                              key={`${modelo.id}-${productIndex}`}
                              className={`
                              cursor-pointer p-2 border rounded-lg flex items-center justify-center
                              transition-all duration-500 ease-in-out overflow-hidden
                              col-span-1 row-span-1 hover:border-indigo-400
                            `}
                            >
                              <div className="w-full h-[320px] max-w-[320px] aspect-[3/4]">
                                {Component &&
                                typeof Component === "function" ? (
                                  <Component
                                    small={true}
                                    nombre={product.name}
                                    precioActual={product.price?.toString()}
                                    porcentaje="20"
                                    sap={product.sku || ""}
                                    fechasDesde="15/05/2025"
                                    fechasHasta="18/05/2025"
                                    origen="ARG"
                                    precioSinImpuestos={
                                      product.price
                                        ? (product.price * 0.83).toFixed(2)
                                        : ""
                                    }
                                    financiacion={selectedFinancing}
                                    productos={[product]}
                                    titulo="Ofertas Especiales"
                                  />
                                ) : (
                                  <div>Error al cargar el componente</div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      : // Comportamiento normal cuando no hay mu00faltiples productos seleccionados
                        (
                          PLANTILLA_MODELOS[
                            plantillaSeleccionada?.value || ""
                          ] || []
                        ).map((modelo: ModeloOption) => {
                          const isSelected = modeloSeleccionado === modelo.id;
                          const isAnySelected = modeloSeleccionado !== null;
                          const Component =
                            templateComponents[modelo.componentPath];

                          return (
                            <div
                              key={modelo.id}
                              className={`
            cursor-pointer p-2 border rounded-lg flex items-center justify-center
            transition-all duration-500 ease-in-out overflow-hidden
            ${
              isSelected
                ? "col-span-3 row-span-3 scale-105 z-10 h-[600px] bg-indigo-50 ring-2 ring-indigo-500 border-indigo-500"
                : ""
            }
            ${
              isAnySelected && !isSelected
                ? "opacity-0 pointer-events-none scale-95"
                : "hover:border-indigo-400"
            }
          `}
                              onClick={() =>
                                setModeloSeleccionado(
                                  isSelected ? null : modelo.id
                                )
                              }
                            >
                              <div
                                className={`w-full h-[320px] ${
                                  isSelected ? "max-w-[700px]" : "max-w-[320px]"
                                } aspect-[3/4]`}
                              >
                                {Component &&
                                typeof Component === "function" ? (
                                  <Component
                                    small={!isSelected}
                                    nombre={selectedProduct?.name}
                                    precioActual={selectedProduct?.price?.toString()}
                                    porcentaje="20"
                                    sap={selectedProduct?.sku || ""}
                                    fechasDesde="15/05/2025"
                                    fechasHasta="18/05/2025"
                                    origen="ARG"
                                    precioSinImpuestos={
                                      selectedProduct?.price
                                        ? (
                                            selectedProduct.price * 0.83
                                          ).toFixed(2)
                                        : ""
                                    }
                                    financiacion={selectedFinancing}
                                    productos={
                                      // Para plantillas normales, pasar el producto seleccionado
                                      modelo.componentPath
                                        .toLowerCase()
                                        .includes("multiproductos")
                                        ? selectedProducts
                                        : selectedProduct
                                        ? [selectedProduct]
                                        : []
                                    }
                                    titulo="Ofertas Especiales"
                                  />
                                ) : (
                                  <div>Error al cargar el componente</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                  </div>
                </div>
              </div>
            </div>

            <ProductSelectorModal
              isOpen={isProductSelectorOpen}
              onClose={() => setIsProductSelectorOpen(false)}
              products={
                selectedCategory === "Todos" || !selectedCategory
                  ? products
                  : products.filter((p) => p.category === selectedCategory)
              }
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              category={selectedCategory}
            />

            <SendingModal
              isOpen={isSendingModalOpen}
              onClose={() => setIsSendingModalOpen(false)}
              productsCount={selectedProducts.length}
              company={company}
              empresaId={empresaId}
            />

            <PosterModal
              isOpen={!!selectedPoster}
              onClose={() => setSelectedPoster(null)}
              product={selectedPoster!}
              promotion={selectedPromotion}
              company={companyDetails}
              showLogo={showLogo}
            />

            <FinancingModal
              isOpen={isFinancingModalOpen}
              onClose={() => setIsFinancingModalOpen(false)}
              onSelect={setSelectedFinancing}
            />

            <TemplateSelect
              isOpen={isTemplateModalOpen}
              onClose={() => setIsTemplateModalOpen(false)}
              value={selectedTemplate}
              onChange={setSelectedTemplate}
            />

            {/* Modal de Búsqueda de Carteles */}
            {isSearchModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Carteles Guardados
                      </h3>
                      <button
                        onClick={() => {
                          setIsSearchModalOpen(false);
                          setSearchTerm("");
                        }}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                          placeholder="Buscar cartel por nombre..."
                          className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="grid grid-cols-4 gap-4">
                      {searchResults.map((poster, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
                          onClick={() => handlePosterSelect(poster)}
                        >
                          <img
                            src={poster.url}
                            alt={poster.name}
                            className="w-full h-48 object-contain mb-3 bg-gray-50 rounded"
                          />
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {poster.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(poster.created_at).toLocaleDateString()}
                            </p>
                            <button
                              className="mt-2 w-full px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 
                                        bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                            >
                              Editar Cartel
                            </button>
                          </div>
                        </div>
                      ))}
                      {searchResults.length === 0 && (
                        <div className="col-span-4 text-center py-12">
                          <p className="text-gray-500">
                            No se encontraron carteles
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      {/* Modal de financiación */}
      <FinancingModal
        isOpen={isFinancingModalOpen}
        onClose={() => setIsFinancingModalOpen(false)}
        onSelect={(options) => {
          setSelectedFinancing(options);
          setIsFinancingModalOpen(false);
        }}
      />
    </HeaderProvider>
  );
};
