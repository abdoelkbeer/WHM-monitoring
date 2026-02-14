create extension if not exists pgcrypto;

create table if not exists public.servers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  host text not null,
  token_encrypted text not null,
  created_at timestamptz not null default now(),
  last_sync_at timestamptz,
  status text default 'UNKNOWN'
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  server_id uuid not null references public.servers(id) on delete cascade,
  domain text not null,
  url text not null,
  metadata jsonb default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_check_at timestamptz,
  last_screenshot_at timestamptz,
  current_status text default 'HEALTHY',
  unique(server_id, domain)
);

create table if not exists public.checks (
  id bigserial primary key,
  site_id uuid not null references public.sites(id) on delete cascade,
  checked_at timestamptz not null default now(),
  http_status int,
  response_time_ms int,
  final_url text,
  redirect_chain_json jsonb default '[]'::jsonb,
  keyword_match text,
  result_status text not null
);

create table if not exists public.screenshots (
  id bigserial primary key,
  site_id uuid not null references public.sites(id) on delete cascade,
  captured_at timestamptz not null default now(),
  storage_path text not null,
  public_url text,
  final_url text,
  http_status int
);

create table if not exists public.incidents (
  id bigserial primary key,
  site_id uuid not null references public.sites(id) on delete cascade,
  type text not null check (type in ('DOWN', 'REDIRECT', 'CRITICAL')),
  started_at timestamptz not null,
  ended_at timestamptz,
  is_open boolean not null default true,
  evidence_json jsonb default '{}'::jsonb
);

create table if not exists public.settings (
  id int primary key check (id = 1),
  alert_email text,
  notify_on_resolve boolean not null default false,
  check_interval_minutes int not null default 5,
  screenshot_interval_minutes int not null default 30,
  whm_sync_interval_hours int not null default 6,
  open_threshold int not null default 2,
  close_threshold int not null default 2,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.servers enable row level security;
alter table public.sites enable row level security;
alter table public.checks enable row level security;
alter table public.screenshots enable row level security;
alter table public.incidents enable row level security;
alter table public.settings enable row level security;

create policy "single admin full access servers" on public.servers for all to authenticated using (true) with check (true);
create policy "single admin full access sites" on public.sites for all to authenticated using (true) with check (true);
create policy "single admin full access checks" on public.checks for all to authenticated using (true) with check (true);
create policy "single admin full access screenshots" on public.screenshots for all to authenticated using (true) with check (true);
create policy "single admin full access incidents" on public.incidents for all to authenticated using (true) with check (true);
create policy "single admin full access settings" on public.settings for all to authenticated using (true) with check (true);

create or replace function public.top_problematic_sites()
returns table(site_id uuid, domain text, incident_count bigint)
language sql
security definer
as $$
  select s.id, s.domain, count(i.id) as incident_count
  from public.sites s
  left join public.incidents i on i.site_id = s.id
  group by s.id, s.domain
  order by incident_count desc
  limit 10
$$;
