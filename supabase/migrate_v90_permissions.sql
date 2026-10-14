-- Run as project database owner in Supabase SQL Editor. Non-destructive grants; existing RLS remains enforced.
BEGIN;
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.records, public.chat_messages, public.chat_topics, public.chat_attachments, public.file_entries TO service_role;
GRANT SELECT ON public.records, public.chat_messages TO authenticated;
COMMIT;
-- Diagnose (read-only): SELECT table_name, grantee, privilege_type FROM information_schema.role_table_grants WHERE table_schema='public' AND table_name IN ('profiles','chat_messages','records') ORDER BY table_name,grantee;
