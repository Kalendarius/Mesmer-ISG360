-- RLS yardımcı fonksiyonları. security definer + sabit search_path ile
-- ayrıcalık yükselmesi riskini kapatır; yalnızca authenticated rolüne
-- execute izni verilir.

create or replace function public.current_organization_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.organization_members
  where user_id = auth.uid()
    and is_active
    and deleted_at is null;
$$;

revoke all on function public.current_organization_ids() from public;
grant execute on function public.current_organization_ids() to authenticated;

create or replace function public.current_role_in_org(org_id uuid)
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.organization_members
  where organization_id = org_id
    and user_id = auth.uid()
    and is_active
    and deleted_at is null
  limit 1;
$$;

revoke all on function public.current_role_in_org(uuid) from public;
grant execute on function public.current_role_in_org(uuid) to authenticated;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and is_active
      and deleted_at is null
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
grant execute on function public.is_org_member(uuid) to authenticated;

-- viewer rolü hariç, kuruluş içinde operasyonel yazma yetkisi olanlar.
create or replace function public.can_write_in_org(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_in_org(org_id) in ('organization_admin', 'safety_expert');
$$;

revoke all on function public.can_write_in_org(uuid) from public;
grant execute on function public.can_write_in_org(uuid) to authenticated;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_in_org(org_id) = 'organization_admin';
$$;

revoke all on function public.is_org_admin(uuid) from public;
grant execute on function public.is_org_admin(uuid) to authenticated;
