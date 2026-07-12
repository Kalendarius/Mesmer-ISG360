-- Kullanıcının ikinci belgesi ("isg kanunu (1).docx") kaynaklı yeni kontrol
-- maddeleri. Belgenin ilk kısmı (12 madde) 0018'de eklenen İSG Kanunu
-- maddeleriyle birebir aynıydı, tekrar eklenmedi. Bu migration yalnızca
-- gerçekten yeni olan içeriği ekliyor: 6301 sayılı Öğle Dinlenmesi Kanunu,
-- Alt İşverenlik Yönetmeliği, Asansör İşletme ve Bakım Yönetmeliği (6 madde),
-- Asansör Periyodik Kontrol Yönetmeliği (2 madde), Asbestle Çalışmalarda
-- Sağlık ve Güvenlik Önlemleri Hakkında Yönetmelik. Tüm madde metinleri
-- mevzuat.gov.tr'den birebir alınmıştır. 5544 sayılı Kanun Ek Madde 1
-- (mesleki yeterlilik belgesi) zaten seed.sql'de mevcut olduğundan yeniden
-- eklenmedi, mevcut regulation_version'a (id ...221) bağlanıldı.

-- ============================================================
-- Yeni mevzuatlar
-- ============================================================

insert into public.regulations (id, organization_id, mevzuat_adi, mevzuat_turu)
values
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'Öğle Dinlenmesi Kanunu (6301 sayılı)', 'Kanun'),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', 'Alt İşverenlik Yönetmeliği', 'Yönetmelik'),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000001', 'Asansör İşletme ve Bakım Yönetmeliği', 'Yönetmelik'),
  ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000001', 'Asansör Periyodik Kontrol Yönetmeliği', 'Yönetmelik'),
  ('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000001', 'Asbestle Çalışmalarda Sağlık ve Güvenlik Önlemleri Hakkında Yönetmelik', 'Yönetmelik');

insert into public.regulation_versions
  (id, regulation_id, organization_id, version_no, madde_no, madde_basligi, madde_metni, kaynak_url, yururluk_tarihi)
