-- İşletmeler
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  unvan text not null,
  kisa_ad text,
  vergi_no text,
  sgk_sicil_no text,
  nace_kodu text,
  tehlike_sinifi public.hazard_class,
  faaliyet_konusu text,
  calisan_sayisi integer,
  telefon text,
  eposta text,
  website text,
  notlar text,
  is_active boolean not null default true,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

create index companies_organization_id_idx on public.companies (organization_id);

-- Artık companies tablosu var; organization_members.company_id için FK ekle
-- (gelecekteki company_contact rolünü belirli bir işletmeye kilitlemek için).
alter table public.organization_members
  add constraint organization_members_company_id_fkey
  foreign key (company_id) references public.companies (id);

-- Şubeler
create table public.company_branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  company_id uuid not null references public.companies (id),
  sube_adi text not null,
  adres text,
  il text,
  ilce text,
  lat double precision,
  lng double precision,
  calisan_sayisi integer,
  yetkili_kisi text,
  yetkili_eposta text,
  yetkili_telefon text,
  is_active boolean not null default true,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger set_updated_at
  before update on public.company_branches
  for each row execute function public.set_updated_at();

create index company_branches_organization_id_idx on public.company_branches (organization_id);
create index company_branches_company_id_idx on public.company_branches (company_id);

-- İşletme/şube yetkilileri
create table public.company_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  company_id uuid not null references public.companies (id),
  branch_id uuid references public.company_branches (id),
  ad_soyad text not null,
  gorev text,
  eposta text,
  telefon text,
  bildirim_alsin boolean not null default true,
  ana_yetkili boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger set_updated_at
  before update on public.company_contacts
  for each row execute function public.set_updated_at();

create index company_contacts_organization_id_idx on public.company_contacts (organization_id);
create index company_contacts_company_id_idx on public.company_contacts (company_id);
