-- 0020'de MESMER'in kendi kuruluşuna eklenen yeni maddeler (6301 sayılı
-- Kanun, Alt İşverenlik, Asansör İşletme ve Bakım, Asansör Periyodik
-- Kontrol, Asbest) mevcut kuruluşlara (MesmerMYM, Yok) da uygulanır. Bu
-- kuruluşlar "Masa Başı Evraksal Denetim" şablonuna zaten sahip (0019 ile
-- klonlanmıştı), bu yüzden 0019'daki gibi tüm şablonu yeniden klonlamak
-- yerine yalnızca eksik olan yeni mevzuatı ve kategorileri/maddeleri
-- kendi mevcut şablon versiyonlarına ekliyoruz.

do $$
declare
  mesmer_org uuid := '00000000-0000-0000-0000-000000000001';
  t_org uuid;
  target_orgs uuid[] := array[
    'f46b60d2-ddcd-41ee-845b-ee5629c3bf6a',
    '13b67297-7b1c-4668-b3a2-247840651c16'
  ];
  t_version_id uuid;
  t_egitim_cat_id uuid;
  t_myk_reg_version_id uuid;
  src_reg record;
  new_reg_id uuid;
  reg_id_map jsonb;
  src_version record;
  t_reg_version_id uuid;
  reg_version_id_map jsonb;
  t_cat_539 uuid;
  t_cat_540 uuid;
  t_cat_541 uuid;
  t_cat_542 uuid;
