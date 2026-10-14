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
