import React, { useState } from 'react';
import { ArrowLeft, LogOut, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHeader } from './HeaderProvider';

interface HeaderProps {
  onBack?: () => void;
  onLogout?: () => void;
}

export function Header({ onBack, onLogout }: HeaderProps) {
  const { userEmail, userName, userRole } = useHeader();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName = userName || 'Usuario';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16 relative">
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center text-white/80 hover:text-white text-sm sm:text-base"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Volver al inicio</span>
            </motion.button>
          )}

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-white via-white to-violet-200 bg-clip-text text-transparent">
                SPID
              </span>
              <span className="bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
                {' '}Plus
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white/80" />
                </div>
                <span className="text-sm font-medium text-white/80 hidden sm:block">
                  {displayName}
                </span>
                <ChevronDown className="w-4 h-4 text-white/80 hidden sm:block" />
              </motion.button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-lg py-1 z-50 border border-white/10"
                  >
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-medium text-white/90">{displayName}</p>
                      <p className="text-xs text-white/60">
                        {userEmail} {userRole && <span className="ml-1 text-violet-400">({userRole})</span>}
                      </p>
                    </div>
                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
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
  );
} 