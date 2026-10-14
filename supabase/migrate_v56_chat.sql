-- v56 chat migration: run in Supabase SQL Editor once (safe to rerun).
-- Preserves existing messages; does not disable RLS.
BEGIN;
CREATE TABLE IF NOT EXISTS public.chat_topics (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL,
 created_by uuid NOT NULL REFERENCES public.profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 archived boolean NOT NULL DEFAULT false
);
ALTER TABLE public.chat_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS topic_id uuid;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.chat_topics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_member() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
DROP POLICY IF EXISTS chat_topics_read ON public.chat_topics;
CREATE POLICY chat_topics_read ON public.chat_topics FOR SELECT TO authenticated USING (public.is_member());
DROP POLICY IF EXISTS chat_topics_insert ON public.chat_topics;
CREATE POLICY chat_topics_insert ON public.chat_topics FOR INSERT TO authenticated WITH CHECK (public.is_member() AND created_by=auth.uid() AND archived=false);
DROP POLICY IF EXISTS chat_topics_update ON public.chat_topics;
CREATE POLICY chat_topics_update ON public.chat_topics FOR UPDATE TO authenticated USING (public.is_admin() OR (public.is_member() AND created_by=auth.uid())) WITH CHECK (public.is_admin() OR (public.is_member() AND created_by=auth.uid()));
DROP POLICY IF EXISTS chat_read ON public.chat_messages;
CREATE POLICY chat_read ON public.chat_messages FOR SELECT TO authenticated USING (public.is_member() AND deleted_at IS NULL AND channel IN ('lab','group'));
DROP POLICY IF EXISTS chat_insert ON public.chat_messages;
CREATE POLICY chat_insert ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (
 public.is_member() AND author_id=auth.uid() AND channel='lab' AND deleted_at IS NULL
 AND (topic_id IS NULL OR EXISTS(SELECT 1 FROM public.chat_topics t WHERE t.id=topic_id AND NOT t.archived))
);
DROP POLICY IF EXISTS chat_update ON public.chat_messages;
CREATE POLICY chat_update ON public.chat_messages FOR UPDATE TO authenticated
 USING (public.is_admin() OR (public.is_member() AND author_id=auth.uid()))
 WITH CHECK (public.is_admin() OR (public.is_member() AND author_id=auth.uid()));
COMMIT;
NOTIFY pgrst, 'reload schema';
