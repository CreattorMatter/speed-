import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../shared/Header';
import { BarChart3, TrendingUp, MapPin, Building2, Package } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { DateRangeSelector } from './DateRangeSelector';
import { generateRandomData } from '../../utils/analyticsData';
import { AnimatePresence } from 'framer-motion';
import { ScatterChart, Scatter, ZAxis } from 'recharts';

interface AnalyticsProps {
  onBack: () => void;
  onLogout: () => void;
}

interface TopProduct {
  name: string;
  value: number;
  company?: string;
}

interface AnalyticsData {
  salesData: Array<{
    name: string;
    value: number;
    color: string;
    logo: string;
  }>;
  monthlyData: Array<{
    name: string;
    Easy: number;
    Jumbo: number;
    Disco: number;
    Vea: number;
  }>;
  regionData: Array<{
    name: string;
    value: number;
    byCompany: Record<string, number>;
  }>;
  topProducts: Record<string, TopProduct[]>;
  stats: {
    totalSales: string;
    regions: number;
    products: string;
    trends: {
      sales: string;
      regions: string;
      products: string;
    };
  };
  promotionData: Array<{
    name: string;
    conversion: number;
    sales: number;
    company?: string;
    animationDelay?: number;
  }>;
  storeSLAData: Array<{
    store: string;
    sla: number;
    printTime: number;
    company?: string;
  }>;
}

const COLORS = [
  '#D64045', // Rojo Easy más oscuro (Pantone-like)
  '#7EC9AC', // Verde Jumbo pastel (Pantone-like)
  '#FF9B9B', // Rojo Disco pastel (Pantone-like)
  '#FFE5A5', // Amarillo Vea pastel (Pantone-like)
];

// Actualizar los colores de las regiones a tonos Pantone pastel
const REGION_COLORS = {
  'Buenos Aires': '#E8A598', // Rosa coral pastel
  'Córdoba': '#98C9A3',     // Verde sage pastel
  'Santa Fe': '#9BCDDF',    // Azul cielo pastel
  'Mendoza': '#B5E5BE',     // Verde menta pastel
  'Tucumán': '#F7D794'      // Amarillo durazno pastel
};

// Agregar el componente LoadingModal
const LoadingModal = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-xl"
    >
      <div className="flex flex-col items-center text-center">
        <motion.img
          initial={{ y: 10 }}
          animate={{ y: [10, -10, 10] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/2560px-SAP_2011_logo.svg.png"
          alt="SAP Logo"
          className="h-12 object-contain mb-6"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-gray-200 rounded-full h-2 mb-4"
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2 }}
            className="bg-indigo-600 h-2 rounded-full"
          />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Conectando con SAP
        </h3>
        <p className="text-gray-600">
          Obteniendo datos del sistema ERP...
        </p>
      </div>
    </motion.div>
  </motion.div>
);

// Definir los gradientes para cada empresa
const GRADIENTS = {
  Easy: {
    id: 'easyGradient',
    colors: ['#D64045', '#FF8A8D']
  },
  Jumbo: {
    id: 'jumboGradient',
    colors: ['#7EC9AC', '#A8E6C9']
  },
  Disco: {
    id: 'discoGradient',
    colors: ['#FF9B9B', '#FFC4C4']
  },
  Vea: {
    id: 'veaGradient',
    colors: ['#FFE5A5', '#FFF2D1']
  }
} as const;

type CompanyName = keyof typeof GRADIENTS;

