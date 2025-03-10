import React, { useState, useEffect } from 'react';
import { ArrowLeft, LayoutGrid, List, Minus, Plus, LayoutTemplate } from 'lucide-react';
import { CompanySelect } from './CompanySelect';
import { RegionSelect } from './RegionSelect';
import { LocationSelect } from './LocationSelect';
import { PromotionSelect } from './PromotionSelect';
import { ProductSelect } from './ProductSelect';
import { CategorySelect } from './CategorySelect';
import { PosterPreview } from './PosterPreview';
import { useNavigate } from 'react-router-dom';
import { Header } from '../shared/Header';
import { useTheme } from '../../hooks/useTheme';
import { ProductSelectorModal } from '../Products/ProductSelectorModal';
import { PosterModal } from './PosterModal';
import { COMPANIES } from '../../data/companies';
import { LOCATIONS, REGIONS } from '../../data/locations';
import { LoadingModal } from '../LoadingModal';
import { products } from '../../data/products';
import { SendingModal } from './SendingModal';
import { TemplateSelect } from './TemplateSelect';
import { FinancingModal } from './FinancingModal';
import { CreditCard } from 'lucide-react';
import { POSTER_TEMPLATES } from '../../constants/templates';
import { HeaderProvider } from '../shared/HeaderProvider';
import { toast } from 'react-hot-toast';
import { uploadToBucket } from '../../lib/supabaseClient-carteles';
import html2canvas from 'html2canvas';
import { Product } from '../../types/product';
import { Promotion } from '../../types/promotion';
import { supabase } from '../../lib/supabaseClient';

interface PosterEditorProps {
  onBack: () => void;
  onLogout: () => void;
  initialProducts?: string[];
  initialPromotion?: any;
  userEmail: string;
  userName: string;
}

const PAPER_FORMATS = [
  { id: 'A2', width: '420mm', height: '594mm', name: 'A2 (420 × 594 mm)' },
  { id: 'A3', width: '297mm', height: '420mm', name: 'A3 (297 × 420 mm)' },
  { id: 'A4', width: '210mm', height: '297mm', name: 'A4 (210 × 297 mm)' },
  { id: 'letter', width: '215.9mm', height: '279.4mm', name: 'Carta (215.9 × 279.4 mm)' },
  { id: 'legal', width: '215.9mm', height: '355.6mm', name: 'Legal (215.9 × 355.6 mm)' }
];

const PROMOTIONS: Promotion[] = [
  {
    id: '1',
    title: 'American Express 25% OFF',
    description: 'Comprá cuando quieras y programá tu entrega los días Jueves.',
    discount: '25% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Tope de reintegro $2000', 'Válido solo los jueves'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'American Express',
    cardType: 'Todas las tarjetas'
  },
  {
    id: '2',
    title: 'Hasta 40% OFF en Especiales de la semana',
    description: 'Descuentos especiales en productos seleccionados',
    discount: 'Hasta 40% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Válido solo los jueves'],
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  {
    id: '3',
    title: 'Tarjeta Cencosud 20% OFF',
    description: 'Realizá tus compras los días Miércoles',
    discount: '20% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los miércoles'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'Cencosud'
  },
  {
    id: '4',
    title: '2do al 70% en Almacén, Bebidas y más',
    description: 'En la segunda unidad de productos seleccionados',
    discount: '70% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Valido solo comprando dos productos iguales el segundo al 70%'],
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  {
    id: '5',
    title: 'Hasta 35% y Hasta 12 CSI',
    description: 'Descuentos especiales en productos seleccionados con cuotas sin interés',
    discount: '35% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los jueves'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'Banco Nación'
  },
  {
    id: '6',
    title: 'Santander 30% OFF',
    description: 'Todos los días con Tarjetas Santander',
    discount: '30% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los días'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'Santander'
  },
  {
    id: '7',
    title: 'BBVA 25% OFF',
    description: 'Descuentos exclusivos para clientes BBVA',
    discount: '25% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los jueves'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'BBVA'
  },
  {
    id: '8',
    title: 'Banco Provincia 30% OFF',
    description: 'Miércoles y Sábados con Banco Provincia',
    discount: '30% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los miércoles y sábados'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'Banco Provincia'
  },
  {
    id: '9',
    title: 'Banco Nación 25% OFF',
    description: 'Descuentos especiales con Banco Nación',
    discount: '25% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556742205-e7530469f4eb?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los jueves'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'Banco Nación'
  },
  {
    id: '10',
    title: '2da Unidad 70% OFF',
    description: 'En la segunda unidad de productos seleccionados',
    discount: '70% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Válido en la compra de dos unidades iguales', 'Productos seleccionados'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    type: 'second-70'
  },
  {
    id: '11',
    title: '2x1 en Productos Seleccionados',
    description: 'Llevá 2 y pagá 1 en productos seleccionados',
    discount: '2x1',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Válido en productos seleccionados', 'Llevando dos unidades iguales'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    type: '2x1'
  },
  {
    id: '12',
    title: '3x2 en Productos Seleccionados',
    description: 'Llevá 3 y pagá 2 en productos seleccionados',
    discount: '3x2',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Válido en productos seleccionados', 'Llevando tres unidades iguales'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    type: '3x2'
  }
];

