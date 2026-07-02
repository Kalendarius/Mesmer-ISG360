-- Başlangıç verisi.
--
-- Mevzuat metinleri: Bu dosyadaki tüm kanun/yönetmelik madde metinleri
-- resmi kaynaktan (mevzuat.gov.tr) BİREBİR alınmıştır, uydurulmamıştır;
-- her regulation_versions satırında kaynak_url ile doğrulanabilir. Türk
-- kanun/yönetmelik metinleri 5846 sayılı FSEK m.2 gereği eser sayılmaz.
--
-- Kontrol listesi SORULARI ise bu denetim aracı için yazılmış özgün örnek
-- sorulardır (mevzuat metni değildir) — şablon adında "ÖRNEK ŞABLON" ile
-- açıkça işaretlenmiştir.
--
-- NOT: organization_members bir auth.users satırı gerektirir; bu seed
-- hiçbir sahte kullanıcı oluşturmaz. İlk organization_admin kullanıcısı
-- Teslim 3'te gerçek Supabase Auth signup ile oluşturulacak ve şu satırla
-- MESMER kuruluşuna bağlanacaktır:
--   insert into organization_members (organization_id, user_id, role)
--   values ('<mesmer-org-id>', '<yeni-kullanıcı-uuid>', 'organization_admin');

insert into public.organizations (id, legal_name, display_name, primary_color, secondary_color, accent_color, website, email)
values (
  '00000000-0000-0000-0000-000000000001',
  'MESMER Mesleki Yeterlilik Belgelendirme Merkezi A.Ş.',
  'MESMER MYM',
  '#054F90',
  '#FCB042',
  '#FCB042',
  null,
  null
);

-- ============================================================
-- MEVZUAT (gerçek, resmi kaynaktan)
-- ============================================================

insert into public.regulations (id, organization_id, mevzuat_adi, mevzuat_turu)
values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'İş Sağlığı ve Güvenliği Kanunu (6331 sayılı)', 'Kanun'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Kişisel Koruyucu Donanımların İşyerlerinde Kullanılması Hakkında Yönetmelik', 'Yönetmelik'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Mesleki Yeterlilik Kurumu Kanunu (5544 sayılı)', 'Kanun');

insert into public.regulation_versions
  (id, regulation_id, organization_id, version_no, madde_no, madde_basligi, madde_metni, kaynak_url, yururluk_tarihi)
