-- ================================================
-- COMPLETE RBAC SYSTEM MIGRATION
-- ================================================
-- Migrates from enabledCards system to full permission-based RBAC

-- Ensure required extension for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================================
-- 1. PERMISSIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ================================================
-- 2. ROLE_PERMISSIONS TABLE (Many-to-Many)
-- ================================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- ================================================
-- 3. INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON public.permissions(name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);

-- ================================================
-- 4. ROW LEVEL SECURITY
-- ================================================
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Permissions policies
DROP POLICY IF EXISTS "read permissions" ON public.permissions;
DROP POLICY IF EXISTS "manage permissions" ON public.permissions;
CREATE POLICY "read permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "manage permissions" ON public.permissions FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Role permissions policies
DROP POLICY IF EXISTS "read role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "manage role_permissions" ON public.role_permissions;
CREATE POLICY "read role_permissions" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "manage role_permissions" ON public.role_permissions FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ================================================
-- 5. INSERT BASE PERMISSIONS
-- ================================================
INSERT INTO public.permissions (name, category, description) VALUES
-- Builder Permissions
('builder:access', 'builder', 'Acceso completo al Builder'),
('builder:family:create', 'builder', 'Crear nuevas familias de plantillas'),
('builder:family:edit', 'builder', 'Editar familias existentes'),
('builder:family:delete', 'builder', 'Eliminar familias'),
('builder:template:create', 'builder', 'Crear nuevas plantillas'),
('builder:template:edit', 'builder', 'Editar plantillas existentes'),
('builder:template:delete', 'builder', 'Eliminar plantillas'),
('builder:template:duplicate', 'builder', 'Duplicar plantillas'),

-- Poster Editor Permissions
('poster:view', 'poster', 'Ver carteleras y plantillas'),
('poster:edit', 'poster', 'Editar productos en carteleras'),
('poster:print_direct', 'poster', 'Imprimir directamente sin auditoría'),
('poster:print_audit', 'poster', 'Imprimir con auditoría obligatoria'),
('poster:send', 'poster', 'Enviar carteles a sucursales'),

-- Dashboard Permissions
('dashboard:recibidos', 'dashboard', 'Ver dashboard de elementos recibidos'),
('dashboard:enviados', 'dashboard', 'Ver dashboard de elementos enviados'),
('dashboard:analytics', 'dashboard', 'Ver dashboard de analíticas'),
('dashboard:admin', 'dashboard', 'Ver dashboard de administración'),

-- Group Permissions
('group:view_own', 'group', 'Ver solo contenido de su propio grupo'),
('group:view_all', 'group', 'Ver contenido de todos los grupos'),

-- Admin Permissions
('admin:users', 'admin', 'Gestión completa de usuarios'),
('admin:roles', 'admin', 'Gestión completa de roles y permisos'),
('admin:groups', 'admin', 'Gestión completa de grupos'),
('admin:system', 'admin', 'Configuración del sistema')
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- 6. UPDATE/CREATE BASE ROLES
-- ================================================
-- Clear existing roles and recreate
DELETE FROM public.user_roles;
DELETE FROM public.role_permissions;
DELETE FROM public.roles;

INSERT INTO public.roles (name, description) VALUES
('builder_admin', 'Administrador completo del Builder - puede crear, editar y eliminar familias y plantillas'),
('viewer', 'Visualizador básico - puede ver y editar carteles, imprimir sin auditoría'),
('viewer_audit', 'Visualizador con auditoría - puede ver y editar carteles, debe reportar antes de imprimir'),
('admin', 'Administrador del sistema - acceso completo a todas las funcionalidades');

-- ================================================
-- 7. ASSIGN PERMISSIONS TO ROLES
-- ================================================

-- Builder Admin Role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.name = 'builder_admin' AND p.name IN (
    'builder:access',
    'builder:family:create',
    'builder:family:edit', 
    'builder:family:delete',
    'builder:template:create',
    'builder:template:edit',
    'builder:template:delete',
    'builder:template:duplicate',
    'dashboard:recibidos',
    'group:view_own'
);

-- Viewer Role (Print without audit)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.name = 'viewer' AND p.name IN (
    'poster:view',
    'poster:edit',
    'poster:print_direct',
    'poster:send',
    'dashboard:recibidos',
    'group:view_own'
);

-- Viewer Audit Role (Print with audit)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.name = 'viewer_audit' AND p.name IN (
    'poster:view',
    'poster:edit',
    'poster:print_audit',
    'poster:send',
    'dashboard:recibidos',
    'group:view_own'
);

-- Admin Role (Everything)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p 
WHERE r.name = 'admin';

-- ================================================
-- 8. UTILITY FUNCTIONS
-- ================================================

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = user_uuid AND p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS TABLE(permission_name TEXT, category TEXT, description TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.name, p.category, p.description
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user groups
CREATE OR REPLACE FUNCTION public.get_user_groups(user_uuid UUID)
RETURNS TABLE(group_id UUID, group_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT g.id, g.name
    FROM public.group_users gu
    JOIN public.groups g ON gu.group_id = g.id
    WHERE gu.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 9. MIGRATION HELPER COMMENTS
-- ================================================

-- NOTE: To migrate existing enabledCards to roles:
-- 1. Users with enabledCards ['cartel', 'recibidos'] -> 'viewer' role
-- 2. Users with enabledCards ['cartel', 'builder', 'enviados'] -> 'builder_admin' role
-- 3. Users with admin access -> 'admin' role

-- Migration script (to be run manually after deployment):
/*
-- Example migration from groups.enabledCards to user roles
-- This would need to be customized based on existing data

WITH group_migrations AS (
  SELECT 
    gu.user_id,
    CASE 
      WHEN g.name LIKE '%Editorial%' OR 'builder' = ANY(string_to_array(g.enabled_cards, ',')) 
        THEN 'builder_admin'
      WHEN 'cartel' = ANY(string_to_array(g.enabled_cards, ',')) 
        THEN 'viewer'
      ELSE 'viewer_audit'
    END as suggested_role
  FROM group_users gu
  JOIN groups g ON gu.group_id = g.id
)
INSERT INTO user_roles (user_id, role_id)
SELECT 
  gm.user_id, 
  r.id
FROM group_migrations gm
JOIN roles r ON r.name = gm.suggested_role
ON CONFLICT (user_id, role_id) DO NOTHING;
*/
