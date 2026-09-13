-- PGlite verification stubs emulating the Supabase-managed bits
-- (auth.users, auth.uid(), storage.buckets/objects) so migrations
-- 001-003 can be executed and behaviorally tested in plain Postgres.
-- NOTE: no pgcrypto needed (gen_random_uuid() is core since PG13)
create schema if not exists auth;
create schema if not exists storage;

create table if not exists auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

-- Session-user simulation: tests run  SET app.session_uid = '<uuid>'
-- (named to avoid the reserved word current_user)
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('app.session_uid', true), '')::uuid;
$$;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  name text not null,
  owner uuid,
  created_at timestamptz default now()
);
create or replace function storage.foldername(p text) returns text[] language sql immutable as $$
  select (string_to_array(p, '/'))[1:greatest(cardinality(string_to_array(p, '/')) - 1, 1)];
$$;
alter table storage.objects enable row level security;
