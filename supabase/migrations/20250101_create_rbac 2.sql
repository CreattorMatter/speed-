-- RBAC core tables: roles, groups, user_roles, group_users

-- Ensure required extension for gen_random_uuid
create extension if not exists pgcrypto;

-- Roles
create table if not exists public.roles (
    id uuid default gen_random_uuid() primary key,
    name text unique not null,
    description text,
    created_at timestamptz default timezone('utc', now()) not null
);

-- Groups
create table if not exists public.groups (
    id uuid default gen_random_uuid() primary key,
    name text unique not null,
    description text,
    created_at timestamptz default timezone('utc', now()) not null,
    created_by uuid references public.users(id)
);

-- User to Role many-to-many
create table if not exists public.user_roles (
    user_id uuid references public.users(id) on delete cascade,
    role_id uuid references public.roles(id) on delete cascade,
    created_at timestamptz default timezone('utc', now()) not null,
    primary key (user_id, role_id)
);

-- Group membership
create table if not exists public.group_users (
    group_id uuid references public.groups(id) on delete cascade,
    user_id uuid references public.users(id) on delete cascade,
    created_at timestamptz default timezone('utc', now()) not null,
    primary key (group_id, user_id)
);

-- Indexes
create index if not exists idx_roles_name on public.roles(name);
create index if not exists idx_groups_name on public.groups(name);
create index if not exists idx_user_roles_user on public.user_roles(user_id);
create index if not exists idx_group_users_group on public.group_users(group_id);

-- Enable RLS with permissive default policies (tighten in production)
alter table public.roles enable row level security;
alter table public.groups enable row level security;
alter table public.user_roles enable row level security;
alter table public.group_users enable row level security;

-- Simple permissive policies (replace with strict policies in prod)
create policy "read roles" on public.roles for select using (true);
create policy "manage roles" on public.roles for all using (true) with check (true);

create policy "read groups" on public.groups for select using (true);
create policy "manage groups" on public.groups for all using (true) with check (true);

create policy "read user_roles" on public.user_roles for select using (true);
create policy "manage user_roles" on public.user_roles for all using (true) with check (true);

create policy "read group_users" on public.group_users for select using (true);
create policy "manage group_users" on public.group_users for all using (true) with check (true);

comment on table public.roles is 'Application roles for RBAC';
comment on table public.groups is 'User groups for organizational scoping';
comment on table public.user_roles is 'User-to-role assignments';
comment on table public.group_users is 'User membership in groups';


