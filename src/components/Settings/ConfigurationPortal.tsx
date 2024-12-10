import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, X, UserPlus, Settings, Plus } from 'lucide-react';
import { UsersTable } from './UsersTable';
import { RolesTable } from './RolesTable';

interface ConfigurationPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockUsers = [
  {
    id: '1',
    name: 'Usuario Administrador',
    email: 'admin@admin.com',
    role: 'Administrador',
    status: 'active' as const,
    lastLogin: 'Hace 2 horas'
  },
  {
    id: '2',
    name: 'Usuario Sucursal Pilar',
    email: 'pilar@cenco.com',
    role: 'Usuario',
    status: 'active' as const,
    lastLogin: 'Hace 1 día'
  }
];

const mockRoles = [
  {
    id: '1',
    name: 'Administrador',
    description: 'Control total del sistema',
    permissions: [
      { id: '1', name: 'Usuarios', description: 'Gestión de usuarios' },
      { id: '2', name: 'Roles', description: 'Gestión de roles' },
      { id: '3', name: 'Productos', description: 'Gestión de productos' },
      { id: '3', name: 'Promociones', description: 'Gestión de Promociones' },
      { id: '3', name: 'Cartel', description: 'Creación de Carteles' },
      { id: '3', name: 'Impresión', description: 'Impresión de Carteles' },
      { id: '3', name: 'Builder', description: 'Creación de Plantillas' }
    ],
    usersCount: 2
  },
  {
    id: '2',
    name: 'Usuario',
    description: 'Acceso básico al sistema',
    permissions: [
      { id: '3', name: 'Productos', description: 'Gestión de productos' },
      { id: '3', name: 'Impresión', description: 'Impresión de Carteles' },
      { id: '3', name: 'Re Impresión', description: 'Impresión de Carteles' },
      { id: '3', name: 'Promociones', description: 'Gestión de Promociones' }
    ],
    usersCount: 5
  }
];

export function ConfigurationPortal({ isOpen, onClose }: ConfigurationPortalProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'general'>('users');

  const handleEditUser = (user: any) => {
    console.log('Editar usuario:', user);
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Eliminar usuario:', userId);
  };

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive') => {
    console.log('Cambiar estado:', userId, newStatus);
  };

  const handleEditRole = (role: any) => {
    console.log('Editar rol:', role);
  };

  const handleDeleteRole = (roleId: string) => {
    console.log('Eliminar rol:', roleId);
  };

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
        className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[80vh] overflow-hidden"
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestión de Usuarios</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Nuevo Usuario
                </button>
              </div>
              <UsersTable
                users={mockUsers}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}
          
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestión de Roles</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Nuevo Rol
                </button>
              </div>
              <RolesTable
                roles={mockRoles}
                onEdit={handleEditRole}
                onDelete={handleDeleteRole}
              />
            </div>
          )}
          
          {activeTab === 'general' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración General</h3>
              {/* Aquí puedes agregar la configuración general */}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 