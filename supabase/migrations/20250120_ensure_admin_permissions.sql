-- Ensure admin role has ALL permissions (for admin@admin.com)
do $$
declare
  v_admin_role_id uuid;
begin
  -- Get admin role id
  select id into v_admin_role_id from public.roles where name = 'admin' limit 1;
  
  if v_admin_role_id is null then
    raise notice 'Admin role not found, creating...';
    insert into public.roles (name, description) 
    values ('admin', 'Administrador del sistema') 
    returning id into v_admin_role_id;
  end if;

  -- Assign ALL existing permissions to admin role
  insert into public.role_permissions (role_id, permission_id)
  select v_admin_role_id, p.id
  from public.permissions p
  where not exists (
    select 1 from public.role_permissions rp 
    where rp.role_id = v_admin_role_id and rp.permission_id = p.id
  );

  raise notice 'Admin role (%) now has all permissions', v_admin_role_id;
end$$;
