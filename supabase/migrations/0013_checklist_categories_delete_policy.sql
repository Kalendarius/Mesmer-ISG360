-- checklist_categories, is_active/deleted_at kolonu olmayan tek tabanlı
-- CRUD tablosudur (bkz. CLAUDE.md); boş bir kategori gerçekten DELETE
-- edilir (deleteCategoryAction). 0010'da bu tablo için delete politikası
-- unutulmuştu — RLS varsayılan olarak reddettiğinden delete komutu hatasız
-- ama 0 satır etkileyerek "sessizce" başarısız oluyordu.
create policy checklist_categories_delete on public.checklist_categories
  for delete using (public.can_write_in_org(organization_id));

-- 0012'de authenticated rolüne kasıtlı olarak hiçbir tabloda DELETE grant'i
-- verilmemişti ("soft delete UPDATE ile yapılır, DELETE hiçbir yerde
-- kullanılmaz" kuralı) — ama checklist_categories bu kuralın tek istisnası.
-- RLS politikası tek başına yetmez (bkz. 0012'nin başındaki not); GRANT
-- olmadan politika var olsa bile erişim reddedilir. En az yetki ilkesi
-- gereği yalnızca bu tabloya, yalnızca DELETE için dar bir grant verilir.
grant delete on public.checklist_categories to authenticated;
