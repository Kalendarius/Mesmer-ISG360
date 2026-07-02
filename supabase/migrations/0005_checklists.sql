-- Kontrol listesi şablonları
create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  ad text not null,
  sektor text,
  faaliyet_konusu text,
  denetim_turu public.inspection_type,
  is_active boolean not null default true,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger set_updated_at
  before update on public.checklist_templates
  for each row execute function public.set_updated_at();

create index checklist_templates_organization_id_idx on public.checklist_templates (organization_id);

-- Şablon versiyonları: bir şablonun aynı anda yalnızca bir güncel (is_current)
-- versiyonu olabilir. Bir denetim oluşturulduğunda o anki güncel versiyona
-- kilitlenir; sonraki şablon değişiklikleri geçmiş denetimleri etkilemez.
create table public.checklist_template_versions (
  id uuid primary key default gen_random_uuid(),
  checklist_template_id uuid not null references public.checklist_templates (id),
  organization_id uuid not null references public.organizations (id),
  version_no integer not null,
  is_current boolean not null default true,
  notes text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create unique index checklist_template_versions_current_idx
  on public.checklist_template_versions (checklist_template_id)
  where is_current;

create index checklist_template_versions_template_id_idx
  on public.checklist_template_versions (checklist_template_id);

-- Kontrol listesi kategorileri (Genel İSG, Yangın Güvenliği, ...)
create table public.checklist_categories (
  id uuid primary key default gen_random_uuid(),
  checklist_template_version_id uuid not null references public.checklist_template_versions (id),
  organization_id uuid not null references public.organizations (id),
  ad text not null,
  sira_no integer not null default 0,
  created_at timestamptz not null default now()
);

create index checklist_categories_version_id_idx
  on public.checklist_categories (checklist_template_version_id);

-- Kontrol maddeleri
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_template_version_id uuid not null references public.checklist_template_versions (id),
  checklist_category_id uuid not null references public.checklist_categories (id),
  organization_id uuid not null references public.organizations (id),
  soru text not null,
  aciklama text,
  sira_no integer not null default 0,
  regulation_version_id uuid references public.regulation_versions (id),
  standart_uygunsuzluk_aciklamasi text,
  onerilen_duzeltici_faaliyet text,
  varsayilan_risk_seviyesi public.finding_risk_level not null default 'medium',
  zorunlu boolean not null default true,
  fotograf_gerekli boolean not null default false,
  -- MYK belgelendirme fırsatı bildirimi: bu madde "Uygun Değil" ile
  -- bulguya dönüştüğünde MESMER'e dahili bildirim gider (bkz. CLAUDE.md).
  is_certification_opportunity boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger set_updated_at
  before update on public.checklist_items
  for each row execute function public.set_updated_at();

create index checklist_items_version_id_idx on public.checklist_items (checklist_template_version_id);
create index checklist_items_category_id_idx on public.checklist_items (checklist_category_id);
create index checklist_items_organization_id_idx on public.checklist_items (organization_id);
