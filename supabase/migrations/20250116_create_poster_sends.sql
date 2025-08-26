-- MIGRATION: Create poster sends and receives system
-- Tables for tracking poster sends from central to branches

-- Table for poster send operations
create table if not exists public.poster_sends (
  id uuid default gen_random_uuid() primary key,
  template_name text not null,
  template_id text,
  products_count integer not null default 0,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'sent' check (status in ('sent', 'failed', 'pending'))
);

-- Table for individual sends to groups/branches
create table if not exists public.poster_send_items (
  id uuid default gen_random_uuid() primary key,
  send_id uuid references public.poster_sends(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  group_name text not null,
  pdf_url text not null,
  pdf_filename text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  downloaded_at timestamp with time zone,
  status text default 'sent' check (status in ('sent', 'downloaded', 'failed'))
);

-- Indexes for performance
create index if not exists idx_poster_sends_created_by on public.poster_sends(created_by);
create index if not exists idx_poster_sends_created_at on public.poster_sends(created_at desc);
create index if not exists idx_poster_send_items_send_id on public.poster_send_items(send_id);
create index if not exists idx_poster_send_items_group_id on public.poster_send_items(group_id);
create index if not exists idx_poster_send_items_created_at on public.poster_send_items(created_at desc);

-- RLS Policies
alter table public.poster_sends enable row level security;
alter table public.poster_send_items enable row level security;

-- Poster sends: admins can see all, users can see their own
drop policy if exists "poster_sends_select" on public.poster_sends;
create policy "poster_sends_select" on public.poster_sends 
  for select using (
    public.is_admin() or 
    created_by = auth.uid()
  );

drop policy if exists "poster_sends_insert" on public.poster_sends;
create policy "poster_sends_insert" on public.poster_sends 
  for insert with check (
    public.is_admin() or 
    created_by = auth.uid()
  );

-- Poster send items: admins can see all, group members can see items for their groups
drop policy if exists "poster_send_items_select" on public.poster_send_items;
create policy "poster_send_items_select" on public.poster_send_items 
  for select using (
    public.is_admin() or 
    exists (
      select 1 from public.group_users gu 
      where gu.group_id = poster_send_items.group_id 
      and gu.user_id = auth.uid()
    )
  );

drop policy if exists "poster_send_items_insert" on public.poster_send_items;
create policy "poster_send_items_insert" on public.poster_send_items 
  for insert with check (public.is_admin());

drop policy if exists "poster_send_items_update" on public.poster_send_items;
create policy "poster_send_items_update" on public.poster_send_items 
  for update using (
    public.is_admin() or 
    exists (
      select 1 from public.group_users gu 
      where gu.group_id = poster_send_items.group_id 
      and gu.user_id = auth.uid()
    )
  );

-- Comments
comment on table public.poster_sends is 'Tracks poster send operations from central to branches';
comment on table public.poster_send_items is 'Individual poster files sent to specific groups/branches';

-- Storage bucket for poster PDFs (if not exists)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'posters',
  'posters', 
  false,
  52428800, -- 50MB limit
  array['application/pdf']
)
on conflict (id) do nothing;

-- Storage policies for posters bucket
drop policy if exists "posters_select" on storage.objects;
create policy "posters_select" on storage.objects 
  for select using (
    bucket_id = 'posters' and (
      public.is_admin() or 
      exists (
        select 1 from public.poster_send_items psi
        where psi.pdf_url = 'posters/' || name
        and exists (
          select 1 from public.group_users gu 
          where gu.group_id = psi.group_id 
          and gu.user_id = auth.uid()
        )
      )
    )
  );

drop policy if exists "posters_insert" on storage.objects;
create policy "posters_insert" on storage.objects 
  for insert with check (
    bucket_id = 'posters' and public.is_admin()
  );

drop policy if exists "posters_delete" on storage.objects;
create policy "posters_delete" on storage.objects 
  for delete using (
    bucket_id = 'posters' and public.is_admin()
  );
