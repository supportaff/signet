-- SelfSignedCert user tracking. Run this in the SelfSignedCert Supabase SQL editor.
-- Stores account + plan + login metadata only. Never store private keys.

create table if not exists public.signet_users (
  auth_id text primary key,
  email text,
  name text,
  plan text not null default 'free' check (plan in ('free', 'plus', 'studio')),
  plan_status text not null default 'active',
  certs_used integer not null default 0,
  login_count integer not null default 0,
  last_login_at timestamptz,
  dodo_customer_id text,
  dodo_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.signet_certificate_events (
  id uuid primary key default gen_random_uuid(),
  auth_id text not null references public.signet_users (auth_id) on delete cascade,
  cert_type text not null,
  common_name text,
  fingerprint_sha256 text,
  created_at timestamptz not null default now()
);

create table if not exists public.signet_payments (
  id uuid primary key default gen_random_uuid(),
  auth_id text,
  dodo_payment_id text,
  dodo_subscription_id text,
  plan text,
  event_type text,
  status text,
  created_at timestamptz not null default now()
);

create table if not exists public.signet_login_events (
  id uuid primary key default gen_random_uuid(),
  auth_id text not null references public.signet_users (auth_id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create index if not exists signet_certificate_events_auth_idx
  on public.signet_certificate_events (auth_id, created_at desc);

create index if not exists signet_payments_auth_idx
  on public.signet_payments (auth_id, created_at desc);

create index if not exists signet_login_events_auth_idx
  on public.signet_login_events (auth_id, created_at desc);

create index if not exists signet_users_last_login_idx
  on public.signet_users (last_login_at desc nulls last);

alter table public.signet_users enable row level security;
alter table public.signet_certificate_events enable row level security;
alter table public.signet_payments enable row level security;
alter table public.signet_login_events enable row level security;
