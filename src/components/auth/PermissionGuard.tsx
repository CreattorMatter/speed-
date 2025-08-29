import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  mode?: 'all' | 'any';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Componente para proteger contenido basado en permisos
 * 
 * @param permission - Permiso único requerido
 * @param permissions - Lista de permisos requeridos
 * @param mode - 'all' para requerir todos los permisos, 'any' para requerir al menos uno
 * @param fallback - Componente a mostrar si no tiene permisos
 * @param children - Contenido a proteger
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  permissions,
  mode = 'all',
  fallback = null,
  children
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isLoading } = usePermissions();

  // Mostrar loading mientras carga
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-4 rounded"></div>;
  }

  // Verificar permiso único
  if (permission) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }

  // Verificar múltiples permisos
  if (permissions && permissions.length > 0) {
    const hasAccess = mode === 'all' 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // Si no se especifica ningún permiso, mostrar el contenido
  return <>{children}</>;
};

/**
 * Componente para mostrar contenido solo a administradores
 */
export const AdminOnly: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}> = ({ children, fallback = null }) => (
  <PermissionGuard 
    permissions={['admin:system', 'admin:users', 'admin:roles']} 
    mode="any"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

/**
 * Componente para mostrar contenido solo a usuarios con acceso al Builder
 */
export const BuilderOnly: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}> = ({ children, fallback = null }) => (
  <PermissionGuard 
    permission="builder:access"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

/**
 * Componente para mostrar diferentes versiones según permisos
 */
interface ConditionalRenderProps {
  admin?: React.ReactNode;
  builder?: React.ReactNode;
  viewer?: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  admin,
  builder,
  viewer,
  fallback = null
}) => {
  const { hasPermission } = usePermissions();

  if (hasPermission('admin:system') && admin) {
    return <>{admin}</>;
  }

  if (hasPermission('builder:access') && builder) {
    return <>{builder}</>;
  }

  if (hasPermission('poster:view') && viewer) {
    return <>{viewer}</>;
  }

  return <>{fallback}</>;
};

/**
 * HOC para proteger componentes con permisos
 */
export function withPermissions<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions: string | string[],
  mode: 'all' | 'any' = 'all'
) {
  return function PermissionProtectedComponent(props: P) {
    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    return (
      <PermissionGuard 
        permissions={permissions} 
        mode={mode}
        fallback={
          <div className="p-4 text-center text-gray-500">
            <p>No tienes permisos para acceder a esta funcionalidad</p>
          </div>
        }
      >
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}

/**
 * Hook para proteger rutas (uso con React Router)
 */
export const useRouteProtection = (requiredPermissions: string | string[], mode: 'all' | 'any' = 'all') => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isLoading } = usePermissions();

  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  const hasAccess = React.useMemo(() => {
    if (isLoading) return false;
    
    if (permissions.length === 1) {
      return hasPermission(permissions[0]);
    }
    
    return mode === 'all' 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }, [permissions, mode, hasPermission, hasAllPermissions, hasAnyPermission, isLoading]);

  return { hasAccess, isLoading };
};
