import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from './shared/Header';
import { Package2, Tags, Monitor, BarChart3, Clock, Printer, FileWarning } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { getPosterUrl } from '../lib/supabaseClient-cartelEasyPilar';

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
    title: 'Black Friday',
    type: 'envio',
    status: 'pending',
    locations: [
      { name: 'Easy Pilar', printed: false }
    ],
    timestamp: new Date('2024-01-15 11:30'),
    totalLocations: 1,
    sender: 'Casa Central',
    senderEmail: 'marketing@easy.com.ar',
    sentDate: new Date('2024-01-15 09:00'),
    validUntil: new Date('2024-01-20'),
    printedDate: null
  },
  {
    id: '2',
    title: 'Cyber Week',
    type: 'impresion',
    status: 'success',
    locations: [
      { name: 'Easy Pilar', printed: true }
    ],
    timestamp: new Date('2024-01-15 10:45'),
    totalLocations: 1,
    sender: 'Casa Central',
    senderEmail: 'promociones@easy.com.ar',
    sentDate: new Date('2024-01-14 16:30'),
    validUntil: new Date('2024-01-19'),
    printedDate: new Date('2024-01-14 17:45')
  },
  {
    id: '3',
    title: 'Liquidación Fin de Semana Easy',
    type: 'envio',
    status: 'pending',
    locations: [
      { name: 'Easy Pilar', printed: false }
    ],
    timestamp: new Date('2024-01-15 09:30'),
    totalLocations: 1,
    sender: 'Casa Central',
    senderEmail: 'marketing@easy.com.ar',
    sentDate: new Date('2024-01-15 08:00'),
    validUntil: new Date('2024-01-18'),
    printedDate: null
  },
  {
    id: '4',
    title: 'Ofertas en Electro',
    type: 'impresion',
    status: 'success',
    locations: [
      { name: 'Easy Pilar', printed: true }
    ],
    timestamp: new Date('2024-01-15 08:15'),
    totalLocations: 1,
    sender: 'Casa Central',
    senderEmail: 'marketing@easy.com.ar',
    sentDate: new Date('2024-01-14 15:30'),
    validUntil: new Date('2024-01-21'),
    printedDate: new Date('2024-01-14 16:20')
  },
  {
    id: '5',
    title: 'Cenco Pay',
    type: 'envio',
    status: 'pending',
    locations: [
      { name: 'Easy Pilar', printed: false }
    ],
    timestamp: new Date('2024-01-14 17:45'),
    totalLocations: 1,
    sender: 'Casa Central',
    senderEmail: 'promociones@easy.com.ar',
    sentDate: new Date('2024-01-14 14:30'),
    validUntil: new Date('2024-01-20'),
    printedDate: null
  },
  {
    id: '6',
    title: 'Solo los Martes',
    type: 'impresion',
    status: 'success',
    locations: [
      { name: 'Easy Pilar', printed: true }
    ],
    timestamp: new Date('2024-01-14 16:30'),
    totalLocations: 1,
    sender: 'Casa Central',
    senderEmail: 'marketing@easy.com.ar',
    sentDate: new Date('2024-01-14 12:00'),
    validUntil: new Date('2024-01-19'),
    printedDate: new Date('2024-01-14 13:15')
  },
  {
    id: '7',
    title: 'Ofertas Lunes a Viernes',
    type: 'impresion',
    status: 'success',
    locations: [
      { name: 'Easy Pilar', printed: true }
    ],
    timestamp: new Date('2024-01-14 15:20'),
    totalLocations: 1,
    sender: 'Casa Central',
    senderEmail: 'marketing@easy.com.ar',
    sentDate: new Date('2024-01-14 11:00'),
    validUntil: new Date('2024-01-22'),
    printedDate: new Date('2024-01-14 11:45')
  },
  {
    id: '8',
    title: 'Promoción Renova tu casa',
    type: 'envio',
    status: 'pending',
    locations: [
      { name: 'Easy Pilar', printed: false }
    ],
    timestamp: new Date('2024-01-14 14:10'),
    totalLocations: 1,
    sender: 'Casa Central',
    senderEmail: 'promociones@easy.com.ar',
    sentDate: new Date('2024-01-14 10:30'),
    validUntil: new Date('2024-01-21'),
    printedDate: null
  }
];

