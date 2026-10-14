-- Update seminar confirmation to count separately by seminar type and Japanese fiscal year.
-- All existing records and content are retained.
CREATE OR REPLACE FUNCTION public.confirm_seminar(p_record_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
 r public.records%ROWTYPE;
 fy integer;
 seq integer;
 category text;
 final_title text;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_admin() THEN RAISE EXCEPTION 'ADMIN_REQUIRED' USING ERRCODE='42501'; END IF;
 SELECT * INTO r FROM public.records WHERE id=p_record_id AND kind='seminar' AND deleted_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'SEMINAR_NOT_FOUND'; END IF;
 IF r.body->>'workflowStatus'='confirmed' THEN RETURN r.title; END IF;
 IF coalesce(r.body->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'SEMINAR_DATE_REQUIRED'; END IF;
 fy := substring(r.body->>'date' from 1 for 4)::integer;
 IF substring(r.body->>'date' from 6 for 2)::integer<4 THEN fy := fy-1; END IF;
 category := coalesce(nullif(r.body->>'seminarType',''),nullif(r.body->>'groups',''),'全体ゼミ');
 IF category='ALL' THEN category:='全体ゼミ'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('seminar-'||category),fy);
 SELECT coalesce(max(CASE WHEN x.body->>'seminarNumber'~'^\d+$' THEN (x.body->>'seminarNumber')::integer END),0)+1 INTO seq
 FROM public.records x WHERE x.kind='seminar' AND x.deleted_at IS NULL AND x.body->>'workflowStatus'='confirmed'
 AND coalesce(x.body->>'seminarFiscalYear',x.body->>'seminarYear')=fy::text
 AND (CASE WHEN coalesce(x.body->>'seminarType',x.body->>'groups','全体ゼミ')='ALL' THEN '全体ゼミ' ELSE coalesce(x.body->>'seminarType',x.body->>'groups','全体ゼミ') END)=category;
 final_title := fy::text||'年度 第'||seq::text||'回'||category;
 UPDATE public.records SET title=final_title,body=r.body||jsonb_build_object(
  'workflowStatus','confirmed','minutesStatus','確定','seminarFiscalYear',fy,
  'seminarNumber',seq,'seminarType',category,'confirmedAt',now(),'confirmedBy',auth.uid()
 ),updated_at=now() WHERE id=p_record_id;
 RETURN final_title;
END;
$$;
REVOKE ALL ON FUNCTION public.confirm_seminar(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.confirm_seminar(uuid) TO authenticated;
-- Manuscript visibility for all ACTIVE lab members (not public / anonymous visitors).
-- Existing drafts become visible *inside the lab*; maintain role-restricted editing.
UPDATE public.records SET visibility='lab' WHERE kind='output' AND visibility='private' AND deleted_at IS NULL;
NOTIFY pgrst,'reload schema';
