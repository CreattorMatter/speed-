import React from 'react';
import { ArrowLeft, LogOut, Plus, Package2, Tags, Star, Clock, FileText, Sun, Moon, LayoutTemplate, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from './shared/Header';

interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
  onNewPoster: () => void;
  onProducts: () => void;
  onPromotions: () => void;
  onBack: () => void;
  userEmail?: string;
  onSettings: () => void;
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

export default function Dashboard({ onLogout, onNewTemplate, onNewPoster, onProducts, onPromotions, onBack, userEmail, onSettings }: DashboardProps) {
  // Datos de ejemplo
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
    <div className="min-h-screen flex flex-col bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5
        animate-gradient-xy pointer-events-none" />
      
      <Header onBack={onBack} onLogout={onLogout} onSettings={onSettings} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 py-12"
      >
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex items-center gap-3"
        >
          <h2 className="text-3xl font-medium text-slate-900">
            Bienvenido de nuevo, <span className="text-violet-400">{userEmail?.split('@')[0]}</span>
          </h2>
          <motion.span
            animate={{
              rotate: [0, 14, -8, 14, -4, 10, 0],
              transformOrigin: "bottom right"
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="text-3xl"
          >
            👋
          </motion.span>
          <p className="text-slate-500">
            Aquí está lo que sucede con tus plantillas.
          </p>
        </motion.div>

        {/* Action Buttons Section */}
        <div className="flex justify-center gap-12 mb-12 py-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
            onClick={onProducts}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              bg-gradient-to-br from-white to-gray-50 border-gray-100 shadow-[0_0_20px_rgba(0,0,0,0.1)]
              transition-all duration-300`}
          >
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Package2 className="w-10 h-10 text-white" />
            </div>
            <span className={`text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent`}>
              Productos
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
            onClick={onPromotions}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              bg-gradient-to-br from-white to-gray-50 border-gray-100 shadow-[0_0_20px_rgba(0,0,0,0.1)]
              transition-all duration-300`}
          >
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Tags className="w-10 h-10 text-white" />
            </div>
            <span className={`text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent`}>
              Promociones
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.3
            }}
            onClick={onNewPoster}
            className="group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              bg-gradient-to-br from-violet-500 to-violet-600 text-white
              border border-violet-400 shadow-[0_0_30px_rgba(139,92,246,0.3)]
              hover:shadow-[0_0_35px_rgba(139,92,246,0.4)] transition-all duration-300"
          >
            <div className="mb-4 p-4 rounded-2xl bg-white/20
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300
              backdrop-blur-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <span className="text-xl font-semibold">
              Cartel
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.4
            }}
            onClick={onNewTemplate}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              bg-gradient-to-br from-white to-gray-50 border-gray-100 shadow-[0_0_20px_rgba(0,0,0,0.1)]
              transition-all duration-300`}
          >
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <LayoutTemplate className="w-10 h-10 text-white" />
            </div>
            <span className={`text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent`}>
              Builder
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.5
            }}
            onClick={onSettings}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              bg-gradient-to-br from-white to-gray-50 border-gray-100 shadow-[0_0_20px_rgba(0,0,0,0.1)]
              transition-all duration-300`}
          >
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <span className={`text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent`}>
              Configuración
            </span>
          </motion.button>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {/* Productos Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl p-6 transition-all duration-300
              bg-white border-gray-200 shadow-lg hover:shadow-xl border"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 
                            flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Package2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">
                  Productos
                </h3>
                <p className="text-slate-500">
                  Vista general
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500">Total</span>
                  <span className="text-2xl font-semibold text-slate-900">
                    {stats.products.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Activos</span>
                  <span className="text-slate-900">
                    {stats.products.active}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                <span className="text-emerald-400">+{stats.products.lastWeek}</span> nuevos esta semana
              </div>
            </div>
          </motion.div>

          {/* Promociones Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl p-6 transition-colors border
              bg-white border-slate-200 shadow-lg`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 
                            flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Tags className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-medium text-slate-900`}>
                  Promociones
                </h3>
                <p className={`text-slate-500`}>
                  Vista general
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-slate-500`}>Total</span>
                  <span className={`text-2xl font-semibold text-slate-900`}>
                    {stats.promotions.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-slate-500`}>Activas</span>
                  <span className="text-slate-900">
                    {stats.promotions.active}
                  </span>
                </div>
              </div>
              <div className={`text-sm text-slate-500`}>
                <span className="text-amber-400">{stats.promotions.expiringSoon}</span> por vencer pronto
              </div>
            </div>
          </motion.div>

          {/* Templates Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl p-6 transition-colors border
              bg-white border-slate-200 shadow-lg`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 
                            flex items-center justify-center shadow-lg shadow-violet-500/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-medium text-slate-900`}>
                  Templates
                </h3>
                <p className={`text-slate-500`}>
                  Vista general
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-slate-500`}>Total</span>
                  <span className={`text-2xl font-semibold text-slate-900`}>
                    {stats.templates.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-slate-500`}>Recientes</span>
                  <span className="text-slate-900">
                    {stats.templates.recentlyUsed}
                  </span>
                </div>
              </div>
              <div className={`text-sm text-slate-500`}>
                Más usado: <span className="text-slate-900">{stats.templates.mostUsed}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border overflow-hidden backdrop-blur-sm
              bg-white/50 border-gray-200 dark:border-slate-700"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className={`text-lg font-medium text-gray-900`}>
                Actividad Reciente
              </h3>
              <button className={`text-sm text-gray-500 hover:text-gray-700`}>
                Ver todo
              </button>
            </div>
            <div className={`rounded-xl border overflow-hidden
              bg-white border-gray-200`}>
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}