values
  (
    '00000000-0000-0000-0000-000000000230',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000001',
    1, '1', null,
    'Madde 1 – Nüfusu on bin ve daha fazla olan şehir ve kasabalardaki fabrika, imalathane, mağaza, dükkan, yazıhane, büro ve bunların benzerleriyle bilümum ticari ve sınai müesseselerde çalıştırılan işçilere ve diğer müstahdemlere bir saatten aşağı olmamak üzere öğle dinlenmesi verilmesi mecburidir. Dinlenme devresinin başlama ve bitme saatleri, mevsimlere göre, o mahallin Belediye Meclisi tarafından tesbit ve ilan olunur.',
    'https://www.mevzuat.gov.tr/MevzuatMetin/1.3.6301.pdf', '1954-03-08'
  ),
  (
    '00000000-0000-0000-0000-000000000231',
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000001',
    1, '9', 'Alt işverenlik sözleşmesi',
    'MADDE 9 – (1) Alt işverenlik sözleşmesi asıl işveren ile alt işveren arasında yazılı şekilde yapılır. (2) Asıl işveren ile alt işveren arasında yapılan ve işin üstlenilmesine esas teşkil eden sözleşmede, 10 uncu maddede yer alan hususların bulunması hâlinde söz konusu sözleşme alt işverenlik sözleşmesi olarak kabul edilebilir.',
    'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=12459&MevzuatTur=7&MevzuatTertip=5', '2008-09-27'
  ),
  (
    '00000000-0000-0000-0000-000000000232',
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000001',
    1, '5', 'Asansör kimlik numarası',
    'MADDE 5 – (1) Bu Yönetmelik kapsamında bulunan her asansör, bir asansör kimlik numarası ile tanımlanır. (2) Asansör kimlik numarası Asansör Periyodik Kontrol Yönetmeliğinde belirtilen usul ve esaslara uygun olarak muayene kuruluşu tarafından periyodik kontrol aşamasından önce oluşturulur. Asansör kimlik numarası Asansör Periyodik Kontrol Yönetmeliğinin 21 inci maddesinde tanımlanan formata uygun bir etiket üzerinde belirtilir. Bu etiket, periyodik kontrol aşamasında muayene kuruluşu tarafından asansör kabinine iliştirilir. (3) Asansör kabinine iliştirilen ve asansör kimlik numarasını içeren etiketin, asansörün kullanım ömrü boyunca muhafaza edilmesine ve gerektiğinde yenilenmesine dair sorumluluk, bina sorumlusundadır.',
    'https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/7.5.31394.pdf', '2019-04-06'
  ),
  (
    '00000000-0000-0000-0000-000000000233',
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000001',
    1, '4 (e bendi)', 'Tanımlar ve kısaltmalar — Bakım',
    'MADDE 4 – (1) Bu Yönetmelikte geçen; ... e) Bakım: Asansörün hizmete alınmasından sonra kullanım ömrü boyunca, kendisinin ve bileşenlerinin, fonksiyonlarının ve güvenlik gereklerinin, tasarlandığı veya ilgili mevzuata uygun olarak yenilendiği biçimde devamlılığını sağlamaya yönelik, asansör monte eden veya onun yetkili servisi tarafından periyodik olarak ayda en az bir defa yürütülen işlemleri,',
    'https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/7.5.31394.pdf', '2019-04-06'
  ),
  (
    '00000000-0000-0000-0000-000000000234',
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000001',
    1, '8 (1. fıkra)', 'Bakım',
    'MADDE 8 – (1) Bu Yönetmelik kapsamında yer alan asansörün bakımı, bina sorumlusunun bakım sözleşmesi imzaladığı asansör monte eden veya onun yetkili servisi tarafından yapılır. Yapı kullanma izin belgesi alan ve amacına uygun olacak şekilde ilk kez kullanıma açılan binada/yapıda yasal olarak bina sorumlusu atanana kadar asansör yaptırıcısı ile asansör monte eden veya onun yetkili servisi arasında bakım sözleşmesi yapılır.',
    'https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/7.5.31394.pdf', '2019-04-06'
  ),
  (
    '00000000-0000-0000-0000-000000000235',
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000001',
    1, '10', 'Bakımla ilgili diğer hususlar',
    'MADDE 10 – (1) Bina sorumlusu ile sözleşme imzalayan asansör monte eden veya onun yetkili servisi, güvenli kullanım için söz konusu asansörü oluşturan aksam ve parçaları da içerecek şekilde bir bütün olarak gerekli koşulları sağlayıp sağlamadığına ilişkin durum tespit raporu hazırlar ve bina sorumlusuna iletir. (2) Asansör monte eden veya onun yetkili servisince her bakımda yapılan işlemler güncel TS EN 13015 standardındaki gereklilikleri de içerecek şekilde hazırlanmış olan bakım föyü ile kayıt altına alınır ve bir nüshası bina sorumlusuna teslim edilir, bir nüshası da kendisi tarafından muhafaza edilir ve talep edilmesi durumunda Bakanlığa ve diğer ilgililere sunulur. (3) Bina sorumlusu bakım föylerini asansörün makina veya makara dairesinde veya binaya/yapıya ait yönetim bürosunda kalıcı olarak muhafaza eder. (4) Asansör monte eden veya onun yetkili servisi, insan can ve mal güvenliği yönünden asansörün risk taşıması durumunda bina sorumlusunu yazılı olarak bilgilendirir. Bina sorumlusu asansör monte eden veya onun yetkili servisi vasıtasıyla asansörün güvenli hale getirilmesini sağlamakla yükümlüdür. (5) Asansör monte eden veya onun yetkili servisi, asansörde yapılan aksam ve parça değişiklikleri ile bildirilen kazaları asansör kayıt defterine işler. (6) Bakım sözleşmesi yapıldıktan sonra asansör monte eden veya onun yetkili servisi, binadaki/yapıdaki asansör sayısı dikkate alınarak bina sorumlusunun belirleyeceği sayıda kişiye acil durumlarda kurtarma çalışması konusunda yılda en az bir defa eğitim verir. (7) Asansör monte eden, piyasaya arz ettiği her tip ve özellikteki asansör için yedek aksam ve parçayı en az üç yıl süreyle temin etmekle yükümlüdür. (8) Asansör monte eden, kendisi tarafından piyasaya arz edilen asansöre bakım, onarım ve servis hizmeti veren bir başka asansör monte edenin veya onun yetkili servisinin veya bina sorumlusunun, yedek aksam veya parça ile asansörde bakım yapmayı mümkün kılacak her türlü cihaz ve donanım talebini normal piyasa koşullarında sağlamak zorundadır. (9) Bakım, onarım, arıza giderme ve periyodik kontrol faaliyetleri yürütülürken gerekli iş sağlığı ve güvenliği tedbirleri 6331 sayılı İş Sağlığı ve Güvenliği Kanunu ve ilgili mevzuat hükümleri doğrultusunda bina sorumlusu ile bakım sözleşmesi imzalayan asansör monte eden veya onun yetkili servisince alınır. (10) Bakım esnasında, bakım ve onarım işlerinden kaynaklı nedenlerle gerek teknik bakım ve onarım personelinin gerekse bakımla ilgisi bulunmayan kişi/kişilerin yaralanmasına veya ölümüne neden olabilecek ihmallere dair sorumluluk, bina sorumlusunun bakım sözleşmesi imzaladığı asansör monte eden veya onun yetkili servisindedir. (11) Periyodik kontrol neticesinde güvensiz olarak tanımlanan ve kırmızı renkli bilgi etiketi iliştirilen asansöre; kusurlu, hafif kusurlu veya kusursuz hale getirilinceye kadar bakım hizmeti sunulamaz.',
    'https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/7.5.31394.pdf', '2019-04-06'
  ),
  (
    '00000000-0000-0000-0000-000000000236',
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000001',
    1, '13 (5. fıkra)', 'Yetkili servis ile ilgili şartlar — teknik personel nitelikleri',
    'MADDE 13 – ... (5) Teknik bakım ve onarım personelinin; a) Endüstri meslek liselerinin asansör, elektrik, elektrik tesisatçılığı, elektromekanik taşıyıcılar, elektronik, endüstriyel elektronik, endüstriyel otomasyon teknolojileri, endüstriyel otomasyon teknolojisi, elektrik-elektronik teknolojisi, makine veya mekatronik bölümlerinden mezun olmaları veya, b) Endüstri meslek liselerinin bu fıkranın (a) bendinde belirtilen bölümlerinin herhangi birisinden mezun olmamaları hâlinde 3308 sayılı Mesleki Eğitim Kanunu kapsamında asansör bakım ve onarımı konusunda ustalık belgesine sahip olmaları veya, c) Meslek yüksekokullarının makine, elektrik, elektronik, elektrik-elektronik, mekatronik veya elektromekanik taşıyıcılar bölümlerinden mezun olmaları veya, ç) Bu fıkranın (a), (b) ve (c) bentlerinde belirtilen şartları sağlayan kişinin/kişilerin dışında teknik bakım ve onarım personeli olarak istihdam edilen kişinin/kişilerin asansör bakım ve onarımı konusunda mesleki yeterlilik belgesine sahip olması, gerekir.',
    'https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/7.5.31394.pdf', '2019-04-06'
  ),
  (
    '00000000-0000-0000-0000-000000000237',
    '00000000-0000-0000-0000-000000000107',
    '00000000-0000-0000-0000-000000000001',
    1, '34', 'Bina sorumlusunun yükümlülüğü',
    'MADDE 34 – (1) Bina sorumlusu, asansörün güvenli bir şekilde kullanılmasını sağlamak üzere yılda en az bir defa periyodik kontrolünü yaptırır. (2) Bina sorumlusu, engellilerin erişilebilirliği için asansörün sürekli olarak güvenli kullanımını sağlar.',
    'https://mevzuat.gov.tr/MevzuatMetin/yonetmelik/7.5.24558.pdf', '2018-05-04'
  ),
  (
    '00000000-0000-0000-0000-000000000238',
    '00000000-0000-0000-0000-000000000107',
    '00000000-0000-0000-0000-000000000001',
    1, '11', 'Periyodik kontrol sonuçlarının değerlendirilmesi',
    'MADDE 11 – (1) Periyodik kontrol sonuçları kusursuz, hafif kusurlu, kusurlu ve güvensiz olmak üzere dört grupta değerlendirilir. (2) Kusursuz olarak tanımlanan asansöre yeşil renkli bilgi etiketi iliştirilir. (3) Hafif kusurlu olarak tanımlanan asansöre mavi renkli bilgi etiketi iliştirilir. (4) Kusurlu olarak tanımlanan asansöre sarı renkli bilgi etiketi iliştirilir. (5) Güvensiz olarak tanımlanan asansöre kırmızı renkli bilgi etiketi iliştirilir. (6) Kırmızı renkli bilgi etiketi iliştirilen ve güvensiz olarak tanımlanan asansörün kullanımına bina sorumlusu tarafından izin verilmez. Bu asansörde tespit edilen uygunsuzlukların en fazla altmış gün içerisinde giderilmesi bina sorumlusunca sağlanır; aksi halde asansör ilgili idare tarafından mühürlenerek hizmetten men edilir. (7) Güvensiz olarak tanımlanan asansörün altıncı fıkrada belirtilen süre içerisinde güvenli hale getirilmeden kullandırılmasından doğabilecek can ve mal kaybından bina sorumlusu mesuldür. (8) Sarı renkli bilgi etiketi iliştirilmiş olan asansördeki uygunsuzlukların en fazla yüz yirmi gün içerisinde giderilmesi bina sorumlusunca sağlanır; aksi halde asansör mühürlenerek hizmetten men edilir. (10) Mavi renkli bilgi etiketi iliştirilmiş olan asansörde belirlenen uygunsuzlukların bir sonraki periyodik kontrole kadar giderilmesi bina sorumlusunca sağlanır.',
    'https://mevzuat.gov.tr/MevzuatMetin/yonetmelik/7.5.24558.pdf', '2018-05-04'
  ),
  (
    '00000000-0000-0000-0000-000000000239',
    '00000000-0000-0000-0000-000000000108',
    '00000000-0000-0000-0000-000000000001',
    1, '4 (a bendi)', 'Tanımlar ve kısaltmalar — Asbest',
    'MADDE 4 – (1) Bu Yönetmelikte geçen; a) Asbest: 1) Aktinolit Asbest, CAS No 77536-66-4, 2) Antofilit Asbest, CAS No 77536-67-5, 3) Grünerit Asbest (Amosit), CAS No 12172-73-5, 4) Krizotil, CAS No 12001-29-5, CAS No 132207-32-0, 5) Krosidolit, CAS No 12001-28-4, 6) Tremolit Asbest, CAS No 77536-68-6 lifli silikatları,',
    'https://www.mevzuat.gov.tr/File/GeneratePdf?mevzuatNo=17050&mevzuatTur=KurumVeKurulusYonetmeligi&mevzuatTertip=5', '2013-01-25'
  );

