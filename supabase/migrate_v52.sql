-- Run after v49 and v51 migrations. Keep RLS enabled.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.file_entries TO authenticated;
-- Existing file_entries RLS policies continue to govern access.