values
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    1, '4', 'İşverenin genel yükümlülüğü',
    'MADDE 4 – (1) İşveren, çalışanların işle ilgili sağlık ve güvenliğini sağlamakla yükümlü olup bu çerçevede; a) Mesleki risklerin önlenmesi, eğitim ve bilgi verilmesi dâhil her türlü tedbirin alınması, organizasyonun yapılması, gerekli araç ve gereçlerin sağlanması, sağlık ve güvenlik tedbirlerinin değişen şartlara uygun hale getirilmesi ve mevcut durumun iyileştirilmesi için çalışmalar yapar. b) İşyerinde alınan iş sağlığı ve güvenliği tedbirlerine uyulup uyulmadığını izler, denetler ve uygunsuzlukların giderilmesini sağlar. c) Risk değerlendirmesi yapar veya yaptırır. ç) Çalışana görev verirken, çalışanın sağlık ve güvenlik yönünden işe uygunluğunu göz önüne alır. d) Yeterli bilgi ve talimat verilenler dışındaki çalışanların hayati ve özel tehlike bulunan yerlere girmemesi için gerekli tedbirleri alır. (2) İşyeri dışındaki uzman kişi ve kuruluşlardan hizmet alınması, işverenin sorumluluklarını ortadan kaldırmaz. (3) Çalışanların iş sağlığı ve güvenliği alanındaki yükümlülükleri, işverenin sorumluluklarını etkilemez. (4) İşveren, iş sağlığı ve güvenliği tedbirlerinin maliyetini çalışanlara yansıtamaz.',
    'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf', '2012-06-30'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    1, '5', 'Risklerden korunma ilkeleri',
    'MADDE 5 – (1) İşverenin yükümlülüklerinin yerine getirilmesinde aşağıdaki ilkeler göz önünde bulundurulur: a) Risklerden kaçınmak. b) Kaçınılması mümkün olmayan riskleri analiz etmek. c) Risklerle kaynağında mücadele etmek. ç) İşin kişilere uygun hale getirilmesi için işyerlerinin tasarımı ile iş ekipmanı, çalışma şekli ve üretim metotlarının seçiminde özen göstermek, özellikle tekdüze çalışma ve üretim temposunun sağlık ve güvenliğe olumsuz etkilerini önlemek, önlenemiyor ise en aza indirmek. d) Teknik gelişmelere uyum sağlamak. e) Tehlikeli olanı, tehlikesiz veya daha az tehlikeli olanla değiştirmek. f) Teknoloji, iş organizasyonu, çalışma şartları, sosyal ilişkiler ve çalışma ortamı ile ilgili faktörlerin etkilerini kapsayan tutarlı ve genel bir önleme politikası geliştirmek. g) Toplu korunma tedbirlerine, kişisel korunma tedbirlerine göre öncelik vermek. ğ) Çalışanlara uygun talimatlar vermek.',
    'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf', '2012-06-30'
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    1, '6', 'İş sağlığı ve güvenliği hizmetleri',
    'MADDE 6 – (1) Mesleki risklerin önlenmesi ve bu risklerden korunulmasına yönelik çalışmaları da kapsayacak, iş sağlığı ve güvenliği hizmetlerinin sunulması için işveren; a) Çalışanları arasından iş güvenliği uzmanı, işyeri hekimi ve on ve daha fazla çalışanı olan çok tehlikeli sınıfta yer alan işyerlerinde diğer sağlık personeli görevlendirir. Çalışanları arasında belirlenen niteliklere sahip personel bulunmaması hâlinde, bu hizmetin tamamını veya bir kısmını ortak sağlık ve güvenlik birimlerinden veya ÇASMER’lerden hizmet alarak yerine getirebilir. Ancak belirlenen niteliklere ve gerekli belgeye sahip olması hâlinde, tehlike sınıfı ve çalışan sayısı dikkate alınarak, bu hizmetin yerine getirilmesini kendisi üstlenebilir. b) Görevlendirdikleri kişi veya hizmet aldığı kurum ve kuruluşların görevlerini yerine getirmeleri amacıyla araç, gereç, mekân ve zaman gibi gerekli bütün ihtiyaçlarını karşılar. c) İşyerinde sağlık ve güvenlik hizmetlerini yürütenler arasında iş birliği ve koordinasyonu sağlar. ç) Görevlendirdikleri kişi veya hizmet aldığı kurum ve kuruluşlar tarafından iş sağlığı ve güvenliği ile ilgili mevzuata uygun olan ve yazılı olarak bildirilen tedbirleri yerine getirir. d) Çalışanların sağlık ve güvenliğini etkilediği bilinen veya etkilemesi muhtemel konular hakkında; görevlendirdikleri kişi veya hizmet aldığı kurum ve kuruluşları, başka işyerlerinden çalışmak üzere kendi işyerine gelen çalışanları ve bunların işverenlerini bilgilendirir.',
    'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf', '2012-06-30'
  ),
  (
    '00000000-0000-0000-0000-000000000204',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    1, '9', 'Tehlike sınıfının belirlenmesi',
    'MADDE 9 – (1) İşyeri tehlike sınıfları; 31/5/2006 tarihli ve 5510 sayılı Sosyal Sigortalar ve Genel Sağlık Sigortası Kanununun 83 üncü maddesine göre belirlenen kısa vadeli sigorta kolları prim tarifesi de dikkate alınarak, İş Sağlığı ve Güvenliği Genel Müdürünün Başkanlığında ilgili taraflarca oluşturulan komisyonun görüşleri doğrultusunda, Bakanlıkça çıkarılacak tebliğ ile tespit edilir. (2) İşyeri tehlike sınıflarının tespitinde, o işyerinde yapılan asıl iş dikkate alınır.',
    'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf', '2012-06-30'
  ),
  (
    '00000000-0000-0000-0000-000000000205',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    1, '10', 'Risk değerlendirmesi, kontrol, ölçüm ve araştırma',
    'MADDE 10 – (1) İşveren, iş sağlığı ve güvenliği yönünden risk değerlendirmesi yapmak veya yaptırmakla yükümlüdür. Risk değerlendirmesi yapılırken aşağıdaki hususlar dikkate alınır: a) Belirli risklerden etkilenecek çalışanların durumu. b) Kullanılacak iş ekipmanı ile kimyasal madde ve müstahzarların seçimi. c) İşyerinin tertip ve düzeni. ç) Genç, yaşlı, engelli, gebe veya emziren çalışanlar gibi özel politika gerektiren gruplar ile kadın çalışanların durumu. (2) İşveren, yapılacak risk değerlendirmesi sonucu alınacak iş sağlığı ve güvenliği tedbirleri ile kullanılması gereken koruyucu donanım veya ekipmanı belirler. (3) İşyerinde uygulanacak iş sağlığı ve güvenliği tedbirleri, çalışma şekilleri ve üretim yöntemleri; çalışanların sağlık ve güvenlik yönünden korunma düzeyini yükseltecek ve işyerinin idari yapılanmasının her kademesinde uygulanabilir nitelikte olmalıdır. (4) İşveren, iş sağlığı ve güvenliği yönünden çalışma ortamına ve çalışanların bu ortamda maruz kaldığı risklerin belirlenmesine yönelik gerekli kontrol, ölçüm, inceleme ve araştırmaların yapılmasını sağlar.',
    'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf', '2012-06-30'
  ),
  (
    '00000000-0000-0000-0000-000000000206',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    1, '11', 'Acil durum planları, yangınla mücadele ve ilk yardım',
    'MADDE 11 – (1) İşveren; a) Çalışma ortamı, kullanılan maddeler, iş ekipmanı ile çevre şartlarını dikkate alarak meydana gelebilecek acil durumları önceden değerlendirerek, çalışanları ve çalışma çevresini etkilemesi mümkün ve muhtemel acil durumları belirler ve bunların olumsuz etkilerini önleyici ve sınırlandırıcı tedbirleri alır. b) Acil durumların olumsuz etkilerinden korunmak üzere gerekli ölçüm ve değerlendirmeleri yapar, acil durum planlarını hazırlar. c) Acil durumlarla mücadele için işyerinin büyüklüğü ve taşıdığı özel tehlikeler, yapılan işin niteliği, çalışan sayısı ile işyerinde bulunan diğer kişileri dikkate alarak; önleme, koruma, tahliye, yangınla mücadele, ilk yardım ve benzeri konularda uygun donanıma sahip ve bu konularda eğitimli yeterli sayıda kişiyi görevlendirir, araç ve gereçleri sağlayarak eğitim ve tatbikatları yaptırır ve ekiplerin her zaman hazır bulunmalarını sağlar. ç) Özellikle ilk yardım, acil tıbbi müdahale, kurtarma ve yangınla mücadele konularında, işyeri dışındaki kuruluşlarla irtibatı sağlayacak gerekli düzenlemeleri yapar.',
    'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf', '2012-06-30'
  ),
  (
    '00000000-0000-0000-0000-000000000211',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    1, '5', 'Genel kural',
    'MADDE 5 – (1) Kişisel koruyucu donanım, risklerin, toplu korunmayı sağlayacak teknik önlemlerle veya iş organizasyonu ve çalışma yöntemleriyle önlenemediği, tam olarak sınırlandırılamadığı durumlarda kullanılır. Kişisel koruyucu donanım, iş kazası ya da meslek hastalığının önlenmesi, çalışanların sağlık ve güvenlik risklerinden korunması, sağlık ve güvenlik koşullarının iyileştirilmesi amacıyla kullanılır. İşveren, toplu korunma tedbirlerine, kişisel korunma tedbirlerine göre öncelik verir.',
    'https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/7.5.18540.pdf', '2013-07-02'
  ),
  (
    '00000000-0000-0000-0000-000000000212',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    1, '6', 'Genel hükümler',
    'MADDE 6 – (1) Kişisel koruyucu donanımların işyerlerinde kullanımı ile ilgili olarak aşağıdaki hususlara uyulur; a) İşyerinde kullanılan kişisel koruyucu donanım, Kişisel Koruyucu Donanım Yönetmeliği hükümlerine uygun olarak tasarlanır ve üretilir. Tüm kişisel koruyucu donanımlar; 1) Kendisi ek risk oluşturmadan ilgili riski önlemeye uygun olur. 2) İşyerinde var olan koşullara uygun olur. 3) Kullananın ergonomik gereksinimlerine ve sağlık durumuna uygun olur. 4) Gerekli ayarlamalar yapıldığında kullanana tam uyar. 5) Kişisel Koruyucu Donanım Yönetmeliği kapsamına giren ürünlerde uygun şekilde CE işareti ve Türkçe kullanım kılavuzu bulundurur. b) Birden fazla riskin bulunduğu ve çalışanın bu risklere karşı aynı anda birden fazla kişisel koruyucu donanımı kullanmasını gerektiren durumlarda, bir arada kullanılmaya uygun olan ve bir arada kullanıldığında söz konusu risklere karşı koruyuculuğu etkilenmeyen kişisel koruyucu donanımlar seçilir. c) Kişisel koruyucu donanımların kullanım şartları ve özellikle kullanılma süreleri; riskin derecesi, maruziyet sıklığı, her bir çalışanın iş yaptığı yerin özellikleri ve kişisel koruyucu donanımın performansı dikkate alınarak belirlenir. ç) Tek kişi tarafından kullanılması esas olan kişisel koruyucu donanımların, zorunlu hallerde birden fazla kişi tarafından kullanılmasını gerektiren durumlarda, bu kullanımdan dolayı sağlık ve hijyen problemi doğmaması için her türlü önlem alınır. d) İşyerinde, her bir kişisel koruyucu donanım için, bu maddenin (a) ve (b) bentlerinde belirtilen hususlarla ilgili yeterli bilgi bulunur ve bu bilgilere kolayca ulaşılabilir. e) Kişisel koruyucu donanımlar, işveren tarafından ücretsiz verilir, imalatçı tarafından sağlanacak kullanım kılavuzuna uygun olarak bakım, onarım ve periyodik kontrolleri yapılır, ihtiyaç duyulan parçaları değiştirilir, hijyenik şartlarda muhafaza edilir ve kullanıma hazır bulundurulur. f) İşveren, kişisel koruyucu donanımları hangi risklere karşı kullanacağı konusunda çalışanı bilgilendirir. g) İşveren, kişisel koruyucu donanımların kullanımı konusunda uygulamalı olarak eğitim verilmesini sağlar. ğ) Kişisel koruyucu donanımlar, istisnai ve özel koşullar hariç, sadece amacına uygun olarak kullanılır. h) Kişisel koruyucu donanımlar çalışanların kolayca erişebilecekleri yerlerde ve yeterli miktarlarda bulundurulur. (2) Kişisel koruyucu donanımlar talimatlara uygun olarak kullanılır, bakımı ve temizliği yapılır. Talimatlar çalışanlar tarafından anlaşılır olmak zorundadır.',
    'https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/7.5.18540.pdf', '2013-07-02'
  ),
  (
    '00000000-0000-0000-0000-000000000221',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000001',
    1, 'Ek Madde 1', 'Mesleki yeterlilik belgesi zorunluluğu',
    'EK MADDE 1 – (1) Tehlikeli ve çok tehlikeli işlerden olup, Kurumca standardı yayımlanan ve Bakanlıkça çıkarılacak tebliğlerde belirtilen mesleklerde, tebliğin yayım tarihinden itibaren on iki ay sonra bu Kanunda düzenlenen esaslara göre meslekî yeterlilik belgesine sahip olmayan kişiler çalıştırılamaz. 5/6/1986 tarihli ve 3308 sayılı Mesleki Eğitim Kanununa göre ustalık belgesi almış olanlar ile Millî Eğitim Bakanlığına bağlı meslekî ve teknik eğitim okullarından ve üniversitelerin meslekî ve teknik eğitim veren okul ve bölümlerinden mezun olup, diplomalarında veya ustalık belgelerinde belirtilen bölüm, alan ve dallarda çalıştırılanlar için meslekî yeterlilik belgesi şartı aranmaz. (2) Millî Savunma Bakanlığı ve İçişleri Bakanlığı bağlılarında görevli yükümlü erbaş ve erler ile yurt içi ve yurt dışındaki harekâtlarda görevli uzman erbaş, sözleşmeli erbaş ve erler için birinci fıkradaki meslekî yeterlilik belgesi şartı aranmaz. (3) Bakanlıklar ile kamu kurum ve kuruluşlarının görev alanlarını ilgilendiren mevzuatta bu maddede belirtilen hususlara ilişkin gerekli düzenlemeler bu maddenin yürürlüğe girdiği tarihten itibaren on iki ay içinde yapılır. (4) Birinci fıkraya ilişkin denetimler iş müfettişlerince yapılır. Birinci fıkrada belirtilen hükümlere aykırı davranan işveren veya işveren vekillerine Çalışma ve İş Kurumu il müdürü tarafından her bir çalışan için beş yüz Türk lirası idari para cezası verilir. Bu Kanuna göre verilen idari para cezaları tebliğinden itibaren bir ay içinde ödenir.',
    'https://www.mevzuat.gov.tr/MevzuatMetin/1.5.5544.pdf', '2015-04-04'
  );

