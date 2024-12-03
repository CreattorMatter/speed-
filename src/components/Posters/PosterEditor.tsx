import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CompanySelect } from './CompanySelect';
import { RegionSelect } from './RegionSelect';
import { LocationSelect } from './LocationSelect';
import { PromotionSelect } from './PromotionSelect';
import { ProductSelect } from './ProductSelect';
import { CategorySelect } from './CategorySelect';
import { PromoTypeSelect, PromoType } from './PromoTypeSelect';

interface PosterEditorProps {
  onBack: () => void;
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
}

const COMPANIES = [
  { 
    id: 'cencosud', 
    name: 'Cencosud', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Cencosud_logo.svg/1200px-Cencosud_logo.svg.png'
  },
  { 
    id: 'jumbo', 
    name: 'Jumbo', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Logo_Jumbo_Cencosud.png'
  },
  { 
    id: 'disco', 
    name: 'Disco', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Disco-Supermarket-Logo.svg/2048px-Disco-Supermarket-Logo.svg.png'
  },
  { 
    id: 'vea', 
    name: 'Vea', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Logo-VEA-Supermercados.png'
  }
];

const REGIONS = [
  { id: 'centro', name: 'Buenos Aires Centro' },
  { id: 'norte', name: 'Buenos Aires Norte' },
  { id: 'sur', name: 'Buenos Aires Sur' }
];

const LOCATIONS = [
  // Centro
  { id: 'capital', name: 'Capital Federal', region: 'centro' },
  { id: 'caballito', name: 'Caballito', region: 'centro' },
  { id: 'palermo', name: 'Palermo', region: 'centro' },
  { id: 'belgrano', name: 'Belgrano', region: 'centro' },
  { id: 'recoleta', name: 'Recoleta', region: 'centro' },
  
  // Norte
  { id: 'sanisidro', name: 'San Isidro', region: 'norte' },
  { id: 'vicente', name: 'Vicente López', region: 'norte' },
  { id: 'tigre', name: 'Tigre', region: 'norte' },
  { id: 'pilar', name: 'Pilar', region: 'norte' },
  { id: 'escobar', name: 'Escobar', region: 'norte' },
  
  // Sur
  { id: 'lomas', name: 'Lomas de Zamora', region: 'sur' },
  { id: 'avellaneda', name: 'Avellaneda', region: 'sur' },
  { id: 'quilmes', name: 'Quilmes', region: 'sur' },
  { id: 'laplata', name: 'La Plata', region: 'sur' },
  { id: 'berazategui', name: 'Berazategui', region: 'sur' }
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
    conditions: ['Válido solo los jueves'],
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
    title: '3x2 en Lácteos',
    description: 'Llevá 3 y pagá 2 en lácteos seleccionados',
    discount: '3x2',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Válido solo los jueves'],
    startDate: '2024-01-01',
    endDate: '2024-12-31'
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

export const PosterEditor: React.FC<PosterEditorProps> = ({ onBack }) => {
  const [company, setCompany] = useState('');
  const [region, setRegion] = useState('');
  const [cc, setCC] = useState('');
  const [promotion, setPromotion] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [promoType, setPromoType] = useState<PromoType | ''>('');

  // Filtrar CC basado en la región seleccionada
  const filteredLocations = region 
    ? LOCATIONS.filter(loc => loc.region === region)
    : LOCATIONS;

  const selectedPromotion = PROMOTIONS.find(p => p.id === promotion);

  return (
    <div className={`min-h-screen bg-gray-100`}>
      <header className="fixed top-0 left-0 right-0 bg-[#0A0F1C]/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={onBack}
              className="text-white/60 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
            <h1 className="text-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Speed+
            </h1>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-medium text-gray-900">Editor de Carteles</h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa:
              </label>
              <CompanySelect
                value={company}
                onChange={setCompany}
                companies={COMPANIES}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Región:
              </label>
              <RegionSelect
                value={region}
                onChange={(value) => {
                  setRegion(value);
                  setCC('');
                }}
                regions={REGIONS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CC:
              </label>
              <LocationSelect
                value={cc}
                onChange={setCC}
                locations={filteredLocations}
                disabled={!region}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Promoción:
              </label>
              <PromoTypeSelect
                value={promoType}
                onChange={setPromoType}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promoción:
              </label>
              <PromotionSelect
                value={promotion}
                onChange={setPromotion}
                promotions={PROMOTIONS}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría:
                </label>
                <CategorySelect
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  categories={CATEGORIES}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Productos:
                </label>
                <ProductSelect
                  value={selectedProducts}
                  onChange={setSelectedProducts}
                  products={selectedCategory 
                    ? PRODUCTS.filter(p => p.category === selectedCategory)
                    : PRODUCTS
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 