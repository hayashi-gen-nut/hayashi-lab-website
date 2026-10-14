-- v68: admin delete (soft-delete). Run once in Supabase SQL editor.
-- Keep existing data and retain RLS. Re-runnable.
BEGIN;
ALTER TABLE public.chat_topics ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_chat_topics_visible ON public.chat_topics(created_at DESC) WHERE deleted_at IS NULL;
DROP POLICY IF EXISTS chat_topics_read ON public.chat_topics;
CREATE POLICY chat_topics_read ON public.chat_topics FOR SELECT TO authenticated
USING (public.is_member() AND deleted_at IS NULL);
DROP POLICY IF EXISTS chat_topics_update ON public.chat_topics;
CREATE POLICY chat_topics_update ON public.chat_topics FOR UPDATE TO authenticated
USING (public.is_admin() OR (public.is_member() AND created_by=auth.uid() AND deleted_at IS NULL))
WITH CHECK (public.is_admin() OR (public.is_member() AND created_by=auth.uid() AND deleted_at IS NULL));
DROP POLICY IF EXISTS chat_update ON public.chat_messages;
CREATE POLICY chat_update ON public.chat_messages FOR UPDATE TO authenticated
USING (public.is_admin() OR (public.is_member() AND author_id=auth.uid() AND deleted_at IS NULL))
WITH CHECK (public.is_admin() OR (public.is_member() AND author_id=auth.uid()));
COMMIT;
NOTIFY pgrst,'reload schema';
