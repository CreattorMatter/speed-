import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Printer } from 'lucide-react';
import { PlantillaReciente } from '../../types/plantilla';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: PlantillaReciente[];
  onPrint: (activity: PlantillaReciente) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  activities,
  onPrint
}) => {
  if (!isOpen) return null;

  const pendingActivities = activities.filter(act => act.estado === 'no_impreso');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-2 sm:mx-4 
                     overflow-hidden max-h-[90vh] my-2 sm:my-0"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 sm:p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Carteles Pendientes</h2>
                <p className="text-white/80">
                  Tienes {pendingActivities.length} carteles por imprimir
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              {pendingActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }
                  }}
                  className="bg-gray-50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center 
                           justify-between p-3 sm:p-4 gap-2 sm:gap-0 border border-gray-200 hover:border-indigo-300 
                           transition-all duration-300 group cursor-pointer
                           hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="flex items-center gap-4">
                    <motion.img
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.3 }}
                      src={activity.empresa.logo}
                      alt={activity.empresa.nombre}
                      className="w-10 h-10 object-contain"
                    />
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <h3 className="font-medium text-gray-900">{activity.nombre}</h3>
                      <p className="text-sm text-gray-500">
                        {activity.cantidad} carteles • {activity.sucursal}
                      </p>
                    </motion.div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => onPrint(activity)}
                    className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-100 
                             opacity-0 group-hover:opacity-100 transition-all duration-300
                             hover:shadow-lg hover:shadow-indigo-500/20"
                  >
                    <Printer className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                         transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 