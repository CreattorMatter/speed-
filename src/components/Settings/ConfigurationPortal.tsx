import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, X, UserPlus, Settings } from 'lucide-react';

interface ConfigurationPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigurationPortal({ isOpen, onClose }: ConfigurationPortalProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'general'>('users');

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
      >
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">Configuración del Sistema</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex gap-4 p-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${activeTab === 'users' ? 'bg-violet-100 text-violet-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Users className="w-4 h-4" />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${activeTab === 'roles' ? 'bg-violet-100 text-violet-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Shield className="w-4 h-4" />
              Roles y Permisos
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${activeTab === 'general' ? 'bg-violet-100 text-violet-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Settings className="w-4 h-4" />
              General
            </button>
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {activeTab === 'users' && (
            <div className="space-y-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                <UserPlus className="w-4 h-4" />
                Nuevo Usuario
              </button>
              {/* Aquí irá la tabla de usuarios */}
            </div>
          )}
          
          {activeTab === 'roles' && (
            <div>
              {/* Contenido de roles y permisos */}
            </div>
          )}
          
          {activeTab === 'general' && (
            <div>
              {/* Configuración general */}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 