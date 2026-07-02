-- Uzantılar
create extension if not exists pgcrypto with schema public;

-- Enum tipleri. Değerler İngilizce/stabil tokendir; Türkçe etiketler
-- src/lib/utils/enums.ts içinde tek kaynak olarak tutulur. Yeni bir değer
-- eklerken her iki dosya da güncellenmelidir.

create type public.user_role as enum (
  'organization_admin',
  'safety_expert',
  'viewer',
  'company_contact'
);

create type public.hazard_class as enum (
  'az_tehlikeli',
  'tehlikeli',
  'cok_tehlikeli'
);

create type public.inspection_type as enum (
  'periyodik',
  'sikayet_uzerine',
  'takip',
  'kaza_sonrasi',
  'diger'
);

create type public.inspection_status as enum (
  'draft',
  'completed',
  'cancelled'
);

create type public.response_result as enum (
  'compliant',
  'non_compliant',
  'not_applicable',
  'not_checked'
);

create type public.finding_risk_level as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type public.finding_status as enum (
  'open',
  'in_progress',
  'corrected_reported',
  'closed_by_expert',
  'overdue',
  'cancelled'
);

create type public.photo_type as enum (
  'detection',
  'correction',
  'other'
);

create type public.email_status as enum (
  'sent',
  'failed'
);

-- Tüm tablolarda ortak `updated_at` otomatik güncelleme fonksiyonu.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
