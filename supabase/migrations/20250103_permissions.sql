-- RBAC: permissions and role_permissions
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (role_id, permission_id)
);

-- RLS
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists "read permissions" on public.permissions;
drop policy if exists "manage permissions" on public.permissions;
create policy "read permissions" on public.permissions for select using (true);
create policy "manage permissions" on public.permissions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read role_permissions" on public.role_permissions;
drop policy if exists "manage role_permissions" on public.role_permissions;
create policy "read role_permissions" on public.role_permissions for select using (true);
create policy "manage role_permissions" on public.role_permissions for all using (public.is_admin()) with check (public.is_admin());

-- Helper function
create or replace function public.has_permission(perm_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    join public.users u on u.id = ur.user_id
    where u.auth_user_id = auth.uid()
      and lower(p.name) = lower(perm_name)
  );
$$;

revoke all on function public.has_permission(text) from public;
grant execute on function public.has_permission(text) to public;