-- ============================================================
-- ÖRNEK KONTROL LİSTESİ ŞABLONU (sorular özgündür, mevzuat değildir)
-- ============================================================

insert into public.checklist_templates (id, organization_id, ad, sektor, faaliyet_konusu, denetim_turu)
values (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000001',
  'Genel İSG Denetimi (ÖRNEK ŞABLON)',
  'Genel',
  'Tüm sektörler',
  'periyodik'
);

insert into public.checklist_template_versions (id, checklist_template_id, organization_id, version_no, notes)
values (
  '00000000-0000-0000-0000-000000000302',
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000001',
  1,
  'İlk sürüm — örnek/başlangıç şablonu.'
);

insert into public.checklist_categories (id, checklist_template_version_id, organization_id, ad, sira_no)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'Genel İSG', 1),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'Risk Değerlendirmesi', 2),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'Kişisel Koruyucu Donanım', 3),
  ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'Acil Durum ve Yangın Güvenliği', 4),
  ('00000000-0000-0000-0000-000000000405', '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'Personel Belgelendirme', 5);

insert into public.checklist_items
  (checklist_template_version_id, checklist_category_id, organization_id, soru, sira_no, regulation_version_id,
   standart_uygunsuzluk_aciklamasi, onerilen_duzeltici_faaliyet, varsayilan_risk_seviyesi, zorunlu, fotograf_gerekli, is_certification_opportunity)
values
  (
    '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001',
    'İşyerinde tehlike sınıfına uygun sayı ve nitelikte iş güvenliği uzmanı ve/veya işyeri hekimi görevlendirilmiş mi?', 1,
    '00000000-0000-0000-0000-000000000203',
    'İş güvenliği uzmanı/işyeri hekimi görevlendirmesi eksik veya tehlike sınıfına uygun değil.',
    'İşyerinin tehlike sınıfına uygun nitelikte İSG uzmanı/işyeri hekimi görevlendirmesinin tamamlanması.',
    'high', true, false, false
  ),
  (
    '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001',
    'İşyerinin tehlike sınıfı doğru tespit edilmiş ve buna uygun idari/teknik önlemler alınmış mı?', 2,
    '00000000-0000-0000-0000-000000000204',
    'Tehlike sınıfı tespiti veya buna bağlı önlemler eksik.',
    'Tehlike sınıfının SGK/NACE kaydına göre doğrulanması ve gerekli önlemlerin gözden geçirilmesi.',
    'medium', true, false, false
  ),
  (
    '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001',
    'Yazılı bir risk değerlendirmesi raporu mevcut ve güncel mi?', 1,
    '00000000-0000-0000-0000-000000000205',
    'Risk değerlendirmesi raporu bulunmuyor, güncel değil veya mevzuatta sayılan hususları kapsamıyor.',
    'Risk değerlendirmesinin ilgili ekiple güncellenerek yazılı hale getirilmesi.',
    'high', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001',
    'İşveren, risklerden korunma ilkelerine (kaynağında mücadele, toplu korumaya öncelik vb.) uygun tedbirler almış mı?', 2,
    '00000000-0000-0000-0000-000000000202',
    'Risklerden korunma ilkelerine aykırı, yalnızca kişisel tedbirlerle sınırlı bir yaklaşım mevcut.',
    'Toplu koruma tedbirlerinin önceliklendirildiği bir önleme politikasının oluşturulması.',
    'medium', true, false, false
  ),
  (
    '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000001',
    'Çalışanlara işin gerektirdiği kişisel koruyucu donanımlar ücretsiz olarak sağlanmış mı?', 1,
    '00000000-0000-0000-0000-000000000211',
    'KKD sağlanmamış, eksik veya çalışana ücret karşılığı temin ettirilmiş.',
    'Eksik KKD envanterinin tamamlanarak ücretsiz dağıtımının sağlanması.',
    'high', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000001',
    'Kullanılan KKD''ler CE işaretli ve Türkçe kullanım kılavuzuna sahip mi?', 2,
    '00000000-0000-0000-0000-000000000212',
    'KKD üzerinde CE işareti bulunmuyor veya Türkçe kullanım kılavuzu eksik.',
    'Standarda uygun, CE işaretli KKD tedarikine geçilmesi.',
    'medium', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000001',
    'İşyerinde acil durum planı hazırlanmış ve periyodik tatbikatlar yapılıyor mu?', 1,
    '00000000-0000-0000-0000-000000000206',
    'Acil durum planı yok, güncel değil veya tatbikat kaydı bulunmuyor.',
    'Acil durum planının hazırlanması/güncellenmesi ve yıllık tatbikat takviminin oluşturulması.',
    'high', true, false, false
  ),
  (
    '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000001',
    'Yangınla mücadele için yeterli sayıda eğitimli personel ve donanım (yangın söndürme cihazı, hidrant vb.) bulunuyor mu?', 2,
    '00000000-0000-0000-0000-000000000206',
    'Yangın söndürme donanımı eksik/bakımsız veya eğitimli ekip bulunmuyor.',
    'Yangın söndürme cihazlarının periyodik bakımının yaptırılması ve yangın ekibi eğitiminin tamamlanması.',
    'critical', true, true, false
  ),
  (
    '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000405', '00000000-0000-0000-0000-000000000001',
    'Tehlikeli/çok tehlikeli sınıfta yer alan ve ilgili tebliğde belirtilen mesleklerde çalışan personelin geçerli bir Mesleki Yeterlilik Belgesi (veya muafiyet kapsamında ustalık belgesi/diploması) bulunuyor mu?', 1,
    '00000000-0000-0000-0000-000000000221',
    'İlgili personelin geçerli MYK Mesleki Yeterlilik Belgesi veya muafiyet kapsamında sayılan ustalık belgesi/diploması bulunmamaktadır.',
    'Personelin ilgili meslek standardında MYK Mesleki Yeterlilik Belgesi almasının sağlanması.',
    'high', true, false, true
  );
