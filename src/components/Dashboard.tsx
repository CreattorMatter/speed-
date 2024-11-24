import React from 'react';
import { ArrowLeft, Plus, LogOut, Sparkles, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardStats from './DashboardStats';
import RecentTemplates from './RecentTemplates';

interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
  onBack: () => void;
}

export default function Dashboard({ onLogout, onNewTemplate, onBack }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Volver</span>
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
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
              className="text-3xl font-bold text-gray-900"
            >
              ¡Bienvenido de nuevo! 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600"
            >
              Gestiona tus plantillas y crea nuevos diseños
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewTemplate}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Plantilla</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-lg"
          >
            <Sparkles className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Plantillas Activas</h3>
            <p className="text-4xl font-bold">12</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-xl text-white shadow-lg"
          >
            <Clock className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Última Actividad</h3>
            <p className="text-lg">Hace 2 horas</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-xl text-white shadow-lg"
          >
            <Star className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Plantilla Destacada</h3>
            <p className="text-lg">Black Friday 2024</p>
          </motion.div>
        </div>

        <DashboardStats />
        <RecentTemplates />
      </main>
    </div>
  );
}