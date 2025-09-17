import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentProfile } from '@/services/authService';
import { usePermissions } from '@/contexts/PermissionsContext';

type AllowedRole = 'admin' | 'editor' | 'viewer' | 'sucursal' | string;

interface ProtectedRouteProps {
	children: React.ReactElement;
	allowedRoles?: AllowedRole[];
	requiredPermissions?: string[];
	// If true, redirects to root when not allowed; otherwise renders null
	redirectTo?: string;
}

function readStoredUser(): { role?: string } | null {
	try {
		const raw = localStorage.getItem('user');
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	allowedRoles,
	requiredPermissions,
	redirectTo = '/',
}) => {
  const [ready, setReady] = React.useState(false);
  const [role, setRole] = React.useState<string | null>(null);
  const { isLoading, hasAllPermissions } = usePermissions();

  React.useEffect(() => {
    let active = true;

    const hydrate = async () => {
      // 1) Try localStorage first
      const stored = readStoredUser();
      if (stored?.role) {
        if (!active) return;
        setRole(String(stored.role));
        setReady(true);
        return;
      }

      // 2) Fallback to Supabase session -> profile
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const profile = await getCurrentProfile();
          if (profile) {
            localStorage.setItem('user', JSON.stringify(profile));
            if (!active) return;
            setRole(String(profile.role || ''));
            setReady(true);
            return;
          }
        } catch {}
      }

      if (!active) return;
      setReady(true);
    };

    hydrate();
    return () => {
      active = false;
    };
  }, []);

  // If no restrictions provided, allow by default
  if (!allowedRoles || allowedRoles.length === 0) {
    // Si hay permisos requeridos, evaluarlos aún si no hay roles configurados
    if (requiredPermissions && requiredPermissions.length > 0) {
      if (isLoading) return <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Cargando…</div>; // evitar pantalla en blanco
      if (!hasAllPermissions(requiredPermissions)) return <Navigate to={redirectTo} replace />;
    }
    return children;
  }

  // While resolving auth state, render nothing (or a minimal placeholder)
  if (!ready) {
    return <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Cargando…</div>;
  }

  const userRole = (role || '').toLowerCase();
  const isRoleAllowed = allowedRoles.map(r => String(r).toLowerCase()).includes(userRole);
  if (!isRoleAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  // Gateo por permisos basado en contexto (síncrono)
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (isLoading) return <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Cargando…</div>;
    if (!hasAllPermissions(requiredPermissions)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
