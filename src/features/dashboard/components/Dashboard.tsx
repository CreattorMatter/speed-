import { useState } from 'react';
import { Package2, FileText, LayoutTemplate, Settings, Sparkles, TrendingUp, Users, Calendar, Inbox, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../../../components/shared/Header';

import { NewsModal } from '../../../components/shared/NewsModal';

interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
  onNewPoster: () => void;
  onProducts: () => void;
  onPromotions: () => void;
  onBack: () => void;
  userEmail?: string;
  onSettings: () => void;
  userRole: 'admin' | 'limited' | 'sucursal';
  onAnalytics: () => void;
}

interface DashboardStats {
  carteles: {
    total: number;
    fisicos: number;
    digitales: number;
    playlists: number;
    lastWeek: number;
  };
}

const isEasyPilarUser = (email?: string) => {
  return email?.includes('easy.pilar');
};

export default function Dashboard({ 
  onLogout, 
  onNewTemplate, 
  onNewPoster, 
  onBack, 
  userEmail,
  onSettings,
  userRole
}: DashboardProps) {
  const navigate = useNavigate();
  
  // Datos de ejemplo - Nuevas métricas
  const stats: DashboardStats = {
    carteles: {
      total: 147,      // Plantillas
      fisicos: 23,     // Familias
      digitales: 1205, // Impresiones
      playlists: 89,   // Usuarios activos
      lastWeek: 28
    }
  };

  const [showNewsModal, setShowNewsModal] = useState(() => {
    // Verificar si es la primera vez que el usuario inicia sesión en esta sesión
    const hasSeenNews = localStorage.getItem('hasSeenNews');
    return !hasSeenNews;
  });

  const handleCloseNewsModal = () => {
    setShowNewsModal(false);
    // Guardar en localStorage que el usuario ya vio las novedades
    localStorage.setItem('hasSeenNews', 'true');
  };

  const handleLogoutClick = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      // Limpiar el estado de las novedades al cerrar sesión
      localStorage.removeItem('hasSeenNews');
      onLogout();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header onBack={onBack} onLogout={handleLogoutClick} userName={userEmail || ''} onGoToAdmin={onSettings} />
      
      {/* Agregar el Modal de Novedades */}
      <NewsModal 
        isOpen={showNewsModal}
        onClose={handleCloseNewsModal}
      />

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-indigo-400/20 dark:from-purple-600/10 dark:via-pink-600/10 dark:to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 via-cyan-400/20 to-teal-400/20 dark:from-blue-600/10 dark:via-cyan-600/10 dark:to-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-400/10 via-purple-400/10 to-pink-400/10 dark:from-violet-600/5 dark:via-purple-600/5 dark:to-pink-600/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-7xl mx-auto px-4 py-12"
      >
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-gray-100 dark:via-gray-200 dark:to-indigo-200 bg-clip-text text-transparent">
                Bienvenido a{' '}
              </span>
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                SPID
              </span>
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                {' '}Plus
              </span>
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
          </div>
          
          {/* Quick Stats Cards */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20 border border-blue-200/50 dark:border-blue-500/30 rounded-full backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">+{stats.carteles.lastWeek} esta semana</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-600/20 dark:to-emerald-600/20 border border-green-200/50 dark:border-green-500/30 rounded-full backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Activo</span>
              </div>
            </div>
          </div>
          
          <div className="w-full">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Todos los carteles físicos y digitales en un solo lugar.
            </p>
          </div>
        </motion.div>

        {/* Main Action Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
          {/* Cartel Card */}
          {!isEasyPilarUser(userEmail) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 dark:from-violet-600 dark:via-purple-700 dark:to-indigo-700 p-8 h-80 shadow-2xl hover:shadow-violet-500/25 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <Sparkles className="w-6 h-6 text-white/60 group-hover:text-yellow-300 transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Cartel</h3>
                    <p className="text-white/80 mb-4 text-sm leading-relaxed">Crear carteles promocionales y informativos de forma rápida</p>
                    <button
                      onClick={onNewPoster}
                      className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-300 border border-white/20 hover:border-white/40"
                    >
                      Crear Cartel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Builder Card */}
          {!isEasyPilarUser(userEmail) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-8 h-80 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <LayoutTemplate className="w-8 h-8 text-white" />
                    </div>
                    <Calendar className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Builder</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">Diseña templates personalizados con herramientas avanzadas</p>
                    <button
                      onClick={onNewTemplate}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Abrir Builder
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Admin Card - Solo para ADMIN */}
          {userRole === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 dark:from-blue-600 dark:via-indigo-700 dark:to-purple-800 p-8 h-80 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div className="px-3 py-1 bg-yellow-400/90 rounded-full">
                      <span className="text-xs font-bold text-yellow-900">ADMIN</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Administración</h3>
                    <p className="text-white/80 mb-4 text-sm leading-relaxed">Gestión avanzada de usuarios, configuraciones y sistema</p>
                    <button
                      onClick={onSettings}
                      className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-300 border border-white/20 hover:border-white/40"
                    >
                      Panel Admin
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recibidos - Solo ADMIN por ahora */}
          {userRole === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              whileHover={{ y: -5 }}
              className="group"
            >
             <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-teal-600 to-emerald-600 dark:from-cyan-600 dark:via-teal-700 dark:to-emerald-700 p-8 h-80 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500">   <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="p-4 bg-gradient-to-br from-emerald-400/40 to-teal-500/40 rounded-2xl backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ring-1 ring-white/20">
                      <Inbox className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Recibidos</h3>
                    <p className="text-white/80 mb-4 text-sm leading-relaxed">Elementos recibidos</p>
                    <button
                      onClick={() => navigate('/recibidos')}
                      className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white font-semibold transition-all duration-300 border border-white/20 hover:border-white/40"
                    >
                      Ver Recibidos
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enviados - Solo ADMIN por ahora */}
          {userRole === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ y: -5 }}
              className="group"
            >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-500 via-pink-600 to-rose-600 dark:from-fuchsia-600 dark:via-pink-700 dark:to-rose-700 p-8 h-80 shadow-2xl hover:shadow-fuchsia-500/25 transition-all duration-500">    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="p-4 bg-gradient-to-br from-rose-400/40 to-pink-500/40 rounded-2xl backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ring-1 ring-white/20">
                      <Send className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Enviados</h3>
                    <p className="text-white/80 mb-4 text-sm leading-relaxed">Elementos enviados</p>
                    <button
                      onClick={() => navigate('/enviados')}
                      className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white font-semibold transition-all duration-300 border border-white/20 hover:border-white/40"
                    >
                      Ver Enviados
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Plantillas */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200/50 dark:border-blue-800/50 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <LayoutTemplate className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.carteles.total}
                    </div>
                    <div className="text-sm text-blue-500 dark:text-blue-300">Plantillas</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    +{stats.carteles.lastWeek} esta semana
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Familias */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 border border-green-200/50 dark:border-green-800/50 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                    <Package2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {stats.carteles.fisicos}
                    </div>
                    <div className="text-sm text-green-500 dark:text-green-300">Familias</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Activas
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Impresiones */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-violet-900/50 border border-purple-200/50 dark:border-purple-800/50 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.carteles.digitales.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-500 dark:text-purple-300">Impresiones</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Este mes
                  </span>
                </div>
              </div>
            </motion.div>


          </div>
        </motion.div>

        {/* Quick Actions Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 p-8 mb-12"
        >
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  ¿Listo para crear algo increíble?
                </h3>
                <p className="text-white/80 text-lg max-w-2xl">
                  Comienza con plantillas profesionales o diseña desde cero con nuestro editor avanzado. La creatividad no tiene límites.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isEasyPilarUser(userEmail) && (
                  <>
                    <button
                      onClick={onNewPoster}
                      className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      Crear Cartel
                    </button>
                    <button
                      onClick={onNewTemplate}
                      className="px-6 py-3 bg-white hover:bg-gray-50 rounded-xl text-gray-900 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <LayoutTemplate className="w-5 h-5" />
                      Abrir Builder
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>

      
    </div>
  );
}