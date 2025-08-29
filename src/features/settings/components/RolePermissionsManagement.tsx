import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Settings, 
  Save, 
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getRoles,
  getPermissions,
  getPermissionsByCategory,
  getRolesWithPermissions,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
  createPermission,
  updatePermission,
  deletePermission,
  type Permission,
  type RoleWithPermissions
} from '../../../services/rbacService';
import { PermissionGuard } from '../../../components/auth/PermissionGuard';

interface RolePermissionsManagementProps {
  onBack: () => void;
}

export const RolePermissionsManagement: React.FC<RolePermissionsManagementProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState<Record<string, Permission[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para modales
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  // Cargar datos
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [rolesData, permissionsData, permissionsByCat] = await Promise.all([
        getRolesWithPermissions(),
        getPermissions(),
        getPermissionsByCategory()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
      setPermissionsByCategory(permissionsByCat);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers para roles
  const handleCreateRole = () => {
    setEditingRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role: RoleWithPermissions) => {
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este rol?')) return;
    
    try {
      await deleteRole(roleId);
      toast.success('Rol eliminado exitosamente');
      loadData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Error al eliminar el rol');
    }
  };

  // Handlers para permisos
  const handleCreatePermission = () => {
    setEditingPermission(null);
    setShowPermissionModal(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setShowPermissionModal(true);
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este permiso?')) return;
    
    try {
      await deletePermission(permissionId);
      toast.success('Permiso eliminado exitosamente');
      loadData();
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast.error('Error al eliminar el permiso');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración de seguridad...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="admin:roles" fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para administrar roles y permisos.</p>
        </div>
      </div>
    }>
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
                    <Shield className="h-8 w-8 text-blue-600" />
                    Gestión de Roles y Permisos
                  </h1>
                  <p className="text-gray-600">Administra los roles del sistema y sus permisos</p>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'roles'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Roles ({roles.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('permissions')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'permissions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Permisos ({permissions.length})
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'roles' ? (
            <RolesTab
              roles={roles}
              permissions={permissions}
              permissionsByCategory={permissionsByCategory}
              onCreateRole={handleCreateRole}
              onEditRole={handleEditRole}
              onDeleteRole={handleDeleteRole}
              onRefresh={loadData}
            />
          ) : (
            <PermissionsTab
              permissions={permissions}
              permissionsByCategory={permissionsByCategory}
              onCreatePermission={handleCreatePermission}
              onEditPermission={handleEditPermission}
              onDeletePermission={handleDeletePermission}
              onRefresh={loadData}
            />
          )}
        </div>

        {/* Modales */}
        <AnimatePresence>
          {showRoleModal && (
            <RoleModal
              role={editingRole}
              permissions={permissions}
              permissionsByCategory={permissionsByCategory}
              onClose={() => setShowRoleModal(false)}
              onSave={() => {
                setShowRoleModal(false);
                loadData();
              }}
            />
          )}
          {showPermissionModal && (
            <PermissionModal
              permission={editingPermission}
              onClose={() => setShowPermissionModal(false)}
              onSave={() => {
                setShowPermissionModal(false);
                loadData();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </PermissionGuard>
  );
};

// Componente para la pestaña de roles
const RolesTab: React.FC<{
  roles: RoleWithPermissions[];
  permissions: Permission[];
  permissionsByCategory: Record<string, Permission[]>;
  onCreateRole: () => void;
  onEditRole: (role: RoleWithPermissions) => void;
  onDeleteRole: (roleId: string) => void;
  onRefresh: () => void;
}> = ({ roles, onCreateRole, onEditRole, onDeleteRole }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Roles del Sistema</h2>
        <button
          onClick={onCreateRole}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Rol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditRole(role)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Editar rol"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteRole(role.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Eliminar rol"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Usuarios:</span>
                <span className="font-medium">{role.userCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Permisos:</span>
                <span className="font-medium">{role.permissions.length}</span>
              </div>
              
              {role.permissions.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500 mb-2">Permisos principales:</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {permission.split(':')[1] || permission}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        +{role.permissions.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Componente para la pestaña de permisos
const PermissionsTab: React.FC<{
  permissions: Permission[];
  permissionsByCategory: Record<string, Permission[]>;
  onCreatePermission: () => void;
  onEditPermission: (permission: Permission) => void;
  onDeletePermission: (permissionId: string) => void;
  onRefresh: () => void;
}> = ({ permissionsByCategory, onCreatePermission, onEditPermission, onDeletePermission }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Permisos del Sistema</h2>
        <button
          onClick={onCreatePermission}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Permiso
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {category} ({categoryPermissions.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPermissions.map((permission) => (
                  <motion.div
                    key={permission.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {permission.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {permission.description}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => onEditPermission(permission)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar permiso"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onDeletePermission(permission.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar permiso"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modal para crear/editar roles
const RoleModal: React.FC<{
  role: RoleWithPermissions | null;
  permissions: Permission[];
  permissionsByCategory: Record<string, Permission[]>;
  onClose: () => void;
  onSave: () => void;
}> = ({ role, permissions, permissionsByCategory, onClose, onSave }) => {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role?.permissions || [])
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      
      if (role) {
        // Actualizar rol existente
        await updateRole(role.id, { name, description });
        await updateRolePermissions(role.id, Array.from(selectedPermissions));
        toast.success('Rol actualizado exitosamente');
      } else {
        // Crear nuevo rol
        const newRole = await createRole({ name, description });
        await updateRolePermissions(newRole.id, Array.from(selectedPermissions));
        toast.success('Rol creado exitosamente');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Error al guardar el rol');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (permissionName: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionName)) {
      newSelected.delete(permissionName);
    } else {
      newSelected.add(permissionName);
    }
    setSelectedPermissions(newSelected);
  };

  const toggleCategoryPermissions = (categoryPermissions: Permission[]) => {
    const categoryNames = categoryPermissions.map(p => p.name);
    const allSelected = categoryNames.every(name => selectedPermissions.has(name));
    
    const newSelected = new Set(selectedPermissions);
    if (allSelected) {
      // Deseleccionar todos
      categoryNames.forEach(name => newSelected.delete(name));
    } else {
      // Seleccionar todos
      categoryNames.forEach(name => newSelected.add(name));
    }
    setSelectedPermissions(newSelected);
  };

  return (
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
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {role ? 'Editar Rol' : 'Crear Rol'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Información básica del rol */}
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="role-name" className="block text-sm font-medium text-gray-700">
                  Nombre del Rol
                </label>
                <input
                  id="role-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Editor de Contenido"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="role-description" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="role-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe las responsabilidades de este rol..."
                />
              </div>
            </div>

            {/* Selección de permisos */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Permisos ({selectedPermissions.size} seleccionados)
              </h4>
              
              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
                  const categoryNames = categoryPermissions.map(p => p.name);
                  const selectedCount = categoryNames.filter(name => selectedPermissions.has(name)).length;
                  const allSelected = selectedCount === categoryNames.length;
                  const partialSelected = selectedCount > 0 && selectedCount < categoryNames.length;

                  return (
                    <div key={category} className="border border-gray-200 rounded-lg">
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900 capitalize">
                            {category} ({selectedCount}/{categoryNames.length})
                          </h5>
                          <button
                            type="button"
                            onClick={() => toggleCategoryPermissions(categoryPermissions)}
                            className={`flex items-center space-x-2 px-3 py-1 rounded text-sm font-medium ${
                              allSelected
                                ? 'bg-blue-100 text-blue-800'
                                : partialSelected
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {allSelected ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Todos</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3" />
                                <span>Seleccionar todos</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categoryPermissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-start space-x-3 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.has(permission.name)}
                                onChange={() => togglePermission(permission.name)}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {permission.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {permission.description}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {role ? 'Actualizar' : 'Crear'} Rol
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Modal para crear/editar permisos
const PermissionModal: React.FC<{
  permission: Permission | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ permission, onClose, onSave }) => {
  const [name, setName] = useState(permission?.name || '');
  const [category, setCategory] = useState(permission?.category || 'custom');
  const [description, setDescription] = useState(permission?.description || '');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: 'builder', label: 'Builder' },
    { value: 'poster', label: 'Carteleras' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'group', label: 'Grupos' },
    { value: 'admin', label: 'Administración' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !description.trim()) return;

    try {
      setIsLoading(true);
      
      if (permission) {
        await updatePermission(permission.id, { name, category, description });
        toast.success('Permiso actualizado exitosamente');
      } else {
        await createPermission({ name, category, description });
        toast.success('Permiso creado exitosamente');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving permission:', error);
      toast.error('Error al guardar el permiso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {permission ? 'Editar Permiso' : 'Crear Permiso'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="permission-name" className="block text-sm font-medium text-gray-700">
              Nombre del Permiso
            </label>
            <input
              id="permission-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: user:create"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Usa el formato categoria:accion (ej: builder:create, poster:edit)
            </p>
          </div>
          
          <div>
            <label htmlFor="permission-category" className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="permission-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="permission-description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="permission-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe qué permite este permiso..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || !category.trim() || !description.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {permission ? 'Actualizar' : 'Crear'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
