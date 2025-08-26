import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Search, UserPlus, UserMinus, MoreVertical, FileText, LayoutTemplate, Settings, Inbox, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import type { Group, User, Role } from '@/types';

// Definir las cards disponibles
export interface DashboardCard {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
}

const AVAILABLE_CARDS: DashboardCard[] = [
  {
    id: 'cartel',
    name: 'Cartel',
    description: 'Crear carteles promocionales y informativos',
    icon: FileText,
    color: 'violet'
  },
  {
    id: 'builder',
    name: 'Builder',
    description: 'Diseñar templates personalizados',
    icon: LayoutTemplate,
    color: 'emerald'
  },
  {
    id: 'administracion',
    name: 'Administración',
    description: 'Gestión avanzada de usuarios y configuraciones',
    icon: Settings,
    color: 'blue'
  },
  {
    id: 'recibidos',
    name: 'Recibidos',
    description: 'Visualizar elementos recibidos',
    icon: Inbox,
    color: 'cyan'
  },
  {
    id: 'enviados',
    name: 'Enviados',
    description: 'Revisar elementos enviados',
    icon: Send,
    color: 'fuchsia'
  }
];

interface GroupsManagementProps {
  groups: Group[];
  users: User[];
  roles: Role[];
  onCreateGroup: (groupData: Omit<Group, 'id' | 'created_at'>) => Promise<void>;
  onUpdateGroup: (groupId: string, groupData: Partial<Group>) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onAddUserToGroup: (groupId: string, userId: string) => Promise<void>;
  onRemoveUserFromGroup: (groupId: string, userId: string) => Promise<void>;
}

