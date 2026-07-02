-- Kuruluşlar (marka/kiracı kimliği)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text not null,
  logo_path text,
  logo_white_path text,
  primary_color text,
  secondary_color text,
  accent_color text,
  email_logo_path text,
  report_logo_path text,
  website text,
  phone text,
  email text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- Kullanıcı profilleri (auth.users ile 1:1)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_path text,
  default_organization_id uuid references public.organizations (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Yeni bir auth kullanıcısı oluşturulduğunda otomatik profil satırı aç.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Kuruluş üyelikleri (rol ataması). company_id, companies tablosu
-- oluşturulduktan sonra 0003 migration'ında FK olarak eklenir; şimdilik
-- gelecekteki company_contact rolü için ayrılmış nullable bir uuid'dir.
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  user_id uuid not null references auth.users (id),
  role public.user_role not null default 'safety_expert',
  company_id uuid,
  is_active boolean not null default true,
  invited_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, user_id)
);

create trigger set_updated_at
  before update on public.organization_members
  for each row execute function public.set_updated_at();

create index organization_members_user_id_idx on public.organization_members (user_id);
create index organization_members_organization_id_idx on public.organization_members (organization_id);
