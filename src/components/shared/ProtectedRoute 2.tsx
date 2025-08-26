import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasAllPermissions } from '@/services/rbacService';

type AllowedRole = 'admin' | 'editor' | 'viewer' | 'sucursal' | string;

interface ProtectedRouteProps {
	children: React.ReactElement;
	allowedRoles?: AllowedRole[];
	requiredPermissions?: string[];
	// If true, redirects to root when not allowed; otherwise renders null
	redirectTo?: string;
}

function getCurrentUser(): { role?: string } | null {
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
	const user = getCurrentUser();

	// If no restrictions provided, allow by default
	if (!allowedRoles || allowedRoles.length === 0) {
		return children;
	}

	const userRole = (user?.role || '').toLowerCase();
	const isRoleAllowed = allowedRoles.map(r => String(r).toLowerCase()).includes(userRole);
	if (!isRoleAllowed) {
		return <Navigate to={redirectTo} replace />;
	}

	// Permission gate (sync wrapper around async check)
	if (requiredPermissions && requiredPermissions.length > 0) {
		// We can't block render async inside; render a thin guard
		// Consumers should wrap with a loader if needed
		// For now, we optimistically render and rely on server-side RLS as final guard
		// Optionally, could implement a Suspense-like guard
		hasAllPermissions(requiredPermissions).then((ok) => {
			if (!ok) {
				window.location.replace(redirectTo);
			}
		});
	}

	return children;
};

export default ProtectedRoute;


