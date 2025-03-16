import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from './shared/Header';
import { Package2, Tags, Monitor, BarChart3, Clock, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface DashboardEasyPilarProps {
  onLogout: () => void;
  onProducts: () => void;
  onPromotions: () => void;
  onBack: () => void;
  userEmail?: string;
  onSettings: () => void;
  onAnalytics: () => void;
  onDigitalPoster: () => void;
}

type CategoryType = 
  | 'Baños y Cocinas'
  | 'Electrodomésticos'
  | 'Muebles de interior'
  | 'Textil y Bazar'
  | 'Organización y Limpieza'
  | 'Herramientas'
  | 'Iluminación y Deco'
  | 'Jardín y Aire Libre'
  | 'Automotor'
  | 'Pisos y Revestimientos'
  | 'Pinturas'
  | 'Aberturas'
  | 'Construcción'
  | 'Maderas'
  | 'Plomería'
  | 'Electricidad'
  | 'Ferretería'
  | 'Servicios e Instalaciones';

type PromotionType = 'all' | CategoryType;

interface ComplianceData {
  compliance: number;
  total: number;
  printed: number;
}

// Datos específicos para Easy Pilar
const EASY_PILAR_DATA = {
  stats: {
    products: {
      total: 450,
      active: 380,
      lastWeek: 15
    },
    promotions: {
      total: 25,
      active: 18,
      expiringSoon: 3
    }
  },
  compliance: {
    all: {
      compliance: 92,
      total: 850,
      printed: 782,
    } as ComplianceData,
    categories: {
      'Baños y Cocinas': { compliance: 95, total: 45, printed: 43 },
      'Electrodomésticos': { compliance: 88, total: 50, printed: 44 },
      'Muebles de interior': { compliance: 91, total: 40, printed: 36 },
      'Textil y Bazar': { compliance: 94, total: 60, printed: 56 },
      'Organización y Limpieza': { compliance: 96, total: 55, printed: 53 },
      'Herramientas': { compliance: 93, total: 48, printed: 45 },
      'Iluminación y Deco': { compliance: 90, total: 42, printed: 38 },
      'Jardín y Aire Libre': { compliance: 89, total: 45, printed: 40 },
      'Automotor': { compliance: 87, total: 35, printed: 30 },
      'Pisos y Revestimientos': { compliance: 94, total: 52, printed: 49 },
      'Pinturas': { compliance: 95, total: 58, printed: 55 },
      'Aberturas': { compliance: 88, total: 40, printed: 35 },
      'Construcción': { compliance: 92, total: 65, printed: 60 },
      'Maderas': { compliance: 91, total: 38, printed: 35 },
      'Plomería': { compliance: 89, total: 42, printed: 37 },
      'Electricidad': { compliance: 93, total: 50, printed: 47 },
      'Ferretería': { compliance: 94, total: 45, printed: 42 },
      'Servicios e Instalaciones': { compliance: 90, total: 40, printed: 36 }
    } as Record<CategoryType, ComplianceData>
  }
};

const complianceData = [
  { name: 'Baños y Cocinas', value: 95 },
  { name: 'Electrodomésticos', value: 88 },
  { name: 'Muebles de interior', value: 91 },
  { name: 'Textil y Bazar', value: 94 },
  { name: 'Organización y Limpieza', value: 96 },
  { name: 'Herramientas', value: 93 },
  { name: 'Iluminación y Deco', value: 90 },
  { name: 'Jardín y Aire Libre', value: 89 },
  { name: 'Automotor', value: 87 },
  { name: 'Pisos y Revestimientos', value: 94 },
  { name: 'Pinturas', value: 95 },
  { name: 'Aberturas', value: 88 },
  { name: 'Construcción', value: 92 },
  { name: 'Maderas', value: 91 },
  { name: 'Plomería', value: 89 },
  { name: 'Electricidad', value: 93 },
  { name: 'Ferretería', value: 94 },
  { name: 'Servicios e Instalaciones', value: 90 }
];

// Datos de actividad reciente
const recentActivity = [
  {
    id: '1',
    title: 'Carteles Herramientas',
    type: 'envio',
    status: 'pending',
    locations: [
      { name: 'San Martín', printed: false },
      { name: 'Villa Lynch', printed: false },
      { name: 'Villa Ballester', printed: false },
      { name: 'San Andrés', printed: false }
    ],
    timestamp: new Date('2024-01-15 11:30'),
    totalLocations: 4
  },
  {
    id: '2',
    title: 'Carteles Jardín',
    type: 'impresion',
    status: 'success',
    locations: [
      { name: 'Easy Pilar', printed: true }
    ],
    timestamp: new Date('2024-01-15 10:45'),
    totalLocations: 1
  },
  {
    id: '3',
    title: 'Carteles Pintura',
    type: 'envio',
    status: 'partial',
    locations: [
      { name: 'Easy Pilar', printed: true },
      { name: 'San Isidro', printed: false },
      { name: 'Vicente López', printed: false }
    ],
    timestamp: new Date('2024-01-15 09:30'),
    totalLocations: 3
  }
];

// Componente del gráfico mejorado
const ComplianceChart: React.FC<{
  data: typeof complianceData;
  selectedCategory: 'all' | CategoryType;
}> = ({ data, selectedCategory }) => {
  return (
    <div className="h-[600px] w-full"> {/* Aumentamos la altura para mejor visualización */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 180, bottom: 20 }} // Mejores márgenes
        >
          <defs>
            {/* Gradientes para las barras */}
            <linearGradient id="highGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#818CF8" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="mediumGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#A5B4FC" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="lowGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#FCA5A5" stopOpacity={1} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={true} 
            vertical={false}
            stroke="#E5E7EB"
            opacity={0.5}
          />
          
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          
          <YAxis
            dataKey="name"
            type="category"
            tick={{ 
              fill: '#374151', 
              fontSize: 13,
              fontWeight: 500,
              width: 150, // Ancho fijo para las etiquetas
              letterSpacing: '-0.01em'
            }}
            width={180}
            axisLine={false}
          />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ 
              fill: '#F3F4F6',
              opacity: 0.5,
              radius: 4
            }}
          />
          
          <Bar
            dataKey="value"
            radius={[4, 4, 4, 4]} // Bordes redondeados en ambos lados
            barSize={24} // Altura de barra más delgada
            animationDuration={1000}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={`url(#${
                  entry.value >= 90 ? 'highGradient' :
                  entry.value >= 80 ? 'mediumGradient' :
                  'lowGradient'
                })`}
                className="transition-all duration-300 hover:opacity-90"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Actualizar el CustomTooltip para que sea más atractivo
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-100">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/80 rounded-lg" />
            <img 
              src="/images/Easy_Logo.png" 
              alt="Easy Logo" 
              className="w-10 h-10 object-contain relative z-10"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">{payload[0].payload.name}</p>
            <p className="text-sm text-gray-500">Easy Pilar</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Cumplimiento:</span>
            <span className={`font-medium text-lg ${
              value >= 90 ? 'text-indigo-600' :
              value >= 80 ? 'text-blue-500' :
              'text-red-500'
            }`}>
              {value}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                value >= 90 ? 'bg-indigo-600' :
                value >= 80 ? 'bg-blue-500' :
                'bg-red-500'
              }`}
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Componente para mostrar cada actividad
const ActivityItem: React.FC<{ activity: typeof recentActivity[0] }> = ({ activity }) => {
  const printedCount = activity.locations.filter(loc => loc.printed).length;
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <img 
              src="/images/Easy_Logo.png" 
              alt="Easy Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
            <p className="text-xs text-gray-500">
              {activity.locations.length} sucursales
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {activity.locations.map((location, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    location.printed
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}
                >
                  {location.name}
                  <Printer className="w-3 h-3 ml-1" />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <time className="text-xs text-gray-500">
            {format(activity.timestamp, "HH:mm 'hs'", { locale: es })}
          </time>
          <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${
            activity.status === 'success' ? 'bg-green-100 text-green-800' :
            activity.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {printedCount}/{activity.totalLocations} impresos
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardEasyPilar: React.FC<DashboardEasyPilarProps> = ({
  onLogout,
  onProducts,
  onPromotions,
  onBack,
  userEmail,
  onSettings,
  onAnalytics,
  onDigitalPoster
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | CategoryType>('all');

  const handleLogoutClick = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('hasSeenNews');
      onLogout();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onBack={onBack} onLogout={handleLogoutClick} />

      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Título */}
        <div className="mb-8">
          <h2 className="text-3xl font-medium text-gray-900">
            Easy Pilar - <span className="text-indigo-600">Panel de Control</span>
          </h2>
          <p className="text-gray-500">
            Gestión de carteles y promociones para Easy Pilar
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <button
            onClick={onProducts}
            className="p-6 bg-white rounded-xl hover:shadow-lg transition-shadow text-center"
          >
            <div className="w-12 h-12 mx-auto mb-2 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package2 className="w-6 h-6 text-white" />
            </div>
            <span>Productos</span>
          </button>

          <button
            onClick={onPromotions}
            className="p-6 bg-white rounded-xl hover:shadow-lg transition-shadow text-center"
          >
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-500 rounded-lg flex items-center justify-center">
              <Tags className="w-6 h-6 text-white" />
            </div>
            <span>Promociones</span>
          </button>

          <button
            disabled
            className="p-6 bg-gray-100 rounded-xl cursor-not-allowed text-center opacity-50"
          >
            <div className="w-12 h-12 mx-auto mb-2 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <span>Cartel Digital</span>
          </button>

          <button
            disabled
            className="p-6 bg-gray-100 rounded-xl cursor-not-allowed text-center opacity-50"
          >
            <div className="w-12 h-12 mx-auto mb-2 bg-violet-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span>Analítica</span>
          </button>
        </div>

        {/* Compliance Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium">Cumplimiento de Impresión por Categoría</h3>
            <p className="text-sm text-gray-500 mb-4">Easy Pilar - General</p>
          </div>
          
          <select 
            className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-200 mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as 'all' | CategoryType)}
          >
            <option value="all">Todas las categorías</option>
            {Object.keys(EASY_PILAR_DATA.compliance.categories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <ComplianceChart 
            data={selectedCategory === 'all' ? complianceData : [
              { 
                name: selectedCategory, 
                value: EASY_PILAR_DATA.compliance.categories[selectedCategory as CategoryType].compliance 
              }
            ]}
            selectedCategory={selectedCategory}
          />

          {/* Información adicional */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Cumplimiento general: {EASY_PILAR_DATA.compliance.all.compliance}%
            </p>
            <p className="text-sm text-gray-500">
              Total de carteles impresos: {EASY_PILAR_DATA.compliance.all.printed} de {EASY_PILAR_DATA.compliance.all.total}
            </p>
          </div>
        </div>

        {/* Sección de Actividad Reciente */}
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
                  <p className="text-sm text-gray-500">
                    Seguimiento de las últimas actualizaciones y cambios
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {recentActivity.filter(a => 
                    a.locations.some(l => !l.printed)
                  ).length} pendientes
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Ver todo
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4">
                <ActivityItem activity={activity} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEasyPilar; 