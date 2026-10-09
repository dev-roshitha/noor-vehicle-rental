create table if not exists public.vehicles (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.tours (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_finances (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.business_profile (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.authorized_staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.authorized_staff_users enable row level security;

grant select, insert, update, delete
on public.vehicles, public.bookings, public.tours, public.daily_finances, public.business_profile
to authenticated;

create or replace function public.is_authorized_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.authorized_staff_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_authorized_staff() from public;
grant execute on function public.is_authorized_staff() to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'vehicles',
    'bookings',
    'tours',
    'daily_finances',
    'business_profile'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "Authenticated team access" on public.%I', table_name);
    execute format('drop policy if exists "Authorized staff access" on public.%I', table_name);
    execute format(
      'create policy "Authorized staff access" on public.%I for all to authenticated using (public.is_authorized_staff()) with check (public.is_authorized_staff())',
      table_name
    );
  end loop;
end
$$;

insert into storage.buckets (id, name, public)
values ('rental-media', 'rental-media', false)
on conflict (id) do update set public = false;

drop policy if exists "Authorized staff media access" on storage.objects;
create policy "Authorized staff media access"
on storage.objects
for all
to authenticated
using (bucket_id = 'rental-media' and public.is_authorized_staff())
with check (bucket_id = 'rental-media' and public.is_authorized_staff());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'vehicles',
    'bookings',
    'tours',
    'daily_finances',
    'business_profile'
  ] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end
$$;
