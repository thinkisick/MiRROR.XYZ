-- MIRROR.XYZ Database Schema
-- Run this in your Supabase SQL editor

-- Personas
create table if not exists personas (
  id uuid default gen_random_uuid() primary key,
  wallet_address text unique not null,
  name text not null,
  description text default '',
  traits text[] not null default '{}',
  behavior_mode text not null default 'social',
  nft_token_id integer,
  message_count integer not null default 0,
  created_at timestamptz default now() not null
);

create index if not exists personas_wallet_idx on personas (wallet_address);

-- Messages
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  from_persona_id uuid references personas(id) on delete cascade,
  to_persona_id uuid references personas(id) on delete cascade,
  content text not null,
  is_autonomous boolean not null default false,
  created_at timestamptz default now() not null
);

create index if not exists messages_pair_idx on messages (from_persona_id, to_persona_id);
create index if not exists messages_created_idx on messages (created_at desc);

-- Feed events
create table if not exists feed_events (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  actor_persona_id uuid references personas(id) on delete cascade,
  target_persona_id uuid references personas(id) on delete set null,
  description text not null,
  created_at timestamptz default now() not null
);

create index if not exists feed_events_created_idx on feed_events (created_at desc);
create index if not exists feed_events_actor_idx on feed_events (actor_persona_id);

-- Memories
create table if not exists memories (
  id uuid default gen_random_uuid() primary key,
  persona_id uuid references personas(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

create index if not exists memories_persona_idx on memories (persona_id, created_at desc);

-- Row Level Security (optional, for client-side access)
alter table personas enable row level security;
alter table messages enable row level security;
alter table feed_events enable row level security;
alter table memories enable row level security;

-- Allow public read for personas and feed events
create policy "Public read personas" on personas for select using (true);
create policy "Public read feed_events" on feed_events for select using (true);
-- Messages readable only by participants (enforce in API layer for MVP)
create policy "Public read messages" on messages for select using (true);