begin
  foreach t_org in array target_orgs loop

    -- Hedef kuruluşun "Masa Başı Evraksal Denetim" şablon versiyonunu bul.
    select ctv.id into t_version_id
    from public.checklist_template_versions ctv
    join public.checklist_templates ct on ct.id = ctv.checklist_template_id
    where ct.organization_id = t_org
      and ct.ad = 'Masa Başı Evraksal Denetim'
      and ctv.is_current
    limit 1;

    if t_version_id is null then
      continue;
    end if;

    -- Bu backfill zaten uygulanmışsa (örn. tekrar çalıştırılırsa) atla.
    if exists (
      select 1 from public.checklist_categories
      where checklist_template_version_id = t_version_id and ad = 'Asansör'
    ) then
      continue;
    end if;

    select id into t_egitim_cat_id
    from public.checklist_categories
    where checklist_template_version_id = t_version_id and ad = 'Eğitim'
    limit 1;

    select rv.id into t_myk_reg_version_id
    from public.regulation_versions rv
    join public.regulations r on r.id = rv.regulation_id
    where r.organization_id = t_org
      and r.mevzuat_adi = 'Mesleki Yeterlilik Kurumu Kanunu (5544 sayılı)'
      and rv.madde_no = 'Ek Madde 1'
    limit 1;

    -- Yeni 5 mevzuatı ve maddelerini hedef kuruluşa klonla.
    reg_id_map := '{}'::jsonb;
    for src_reg in
      select * from public.regulations
      where organization_id = mesmer_org
        and mevzuat_adi in (
          'Öğle Dinlenmesi Kanunu (6301 sayılı)',
          'Alt İşverenlik Yönetmeliği',
          'Asansör İşletme ve Bakım Yönetmeliği',
          'Asansör Periyodik Kontrol Yönetmeliği',
          'Asbestle Çalışmalarda Sağlık ve Güvenlik Önlemleri Hakkında Yönetmelik'
        )
    loop
      insert into public.regulations (organization_id, mevzuat_adi, mevzuat_turu, is_active)
      values (t_org, src_reg.mevzuat_adi, src_reg.mevzuat_turu, true)
      returning id into new_reg_id;
      reg_id_map := reg_id_map || jsonb_build_object(src_reg.id::text, new_reg_id::text);
    end loop;

    reg_version_id_map := '{}'::jsonb;
    for src_version in
      select rv.* from public.regulation_versions rv
      where rv.regulation_id::text in (select jsonb_object_keys(reg_id_map))
        and rv.is_current
    loop
      insert into public.regulation_versions
        (regulation_id, organization_id, version_no, madde_no, madde_basligi, madde_metni, kaynak_url, yururluk_tarihi, is_current)
      values
        ((reg_id_map ->> src_version.regulation_id::text)::uuid, t_org, src_version.version_no, src_version.madde_no,
         src_version.madde_basligi, src_version.madde_metni, src_version.kaynak_url, src_version.yururluk_tarihi, true)
      returning id into t_reg_version_id;
      reg_version_id_map := reg_version_id_map || jsonb_build_object(src_version.id::text, t_reg_version_id::text);
    end loop;

    -- Eğitim kategorisine MYK/Ek Madde 1 maddesi (varsa).
    if t_egitim_cat_id is not null and t_myk_reg_version_id is not null then
      insert into public.checklist_items
        (checklist_template_version_id, checklist_category_id, organization_id, soru, sira_no, regulation_version_id,
         standart_uygunsuzluk_aciklamasi, onerilen_duzeltici_faaliyet, varsayilan_risk_seviyesi, zorunlu, fotograf_gerekli, is_certification_opportunity)
      values
        (t_version_id, t_egitim_cat_id, t_org,
         'Tehlikeli ve çok tehlikeli işlerde belge zorunlulukları kapsamında çalışanların ustalık belgesi veya mesleki yeterlilik belgesi var mı?', 4,
         t_myk_reg_version_id,
         'Tehlikeli/çok tehlikeli sınıfta çalışan ilgili personelin ustalık belgesi veya mesleki yeterlilik belgesi bulunmuyor.',
         'Personelin ilgili meslek standardında mesleki yeterlilik belgesi almasının sağlanması.',
         'high', true, false, true);
    end if;

    -- 4 yeni kategori.
    insert into public.checklist_categories (checklist_template_version_id, organization_id, ad, sira_no)
    values (t_version_id, t_org, 'Çalışma Süreleri ve Dinlenme', 9)
    returning id into t_cat_539;
    insert into public.checklist_categories (checklist_template_version_id, organization_id, ad, sira_no)
    values (t_version_id, t_org, 'Alt İşverenlik', 10)
    returning id into t_cat_540;
    insert into public.checklist_categories (checklist_template_version_id, organization_id, ad, sira_no)
    values (t_version_id, t_org, 'Asansör', 11)
    returning id into t_cat_541;
    insert into public.checklist_categories (checklist_template_version_id, organization_id, ad, sira_no)
    values (t_version_id, t_org, 'Tehlikeli Maddeler', 12)
    returning id into t_cat_542;

    -- Çalışma Süreleri ve Dinlenme
    insert into public.checklist_items
      (checklist_template_version_id, checklist_category_id, organization_id, soru, sira_no, regulation_version_id,
       standart_uygunsuzluk_aciklamasi, onerilen_duzeltici_faaliyet, varsayilan_risk_seviyesi, zorunlu, fotograf_gerekli, is_certification_opportunity)
    select t_version_id, t_cat_539, t_org,
      'İşyerinde en az 1 saat öğle dinlenmesi veriliyor mu?', 1,
      (reg_version_id_map ->> (
        select rv.id::text from public.regulation_versions rv
        join public.regulations r on r.id = rv.regulation_id
        where r.organization_id = mesmer_org and r.mevzuat_adi = 'Öğle Dinlenmesi Kanunu (6301 sayılı)'
        limit 1
      ))::uuid,
      'Çalışanlara en az 1 saat öğle dinlenmesi verilmiyor.',
      'Öğle dinlenmesi süresinin mevzuata uygun şekilde (en az 1 saat) düzenlenmesi.',
      'medium', true, false, false;

    -- Alt İşverenlik
    insert into public.checklist_items
      (checklist_template_version_id, checklist_category_id, organization_id, soru, sira_no, regulation_version_id,
       standart_uygunsuzluk_aciklamasi, onerilen_duzeltici_faaliyet, varsayilan_risk_seviyesi, zorunlu, fotograf_gerekli, is_certification_opportunity)
    select t_version_id, t_cat_540, t_org,
      'Alt işveren var mı? Varsa yazılı alt işverenlik sözleşmesi yapılmış mı?', 1,
      (reg_version_id_map ->> (
        select rv.id::text from public.regulation_versions rv
        join public.regulations r on r.id = rv.regulation_id
        where r.organization_id = mesmer_org and r.mevzuat_adi = 'Alt İşverenlik Yönetmeliği'
        limit 1
      ))::uuid,
      'Alt işveren ile yazılı bir alt işverenlik sözleşmesi bulunmuyor.',
      'Asıl işveren ile alt işveren arasında yazılı alt işverenlik sözleşmesinin düzenlenmesi.',
      'medium', true, false, false;

    -- Asansör (8 madde) — kaynak sırasına göre madde_no ile eşleştir.
    insert into public.checklist_items
      (checklist_template_version_id, checklist_category_id, organization_id, soru, sira_no, regulation_version_id,
       standart_uygunsuzluk_aciklamasi, onerilen_duzeltici_faaliyet, varsayilan_risk_seviyesi, zorunlu, fotograf_gerekli, is_certification_opportunity)
    select t_version_id, t_cat_541, t_org, x.soru, x.sira_no,
      (reg_version_id_map ->> (
        select rv.id::text from public.regulation_versions rv
        join public.regulations r on r.id = rv.regulation_id
        where r.organization_id = mesmer_org and r.mevzuat_adi = x.mevzuat_adi and rv.madde_no = x.madde_no
        limit 1
      ))::uuid,
      x.uygunsuzluk, x.duzeltici, x.risk::public.finding_risk_level, true, x.foto, x.myk
    from (values
      ('Asansörün kimlik numarası var mı?', 1, 'Asansör İşletme ve Bakım Yönetmeliği', '5',
       'Asansörde asansör kimlik numarası içeren etiket bulunmuyor.',
       'Asansör kimlik numarasının A tipi muayene kuruluşu tarafından oluşturulup etiketlenmesinin sağlanması.', 'medium', true, false),
      ('Asansöre ayda en az bir defa yetkili servis tarafından bakım yapılıyor mu?', 2, 'Asansör İşletme ve Bakım Yönetmeliği', '4 (e bendi)',
       'Asansöre aylık periyotta bakım yaptırılmıyor.', 'Yetkili servisle aylık bakım periyodunun sağlanması.', 'high', false, false),
      ('Asansör monte eden veya yetkili servisiyle, her bir asansör için asansör kimlik numarası belirtilecek şekilde yazılı bakım sözleşmesi var mı?', 3, 'Asansör İşletme ve Bakım Yönetmeliği', '8 (1. fıkra)',
       'Yazılı bakım sözleşmesi bulunmuyor veya asansör kimlik numarasını içermiyor.', 'Asansör kimlik numarasını içeren yazılı bakım sözleşmesinin düzenlenmesi.', 'high', false, false),
      ('Asansörün kayıt defteri var mı?', 4, 'Asansör İşletme ve Bakım Yönetmeliği', '10',
       'Asansör kayıt defteri tutulmuyor.', 'Aksam/parça değişiklikleri ile bildirilen kazaların işleneceği bir kayıt defterinin oluşturulması.', 'medium', true, false),
      ('Asansör bakım föyleri kayıt altına alınıp saklanıyor mu?', 5, 'Asansör İşletme ve Bakım Yönetmeliği', '10',
       'Bakım föyleri düzenlenmiyor veya saklanmıyor.', 'Her bakımda düzenlenen bakım föylerinin bina yönetim bürosunda kalıcı olarak muhafaza edilmesi.', 'medium', true, false),
      ('Asansör bakım ve onarımı yapan teknik personel mesleki yeterlilik belgesine (veya ustalık belgesine) sahip mi?', 6, 'Asansör İşletme ve Bakım Yönetmeliği', '13 (5. fıkra)',
       'Teknik bakım ve onarım personeli gerekli ustalık belgesine veya mesleki yeterlilik belgesine sahip değil.', 'Personelin ilgili meslek standardında mesleki yeterlilik belgesi almasının sağlanması.', 'high', false, true),
      ('Asansörün yıllık periyodik kontrolü yaptırılmış mı? Kontrol etiketi asansör üzerinde asılı mı?', 7, 'Asansör Periyodik Kontrol Yönetmeliği', '34',
       'Asansörün yıllık periyodik kontrolü yaptırılmamış veya kontrol etiketi asansör üzerinde bulunmuyor.', 'A tipi muayene kuruluşuna yıllık periyodik kontrolün yaptırılması.', 'critical', true, false),
      ('Periyodik kontrol sonucuna göre asansöre iliştirilen bilgi etiketinin rengi (yeşil/mavi/sarı/kırmızı) nedir, buna göre gerekli önlemler alınmış mı?', 8, 'Asansör Periyodik Kontrol Yönetmeliği', '11',
       'Sarı/kırmızı etiketli (kusurlu/güvensiz) asansörde öngörülen sürede uygunsuzluklar giderilmemiş.', 'Etiket rengine göre öngörülen sürede uygunsuzlukların giderilmesi ve takip kontrolünün yaptırılması.', 'high', true, false)
    ) as x(soru, sira_no, mevzuat_adi, madde_no, uygunsuzluk, duzeltici, risk, foto, myk);

    -- Tehlikeli Maddeler
    insert into public.checklist_items
      (checklist_template_version_id, checklist_category_id, organization_id, soru, sira_no, regulation_version_id,
       standart_uygunsuzluk_aciklamasi, onerilen_duzeltici_faaliyet, varsayilan_risk_seviyesi, zorunlu, fotograf_gerekli, is_certification_opportunity)
    select t_version_id, t_cat_542, t_org,
      'İşyerinde asbest içeren lifli silikat malzemelerle (aktinolit, antofilit, grünerit/amosit, krizotil, krosidolit, tremolit) çalışma yapılıyor mu? Yapılıyorsa ilgili yönetmelik hükümleri uygulanıyor mu?', 1,
      (reg_version_id_map ->> (
        select rv.id::text from public.regulation_versions rv
        join public.regulations r on r.id = rv.regulation_id
        where r.organization_id = mesmer_org and r.mevzuat_adi = 'Asbestle Çalışmalarda Sağlık ve Güvenlik Önlemleri Hakkında Yönetmelik'
        limit 1
      ))::uuid,
      'Asbest içeren malzemelerle çalışılıyor ancak Asbestle Çalışmalarda Sağlık ve Güvenlik Önlemleri Hakkında Yönetmelik hükümleri uygulanmıyor.',
      'Asbest söküm/bakım/uzaklaştırma çalışmalarının yönetmeliğe uygun (eğitimli personel, ölçüm, sınır değerler) yürütülmesinin sağlanması.',
      'critical', true, false, false;

  end loop;
end $$;
