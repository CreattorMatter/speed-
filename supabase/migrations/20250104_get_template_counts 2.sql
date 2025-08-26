-- ===============================================
-- RPC: get_template_counts (conteo de plantillas por familia)
-- Nota: templates.family_id es varchar/text, por eso usamos text[]
-- ===============================================

create or replace function public.get_template_counts(family_ids text[])
returns table(family_id text, total int)
language sql
stable
as $$
  select t.family_id::text, count(*)::int as total
  from public.templates t
  where t.is_active = true
    and t.family_id = any(family_ids)
  group by t.family_id
$$;

grant execute on function public.get_template_counts(text[]) to anon, authenticated;


