-- Apply once in Supabase SQL Editor. Existing chat data is preserved.
BEGIN;
CREATE TABLE IF NOT EXISTS public.chat_attachments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
 uploader_id uuid NOT NULL REFERENCES auth.users(id),
 original_name text NOT NULL,
 mime text NOT NULL,
 size_bytes bigint NOT NULL CHECK(size_bytes >= 0 AND size_bytes <= 8388608),
 path text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_attachments_message_id_idx ON public.chat_attachments(message_id);
ALTER TABLE public.chat_attachments ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.chat_attachments TO authenticated;
DROP POLICY IF EXISTS chat_attachment_read ON public.chat_attachments;
CREATE POLICY chat_attachment_read ON public.chat_attachments FOR SELECT TO authenticated
 USING (public.is_member() AND EXISTS (
 SELECT 1 FROM public.chat_messages m WHERE m.id=message_id AND m.deleted_at IS NULL AND m.channel='lab'
 AND (m.topic_id IS NULL OR EXISTS(SELECT 1 FROM public.chat_topics t WHERE t.id=m.topic_id AND t.deleted_at IS NULL))
 ));
COMMIT;
NOTIFY pgrst, 'reload schema';
