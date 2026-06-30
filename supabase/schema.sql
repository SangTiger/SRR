-- Pointail Reference Cards Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Reference cards table
create table public.reference_cards (
  id uuid default uuid_generate_v4() primary key,
  brand_name text,
  category text not null,
  summary text not null,
  description text not null,
  metrics jsonb default '{}',
  image_urls text[] default '{}',
  is_public boolean default true not null,
  is_anonymous boolean default false not null,
  notion_page_id text unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_reference_cards_updated
  before update on public.reference_cards
  for each row execute function public.handle_updated_at();

-- Row Level Security
alter table public.reference_cards enable row level security;

-- Public: anyone can read public cards
create policy "Public cards are viewable by everyone"
  on public.reference_cards
  for select
  using (is_public = true);

-- Authenticated: team members can read all cards
create policy "Authenticated users can read all cards"
  on public.reference_cards
  for select
  to authenticated
  using (true);

-- Authenticated: team members can insert
create policy "Authenticated users can insert cards"
  on public.reference_cards
  for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Authenticated: team members can update
create policy "Authenticated users can update cards"
  on public.reference_cards
  for update
  to authenticated
  using (true);

-- Authenticated: team members can delete
create policy "Authenticated users can delete cards"
  on public.reference_cards
  for delete
  to authenticated
  using (true);

-- Storage bucket for reference images
insert into storage.buckets (id, name, public)
values ('reference-images', 'reference-images', true)
on conflict (id) do nothing;

-- Storage policy: anyone can view images
create policy "Public image access"
  on storage.objects
  for select
  using (bucket_id = 'reference-images');

-- Storage policy: authenticated users can upload
create policy "Authenticated users can upload images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'reference-images');

-- Storage policy: authenticated users can delete
create policy "Authenticated users can delete images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'reference-images');
