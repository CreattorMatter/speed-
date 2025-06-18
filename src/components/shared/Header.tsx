import React, { useState } from 'react';
import { ArrowLeft, LogOut, User, ChevronDown, HelpCircle, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHeader } from './HeaderProvider';
import { GuideModal } from './GuideModal';

interface HeaderProps {
  onBack: () => void;
  onLogout: () => void;
  onGoToAdmin?: () => void;
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ onBack, onLogout, onGoToAdmin, userName }) => {
  const { userEmail, userRole } = useHeader();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const displayName = userName || 'Usuario';

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 xs:h-16 relative">
            {/* Botón de volver a la izquierda */}
            <button
              onClick={onBack}
              className="group flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
            >
              <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5 text-slate-400 group-hover:text-white transition-colors" />
              <span className="hidden sm:inline text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Volver</span>
            </button>

            {/* Título centrado */}
            <div className="flex items-center gap-1 xs:gap-2 absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-lg xs:text-xl sm:text-2xl font-bold">
                <span className="bg-gradient-to-r from-white via-white to-violet-200 bg-clip-text text-transparent">
                  SPID
                </span>
                <span className="bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
                  {' '}Plus
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium text-white hover:text-white transition-colors rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                <HelpCircle className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                <span className="hidden sm:inline text-white">Ayuda</span>
              </button>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-1 xs:gap-2 p-1 xs:p-1.5 rounded-lg bg-white bg-opacity-10 hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <div className="w-6 h-6 xs:w-8 xs:h-8 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-xs xs:text-sm font-medium text-white hidden sm:block max-w-24 lg:max-w-none truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3 h-3 xs:w-4 xs:h-4 text-white hidden sm:block" />
                </motion.button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 xs:w-56 bg-slate-800 rounded-lg shadow-lg py-1 z-50 border border-white/10"
                    >
                      <div className="px-3 xs:px-4 py-2 border-b border-white/10">
                        <p className="text-xs xs:text-sm font-medium text-white/90 truncate">{displayName}</p>
                        <p className="text-xxs xs:text-xs text-white/60 truncate">
                          {userEmail} {userRole && <span className="ml-1 text-violet-400">({userRole})</span>}
                        </p>
                      </div>
                      {userRole === 'admin' && onGoToAdmin && (
                        <button
                          onClick={onGoToAdmin}
                          className="w-full px-3 xs:px-4 py-2 text-left text-xs xs:text-sm text-white/90 hover:bg-white/5 flex items-center gap-2 transition-colors"
                        >
                          <Settings className="w-3 h-3 xs:w-4 xs:h-4" />
                          Administración
                        </button>
                      )}
                      {onLogout && (
                        <button
                          onClick={onLogout}
                          className="w-full px-3 xs:px-4 py-2 text-left text-xs xs:text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3 h-3 xs:w-4 xs:h-4" />
                          Cerrar sesión
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
};

export { Header }; 