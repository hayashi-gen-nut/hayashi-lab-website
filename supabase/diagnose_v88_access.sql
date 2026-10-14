-- READ ONLY. Run in the SAME Supabase project configured in Vercel.
SELECT current_database() AS db, current_user AS sql_role;
SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('profiles','chat_messages','records','chat_attachments','faculty_day_presence');
SELECT role,active,count(*) AS members FROM public.profiles GROUP BY role,active ORDER BY role,active;
SELECT grantee,table_name,privilege_type FROM information_schema.role_table_grants WHERE table_schema='public' AND table_name IN ('profiles','chat_messages','records') AND grantee IN ('service_role','authenticated') ORDER BY table_name,grantee,privilege_type;
