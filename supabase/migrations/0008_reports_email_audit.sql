-- PDF raporları (metadata). Dosyanın kendisi private bucket'ta tutulur.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  inspection_id uuid not null references public.inspections (id),
  report_no text not null unique,
  generated_by uuid not null references auth.users (id),
  generated_at timestamptz not null default now(),
  pdf_storage_path text not null,
  created_at timestamptz not null default now()
);

create index reports_organization_id_idx on public.reports (organization_id);
create index reports_inspection_id_idx on public.reports (inspection_id);

-- Rapor üretiminde kullanılan tüm verinin değiştirilemez anlık görüntüsü.
-- Yeniden üretmek yeni bir reports + report_snapshots satırı oluşturur;
-- mevcut bir snapshot_json asla update edilmez.
create table public.report_snapshots (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id),
  organization_id uuid not null references public.organizations (id),
  snapshot_json jsonb not null,
  created_at timestamptz not null default now()
);

create index report_snapshots_report_id_idx on public.report_snapshots (report_id);

-- E-posta gönderim kayıtları. finding_id, MYK belgelendirme fırsatı gibi
-- doğrudan bir bulguya bağlı dahili bildirimler için kullanılır; rapor
-- e-postaları için inspection_id/report_id doldurulur. İkisi karışmaz.
create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  inspection_id uuid references public.inspections (id),
  report_id uuid references public.reports (id),
  finding_id uuid references public.findings (id),
  alicilar text[] not null,
  cc text[],
  konu text not null,
  mesaj text,
  gonderen_user_id uuid references auth.users (id),
  gonderim_zamani timestamptz not null default now(),
  servis_mesaj_id text,
  durum public.email_status not null,
  hata_mesaji text,
  created_at timestamptz not null default now()
);

create index email_logs_organization_id_idx on public.email_logs (organization_id);
create index email_logs_inspection_id_idx on public.email_logs (inspection_id);
create index email_logs_finding_id_idx on public.email_logs (finding_id);

-- Denetim/audit izi. Append-only: update/delete politikası yoktur.
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  actor_user_id uuid references auth.users (id),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  onceki_veri jsonb,
  yeni_veri jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_organization_id_idx on public.audit_logs (organization_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

-- Kuruluş bazlı e-posta bildirim ayarları (yalnızca gerçekten kullanılan
-- alanlar; bağlı olmayan "gelecek özellik" alanı eklenmez).
create table public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id),
  default_cc text[],
  gonderen_adi text,
  yanit_adresi text,
  -- MYK belgelendirme fırsatı bildirimlerinin gideceği dahili alıcı listesi
  -- (işletme yetkilisinden bağımsız, bkz. CLAUDE.md).
  myk_firsat_bildirim_alicilari text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.notification_settings
  for each row execute function public.set_updated_at();
