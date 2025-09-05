-- Fix admin@admin.com user setup (simple approach)
do $$
declare
  v_auth_id uuid;
  v_user_id uuid;
  v_role_id uuid;
begin
  -- Get auth user id
  select id into v_auth_id
  from auth.users
  where lower(email) = 'admin@admin.com'
  limit 1;

  if v_auth_id is null then
    raise notice 'No existe admin@admin.com en auth.users. Crealo primero desde la UI o con la API de Auth.';
    return;
  end if;

  -- Ensure user exists in public.users with correct mapping
  select id into v_user_id
  from public.users
  where lower(email) = 'admin@admin.com'
  limit 1;

  if v_user_id is null then
    -- Insert new user (status is boolean, not text)
    insert into public.users (email, name, role, status, auth_user_id)
    values ('admin@admin.com', 'Admin', 'admin', true, v_auth_id)
    returning id into v_user_id;
  else
    -- Update existing user (status is boolean, not text)
    update public.users
    set auth_user_id = v_auth_id,
        role = 'admin',
        status = true
    where id = v_user_id;
  end if;

  -- Ensure admin role exists
  insert into public.roles (name, description)
  values ('admin', 'Administrador del sistema')
  on conflict (name) do nothing;

  -- Get admin role id
  select id into v_role_id
  from public.roles
  where name = 'admin'
  limit 1;

  -- Link user to admin role
  if v_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (v_user_id, v_role_id)
    on conflict (user_id, role_id) do nothing;
  end if;

  raise notice 'Admin user fixed: user_id=%, auth_id=%', v_user_id, v_auth_id;
end$$;
