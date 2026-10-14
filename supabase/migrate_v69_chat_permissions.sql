-- v69: restore safe member posting and administrator moderation. Run AFTER v56 and v68.
-- Does not delete data; policies apply at database level.
BEGIN;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE public.chat_messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE public.chat_topics TO authenticated;
DROP POLICY IF EXISTS chat_insert ON public.chat_messages;
CREATE POLICY chat_insert ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (public.is_member() AND author_id=auth.uid() AND channel='lab' AND deleted_at IS NULL
AND (topic_id IS NULL OR EXISTS (SELECT 1 FROM public.chat_topics t WHERE t.id=topic_id AND t.deleted_at IS NULL AND t.archived=false)));
DROP POLICY IF EXISTS chat_update ON public.chat_messages;
CREATE POLICY chat_update ON public.chat_messages FOR UPDATE TO authenticated
USING (public.is_admin() OR (public.is_member() AND author_id=auth.uid() AND deleted_at IS NULL))
WITH CHECK (public.is_admin() OR (public.is_member() AND author_id=auth.uid()));
COMMIT;
NOTIFY pgrst,'reload schema';
-- Diagnostic (run separately if posting still fails): SELECT auth.uid();
-- If auth.uid() is NULL in the SQL editor, this is expected; test posting while signed in to the web app.
