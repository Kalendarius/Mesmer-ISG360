-- 0017/0018 migration'ları yalnızca MESMER'in kendi kuruluşunu güncelledi.
-- Bu migration'lardan ÖNCE `/kayit` ile oluşturulmuş kuruluşlar kendi
-- bağımsız (eski) şablon kopyalarını taşımaya devam ediyordu — çünkü
-- cloneStarterContent yalnızca kayıt anında çalışır, sonradan MESMER'e
-- eklenen içerik otomatik yansımaz. Bu migration, bu tür mevcut
-- kuruluşları MESMER'in güncel içeriğiyle (4 yeni şablon + gerekli yeni
-- mevzuat maddeleri) senkronize eder — cloneStarterContent'in aynı mantığı,
-- geriye dönük olarak uygulanır.

do $$
declare
  mesmer_org uuid := '00000000-0000-0000-0000-000000000001';
  t_org uuid;
  target_orgs uuid[] := array[
    'f46b60d2-ddcd-41ee-845b-ee5629c3bf6a',
    '13b67297-7b1c-4668-b3a2-247840651c16'
  ];
  t_reg_id uuid;
  src_version record;
  t_version_id uuid;
  src_template record;
  src_version_row record;
  new_template_id uuid;
  new_version_id uuid;
  src_category record;
  new_category_id uuid;
  src_item record;
  new_cat_id uuid;
  t_reg_version_id uuid;
begin
  foreach t_org in array target_orgs loop

    -- 1) Hedef kuruluşun "İş Sağlığı ve Güvenliği Kanunu (6331 sayılı)" mevzuat
    --    kaydını bul (kayıt anında zaten klonlanmış olmalı).
    select id into t_reg_id
    from public.regulations
    where organization_id = t_org
      and mevzuat_adi = 'İş Sağlığı ve Güvenliği Kanunu (6331 sayılı)'
    limit 1;

    if t_reg_id is null then
      -- Bu kuruluşta hiç mevzuat klonlanmamış (beklenmedik durum) — atla.
      continue;
    end if;

    -- 2) MESMER'deki madde 6,10,11,14,15,17,20,22'den hedefte eksik olanları klonla.
    for src_version in
      select rv.*
      from public.regulation_versions rv
      join public.regulations r on r.id = rv.regulation_id
      where r.organization_id = mesmer_org
        and r.mevzuat_adi = 'İş Sağlığı ve Güvenliği Kanunu (6331 sayılı)'
        and rv.madde_no in ('6', '10', '11', '14', '15', '17', '20', '22')
        and rv.is_current
    loop
      if not exists (
        select 1 from public.regulation_versions
        where regulation_id = t_reg_id and madde_no = src_version.madde_no
      ) then
        insert into public.regulation_versions
          (regulation_id, organization_id, version_no, madde_no, madde_basligi, madde_metni, kaynak_url, yururluk_tarihi, is_current)
        values
          (t_reg_id, t_org, src_version.version_no, src_version.madde_no, src_version.madde_basligi, src_version.madde_metni, src_version.kaynak_url, src_version.yururluk_tarihi, true);
      end if;
    end loop;

    -- 3) Hedef kuruluşun eski örnek şablonunu pasifleştir (varsa).
    update public.checklist_templates
    set is_active = false
    where organization_id = t_org
      and ad = 'Genel İSG Denetimi (ÖRNEK ŞABLON)'
      and is_active = true;

    -- 4) MESMER'in 4 yeni şablonunu (Masa Başı, Ofis, Fabrika, Şantiye) klonla.
    for src_template in
      select * from public.checklist_templates
      where organization_id = mesmer_org
        and ad in (
          'Masa Başı Evraksal Denetim',
          'Saha Denetimi - Ofis Denetimi',
          'Saha Denetimi - Fabrika Denetimi',
          'Saha Denetimi - Şantiye Denetimi'
        )
        and is_active = true
    loop
      -- Bu şablon bu kuruluşta zaten varsa (daha önce klonlanmışsa) atla.
      if exists (select 1 from public.checklist_templates where organization_id = t_org and ad = src_template.ad) then
        continue;
      end if;

      insert into public.checklist_templates (organization_id, ad, sektor, faaliyet_konusu, denetim_turu, is_active)
      values (t_org, src_template.ad, src_template.sektor, src_template.faaliyet_konusu, src_template.denetim_turu, true)
      returning id into new_template_id;

      select * into src_version_row
      from public.checklist_template_versions
      where checklist_template_id = src_template.id and is_current
      limit 1;

      insert into public.checklist_template_versions (checklist_template_id, organization_id, version_no, is_current)
      values (new_template_id, t_org, 1, true)
      returning id into new_version_id;

      for src_category in
        select * from public.checklist_categories
        where checklist_template_version_id = src_version_row.id
        order by sira_no
      loop
        insert into public.checklist_categories (checklist_template_version_id, organization_id, ad, sira_no)
        values (new_version_id, t_org, src_category.ad, src_category.sira_no)
        returning id into new_category_id;

        for src_item in
          select * from public.checklist_items
          where checklist_category_id = src_category.id
            and checklist_template_version_id = src_version_row.id
            and is_active
          order by sira_no
        loop
          t_reg_version_id := null;
          if src_item.regulation_version_id is not null then
            select rv.id into t_reg_version_id
            from public.regulation_versions rv
            join public.regulations r on r.id = rv.regulation_id
            where r.organization_id = t_org
              and rv.madde_no = (
                select madde_no from public.regulation_versions where id = src_item.regulation_version_id
              )
            limit 1;
          end if;

          insert into public.checklist_items
            (checklist_template_version_id, checklist_category_id, organization_id, soru, aciklama, sira_no,
             regulation_version_id, standart_uygunsuzluk_aciklamasi, onerilen_duzeltici_faaliyet,
             varsayilan_risk_seviyesi, zorunlu, fotograf_gerekli, is_certification_opportunity, is_active)
          values
            (new_version_id, new_category_id, t_org, src_item.soru, src_item.aciklama, src_item.sira_no,
             t_reg_version_id, src_item.standart_uygunsuzluk_aciklamasi, src_item.onerilen_duzeltici_faaliyet,
             src_item.varsayilan_risk_seviyesi, src_item.zorunlu, src_item.fotograf_gerekli, src_item.is_certification_opportunity, src_item.is_active);
        end loop;
      end loop;
    end loop;

  end loop;
end $$;
