-- ─────────────────────────────────────────────────────────────────────────────
-- SyncWave — OPTIONAL durable layer (Section 6).
--
-- The live experience (sync, presence, queue, chat, reactions, public-room
-- discovery) needs NONE of this — it runs entirely on Supabase Realtime
-- broadcast + presence, which work with just your project URL + anon key.
--
-- Run this only if you want durable persistence: session history, a queue that
-- survives refresh, analytics, etc. It is here so the schema matches the spec
-- and gives you a foundation to build on.
--
-- SECURITY NOTE: the policies below are permissive (anon full access) to match
-- the MVP's "no-account, just press play" model. Before production, add auth
-- and tighten these (Section 10).
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

create table if not exists public.sessions (
  id            text primary key,            -- join code doubles as id
  host_user_id  text not null,
  name          text not null default 'Live session',
  is_public     boolean not null default true,
  created_at    timestamptz not null default now(),
  ended_at      timestamptz
);

create table if not exists public.session_members (
  session_id  text not null references public.sessions(id) on delete cascade,
  user_id     text not null,
  role        text not null default 'listener' check (role in ('host','listener')),
  joined_at   timestamptz not null default now(),
  left_at     timestamptz,
  primary key (session_id, user_id)
);

create table if not exists public.queue_items (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null references public.sessions(id) on delete cascade,
  track_uri   text not null,
  source      text not null,
  added_by    text not null,
  position    int not null default 0,
  status      text not null default 'queued',
  created_at  timestamptz not null default now()
);

create table if not exists public.play_history (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null references public.sessions(id) on delete cascade,
  track_uri   text not null,
  source      text not null,
  started_at  timestamptz not null default now()
);

create index if not exists queue_items_session_idx on public.queue_items (session_id, position);
create index if not exists sessions_public_idx on public.sessions (is_public, ended_at);

-- Permissive RLS for the MVP (tighten for production).
alter table public.sessions        enable row level security;
alter table public.session_members enable row level security;
alter table public.queue_items     enable row level security;
alter table public.play_history    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['sessions','session_members','queue_items','play_history'] loop
    execute format('drop policy if exists %I_anon_all on public.%I;', t, t);
    execute format('create policy %I_anon_all on public.%I for all using (true) with check (true);', t, t);
  end loop;
end $$;
