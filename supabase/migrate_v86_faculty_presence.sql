-- Run once in Supabase SQL Editor. Checked=on campus; unchecked=off campus.
create table if not exists public.faculty_day_presence (
  day date primary key,
  on_campus boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.faculty_day_presence enable row level security;
grant select,insert,update on public.faculty_day_presence to authenticated;
drop policy if exists faculty_presence_read on public.faculty_day_presence;
create policy faculty_presence_read on public.faculty_day_presence for select to authenticated using (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.active=true)
);
drop policy if exists faculty_presence_insert on public.faculty_day_presence;
create policy faculty_presence_insert on public.faculty_day_presence for insert to authenticated with check (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.active=true and p.role='admin')
);
drop policy if exists faculty_presence_update on public.faculty_day_presence;
create policy faculty_presence_update on public.faculty_day_presence for update to authenticated using (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.active=true and p.role='admin')
) with check (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.active=true and p.role='admin')
);
