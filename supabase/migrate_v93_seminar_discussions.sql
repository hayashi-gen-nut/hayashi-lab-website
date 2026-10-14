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
