-- Indexes to speed up RBAC joins and membership lookups
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_role_id on public.user_roles(role_id);
create index if not exists idx_group_users_user_id on public.group_users(user_id);
create index if not exists idx_group_users_group_id on public.group_users(group_id);

