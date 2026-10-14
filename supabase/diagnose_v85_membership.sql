-- Read-only check. Review results only; do not share personal data or keys.
select u.id, u.email, p.id is not null as profile_exists, p.role, p.active
from auth.users u left join public.profiles p on p.id=u.id
where u.email = 'hys.c09.k14@gmail.com';
-- For a different login email, replace the address in the WHERE clause.
