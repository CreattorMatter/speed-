-- Debug admin@admin.com permissions
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar usuario en public.users
select 'User in public.users:' as step, * from public.users where email = 'admin@admin.com';

-- 2. Verificar auth_user_id mapping
select 'Auth mapping:' as step, 
       u.id as user_id, 
       u.email, 
       u.auth_user_id,
       au.email as auth_email
from public.users u
left join auth.users au on u.auth_user_id = au.id
where u.email = 'admin@admin.com';

-- 3. Verificar roles asignados
select 'User roles:' as step,
       u.email,
       r.name as role_name,
       r.description
from public.users u
join public.user_roles ur on u.id = ur.user_id
join public.roles r on ur.role_id = r.id
where u.email = 'admin@admin.com';

-- 4. Verificar permisos del rol admin
select 'Admin role permissions:' as step,
       r.name as role_name,
       p.name as permission_name,
       p.category,
       p.description
from public.roles r
join public.role_permissions rp on r.id = rp.role_id
join public.permissions p on rp.permission_id = p.id
where r.name = 'admin';

-- 5. Probar función get_user_permissions
select 'get_user_permissions result:' as step, *
from public.get_user_permissions(
  (select id from public.users where email = 'admin@admin.com')
);

-- 6. Probar función is_admin() (necesita auth context)
-- Esta no va a funcionar desde SQL editor porque no hay auth.uid()
-- select 'is_admin result:' as step, public.is_admin();
