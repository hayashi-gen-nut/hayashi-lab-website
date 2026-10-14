-- Administrator-only controlled reopening; no content or prior confirmation audit is deleted.
CREATE OR REPLACE FUNCTION public.reopen_seminar(p_record_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.records%ROWTYPE;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_admin() THEN
   RAISE EXCEPTION 'ADMIN_REQUIRED' USING ERRCODE='42501';
 END IF;
 SELECT * INTO r FROM public.records WHERE id=p_record_id AND kind='seminar' AND deleted_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'SEMINAR_NOT_FOUND'; END IF;
 IF r.body->>'workflowStatus' IS DISTINCT FROM 'confirmed' THEN RAISE EXCEPTION 'SEMINAR_NOT_CONFIRMED'; END IF;
 UPDATE public.records SET
   body=r.body || jsonb_build_object(
    'workflowStatus','minutes','minutesStatus','作成中',
    'reopenedAt',now(),'reopenedBy',auth.uid(),
    'previousConfirmedAt',r.body->'confirmedAt','previousConfirmedBy',r.body->'confirmedBy'),
   updated_at=now()
 WHERE id=p_record_id;
END; $$;
REVOKE ALL ON FUNCTION public.reopen_seminar(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.reopen_seminar(uuid) TO authenticated;
NOTIFY pgrst,'reload schema';
