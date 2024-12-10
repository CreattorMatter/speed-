import React, { useState, useCallback } from 'react';
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
  AreaChart
} from 'recharts';
import { DateRangeSelector } from './DateRangeSelector';
import { generateRandomData } from '../../utils/analyticsData';

interface AnalyticsProps {
  onBack: () => void;
  onLogout: () => void;
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
  }>;
  regionData: Array<{
    name: string;
    value: number;
  }>;
  topProducts: Array<{
    name: string;
    value: number;
  }>;
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
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

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

  const handleDateChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
    setData(generateRandomData(start, end));
  }, []);

  const filteredData = React.useMemo(() => {
    if (!selectedCompany) return data;

    return {
      ...data,
      salesData: data.salesData.filter(item => item.name === selectedCompany),
      monthlyData: data.monthlyData.map(month => ({
        name: month.name,
        [selectedCompany]: month[selectedCompany as keyof typeof month]
      })),
      topProducts: data.topProducts.slice(0, 3),
      stats: {
        ...data.stats,
        totalSales: `$${(parseFloat(data.stats.totalSales.replace('$', '').replace('M', '')) / 4).toFixed(1)}M`,
        products: `${Math.floor(parseInt(data.stats.products) / 4)}`
      }
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
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Empresa</h3>
              <p className="text-sm text-gray-500">
                {selectedCompany || 'Todas las empresas'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCompany(company.name)}
                className={`flex items-center gap-2 px-3 py-1 text-sm ${
                  selectedCompany === company.name 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-indigo-600 hover:bg-indigo-50'
                } rounded-lg`}
              >
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="w-4 h-4 object-contain"
                />
                {company.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#666' }}
                />
                <YAxis />
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
                  fill="#6366f1"
                  label={<CustomBarLabel />}
                >
                  {filteredData.salesData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Distribución Regional">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={filteredData.regionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {filteredData.regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Tendencia Mensual">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={filteredData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="Easy" stackId="1" stroke="#6366f1" fill="#6366f1" />
                <Area type="monotone" dataKey="Jumbo" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                <Area type="monotone" dataKey="Disco" stackId="1" stroke="#ec4899" fill="#ec4899" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Productos">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={filteredData.topProducts}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1">
                  {filteredData.topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
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