-- Expand presence options without dropping data or disabling existing RLS.
ALTER TABLE public.member_live_presence DROP CONSTRAINT IF EXISTS member_live_presence_status_check;
ALTER TABLE public.member_live_presence ADD CONSTRAINT member_live_presence_status_check CHECK (status IN ('present','online','meeting','class','lab','away','lunch','left','campus'));
NOTIFY pgrst, 'reload schema';
