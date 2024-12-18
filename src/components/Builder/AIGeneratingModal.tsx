import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIGeneratingModalProps {
  isOpen: boolean;
  onFinish: () => void;
}

export function AIGeneratingModal({ isOpen, onFinish }: AIGeneratingModalProps) {
  const [currentAI, setCurrentAI] = useState(() => Math.floor(Math.random() * 3));
  
  const aiLogos = [
    'https://images.seeklogo.com/logo-png/46/2/chatgpt-logo-png_seeklogo-465219.png?v=638686974800000000',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Claude_AI_logo.svg/1280px-Claude_AI_logo.svg.png',
    'https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd48eab78-962e-4b5e-a37d-31edf758fdb1_992x404.png'
  ];

  const aiNames = ['ChatGPT', 'Claude', 'Llama'];

  useEffect(() => {
    if (isOpen) {
      // Generar un nuevo índice aleatorio cada vez que se abre el modal
      setCurrentAI(Math.floor(Math.random() * 3));
      
      // Establecer un temporizador para cerrar el modal
      const timer = setTimeout(() => {
        onFinish();
      }, 2000); // 2 segundos de animación

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center gap-6"
          >
            <motion.div
              key={currentAI}
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ 
                scale: [0.8, 1.2, 1],
                opacity: 1,
                rotate: [0, 10, 0]
              }}
              transition={{
                duration: 1,
                ease: "easeInOut"
              }}
              className="w-24 h-24 relative"
            >
              <img
                src={aiLogos[currentAI]}
                alt={`${aiNames[currentAI]} Logo`}
                className="w-full h-full object-contain"
              />
            </motion.div>
            
            <div className="text-center">
              <h3 className="text-xl font-medium text-white mb-2">
                Generando Plantilla con {aiNames[currentAI]}
              </h3>
              <motion.div 
                className="h-1 bg-white/30 rounded-full overflow-hidden w-48 mt-4"
              >
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 