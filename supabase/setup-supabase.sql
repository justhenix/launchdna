create table if not exists public.launchdna_api_calls (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null,
  token_address text,
  case_id text,
  calls integer not null default 1,
  status text,
  status_code integer,
  duration_ms integer,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists launchdna_api_calls_created_at_idx
  on public.launchdna_api_calls (created_at desc);

create index if not exists launchdna_api_calls_endpoint_idx
  on public.launchdna_api_calls (endpoint);

create index if not exists launchdna_api_calls_token_address_idx
  on public.launchdna_api_calls (token_address);

create index if not exists launchdna_api_calls_case_id_idx
  on public.launchdna_api_calls (case_id);

alter table public.launchdna_api_calls enable row level security;

create table if not exists public.case_files (
  id uuid primary key default gen_random_uuid(),
  case_id text unique not null,
  token_address text,
  token_name text,
  token_symbol text,
  archetype text,
  confidence integer,
  data_mode text,
  evidence_quality_status text,
  case_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_files_created_at_idx
  on public.case_files (created_at desc);

create index if not exists case_files_token_address_idx
  on public.case_files (token_address);

alter table public.case_files enable row level security;

-- Server-only access. Do not expose service role or secret key to client code.
grant usage on schema public to service_role;
grant select, insert, update, delete on public.launchdna_api_calls to service_role;
grant select, insert, update, delete on public.case_files to service_role;