export const GroupsManagement: React.FC<GroupsManagementProps> = ({
  groups,
  users,
  roles,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddUserToGroup,
  onRemoveUserFromGroup
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showCardsModal, setShowCardsModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Filter groups based on search
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setShowCreateModal(true);
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowEditModal(true);
    setActiveMenu(null);
  };

  const handleManageUsers = (group: Group) => {
    setSelectedGroup(group);
    setShowUsersModal(true);
    setActiveMenu(null);
  };

  const handleConfigureCards = (group: Group) => {
    setSelectedGroup(group);
    setShowCardsModal(true);
    setActiveMenu(null);
  };

  const handleDeleteGroup = async (group: Group) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el grupo "${group.name}"?`)) {
      try {
        await onDeleteGroup(group.id);
        toast.success('Grupo eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar el grupo');
      }
    }
    setActiveMenu(null);
  };

  const getUsersInGroup = (groupId: string): User[] => {
    return users.filter(user => user.groups?.includes(groupId));
  };

  const getUsersNotInGroup = (groupId: string): User[] => {
    return users.filter(user => !user.groups?.includes(groupId));
  };

  const getRoleName = (roleId: string): string => {
    return roles.find(r => r.id === roleId)?.name || roleId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Users className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Grupos</h2>
            <p className="text-sm text-gray-500">Organiza usuarios en grupos para facilitar la administración</p>
          </div>
        </div>
        <button
          onClick={handleCreateGroup}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Grupo
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredGroups.length} de {groups.length} grupos
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => {
          const groupUsers = getUsersInGroup(group.id);
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Group Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.description}</p>
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === group.id ? null : group.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                      {activeMenu === group.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
                        >
                          <div className="py-1">
                            <button
                              onClick={() => handleEditGroup(group)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar Grupo
                            </button>
                            <button
                              onClick={() => handleManageUsers(group)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Gestionar Usuarios
                            </button>
                            <button
                              onClick={() => handleConfigureCards(group)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <LayoutTemplate className="w-4 h-4 mr-2" />
                              Configurar Cards
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar Grupo
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Group Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{groupUsers.length} usuarios</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {group.created_at && `Creado ${new Date(group.created_at).toLocaleDateString('es-ES')}`}
                  </div>
                </div>

                {/* Users Preview */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Usuarios en el grupo
                  </div>
                  {groupUsers.length > 0 ? (
                    <div className="space-y-1">
                      {groupUsers.slice(0, 3).map((user) => (
                        <div key={user.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs text-blue-700 font-medium">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-gray-900">{user.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{getRoleName(user.role)}</span>
                        </div>
                      ))}
                      {groupUsers.length > 3 && (
                        <div className="text-xs text-gray-500 pl-8">
                          +{groupUsers.length - 3} más...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Sin usuarios asignados</div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleManageUsers(group)}
                    className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    Gestionar
                  </button>
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron grupos' : 'No hay grupos creados'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Crea tu primer grupo para organizar usuarios'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateGroup}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Grupo
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateGroup={onCreateGroup}
      />

      <EditGroupModal
        isOpen={showEditModal}
        group={selectedGroup}
        onClose={() => setShowEditModal(false)}
        onUpdateGroup={onUpdateGroup}
      />

      <ManageUsersModal
        isOpen={showUsersModal}
        group={selectedGroup}
        users={users}
        roles={roles}
        usersInGroup={selectedGroup ? getUsersInGroup(selectedGroup.id) : []}
        usersNotInGroup={selectedGroup ? getUsersNotInGroup(selectedGroup.id) : []}
        onClose={() => setShowUsersModal(false)}
        onAddUserToGroup={onAddUserToGroup}
        onRemoveUserFromGroup={onRemoveUserFromGroup}
      />

      <ConfigureCardsModal
        isOpen={showCardsModal}
        group={selectedGroup}
        onClose={() => setShowCardsModal(false)}
        onUpdateGroup={onUpdateGroup}
        availableCards={AVAILABLE_CARDS}
      />
    </div>
  );
};

// Create Group Modal Component
interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: Omit<Group, 'id' | 'created_at'>) => Promise<void>;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onCreateGroup }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      await onCreateGroup({
        name: formData.name.trim(),
        description: formData.description.trim(),
        users: []
      });
      toast.success('Grupo creado exitosamente');
      setFormData({ name: '', description: '' });
      onClose();
    } catch (error) {
      toast.error('Error al crear el grupo');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Grupo</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Grupo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Sucursal Almagro"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descripción opcional del grupo..."
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formData.name.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creando...' : 'Crear Grupo'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Edit Group Modal Component
interface EditGroupModalProps {
  isOpen: boolean;
  group: Group | null;
  onClose: () => void;
  onUpdateGroup: (groupId: string, groupData: Partial<Group>) => Promise<void>;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({ isOpen, group, onClose, onUpdateGroup }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || ''
      });
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !formData.name.trim()) return;

    setIsLoading(true);
    try {
      await onUpdateGroup(group.id, {
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      toast.success('Grupo actualizado exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar el grupo');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !group) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Grupo</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Grupo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formData.name.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Manage Users Modal Component
interface ManageUsersModalProps {
  isOpen: boolean;
  group: Group | null;
  users: User[];
  roles: Role[];
  usersInGroup: User[];
  usersNotInGroup: User[];
  onClose: () => void;
  onAddUserToGroup: (groupId: string, userId: string) => Promise<void>;
  onRemoveUserFromGroup: (groupId: string, userId: string) => Promise<void>;
}

const ManageUsersModal: React.FC<ManageUsersModalProps> = ({
  isOpen,
  group,
  roles,
  usersInGroup,
  usersNotInGroup,
  onClose,
  onAddUserToGroup,
  onRemoveUserFromGroup
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const getRoleName = (roleId: string): string => {
    return roles.find(r => r.id === roleId)?.name || roleId;
  };

  const filteredUsersNotInGroup = usersNotInGroup.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async (userId: string) => {
    if (!group) return;
    
    setIsLoading(userId);
    try {
      await onAddUserToGroup(group.id, userId);
      toast.success('Usuario agregado al grupo');
    } catch (error) {
      toast.error('Error al agregar usuario');
    } finally {
      setIsLoading(null);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!group) return;
    
    setIsLoading(userId);
    try {
      await onRemoveUserFromGroup(group.id, userId);
      toast.success('Usuario removido del grupo');
    } catch (error) {
      toast.error('Error al remover usuario');
    } finally {
      setIsLoading(null);
    }
  };

  if (!isOpen || !group) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Gestionar Usuarios - {group.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Agrega o remueve usuarios de este grupo
            </p>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users in Group */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Usuarios en el grupo ({usersInGroup.length})
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {usersInGroup.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm text-blue-700 font-medium">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email} • {getRoleName(user.role)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        disabled={isLoading === user.id}
                        className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {usersInGroup.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay usuarios en este grupo
                    </div>
                  )}
                </div>
              </div>

              {/* Available Users */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Usuarios disponibles ({filteredUsersNotInGroup.length})
                  </h4>
                </div>
                
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar usuarios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredUsersNotInGroup.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm text-gray-700 font-medium">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email} • {getRoleName(user.role)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddUser(user.id)}
                        disabled={isLoading === user.id}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {filteredUsersNotInGroup.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No se encontraron usuarios' : 'Todos los usuarios están en el grupo'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Configure Cards Modal Component
interface ConfigureCardsModalProps {
  isOpen: boolean;
  group: Group | null;
  onClose: () => void;
  onUpdateGroup: (groupId: string, groupData: Partial<Group>) => Promise<void>;
  availableCards: DashboardCard[];
}

const ConfigureCardsModal: React.FC<ConfigureCardsModalProps> = ({
  isOpen,
  group,
  onClose,
  onUpdateGroup,
  availableCards
}) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (group) {
      // Si el grupo tiene cards configuradas, usarlas; si no, usar todas por defecto
      const groupCards = group.enabledCards || availableCards.map(c => c.id);
      setSelectedCards(groupCards);
    }
  }, [group, availableCards]);

  const handleToggleCard = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCards.length === availableCards.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(availableCards.map(c => c.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    setIsLoading(true);
    try {
      await onUpdateGroup(group.id, {
        ...group,
        enabledCards: selectedCards
      });
      toast.success('Configuración de cards actualizada');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const getCardColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = {
      bg: isSelected ? 'border-2' : 'border-2',
      icon: isSelected ? '' : 'text-gray-400'
    };

    switch (color) {
      case 'violet':
        return {
          ...baseClasses,
          bg: isSelected ? 'bg-violet-50 border-violet-500' : 'bg-gray-50 border-gray-200',
          icon: isSelected ? 'text-violet-600' : 'text-gray-400',
          checkbox: isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
        };
      case 'emerald':
        return {
          ...baseClasses,
          bg: isSelected ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-50 border-gray-200',
          icon: isSelected ? 'text-emerald-600' : 'text-gray-400',
          checkbox: isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
        };
      case 'blue':
        return {
          ...baseClasses,
          bg: isSelected ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-200',
          icon: isSelected ? 'text-blue-600' : 'text-gray-400',
          checkbox: isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
        };
      case 'cyan':
        return {
          ...baseClasses,
          bg: isSelected ? 'bg-cyan-50 border-cyan-500' : 'bg-gray-50 border-gray-200',
          icon: isSelected ? 'text-cyan-600' : 'text-gray-400',
          checkbox: isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-300'
        };
      case 'fuchsia':
        return {
          ...baseClasses,
          bg: isSelected ? 'bg-fuchsia-50 border-fuchsia-500' : 'bg-gray-50 border-gray-200',
          icon: isSelected ? 'text-fuchsia-600' : 'text-gray-400',
          checkbox: isSelected ? 'border-fuchsia-500 bg-fuchsia-500' : 'border-gray-300'
        };
      default:
        return {
          ...baseClasses,
          bg: isSelected ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-200',
          icon: isSelected ? 'text-blue-600' : 'text-gray-400',
          checkbox: isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
        };
    }
  };

  if (!isOpen || !group) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Configurar Cards - {group.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Selecciona qué cards estarán disponibles para este grupo en el dashboard
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Select All Button */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600">
                  {selectedCards.length} de {availableCards.length} cards seleccionadas
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  {selectedCards.length === availableCards.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableCards.map((card) => {
                  const isSelected = selectedCards.includes(card.id);
                  const colorClasses = getCardColorClasses(card.color, isSelected);
                  const Icon = card.icon;
                  
                  return (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${colorClasses.bg}`}
                      onClick={() => handleToggleCard(card.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${colorClasses.icon}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {card.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {card.description}
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${colorClasses.checkbox}`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {selectedCards.length === 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Al menos una card debe estar seleccionada para que los usuarios del grupo puedan acceder al dashboard.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={selectedCards.length === 0 || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GroupsManagement;