-- "Masa Başı Evraksal Denetim" ve "Saha Denetimi - Fabrika/Şantiye"
-- şablonlarına 6331 sayılı İş Sağlığı ve Güvenliği Kanunu'na dayalı ilk
-- gerçek kontrol maddeleri eklenir (kullanıcının sağladığı "isg kanunu.docx"
-- kaynaklı). Madde metinleri mevzuat.gov.tr'den birebir alınmıştır.
--
-- Not: Kaynak dokümanda "Madde 8" olarak işaretlenen madde ("tehlike
-- sınıfına göre iş güvenliği uzmanı/işyeri hekimi/diğer sağlık personeli
-- görevlendirilmesi") gerçekte 6331 sayılı Kanun'un Madde 6'sına aittir
-- (zaten seed.sql'de mevcut) — Madde 8 farklı bir konudur (işyeri
-- hekimi/iş güvenliği uzmanının hak ve bağımsızlığı). Bu madde doğru
-- referansla (Madde 6, id 203) bağlanmıştır.

-- ============================================================
-- Yeni mevzuat maddeleri (6331 sayılı Kanun, regulation_id = ...101)
-- ============================================================

insert into public.regulation_versions
  (id, regulation_id, organization_id, version_no, madde_no, madde_basligi, madde_metni, kaynak_url, yururluk_tarihi)
values
  (
    '00000000-0000-0000-0000-000000000207',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    1, '14', 'İş kazası ve meslek hastalıklarının kayıt ve bildirimi',
    'MADDE 14 – (1) İşveren; a) Bütün iş kazalarının ve meslek hastalıklarının kaydını tutar, gerekli incelemeleri yaparak bunlar ile ilgili raporları düzenler. b) İşyerinde meydana gelen ancak yaralanma veya ölüme neden olmadığı halde işyeri ya da iş ekipmanının zarara uğramasına yol açan veya çalışan, işyeri ya da iş ekipmanını zarara uğratma potansiyeli olan olayları inceleyerek bunlar ile ilgili raporları düzenler. (2) İşveren, aşağıdaki hallerde belirtilen sürede Sosyal Güvenlik Kurumuna bildirimde bulunur: a) İş kazalarını kazadan sonraki üç iş günü içinde. b) Sağlık hizmeti sunucuları veya işyeri hekimi tarafından kendisine bildirilen meslek hastalıklarını, öğrendiği tarihten itibaren üç iş günü içinde. (3) İşyeri hekimi veya sağlık hizmeti sunucuları; meslek hastalığı ön tanısı koydukları vakaları, Sosyal Güvenlik Kurumu tarafından yetkilendirilen sağlık hizmeti sunucularına sevk eder. (4) Sağlık hizmeti sunucuları kendilerine intikal eden iş kazalarını, yetkilendirilen sağlık hizmeti sunucuları ise meslek hastalığı tanısı koydukları vakaları en geç on gün içinde Sosyal Güvenlik Kurumuna bildirir. (5) Bu maddenin uygulanmasına ilişkin usul ve esaslar, Sağlık Bakanlığının uygun görüşü alınarak Bakanlıkça belirlenir.',
    'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf', '2012-06-30'
  ),
  (
    '00000000-0000-0000-0000-000000000208',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    1, '15', 'Sağlık gözetimi',
    'MADDE 15 – (1) İşveren; a) Çalışanların işyerinde maruz kalacakları sağlık ve güvenlik risklerini dikkate alarak sağlık gözetimine tabi tutulmalarını sağlar. b) Aşağıdaki hallerde çalışanların sağlık muayenelerinin yapılmasını sağlamak zorundadır: 1) İşe girişlerinde. 2) İş değişikliğinde. 3) İş kazası, meslek hastalığı veya sağlık nedeniyle tekrarlanan işten uzaklaşmalarından sonra işe dönüşlerinde talep etmeleri hâlinde. 4) İşin devamı süresince, çalışanın ve işin niteliği ile işyerinin tehlike sınıfına göre Bakanlıkça belirlenen düzenli aralıklarla. (2) Tehlikeli ve çok tehlikeli sınıfta yer alan işlerde çalışacaklar, yapacakları işe uygun olduklarını belirten sağlık raporu olmadan işe başlatılamaz. (3) Bu Kanun kapsamında alınması gereken sağlık raporları işyeri hekiminden alınır. 50''den az çalışanı bulunan ve az tehlikeli işyerleri için ise ÇASMER''lerden, aile hekimlerinden veya diğer kamu sağlık hizmeti sunucularından da alınabilir. Raporlara itirazlar Sağlık Bakanlığı tarafından belirlenen hakem hastanelere yapılır, verilen kararlar kesindir. (4) Sağlık gözetiminden doğan maliyet ve bu gözetimden kaynaklı her türlü ek maliyet işverence karşılanır, çalışana yansıtılamaz. (5) Sağlık muayenesi yaptırılan çalışanın özel hayatı ve itibarının korunması açısından sağlık bilgileri gizli tutulur.',
    'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf', '2012-06-30'
  ),
  (
    '00000000-0000-0000-0000-000000000209',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    1, '17', 'Çalışanların eğitimi',
    'MADDE 17 – (1) İşveren, çalışanların iş sağlığı ve güvenliği eğitimlerini almasını sağlar. Bu eğitim özellikle; işe başlamadan önce, çalışma yeri veya iş değişikliğinde, iş ekipmanının değişmesi hâlinde veya yeni teknoloji uygulanması hâlinde verilir. Eğitimler, değişen ve ortaya çıkan yeni risklere uygun olarak yenilenir, gerektiğinde ve düzenli aralıklarla tekrarlanır. (2) Çalışan temsilcileri özel olarak eğitilir. (3) Mesleki eğitim alma zorunluluğu bulunan tehlikeli ve çok tehlikeli sınıfta yer alan işlerde, yapacağı işle ilgili mesleki eğitim aldığını belgeleyemeyenler çalıştırılamaz. (4) İş kazası geçiren veya meslek hastalığına yakalanan çalışana işe başlamadan önce, söz konusu kazanın veya meslek hastalığının sebepleri, korunma yolları ve güvenli çalışma yöntemleri ile ilgili ilave eğitim verilir. Ayrıca, herhangi bir sebeple altı aydan fazla süreyle işten uzak kalanlara, tekrar işe başlatılmadan önce bilgi yenileme eğitimi verilir. (5) Tehlikeli ve çok tehlikeli sınıfta yer alan işyerlerinde; yapılacak işlerde karşılaşılacak sağlık ve güvenlik riskleri ile ilgili yeterli bilgi ve talimatları içeren eğitimin alındığına dair belge olmaksızın, başka işyerlerinden çalışmak üzere gelen çalışanlar işe başlatılamaz. (6) Geçici iş ilişkisi kurulan işveren, iş sağlığı ve güvenliği risklerine karşı çalışana gerekli eğitimin verilmesini sağlar. (7) Bu madde kapsamında verilecek eğitimin maliyeti çalışanlara yansıtılamaz. Eğitimlerde geçen süre çalışma süresinden sayılır. Eğitim sürelerinin haftalık çalışma süresinin üzerinde olması hâlinde, bu süreler fazla sürelerle çalışma veya fazla çalışma olarak değerlendirilir.',
    'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf', '2012-06-30'
  ),
  (
    '00000000-0000-0000-0000-000000000210',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    1, '20', 'Çalışan temsilcisi',
    'MADDE 20 – (1) İşveren; işyerinin değişik bölümlerindeki riskler ve çalışan sayılarını göz önünde bulundurarak dengeli dağılıma özen göstermek kaydıyla, çalışanlar arasında yapılacak seçim veya seçimle belirlenemediği durumda atama yoluyla, aşağıda belirtilen sayılarda çalışan temsilcisini görevlendirir: a) İki ile elli arasında çalışanı bulunan işyerlerinde bir. b) Ellibir ile yüz arasında çalışanı bulunan işyerlerinde iki. c) Yüzbir ile beşyüz arasında çalışanı bulunan işyerlerinde üç. ç) Beşyüzbir ile bin arasında çalışanı bulunan işyerlerinde dört. d) Binbir ile ikibin arasında çalışanı bulunan işyerlerinde beş. e) İkibinbir ve üzeri çalışanı bulunan işyerlerinde altı. (2) Birden fazla çalışan temsilcisinin bulunması durumunda baş temsilci, çalışan temsilcileri arasında yapılacak seçimle belirlenir. (3) Çalışan temsilcileri, tehlike kaynağının yok edilmesi veya tehlikeden kaynaklanan riskin azaltılması için, işverene öneride bulunma ve işverenden gerekli tedbirlerin alınmasını isteme hakkına sahiptir. (4) Görevlerini yürütmeleri nedeniyle, çalışan temsilcileri ve destek elemanlarının hakları kısıtlanamaz ve görevlerini yerine getirebilmeleri için işveren tarafından gerekli imkânlar sağlanır. (5) İşyerinde yetkili sendika bulunması hâlinde, işyeri sendika temsilcileri çalışan temsilcisi olarak da görev yapar.',
    'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf', '2012-06-30'
  ),
  (
    '00000000-0000-0000-0000-000000000213',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    1, '22', 'İş sağlığı ve güvenliği kurulu',
    'MADDE 22 – (1) Elli ve daha fazla çalışanın bulunduğu ve altı aydan fazla süren sürekli işlerin yapıldığı işyerlerinde işveren, iş sağlığı ve güvenliği ile ilgili çalışmalarda bulunmak üzere kurul oluşturur. İşveren, iş sağlığı ve güvenliği mevzuatına uygun kurul kararlarını uygular. (2) Altı aydan fazla süren asıl işveren-alt işveren ilişkisinin bulunduğu hallerde; a) Asıl işveren ve alt işveren tarafından ayrı ayrı kurul oluşturulmuş ise, faaliyetlerin yürütülmesi ve kararların uygulanması konusunda iş birliği ve koordinasyon asıl işverence sağlanır. b) Asıl işveren tarafından kurul oluşturulmuş ise, kurul oluşturması gerekmeyen alt işveren, koordinasyonu sağlamak üzere vekâleten yetkili bir temsilci atar. c) İşyerinde kurul oluşturması gerekmeyen asıl işveren, alt işverenin oluşturduğu kurula iş birliği ve koordinasyonu sağlamak üzere vekâleten yetkili bir temsilci atar. ç) Kurul oluşturması gerekmeyen asıl işveren ve alt işverenin toplam çalışan sayısı elliden fazla ise, koordinasyonu asıl işverence yapılmak kaydıyla, asıl işveren ve alt işveren tarafından birlikte bir kurul oluşturulur. (3) Aynı çalışma alanında birden fazla işverenin bulunması ve bu işverenlerce birden fazla kurulun oluşturulması hâlinde işverenler, birbirlerinin çalışmalarını etkileyebilecek kurul kararları hakkında diğer işverenleri bilgilendirir.',
    'https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6331.pdf', '2012-06-30'
  );

-- ============================================================
-- Masa Başı Evraksal Denetim (version 511) — yeni kategoriler
-- ============================================================

insert into public.checklist_categories (id, checklist_template_version_id, organization_id, ad, sira_no)
values
  ('00000000-0000-0000-0000-000000000530', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'Risk Değerlendirmesi', 2),
  ('00000000-0000-0000-0000-000000000531', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'İSG Uzmanı ve İşyeri Hekimi', 3),
  ('00000000-0000-0000-0000-000000000532', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'Acil Durum ve Yangın Güvenliği', 4),
  ('00000000-0000-0000-0000-000000000533', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'Kayıt ve Bildirim', 5),
  ('00000000-0000-0000-0000-000000000534', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'Sağlık Gözetimi', 6),
  ('00000000-0000-0000-0000-000000000535', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'Eğitim', 7),
  ('00000000-0000-0000-0000-000000000536', '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000001', 'Çalışan Temsilciliği ve Kurul', 8);

insert into public.checklist_categories (id, checklist_template_version_id, organization_id, ad, sira_no)
values
  ('00000000-0000-0000-0000-000000000537', '00000000-0000-0000-0000-000000000513', '00000000-0000-0000-0000-000000000001', 'Acil Durum', 2),
  ('00000000-0000-0000-0000-000000000538', '00000000-0000-0000-0000-000000000514', '00000000-0000-0000-0000-000000000001', 'Acil Durum', 2);

-- ============================================================
-- Kontrol maddeleri
-- ============================================================

insert into public.checklist_items
  (checklist_template_version_id, checklist_category_id, organization_id, soru, sira_no, regulation_version_id,
   standart_uygunsuzluk_aciklamasi, onerilen_duzeltici_faaliyet, varsayilan_risk_seviyesi, zorunlu, fotograf_gerekli, is_certification_opportunity)
values
  -- Risk Değerlendirmesi
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000530', '00000000-0000-0000-0000-000000000001',
    'Risk değerlendirmesi yapılmış mı?', 1, '00000000-0000-0000-0000-000000000205',
    'Yazılı bir risk değerlendirmesi yapılmamış veya yaptırılmamış.',
    'İşveren tarafından risk değerlendirmesinin yapılması veya yetkili bir kişi/kuruluşa yaptırılması.',
    'high', true, false, false
  ),
  -- İSG Uzmanı ve İşyeri Hekimi (kaynak dokümanda "Madde 8" yazıyordu, gerçekte Madde 6)
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000531', '00000000-0000-0000-0000-000000000001',
    'Tehlike sınıfına göre iş güvenliği uzmanı, işyeri hekimi ve diğer sağlık personeli görevlendirilmiş mi?', 1, '00000000-0000-0000-0000-000000000203',
    'İşyerinin tehlike sınıfına uygun nitelik/sayıda iş güvenliği uzmanı, işyeri hekimi veya diğer sağlık personeli görevlendirilmemiş.',
    'Tehlike sınıfına uygun İSG uzmanı/işyeri hekimi/diğer sağlık personeli görevlendirmesinin tamamlanması.',
    'high', true, false, false
  ),
  -- Acil Durum ve Yangın Güvenliği
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000532', '00000000-0000-0000-0000-000000000001',
    'Acil durum planı hazırlanmış mı?', 1, '00000000-0000-0000-0000-000000000206',
    'Acil durum planı hazırlanmamış veya güncel değil.',
    'Acil durum planının hazırlanması/güncellenmesi.',
    'high', true, false, false
  ),
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000532', '00000000-0000-0000-0000-000000000001',
    'Yangınla mücadele ekibi, koruma ekibi, kurtarma ekibi ve ilkyardım ekibi gibi ekipler oluşturulup eğitim aldırılmış mı?', 2, '00000000-0000-0000-0000-000000000206',
    'Acil durum ekipleri oluşturulmamış veya ekip üyelerine eğitim aldırılmamış.',
    'Gerekli ekiplerin oluşturulup eğitim ve tatbikatlarının yaptırılması.',
    'critical', true, false, false
  ),
  -- Kayıt ve Bildirim
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000533', '00000000-0000-0000-0000-000000000001',
    'İşyerinde daha önce iş kazası olmuş mu? Olmuşsa kayıtlar dosyada bulunuyor mu?', 1, '00000000-0000-0000-0000-000000000207',
    'İş kazası/meslek hastalığı kayıtları tutulmamış veya dosyada bulunmuyor.',
    'İş kazası ve meslek hastalığı kayıtlarının eksiksiz tutulması ve dosyalanması.',
    'medium', true, false, false
  ),
  -- Sağlık Gözetimi
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000534', '00000000-0000-0000-0000-000000000001',
    'İşe girişlerde ve Bakanlıkça belirtilen düzenli aralıklarla sağlık gözetimi yapılıyor mu?', 1, '00000000-0000-0000-0000-000000000208',
    'İşe giriş veya periyodik sağlık muayeneleri yapılmamış/eksik.',
    'İşe giriş ve periyodik sağlık muayenelerinin işyeri hekimi tarafından yaptırılması.',
    'high', true, false, false
  ),
  -- Eğitim
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000535', '00000000-0000-0000-0000-000000000001',
    'Çalışanlara iş sağlığı ve güvenliği eğitimi mevzuata uygun saatlerde aldırılmış mı?', 1, '00000000-0000-0000-0000-000000000209',
    'Çalışanlara İSG eğitimi hiç verilmemiş veya mevzuatta öngörülen saatlerin altında kalmış.',
    'Eksik kalan çalışanlara mevzuata uygun sürede İSG eğitiminin tamamlanması.',
    'medium', true, false, false
  ),
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000535', '00000000-0000-0000-0000-000000000001',
    'Çalışan temsilcisine özel olarak eğitim verilmiş mi?', 2, '00000000-0000-0000-0000-000000000209',
    'Çalışan temsilcisine ayrıca/özel eğitim verilmemiş.',
    'Çalışan temsilcisine mevzuata uygun özel eğitimin verilmesi.',
    'medium', true, false, false
  ),
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000535', '00000000-0000-0000-0000-000000000001',
    'Mesleki eğitim alma zorunluluğu bulunan tehlikeli ve çok tehlikeli sınıfta yer alan işlerde çalışan işçilerin mesleki yeterlilik belgesi var mı?', 3, '00000000-0000-0000-0000-000000000209',
    'İlgili personel yapacağı işle ilgili mesleki eğitim aldığını belgeleyemiyor (mesleki yeterlilik belgesi bulunmuyor).',
    'Personelin ilgili meslek standardında mesleki yeterlilik belgesi almasının sağlanması.',
    'high', true, false, true
  ),
  -- Çalışan Temsilciliği ve Kurul
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000536', '00000000-0000-0000-0000-000000000001',
    'Kanunda belirtilen sayıya göre çalışan temsilcisi görevlendirilmiş mi?', 1, '00000000-0000-0000-0000-000000000210',
    'Çalışan sayısına göre kanunda öngörülen sayıda çalışan temsilcisi görevlendirilmemiş.',
    'Çalışan sayısına uygun sayıda çalışan temsilcisinin seçilmesi/atanması.',
    'medium', true, false, false
  ),
  (
    '00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000536', '00000000-0000-0000-0000-000000000001',
    'İşyeri 50 ve daha fazla çalışana sahipse iş sağlığı ve güvenliği kurulu oluşturulmuş mu?', 2, '00000000-0000-0000-0000-000000000213',
    '50 ve üzeri çalışanı olan işyerinde İSG kurulu oluşturulmamış.',
    'Mevzuata uygun İSG kurulunun oluşturulması ve düzenli toplanması.',
    'medium', true, false, false
  ),
  -- Saha Denetimi - Fabrika: Acil Durum
  (
    '00000000-0000-0000-0000-000000000513', '00000000-0000-0000-0000-000000000537', '00000000-0000-0000-0000-000000000001',
    'Acil durumda aranacak irtibat numaraları işyerinin belirli noktalarına asılmış mı?', 1, '00000000-0000-0000-0000-000000000206',
    'Acil durum irtibat numaraları işyerinde görünür şekilde asılmamış.',
    'İlk yardım, itfaiye, işyeri hekimi gibi acil irtibat numaralarının görünür noktalara asılması.',
    'medium', true, true, false
  ),
  -- Saha Denetimi - Şantiye: Acil Durum
  (
    '00000000-0000-0000-0000-000000000514', '00000000-0000-0000-0000-000000000538', '00000000-0000-0000-0000-000000000001',
    'Acil durumda aranacak irtibat numaraları işyerinin belirli noktalarına asılmış mı?', 1, '00000000-0000-0000-0000-000000000206',
    'Acil durum irtibat numaraları işyerinde görünür şekilde asılmamış.',
    'İlk yardım, itfaiye, işyeri hekimi gibi acil irtibat numaralarının görünür noktalara asılması.',
    'medium', true, true, false
  );

-- Placeholder maddeleri, artık gerçek içerik eklenen şablonlarda pasifleştirilir.
update public.checklist_items
set is_active = false
where soru = 'İçerik hazırlanıyor — bu kontrol listesi yakında MESMER tarafından doldurulacaktır.'
  and checklist_template_version_id in (
    '00000000-0000-0000-0000-000000000511',
    '00000000-0000-0000-0000-000000000513',
    '00000000-0000-0000-0000-000000000514'
  );
