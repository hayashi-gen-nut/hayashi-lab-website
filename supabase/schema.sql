-- Run once in Supabase SQL Editor. Review university policy before storing student data.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null unique, name_ja text, name_en text, role text not null default 'student' check(role in ('admin','student','staff','collaborator')),
 grade text, active boolean not null default true, created_at timestamptz default now());
create table if not exists public.records (
 id uuid primary key default gen_random_uuid(), kind text not null check(kind in ('meeting','seminar','presentation','task','class','course','destination','assignment','submission','output','journal','thesis','document','presence','presence_log','project','seminar_comment')),
 title text not null default '', body jsonb not null default '{}'::jsonb,
 owner_id uuid not null references public.profiles(id), visibility text not null default 'lab' check(visibility in ('lab','private','project')),
 project_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.project_members (project_id uuid not null, user_id uuid not null references public.profiles(id) on delete cascade, primary key(project_id,user_id));
create table if not exists public.chat_messages (
 id uuid primary key default gen_random_uuid(), channel text not null default 'lab', author_id uuid not null references public.profiles(id), content text not null check(length(content)<=10000), created_at timestamptz not null default now(), deleted_at timestamptz);
create table if not exists public.file_entries (
 id uuid primary key default gen_random_uuid(), record_id uuid not null references public.records(id), uploader_id uuid not null references public.profiles(id), path text not null unique, original_name text not null, mime text not null, size_bytes bigint not null, version integer not null default 1, created_at timestamptz not null default now(), deleted_at timestamptz);
create index if not exists idx_records_kind on public.records(kind,created_at desc) where deleted_at is null;
create index if not exists idx_chat_channel on public.chat_messages(channel,created_at desc) where deleted_at is null;
create index if not exists idx_file_record on public.file_entries(record_id) where deleted_at is null;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin' and active) $$;
create or replace function public.is_member() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from profiles where id=auth.uid() and role in ('admin','student','staff') and active) $$;
create or replace function public.can_read_record(r public.records) returns boolean language sql stable security definer set search_path=public as $$
 select r.deleted_at is null and (public.is_admin() or r.owner_id=auth.uid() or (r.visibility='lab' and public.is_member()) or (r.visibility='project' and exists(select 1 from project_members p where p.project_id=r.project_id and p.user_id=auth.uid())))
$$;
alter table public.profiles enable row level security;
alter table public.records enable row level security;
alter table public.project_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.file_entries enable row level security;
create policy "profiles_read" on public.profiles for select to authenticated using (public.is_member() or id=auth.uid() or public.is_admin());
create policy "profiles_admin_write" on public.profiles for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "records_read" on public.records for select to authenticated using(public.can_read_record(records));
create policy "records_insert" on public.records for insert to authenticated with check(owner_id=auth.uid() and (public.is_member() or (visibility='project' and exists(select 1 from project_members where project_id=records.project_id and user_id=auth.uid()))));
create policy "records_update" on public.records for update to authenticated using(public.is_admin() or (owner_id=auth.uid() and public.is_member())) with check(public.is_admin() or (owner_id=auth.uid() and public.is_member()));
create policy "project_members_read" on public.project_members for select to authenticated using(public.is_admin() or user_id=auth.uid());
create policy "project_members_admin" on public.project_members for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "chat_read" on public.chat_messages for select to authenticated using(public.is_member() and deleted_at is null and (channel='lab' or channel='group'));
create policy "chat_insert" on public.chat_messages for insert to authenticated with check(public.is_member() and author_id=auth.uid() and channel in ('lab','group'));
create policy "chat_update" on public.chat_messages for update to authenticated using(public.is_admin() or author_id=auth.uid());
create policy "files_read" on public.file_entries for select to authenticated using(exists(select 1 from public.records r where r.id=record_id and public.can_read_record(r)) and deleted_at is null);
create policy "files_insert" on public.file_entries for insert to authenticated with check(uploader_id=auth.uid() and exists(select 1 from public.records r where r.id=record_id and public.can_read_record(r)));
create policy "files_update" on public.file_entries for update to authenticated using(public.is_admin() or uploader_id=auth.uid());
-- Dropbox-backed file routes and policies will be implemented server-side.
-- File metadata stays in public.file_entries; binary content must not be stored in Supabase Storage.
