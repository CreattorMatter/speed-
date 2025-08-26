-- Strict RLS and Auth integration
create extension if not exists pgcrypto;

-- Ensure users table has auth_user_id mapping to auth.users
alter table public.users
  add column if not exists auth_user_id uuid unique;

comment on column public.users.auth_user_id is 'References auth.users(id) to map auth user to app profile';

-- Helper functions
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    join public.users u on u.id = ur.user_id
    where u.auth_user_id = auth.uid()
      and lower(r.name) = 'admin'
  );
$$;

create or replace function public.has_role(role_name text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    join public.users u on u.id = ur.user_id
    where u.auth_user_id = auth.uid()
      and lower(r.name) = lower(role_name)
  );
$$;

-- Tighten policies
alter table public.users enable row level security;

drop policy if exists "Users can read own data" on public.users;
drop policy if exists "Admins can insert users" on public.users;
drop policy if exists "Users can update own data" on public.users;

-- Users: select own or admin
create policy "read own or admin" on public.users
  for select using (
    auth.uid() is not null and (auth.uid() = auth_user_id or public.is_admin())
  );

-- Users: insert only admin
create policy "insert users admin" on public.users
  for insert with check ( public.is_admin() );

-- Users: update own or admin
create policy "update own or admin" on public.users
  for update using (
    public.is_admin() or auth.uid() = auth_user_id
  ) with check (
    public.is_admin() or auth.uid() = auth_user_id
  );

-- Users: delete only admin
create policy "delete users admin" on public.users
  for delete using ( public.is_admin() );

-- Roles RLS (ensure table enabled)
alter table public.roles enable row level security;
drop policy if exists "read roles" on public.roles;
drop policy if exists "manage roles" on public.roles;
create policy "read roles" on public.roles for select using (true);
create policy "manage roles" on public.roles for all using (public.is_admin()) with check (public.is_admin());

-- Groups RLS
alter table public.groups enable row level security;
drop policy if exists "read groups" on public.groups;
drop policy if exists "manage groups" on public.groups;
create policy "read groups" on public.groups for select using (true);
create policy "manage groups" on public.groups for all using (public.is_admin()) with check (public.is_admin());

-- User roles RLS
alter table public.user_roles enable row level security;
drop policy if exists "read user_roles" on public.user_roles;
drop policy if exists "manage user_roles" on public.user_roles;
create policy "read user_roles" on public.user_roles
  for select using (
    public.is_admin() or exists (
      select 1 from public.users u where u.id = user_roles.user_id and u.auth_user_id = auth.uid()
    )
  );
create policy "manage user_roles" on public.user_roles for all using (public.is_admin()) with check (public.is_admin());

-- Group users RLS
alter table public.group_users enable row level security;
drop policy if exists "read group_users" on public.group_users;
drop policy if exists "manage group_users" on public.group_users;
create policy "read group_users" on public.group_users
  for select using (
    public.is_admin() or exists (
      select 1 from public.users u where u.id = group_users.user_id and u.auth_user_id = auth.uid()
    )
  );
create policy "manage group_users" on public.group_users for all using (public.is_admin()) with check (public.is_admin());

-- Seed base roles (id auto)
insert into public.roles (name, description) values
  ('admin','Acceso total a todas las funciones.'),
  ('editor','Puede crear y editar plantillas y carteles.'),
  ('viewer','Solo puede ver carteles y plantillas.'),
  ('sucursal','Permisos limitados para impresión.')
on conflict (name) do nothing;


