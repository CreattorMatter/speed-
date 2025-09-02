import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  X, 
  Save,
  Users as UsersIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Group } from '../../../types';
import { useAdministrationData } from '../../../hooks/useAdministrationData';

interface GroupsManagementProps {
  onBack: () => void;
}

export const GroupsManagement: React.FC<GroupsManagementProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ [key: string]: 'bottom' | 'top' }>({});
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Estados para formularios
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');

  // Usar hook centralizado para datos
  const {
    groups,
    users,
    isLoading,
    createGroup,
    updateGroup,
    deleteGroup,
    addUserToGroup,
    removeUserFromGroup
  } = useAdministrationData();

  // Filtrar grupos
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    try {
      await createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        users: []
      });
      
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
    } catch (error) {
      console.error('Error al crear grupo:', error);
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup || !editGroupName.trim()) return;
    
    try {
      await updateGroup(selectedGroup.id, {
        name: editGroupName.trim(),
        description: editGroupDescription.trim()
      });
      
      setShowEditModal(false);
      setSelectedGroup(null);
      setEditGroupName('');
      setEditGroupDescription('');
    } catch (error) {
      console.error('Error al actualizar grupo:', error);
    }
  };

  const handleManageUsers = (group: Group) => {
    setSelectedGroup(group);
    setShowUsersModal(true);
    setActiveMenu(null);
  };

  const handleDeleteGroup = async (group: Group) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el grupo "${group.name}"?`)) {
      try {
        await deleteGroup(group.id);
      } catch (error) {
        console.error('Error al eliminar grupo:', error);
      }
    }
    setActiveMenu(null);
  };

  const openEditModal = (group: Group) => {
    setSelectedGroup(group);
    setEditGroupName(group.name);
    setEditGroupDescription(group.description || '');
    setShowEditModal(true);
    setActiveMenu(null);
  };

  const handleAddUserToGroup = async (userId: string) => {
    if (!selectedGroup) return;
    
    try {
      await addUserToGroup(selectedGroup.id, userId);
    } catch (error) {
      console.error('Error al agregar usuario al grupo:', error);
    }
  };

  const handleRemoveUserFromGroup = async (userId: string) => {
    if (!selectedGroup) return;
    
    try {
      await removeUserFromGroup(selectedGroup.id, userId);
    } catch (error) {
      console.error('Error al remover usuario del grupo:', error);
    }
  };

  // Función para calcular posición del menú
  const calculateMenuPosition = (groupId: string) => {
    const button = buttonRefs.current[groupId];
    if (!button) return 'bottom';

    const rect = button.getBoundingClientRect();
    const menuHeight = 150; // Altura aproximada del menú
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
      return 'top';
    }
    
    return 'bottom';
  };

  const handleMenuToggle = (groupId: string) => {
    if (activeMenu === groupId) {
      setActiveMenu(null);
    } else {
      const position = calculateMenuPosition(groupId);
      setMenuPosition(prev => ({ ...prev, [groupId]: position }));
      setActiveMenu(groupId);
    }
  };

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !Object.values(buttonRefs.current).some(button => 
        button?.contains(event.target as Node)
      )) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                  Gestión de Grupos
                </h1>
                <p className="text-gray-600">Organiza usuarios en grupos para facilitar la administración</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Grupo
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative"
            >
              {/* Menu desplegable */}
              <div className="absolute top-4 right-4">
                <button
                  ref={(el) => buttonRefs.current[group.id] = el}
                  onClick={() => handleMenuToggle(group.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
                
                {activeMenu === group.id && (
                  <div className={`
                    absolute right-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50
                    ${menuPosition[group.id] === 'top' 
                      ? 'bottom-full mb-1' 
                      : 'top-full mt-1'
                    }
                  `}>
                    <div className="py-1">
                      <button
                        onClick={() => openEditModal(group)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleManageUsers(group)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Gestionar Usuarios
                      </button>

                      <button
                        onClick={() => handleDeleteGroup(group)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usuarios:</span>
                  <span className="font-medium">{group.users?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Creado:</span>
                  <span className="text-gray-500">
                    {group.created_at ? new Date(group.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

                 {/* Empty state */}
         {filteredGroups.length === 0 && !isLoading && (
           <div className="text-center py-12">
             <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">
               {searchTerm ? 'No se encontraron grupos' : 'No hay grupos'}
             </h3>
             <p className="text-gray-600 mb-4">
               {searchTerm 
                 ? 'Intenta con otros términos de búsqueda'
                 : 'Comienza creando tu primer grupo'
               }
             </p>
             
             
             
             {!searchTerm && (
               <button
                 onClick={() => setShowCreateModal(true)}
                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
               >
                 <UserPlus className="h-4 w-4 mr-2" />
                 Crear Grupo
               </button>
             )}
           </div>
         )}
      </div>

      {/* Modales - Se mantienen las funcionalidades básicas sin enabledCards */}
      <AnimatePresence>
        {/* Modal Crear Grupo */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Grupo</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Grupo
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Sucursal Centro"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descripción del grupo..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2 inline" />
                    Crear Grupo
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal Editar Grupo */}
        {showEditModal && selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Editar Grupo: {selectedGroup.name}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Grupo
                    </label>
                    <input
                      type="text"
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={editGroupDescription}
                      onChange={(e) => setEditGroupDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEditGroup}
                    disabled={!editGroupName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2 inline" />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal Gestionar Usuarios */}
        {showUsersModal && selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Gestionar Usuarios - {selectedGroup.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowUsersModal(false);
                      setSelectedGroup(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Usuarios actuales del grupo */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Usuarios en el grupo ({selectedGroup.users?.length || 0})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedGroup.users && selectedGroup.users.length > 0 ? (
                        selectedGroup.users.map((userId) => {
                          const user = users.find(u => u.id === userId);
                          if (!user) return null;
                          
                          return (
                            <div key={userId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                              <button
                                onClick={() => handleRemoveUserFromGroup(userId)}
                                className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded-md border border-red-200"
                              >
                                Remover
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No hay usuarios en este grupo
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Usuarios disponibles para agregar */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Usuarios disponibles
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {users.filter(user => !selectedGroup.users?.includes(user.id)).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                          </div>
                          <button
                            onClick={() => handleAddUserToGroup(user.id)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded-md border border-blue-200"
                          >
                            Agregar
                          </button>
                        </div>
                      ))}
                      
                      {users.filter(user => !selectedGroup.users?.includes(user.id)).length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          Todos los usuarios ya están en este grupo
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setShowUsersModal(false);
                      setSelectedGroup(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
