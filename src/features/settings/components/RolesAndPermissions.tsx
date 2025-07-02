import React, { useState } from 'react';
import { Users, Shield, Plus, Edit, Trash2, Copy, Settings, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos de datos para roles y permisos
interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isCustom: boolean;
  userCount: number;
  createdAt: string;
  color: string;
}

// Datos mock de permisos
const PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'dashboard.view', module: 'Dashboard', action: 'ver', description: 'Acceder al dashboard principal' },
  
  // Productos
  { id: 'products.view', module: 'Productos', action: 'ver', description: 'Ver lista de productos' },
  { id: 'products.create', module: 'Productos', action: 'crear', description: 'Crear nuevos productos' },
  { id: 'products.edit', module: 'Productos', action: 'editar', description: 'Modificar productos existentes' },
  { id: 'products.delete', module: 'Productos', action: 'eliminar', description: 'Eliminar productos' },
  { id: 'products.export', module: 'Productos', action: 'exportar', description: 'Exportar catálogo de productos' },
  
  // Promociones
  { id: 'promotions.view', module: 'Promociones', action: 'ver', description: 'Ver promociones' },
  { id: 'promotions.create', module: 'Promociones', action: 'crear', description: 'Crear promociones' },
  { id: 'promotions.edit', module: 'Promociones', action: 'editar', description: 'Editar promociones' },
  { id: 'promotions.delete', module: 'Promociones', action: 'eliminar', description: 'Eliminar promociones' },
  
  // Carteles
  { id: 'posters.view', module: 'Carteles', action: 'ver', description: 'Ver carteles' },
  { id: 'posters.create', module: 'Carteles', action: 'crear', description: 'Crear carteles físicos' },
  { id: 'posters.edit', module: 'Carteles', action: 'editar', description: 'Editar carteles' },
  { id: 'posters.print', module: 'Carteles', action: 'imprimir', description: 'Enviar a impresión' },
  { id: 'posters.digital', module: 'Carteles', action: 'digital', description: 'Gestionar carteles digitales' },
  
  // Builder/Plantillas
  { id: 'templates.view', module: 'Plantillas', action: 'ver', description: 'Ver plantillas' },
  { id: 'templates.create', module: 'Plantillas', action: 'crear', description: 'Crear plantillas' },
  { id: 'templates.edit', module: 'Plantillas', action: 'editar', description: 'Editar plantillas' },
  { id: 'templates.delete', module: 'Plantillas', action: 'eliminar', description: 'Eliminar plantillas' },
  { id: 'families.manage', module: 'Plantillas', action: 'familias', description: 'Gestionar familias de plantillas' },
  
  // Analytics
  { id: 'analytics.view', module: 'Analytics', action: 'ver', description: 'Ver métricas y reportes' },
  { id: 'analytics.export', module: 'Analytics', action: 'exportar', description: 'Exportar reportes' },
  
  // Administración
  { id: 'admin.users', module: 'Administración', action: 'usuarios', description: 'Gestionar usuarios' },
  { id: 'admin.roles', module: 'Administración', action: 'roles', description: 'Gestionar roles y permisos' },
  { id: 'admin.security', module: 'Administración', action: 'seguridad', description: 'Configurar seguridad' },
  { id: 'admin.system', module: 'Administración', action: 'sistema', description: 'Configuración del sistema' },
];

