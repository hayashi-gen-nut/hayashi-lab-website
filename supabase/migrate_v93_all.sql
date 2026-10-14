-- Expand presence options without dropping data or disabling existing RLS.
ALTER TABLE public.member_live_presence DROP CONSTRAINT IF EXISTS member_live_presence_status_check;
ALTER TABLE public.member_live_presence ADD CONSTRAINT member_live_presence_status_check CHECK (status IN ('present','online','meeting','class','lab','away','lunch','left','campus'));
NOTIFY pgrst, 'reload schema';
-- Add threaded replies and simple reactions. Existing chat rows are preserved.
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS reply_to uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS chat_messages_reply_to_idx ON public.chat_messages(reply_to);
CREATE TABLE IF NOT EXISTS public.chat_message_reactions (
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL DEFAULT '👍' CHECK (emoji IN ('👍','❤️','👏')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id,user_id,emoji)
);
ALTER TABLE public.chat_message_reactions ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,DELETE ON public.chat_message_reactions TO authenticated;
DROP POLICY IF EXISTS reactions_read ON public.chat_message_reactions;
CREATE POLICY reactions_read ON public.chat_message_reactions FOR SELECT TO authenticated USING (public.is_member());
DROP POLICY IF EXISTS reactions_insert ON public.chat_message_reactions;
CREATE POLICY reactions_insert ON public.chat_message_reactions FOR INSERT TO authenticated WITH CHECK (public.is_member() AND user_id=auth.uid() AND EXISTS (SELECT 1 FROM public.chat_messages m WHERE m.id=message_id AND m.deleted_at IS NULL));
DROP POLICY IF EXISTS reactions_delete ON public.chat_message_reactions;
CREATE POLICY reactions_delete ON public.chat_message_reactions FOR DELETE TO authenticated USING (user_id=auth.uid());
CREATE OR REPLACE FUNCTION public.hub_chat_send_reply(p_content text,p_topic_id uuid,p_reply_to uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE new_id uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT public.is_member() THEN RAISE EXCEPTION 'ACTIVE_MEMBER_REQUIRED' USING ERRCODE='42501'; END IF;
 IF nullif(btrim(p_content),'') IS NULL OR length(p_content)>10000 THEN RAISE EXCEPTION 'INVALID_MESSAGE'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.chat_messages m WHERE m.id=p_reply_to AND m.deleted_at IS NULL AND m.channel='lab' AND m.topic_id IS NOT DISTINCT FROM p_topic_id) THEN RAISE EXCEPTION 'REPLY_TARGET_NOT_FOUND'; END IF;
 IF p_topic_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.chat_topics t WHERE t.id=p_topic_id AND t.deleted_at IS NULL AND t.archived=false) THEN RAISE EXCEPTION 'TOPIC_UNAVAILABLE'; END IF;
 INSERT INTO public.chat_messages(author_id,channel,topic_id,reply_to,content) VALUES (auth.uid(),'lab',p_topic_id,p_reply_to,btrim(p_content)) RETURNING id INTO new_id;
 RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.hub_chat_send_reply(text,uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.hub_chat_send_reply(text,uuid,uuid) TO authenticated;
NOTIFY pgrst,'reload schema';
-- Persistent, multi-author discussions per seminar and agenda item.
CREATE TABLE IF NOT EXISTS public.seminar_discussions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 seminar_id uuid NOT NULL REFERENCES public.records(id) ON DELETE CASCADE,
 speaker_id text NOT NULL,
 author_id uuid NOT NULL REFERENCES auth.users(id),
 reply_to uuid REFERENCES public.seminar_discussions(id) ON DELETE SET NULL,
 content text NOT NULL CHECK (char_length(content)>0 AND char_length(content)<=10000),
 created_at timestamptz NOT NULL DEFAULT now(),
 edited_at timestamptz,
 deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS seminar_discussions_seminar_idx ON public.seminar_discussions (seminar_id,speaker_id,created_at);
ALTER TABLE public.seminar_discussions ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE ON public.seminar_discussions TO authenticated;
DROP POLICY IF EXISTS seminar_discussions_read ON public.seminar_discussions;
CREATE POLICY seminar_discussions_read ON public.seminar_discussions FOR SELECT TO authenticated USING (public.is_member() AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.records r WHERE r.id=seminar_id AND public.can_read_record(r)));
DROP POLICY IF EXISTS seminar_discussions_insert ON public.seminar_discussions;
CREATE POLICY seminar_discussions_insert ON public.seminar_discussions FOR INSERT TO authenticated WITH CHECK (public.is_member() AND author_id=auth.uid() AND deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.records r WHERE r.id=seminar_id AND public.can_read_record(r)));
DROP POLICY IF EXISTS seminar_discussions_update ON public.seminar_discussions;
CREATE POLICY seminar_discussions_update ON public.seminar_discussions FOR UPDATE TO authenticated USING (public.is_admin() OR (public.is_member() AND author_id=auth.uid())) WITH CHECK (public.is_admin() OR (public.is_member() AND author_id=auth.uid()));
NOTIFY pgrst,'reload schema';
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
