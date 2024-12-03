import React from 'react';
import { ArrowLeft, LogOut, Plus, Package2, Tags, Star, Clock, FileText, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
  onNewPoster: () => void;
  onProducts: () => void;
  onPromotions: () => void;
  onBack: () => void;
  userEmail?: string;
}

interface RecentTemplate {
  id: string;
  name: string;
  type: string;
  timeAgo: string;
}

interface DashboardStats {
  products: {
    total: number;
    active: number;
    lastWeek: number;
  };
  promotions: {
    total: number;
    active: number;
    expiringSoon: number;
  };
  templates: {
    total: number;
    recentlyUsed: number;
    mostUsed: string;
  };
}

const recentTemplates: RecentTemplate[] = [
  {
    id: '1',
    name: 'Summer Sale Banner',
    type: 'Promotion',
    timeAgo: '2h ago'
  },
  {
    id: '2',
    name: 'Product Showcase',
    type: 'Product Info',
    timeAgo: '4h ago'
  },
  {
    id: '3',
    name: 'Store Directory',
    type: 'Directional',
    timeAgo: '1d ago'
  },
  {
    id: '4',
    name: 'Weekly Deals',
    type: 'Promotion',
    timeAgo: '2d ago'
  }
];

const Dashboard: React.FC<DashboardProps> = ({ 
  onLogout, 
  onNewTemplate,
  onNewPoster,
  onProducts,
  onPromotions
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Datos de ejemplo - estos deberían venir de tu backend
  const stats: DashboardStats = {
    products: {
      total: 1234,
      active: 856,
      lastWeek: 45
    },
    promotions: {
      total: 68,
      active: 24,
      expiringSoon: 5
    },
    templates: {
      total: 12,
      recentlyUsed: 3,
      mostUsed: 'Promoción Bancaria'
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200
      ${isDark 
        ? 'bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2E] to-[#0A0F1C] text-white' 
        : 'bg-gradient-to-br from-slate-100 via-white to-slate-100 text-slate-900'}`}
    >
      {/* Header Moderno */}
      <header className={`fixed top-0 left-0 right-0 transition-colors duration-200
        ${isDark 
          ? 'bg-[#0A0F1C]/80 border-indigo-500/10' 
          : 'bg-white/80 border-slate-200'} 
        backdrop-blur-xl border-b z-50`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Speed+
            </h1>
            <nav className="flex gap-6">
              {['Inicio', 'Plantillas', 'Estadísticas'].map((item, index) => (
                <span 
                  key={item}
                  className={`cursor-pointer transition-colors
                    ${isDark
                      ? index === 1 ? 'text-indigo-300' : 'text-indigo-300/40 hover:text-indigo-300/60'
                      : index === 1 ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {item}
                </span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors
                ${isDark
                  ? 'text-indigo-300/40 hover:text-indigo-300 bg-white/5 hover:bg-white/10'
                  : 'text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={onLogout}
              className={`transition-colors
                ${isDark
                  ? 'text-indigo-300/40 hover:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className={`text-3xl font-medium mb-2 
              ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Bienvenido de nuevo
            </h2>
            <p className={isDark ? 'text-indigo-300/40' : 'text-slate-500'}>
              Aquí está lo que sucede con tus plantillas.
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onProducts}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isDark 
                  ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100'}`}
            >
              <Package2 className="w-4 h-4 inline mr-2" />
              Productos
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPromotions}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isDark 
                  ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-100'}`}
            >
              <Tags className="w-4 h-4 inline mr-2" />
              Promociones
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewPoster}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isDark 
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100'}`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Cartel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewTemplate}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-sm font-medium
                       text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Builder
            </motion.button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Productos Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl p-6 transition-colors
              ${isDark 
                ? 'bg-gradient-to-br from-sky-500/10 to-blue-500/10 border-sky-500/10 hover:border-sky-500/20' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-lg'} 
              border`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 
                            flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Package2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Productos
                </h3>
                <p className={isDark ? 'text-sky-300/40' : 'text-slate-500'}>
                  Vista general
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={isDark ? 'text-sky-300/40' : 'text-slate-500'}>Total</span>
                  <span className={`text-2xl font-semibold ${isDark ? 'text-sky-300' : 'text-slate-900'}`}>
                    {stats.products.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-sky-300/40' : 'text-slate-500'}>Activos</span>
                  <span className={isDark ? 'text-sky-300' : 'text-slate-900'}>
                    {stats.products.active}
                  </span>
                </div>
              </div>
              <div className={`text-sm ${isDark ? 'text-sky-300/40' : 'text-slate-500'}`}>
                <span className="text-emerald-400">+{stats.products.lastWeek}</span> nuevos esta semana
              </div>
            </div>
          </motion.div>

          {/* Promociones Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl p-6 transition-colors
              ${isDark 
                ? 'bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/10 hover:border-rose-500/20' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-lg'} 
              border`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 
                            flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Tags className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Promociones
                </h3>
                <p className={isDark ? 'text-rose-300/40' : 'text-slate-500'}>
                  Vista general
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={isDark ? 'text-rose-300/40' : 'text-slate-500'}>Total</span>
                  <span className={`text-2xl font-semibold ${isDark ? 'text-rose-300' : 'text-slate-900'}`}>
                    {stats.promotions.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-rose-300/40' : 'text-slate-500'}>Activas</span>
                  <span className={isDark ? 'text-rose-300' : 'text-slate-900'}>
                    {stats.promotions.active}
                  </span>
                </div>
              </div>
              <div className={`text-sm ${isDark ? 'text-rose-300/40' : 'text-slate-500'}`}>
                <span className="text-amber-400">{stats.promotions.expiringSoon}</span> por vencer pronto
              </div>
            </div>
          </motion.div>

          {/* Templates Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl p-6 transition-colors
              ${isDark 
                ? 'bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/10 hover:border-violet-500/20' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-lg'} 
              border`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 
                            flex items-center justify-center shadow-lg shadow-violet-500/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Templates
                </h3>
                <p className={isDark ? 'text-violet-300/40' : 'text-slate-500'}>
                  Vista general
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={isDark ? 'text-violet-300/40' : 'text-slate-500'}>Total</span>
                  <span className={`text-2xl font-semibold ${isDark ? 'text-violet-300' : 'text-slate-900'}`}>
                    {stats.templates.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-violet-300/40' : 'text-slate-500'}>Recientes</span>
                  <span className={isDark ? 'text-violet-300' : 'text-slate-900'}>
                    {stats.templates.recentlyUsed}
                  </span>
                </div>
              </div>
              <div className={`text-sm ${isDark ? 'text-violet-300/40' : 'text-slate-500'}`}>
                Más usado: <span className="text-violet-300">{stats.templates.mostUsed}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-indigo-300">Actividad Reciente</h3>
            <button className="text-sm text-indigo-300/40 hover:text-indigo-300 transition-colors">
              Ver todo
            </button>
          </div>
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl overflow-hidden 
                        border border-indigo-500/10">
            {recentTemplates.map((template, index) => (
              <motion.div 
                key={template.id}
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                className={`flex items-center justify-between p-4 transition-colors
                          ${index !== recentTemplates.length - 1 ? 'border-b border-indigo-500/10' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 
                                flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-indigo-300">{template.name}</p>
                    <p className="text-sm text-indigo-300/40">{template.type}</p>
                  </div>
                </div>
                <span className="text-sm text-indigo-300/40">{template.timeAgo}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;