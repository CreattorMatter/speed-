import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { 
  getCurrentUserPermissions 
} from '../services/rbacService';
import type { UserPermissions } from '@/types/index';
import { supabase } from '@/lib/supabaseClient';
import { getCache, setCache, makeUserFingerprint } from '@/lib/cache';

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
const PERMISSIONS_CACHE_KEY = 'spid:permissions';
const PERMISSIONS_TTL_MS = 30 * 60 * 1000; // 30 minutos

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<UserPermissions>({
    permissions: [],
    groups: [],
    hasPermission: () => false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  const pendingForceRefreshRef = useRef(false);

  const withTimeout = useCallback(async <T,>(p: Promise<T>, ms: number, label = 'perm') => {
    let timer: number | undefined;
    try {
      const timeout = new Promise<T>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error(`timeout:${label}:${ms}`)), ms);
      });
      // @ts-ignore TS can't infer race generics nicely here
      return await Promise.race([p, timeout]);
    } finally {
      if (timer) window.clearTimeout(timer);
    }
  }, []);

  const fallbackPermissions = useCallback((): UserPermissions => {
    // Si en localStorage el rol es admin, conceder permisos de superusuario inmediatamente
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (String(parsed?.role || '').toLowerCase() === 'admin') {
            return { permissions: [], groups: [], hasPermission: () => true } as UserPermissions;
          }
        }
      }
    } catch {}
    // Fallback estándar: sin permisos
    return { permissions: [], groups: [], hasPermission: () => false } as UserPermissions;
  }, []);

  // Función para cargar permisos con caché
  const loadPermissions = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // -1) Fast path: si user en localStorage es admin, conceder superuser al instante
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (String(parsed?.role || '').toLowerCase() === 'admin') {
          const superPerms: UserPermissions = { permissions: [], groups: [], hasPermission: () => true } as UserPermissions;
          setPermissions(superPerms);
          setIsLoading(false);
          // No retornar si forceRefresh: permitir que continúe para refrescar en background
          if (!forceRefresh) return;
        }
      }
    } catch {}

    // 0) Siempre intentar cache local primero si no es forceRefresh
    if (!forceRefresh) {
      try {
        let fp = 'anon';
        try {
          const rawUser = localStorage.getItem('user');
          if (rawUser) fp = makeUserFingerprint(JSON.parse(rawUser));
        } catch {}
        const { value: cachedPerms } = getCache<UserPermissions>(PERMISSIONS_CACHE_KEY, fp);
        if (cachedPerms) {
          console.log('🔄 Permisos desde cache TTL');
          setPermissions(cachedPerms);
          setIsLoading(false);
          return;
        }
      } catch {}
    }

    // Si tenemos caché válido y no forzamos refresh, usar caché
    if (permissionsCache && (now - lastFetchTime) < CACHE_DURATION && !forceRefresh) {
      console.log('🔄 Usando caché de permisos');
      setPermissions(permissionsCache);
      setIsLoading(false);
      return;
    }

    // Evitar solicitudes concurrentes
    if (isFetchingRef.current) {
      if (forceRefresh) {
        // Marcar para reintentar una vez termine la petición actual
        pendingForceRefreshRef.current = true;
      }
      return;
    }
    isFetchingRef.current = true;

    try {
      console.log('🌐 Cargando permisos desde API...');
      setIsLoading(true);
      setError(null);
      
      const userPermissions = await withTimeout(
        getCurrentUserPermissions(),
        5000,
        'getCurrentUserPermissions'
      ).catch((err) => {
        console.warn('⏱️ Timeout/err al cargar permisos, usando vacíos:', err?.message || err);
        return fallbackPermissions();
      });
      
      // Actualizar caché
      permissionsCache = userPermissions;
      lastFetchTime = now;

      // Guardar en cache TTL por usuario
      try {
        let fp = 'anon';
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) fp = makeUserFingerprint({ id: session.user.id, email: session.user.email });
        setCache(PERMISSIONS_CACHE_KEY, userPermissions, PERMISSIONS_TTL_MS, fp);
      } catch {}
      
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
      const shouldRefetch = pendingForceRefreshRef.current;
      pendingForceRefreshRef.current = false;
      isFetchingRef.current = false;
      if (shouldRefetch) {
        // Reintentar inmediatamente con forceRefresh
        setTimeout(() => loadPermissions(true), 0);
      }
      setIsLoading(false);
    }
  }, [withTimeout, fallbackPermissions]);

  // Cargar permisos al montar: SIEMPRE desde localStorage primero
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // PASO 0: Fast path admin desde localStorage
      try {
        const rawUser = localStorage.getItem('user');
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          if (String(parsed?.role || '').toLowerCase() === 'admin') {
            const superPerms: UserPermissions = { permissions: [], groups: [], hasPermission: () => true } as UserPermissions;
            setPermissions(superPerms);
            setIsLoading(false);
            console.log('⚡ Admin superuser desde localStorage');
            return;
          }
        }
      } catch {}
      
      // PASO 1: Intentar cache TTL
      try {
        let fp = 'anon';
        const rawUser = localStorage.getItem('user');
        if (rawUser) fp = makeUserFingerprint(JSON.parse(rawUser));
        const { value: cachedPerms } = getCache<UserPermissions>(PERMISSIONS_CACHE_KEY, fp);
        if (cachedPerms) {
          setPermissions(cachedPerms);
          setIsLoading(false);
          console.log('🔄 Permisos desde cache TTL');
          return;
        }
      } catch {}
      
      // PASO 2: Si hay usuario en localStorage pero no cache, dar permisos básicos
      try {
        const rawUser = localStorage.getItem('user');
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          // Dar permisos básicos para que no se quede en blanco
          const basicPerms: UserPermissions = { 
            permissions: [{ name: 'dashboard:view', category: 'dashboard', description: 'Ver dashboard' }], 
            groups: [], 
            hasPermission: (perm: string) => ['dashboard:view', 'poster:view'].includes(perm)
          };
          setPermissions(basicPerms);
          setIsLoading(false);
          console.log('📋 Permisos básicos para usuario guardado');
          return;
        }
      } catch {}
      
      // PASO 3: Fallback final
      setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Suscribirse a cambios de autenticación para refrescar permisos
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        // Si tenemos sesión, invalidar caché y recargar permisos
        if (session) {
          permissionsCache = null;
          lastFetchTime = 0;
          loadPermissions(true);
        }
      }
      if (event === 'SIGNED_OUT') {
        // Limpiar permisos al cerrar sesión
        permissionsCache = null;
        lastFetchTime = 0;
        setPermissions({ permissions: [], groups: [], hasPermission: () => false });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [loadPermissions]);

  // Escuchar invalidaciones externas (p. ej., cuando se crea el vínculo user_roles)
  useEffect(() => {
    const handler = () => {
      permissionsCache = null;
      lastFetchTime = 0;
      loadPermissions(true);
    };
    window.addEventListener('permissions:invalidate', handler);
    return () => window.removeEventListener('permissions:invalidate', handler);
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
      return permissions.groups.some((group: { id: string; name: string }) => group.id === groupId);
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
    return permissions.permissions.reduce((acc: Record<string, { name: string; category: string; description: string }[]>, perm: { name: string; category: string; description: string }) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, { name: string; category: string; description: string }[]>);
  }, [permissions.permissions]);
};
