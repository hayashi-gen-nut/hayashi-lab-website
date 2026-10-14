-- v95: invitation-free directory; member ids may be referenced as authors/assignees before invitation.
CREATE TABLE IF NOT EXISTS public.lab_member_directory (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name_ja text, name_en text, grade text, student_number text,
 previous_school text, hometown text, member_notes text,
 email text, role text NOT NULL DEFAULT 'student',
 active boolean NOT NULL DEFAULT true,
 linked_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT lab_member_name_required CHECK (nullif(trim(coalesce(name_ja,'')), '') IS NOT NULL OR nullif(trim(coalesce(name_en,'')), '') IS NOT NULL)
);
ALTER TABLE public.lab_member_directory ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.lab_member_directory TO authenticated;
DROP POLICY IF EXISTS directory_lab_read ON public.lab_member_directory;
CREATE POLICY directory_lab_read ON public.lab_member_directory FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS directory_admin_insert ON public.lab_member_directory;
CREATE POLICY directory_admin_insert ON public.lab_member_directory FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS directory_admin_update ON public.lab_member_directory;
CREATE POLICY directory_admin_update ON public.lab_member_directory FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS directory_admin_delete ON public.lab_member_directory;
CREATE POLICY directory_admin_delete ON public.lab_member_directory FOR DELETE TO authenticated USING (public.is_admin());
