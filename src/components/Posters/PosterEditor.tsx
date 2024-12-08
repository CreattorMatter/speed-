import React, { useState } from 'react';
import { ArrowLeft, LayoutGrid, List } from 'lucide-react';
import { CompanySelect } from './CompanySelect';
import { RegionSelect } from './RegionSelect';
import { LocationSelect } from './LocationSelect';
import { PromotionSelect } from './PromotionSelect';
import { ProductSelect } from './ProductSelect';
import { CategorySelect } from './CategorySelect';
import { PromoType } from './PromoTypeSelect';
import { PosterPreview } from './PosterPreview';
import { CategoryPosterPreview } from './CategoryPosterPreview';
import { useNavigate } from 'react-router-dom';
import { LocationMap } from './LocationMap';
import { Header } from '../shared/Header';
import { useTheme } from '../../hooks/useTheme';
import { ProductSelectorModal } from '../Products/ProductSelectorModal';
import { PosterModal } from './PosterModal';
import { COMPANIES } from '../../data/companies';
import { LOCATIONS, REGIONS } from '../../data/locations';

interface PosterEditorProps {
  onBack: () => void;
  onLogout: () => void;
  initialProducts?: string[];
  initialPromotion?: Promotion;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl: string;
  category: 'Bancaria' | 'Especial' | 'Categoría';
  conditions: string[];
  startDate: string;
  endDate: string;
  bank?: string;
  cardType?: string;
  type?: 'percentage' | '2x1' | '3x2' | 'second-70';
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

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

const PRODUCTS = [
  {
    id: '1',
    name: 'Leche La Serenísima',
    description: 'Leche entera 1L',
    price: 890,
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60',
    category: 'Lácteos'
  },
  {
    id: '2',
    name: 'Yogur Ser',
    description: 'Yogur bebible frutilla 1L',
    price: 950,
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60',
    category: 'Lácteos'
  },
  {
    id: '3',
    name: 'Queso Cremon',
    description: 'Queso cremoso x kg',
    price: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=500&auto=format&fit=crop&q=60',
    category: 'Lácteos'
  },
  {
    id: '4',
    name: 'Manteca La Serenísima',
    description: 'Manteca x 200g',
    price: 780,
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=60',
    category: 'Lácteos'
  },
  {
    id: '5',
    name: 'Coca-Cola',
    description: 'Gaseosa Coca-Cola 2.25L',
    price: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500&auto=format&fit=crop&q=60',
    category: 'Bebidas'
  },
  {
    id: '6',
    name: 'Sprite',
    description: 'Gaseosa Sprite 2.25L',
    price: 1150,
    imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&auto=format&fit=crop&q=60',
    category: 'Bebidas'
  },
  {
    id: '7',
    name: 'Fanta',
    description: 'Gaseosa Fanta 2.25L',
    price: 1150,
    imageUrl: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=500&auto=format&fit=crop&q=60',
    category: 'Bebidas'
  },
  {
    id: '8',
    name: 'Agua Mineral',
    description: 'Agua mineral sin gas 2L',
    price: 580,
    imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=500&auto=format&fit=crop&q=60',
    category: 'Bebidas'
  },
  {
    id: '9',
    name: 'Pan Bimbo',
    description: 'Pan de molde blanco x 500g',
    price: 920,
    imageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500&auto=format&fit=crop&q=60',
    category: 'Almacén'
  },
  {
    id: '10',
    name: 'Fideos Matarazzo',
    description: 'Fideos tallarín x 500g',
    price: 560,
    imageUrl: 'https://images.unsplash.com/photo-1612966769270-fe9b9b63ac1a?w=500&auto=format&fit=crop&q=60',
    category: 'Almacén'
  },
  {
    id: '11',
    name: 'Arroz Gallo',
    description: 'Arroz largo fino x 1kg',
    price: 890,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
    category: 'Almacén'
  },
  {
    id: '12',
    name: 'Aceite Natura',
    description: 'Aceite de girasol 1.5L',
    price: 1450,
    imageUrl: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=500&auto=format&fit=crop&q=60',
    category: 'Almacén'
  },
  {
    id: '13',
    name: 'Galletitas Oreo',
    description: 'Galletitas chocolate x 118g',
    price: 450,
    imageUrl: 'https://images.unsplash.com/photo-1584644207984-15cf898e18d1?w=500&auto=format&fit=crop&q=60',
    category: 'Almacén'
  },
  {
    id: '14',
    name: 'Chocolate Milka',
    description: 'Chocolate con leche x 120g',
    price: 780,
    imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=500&auto=format&fit=crop&q=60',
    category: 'Almacén'
  },
  {
    id: '15',
    name: 'Papel Higiénico Elite',
    description: 'Pack x 4 rollos doble hoja',
    price: 890,
    imageUrl: 'https://images.unsplash.com/photo-1585602173562-e7eeb0e6f380?w=500&auto=format&fit=crop&q=60',
    category: 'Limpieza'
  },
  {
    id: '16',
    name: 'Detergente Magistral',
    description: 'Detergente líquido 750ml',
    price: 680,
    imageUrl: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=500&auto=format&fit=crop&q=60',
    category: 'Limpieza'
  },
  {
    id: '17',
    name: 'Jabón en Polvo Skip',
    description: 'Jabón en polvo 3kg',
    price: 2890,
    imageUrl: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=500&auto=format&fit=crop&q=60',
    category: 'Limpieza'
  },
  {
    id: '18',
    name: 'Suavizante Comfort',
    description: 'Suavizante para ropa 900ml',
    price: 790,
    imageUrl: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?w=500&auto=format&fit=crop&q=60',
    category: 'Limpieza'
  }
];

// Extraer categorías únicas de los productos
const CATEGORIES = Array.from(new Set(PRODUCTS.map(p => p.category)));

export const PosterEditor: React.FC<PosterEditorProps> = ({ 
  onBack, 
  onLogout, 
  initialProducts = [], 
  initialPromotion 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [company, setCompany] = useState('');
  const [region, setRegion] = useState('');
  const [cc, setCC] = useState('');
  const [promotion, setPromotion] = useState(initialPromotion?.id || '');
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();
  const [showLogo, setShowLogo] = useState(true);
  const [showPesosCheck, setShowPesosCheck] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<Product | null>(null);

  console.log('LOCATIONS imported:', LOCATIONS); // Debug
  console.log('COMPANIES imported:', COMPANIES); // Debug

  // Limpiar región y CC cuando cambia la empresa
  const handleCompanyChange = (newCompany: string) => {
    setCompany(newCompany);
    setRegion('');
    setCC('');
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

    // Luego filtrar por región si hay una seleccionada y no es "todos"
    if (region && region !== 'todos') {
      locations = locations.filter(loc => loc.region === region);
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

  const selectedPromotion = PROMOTIONS.find(p => p.id === promotion);

  // Renombrar a mappedProducts para evitar la redeclaración
  const mappedProducts = selectedProducts.map(productId => 
    PRODUCTS.find(p => p.id === productId)
  ).filter((p): p is Product => p !== undefined);

  const handlePrint = () => {
    const printData = {
      products: mappedProducts,
      promotion: selectedPromotion
    };
    navigate('/print-view', { state: printData });
  };

  const companyDetails = COMPANIES.find(c => c.id === company);

  const selectedLocation = LOCATIONS.find(loc => loc.id === cc);

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

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      <Header onBack={onBack} onLogout={onLogout} />
      
      <main className="pt-10 px-6 pb-6 max-w-7xl mx-auto space-y-6 min-h-[1000px]">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-medium text-gray-900">Editor de Carteles</h2>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-2xl p-6 space-y-6 border border-white/10">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                Empresa:
              </label>
              <CompanySelect
                value={company}
                onChange={handleCompanyChange}
                companies={COMPANIES}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                Región:
              </label>
              <RegionSelect
                value={region}
                onChange={(value) => {
                  setRegion(value);
                  setCC('');
                }}
                regions={availableRegions}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                CC:
              </label>
              <LocationSelect
                value={cc}
                onChange={setCC}
                locations={filteredLocations}
                disabled={!region}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
              />
            </div>
            <div className="col-span-3 mt-4">
              <LocationMap 
                location={selectedLocation ? {
                  name: selectedLocation.name,
                  coordinates: selectedLocation.coordinates,
                  address: selectedLocation.address
                } : undefined}
              />
            </div>
          </div>

          <div className="border-t">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
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

          <div className="border-t pt-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-white/90 mb-1">
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
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Productos:
                </label>
                <ProductSelect
                  value={selectedProducts}
                  onChange={setSelectedProducts}
                  products={selectedCategory === 'Todos' || !selectedCategory 
                    ? PRODUCTS
                    : PRODUCTS.filter(p => p.category === selectedCategory)
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                  menuPlacement="top"
                />
              </div>
            </div>
          </div>
        </div>

        {(selectedCategory || mappedProducts.length > 0) && (
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-white/90">
                  Vista previa de carteles:
                </label>
                <div className="flex bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-logo"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-violet-500 focus:ring-violet-500"
                />
                <label htmlFor="show-logo" className="text-sm text-white/90">
                  Mostrar
                </label>
              </div>
            </div>

            <div className="h-[800px] w-[1080px] mx-auto overflow-y-auto">
              <div className={viewMode === 'grid' ? 'space-y-8' : 'space-y-4'}>
                {mappedProducts.map(product => (
                  <div key={product.id} 
                       className={`flex justify-center ${viewMode === 'list' ? 'bg-white/5 rounded-lg p-4' : ''}`}
                       onClick={() => setSelectedPoster(product)}
                       style={{ cursor: 'pointer' }}
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
                      compact={viewMode === 'list'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <ProductSelectorModal
          isOpen={isProductSelectorOpen}
          onClose={() => setIsProductSelectorOpen(false)}
          products={selectedCategory === 'Todos' || !selectedCategory 
            ? PRODUCTS
            : PRODUCTS.filter(p => p.category === selectedCategory)
          }
          selectedProducts={selectedProducts}
          onSelectProduct={handleSelectProduct}
          category={selectedCategory}
        />

        <PosterModal
          isOpen={!!selectedPoster}
          onClose={() => setSelectedPoster(null)}
          product={selectedPoster!}
          promotion={selectedPromotion}
          company={companyDetails}
          showLogo={showLogo}
        />
      </main>
    </div>
  );
}; 