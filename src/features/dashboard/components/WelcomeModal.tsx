import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Package2, Tags, Star, Clock } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalProducts: number;
    totalPromotions: number;
    totalTemplates: number;
  };
}

interface FrequentTemplate {
  id: string;
  name: string;
  thumbnail: string;
  lastUsed: string;
  usageCount: number;
}

const frequentTemplates: FrequentTemplate[] = [
  {
    id: '1',
    name: 'Oferta 2x1',
    thumbnail: '/templates/2x1.jpg',
    lastUsed: '2024-01-15',
    usageCount: 45
  },
  {
    id: '2',
    name: 'Descuento Bancario',
    thumbnail: '/templates/bank.jpg',
    lastUsed: '2024-01-14',
    usageCount: 38
  },
  {
    id: '3',
    name: 'Promoción Especial',
    thumbnail: '/templates/special.jpg',
    lastUsed: '2024-01-13',
    usageCount: 32
  }
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, stats }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl 
                     border border-white/10 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">¡Bienvenido a Speed+!</h2>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Package2 className="w-5 h-5 text-sky-400" />
                    <h3 className="text-white/90 font-medium">Productos</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Tags className="w-5 h-5 text-rose-400" />
                    <h3 className="text-white/90 font-medium">Promociones</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalPromotions}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-white/90 font-medium">Templates</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalTemplates}</p>
                </motion.div>
              </div>

              {/* Frequent Templates */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Plantillas más utilizadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {frequentTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-white/5 rounded-xl overflow-hidden border border-white/10"
                    >
                      <div className="aspect-video bg-slate-800 relative">
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-white mb-2">{template.name}</h4>
                        <div className="flex justify-between text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span>{template.usageCount} usos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Hace {getDaysAgo(template.lastUsed)} días</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg 
                         transition-colors"
              >
                Comenzar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function getDaysAgo(date: string): number {
  const diff = new Date().getTime() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
} 