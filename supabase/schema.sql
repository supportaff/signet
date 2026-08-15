-- Signet user tracking. Run this in the Supabase SQL editor.
-- Stores account + plan + metadata only. Never store private keys.

create table if not exists public.signet_users (
  clerk_id text primary key,
  email text,
  name text,
  plan text not null default 'free' check (plan in ('free', 'plus', 'studio')),
  plan_status text not null default 'active',
  certs_used integer not null default 0,
  dodo_customer_id text,
  dodo_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.signet_certificate_events (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null references public.signet_users (clerk_id) on delete cascade,
  cert_type text not null,
  common_name text,
  fingerprint_sha256 text,
  created_at timestamptz not null default now()
);

create table if not exists public.signet_payments (
  id uuid primary key default gen_random_uuid(),
  clerk_id text,
  dodo_payment_id text,
  dodo_subscription_id text,
  plan text,
  event_type text,
  status text,
  created_at timestamptz not null default now()
);

create index if not exists signet_certificate_events_clerk_idx
  on public.signet_certificate_events (clerk_id, created_at desc);

create index if not exists signet_payments_clerk_idx
  on public.signet_payments (clerk_id, created_at desc);

alter table public.signet_users enable row level security;
alter table public.signet_certificate_events enable row level security;
alter table public.signet_payments enable row level security;
