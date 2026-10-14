-- Research Lab Hub v51: run once in Supabase SQL Editor AFTER the existing v49 schema.
-- Existing chat messages are preserved in General.
begin;
create table if not exists public.chat_topics (
 id uuid primary key default gen_random_uuid(),
 title text not null check (length(trim(title)) between 1 and 120),
 created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now(),
 archived boolean not null default false
);
alter table public.chat_topics enable row level security;
grant select,insert,update on public.chat_topics to authenticated;
create policy chat_topics_read on public.chat_topics for select to authenticated using (public.is_member());
create policy chat_topics_insert on public.chat_topics for insert to authenticated with check (public.is_member() and created_by=auth.uid() and archived=false);
create policy chat_topics_update on public.chat_topics for update to authenticated using (public.is_admin() or (public.is_member() and created_by=auth.uid())) with check (public.is_admin() or (public.is_member() and created_by=auth.uid()));
alter table public.chat_messages add column if not exists topic_id uuid references public.chat_topics(id);
alter table public.chat_messages add column if not exists edited_at timestamptz;
create index if not exists idx_chat_topic_time on public.chat_messages(topic_id,created_at desc) where deleted_at is null;
-- Prevent authorship, topic and timestamp tampering during edits.
create or replace function public.chat_protect_immutable() returns trigger language plpgsql set search_path = '' as $$
begin
 if new.id is distinct from old.id or new.author_id is distinct from old.author_id or new.channel is distinct from old.channel or new.topic_id is distinct from old.topic_id or new.created_at is distinct from old.created_at then
   raise exception 'Chat message identity and topic cannot be changed';
 end if;
 return new;
end; $$;
drop trigger if exists chat_immutable_fields on public.chat_messages;
create trigger chat_immutable_fields before update on public.chat_messages for each row execute function public.chat_protect_immutable();
-- Restrict message updates to active members or administrators.
drop policy if exists chat_update on public.chat_messages;
create policy chat_update on public.chat_messages for update to authenticated
 using (public.is_admin() or (public.is_member() and author_id=auth.uid()))
 with check (public.is_admin() or (public.is_member() and author_id=auth.uid()));
-- Topic integrity and membership validation on insertion.
drop policy if exists chat_insert on public.chat_messages;
create policy chat_insert on public.chat_messages for insert to authenticated
 with check (public.is_member() and author_id=auth.uid() and channel='lab' and deleted_at is null and (topic_id is null or exists (select 1 from public.chat_topics t where t.id=topic_id and not t.archived)));
commit;
