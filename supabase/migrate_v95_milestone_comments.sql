-- Comments on manuscript stages; authors may edit only their own comments.
CREATE TABLE IF NOT EXISTS public.manuscript_milestone_comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),record_id uuid NOT NULL REFERENCES public.records(id) ON DELETE CASCADE,
 stage_key text NOT NULL,author_id uuid NOT NULL REFERENCES auth.users(id),reply_to uuid REFERENCES public.manuscript_milestone_comments(id),
 content text NOT NULL CHECK(length(trim(content))>0), created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz,deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS milestone_comments_record_idx ON public.manuscript_milestone_comments(record_id,stage_key,created_at);
ALTER TABLE public.manuscript_milestone_comments ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE ON public.manuscript_milestone_comments TO authenticated;
DROP POLICY IF EXISTS milestone_comment_read ON public.manuscript_milestone_comments;
CREATE POLICY milestone_comment_read ON public.manuscript_milestone_comments FOR SELECT TO authenticated USING (
 EXISTS(SELECT 1 FROM public.records r WHERE r.id=record_id AND r.deleted_at IS NULL)
);
DROP POLICY IF EXISTS milestone_comment_write ON public.manuscript_milestone_comments;
CREATE POLICY milestone_comment_write ON public.manuscript_milestone_comments FOR INSERT TO authenticated WITH CHECK (author_id=auth.uid() AND EXISTS(SELECT 1 FROM public.records r WHERE r.id=record_id AND r.deleted_at IS NULL));
DROP POLICY IF EXISTS milestone_comment_edit ON public.manuscript_milestone_comments;
CREATE POLICY milestone_comment_edit ON public.manuscript_milestone_comments FOR UPDATE TO authenticated USING(author_id=auth.uid()) WITH CHECK(author_id=auth.uid());
