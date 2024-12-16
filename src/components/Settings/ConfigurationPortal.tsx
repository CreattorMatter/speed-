import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, X, UserPlus, Settings, Plus } from 'lucide-react';
import { UsersTable } from './UsersTable';
import { RolesTable } from './RolesTable';
import { NewUserModal } from './NewUserModal';
import { EditUserModal } from './EditUserModal';
import { supabase } from '../../lib/supabaseClient';

interface ConfigurationPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

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
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Función para cargar usuarios
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al montar el componente y cuando se crea uno nuevo
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleUserCreated = () => {
    fetchUsers(); // Recargar la lista después de crear un usuario
  };

  // Función para eliminar usuario
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Actualizar la lista de usuarios
      fetchUsers();
      
      // Mostrar notificación de éxito (puedes usar el componente Toast)
      alert('Usuario eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert('Error al eliminar el usuario');
    }
  };

  // Función para cambiar el estado del usuario
  const handleStatusChange = async (userId: number, newStatus: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      // Actualizar la lista de usuarios
      fetchUsers();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('Error al actualizar el estado del usuario');
    }
  };

  // Función para editar usuario
  const handleEditUser = async (user: User) => {
    try {
      // Mostrar modal de edición con los datos actuales
      setEditingUser(user);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error('Error al editar usuario:', err);
      alert('Error al editar el usuario');
    }
  };

  // Función para guardar cambios de edición
  const handleSaveEdit = async (updatedUser: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status
        })
        .eq('id', updatedUser.id);

      if (error) throw error;

      // Actualizar la lista de usuarios
      fetchUsers();
      setIsEditModalOpen(false);
      setEditingUser(null);
      
      // Mostrar notificación de éxito
      alert('Usuario actualizado correctamente');
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      alert('Error al actualizar el usuario');
    }
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
                <button 
                  onClick={() => setIsNewUserModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Nuevo Usuario
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  {error}
                </div>
              ) : (
                <UsersTable
                  users={users}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onStatusChange={handleStatusChange}
                />
              )}
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

      {/* Modal de edición */}
      {editingUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          user={editingUser}
          onSave={handleSaveEdit}
        />
      )}

      {/* Modal de nuevo usuario */}
      <NewUserModal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        onSuccess={handleUserCreated}
      />
    </motion.div>
  );
} 