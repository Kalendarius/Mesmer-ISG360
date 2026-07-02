-- Mevzuat kayıtları (kanun/yönetmelik/tebliğ başlığı)
create table public.regulations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  mevzuat_adi text not null,
  mevzuat_turu text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger set_updated_at
  before update on public.regulations
  for each row execute function public.set_updated_at();

create index regulations_organization_id_idx on public.regulations (organization_id);

-- Mevzuat madde versiyonları. Bir mevzuatın her maddesi ayrı ayrı
-- versiyonlanır: aynı (regulation_id, madde_no) için yalnızca bir
-- is_current = true satır olabilir (aşağıdaki kısmi unique index).
create table public.regulation_versions (
  id uuid primary key default gen_random_uuid(),
  regulation_id uuid not null references public.regulations (id),
  organization_id uuid not null references public.organizations (id),
  version_no integer not null,
  madde_no text,
  madde_basligi text,
  madde_metni text not null,
  kaynak_url text,
  yururluk_tarihi date,
  is_current boolean not null default true,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create unique index regulation_versions_current_per_madde_idx
  on public.regulation_versions (regulation_id, madde_no)
  where is_current;

create index regulation_versions_regulation_id_idx on public.regulation_versions (regulation_id);
create index regulation_versions_organization_id_idx on public.regulation_versions (organization_id);
