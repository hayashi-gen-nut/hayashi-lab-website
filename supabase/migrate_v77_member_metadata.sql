-- v77: preserve existing members; only extend profile metadata.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS previous_school text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hometown text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_notes text;
-- Existing profiles_admin_write policy controls admin edits.
