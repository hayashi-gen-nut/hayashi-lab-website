-- v71: Sequential confirmation of seminar minutes, with admin verification.
-- Run once in Supabase SQL Editor after schema.sql; does not delete prior seminars.
create or replace function public.confirm_seminar(p_record_id uuid)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  r public.records%rowtype;
  y integer;
  n integer;
  final_title text;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;
  select * into r from public.records where id=p_record_id and kind='seminar' and deleted_at is null for update;
  if not found then raise exception 'SEMINAR_NOT_FOUND'; end if;
  if r.body->>'workflowStatus'='confirmed' then return r.title; end if;
  if coalesce(r.body->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'SEMINAR_DATE_REQUIRED'; end if;
  y := left(r.body->>'date',4)::integer;
  -- Serialize confirmation within the same calendar year, avoiding duplicate numbers.
  perform pg_advisory_xact_lock(712061, y);
  select coalesce(max(case when x.body->>'seminarNumber' ~ '^\d+$' then (x.body->>'seminarNumber')::integer end),0)+1 into n
    from public.records x
   where x.kind='seminar' and x.deleted_at is null
     and x.body->>'workflowStatus'='confirmed'
     and x.body->>'seminarYear'=y::text;
  final_title := y::text||'年 第'||n::text||'回全体ゼミ';
  update public.records set
    title=final_title,
    body=r.body||jsonb_build_object('workflowStatus','confirmed','minutesStatus','確定','seminarYear',y,'seminarNumber',n,'confirmedAt',now(),'confirmedBy',auth.uid()),
    updated_at=now()
   where id=p_record_id;
  return final_title;
end;
$$;
revoke all on function public.confirm_seminar(uuid) from public, anon;
grant execute on function public.confirm_seminar(uuid) to authenticated;
notify pgrst, 'reload schema';