// Definimos los tipos de impresoras disponibles
const availablePrinters = [
  {
    id: 'hp-designjet',
    name: 'HP DesignJet T650',
    location: 'Área de Impresión',
    paperSizes: ['A1', 'A0', '24"', '36"'],
    type: 'Plotter',
    status: 'Disponible',
    icon: '🖨️',
    printTime: 6 // tiempo estimado de impresión en segundos
  },
  {
    id: 'hp-9015e',
    name: 'HP OfficeJet Pro 9015e',
    location: 'Oficina Principal',
    paperSizes: ['A4', 'A3', 'Carta'],
    type: 'Inyección de tinta',
    status: 'Disponible',
    icon: '🖨️',
    printTime: 5
  },
  {
    id: 'epson-l14150',
    name: 'Epson EcoTank L14150',
    location: 'Área de Marketing',
    paperSizes: ['A4', 'A3', 'A3+', 'Tabloide'],
    type: 'Tanque de tinta',
    status: 'Disponible',
    icon: '🖨️',
    printTime: 4
  },
  {
    id: 'canon-gp555',
    name: 'Canon PIXMA GP555',
    location: 'Área de Diseño',
    paperSizes: ['A4', 'A3', 'A3+', '13x19"'],
    type: 'Inyección de tinta profesional',
    status: 'Ocupada',
    icon: '🖨️',
    printTime: 7
  },
  {
    id: 'xerox-7800',
    name: 'Xerox Phaser 7800',
    location: 'Área de Impresión',
    paperSizes: ['A4', 'A3', 'SRA3', 'Tabloide'],
    type: 'Láser Color',
    status: 'Disponible',
    icon: '🖨️',
    printTime: 4
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

// Eliminamos el PosterModal y modificamos el ActivityItem
const ActivityItem: React.FC<{ 
  activity: typeof recentActivity[0];
  onPrintComplete?: () => void;
}> = ({ activity, onPrintComplete }) => {
  const [posterUrl, setPosterUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [selectedPaperSize, setSelectedPaperSize] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [printed, setPrinted] = useState(activity.locations[0].printed);
  const [printedDate, setPrintedDate] = useState<Date | null>(activity.printedDate);

  const loadPosterUrl = async () => {
    if (!posterUrl && !isLoading) {
      try {
        setIsLoading(true);
        const url = await getPosterUrl(activity.id);
        setPosterUrl(url);
      } catch (error) {
        console.error('Error al obtener el cartel:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrint = () => {
    if (!selectedPrinter || !selectedPaperSize) {
      alert('Por favor selecciona una impresora y un tamaño de papel');
      return;
    }
    
    const printer = availablePrinters.find(p => p.id === selectedPrinter);
    if (!printer) return;

    setIsPrinting(true);
    setPrintProgress(0);

    // Calculamos los intervalos para la animación
    const printTime = printer.printTime * 1000; // convertir a milisegundos
    const startTime = Date.now();
    let animationFrame: number;

    const updateProgress = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min((elapsed / printTime) * 100, 100);

      setPrintProgress(progress);

      if (progress < 100) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else {
        // Completar la impresión
        setTimeout(() => {
          setIsPrinting(false);
          setPrinted(true);
          const now = new Date();
          setPrintedDate(now);
          setShowPrinterModal(false);
          if (onPrintComplete) onPrintComplete();
        }, 500);
      }
    };

    // Iniciamos la animación
    animationFrame = requestAnimationFrame(updateProgress);

    // Limpiamos la animación si el componente se desmonta
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  };

  return (
    <>
      <div className="relative" onMouseEnter={() => {
        setShowPreview(true);
        loadPosterUrl();
      }} onMouseLeave={() => setShowPreview(false)}>
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <img src="/images/Easy_Logo.png" alt="Easy Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-gray-500">
                    Enviado por: <span className="font-medium text-gray-700">{activity.sender}</span> ({activity.senderEmail})
                  </p>
                  <p className="text-xs text-gray-500">
                    Fecha de envío: <span className="font-medium text-gray-700">{format(activity.sentDate, "dd/MM/yyyy 'a las' HH:mm 'hs'", { locale: es })}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Válido hasta: <span className="font-medium text-gray-700">{format(activity.validUntil, "dd/MM/yyyy", { locale: es })}</span>
                  </p>
                  {printedDate && (
                    <p className="text-xs text-green-600">
                      Impreso el: <span className="font-medium">{format(printedDate, "dd/MM/yyyy 'a las' HH:mm 'hs'", { locale: es })}</span>
                    </p>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => !printed && setShowPrinterModal(true)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      printed
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200 transition-colors cursor-pointer'
                    }`}
                  >
                    {printed ? 'Impreso' : 'Pendiente'}
                    <Printer className="w-4 h-4 ml-1.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      loadPosterUrl();
                      setShowModal(true);
                    }}
                    className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-colors"
                  >
                    Ver cartel
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <time className="text-xs text-gray-500">
                {format(activity.timestamp, "HH:mm 'hs'", { locale: es })}
              </time>
              {isLoading && (
                <div className="mt-2 text-xs text-indigo-600">
                  Cargando...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview del cartel en hover */}
        {showPreview && posterUrl && (
          <div className="absolute right-0 top-0 z-50 transform translate-x-full -translate-y-1/4 p-2">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden" style={{ width: '300px' }}>
              <div className="aspect-[4/3] relative">
                <img 
                  src={posterUrl} 
                  alt={activity.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-2 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-600 font-medium truncate">{activity.title}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de selección de impresora con animación de impresión */}
      {showPrinterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !isPrinting && setShowPrinterModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Printer className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {isPrinting ? 'Imprimiendo...' : 'Seleccionar Impresora'}
                  </h3>
                </div>
                {!isPrinting && (
                  <button
                    onClick={() => setShowPrinterModal(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {isPrinting ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      {/* Impresora */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gray-800 rounded-lg">
                        {/* Ranura de la impresora */}
                        <div className="absolute inset-x-4 top-0 h-1 bg-gray-700" />
                      </div>
                      {/* Hoja de papel animada */}
                      <motion.div
                        className="absolute left-4 bg-white border border-gray-200 w-16 h-20"
                        initial={{ y: "0%" }}
                        animate={{ 
                          y: ["-10%", "-60%", "-10%"],
                          x: ["0%", "0%", "0%"],
                          rotate: [0, -2, 2, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {/* Líneas de texto simuladas */}
                        <div className="p-2 space-y-1">
                          <div className="h-0.5 w-8 bg-gray-300 rounded" />
                          <div className="h-0.5 w-10 bg-gray-300 rounded" />
                          <div className="h-0.5 w-6 bg-gray-300 rounded" />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Imprimiendo cartel...
                    </p>
                    <p className="text-sm text-gray-500">
                      Por favor, espere mientras se completa la impresión
                    </p>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-gray-200">
                      <motion.div
                        className="bg-indigo-600 rounded-full transition-all"
                        initial={{ width: "0%" }}
                        animate={{ width: `${printProgress}%` }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm font-semibold text-indigo-600">
                        {Math.round(printProgress)}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedPrinter && availablePrinters.find(p => p.id === selectedPrinter)?.name}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    {availablePrinters.map((printer) => (
                      <div 
                        key={printer.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedPrinter === printer.id 
                            ? 'border-indigo-600 bg-indigo-50' 
                            : 'border-gray-200 hover:border-indigo-200'
                        }`}
                        onClick={() => {
                          setSelectedPrinter(printer.id);
                          setSelectedPaperSize('');
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{printer.icon}</span>
                              <h4 className="font-medium text-gray-900">{printer.name}</h4>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                printer.status === 'Disponible' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {printer.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{printer.location}</p>
                            <p className="text-sm text-gray-500">{printer.type}</p>
                          </div>
                        </div>
                        
                        {selectedPrinter === printer.id && (
                          <div className="mt-4 border-t border-gray-100 pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Tamaño de papel:</p>
                            <div className="flex flex-wrap gap-2">
                              {printer.paperSizes.map((size) => (
                                <button
                                  key={size}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPaperSize(size);
                                  }}
                                  className={`px-3 py-1 rounded-full text-sm ${
                                    selectedPaperSize === size
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowPrinterModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handlePrint}
                      disabled={!selectedPrinter || !selectedPaperSize}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedPrinter && selectedPaperSize
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Imprimir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver el cartel */}
      {showModal && posterUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img 
                    src="/images/Easy_Logo.png" 
                    alt="Easy Logo" 
                    className="w-6 h-6 object-contain"
                  />
                  <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="aspect-[4/3] relative bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={posterUrl} 
                  alt={activity.title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
  const [activities, setActivities] = useState(recentActivity);
  const [showNewsModal, setShowNewsModal] = useState(true);

  useEffect(() => {
    const hasSeenNews = localStorage.getItem('hasSeenNews');
    if (!hasSeenNews) {
      setShowNewsModal(true);
    }
  }, []);

  const handlePrintComplete = (activityId: string) => {
    setActivities(currentActivities => 
      currentActivities.map(activity => 
        activity.id === activityId
          ? {
              ...activity,
              locations: [{ ...activity.locations[0], printed: true }],
              printedDate: new Date()
            }
          : activity
      )
    );
  };

  const pendingCount = activities.filter(a => !a.locations[0].printed).length;
  const pendingActivities = activities.filter(a => !a.locations[0].printed);

  const handleCloseNewsModal = () => {
    setShowNewsModal(false);
    localStorage.setItem('hasSeenNews', 'true');
  };

  const handleLogoutClick = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('hasSeenNews');
      onLogout();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onBack={onBack} onLogout={handleLogoutClick} />

      {/* Modal de Novedades */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <img 
                      src="/images/Easy_Logo.png" 
                      alt="Easy Logo" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">Bienvenido a Easy Pilar</h2>
                    <p className="text-sm text-gray-500">Resumen de novedades</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseNewsModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* KPI de Cumplimiento */}
              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-6 border border-indigo-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">KPI: Cumplimiento de Impresión</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Cumplimiento General</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {EASY_PILAR_DATA.compliance.all.compliance}%
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Carteles Impresos</p>
                    <p className="text-3xl font-bold text-green-600">
                      {EASY_PILAR_DATA.compliance.all.printed}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Carteles Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {pendingCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Carteles Pendientes */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Carteles Pendientes de Impresión</h3>
                  <p className="text-sm text-gray-500">Se requiere acción inmediata</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {pendingActivities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-50 rounded-lg">
                          <Printer className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Enviado el {format(activity.sentDate, "dd/MM/yyyy 'a las' HH:mm 'hs'", { locale: es })}
                          </p>
                          <p className="text-xs text-gray-500">
                            Válido hasta {format(activity.validUntil, "dd/MM/yyyy", { locale: es })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseNewsModal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <h3 className="text-lg font-medium">KPI: Cumplimiento de Impresión por Categoría</h3>
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
            <p className="text-lg text-gray-600 font-bold font-mono">
              Cumplimiento general: {EASY_PILAR_DATA.compliance.all.compliance}%
            </p>
            <p className="text-sm text-gray-00">
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
                    Seguimiento de las últimas actualizaciones
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {pendingCount} pendientes
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Ver todo
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4">
                <ActivityItem 
                  activity={activity} 
                  onPrintComplete={() => handlePrintComplete(activity.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEasyPilar; 