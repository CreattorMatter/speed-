import { useState, useEffect, useCallback } from 'react';
import { User, Role, Group } from '@/types/index';
import {
  getRoles,
  getUsers,
  getGroups as apiGetGroups,
  getRolesWithPermissions,
  getPermissions,
  upsertPermissions,
  createUser as apiCreateUser,
  updateUser as updateUserDb,
  deleteUser as deleteUserDb,
  createGroup as apiCreateGroup,
  updateGroupDb,
  deleteGroupDb,
  addUserToGroupDb,
  removeUserFromGroupDb,
  createRole,
  updateRole,
  deleteRole,
  createPermission,
  updatePermission,
  deletePermission
} from '@/services/rbacService';
import { toast } from 'react-hot-toast';

// Permisos base del sistema
const SYSTEM_PERMISSIONS = [
  // Dashboard
  { id: 'dashboard.view', module: 'Dashboard', action: 'view', description: 'Ver dashboard principal' },
  
  // Productos
  { id: 'products.view', module: 'Productos', action: 'view', description: 'Ver productos' },
  { id: 'products.export', module: 'Productos', action: 'export', description: 'Exportar productos' },
  
  // Promociones
  { id: 'promotions.view', module: 'Promociones', action: 'view', description: 'Ver promociones' },
  { id: 'promotions.create', module: 'Promociones', action: 'create', description: 'Crear promociones' },
  { id: 'promotions.edit', module: 'Promociones', action: 'edit', description: 'Editar promociones' },
  { id: 'promotions.delete', module: 'Promociones', action: 'delete', description: 'Eliminar promociones' },
  
  // Carteles
  { id: 'posters.view', module: 'Carteles', action: 'view', description: 'Ver carteles' },
  { id: 'posters.create', module: 'Carteles', action: 'create', description: 'Crear carteles' },
  { id: 'posters.edit', module: 'Carteles', action: 'edit', description: 'Editar carteles' },
  { id: 'posters.delete', module: 'Carteles', action: 'delete', description: 'Eliminar carteles' },
  { id: 'posters.print', module: 'Carteles', action: 'print', description: 'Imprimir carteles' },
  
  // Plantillas
  { id: 'templates.view', module: 'Plantillas', action: 'view', description: 'Ver plantillas' },
  { id: 'templates.create', module: 'Plantillas', action: 'create', description: 'Crear plantillas' },
  { id: 'templates.edit', module: 'Plantillas', action: 'edit', description: 'Editar plantillas' },
  { id: 'templates.delete', module: 'Plantillas', action: 'delete', description: 'Eliminar plantillas' },
  
  // Administración
  { id: 'admin.users.view', module: 'Administración', action: 'view', description: 'Ver usuarios' },
  { id: 'admin.users.create', module: 'Administración', action: 'create', description: 'Crear usuarios' },
  { id: 'admin.users.edit', module: 'Administración', action: 'edit', description: 'Editar usuarios' },
  { id: 'admin.users.delete', module: 'Administración', action: 'delete', description: 'Eliminar usuarios' },
  { id: 'admin.roles.view', module: 'Administración', action: 'view', description: 'Ver roles' },
  { id: 'admin.roles.create', module: 'Administración', action: 'create', description: 'Crear roles' },
  { id: 'admin.roles.edit', module: 'Administración', action: 'edit', description: 'Editar roles' },
  { id: 'admin.roles.delete', module: 'Administración', action: 'delete', description: 'Eliminar roles' },
  { id: 'admin.groups.view', module: 'Administración', action: 'view', description: 'Ver grupos' },
  { id: 'admin.groups.create', module: 'Administración', action: 'create', description: 'Crear grupos' },
  { id: 'admin.groups.edit', module: 'Administración', action: 'edit', description: 'Editar grupos' },
  { id: 'admin.groups.delete', module: 'Administración', action: 'delete', description: 'Eliminar grupos' },
  
  // Configuración
  { id: 'settings.view', module: 'Configuración', action: 'view', description: 'Ver configuración' },
  { id: 'settings.edit', module: 'Configuración', action: 'edit', description: 'Editar configuración' },
];

// Roles base del sistema
const BASE_ROLES = [
  {
    id: 'admin',
    name: 'admin',
    displayName: 'Administrador',
    description: 'Acceso total a todas las funciones del sistema',
    permissions: SYSTEM_PERMISSIONS.map(p => p.id),
    isCustom: false,
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
    color: '#F59E0B'
  }
];

interface AdministrationData {
  users: User[];
  roles: Role[];
  groups: Group[];
  permissions: any[];
  isLoading: boolean;
  error: string | null;
}

interface AdministrationActions {
  // Users
  createUser: (userData: any) => Promise<void>;
  updateUser: (userId: string, updates: any) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Roles
  createRole: (roleData: any) => Promise<void>;
  updateRole: (roleId: string, updates: any) => Promise<void>;
  deleteRole: (roleId: string) => Promise<void>;
  
  // Groups
  createGroup: (groupData: any) => Promise<void>;
  updateGroup: (groupId: string, updates: any) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addUserToGroup: (groupId: string, userId: string) => Promise<void>;
  removeUserFromGroup: (groupId: string, userId: string) => Promise<void>;
  
  // Data refresh
  refreshData: () => Promise<void>;
}

