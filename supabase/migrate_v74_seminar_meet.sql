-- v74: one shared online meeting URL for all seminars. Run once in Supabase SQL Editor.
BEGIN;
CREATE TABLE IF NOT EXISTS public.seminar_settings (
  id text PRIMARY KEY CHECK (id = 'global'),
  meet_url text NOT NULL CHECK (meet_url ~ '^https://meet\.google\.com/[a-zA-Z-]+([/?#].*)?$'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.seminar_settings (id,meet_url)
VALUES ('global','https://meet.google.com/hwe-otus-sph')
ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.seminar_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.seminar_settings TO authenticated;
GRANT UPDATE ON public.seminar_settings TO authenticated;
DROP POLICY IF EXISTS seminar_settings_read ON public.seminar_settings;
CREATE POLICY seminar_settings_read ON public.seminar_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS seminar_settings_admin_update ON public.seminar_settings;
CREATE POLICY seminar_settings_admin_update ON public.seminar_settings FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
COMMIT;
