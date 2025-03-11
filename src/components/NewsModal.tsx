import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bot } from 'lucide-react';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full mx-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fondo con gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/20 to-purple-600/20 animate-gradient-xy" />

            {/* Contenido */}
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                ¡Novedades en SPID+! 🎉
              </h2>

              {/* Chatbot Feature */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-4"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-indigo-600 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Asistente Virtual
                    </h3>
                    <p className="text-indigo-200">
                      ¡Ahora puedes chatear con nuestro Asistente!
                    </p>
                  </div>
                </div>
                <div className="pl-16">
                  <p className="text-white/80">
                    Resuelve tus dudas y obtén ayuda instantánea con nuestro nuevo chatbot inteligente.
                  </p>
                </div>
              </motion.div>

              {/* SpidCopilot Feature */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-violet-600 rounded-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      SpidCopilot (Próximamente)
                    </h3>
                    <p className="text-violet-200">
                      Tu asistente inteligente de trabajo
                    </p>
                  </div>
                </div>
                <div className="pl-16">
                  <p className="text-white/80">
                    Pronto podrás interactuar con nuestro SpidCopilot para solicitarle que haga el trabajo por ti.
                  </p>
                </div>
              </motion.div>

              {/* Progress Bar */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 