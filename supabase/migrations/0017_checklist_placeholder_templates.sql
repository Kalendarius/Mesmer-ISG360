-- Kontrol listesi yapısı revize edildi: "Genel İSG Denetimi (ÖRNEK ŞABLON)"
-- yerine standart 4 şablon geliyor — Masa Başı Evraksal Denetim ve Saha
-- Denetimi'nin 3 alt türü (Ofis / Fabrika / Şantiye). İçerikleri henüz hazır
-- değil; her biri tek bir placeholder kategori + madde ile oluşturulur,
-- MESMER bunları zamanla gerçek kategori/maddelerle dolduracak (bkz.
-- CLAUDE.md). Eski örnek şablon silinmiyor, is_active=false yapılıyor
-- (soft-delete kuralı, kural 6).

update public.checklist_templates
set is_active = false
where id = '00000000-0000-0000-0000-000000000301';

insert into public.checklist_templates (id, organization_id, ad, sektor, faaliyet_konusu, denetim_turu)
values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', 'Masa Başı Evraksal Denetim', 'Genel', 'Tüm sektörler', null),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001', 'Saha Denetimi - Ofis Denetimi', 'Genel', 'Tüm sektörler', null),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000001', 'Saha Denetimi - Fabrika Denetimi', 'Genel', 'Tüm sektörler', null),
  ('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000001', 'Saha Denetimi - Şantiye Denetimi', 'Genel', 'Tüm sektörler', null);

insert into public.checklist_template_versions (id, checklist_template_id, organization_id, version_no, notes)
values
  ('00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', 1, 'Placeholder — içerik hazırlanıyor.'),
  ('00000000-0000-0000-0000-000000000512', '00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001', 1, 'Placeholder — içerik hazırlanıyor.'),
  ('00000000-0000-0000-0000-000000000513', '00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000001', 1, 'Placeholder — içerik hazırlanıyor.'),
  ('00000000-0000-0000-0000-000000000514', '00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000001', 1, 'Placeholder — içerik hazırlanıyor.');

insert into public.checklist_categories (id, checklist_template_version_id, organization_id, ad, sira_no)
values
  ('00000000-0000-0000-0000-000000000521', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'Genel', 1),
  ('00000000-0000-0000-0000-000000000522', '00000000-0000-0000-0000-000000000512', '00000000-0000-0000-0000-000000000001', 'Genel', 1),
  ('00000000-0000-0000-0000-000000000523', '00000000-0000-0000-0000-000000000513', '00000000-0000-0000-0000-000000000001', 'Genel', 1),
  ('00000000-0000-0000-0000-000000000524', '00000000-0000-0000-0000-000000000514', '00000000-0000-0000-0000-000000000001', 'Genel', 1);

insert into public.checklist_items
  (checklist_template_version_id, checklist_category_id, organization_id, soru, sira_no, zorunlu, fotograf_gerekli)
values
  ('00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000521', '00000000-0000-0000-0000-000000000001', 'İçerik hazırlanıyor — bu kontrol listesi yakında MESMER tarafından doldurulacaktır.', 1, false, false),
  ('00000000-0000-0000-0000-000000000512', '00000000-0000-0000-0000-000000000522', '00000000-0000-0000-0000-000000000001', 'İçerik hazırlanıyor — bu kontrol listesi yakında MESMER tarafından doldurulacaktır.', 1, false, false),
  ('00000000-0000-0000-0000-000000000513', '00000000-0000-0000-0000-000000000523', '00000000-0000-0000-0000-000000000001', 'İçerik hazırlanıyor — bu kontrol listesi yakında MESMER tarafından doldurulacaktır.', 1, false, false),
  ('00000000-0000-0000-0000-000000000514', '00000000-0000-0000-0000-000000000524', '00000000-0000-0000-0000-000000000001', 'İçerik hazırlanıyor — bu kontrol listesi yakında MESMER tarafından doldurulacaktır.', 1, false, false);