// Datos mock de roles
const INITIAL_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'admin',
    displayName: 'Administrador',
    description: 'Acceso total a todas las funciones del sistema',
    permissions: PERMISSIONS.map(p => p.id),
    isCustom: false,
    userCount: 2,
    createdAt: '2024-01-01',
    color: '#EF4444'
  },
  {
    id: 'editor',
    name: 'editor',
    displayName: 'Editor',
    description: 'Puede crear y editar plantillas y carteles',
    permissions: [
      'dashboard.view',
      'products.view', 'products.export',
      'promotions.view', 'promotions.create', 'promotions.edit',
      'posters.view', 'posters.create', 'posters.edit', 'posters.print',
      'templates.view', 'templates.create', 'templates.edit'
    ],
    isCustom: false,
    userCount: 5,
    createdAt: '2024-01-01',
    color: '#3B82F6'
  },
  {
    id: 'viewer',
    name: 'viewer',
    displayName: 'Visualizador',
    description: 'Solo puede ver carteles y plantillas',
    permissions: [
      'dashboard.view',
      'products.view',
      'promotions.view',
      'posters.view',
      'templates.view'
    ],
    isCustom: false,
    userCount: 8,
    createdAt: '2024-01-01',
    color: '#10B981'
  },
  {
    id: 'sucursal',
    name: 'sucursal',
    displayName: 'Sucursal',
    description: 'Gestión limitada para sucursales específicas',
    permissions: [
      'dashboard.view',
      'products.view',
      'promotions.view',
      'posters.view', 'posters.print'
    ],
    isCustom: false,
    userCount: 12,
    createdAt: '2024-01-01',
    color: '#F59E0B'
  }
];

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: Omit<Role, 'id' | 'userCount' | 'createdAt'>) => void;
  existingRole?: Role;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ isOpen, onClose, onSave, existingRole }) => {
  const [formData, setFormData] = useState({
    name: existingRole?.name || '',
    displayName: existingRole?.displayName || '',
    description: existingRole?.description || '',
    permissions: existingRole?.permissions || [],
    color: existingRole?.color || '#6366F1'
  });

  const groupedPermissions = PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleModuleToggle = (modulePermissions: Permission[]) => {
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => formData.permissions.includes(id));
    
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(id => !modulePermissionIds.includes(id))
        : [...new Set([...prev.permissions, ...modulePermissionIds])]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      isCustom: true
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {existingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre interno
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ej: marketing_manager"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre para mostrar
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ej: Gerente de Marketing"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Descripción del rol y sus responsabilidades..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Permisos</h3>
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([module, modulePermissions]) => {
                const allSelected = modulePermissions.every(p => formData.permissions.includes(p.id));
                const someSelected = modulePermissions.some(p => formData.permissions.includes(p.id));
                
                return (
                  <div key={module} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{module}</h4>
                      <button
                        type="button"
                        onClick={() => handleModuleToggle(modulePermissions)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          allSelected
                            ? 'bg-blue-100 text-blue-700'
                            : someSelected
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {allSelected ? 'Desmarcar todo' : 'Marcar todo'}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {modulePermissions.map((permission) => (
                        <label key={permission.id} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {permission.action}
                            </div>
                            <div className="text-xs text-gray-500">
                              {permission.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
            >
              {existingRole ? 'Guardar Cambios' : 'Crear Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const RolesAndPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(false);

  const handleCreateRole = (roleData: Omit<Role, 'id' | 'userCount' | 'createdAt'>) => {
    const newRole: Role = {
      ...roleData,
      id: `custom_${Date.now()}`,
      userCount: 0,
      createdAt: new Date().toISOString()
    };
    setRoles([...roles, newRole]);
  };

  const handleEditRole = (roleData: Omit<Role, 'id' | 'userCount' | 'createdAt'>) => {
    if (!editingRole) return;
    
    setRoles(roles.map(role => 
      role.id === editingRole.id 
        ? { ...role, ...roleData }
        : role
    ));
    setEditingRole(undefined);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    if (role.userCount > 0) {
      alert(`No se puede eliminar el rol "${role.displayName}" porque tiene ${role.userCount} usuarios asignados.`);
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar el rol "${role.displayName}"?`)) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  };

  const handleDuplicateRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    const duplicatedRole: Role = {
      ...role,
      id: `copy_${Date.now()}`,
      name: `${role.name}_copy`,
      displayName: `${role.displayName} (Copia)`,
      isCustom: true,
      userCount: 0,
      createdAt: new Date().toISOString()
    };
    setRoles([...roles, duplicatedRole]);
  };

  const getModulePermissions = (roleId: string, module: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return [];
    
    return PERMISSIONS
      .filter(p => p.module === module && role.permissions.includes(p.id))
      .map(p => p.action);
  };

  const modules = [...new Set(PERMISSIONS.map(p => p.module))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Roles y Permisos</h2>
          <p className="text-gray-600">Gestiona los roles del sistema y sus permisos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPermissionsMatrix(!showPermissionsMatrix)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showPermissionsMatrix ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPermissionsMatrix ? 'Ocultar Matriz' : 'Ver Matriz'}
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Rol
          </button>
        </div>
      </div>

      {/* Matriz de Permisos */}
      <AnimatePresence>
        {showPermissionsMatrix && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-900">Matriz de Permisos</h3>
              <p className="text-sm text-gray-600">Vista general de permisos por rol</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-900">Módulo</th>
                    {roles.map(role => (
                      <th key={role.id} className="text-center p-3 font-medium text-gray-900 min-w-32">
                        <div className="flex flex-col items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: role.color }}
                          />
                          <span className="text-xs">{role.displayName}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module, index) => (
                    <tr key={module} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium text-gray-900">{module}</td>
                      {roles.map(role => {
                        const permissions = getModulePermissions(role.id, module);
                        return (
                          <td key={role.id} className="p-3 text-center">
                            {permissions.length > 0 ? (
                              <div className="flex flex-wrap gap-1 justify-center">
                                {permissions.map(action => (
                                  <span
                                    key={action}
                                    className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"
                                  >
                                    {action}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            layout
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{role.displayName}</h3>
                  <p className="text-sm text-gray-500">{role.name}</p>
                </div>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleDuplicateRole(role.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Duplicar rol"
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                {role.isCustom && (
                  <>
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar rol"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar rol"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{role.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Usuarios:</span>
                <span className="font-medium">{role.userCount}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Permisos:</span>
                <span className="font-medium">{role.permissions.length}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tipo:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  role.isCustom 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {role.isCustom ? 'Personalizado' : 'Sistema'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRole(selectedRole?.id === role.id ? null : role)}
              className="w-full mt-4 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {selectedRole?.id === role.id ? 'Ocultar Detalles' : 'Ver Detalles'}
            </button>

            {/* Detalles expandidos */}
            <AnimatePresence>
              {selectedRole?.id === role.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <h4 className="font-medium text-gray-900 mb-3">Permisos Detallados</h4>
                  <div className="space-y-3">
                    {modules.map(module => {
                      const permissions = getModulePermissions(role.id, module);
                      if (permissions.length === 0) return null;
                      
                      return (
                        <div key={module} className="text-sm">
                          <div className="font-medium text-gray-700 mb-1">{module}:</div>
                          <div className="flex flex-wrap gap-1">
                            {permissions.map(action => (
                              <span
                                key={action}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Modal para crear/editar rol */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingRole(undefined);
        }}
        onSave={editingRole ? handleEditRole : handleCreateRole}
        existingRole={editingRole}
      />
    </div>
  );
}; 