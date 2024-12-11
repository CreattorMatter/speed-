import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PrintDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  timestamp: Date;
  locations: Array<{
    name: string;
    printed: boolean;
    timestamp?: Date;
  }>;
  onPrint: (id: string, locationName: string) => void;
  activityId: string;
}

export const PrintDetailsModal: React.FC<PrintDetailsModalProps> = ({
  isOpen,
  onClose,
  locations,
  onPrint,
  activityId
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Printer className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Estado de impresión
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {locations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      location.printed ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-gray-900">{location.name}</span>
                  </div>
                  
                  {location.printed ? (
                    <div className="text-xs text-gray-500">
                      {format(location.timestamp || new Date(), "d MMM HH:mm 'hs'", { locale: es })}
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onPrint(activityId, location.name)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Printer className="w-4 h-4 text-gray-600" />
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 