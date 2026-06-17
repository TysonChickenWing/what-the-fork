-- Run this in your Supabase SQL editor to add PIN-based identity

create table if not exists users (
  name text primary key,
  pin text not null,
  created_at timestamptz default now()
);

alter table users enable row level security;

create policy "public read users" on users for select using (true);
create policy "public insert users" on users for insert with check (true);
