-- Kontrol listesi şablonu oluşturma yalnızca MESMER'in kendi kuruluşuna
-- (00000000-0000-0000-0000-000000000001) açık: kiracıların kendi şablonunu
-- oluşturması "çöpe dönüyor" geri bildirimi üzerine kaldırıldı. Kategori/madde
-- düzenleme ve versiyon oluşturma (kendi kopyaladıkları şablon üzerinde)
-- etkilenmez — yalnızca sıfırdan yeni şablon (checklist_templates INSERT)
-- kısıtlanıyor.

drop policy if exists checklist_templates_insert on public.checklist_templates;

create policy checklist_templates_insert on public.checklist_templates
  for insert with check (
    public.can_write_in_org(organization_id)
    and organization_id = '00000000-0000-0000-0000-000000000001'
  );
