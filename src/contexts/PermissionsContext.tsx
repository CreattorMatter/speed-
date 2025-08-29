import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  getCurrentUserPermissions, 
  type UserPermissions 
} from '../services/rbacService';

interface PermissionsContextType {
  permissions: UserPermissions;
  isLoading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  refresh: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

let permissionsCache: UserPermissions | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<UserPermissions>({
    permissions: [],
    groups: [],
    hasPermission: () => false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar permisos con caché
  const loadPermissions = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Si tenemos caché válido y no forzamos refresh, usar caché
    if (permissionsCache && (now - lastFetchTime) < CACHE_DURATION && !forceRefresh) {
      console.log('🔄 Usando caché de permisos');
      setPermissions(permissionsCache);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🌐 Cargando permisos desde API...');
      setIsLoading(true);
      setError(null);
      
      const userPermissions = await getCurrentUserPermissions();
      
      // Actualizar caché
      permissionsCache = userPermissions;
      lastFetchTime = now;
      
      setPermissions(userPermissions);
      console.log('✅ Permisos cargados:', userPermissions);
    } catch (err) {
      console.error('❌ Error loading permissions:', err);
      setError(err instanceof Error ? err.message : 'Error loading permissions');
      setPermissions({
        permissions: [],
        groups: [],
        hasPermission: () => false
      });
      
      // Limpiar caché en caso de error
      permissionsCache = null;
      lastFetchTime = 0;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar permisos al montar
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Funciones de verificación memoizadas
  const hasPermission = useCallback((permission: string): boolean => {
    return permissions.hasPermission(permission);
  }, [permissions]);

  const hasAllPerms = useCallback((permissionList: string[]): boolean => {
    return permissionList.every(perm => permissions.hasPermission(perm));
  }, [permissions]);

  const hasAnyPerm = useCallback((permissionList: string[]): boolean => {
    return permissionList.some(perm => permissions.hasPermission(perm));
  }, [permissions]);

  // Función para refrescar permisos
  const refresh = useCallback(async () => {
    await loadPermissions(true); // Forzar refresh
  }, [loadPermissions]);

  const value = {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasAllPermissions: hasAllPerms,
    hasAnyPermission: hasAnyPerm,
    refresh
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

// Hook para usar el contexto
export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

// Hooks adicionales que usan el contexto principal
export const useHasPermission = (permission: string): boolean => {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
};

export const useHasPermissions = (permissions: string[], mode: 'all' | 'any' = 'all'): boolean => {
  const { hasAllPermissions, hasAnyPermission } = usePermissions();
  
  if (mode === 'all') {
    return hasAllPermissions(permissions);
  } else {
    return hasAnyPermission(permissions);
  }
};

export const useUserGroups = () => {
  const { permissions, isLoading } = usePermissions();
  
  return {
    groups: permissions.groups,
    isLoading,
    hasGroup: useCallback((groupId: string) => {
      return permissions.groups.some(group => group.id === groupId);
    }, [permissions.groups])
  };
};

export const useCanViewAllGroups = (): boolean => {
  const { hasPermission } = usePermissions();
  return hasPermission('group:view_all') || hasPermission('admin:system');
};

export const usePermissionsByCategory = () => {
  const { permissions } = usePermissions();
  
  return React.useMemo(() => {
    return permissions.permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, typeof permissions.permissions>);
  }, [permissions.permissions]);
};
