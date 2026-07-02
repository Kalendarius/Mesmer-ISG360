-- Ayarlar ekranındaki "Kullanıcılar" listesi için: profiles tablosunda
-- e-posta tutulmaz (auth.users ile 1:1, tekrar/senkron sürüklenmesini
-- önlemek için). Bu güvenlik tanımlayıcı (security definer) fonksiyon,
-- yalnızca çağıran kullanıcının ZATEN üyesi olduğu bir kuruluşun üye
-- e-postalarını döner — diğer RLS yardımcı fonksiyonlarıyla aynı desen
-- (bkz. 0009_rls_helper_functions.sql).
create or replace function public.organization_member_emails(org_id uuid)
returns table(user_id uuid, email text)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.email::text
  from auth.users u
  join public.organization_members om on om.user_id = u.id
  where om.organization_id = org_id
    and public.is_org_member(org_id);
$$;

revoke all on function public.organization_member_emails(uuid) from public;
grant execute on function public.organization_member_emails(uuid) to authenticated;
