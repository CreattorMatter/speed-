-- Insertar usuarios iniciales para el sistema SPID
-- IMPORTANTE: En producción las contraseñas deben ser hasheadas

-- Usuario administrador principal
INSERT INTO public.users (email, password, name, role, status) 
VALUES (
    'admin@admin.com',
    'admin', -- En producción esto debe ser un hash
    'Administrador Principal',
    'admin',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Usuario EasyPilar específico
INSERT INTO public.users (email, password, name, role, status) 
VALUES (
    'easypilar@cenco.com',
    'admin', -- En producción esto debe ser un hash
    'Easy Pilar',
    'admin',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Usuario de prueba limitado
INSERT INTO public.users (email, password, name, role, status) 
VALUES (
    'user@test.com',
    'user123', -- En producción esto debe ser un hash
    'Usuario de Prueba',
    'limited',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Usuario demo
INSERT INTO public.users (email, password, name, role, status) 
VALUES (
    'demo@spid.com',
    'demo123', -- En producción esto debe ser un hash
    'Usuario Demo',
    'limited',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Mensaje de confirmación
SELECT 'Usuarios iniciales creados correctamente' AS status; 