-- Private storage bucket'ları. Dosya yolu kuralı: {organization_id}/... —
-- RLS politikaları bu ilk klasör segmentini kuruluş üyeliğiyle doğrular.
-- Erişim yalnızca signed URL veya yetkilendirilmiş route handler ile
-- sağlanır (bkz. CLAUDE.md kural 3).

insert into storage.buckets (id, name, public)
values
  ('inspection-photos', 'inspection-photos', false),
  ('report-pdfs', 'report-pdfs', false)
on conflict (id) do nothing;

create policy inspection_photos_select on storage.objects
  for select using (
    bucket_id = 'inspection-photos'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

create policy inspection_photos_insert on storage.objects
  for insert with check (
    bucket_id = 'inspection-photos'
    and public.can_write_in_org(((storage.foldername(name))[1])::uuid)
  );

create policy report_pdfs_select on storage.objects
  for select using (
    bucket_id = 'report-pdfs'
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  );

create policy report_pdfs_insert on storage.objects
  for insert with check (
    bucket_id = 'report-pdfs'
    and public.can_write_in_org(((storage.foldername(name))[1])::uuid)
  );
