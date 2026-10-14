-- v89. Run in Supabase SQL Editor before deployment. Do NOT expose full calendar details to students.
create table if not exists public.member_live_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'away' check (status in ('present','online','meeting','class','lab','away')),
  updated_at timestamptz not null default now()
);
alter table public.member_live_presence enable row level security;
grant select, insert, update on public.member_live_presence to authenticated;
drop policy if exists member_live_presence_read on public.member_live_presence;
create policy member_live_presence_read on public.member_live_presence for select to authenticated using (auth.uid() is not null);
drop policy if exists member_live_presence_insert on public.member_live_presence;
create policy member_live_presence_insert on public.member_live_presence for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists member_live_presence_update on public.member_live_presence;
create policy member_live_presence_update on public.member_live_presence for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- On-campus checkboxes continue to use public.faculty_day_presence (v86).
