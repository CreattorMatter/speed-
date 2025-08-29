-- ================================================
-- RBAC SYSTEM UPDATE - Compatible with existing schema
-- ================================================
-- Actualiza el sistema existente para agregar funcionalidad RBAC completa

-- ================================================
-- 1. AGREGAR COLUMNA CATEGORY A PERMISSIONS
-- ================================================
ALTER TABLE public.permissions 
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'custom';

-- ================================================
-- 2. CREAR ÍNDICES PARA RENDIMIENTO
-- ================================================
CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON public.permissions(name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);

-- ================================================
-- 3. VERIFICAR ROW LEVEL SECURITY
-- ================================================
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Función helper para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar si el usuario actual tiene rol de admin
    RETURN EXISTS (
        SELECT 1 
        FROM public.users u
        JOIN public.user_roles ur ON u.id = ur.user_id
        JOIN public.roles r ON ur.role_id = r.id
        WHERE u.auth_user_id = auth.uid() 
        AND r.name = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para permissions
DROP POLICY IF EXISTS "read permissions" ON public.permissions;
DROP POLICY IF EXISTS "manage permissions" ON public.permissions;
CREATE POLICY "read permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "manage permissions" ON public.permissions FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Políticas para role_permissions
DROP POLICY IF EXISTS "read role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "manage role_permissions" ON public.role_permissions;
CREATE POLICY "read role_permissions" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "manage role_permissions" ON public.role_permissions FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ================================================
-- 4. INSERTAR PERMISOS BASE (SI NO EXISTEN)
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
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description;

-- ================================================
-- 5. CREAR/ACTUALIZAR ROLES BASE
-- ================================================
INSERT INTO public.roles (name, description) VALUES
('builder_admin', 'Administrador completo del Builder - puede crear, editar y eliminar familias y plantillas'),
('viewer', 'Visualizador básico - puede ver y editar carteles, imprimir sin auditoría'),
('viewer_audit', 'Visualizador con auditoría - puede ver y editar carteles, debe reportar antes de imprimir'),
('admin', 'Administrador del sistema - acceso completo a todas las funcionalidades')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description;

-- ================================================
-- 6. ASIGNAR PERMISOS A ROLES
-- ================================================

-- Limpiar asignaciones existentes
DELETE FROM public.role_permissions;

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
-- 7. FUNCIONES UTILITARIAS
-- ================================================

-- Función para verificar si un usuario tiene un permiso específico
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

-- Función para obtener permisos de un usuario
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

-- Función para obtener grupos de un usuario
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
-- 8. AGREGAR COLUMNA target_groups A poster_sends
-- ================================================
ALTER TABLE public.poster_sends 
ADD COLUMN IF NOT EXISTS target_groups UUID[] DEFAULT '{}';

-- Índice para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_poster_sends_target_groups ON public.poster_sends USING GIN(target_groups);

-- ================================================
-- 9. MIGRACIÓN AUTOMÁTICA DE ROLES EXISTENTES
-- ================================================

-- Migrar usuarios basado en su rol actual en la columna 'role'
DO $$
DECLARE
    user_record RECORD;
    role_id_var UUID;
BEGIN
    FOR user_record IN 
        SELECT id, role FROM public.users WHERE role IS NOT NULL
    LOOP
        -- Determinar el rol RBAC basado en el rol actual
        CASE user_record.role
            WHEN 'admin' THEN
                SELECT id INTO role_id_var FROM public.roles WHERE name = 'admin';
            WHEN 'editor' THEN
                SELECT id INTO role_id_var FROM public.roles WHERE name = 'builder_admin';
            WHEN 'limited' THEN
                SELECT id INTO role_id_var FROM public.roles WHERE name = 'viewer';
            WHEN 'sucursal' THEN
                SELECT id INTO role_id_var FROM public.roles WHERE name = 'viewer_audit';
            ELSE
                SELECT id INTO role_id_var FROM public.roles WHERE name = 'viewer_audit';
        END CASE;
        
        -- Insertar en user_roles si no existe
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (user_record.id, role_id_var)
        ON CONFLICT (user_id, role_id) DO NOTHING;
        
        RAISE NOTICE 'Usuario % migrado de % a rol RBAC %', user_record.id, user_record.role, role_id_var;
    END LOOP;
END $$;

-- ================================================
-- 10. MENSAJE DE ÉXITO
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '✅ MIGRACIÓN RBAC COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '📊 Resumen:';
    RAISE NOTICE '   - Permisos creados: %', (SELECT COUNT(*) FROM public.permissions);
    RAISE NOTICE '   - Roles creados: %', (SELECT COUNT(*) FROM public.roles);
    RAISE NOTICE '   - Asignaciones de permisos: %', (SELECT COUNT(*) FROM public.role_permissions);
    RAISE NOTICE '   - Usuarios con roles: %', (SELECT COUNT(*) FROM public.user_roles);
    RAISE NOTICE '🎯 Próximo paso: Ejecutar script de migración en consola del navegador';
END $$;
