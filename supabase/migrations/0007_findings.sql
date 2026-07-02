-- Uygunsuzluklar
create table public.findings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  inspection_id uuid not null references public.inspections (id),
  inspection_response_id uuid not null references public.inspection_responses (id),
  company_id uuid not null references public.companies (id),
  branch_id uuid not null references public.company_branches (id),
  baslik text not null,
  aciklama text,
  regulation_version_id uuid references public.regulation_versions (id),
  regulation_metin_snapshot text,
  onerilen_duzeltici_faaliyet text,
  risk_seviyesi public.finding_risk_level not null default 'medium',
  sorumlu_kisi_contact_id uuid references public.company_contacts (id),
  sorumlu_kisi_adi text,
  termin_tarihi date,
  durum public.finding_status not null default 'open',
  kapatma_notu text,
  kapatilma_tarihi date,
  parent_finding_id uuid references public.findings (id),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger set_updated_at
  before update on public.findings
  for each row execute function public.set_updated_at();

create index findings_organization_id_idx on public.findings (organization_id);
create index findings_inspection_id_idx on public.findings (inspection_id);
create index findings_company_id_idx on public.findings (company_id);
create index findings_branch_id_idx on public.findings (branch_id);
create index findings_durum_idx on public.findings (durum);
create index findings_parent_finding_id_idx on public.findings (parent_finding_id);

-- Uygunsuzluk fotoğrafları (private bucket'ta saklanır, bkz. 0011 migration)
create table public.finding_photos (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references public.findings (id),
  organization_id uuid not null references public.organizations (id),
  storage_path text not null,
  tip public.photo_type not null default 'detection',
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index finding_photos_finding_id_idx on public.finding_photos (finding_id);

-- Düzeltici faaliyet aktivite/ilerleme geçmişi
create table public.corrective_actions (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references public.findings (id),
  organization_id uuid not null references public.organizations (id),
  aciklama text not null,
  yeni_durum public.finding_status,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create index corrective_actions_finding_id_idx on public.corrective_actions (finding_id);
