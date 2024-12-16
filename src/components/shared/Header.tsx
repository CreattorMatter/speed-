import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onBack?: () => void;
  onLogout: () => void;
}

export function Header({ onBack, onLogout }: HeaderProps) {
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
} 