import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Plus, LogOut, Sparkles, Clock, Star, Package, Construction } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardStats from './DashboardStats';
import RecentTemplates from './RecentTemplates';

interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
  onProducts: () => void;
  onBack: () => void;
  userEmail?: string;
}

export default function Dashboard({ onLogout, onNewTemplate, onProducts, onBack, userEmail = 'admin@admin.com' }: DashboardProps) {
  const userName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, card: HTMLDivElement) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    card.style.transition = 'transform 0.1s';
  };

  const handleMouseLeave = (card: HTMLDivElement) => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s';
  };

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLDivElement>('.hologram-card');
    
    const handleMouseMoveEvent = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLDivElement;
      handleMouseMove(e as unknown as React.MouseEvent<HTMLDivElement>, card);
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMoveEvent);
      card.addEventListener('mouseleave', () => handleMouseLeave(card));
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMoveEvent);
        card.removeEventListener('mouseleave', () => handleMouseLeave(card));
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(at_right_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-stone-900">
      <style>
        {`
          @keyframes hologram {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          
          .hologram-card {
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
            transform-style: preserve-3d;
            will-change: transform;
          }
          
          .hologram-card::before {
            content: '';
            position: absolute;
            inset: -2px;
            background: linear-gradient(
              45deg,
              transparent 40%,
              rgba(255, 255, 255, 0.4) 50%,
              transparent 60%
            );
            filter: blur(8px);
            animation: hologram 3s linear infinite;
            border-radius: inherit;
            z-index: 0;
          }
          
          .hologram-card::after {
            content: '';
            position: absolute;
            inset: 0;
            background: inherit;
            border-radius: inherit;
            z-index: 1;
          }
          
          .hologram-content {
            position: relative;
            z-index: 2;
            transform: translateZ(20px);
          }

          .hologram-shine {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              45deg,
              transparent,
              rgba(255, 255, 255, 0.1) 25%,
              transparent 50%
            );
            z-index: 3;
            pointer-events: none;
          }
        `}
      </style>

      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="text-white/80 hover:text-white flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </motion.button>
            
            <span className="absolute left-1/2 -translate-x-1/2 text-white font-light text-2xl tracking-tight">
              Speed<span className="font-medium">+</span>
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </motion.button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white"
            >
              ¡Bienvenido de nuevo, {userName}! 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/60"
            >
              Gestiona tus plantillas y crea nuevos diseños
            </motion.p>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewTemplate}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500
                       text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 shadow-lg
                       hover:shadow-indigo-500/25 transition-all duration-200"
            >
              <Construction className="w-5 h-5" />
              <span>Builder</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onProducts}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500
                       text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 shadow-lg
                       hover:shadow-emerald-500/25 transition-all duration-200"
            >
              <Package className="w-5 h-5" />
              <span>Productos</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hologram-card bg-gradient-to-br from-indigo-500/20 to-purple-600/20 p-6 rounded-xl text-white shadow-lg border border-white/10"
          >
            <div className="hologram-content">
              <Sparkles className="w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Plantillas Activas</h3>
              <p className="text-4xl font-bold">12</p>
            </div>
            <div className="hologram-shine" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="hologram-card bg-gradient-to-br from-pink-500/20 to-rose-600/20 p-6 rounded-xl text-white shadow-lg border border-white/10"
          >
            <div className="hologram-content">
              <Clock className="w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Última Actividad</h3>
              <p className="text-lg">Hace 2 horas</p>
            </div>
            <div className="hologram-shine" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="hologram-card bg-gradient-to-br from-amber-500/20 to-orange-600/20 p-6 rounded-xl text-white shadow-lg border border-white/10"
          >
            <div className="hologram-content">
              <Star className="w-8 h-8 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Plantilla Destacada</h3>
              <p className="text-lg">Black Friday 2024</p>
            </div>
            <div className="hologram-shine" />
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <DashboardStats />
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <RecentTemplates />
          </div>
        </div>
      </main>
    </div>
  );
}