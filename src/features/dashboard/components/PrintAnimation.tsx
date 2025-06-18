import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Check } from 'lucide-react';

interface PrintAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  locationName: string;
}

export const PrintAnimation: React.FC<PrintAnimationProps> = ({
  isVisible,
  onComplete,
  locationName
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-white rounded-2xl p-8 flex flex-col items-center max-w-sm mx-4"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 0, 360],
              }}
              transition={{
                duration: 2,
                times: [0, 0.5, 1],
                repeat: 0
              }}
              className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4"
            >
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ 
                  opacity: [1, 0],
                  y: [0, -20]
                }}
                transition={{
                  duration: 1,
                  times: [0, 1],
                  delay: 1
                }}
              >
                <Printer className="w-10 h-10 text-indigo-600" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1],
                  scale: [0, 1]
                }}
                transition={{
                  duration: 0.5,
                  delay: 2
                }}
                className="absolute"
              >
                <Check className="w-10 h-10 text-green-500" />
              </motion.div>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold text-gray-900 text-center"
            >
              Enviando a imprimir
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-500 text-center mt-2"
            >
              Sucursal: {locationName}
            </motion.p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
              className="h-1 bg-indigo-600 rounded-full mt-6"
              onAnimationComplete={onComplete}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 