export function useAdministrationData(): AdministrationData & AdministrationActions {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar todos los datos
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Primero, asegurar que los permisos base existan
      await upsertPermissions(SYSTEM_PERMISSIONS.map(p => ({ 
        name: p.id, 
        description: `${p.module}: ${p.description}` 
      })));

      // Cargar todos los datos en paralelo
      const [
        dbUsers,
        dbRoles,
        dbGroups,
        dbPermissions,
        dbRolesWithPermissions
      ] = await Promise.all([
        getUsers(),
        getRoles(),
        apiGetGroups(),
        getPermissions(),
        getRolesWithPermissions()
      ]);

      console.log('🔄 Datos cargados:', { 
        users: dbUsers?.length || 0, 
        roles: dbRoles?.length || 0, 
        groups: dbGroups?.length || 0 
      });

      // Usar datos reales si están disponibles, fallback a datos base
      setUsers(dbUsers || []);
      setGroups(dbGroups || []);
      setPermissions(dbPermissions || SYSTEM_PERMISSIONS);

      // Para roles, combinar datos reales con estructura extendida
      if (dbRolesWithPermissions && dbRolesWithPermissions.length > 0) {
        const mappedRoles = dbRolesWithPermissions.map((role: any) => ({
          id: role.id,
          name: role.name,
          displayName: role.name,
          description: role.description || '',
          permissions: role.permissions || [],
          isCustom: !['admin', 'editor', 'viewer', 'sucursal'].includes(role.name),
          userCount: role.userCount || 0,
          createdAt: new Date().toISOString(),
          color: getColorForRole(role.name)
        }));
        setRoles(mappedRoles);
      } else {
        setRoles(BASE_ROLES.map(role => ({ ...role, userCount: 0, createdAt: new Date().toISOString() })));
      }

    } catch (err) {
      console.error('Error loading administration data:', err);
      setError('Error al cargar los datos de administración');
      
      // Fallback a datos base en caso de error
      setUsers([]);
      setRoles(BASE_ROLES.map(role => ({ ...role, userCount: 0, createdAt: new Date().toISOString() })));
      setGroups([]);
      setPermissions(SYSTEM_PERMISSIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para obtener color por rol
  const getColorForRole = (roleName: string): string => {
    const roleColors: Record<string, string> = {
      admin: '#EF4444',
      editor: '#3B82F6',
      viewer: '#10B981',
      sucursal: '#F59E0B'
    };
    return roleColors[roleName] || '#6366F1';
  };

  // Cargar datos al montar el hook
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions para usuarios
  const createUser = useCallback(async (userData: any) => {
    try {
      await apiCreateUser(userData);
      toast.success('Usuario creado exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
      throw error;
    }
  }, [loadData]);

  const updateUser = useCallback(async (userId: string, updates: any) => {
    try {
      await updateUserDb(userId, updates);
      toast.success('Usuario actualizado exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
      throw error;
    }
  }, [loadData]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await deleteUserDb(userId);
      toast.success('Usuario eliminado exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
      throw error;
    }
  }, [loadData]);

  // Actions para roles
  const createRoleAction = useCallback(async (roleData: any) => {
    try {
      await createRole(roleData);
      toast.success('Rol creado exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Error al crear rol');
      throw error;
    }
  }, [loadData]);

  const updateRoleAction = useCallback(async (roleId: string, updates: any) => {
    try {
      await updateRole(roleId, updates);
      toast.success('Rol actualizado exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar rol');
      throw error;
    }
  }, [loadData]);

  const deleteRoleAction = useCallback(async (roleId: string) => {
    try {
      await deleteRole(roleId);
      toast.success('Rol eliminado exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Error al eliminar rol');
      throw error;
    }
  }, [loadData]);

  // Actions para grupos
  const createGroupAction = useCallback(async (groupData: any) => {
    try {
      await apiCreateGroup(groupData);
      toast.success('Grupo creado exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Error al crear grupo');
      throw error;
    }
  }, [loadData]);

  const updateGroup = useCallback(async (groupId: string, updates: any) => {
    try {
      await updateGroupDb(groupId, updates);
      toast.success('Grupo actualizado exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Error al actualizar grupo');
      throw error;
    }
  }, [loadData]);

  const deleteGroup = useCallback(async (groupId: string) => {
    try {
      await deleteGroupDb(groupId);
      toast.success('Grupo eliminado exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Error al eliminar grupo');
      throw error;
    }
  }, [loadData]);

  const addUserToGroup = useCallback(async (groupId: string, userId: string) => {
    try {
      await addUserToGroupDb(groupId, userId);
      toast.success('Usuario agregado al grupo exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error adding user to group:', error);
      toast.error('Error al agregar usuario al grupo');
      throw error;
    }
  }, [loadData]);

  const removeUserFromGroup = useCallback(async (groupId: string, userId: string) => {
    try {
      await removeUserFromGroupDb(groupId, userId);
      toast.success('Usuario removido del grupo exitosamente');
      await loadData();
    } catch (error) {
      console.error('Error removing user from group:', error);
      toast.error('Error al remover usuario del grupo');
      throw error;
    }
  }, [loadData]);

  return {
    // Data
    users,
    roles,
    groups,
    permissions,
    isLoading,
    error,
    
    // Actions
    createUser,
    updateUser,
    deleteUser,
    createRole: createRoleAction,
    updateRole: updateRoleAction,
    deleteRole: deleteRoleAction,
    createGroup: createGroupAction,
    updateGroup,
    deleteGroup,
    addUserToGroup,
    removeUserFromGroup,
    refreshData: loadData
  };
}
