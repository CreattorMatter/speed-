-- Fix RLS helper functions to avoid recursion causing stack depth overflow
-- Redefine functions as SECURITY DEFINER so they run as owner and bypass RLS
-- and set a safe search_path.

create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  result boolean;
begin
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    join public.users u on u.id = ur.user_id
    where u.auth_user_id = auth.uid()
      and lower(r.name) = 'admin'
  ) into result;
  return result;
end;
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to public;

create or replace function public.has_role(role_name text)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  result boolean;
begin
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    join public.users u on u.id = ur.user_id
    where u.auth_user_id = auth.uid()
      and lower(r.name) = lower(role_name)
  ) into result;
  return result;
end;
$$;

revoke all on function public.has_role(text) from public;
grant execute on function public.has_role(text) to public;


