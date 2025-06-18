import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Construction, Smartphone } from 'lucide-react';

interface MobileScannerProps {
  onSubmit: (product: any) => void;
  onBack: () => void;
}

export const MobileScanner: React.FC<MobileScannerProps> = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-white/60">
        <button onClick={onBack} className="hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span>Volver a opciones</span>
      </div>

      <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-lg border border-white/10">
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="relative mb-6"
        >
          <Construction className="w-16 h-16 text-yellow-500" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute -top-1 -right-1"
          >
            <Smartphone className="w-8 h-8 text-purple-400" />
          </motion.div>
        </motion.div>

        <motion.h3
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="text-2xl font-bold text-white mb-4"
        >
          En Construcción
        </motion.h3>

        <p className="text-white/60 text-center max-w-md">
          Estamos trabajando en una funcionalidad increíble que te permitirá 
          escanear y agregar productos usando tu dispositivo móvil. 
          ¡Vuelve pronto!
        </p>

        <div className="mt-8 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 
                     transition-colors"
          >
            Volver
          </motion.button>
        </div>
      </div>
    </div>
  );
}; 