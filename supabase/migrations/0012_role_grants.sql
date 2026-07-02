-- RLS politikaları yalnızca tablo düzeyinde SQL GRANT'i olan roller için
-- geçerlidir; GRANT olmadan politika var olsa bile erişim tamamen reddedilir.
-- Bu proje public şemasını Supabase'in kendi şablon migration'ları olmadan
-- sıfırdan oluşturduğundan, gerekli GRANT'ler açıkça verilmelidir.
--
-- Kural: anon rolüne hiçbir tablo erişimi verilmez (bu, dahili/B2B bir
-- sistemdir, anonim erişim yoktur). authenticated rolüne yalnızca
-- SELECT/INSERT/UPDATE verilir — DELETE hiçbir yerde kullanılmaz (soft
-- delete UPDATE ile yapılır); RLS zaten delete politikası olmayan
-- tablolarda silmeyi engeller, ama en az yetki ilkesi gereği DELETE grant'i
-- de verilmez. service_role RLS'i atlar ama yine de GRANT gerektirir.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;

-- Gelecekte eklenecek tablolar için de aynı varsayılan izinler geçerli olsun.
alter default privileges in schema public
  grant select, insert, update on tables to authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