console.log('Importación de productos:', { products });

// Extraer categorías únicas de los productos
const CATEGORIES = Array.from(new Set(products.map(p => p.category)));
console.log('Categorías encontradas:', CATEGORIES);

const FINANCING_OPTIONS: FinancingOption[] = [
  {
    bank: 'Visa',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png',
    cardName: 'Visa',
    cardImage: 'https://www.visa.com.ar/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Find%20a%20Card/Credit%20cards/Classic/visa_classic_card_400x225.jpg',
    plan: 'Hasta 12 cuotas sin interés'
  },
  {
    bank: 'Mastercard',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png',
    cardName: 'Mastercard',
    cardImage: 'https://www.mastercard.com.ar/content/dam/public/mastercardcom/lac/ar/home/consumidores/encontra-tu-tarjeta/tarjetas-credito/platinum-card.png',
    plan: 'Hasta 6 cuotas sin interés'
  },
  {
    bank: 'American Express',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/American_Express_logo.svg/1200px-American_Express_logo.svg.png',
    cardName: 'American Express',
    cardImage: 'https://www.americanexpress.com/content/dam/amex/es-ar/negocios/corp_green_ar_960x608.png',
    plan: '25% OFF'
  }
];

export const PosterEditor: React.FC<PosterEditorProps> = ({ 
  onBack, 
  onLogout, 
  initialProducts = [], 
  initialPromotion,
  userEmail,
  userName
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [company, setCompany] = useState('');
  const [region, setRegion] = useState<string[]>([]);
  const [cc, setCC] = useState<string[]>([]);
  const [promotion, setPromotion] = useState(initialPromotion?.id || '');
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();
  const [showLogo, setShowLogo] = useState(true);
  const [showPesosCheck, setShowPesosCheck] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<Product | null>(null);
  const [selectedFormat, setSelectedFormat] = useState(PAPER_FORMATS[2]); // A4 por defecto
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cardSize, setCardSize] = useState(0.85);
  const [isLandscape, setIsLandscape] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isFinancingModalOpen, setIsFinancingModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedFinancing, setSelectedFinancing] = useState<FinancingOption[]>([]);

  console.log('LOCATIONS imported:', LOCATIONS); // Debug
  console.log('COMPANIES imported:', COMPANIES); // Debug
  console.log('Productos disponibles:', products);

  // Limpiar región y CC cuando cambia la empresa
  const handleCompanyChange = (newCompany: string) => {
    setCompany(newCompany);
    setRegion([]);
    setCC([]);
  };

  // Filtrar ubicaciones basado en la empresa y región seleccionadas
  const filteredLocations = React.useMemo(() => {
    let locations = [...LOCATIONS];
    console.log('Company selected:', company); // Debug
    console.log('All locations:', locations); // Debug

    // Filtrar por empresa si hay una seleccionada y no es "TODAS"
    if (company && company !== 'no-logo') {
      locations = locations.filter(loc => {
        const matches = loc.id.startsWith(company.toLowerCase());
        console.log(`Checking location ${loc.id} against ${company.toLowerCase()}: ${matches}`); // Debug
        return matches;
      });
    }

    console.log('Filtered by company:', locations); // Debug

    // Filtrar por regiones seleccionadas
    if (region.length > 0 && !region.includes('todos')) {
      locations = locations.filter(loc => region.includes(loc.region));
    }

    console.log('Final filtered locations:', locations); // Debug
    return locations;
  }, [company, region]);

  // Obtener regiones únicas basadas en las ubicaciones filtradas por empresa
  const availableRegions = React.useMemo(() => {
    console.log('Calculating regions for company:', company); // Debug
    const locations = company && company !== 'no-logo'
      ? LOCATIONS.filter(loc => {
          const matches = loc.id.startsWith(company.toLowerCase());
          console.log(`Checking location ${loc.id} for regions: ${matches}`); // Debug
          return matches;
        })
      : LOCATIONS;
      
    const regions = new Set(locations.map(loc => loc.region));
    console.log('Available regions:', regions); // Debug
    
    const result = [
      { id: 'todos', name: 'Todas las Regiones' },
      ...REGIONS.filter(r => r.id !== 'todos' && regions.has(r.id))
    ];
    console.log('Final regions list:', result); // Debug
    return result;
  }, [company]);

  const selectedPromotion = PROMOTIONS.find(p => p.id === promotion) as Promotion | undefined;

  // Modificar el mapeo de productos para asegurar que tienen todos los campos requeridos
  const mappedProducts = selectedProducts.map(productId => {
    const product = products.find(p => p.id === productId);
    if (product) {
      // Asegurarnos de que el producto tiene todos los campos requeridos
      return {
        ...product,
        description: product.description || product.name,
        sku: product.sku || product.id,
        imageUrl: product.imageUrl || product.image || '',
      } as Product;
    }
    return undefined;
  }).filter((p): p is Product => p !== undefined);

  const handlePrint = () => {
    const printData = {
      products: mappedProducts,
      promotion: selectedPromotion
    };
    navigate('/print-view', { state: printData });
  };

  const companyDetails = COMPANIES.find(c => c.id === company);

  const handlePreview = (product: Product) => {
    navigate('/poster-preview', {
      state: {
        product,
        promotion: selectedPromotion,
        company: companyDetails,
        showLogo
      }
    });
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Cambiado de 2000 a 2500 para que dure 2.5 segundos

    return () => clearTimeout(timer);
  }, []);

  // Modificar handleSavePosters para trabajar sin autenticación
  const handleSavePosters = async () => {
    try {
      const toastId = toast.loading('Guardando cartel...');

      // Usar el id del contenedor
      const posterContainer = document.getElementById('poster-container');
      if (!posterContainer) {
        throw new Error('No se encontró el contenedor del cartel');
      }

      // Buscar el primer poster dentro del contenedor
      const posterElement = posterContainer.querySelector('.poster-preview');
      if (!posterElement) {
        throw new Error('No hay ningún cartel seleccionado para guardar');
      }

      // Temporalmente remover el fondo cuadriculado
      const elementsWithGrid = posterElement.querySelectorAll('[style*="linear-gradient"]');
      const originalStyles = new Map();

      elementsWithGrid.forEach((element) => {
        originalStyles.set(element, element.getAttribute('style'));
        element.style.backgroundImage = 'none';
      });

      // Capturar el cartel
      const canvas = await html2canvas(posterElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true
      });

      // Restaurar los estilos originales
      elementsWithGrid.forEach((element) => {
        element.setAttribute('style', originalStyles.get(element) || '');
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob as Blob), 'image/png', 1.0);
      });

      // Función para limpiar el texto para el nombre del archivo
      const cleanFileName = (text: string) => {
        return text
          .toLowerCase()
          .replace(/[áéíóúñü]/g, c => ({ 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n', 'ü': 'u' })[c] || c)
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
      };

      // Obtener los componentes del nombre
      const companyName = companyDetails?.name || 'sin_empresa';
      const promotionName = selectedPromotion?.title || 'sin_promocion';
      const productName = selectedProducts.length > 0 
        ? mappedProducts[0].name 
        : selectedCategory || 'sin_producto';

      // Formar el nombre del archivo
      const fileName = `${cleanFileName(companyName)}_${cleanFileName(promotionName)}_${cleanFileName(productName)}.png`;

      await uploadToBucket(fileName, blob);
      toast.success('Cartel guardado correctamente', { id: toastId });
    } catch (error: any) {
      console.error('Error al guardar el cartel:', error);
      toast.error(error.message || 'Error al guardar el cartel');
    }
  };

  // Modificar donde se usan los productos
  const filteredProducts = selectedCategory === 'Todos' || !selectedCategory 
    ? products
    : products.filter(p => p.category === selectedCategory);

  console.log('Categoría seleccionada:', selectedCategory);
  console.log('Productos filtrados:', filteredProducts);

  // Agregar el handler para enviar a sucursales
  const handleSendToLocations = () => {
    if (!cc.length) {
      alert('Por favor seleccione al menos una sucursal');
      return;
    }
    if (!selectedProducts.length) {
      alert('Por favor seleccione al menos un producto');
      return;
    }

    // Cerrar el modal si está abierto y volver a abrirlo para reiniciar la animación
    setIsSendingModalOpen(false);
    setTimeout(() => {
      setIsSendingModalOpen(true);
    }, 100);
  };

  // Agregar las funciones de zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  const handleCardSizeChange = (newSize: number) => {
    // Redondeamos al múltiplo de 5 más cercano
    const roundedSize = Math.round(newSize * 20) / 20;
    // Limitamos entre 50% y 120%
    setCardSize(Math.max(0.5, Math.min(roundedSize, 1.2)));
  };

  const handleCCChange = (selectedIds: string[]) => {
    setCC(selectedIds);
  };

  const selectedTemplateDetails = POSTER_TEMPLATES.find(t => t.id === selectedTemplate);

  const renderPosters = () => {
    if (selectedProducts.length > 0) {
      // Renderizar carteles de productos seleccionados
      return mappedProducts.map(product => (
        <div key={product.id} className={`flex justify-center ${viewMode === 'list' ? 'bg-gray-100 rounded-lg p-4' : ''}`}>
          <PosterPreview
            product={product}
            promotion={selectedPromotion}
            company={companyDetails}
            showTopLogo={showLogo}
            pricePerUnit={`${product.price * 2}`}
            points="49"
            origin="ARGENTINA"
            barcode="7790895000782"
            compact={viewMode === 'list'}
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

  const handleDigitalSignageClick = () => {
    // Preparamos los datos del cartel actual
    const currentPosterData = {
      products: mappedProducts,
      category: selectedCategory,
      promotion: selectedPromotion,
      company: companyDetails,
      showLogo,
      financing: selectedFinancing,
      template: selectedTemplate
    };

    // Abrimos en nueva pestaña
    const newWindow = window.open('/digital-signage', '_blank');
    if (newWindow) {
      // Guardamos los datos en sessionStorage para recuperarlos en la nueva vista
      sessionStorage.setItem('currentPosterData', JSON.stringify(currentPosterData));
      newWindow.focus();
    }
  };

  return (
    <HeaderProvider userEmail={userEmail} userName={userName}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
        <Header onBack={onBack} onLogout={onLogout} />
        <div className="poster-editor-container min-h-screen flex flex-col bg-white">
          <main className="pt-10 px-6 pb-6 max-w-7xl mx-auto space-y-6 min-h-[1000px]">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-medium text-gray-900">Editor de Carteles</h2>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-200">
              {/* Primera fila: Empresa, Región y CC en línea */}
              <div className="grid grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Región
                  </label>
                  <RegionSelect
                    value={region}
                    onChange={(values) => {
                      setRegion(values);
                      setCC([]);
                    }}
                    regions={availableRegions}
                    isMulti={true}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    CC:
                  </label>
                  <LocationSelect
                    value={cc}
                    onChange={handleCCChange}
                    locations={filteredLocations}
                    disabled={region.length === 0}
                    isMulti={true}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/30"
                  />
                </div>
              </div>

              {/* Segunda fila: Plantilla y botón de Financiación */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 
                        rounded-lg hover:bg-gray-50 transition-colors text-gray-700 w-64"
                    >
                      <LayoutTemplate className="w-5 h-5 text-gray-500 shrink-0" />
                      <span className="truncate">
                        {selectedTemplateDetails?.name || "Seleccionar plantilla..."}
                      </span>
                    </button>
                    <button
                      onClick={() => setIsFinancingModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 
                        rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <span>
                        {selectedFinancing.length > 0
                          ? `${selectedFinancing.length} financiación${selectedFinancing.length > 1 ? 'es' : ''}`
                          : "Ver financiación"
                        }
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promoción:
                  </label>
                  <PromotionSelect
                    value={promotion}
                    onChange={setPromotion}
                    promotions={PROMOTIONS}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                  />
                </div>

                {selectedPromotion && (
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-start gap-6">
                      <img 
                        src={selectedPromotion.imageUrl}
                        alt={selectedPromotion.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {selectedPromotion.title}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                              {selectedPromotion.category}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{selectedPromotion.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Descuento</h4>
                            <p className="text-2xl font-bold text-indigo-600">{selectedPromotion.discount}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Vigencia</h4>
                            <p className="text-gray-900">
                              {new Date(selectedPromotion.startDate).toLocaleDateString()} - {new Date(selectedPromotion.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {selectedPromotion.category === 'Bancaria' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Banco</h4>
                              <p className="text-gray-900">{selectedPromotion.bank}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Tarjetas</h4>
                              <p className="text-gray-900">{selectedPromotion.cardType}</p>
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Condiciones</h4>
                          <ul className="space-y-1">
                            {selectedPromotion.conditions.map((condition, index) => (
                              <li key={index} className="text-gray-600 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                {condition}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría:
                    </label>
                    <CategorySelect
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      categories={CATEGORIES}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Productos:
                    </label>
                    <div className="relative">
                      <ProductSelect
                        value={selectedProducts}
                        onChange={setSelectedProducts}
                        products={filteredProducts}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                        menuPlacement="top"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {(selectedCategory || mappedProducts.length > 0) && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    {/* Controles agrupados */}
                    <div className="flex items-center gap-4">
                      {/* Vista grilla/lista */}
                      <div className="flex bg-gray-200 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'grid' ? 'bg-gray-300 text-gray-700' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'list' ? 'bg-gray-300 text-gray-700' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Separador vertical */}
                      <div className="h-8 w-px bg-gray-200"></div>

                      {/* Selector de formato */}
                      <div className="relative">
                        <button
                          onClick={() => setShowFormatSelector(!showFormatSelector)}
                          className="bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                        >
                          {selectedFormat.id}
                          <span className="text-xs text-gray-500">
                            {selectedFormat.width} × {selectedFormat.height}
                          </span>
                          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {/* Menú desplegable de formatos */}
                        {showFormatSelector && (
                          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-64 z-50">
                            {PAPER_FORMATS.map(format => (
                              <button
                                key={format.id}
                                onClick={() => {
                                  setSelectedFormat(format);
                                  setShowFormatSelector(false);
                                }}
                                className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between ${
                                  selectedFormat.id === format.id ? 'bg-gray-50 text-indigo-600' : 'text-gray-700'
                                }`}
                              >
                                <span className="font-medium">{format.name}</span>
                                <span className="text-xs text-gray-500">
                                  {format.width} × {format.height}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Separador vertical */}
                      <div className="h-8 w-px bg-gray-200"></div>

                      {/* Control de orientación */}
                      <button
                        onClick={() => setIsLandscape(!isLandscape)}
                        className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center gap-2"
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform ${isLandscape ? 'rotate-90' : ''}`} 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor"
                        >
                          <rect x="4" y="5" width="16" height="14" rx="2" strokeWidth="2"/>
                        </svg>
                        <span className="text-sm">
                          {isLandscape ? 'Horizontal' : 'Vertical'}
                        </span>
                      </button>

                      {/* Separador vertical */}
                      <div className="h-8 w-px bg-gray-200"></div>

                      {/* Controles de zoom */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleZoomOut}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={handleZoomIn}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Separador vertical */}
                      <div className="h-8 w-px bg-gray-200"></div>

                      {/* Controles de tamaño del cartel */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCardSizeChange(cardSize - 0.05)}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                          {Math.round(cardSize * 100)}%
                        </span>
                        <button
                          onClick={() => handleCardSizeChange(cardSize + 0.05)}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controles del lado derecho */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-logo"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="show-logo" className="text-sm text-gray-700">
                      Mostrar logo
                    </label>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSendToLocations}
                      disabled={!cc.length || !selectedProducts.length}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors
                        ${(!cc.length || !selectedProducts.length)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                      Enviar a Sucursales
                    </button>

                    {/* Botones agrupados */}
                    <div className="flex items-center gap-2">
                      {/* Botón de Cartelería Digital */}
                      <button
                        onClick={handleDigitalSignageClick}
                        className="px-4 py-2 rounded-lg font-medium bg-emerald-600 text-white 
                                  hover:bg-emerald-700 transition-colors flex items-center gap-2"
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Cartelería Digital
                      </button>

                      {/* Nuevo botón de Guardar Cartel */}
                      <button
                        onClick={handleSavePosters}
                        className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white 
                                  hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                          />
                        </svg>
                        Guardar Cartel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div id="poster-container" className="h-[800px] w-[1080px] mx-auto overflow-y-auto">
              <div className={viewMode === 'grid' ? 'space-y-8' : 'space-y-4'}>
                {renderPosters()}
              </div>
            </div>

            <ProductSelectorModal
              isOpen={isProductSelectorOpen}
              onClose={() => setIsProductSelectorOpen(false)}
              products={selectedCategory === 'Todos' || !selectedCategory 
                ? products
                : products.filter(p => p.category === selectedCategory)
              }
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              category={selectedCategory}
            />

            <SendingModal
              isOpen={isSendingModalOpen}
              onClose={() => setIsSendingModalOpen(false)}
              locations={filteredLocations.filter(loc => cc.includes(loc.id))}
              productsCount={selectedProducts.length}
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
          </main>
        </div>
      </div>
    </HeaderProvider>
  );
}; 