-- ============================================================
-- Yeni kategoriler (Masa Başı Evraksal Denetim, version 511)
-- ============================================================

insert into public.checklist_categories (id, checklist_template_version_id, organization_id, ad, sira_no)
values
  ('00000000-0000-0000-0000-000000000539', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'Çalışma Süreleri ve Dinlenme', 9),
  ('00000000-0000-0000-0000-000000000540', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'Alt İşverenlik', 10),
  ('00000000-0000-0000-0000-000000000541', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'Asansör', 11),
  ('00000000-0000-0000-0000-000000000542', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'Tehlikeli Maddeler', 12);

-- ============================================================
-- Kontrol maddeleri
-- ============================================================

insert into public.checklist_items
  (checklist_template_version_id, checklist_category_id, organization_id, soru, sira_no, regulation_version_id,
   standart_uygunsuzluk_aciklamasi, onerilen_duzeltici_faaliyet, varsayilan_risk_seviyesi, zorunlu, fotograf_gerekli, is_certification_opportunity)
values
  -- Mevcut "Eğitim" kategorisine ek: 5544 sayılı Kanun Ek Madde 1 (zaten var olan regulation_version'a bağlı)
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000535', '00000000-0000-0000-0000-000000000001',
    'Tehlikeli ve çok tehlikeli işlerde belge zorunlulukları kapsamında çalışanların ustalık belgesi veya mesleki yeterlilik belgesi var mı?', 4, '00000000-0000-0000-0000-000000000221',
    'Tehlikeli/çok tehlikeli sınıfta çalışan ilgili personelin ustalık belgesi veya mesleki yeterlilik belgesi bulunmuyor.',
    'Personelin ilgili meslek standardında mesleki yeterlilik belgesi almasının sağlanması.',
    'high', true, false, true
  ),
  -- Çalışma Süreleri ve Dinlenme
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000539', '00000000-0000-0000-0000-000000000001',
    'İşyerinde en az 1 saat öğle dinlenmesi veriliyor mu?', 1, '00000000-0000-0000-0000-000000000230',
    'Çalışanlara en az 1 saat öğle dinlenmesi verilmiyor.',
    'Öğle dinlenmesi süresinin mevzuata uygun şekilde (en az 1 saat) düzenlenmesi.',
    'medium', true, false, false
  ),
  -- Alt İşverenlik
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000540', '00000000-0000-0000-0000-000000000001',
    'Alt işveren var mı? Varsa yazılı alt işverenlik sözleşmesi yapılmış mı?', 1, '00000000-0000-0000-0000-000000000231',
    'Alt işveren ile yazılı bir alt işverenlik sözleşmesi bulunmuyor.',
    'Asıl işveren ile alt işveren arasında yazılı alt işverenlik sözleşmesinin düzenlenmesi.',
    'medium', true, false, false
  ),
  -- Asansör
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000541', '00000000-0000-0000-0000-000000000001',
    'Asansörün kimlik numarası var mı?', 1, '00000000-0000-0000-0000-000000000232',
    'Asansörde asansör kimlik numarası içeren etiket bulunmuyor.',
    'Asansör kimlik numarasının A tipi muayene kuruluşu tarafından oluşturulup etiketlenmesinin sağlanması.',
    'medium', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000541', '00000000-0000-0000-0000-000000000001',
    'Asansöre ayda en az bir defa yetkili servis tarafından bakım yapılıyor mu?', 2, '00000000-0000-0000-0000-000000000233',
    'Asansöre aylık periyotta bakım yaptırılmıyor.',
    'Yetkili servisle aylık bakım periyodunun sağlanması.',
    'high', true, false, false
  ),
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000541', '00000000-0000-0000-0000-000000000001',
    'Asansör monte eden veya yetkili servisiyle, her bir asansör için asansör kimlik numarası belirtilecek şekilde yazılı bakım sözleşmesi var mı?', 3, '00000000-0000-0000-0000-000000000234',
    'Yazılı bakım sözleşmesi bulunmuyor veya asansör kimlik numarasını içermiyor.',
    'Asansör kimlik numarasını içeren yazılı bakım sözleşmesinin düzenlenmesi.',
    'high', true, false, false
  ),
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000541', '00000000-0000-0000-0000-000000000001',
    'Asansörün kayıt defteri var mı?', 4, '00000000-0000-0000-0000-000000000235',
    'Asansör kayıt defteri tutulmuyor.',
    'Aksam/parça değişiklikleri ile bildirilen kazaların işleneceği bir kayıt defterinin oluşturulması.',
    'medium', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000541', '00000000-0000-0000-0000-000000000001',
    'Asansör bakım föyleri kayıt altına alınıp saklanıyor mu?', 5, '00000000-0000-0000-0000-000000000235',
    'Bakım föyleri düzenlenmiyor veya saklanmıyor.',
    'Her bakımda düzenlenen bakım föylerinin bina yönetim bürosunda kalıcı olarak muhafaza edilmesi.',
    'medium', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000541', '00000000-0000-0000-0000-000000000001',
    'Asansör bakım ve onarımı yapan teknik personel mesleki yeterlilik belgesine (veya ustalık belgesine) sahip mi?', 6, '00000000-0000-0000-0000-000000000236',
    'Teknik bakım ve onarım personeli gerekli ustalık belgesine veya mesleki yeterlilik belgesine sahip değil.',
    'Personelin ilgili meslek standardında mesleki yeterlilik belgesi almasının sağlanması.',
    'high', true, false, true
  ),
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000541', '00000000-0000-0000-0000-000000000001',
    'Asansörün yıllık periyodik kontrolü yaptırılmış mı? Kontrol etiketi asansör üzerinde asılı mı?', 7, '00000000-0000-0000-0000-000000000237',
    'Asansörün yıllık periyodik kontrolü yaptırılmamış veya kontrol etiketi asansör üzerinde bulunmuyor.',
    'A tipi muayene kuruluşuna yıllık periyodik kontrolün yaptırılması.',
    'critical', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000541', '00000000-0000-0000-0000-000000000001',
    'Periyodik kontrol sonucuna göre asansöre iliştirilen bilgi etiketinin rengi (yeşil/mavi/sarı/kırmızı) nedir, buna göre gerekli önlemler alınmış mı?', 8, '00000000-0000-0000-0000-000000000238',
    'Sarı/kırmızı etiketli (kusurlu/güvensiz) asansörde öngörülen sürede uygunsuzluklar giderilmemiş.',
    'Etiket rengine göre öngörülen sürede uygunsuzlukların giderilmesi ve takip kontrolünün yaptırılması.',
    'high', true, true, false
  ),
  -- Tehlikeli Maddeler
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000542', '00000000-0000-0000-0000-000000000001',
    'İşyerinde asbest içeren lifli silikat malzemelerle (aktinolit, antofilit, grünerit/amosit, krizotil, krosidolit, tremolit) çalışma yapılıyor mu? Yapılıyorsa ilgili yönetmelik hükümleri uygulanıyor mu?', 1, '00000000-0000-0000-0000-000000000239',
    'Asbest içeren malzemelerle çalışılıyor ancak Asbestle Çalışmalarda Sağlık ve Güvenlik Önlemleri Hakkında Yönetmelik hükümleri uygulanmıyor.',
    'Asbest söküm/bakım/uzaklaştırma çalışmalarının yönetmeliğe uygun (eğitimli personel, ölçüm, sınır değerler) yürütülmesinin sağlanması.',
    'critical', true, false, false
  );
