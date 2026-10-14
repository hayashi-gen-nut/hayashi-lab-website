-- v70. Run in Supabase SQL Editor on the SAME project used by the app.
-- Preserves chat history, enables authenticated operations via checked functions.
BEGIN;
CREATE OR REPLACE FUNCTION public.hub_chat_send(p_content text, p_topic_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_uid uuid := auth.uid(); v_id uuid;
BEGIN
 IF v_uid IS NULL OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=v_uid AND active IS TRUE AND role IN ('admin','student','staff')) THEN
   RAISE EXCEPTION 'CHAT_MEMBER_REQUIRED: signed-in user lacks an active member profile' USING ERRCODE='42501';
 END IF;
 IF p_content IS NULL OR length(btrim(p_content))=0 OR length(p_content)>10000 THEN RAISE EXCEPTION 'CHAT_INVALID_CONTENT'; END IF;
 IF p_topic_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.chat_topics WHERE id=p_topic_id AND deleted_at IS NULL AND archived IS FALSE) THEN
   RAISE EXCEPTION 'CHAT_TOPIC_NOT_AVAILABLE';
 END IF;
 INSERT INTO public.chat_messages(channel, topic_id, author_id, content) VALUES('lab',p_topic_id,v_uid,btrim(p_content)) RETURNING id INTO v_id;
 RETURN v_id;
END; $$;
CREATE OR REPLACE FUNCTION public.hub_chat_delete_message(p_message_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_uid uuid := auth.uid(); v_admin boolean;
BEGIN
 SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=v_uid AND active IS TRUE AND role='admin') INTO v_admin;
 IF v_uid IS NULL OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=v_uid AND active IS TRUE AND role IN ('admin','student','staff')) THEN
   RAISE EXCEPTION 'CHAT_MEMBER_REQUIRED' USING ERRCODE='42501';
 END IF;
 UPDATE public.chat_messages SET deleted_at=now() WHERE id=p_message_id AND deleted_at IS NULL AND (author_id=v_uid OR v_admin);
 IF FOUND THEN RETURN true; END IF;
 IF EXISTS(SELECT 1 FROM public.chat_messages WHERE id=p_message_id AND deleted_at IS NULL) THEN RAISE EXCEPTION 'CHAT_DELETE_FORBIDDEN' USING ERRCODE='42501'; END IF;
 RETURN false;
END; $$;
CREATE OR REPLACE FUNCTION public.hub_chat_delete_topic(p_topic_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND active IS TRUE AND role='admin') THEN
   RAISE EXCEPTION 'CHAT_ADMIN_REQUIRED' USING ERRCODE='42501';
 END IF;
 -- Both updates execute in the same transaction; a failure rolls back both.
 UPDATE public.chat_topics SET deleted_at=now(),archived=true WHERE id=p_topic_id AND deleted_at IS NULL;
 IF NOT FOUND THEN RETURN false; END IF;
 UPDATE public.chat_messages SET deleted_at=now() WHERE topic_id=p_topic_id AND deleted_at IS NULL;
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.hub_chat_send(text,uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.hub_chat_delete_message(uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.hub_chat_delete_topic(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hub_chat_send(text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hub_chat_delete_message(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hub_chat_delete_topic(uuid) TO authenticated;
COMMIT;
NOTIFY pgrst, 'reload schema';

-- DIAGNOSTIC: run the next query separately and inspect admin/member profile linkage.
-- This is database-side and does not use the current website session.
-- SELECT role,active,count(*) FROM public.profiles GROUP BY role,active ORDER BY role,active;
-- SELECT policyname,cmd,permissive,qual,with_check FROM pg_policies WHERE schemaname='public' AND tablename IN ('chat_messages','chat_topics');
