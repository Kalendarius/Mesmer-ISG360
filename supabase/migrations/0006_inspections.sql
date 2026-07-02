-- Denetimler
create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  company_id uuid not null references public.companies (id),
  branch_id uuid not null references public.company_branches (id),
  checklist_template_version_id uuid not null references public.checklist_template_versions (id),
  denetim_turu public.inspection_type not null default 'periyodik',
  denetim_tarihi date not null default current_date,
  baslangic_saati time,
  bitis_saati time,
  uzman_user_id uuid not null references auth.users (id),
  yetkili_contact_id uuid references public.company_contacts (id),
  genel_notlar text,
  status public.inspection_status not null default 'draft',
  completed_at timestamptz,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger set_updated_at
  before update on public.inspections
  for each row execute function public.set_updated_at();

create index inspections_organization_id_idx on public.inspections (organization_id);
create index inspections_company_id_idx on public.inspections (company_id);
create index inspections_branch_id_idx on public.inspections (branch_id);
create index inspections_status_idx on public.inspections (status);

-- Denetim madde cevapları. Soru ve mevzuat metni snapshot olarak saklanır:
-- kontrol listesi/mevzuat sonradan değişse bile bu satır değişmez.
create table public.inspection_responses (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references public.inspections (id),
  checklist_item_id uuid not null references public.checklist_items (id),
  organization_id uuid not null references public.organizations (id),
  sira_no integer not null default 0,
  soru_snapshot text not null,
  aciklama_snapshot text,
  regulation_metin_snapshot text,
  regulation_reference_snapshot text,
  sonuc public.response_result,
  not_metni text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inspection_id, checklist_item_id)
);

create trigger set_updated_at
  before update on public.inspection_responses
  for each row execute function public.set_updated_at();

create index inspection_responses_inspection_id_idx on public.inspection_responses (inspection_id);
create index inspection_responses_organization_id_idx on public.inspection_responses (organization_id);
