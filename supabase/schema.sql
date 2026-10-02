-- Enable UUID support
create extension if not exists pgcrypto;

-- Main table: stores every scanned SMS message
create table if not exists scanned_messages (
  id uuid primary key default gen_random_uuid(),
  sender varchar(255) not null,
  body text not null,
  extracted_links text[] default array[]::text[],
  risk_score integer not null check (risk_score >= 0 and risk_score <= 100),
  verdict varchar(20) not null check (verdict in ('CRITICAL', 'SUSPICIOUS', 'SAFE')),
  quarantined boolean default false,
  created_at timestamptz default now()
);

-- Indexes for fast dashboard queries
create index if not exists idx_verdict
on scanned_messages(verdict);

create index if not exists idx_created_at
on scanned_messages(created_at desc);

create index if not exists idx_risk_score
on scanned_messages(risk_score);

-- Enable Row Level Security
alter table scanned_messages enable row level security;

-- Allow anyone to insert (for hackathon simulator)
create policy "public insert"
on scanned_messages
for insert
to public
with check (true);

-- Allow anyone to read (for dashboard)
create policy "public read"
on scanned_messages
for select
to public
using (true);
