import React, { useState } from 'react';
import { Package2, Tags, FileText, LayoutTemplate, Settings, BarChart3, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '../../../components/shared/Header';
import { Chatbot } from '../../chatbot/components/Chatbot';
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
  onProducts, 
  onPromotions, 
  onBack, 
  userEmail,
  onSettings,
  userRole,
  onAnalytics
}: DashboardProps) {
  // Datos de ejemplo
  const stats: DashboardStats = {
    carteles: {
      total: 856,
      fisicos: 650,
      digitales: 206,
      playlists: 45,
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
    <div className="min-h-screen flex flex-col bg-white">
      <Header onBack={onBack} onLogout={handleLogoutClick} userName={userEmail || ''} onGoToAdmin={onSettings} />
      
      {/* Agregar el Modal de Novedades */}
      <NewsModal 
        isOpen={showNewsModal}
        onClose={handleCloseNewsModal}
      />

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
          <h2 className="text-3xl font-medium">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 bg-clip-text text-transparent">
              Bienvenido a{' '}
            </span>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              SPID
            </span>
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
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
          <p className="text-slate-500">
            Todos los carteles físicos y digitales en un solo lugar.
          </p>
        </motion.div>

        {/* Action Buttons Section */}
        <div className="flex flex-col xs:flex-row xs:flex-wrap sm:flex-nowrap justify-center gap-3 xs:gap-4 sm:gap-6 lg:gap-8 xl:gap-12 mb-6 sm:mb-8 lg:mb-12 py-4 sm:py-6 lg:py-12 px-2 sm:px-4">
          {/* Botón de Productos - Deshabilitado temporalmente */}
          <motion.button
            className="group flex flex-col items-center w-full xs:w-40 sm:w-48 lg:w-56 px-4 xs:px-6 sm:px-8 py-6 xs:py-7 sm:py-8 rounded-2xl sm:rounded-3xl
              bg-gray-200 text-gray-400 cursor-not-allowed relative"
            disabled={true}
            title="Funcionalidad temporalmente deshabilitada"
          >
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-300">
              <Package2 className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <span className="text-base xs:text-lg sm:text-xl font-semibold text-center">
              Productos
            </span>
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-lg">
              Próximamente
            </div>
          </motion.button>

          {/* Botón de Promociones - Deshabilitado temporalmente */}
          <motion.button
            className="group flex flex-col items-center w-full xs:w-40 sm:w-48 lg:w-56 px-4 xs:px-6 sm:px-8 py-6 xs:py-7 sm:py-8 rounded-2xl sm:rounded-3xl
              bg-gray-200 text-gray-400 cursor-not-allowed relative"
            disabled={true}
            title="Funcionalidad temporalmente deshabilitada"
          >
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-300">
              <Tags className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <span className="text-base xs:text-lg sm:text-xl font-semibold text-center">
              Promociones
            </span>
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-lg">
              Próximamente
            </div>
          </motion.button>

          {/* Botón de Cartel */}
          <motion.button
            whileHover={!isEasyPilarUser(userEmail) ? { scale: 1.05 } : {}}
            whileTap={!isEasyPilarUser(userEmail) ? { scale: 0.95 } : {}}
            onClick={!isEasyPilarUser(userEmail) ? onNewPoster : undefined}
            className={`group flex flex-col items-center w-full xs:w-40 sm:w-48 lg:w-56 px-4 xs:px-6 sm:px-8 py-6 xs:py-7 sm:py-8 rounded-2xl sm:rounded-3xl
              ${!isEasyPilarUser(userEmail)
                ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white hover:shadow-[0_0_35px_rgba(139,92,246,0.4)]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={isEasyPilarUser(userEmail)}
          >
            <div className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
              !isEasyPilarUser(userEmail)
                ? 'bg-white/20 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300'
                : 'bg-gray-300'
            }`}>
              <FileText className={`w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${!isEasyPilarUser(userEmail) ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <span className="text-base xs:text-lg sm:text-xl font-semibold text-center">
              Cartel
            </span>
          </motion.button>

          {/* Botón de Cartel Digital - Próximamente */}
          <motion.button
            className="group flex flex-col items-center w-full xs:w-40 sm:w-48 lg:w-56 px-4 xs:px-6 sm:px-8 py-6 xs:py-7 sm:py-8 rounded-2xl sm:rounded-3xl
              bg-gray-200 text-gray-400 cursor-not-allowed relative"
            disabled={true}
          >
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-300">
              <Monitor className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <span className="text-base xs:text-lg sm:text-xl font-semibold text-center">
              Cartel Digital
            </span>
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-lg">
              Próximamente
            </div>
          </motion.button>

          {/* Botón de Builder */}
          <motion.button
            whileHover={!isEasyPilarUser(userEmail) ? { scale: 1.05 } : {}}
            whileTap={!isEasyPilarUser(userEmail) ? { scale: 0.95 } : {}}
            onClick={!isEasyPilarUser(userEmail) ? onNewTemplate : undefined}
            className={`group flex flex-col items-center w-full xs:w-40 sm:w-48 lg:w-56 px-4 xs:px-6 sm:px-8 py-6 xs:py-7 sm:py-8 rounded-2xl sm:rounded-3xl
              ${!isEasyPilarUser(userEmail)
                ? 'bg-gradient-to-br from-white to-gray-100 border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={isEasyPilarUser(userEmail)}
          >
            <div className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
              !isEasyPilarUser(userEmail)
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300'
                : 'bg-gray-300'
            }`}>
              <LayoutTemplate className={`w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${!isEasyPilarUser(userEmail) ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <span className={`text-base xs:text-lg sm:text-xl font-semibold text-center ${!isEasyPilarUser(userEmail) ? 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent' : ''}`}>
              Builder
            </span>
          </motion.button>

          {/* Botón de Config - Solo para ADMIN */}
          {userRole === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSettings}
              className="group flex flex-col items-center w-full xs:w-40 sm:w-48 lg:w-56 px-4 xs:px-6 sm:px-8 py-6 xs:py-7 sm:py-8 rounded-2xl sm:rounded-3xl
                bg-gradient-to-r from-white/95 via-white/90 to-violet-100/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl"
            >
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Settings className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <span className="text-base xs:text-lg sm:text-xl font-semibold text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Administración
              </span>
            </motion.button>
          )}

          {/* Botón de Analítica - Deshabilitado temporalmente */}
          <motion.button
            className="group flex flex-col items-center w-full xs:w-40 sm:w-48 lg:w-56 px-4 xs:px-6 sm:px-8 py-6 xs:py-7 sm:py-8 rounded-2xl sm:rounded-3xl
              bg-gray-200 text-gray-400 cursor-not-allowed relative"
            disabled={true}
            title="Funcionalidad temporalmente deshabilitada"
          >
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-300">
              <BarChart3 className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <span className="text-base xs:text-lg sm:text-xl font-semibold text-center">
              Analítica
            </span>
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-lg">
              Próximamente
            </div>
          </motion.button>
        </div>

        {/* Stats Grid - Solo Carteles visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8 sm:mb-12 px-2 sm:px-4 lg:px-0"
        >
          {/* Templates Stats - Reemplazar por Carteles Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl p-6 transition-colors border bg-white border-slate-200 shadow-lg max-w-md w-full"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 
                            flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-medium text-slate-900 flex items-center gap-2`}>
                  Carteles
                  <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full">
                    Físicos y Digitales
                  </span>
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
                    {stats.carteles.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-slate-500`}>Físicos</span>
                  <span className="text-slate-900">
                    {stats.carteles.fisicos}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-slate-500`}>Digitales</span>
                  <span className="text-slate-900">
                    {stats.carteles.digitales}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-slate-500`}>Playlists</span>
                  <span className="text-slate-900">
                    {stats.carteles.playlists}
                  </span>
                </div>
              </div>
              <div className={`text-sm text-slate-500`}>
                <span className="text-emerald-400">+{stats.carteles.lastWeek}</span> nuevos esta semana
              </div>
            </div>
          </motion.div>
        </motion.div>

      </motion.div>

      {/* Agregar el Chatbot */}
      <Chatbot userEmail={userEmail} />
    </div>
  );
}