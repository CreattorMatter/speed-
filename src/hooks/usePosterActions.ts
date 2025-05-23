import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import domtoimage from 'dom-to-image-improved';
import { uploadToBucket } from '../lib/supabaseClient-carteles';
import { supabase } from '../lib/supabaseClient';
import { products, type Product } from '../data/products';
import { COMPANIES } from '../data/companies';

// Función para limpiar nombres de archivo
const cleanFileName = (text: string): string => {
  return text
    .toLowerCase()
    .replace(
      /[áéíóúñü]/g,
      (c) => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n", ü: "u" }[c] || c)
    )
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};

// Tipo para el estado del poster
interface PosterState {
  selectedProducts: string[]; // IDs de productos
  selectedCategory: string;
  company: string;
  setIsLoading: (loading: boolean) => void;
  setSearchResults: (results: Array<{name: string; url: string; created_at: string}>) => void;
  setAllPosters: (posters: Array<{name: string; url: string; created_at: string}>) => void;
  setIsSearchModalOpen: (open: boolean) => void;
  setSelectedProducts: (products: string[] | ((prev: string[]) => string[])) => void;
  setSelectedCategory: (category: string) => void;
  setCompany: (company: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setMaxProductsReached: (reached: boolean) => void;
}

export const usePosterActions = (state: PosterState) => {
  const {
    selectedProducts,
    selectedCategory,
    company,
    setIsLoading,
    setSearchResults,
    setAllPosters,
    setIsSearchModalOpen,
    setSelectedProducts,
    setSelectedCategory,
    setCompany,
    setSelectedProduct,
    setMaxProductsReached
  } = state;

  // Acción para guardar posters
  const handleSavePosters = useCallback(async () => {
    try {
      setIsLoading(true);
      const toastId = toast.loading("Guardando cartel...");

      const posterElement = document.querySelector(".poster-content") as HTMLElement;
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
      });

      const response = await fetch(result);
      const blob = await response.blob();
      const companyDetails = COMPANIES.find((c) => c.id === company);
      const companyName = companyDetails?.name || "sin_empresa";

      if (selectedProducts.length > 0) {
        for (const productId of selectedProducts) {
          const product = products.find((p) => p.id === productId);
          if (product) {
            const productName = cleanFileName(product.name);
            const sku = product.sku || product.id;
            const fileName = `${cleanFileName(companyName)}_${productName}_${sku}.png`;
            await uploadToBucket(fileName, blob);
            toast.success(`Cartel guardado: ${fileName}`, { id: toastId });
          }
        }
      } else if (selectedCategory) {
        const fileName = `${cleanFileName(companyName)}_categoria_${cleanFileName(selectedCategory)}.png`;
        await uploadToBucket(fileName, blob);
        toast.success(`Cartel guardado: ${fileName}`, { id: toastId });
      }
    } catch (error: any) {
      console.error("Error al guardar el cartel:", error);
      toast.error(error.message || "Error al guardar el cartel");
    } finally {
      setIsLoading(false);
    }
  }, [selectedProducts, selectedCategory, company, setIsLoading]);

  // Acción para descargar poster
  const handleDownload = useCallback(async () => {
    try {
      const toastId = toast.loading("Preparando descarga...");
      
      const posterElement = document.querySelector(".poster-content") as HTMLElement;
      if (!posterElement) throw new Error("No se encontró el elemento del cartel");

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
      });

      const link = document.createElement("a");
      const companyDetails = COMPANIES.find((c) => c.id === company);
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
        fileName = `${cleanFileName(companyName)}_categoria_${cleanFileName(selectedCategory)}.png`;
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
  }, [selectedProducts, selectedCategory, company]);

  // Acción para buscar posters
  const handleSearchPosters = useCallback(async () => {
    let toastId: string | undefined;
    try {
      setIsSearchModalOpen(true);
      toastId = toast.loading("Buscando carteles...");

      const { data, error } = await supabase.storage.from("posters").list();
      if (error) throw error;

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
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setAllPosters(orderedResults);
        setSearchResults(orderedResults);
        if (toastId) {
          toast.success(`Se encontraron ${orderedResults.length} carteles`, { id: toastId });
        }
      }
    } catch (error: any) {
      console.error("Error al buscar carteles:", error);
      if (toastId) {
        toast.error(error.message || "Error al buscar carteles", { id: toastId });
      }
      setIsSearchModalOpen(false);
    }
  }, [setIsSearchModalOpen, setAllPosters, setSearchResults]);

  // Acción para seleccionar producto
  const handleSelectProduct = useCallback((product: Product | Product[] | null) => {
    if (Array.isArray(product)) {
      setSelectedProducts(product.map((p) => p.id));
      setMaxProductsReached(product.length >= 9);
    } else if (product) {
      setSelectedProducts((prev: string[]) => {
        const isSelected = prev.some((id) => id === product.id);
        if (isSelected) {
          const newProducts = prev.filter((id) => id !== product.id);
          setMaxProductsReached(newProducts.length >= 9);
          return newProducts;
        }
        if (prev.length < 9) {
          const newProducts = [...prev, product.id];
          setMaxProductsReached(newProducts.length >= 9);
          return newProducts;
        }
        return prev;
      });
    } else {
      setSelectedProducts([]);
      setMaxProductsReached(false);
    }

    if (product && !Array.isArray(product)) {
      setSelectedProduct(product);
    } else if (Array.isArray(product) && product.length > 0) {
      setSelectedProduct(product[0]);
    } else {
      setSelectedProduct(null);
    }
  }, [setSelectedProducts, setMaxProductsReached, setSelectedProduct]);

  // Acción para remover un producto específico de la selección
  const handleRemoveProduct = useCallback((productId: string) => {
    setSelectedProducts((prev: string[]) => {
      const newProducts = prev.filter((id) => id !== productId);
      setMaxProductsReached(newProducts.length >= 9);
      
      // Si no quedan productos seleccionados, limpiar el producto individual también
      if (newProducts.length === 0) {
        setSelectedProduct(null);
      } else if (newProducts.length === 1) {
        // Si queda solo uno, establecerlo como producto individual
        const remainingProduct = products.find(p => p.id === newProducts[0]);
        if (remainingProduct) {
          setSelectedProduct(remainingProduct);
        }
      }
      
      return newProducts;
    });
  }, [setSelectedProducts, setMaxProductsReached, setSelectedProduct]);

  // Acción para seleccionar poster
  const handlePosterSelect = useCallback(async (poster: { name: string; url: string }) => {
    try {
      const toastId = toast.loading("Cargando cartel...");
      const [companyName, ...rest] = poster.name.split("_");

      if (rest.includes("categoria")) {
        const categoryName = rest[rest.length - 1].replace(".png", "");
        setSelectedCategory(categoryName);
        setSelectedProducts([]);
      } else {
        const sku = rest[rest.length - 1].replace(".png", "");
        const product = products.find((p) => p.sku === sku || p.id === sku);
        if (product) {
          setSelectedProducts([product.id]);
          setSelectedCategory(product.category);
        }
      }

      const companyData = COMPANIES.find(
        (c) => cleanFileName(c.name).toLowerCase() === companyName.toLowerCase()
      );
      if (companyData) {
        setCompany(companyData.id);
      }

      setIsSearchModalOpen(false);
      toast.success("Cartel cargado exitosamente", { id: toastId });
    } catch (error) {
      console.error("Error al cargar el cartel:", error);
      toast.error("Error al cargar el cartel");
    }
  }, [setSelectedCategory, setSelectedProducts, setCompany, setIsSearchModalOpen]);

  return {
    handleSavePosters,
    handleDownload,
    handleSearchPosters,
    handleSelectProduct,
    handleRemoveProduct,
    handlePosterSelect,
  };
}; 