export const Analytics: React.FC<AnalyticsProps> = ({ onBack, onLogout }) => {
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    start.setMonth(0);
    start.setDate(1);
    end.setFullYear(end.getFullYear() - 1);
    end.setMonth(11);
    end.setDate(31);
    return { start, end };
  });
  const [data, setData] = useState<AnalyticsData>(generateRandomData(dateRange.start, dateRange.end));
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleDateChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
    setData(generateRandomData(start, end));
  }, []);

  const filteredData = React.useMemo(() => {
    if (!selectedCompany) {
      // Cuando no hay empresa seleccionada, combinar todos los productos
      const allProducts = Object.entries(data.topProducts)
        .flatMap(([company, products]) => 
          products.map(product => ({
            ...product,
            company
          }))
        )
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      return {
        ...data,
        topProducts: allProducts
      };
    }

    return {
      ...data,
      salesData: data.salesData.filter(item => item.name === selectedCompany),
      monthlyData: data.monthlyData.map(month => ({
        name: month.name,
        Easy: selectedCompany === 'Easy' ? month.Easy : 0,
        Jumbo: selectedCompany === 'Jumbo' ? month.Jumbo : 0,
        Disco: selectedCompany === 'Disco' ? month.Disco : 0,
        Vea: selectedCompany === 'Vea' ? month.Vea : 0
      })),
      regionData: data.regionData.map(region => ({
        name: region.name,
        value: region.byCompany[selectedCompany] || 0,
        byCompany: { [selectedCompany]: region.byCompany[selectedCompany] || 0 }
      })),
      topProducts: data.topProducts[selectedCompany] || []
    };
  }, [data, selectedCompany]);

  const CustomBarLabel = (props: any) => {
    const { x, y, width, value, logo } = props;
    return (
      <g>
        <image
          x={x + width/2 - 15}
          y={y - 50}
          width="30"
          height="30"
          href={logo}
          style={{ objectFit: 'contain' }}
          preserveAspectRatio="xMidYMid meet"
        />
        <text
          x={x + width/2}
          y={y - 10}
          fill="#666"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ${value.toLocaleString()}
        </text>
      </g>
    );
  };

  const CompanySelector = () => (
    <div className="mb-8">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ 
                scale: selectedCompany ? 1.2 : 1,
                rotate: selectedCompany ? 360 : 0
              }}
              transition={{ duration: 0.5, type: "spring" }}
              className="p-2 bg-indigo-50 rounded-lg"
            >
              <Building2 className="w-5 h-5 text-indigo-600" />
            </motion.div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Empresa</h3>
              <p className="text-sm text-gray-500">
                {selectedCompany || 'Todas las empresas'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCompany(null)}
              className={`px-3 py-1 text-sm ${
                !selectedCompany 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-indigo-600 hover:bg-indigo-50'
              } rounded-lg`}
            >
              Todas
            </motion.button>
            {data.salesData.map((company) => (
              <motion.button
                key={company.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCompany(company.name)}
                className={`flex items-center gap-2 px-3 py-1 text-sm ${
                  selectedCompany === company.name 
                    ? 'bg-indigo-50 text-indigo-600 shadow-lg' 
                    : 'text-indigo-600 hover:bg-indigo-50'
                } rounded-lg transition-all duration-300`}
              >
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: selectedCompany === company.name ? 1.2 : 1,
                    rotate: selectedCompany === company.name ? 360 : 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                  className="relative"
                >
                  <motion.img 
                    src={company.logo} 
                    alt={company.name} 
                    className="w-6 h-6 object-contain"
                    style={{ 
                      filter: selectedCompany === company.name ? 'none' : 'grayscale(0.5)'
                    }}
                  />
                  {selectedCompany === company.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -inset-1 bg-indigo-100 rounded-full -z-10"
                      layoutId="selectedCompany"
                    />
                  )}
                </motion.div>
                <span className={`font-medium ${
                  selectedCompany === company.name ? 'scale-105' : ''
                } transition-transform duration-300`}>
                  {company.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAreaChart = () => (
    <AreaChart data={filteredData.monthlyData}>
      <defs>
        {Object.entries(GRADIENTS).map(([_, gradient]) => (
          <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradient.colors[0]} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={gradient.colors[1]} stopOpacity={0.2}/>
          </linearGradient>
        ))}
      </defs>
      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
      <XAxis 
        dataKey="name" 
        axisLine={{ stroke: '#E5E7EB' }}
        tick={{ fill: '#666' }}
      />
      <YAxis 
        axisLine={{ stroke: '#E5E7EB' }}
        tick={{ fill: '#666' }}
      />
      <Tooltip />
      {selectedCompany ? (
        <Area 
          type="monotone" 
          dataKey={selectedCompany} 
          stroke={GRADIENTS[selectedCompany as keyof typeof GRADIENTS].colors[0]}
          fill={`url(#${GRADIENTS[selectedCompany as keyof typeof GRADIENTS].id})`}
        />
      ) : (
        <>
          {data.salesData.map(company => (
            <Area 
              key={company.name}
              type="monotone" 
              dataKey={company.name} 
              stackId="1" 
              stroke={GRADIENTS[company.name as keyof typeof GRADIENTS].colors[0]}
              fill={`url(#${GRADIENTS[company.name as keyof typeof GRADIENTS].id})`}
            />
          ))}
        </>
      )}
    </AreaChart>
  );

  // Componente personalizado para el gráfico de distribución regional
  const RegionalDistributionChart = () => {
    const [key, setKey] = React.useState(0);
    const [rotation, setRotation] = React.useState(0);

    // Actualizar key y rotación cuando cambia la empresa o las fechas
    React.useEffect(() => {
      setKey(prev => prev + 1);
      setRotation(prev => prev + 90); // Rotar 90 grados en cada cambio
    }, [selectedCompany, dateRange]);

    return (
      <ChartCard title="Distribución Regional">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={filteredData.regionData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60} // Agregar innerRadius para hacer un donut chart
              fill="#8884d8"
              dataKey="value"
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                value,
                name
              }) => {
                const RADIAN = Math.PI / 180;
                const radius = 25 + innerRadius + (outerRadius - innerRadius);
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    className="text-xs"
                    fill="#666"
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                  >
                    {`${name} (${((value / filteredData.regionData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%)`}
                  </text>
                );
              }}
              labelLine={true}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
              key={key}
              startAngle={rotation}
              endAngle={rotation + 360}
            >
              {filteredData.regionData.map((entry) => (
                <Cell 
                  key={`cell-${entry.name}-${key}`}
                  fill={REGION_COLORS[entry.name as keyof typeof REGION_COLORS]}
                >
                  <animate
                    attributeName="d"
                    dur="800ms"
                    fill="freeze"
                    begin="0s"
                  />
                </Cell>
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  const data = payload[0].payload;
                  const total = filteredData.regionData.reduce((a, b) => a + b.value, 0);
                  const percentage = ((data.value / total) * 100).toFixed(1);
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-3 rounded-lg shadow-lg border border-gray-100"
                    >
                      <p className="font-medium text-gray-900">{data.name}</p>
                      <p className="text-sm text-gray-600">
                        Ventas: ${data.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {percentage}% del total
                      </p>
                    </motion.div>
                  );
                }
                return null;
              }}
            />
            <Legend
              content={({ payload }) => (
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {payload?.map((entry: any, index: number) => (
                    <motion.div
                      key={`legend-${entry.value}-${key}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      className="flex items-center gap-2"
                    >
                      <motion.div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                        whileHover={{ scale: 1.2 }}
                      />
                      <span className="text-sm text-gray-600">
                        {entry.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    );
  };

  const PromotionConversionChart = ({ 
    data, 
    selectedCompany 
  }: { 
    data: AnalyticsData; 
    selectedCompany: string | null;
  }) => {
    // Agregar key para forzar re-render y animación
    const [chartKey, setChartKey] = React.useState(0);

    // Actualizar key cuando cambia la empresa
    React.useEffect(() => {
      setChartKey(prev => prev + 1);
    }, [selectedCompany]);

    return (
      <ChartCard title="Conversión de Ventas por Promoción">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart 
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            key={chartKey} // Agregar key para forzar re-render
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              type="number" 
              dataKey="sales" 
              name="Ventas"
              unit="$"
              domain={['auto', 'auto']}
              label={{ value: 'Ventas ($)', position: 'bottom' }}
            />
            <YAxis 
              type="number" 
              dataKey="conversion" 
              name="Conversión"
              unit="%"
              domain={[0, 100]}
              label={{ value: 'Conversión (%)', angle: -90, position: 'left' }}
            />
            {/* Aumentar el rango para puntos más grandes */}
            <ZAxis range={[100, 400]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  // Encontrar el logo de la empresa correspondiente
                  const companyData = filteredData.salesData.find(
                    company => company.name === (data.company || selectedCompany)
                  );
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 min-w-[200px]"
                    >
                      {/* Logo y nombre de la empresa */}
                      {companyData && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                          <img 
                            src={companyData.logo} 
                            alt={companyData.name}
                            className="w-6 h-6 object-contain"
                          />
                          <span className="font-medium text-gray-700">
                            {companyData.name}
                          </span>
                        </div>
                      )}
                      
                      {/* Nombre de la promoción */}
                      <p className="font-medium text-gray-900 mb-2">
                        {data.name}
                      </p>
                      
                      {/* Métricas */}
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex justify-between">
                          <span>Ventas:</span>
                          <span className="font-medium">
                            ${data.sales.toLocaleString()}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 flex justify-between">
                          <span>Conversión:</span>
                          <span className="font-medium">
                            {data.conversion}%
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  );
                }
                return null;
              }}
            />
            <Scatter
              data={data.promotionData}
              fill={selectedCompany && (selectedCompany in GRADIENTS)
                ? GRADIENTS[selectedCompany as CompanyName].colors[0]
                : '#8884d8'}
            >
              {data.promotionData.map((entry, index) => {
                const color = selectedCompany && (selectedCompany in GRADIENTS)
                  ? GRADIENTS[selectedCompany as CompanyName].colors[0]
                  : entry.company && (entry.company in GRADIENTS)
                    ? GRADIENTS[entry.company as CompanyName].colors[0]
                    : '#8884d8';
                
                return (
                  <Cell
                    key={`cell-${index}-${chartKey}`} // Agregar chartKey al key
                    fill={color}
                    opacity={0.8} // Aumentar opacidad
                  >
                    {/* Agregar animación al punto */}
                    <animate
                      attributeName="r"
                      from="0"
                      to="10"
                      dur="0.8s"
                      fill="freeze"
                      begin="0s"
                    />
                  </Cell>
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    );
  };

  const StoreSLAChart = ({ 
    data, 
    selectedCompany 
  }: { 
    data: AnalyticsData; 
    selectedCompany: string | null;
  }) => {
    const [chartKey, setChartKey] = React.useState(0);

    React.useEffect(() => {
      setChartKey(prev => prev + 1);
    }, [selectedCompany]);

    return (
      <ChartCard title="Cumplimiento SLA de Impresión por Tienda">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data.storeSLAData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            key={chartKey}
          >
            {/* Zonas de colores para los niveles de SLA */}
            <defs>
              <linearGradient id="slaZones" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.1)" /> {/* Rojo para crítico */}
                <stop offset="80%" stopColor="rgba(239, 68, 68, 0.1)" />
                <stop offset="80%" stopColor="rgba(251, 191, 36, 0.1)" /> {/* Amarillo para warning */}
                <stop offset="90%" stopColor="rgba(251, 191, 36, 0.1)" />
                <stop offset="90%" stopColor="rgba(34, 197, 94, 0.1)" /> {/* Verde para ok */}
                <stop offset="100%" stopColor="rgba(34, 197, 94, 0.1)" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            
            {/* Fondo con zonas coloreadas */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#slaZones)" />

            {/* Líneas de referencia */}
            <ReferenceLine
              x={80}
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: "Crítico < 80%",
                position: 'right',
                fill: '#EF4444',
                fontSize: 12
              }}
            />
            <ReferenceLine
              x={90}
              stroke="#FBB224"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: "Warning < 90%",
                position: 'right',
                fill: '#FBB224',
                fontSize: 12
              }}
            />

            <XAxis 
              type="number" 
              domain={[0, 100]}
              unit="%"
            />
            <YAxis 
              dataKey="store" 
              type="category" 
              width={90}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const companyData = filteredData.salesData.find(
                    company => company.name === (data.company || selectedCompany)
                  );
                  
                  // Determinar el estado del SLA
                  let slaStatus = 'success';
                  let statusColor = 'text-green-600';
                  if (data.sla < 80) {
                    slaStatus = 'crítico';
                    statusColor = 'text-red-600';
                  } else if (data.sla < 90) {
                    slaStatus = 'warning';
                    statusColor = 'text-yellow-600';
                  }
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 min-w-[200px]"
                    >
                      {companyData && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                          <img 
                            src={companyData.logo} 
                            alt={companyData.name}
                            className="w-6 h-6 object-contain"
                          />
                          <span className="font-medium text-gray-700">
                            {companyData.name}
                          </span>
                        </div>
                      )}
                      <p className="font-medium text-gray-900 mb-2">
                        {data.store}
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex justify-between items-center">
                          <span>SLA:</span>
                          <span className={`font-medium ${statusColor}`}>
                            {data.sla.toFixed(1)}% ({slaStatus})
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 flex justify-between">
                          <span>Tiempo promedio:</span>
                          <span className="font-medium">
                            {data.printTime.toFixed(1)} min
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="sla" 
              radius={[0, 4, 4, 0]}
              animationDuration={1000}
            >
              {data.storeSLAData.map((entry, index) => {
                // Determinar el color base según el SLA
                let baseColor = '#22C55E'; // Verde para OK
                if (entry.sla < 80) {
                  baseColor = '#EF4444'; // Rojo para crítico
                } else if (entry.sla < 90) {
                  baseColor = '#FBB224'; // Amarillo para warning
                }

                return (
                  <Cell
                    key={`cell-${index}-${chartKey}`}
                    fill={baseColor}
                    opacity={0.8}
                  >
                    <animate
                      attributeName="width"
                      from="0"
                      to="100%"
                      dur="1s"
                      fill="freeze"
                    />
                  </Cell>
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    );
  };

  const renderTopProductsChart = () => (
    <ChartCard title={`Top Productos ${selectedCompany ? `- ${selectedCompany}` : ''}`}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={Array.isArray(filteredData.topProducts) ? filteredData.topProducts : []}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis type="number" />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const companyData = filteredData.salesData.find(
                  c => c.name === (data.company || selectedCompany)
                );

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-4 rounded-lg shadow-lg border border-gray-100"
                  >
                    {companyData && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                        <img 
                          src={companyData.logo} 
                          alt={companyData.name}
                          className="w-6 h-6 object-contain"
                        />
                        <span className="font-medium text-gray-700">
                          {companyData.name}
                        </span>
                      </div>
                    )}
                    <p className="font-medium text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-600">
                      Ventas: ${data.value.toLocaleString()}
                    </p>
                  </motion.div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="value" 
            radius={[0, 4, 4, 0]}
            animationDuration={1000}
          >
            {(Array.isArray(filteredData.topProducts) ? filteredData.topProducts : []).map((entry, index) => {
              const color = selectedCompany && (selectedCompany in GRADIENTS)
                ? GRADIENTS[selectedCompany as CompanyName].colors[0]
                : entry.company && (entry.company in GRADIENTS)
                  ? GRADIENTS[entry.company as CompanyName].colors[0]
                  : '#8884d8';
              
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={color}
                  opacity={0.8}
                >
                  <animate
                    attributeName="width"
                    from="0"
                    to="100%"
                    dur="1s"
                    fill="freeze"
                  />
                </Cell>
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {isLoading && <LoadingModal />}
      </AnimatePresence>

      <Header onBack={onBack} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          </div>
          <p className="text-gray-600">
            Vista general del rendimiento y métricas importantes
          </p>
        </motion.div>

        <div className="mb-8">
          <DateRangeSelector
            startDate={dateRange.start}
            endDate={dateRange.end}
            onRangeChange={handleDateChange}
          />
        </div>

        <CompanySelector />

        <div className="mb-6">
          <PromotionConversionChart 
            data={filteredData} 
            selectedCompany={selectedCompany}
          />
        </div>

        <div className="mb-6">
          <StoreSLAChart 
            data={filteredData} 
            selectedCompany={selectedCompany}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Ventas Totales"
            value={filteredData.stats.totalSales}
            icon={<TrendingUp />}
            trend={filteredData.stats.trends.sales}
            positive
          />
          <StatsCard
            title="Regiones Activas"
            value={filteredData.stats.regions}
            icon={<MapPin />}
            trend={`+${filteredData.stats.trends.regions}`}
            positive
          />
          <StatsCard
            title="Empresas"
            value={filteredData.salesData.length}
            icon={<Building2 />}
            trend="Estable"
          />
          <StatsCard
            title="Productos"
            value={filteredData.stats.products}
            icon={<Package />}
            trend={`+${filteredData.stats.trends.products}`}
            positive
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Ventas por Empresa">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData.salesData} margin={{ top: 50, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  {Object.entries(GRADIENTS).map(([_, gradient]) => (
                    <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={gradient.colors[0]} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={gradient.colors[1]} stopOpacity={0.9}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#666' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  axisLine={{ stroke: '#E5E7EB' }}
                  tick={{ fill: '#666' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <img 
                              src={data.logo} 
                              alt={data.name} 
                              className="w-8 h-8 object-contain"
                            />
                            <span className="font-medium">{data.name}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Ventas: ${data.value.toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[10, 10, 0, 0]}
                  label={<CustomBarLabel />}
                >
                  {filteredData.salesData.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={`url(#${GRADIENTS[entry.name as keyof typeof GRADIENTS].id})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <RegionalDistributionChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={`Cantidad de Ventas ${selectedCompany ? `- ${selectedCompany}` : ''}`}>
            <ResponsiveContainer width="100%" height={300}>
              {renderAreaChart()}
            </ResponsiveContainer>
          </ChartCard>

          {renderTopProductsChart()}
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, trend, positive }: any) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-indigo-50 rounded-lg">
        {React.cloneElement(icon, { className: "w-5 h-5 text-indigo-600" })}
      </div>
      <span className={`text-sm font-medium ${
        positive ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
      } px-2 py-1 rounded-full`}>
        {trend}
      </span>
    </div>
    <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </motion.div>
);

const ChartCard = ({ title, children }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
  >
    <h3 className="text-gray-900 font-medium mb-6">{title}</h3>
    {children}
  </motion.div>
); 