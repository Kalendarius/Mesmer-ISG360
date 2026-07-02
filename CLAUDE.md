# MESMER İSG360 — Proje Rehberi

Bu dosya, bu depoda çalışan gelecekteki Claude Code oturumları içindir.

## Ne inşa ediliyor

Çok kiracılı, mobil öncelikli **İSG Denetim ve Uygunsuzluk Takip Sistemi**. İSG uzmanları işletme/şube kaydeder, kontrol listesi ile denetim yapar, fotoğraflı uygunsuzluk açar, PDF rapor üretir ve işletme yetkilisine e-posta gönderir. Uygulamanın tamamı Türkçe arayüzlüdür, tarih formatı **GG.AA.YYYY**, saat dilimi **Europe/Istanbul**'dur.

**Kritik ürün çerçevesi notu (2026-07-02'de netleşti):** Bu, MESMER'in yalnızca kendi iç denetçilerinin kullandığı bir araç **değildir** — MESMER'in bağımsız çalışan **tüm İSG uzmanlarına/OSGB'lere dağıtacağı** bir üründür. Her kayıt olan kullanıcı `/kayit` üzerinden kendi izole kuruluşunu oluşturur (bkz. "Herkese açık kayıt" bölümü). İlk 12 teslimlik plan (aşağıdaki modül listesi) "MESMER'in kendi aracı" varsayımıyla yazıldı ama veri modeli zaten çok kiracılı olduğundan bu varsayım hiçbir şemayı bozmadı — yalnızca kayıt/onboarding akışı sonradan eklendi.

Ayrıntılı mimari plan ve veri modeli: `C:\Users\utkuk\.claude\plans\serialized-humming-oasis.md` (onaylanmış plan — büyük mimari kararlar için önce buraya bakılmalı, sonra kod; ürün çerçevesi hâlâ "MESMER'in kendi aracı" varsayımıyla yazılmıştır, yukarıdaki nota göre okunmalı).

## Teknoloji

Next.js (App Router, TS) · Tailwind CSS v4 (CSS-first `@theme`, `tailwind.config.ts` yok) · shadcn/ui (base-nova preset, `@base-ui/react`) · Supabase (Postgres, Auth, Storage, RLS) · Zod · React Hook Form · @react-pdf/renderer · Resend · Vitest · Playwright.

## Kritik mimari kurallar (asla ihlal edilmez)

1. Her tabloda `organization_id` — sistem çok kiracılıdır.
2. Her tabloda uygun RLS politikaları vardır; `SUPABASE_SERVICE_ROLE_KEY` **yalnızca** `src/lib/supabase/admin.ts` üzerinden, yalnızca route handler içinde kullanılır — client'a asla sızmaz.
3. Fotoğraflar ve PDF raporlar **private** Supabase Storage bucket'larında tutulur; erişim yalnızca signed URL veya yetkilendirilmiş route handler ile sağlanır.
4. E-posta gönderimi yalnızca sunucu tarafında (`route.ts` içinde, Resend SDK ile) yapılır.
5. Önemli işlemler (denetim tamamlama, uygunsuzluk kapatma, rapor üretimi, e-posta gönderimi) `audit_logs` tablosuna yazılır.
6. Soft delete: ilgili tablolarda `deleted_at`; kayıt kalıcı silinmez.
7. Bir denetime ait `inspection_responses` satırında soru metni ve mevzuat metni **snapshot** olarak saklanır (`soru_snapshot`, `regulation_metin_snapshot`) — kontrol listesi/mevzuat sonradan değişse bile eski denetim raporu değişmez.
8. Rapor üretildikten sonra `report_snapshots.snapshot_json` değiştirilemez; yeniden üretmek yeni bir `reports` satırı oluşturur.
9. Sahte/yarım bırakılmış buton veya sessizce hata yutan kod yok — bir ekran/route bağlı değilse oluşturulmaz.

## Kullanıcının verdiği çalışma kısıtları (2026-07-01)

- Yalnızca bu proje klasörü içinde işlem yapılır.
- `.env` dosyalarındaki gizli değerler asla ekrana yazdırılmaz.
- Veritabanı silinmez/sıfırlanmaz (`supabase db reset`, `DROP TABLE` vb. yasak) — hâlâ geçerli.
- `git push` yapılmaz — hâlâ geçerli (commit/remote ekleme serbest, push kullanıcı kendi terminalinden yapıyor).
- Önemli mimari değişikliklerden önce kullanıcıya sorulur — hâlâ geçerli.
- **"Production deployment yapılmaz" kısıtı 2026-07-02'de kullanıcı tarafından açıkça gevşetildi** ve uygulama gerçekten canlıya alındı — bkz. "Production ortamı" bölümü. Gizli değer (DB şifresi, API anahtarı) hiçbir zaman komut satırı argümanı veya dosya olarak Claude'un araçlarından geçirilmedi; production'a dokunan her adım ya kullanıcının kendi terminalinden/panelinden yapıldı ya da zaten kimliği doğrulanmış `supabase link` oturumu üzerinden (yeniden şifre istemeden) çalıştı.

## Production ortamı (2026-07-02'den itibaren canlı)

- **Supabase:** "Mesmer İSG360" projesi (`xerqpobhmzuyktmyhaai`, eu-west-1). Şema tamamen uygulandı (0001–0014), seed verisi (MESMER kuruluşu + gerçek mevzuat + örnek kontrol listesi) yüklendi. Proje yerel `supabase/.temp`'te linked durumda — `npx supabase migration list --linked` / `npx supabase db push --linked --dry-run` gibi salt-okunur veya zaten-uygulanmış komutlar şifre istemeden çalışır; yeni bir DB şifresi gerektiren işlem (ilk kez `--db-url` ile bağlanmak gibi) gerekirse kullanıcıya sorulmalı, Claude'un kendisi şifreyi asla komut satırında/dosyada tutmamalı.
- **Vercel:** GitHub reposu (`Kalendarius/Mesmer-ISG360`, kullanıcının hesabı) `mesmer-isg-360` Vercel projesine bağlı, her `master` push'unda otomatik deploy olur. Canlı adres: `https://isg360.mesmermym.com` (Wix'te kayıtlı `mesmermym.com` domain'inin alt alan adı, CNAME ile Vercel'e yönlendirilmiş).
- **Auth — HENÜZ TAMAMLANMADI:** Production'da hâlâ hiç kullanıcı yok. `info@mesmermym.com`/`orhun@mesmermym.com` için Supabase panelinden davet gönderme + `organization_members`'a `organization_admin` olarak bağlama adımı planlandı ama kullanıcı bunun yerine "herkese açık kayıt" özelliğini istediği için (bkz. üstteki ürün çerçevesi notu) **ertelendi/karara bağlanmadı**: bu iki hesap artık ya (a) mevcut, gerçek mevzuatla önceden doldurulmuş MESMER kuruluşuna eskisi gibi elle bağlanacak, ya da (b) herkes gibi `/kayit`'tan kendi kuruluşlarını oluşturacaklar. Bir sonraki oturumda bu netleştirilmeden admin bağlama işlemi yapılmamalı.
- **Herkese açık kayıt (`/kayit`) — production'da henüz test edilmedi**, yalnızca yerelde doğrulandı (bkz. "Herkese açık kayıt ve self-service kuruluş oluşturma" bölümü). Production'a deploy edildi (kod push'landı) ama gerçek bir üretim ortamı denemesi yapılmadı.
- Production'da `RESEND_API_KEY` henüz girilmedi (kullanıcı bir Resend hesabı açtığında tamamlanacak) — e-posta gönderimi şu an yalnızca `email_logs`'a `durum='failed'` yazan yolu doğrulanmış durumda.

## Kurumsal Kimlik

Kaynak logo: `public/brand/mesmer-logo-original.jpg` (kullanıcı tarafından sağlandı). Yalnızca bu dosyadan üretilen varlıklar kullanılır — logo yeniden çizilmez/vektörleştirilmez.

- `public/brand/mesmer-logo.png` — orijinal logonun PNG'ye çevrilmiş hali (piksel aynı, format dönüşümü)
- `public/brand/mesmer-symbol.png` — dişli+baret simgesinin kırpılıp beyaz zeminde dolgu payı eklenmiş hali (favicon/kompakt logo kaynağı)
- `src/components/brand/logo.tsx` — tüm uygulamada kullanılacak tek `<Logo />` bileşeni (`variant="full" | "symbol"`)

**Bilinen kısıt:** Orijinal SVG/vektör ve logonun koyu-zemin (beyaz) varyantı henüz sağlanmadı. `Logo` bileşeni bu yüzden logoyu her zaman küçük beyaz bir kart içine oturtur — koyu temada bile okunabilir kalması için. Gerçek beyaz/SVG dosyaları geldiğinde: dosyaları `public/brand/` altına ekleyin, `organizations.logo_white_path` alanını doldurun, `Logo` bileşenini güncelleyin ve beyaz kart geçici çözümünü kaldırın.

Renk tokenları **tek kaynak**: `src/app/globals.css` (`:root` ve `.dark` içindeki `--mesmer-*` ve `--risk-*` değişkenleri + `@theme inline` bloğundaki Tailwind eşlemeleri). Piksel ölçümüyle elde edilen kesin değerler ve gerekçeleri dosya içindeki yorumlarda yazılıdır. Yeni bir yerde marka rengi gerektiğinde ham hex değeri **asla** tekrar yazılmaz — Tailwind sınıfı kullanılır: `bg-mesmer-primary`, `text-mesmer-text-muted`, `bg-risk-high-bg text-risk-high` vb.

Risk/sonuç renkleri (`--risk-*`) kurumsal renklerden bağımsızdır ve marka rengiyle karıştırılmaz. Etiket + ikon eşlemeleri: `src/lib/utils/risk.ts` (`RESPONSE_RESULT_VISUALS`, `FINDING_RISK_LEVEL_VISUALS`). Renk asla tek başına anlam taşımaz; her zaman ikon + Türkçe metinle birlikte kullanılır.

## Enum / Türkçe etiket kuralı

Veritabanı enumları İngilizce stabil token olarak tutulur (Postgres enum içinde Türkçe karakter taşınmaz). Türkçe etiketler **tek kaynak** olarak `src/lib/utils/enums.ts` içindedir. Yeni bir enum değeri eklerken hem ilgili migration hem bu dosya güncellenmelidir.

## Tarih/saat

`src/lib/utils/date.ts` — `formatDate`, `formatDateTime`, `formatTime`. Hepsi `Europe/Istanbul` saat dilimini kullanır ve `GG.AA.YYYY` formatındadır. Tarih formatlama için başka yerde ham `Intl`/`Date` string'i üretilmez, bu yardımcılar kullanılır.

## Klasör yapısı

```
src/app/(auth)/giris, sifremi-unuttum, sifre-sifirla   auth ekranları (+ actions.ts server action'ları)
src/app/(app)/anasayfa, profil                          oturum açmış kullanıcı kabuğu (sidebar/bottom-nav)
src/app/(app)/uygunsuzluklar/[findingId]/               bulgu detay/düzenleme, durum yönetimi, fotoğraf, aktivite geçmişi (Teslim 7)
src/app/(app)/ayarlar/                                   kuruluş bilgileri, bildirim ayarları, kullanıcı davet/liste (yalnızca organization_admin)
src/app/auth/confirm/route.ts                           e-posta bağlantısı doğrulama (recovery/invite, token_hash)
src/app/api/reports/[inspectionId]/route.tsx           PDF rapor üretimi (Teslim 8)
src/app/api/email/send-report/[reportId]/route.ts      Rapor e-postası gönderimi (Teslim 9); foto signed url ihtiyacı RSC'lerde doğrudan karşılanıyor
src/lib/pdf/               build-report-data.ts, report-number.ts, fonts.ts, inspection-report-document.tsx (@react-pdf/renderer)
src/lib/email/             resend.ts, send-email.ts (ortak gönderim + email_logs loglama)
src/lib/offline/           db.ts — IndexedDB (idb) çevrimdışı mutasyon kuyruğu
src/components/pwa/        sw-register.tsx (service worker kaydı)
public/sw.js, public/manifest.json, public/offline.html, public/icons/   el yazımı PWA varlıkları (Teslim 11)
src/**/*.test.ts           Vitest birim testleri (kaynak dosyayla aynı dizinde)
e2e/                        Playwright e2e testleri + global-setup.ts/global-teardown.ts (Teslim 12)
src/components/ui/        shadcn bileşenleri (CLI ile eklenir: `npx shadcn add <bileşen>`)
src/components/brand/     Logo ve marka bileşenleri
src/components/layout/    Sidebar, BottomNav, UserMenu — (app) kabuğu
src/lib/supabase/         client.ts (browser) / server.ts (RSC, RLS'li) / admin.ts (yalnızca sunucu, service-role) / middleware.ts (proxy.ts'in kullandığı oturum yenileme + route guard)
src/lib/auth/             session.ts (getUserContext/requireUserContext) / actions.ts (signOutAction)
src/lib/validation/       auth.ts — Zod şemaları (login/forgot/reset/profile)
src/lib/utils/            date.ts, enums.ts, risk.ts — paylaşılan, framework'ten bağımsız yardımcılar
src/lib/nav.ts            (app) kabuğunun nav öğeleri — yalnızca gerçekten var olan rotalar eklenir
src/proxy.ts              Next.js 16 route guard (eski adıyla "middleware"; bkz. aşağıdaki not)
src/types/database.types.ts  Supabase şemasından üretilen TS tipleri (`supabase gen types typescript`)
supabase/migrations/      0001–0012: enumlar, tablolar, RLS yardımcı fonksiyonları, RLS politikaları, storage bucket'ları, rol GRANT'leri; 0013: checklist_categories delete politikası+grant (Teslim 12 güvenlik bulgusu); 0014: organization_member_emails fonksiyonu (Ayarlar ekranı)
supabase/seed.sql         MESMER kuruluşu + gerçek mevzuat (6331 sayılı Kanun, KKD Yönetmeliği, 5544 sayılı Kanun) + örnek kontrol listesi şablonu
supabase/templates/       özel e-posta şablonları (invite.html, recovery.html) — Supabase'in varsayılan /verify akışı yerine /auth/confirm'e yönlendirir
```

## Auth / Route Guard notları

- Next.js 16, `middleware.ts` dosya adını kullanımdan kaldırdı; bu proje `src/proxy.ts` + `export async function proxy()` kullanır (mantık hâlâ `src/lib/supabase/middleware.ts`'deki `updateSession()` içinde).
- Herkese açık kayıt ekranı **yoktur**. Kullanıcılar `/ayarlar` ekranındaki "Kullanıcı Davet Et" ile davet edilir (`inviteUserAction`, `supabase.auth.admin.inviteUserByEmail` kullanır), `organization_members` satırı aynı action içinde otomatik eklenir — bkz. "Ayarlar ve Kullanıcı Davet" bölümü. Yerel Supabase config'inde `enable_signup=true` bırakılmıştır çünkü bu GoTrue sürümünde `false` yapmak e-posta/şifre GİRİŞİNİ de kapatıyor ("Email logins are disabled") — gerçek koruma RLS'tir (`organization_members` INSERT yalnızca `is_org_admin()`).
- Şifre sıfırlama/davet akışı: e-posta linki → `/auth/confirm?token_hash=...&type=recovery|invite` → `verifyOtp` (gerçek oturum kurar) → `/sifre-sifirla` → `updateUser({password})`. Bu, Supabase'in resmi Next.js SSR deseni; e-posta şablonları `supabase/templates/` içinde özelleştirildi.
- shadcn'in `base-nova` preseti `@base-ui/react` kullanır (Radix değil). Önemli API farkları: `asChild` yoktur → `render={<Link .../>}` kullanılır; `DropdownMenuLabel`/`DropdownMenuItem` mutlaka bir `<DropdownMenuGroup>` içinde olmalıdır (yoksa "MenuGroupContext is missing" hatası); tıklanabilir menü öğeleri Radix'teki gibi `onSelect` değil **`onClick`** alır (`onSelect` sessizce hiçbir şey yapmaz, native `<div>` prop'u olarak geçer).

## İşletme/şube/yetkili modülü (Teslim 4)

- `src/app/(app)/isletmeler/` — liste (arama/filtre `?q=&tehlike=&durum=`, varsayılan `durum=aktif`), `/yeni`, `/[companyId]`, `/[companyId]/duzenle`.
- Şube ve yetkili CRUD'u ayrı sayfa değil, işletme detay sayfasındaki `Dialog` tabanlı formlarla yapılır (`branch-dialog.tsx`, `contact-dialog.tsx`) — aynı bileşen hem oluşturma hem düzenleme için kullanılır (`branch`/`contact` prop'u verilirse düzenleme modu).
- Silme yok; `is_active` toggle'ı (`ActiveToggleButton`, `src/components/active-toggle-button.tsx`) ile Pasife Al/Aktif Et. Bound server action pattern: `action={setXActiveAction.bind(null, id, !current)}`.
- Form değerleri bilerek **string tabanlı** tutulur (`src/lib/validation/company.ts`): HTML input'lar zaten string döndürür, `z.preprocess`/`.default()` react-hook-form'un `zodResolver` generic çıkarımını bozuyor (input/output tipi uyuşmazlığı). Sayısal alanlar (`calisan_sayisi`, `lat`, `lng`) DB'ye yazılmadan hemen önce `toCompanyRecord`/`toBranchRecord`/`toContactRecord` ile dönüştürülür.
- Rol kontrolü iki katmanlı: UI'da `hasWriteAccess(role)` ile buton gizleme (viewer'a yarım/tıklanamaz buton göstermemek için) + server action'da tekrar kontrol + RLS (savunma derinliği).
- **base-ui bileşen notları (yeni bulgular):**
  - `Button`/`DialogTrigger` composition: `render={<Link .../>}` — ayrıca `<Link>` gibi `<a>` render eden Button'lara **`nativeButton={false}`** verilmezse konsola "expected a native button" uyarısı düşer.
  - `Select`/`Switch` gibi bileşenlerde `id` prop'u genelde **ekran okuyucu için görsel olarak gizlenmiş native proxy input'a** gider, görünen etkileşimli elemana değil (ör. `Switch`'te gerçek tıklanabilir eleman `[role="switch"]`, `#id` olan `<input type="checkbox">` değil). Test/otomasyon yazarken bunu unutmayın.

## Mevzuat ve kontrol listesi modülü (Teslim 5)

- **Mevzuat versiyonlama:** `regulations` = başlık, `regulation_versions` = her madde ayrı ayrı versiyonlanır. Bir madde düzenlendiğinde eski satır asla değişmez — `is_current=false` yapılır ve aynı `madde_no` ile `version_no+1` yeni satır eklenir (`upsertMaddeAction`, `src/app/(app)/mevzuat/[regulationId]/actions.ts`). Aynı anda birden fazla farklı madde_no güncel olabilir; kısıt yalnızca `(regulation_id, madde_no)` başına tek `is_current`.
- **Kontrol listesi versiyonlama:** `checklist_template_versions` bütün doküman seviyesinde versiyonlanır (tek `is_current`). Kategori/madde CRUD'u doğrudan güncel versiyon üzerinde yapılır. "Yeni Versiyon Başlat" (`createNewVersionAction`) güncel versiyonu (kategoriler + maddeler) klonlar, eskisini `is_current=false` yapar — geçmiş denetimler eski versiyonu referans aldığı için bozulmaz.
- `checklist_categories` tablosunda `is_active`/`deleted_at` yok (migration'da öngörülmedi); bu yüzden boş bir kategori gerçekten silinebilir (`deleteCategoryAction`), madde içeren kategori silinemez. `checklist_items` ise `is_active` ile normal aktif/pasif desenini kullanır.
- **Kritik base-ui bulgusu — Select ile önceden dolu (edit) formlar:** `@base-ui/react/select`, seçili değerin görünen etiketini yalnızca `<Select.Item>`ların DOM'a **mount edildiği** anda çözebiliyor; popup hiç açılmadan (örn. bir düzenleme diyaloğu ilk açıldığında) tetiklenmiyor, bu yüzden `SelectValue` düzenlemede ham `value`'yu (uuid, enum key) gösteriyordu. **Çözüm:** `<Select items={{value: "Etiket", ...}}>` prop'u her zaman verilir — bu, mount'tan bağımsız garantili etiket çözümü sağlar. Bu proje genelinde önceden değer atanabilen her `Select` için `items` verilmelidir (bkz. `company-form.tsx`, `template-form.tsx`, `item-dialog.tsx`, `company-filters.tsx`).

## Denetim modülü (Teslim 6)

- **Oluşturma → doldurma akışı:** `/denetimler/yeni` işletme/şube/kontrol listesi/uzman/tarih seçtirir; `createInspectionAction` o an güncel olan `checklist_template_version_id`'yi kilitler ve seçilen versiyondaki tüm aktif maddeler için `inspection_responses` satırlarını **anında snapshot'layarak** oluşturur (`soru_snapshot`, `regulation_metin_snapshot`, `regulation_reference_snapshot`) — kural 7 böylece oluşturma anında, tek seferde karşılanır.
- **Taslak/devam ettirme:** Ayrı bir "taslağı kaydet" mekanizması yok; her madde cevabı kendi server action'ıyla anında kaydedilir (`updateResponseAction`), bu yüzden `/denetimler/[id]`'ye her dönüş doğal olarak kaldığı yerden devam ettirir.
- **"Uygun Değil" → uygunsuzluk:** Tek bir birleşik action (`markNonCompliantAction`, `[inspectionId]/actions.ts`) hem `findings` satırını oluşturur hem `inspection_responses.sonuc`'u `non_compliant` yapar. Kullanıcı diyaloğu iptal ederse **hiçbir şey değişmez** — cevap "Uygun Değil" olarak yarım kalmaz. Bu Teslim 6'nın kapsamı; bulgunun tam yaşam döngüsü (fotoğraf, sorumlu kişi seçimi, durum değişimi, kapatma) Teslim 7'de.
- **Tamamlama:** `completeInspectionAction`, tüm `zorunlu=true` maddeler cevaplanmadan tamamlamayı reddeder; başarılı olursa `audit_logs`'a `inspection.completed` yazar (kural 5).
- Denetimin `uzman_user_id`'si `auth.users`'ı referans alır; `profiles` tablosuna doğrudan bir FK olmadığından (PostgREST embed edemiyor) uzman adları ayrı bir sorguyla (`profiles.id in (...)`) eşleştirilir — bkz. `denetimler/page.tsx`, `denetimler/[inspectionId]/page.tsx`.
- Mobil alt navigasyon 6 öğeye çıkınca (`lib/nav.ts`) taşma oldu; `NavItem.mobileLabel` (kısa etiket) eklendi, sidebar tam adı kullanmaya devam ediyor. 7. öğe (Uygunsuzluklar, Teslim 7) eklendiğinde gerçek 375px mobil genişlikte taşma olmadığı doğrulandı — yalnızca yapay/aşırı dar test viewport'larında (ör. <300px) sıkışma görülür, bu gerçek bir cihaz sınıfı değildir.

## Uygunsuzluk ve fotoğraf yönetimi (Teslim 7)

- `src/app/(app)/uygunsuzluklar/` — liste (`?q=&durum=&risk=`), `/[findingId]` detay/düzenleme sayfası. Ayrı bir oluşturma formu **yok**: bulgular yalnızca denetim doldurma ekranındaki "Uygun Değil" akışıyla (`markNonCompliantAction`, Teslim 6) doğar; bu modül var olan bulguların tam yaşam döngüsünü yönetir.
- **Durum değişimi = `corrective_actions` kaydı:** Her durum değişikliği (`changeFindingStatusAction`, `[findingId]/actions.ts`) zorunlu bir açıklama ile birlikte `corrective_actions` tablosuna eklenir (append-only aktivite/ilerleme geçmişi) ve `findings.durum` günceller. Yeni durum `closed_by_expert` ise ek olarak `kapatma_notu` zorunludur, `kapatilma_tarihi` bugünün İstanbul tarihine (`todayIstanbulISODate()`, `src/lib/utils/date.ts`) ayarlanır ve `audit_logs`'a `finding.closed` yazılır (kural 5). Kapalı bir bulgu başka bir duruma geri alınırsa (`reopen`) `kapatma_notu`/`kapatilma_tarihi` temizlenir — geçmiş `corrective_actions` kaydında bilgi zaten kalıcı olduğundan veri kaybı olmaz.
- **Sorumlu kişi seçimi:** `findings.sorumlu_kisi_contact_id` (nullable, `company_contacts`'a FK) birincil kaynaktır; `sorumlu_kisi_adi` her zaman senkron tutulur (kişi seçilirse otomatik doldurulur, aksi halde serbest metin). `FindingEditForm` bir "Serbest metin gir" seçeneğiyle birlikte `company_contacts`'ı `items` prop'lu `Select` ile listeler (bkz. Teslim 5'teki base-ui Select `items` kuralı).
- **Fotoğraf yükleme — client-side, sunucu byte taşımaz:** `PhotoUpload` (`photo-upload.tsx`) dosyaları `browser-image-compression` ile tarayıcıda sıkıştırır (maxSizeMB 1, maxWidthOrHeight 1600), ardından **doğrudan tarayıcı Supabase client'ı ile** (`createClient()`, anon key + RLS) `inspection-photos` private bucket'ına `{organization_id}/findings/{finding_id}/{uuid}.ext` yoluna yükler. Server action (`recordFindingPhotoAction`) yalnızca yükleme başarılı olduktan **sonra** `finding_photos` satırını ekler — büyük dosya baytlarının server action/route handler üzerinden taşınmasını önler, storage RLS zaten `can_write_in_org` ile path'in ilk segmentini doğrular.
- **Fotoğraf görüntüleme:** Bucket private olduğundan `[findingId]/page.tsx` (RSC) `supabase.storage.from('inspection-photos').createSignedUrls(...)` ile toplu signed URL üretir — bunun için service-role gerekmez, kullanıcının RLS'e tabi server client'ı yeterlidir (storage `select` politikası `is_org_member` kontrolü yapıyor).
- **MYK bildirimi henüz yok:** `checklist_items.is_certification_opportunity` alanı şemada var ve test sırasında ilgili maddeyle bulgu oluşturuldu, ancak dahili e-posta bildirimi tasarım gereği Teslim 9'a ("E-posta gönderimi") ertelendi; bu teslimde tetiklenen bir davranış yok.
- Denetim doldurma ekranındaki "Uygunsuzluk: ..." metni artık `/uygunsuzluklar/[id]`'ye tıklanabilir bağlantı (`response-item.tsx`, `existingFinding` prop'u `{id, baslik}` taşır).

## PDF Raporlama (Teslim 8)

- **Rapor üretimi bir route handler'da:** `POST /api/reports/[inspectionId]` (`src/app/api/reports/[inspectionId]/route.tsx`) — yalnızca `status='completed'` denetimler için. `src/lib/pdf/build-report-data.ts` tüm rapor verisini (işletme/şube/denetim/kategori/madde/bulgu) tek bir JSON'a toplar, bu JSON hem PDF render için hem de değiştirilemez `report_snapshots.snapshot_json` için kullanılır (kural 8). Yeniden rapor üretmek her zaman yeni bir `reports` + `report_snapshots` satırı oluşturur, var olanı asla güncellemez.
- **Rapor kimliği kuruluş adından bağımsızdır:** `src/lib/pdf/report-number.ts`, `ISG-{yıl}-{sıra no}` formatında nötr bir rapor no üretir (ör. `ISG-2026-000002`) — **kasıtlı olarak** kuruluş adı (`MESMER`) kullanılmaz, çünkü bu rapor doğrudan denetlenen işletmeye gidiyor (kullanıcı talebi, 2026-07-01). Sıra no tüm kuruluşlar arasında paylaşılan tek önek olduğundan, sayım RLS'e tabi olmayan `createAdminClient()` ile yapılır (aksi halde her kuruluş kendi görünürlüğü içinde ayrı sayar ve `report_no` unique kısıtını ihlal edebilir) — CLAUDE.md kural 2'ye uygun, yalnızca bu route handler içinde, yalnızca bu sayım için.
- **Raporda MESMER markası yer almaz:** PDF'in üst kısmında (`inspection-report-document.tsx`) kuruluş adı/logosu **gösterilmez** — yalnızca "İSG DENETİM RAPORU" başlığı, rapor no ve tarih. Alt bilgide yalnızca denetimi yapan uzmanın kişisel adı geçer (kişisel hesap verebilirlik, şirket markası değil). **Tek istisna:** bir bulgu, `checklist_items.is_certification_opportunity=true` olan bir maddeden doğduysa (MYK belgesi eksikliği türü), o bulgunun altında küçük punto, önerme şeklinde bir not gösterilir ("MYK belgesi ... yetkilendirilmiş kuruluşlardan temin edilebilir; MESMER ... bu kuruluşlardan biridir") — bu, kullanıcının açıkça istediği tek istisnadır, başka hiçbir yerde MESMER adı geçmez. Bu tasarım kararı `report_snapshots.snapshot_json`'ı etkilemez (organizasyon bilgisi iç kayıt amacıyla JSON'da hâlâ tutulur), yalnızca görünür PDF çıktısını etkiler.
- **Türkçe font — kritik fontkit/@react-pdf bulgusu:** PDF'in standart 14 fontu (Helvetica) Türkçe karakter içermez. `@fontsource/roboto`'nun `.woff`/`.woff2` dosyaları **denendi ve elendi** — fontkit bunları PDF'e gömmek için subset ederken noktasız "ı" (U+0131) karakterinin glyph'ini bozuyor (görsel render'da rakam "1" olarak çıkıyor, bazı kelimelerde karakterler üst üste biniyor), `.woff2` ise `RangeError` ile tamamen çöküyor. **Çözüm:** Google Fonts'un ham/işlenmemiş `.ttf` dosyaları (`src/lib/pdf/fonts/Roboto-Regular.ttf`, `Roboto-Bold.ttf` — Apache 2.0, repoya commit edilmiştir) kullanılır; bu sorunu yaşamaz. Bu proje genelinde PDF üreten her yeni bileşen mutlaka bu font dosyalarını (`registerReportFonts()`, `src/lib/pdf/fonts.ts`) kullanmalı, `@fontsource` veya başka bir woff kaynağına dönülmemelidir.
- **Doğrulama yöntemi notu:** Chrome'un PDF görüntüleyicisi bu ortamda ekran görüntüsüne düzgün yansımadığından (headless/CDP sınırlaması), PDF içeriği `pdfjs-dist` + `canvas` ile sayfa sayfa PNG'ye render edilerek görsel olarak doğrulandı — yalnızca metin çıkarımı (`pdfjs` text layer) güvenilir değildir, çünkü ToUnicode CMap sorunları görsel render'dan bağımsız yanlış sonuç verebilir (bu teslimde tam olarak böyle oldu: metin çıkarımı da görsel render da aynı "ı→1" hatasını gösterdi, ama başka bir senaryoda ayrışabilirlerdi).
- Fotoğraflar PDF'e gömülürken sunucu tarafında `supabase.storage.from('inspection-photos').download(path)` ile bayt olarak indirilip react-pdf'in `Image` bileşenine `{data: Buffer, format: 'png'|'jpg'}` olarak verilir.

## E-posta Gönderimi (Teslim 9)

- **Ortak gönderim/loglama yardımcı fonksiyonu:** `src/lib/email/send-email.ts` → `sendAndLogEmail()`, Resend SDK ile gönderir (`src/lib/email/resend.ts`, `server-only`) ve sonucu (başarılı/başarısız, `servis_mesaj_id`, `hata_mesaji`) **her zaman** `email_logs`'a yazar — gönderim başarısız olsa bile satır eklenir, sessizce yutulan hata olmaz (kural 9). İki ayrı akış bu fonksiyonu paylaşır:
  1. **Rapor e-postası** (`POST /api/email/send-report/[reportId]`, route handler): denetim detay sayfasındaki her rapor satırında "E-posta Gönder" butonu (`send-report-email-button.tsx`) ile tetiklenir. Alıcı `inspections.yetkili_contact_id` → `company_contacts.eposta`'dır; boşsa (yetkili atanmamış veya e-postası yok) açık bir hata döner, sessizce başarısız olmaz. CC listesi `notification_settings.default_cc`'den gelir (opsiyonel). PDF, `report-pdfs` bucket'ından indirilip doğrudan eke (`attachments`) eklenir — imzalı URL'nin zamanla dolma riski taşımaz.
  2. **MYK belgelendirme fırsatı dahili bildirimi**: `markNonCompliantAction` (`src/app/(app)/denetimler/[inspectionId]/actions.ts`) içinde, `is_certification_opportunity=true` olan bir maddeden uygunsuzluk doğduğunda **otomatik olarak** (kullanıcı buton tıklamaz) tetiklenir; **sabit kodlanmış** `MYK_OPPORTUNITY_NOTIFICATION_RECIPIENTS`'a (`info@mesmermym.com`, `orhun@mesmermym.com`) gider — kuruluşa özel `notification_settings`'ten değil (bkz. aşağıdaki "MYK belgelendirme fırsatı bildirimi" bölümü, 2026-07-02'de platform seviyesine taşındı). `email_logs.finding_id` doldurulur, `inspection_id`/`report_id` null kalır.
  - **Kasıtlı mimari tercih — e-posta gönderimi yalnızca route.ts'de değil:** Orijinal plan "e-posta gönderimi yalnızca route.ts içinde" diyordu; MYK bildirimi kullanıcı tetiklemediği (başka bir server action'ın yan etkisi olduğu) için kendi route'una fetch atmak yerine doğrudan `sendAndLogEmail()`'i server action içinden çağırıyor. Kuralın özü (Resend API key'i asla client'a sızmaz, gönderim yalnızca sunucu kodunda yapılır) `server-only` paketiyle hâlâ garanti altındadır; yalnızca dosya konumu esnetildi.
- **Bu ortamda gerçek gönderim test edilemedi:** `.env.local`'de `RESEND_API_KEY` boş (gerçek bir Resend hesabı/anahtarı henüz sağlanmadı, bkz. plan'ın "Açık Noktalar" bölümü). Bu yüzden test, **başarısız gönderim yolunu** doğruladı: her iki akışın da doğru alıcı/CC/konu ile denemeye giriştiğini, Resend'den net bir hata aldığını (`Missing API key...`), bunu `email_logs.durum='failed'` + `hata_mesaji` olarak kaydettiğini ve UI'da kullanıcıya okunabilir bir hata gösterdiğini (sessiz başarısızlık yok) doğruladı. Gerçek teslimat için kullanıcının gerçek bir `RESEND_API_KEY` ve doğrulanmış gönderici domaini (`EMAIL_FROM`) sağlaması gerekiyor.

## Düzeltici Faaliyet Takibi + Ana Sayfa (Teslim 10)

- **"Açık" ve "gecikmiş" ortak tanımı tek kaynak:** `OPEN_FINDING_STATUSES` (`src/lib/utils/enums.ts`) = `open | in_progress | corrected_reported | overdue` (yalnızca `closed_by_expert`/`cancelled` kapalı sayılır). "Gecikmiş", bu açık durumlardan biriyle birlikte `termin_tarihi < bugün` (`todayIstanbulISODate()`) olan bulgulardır — **veritabanına yazılmaz**, her sayfada anlık hesaplanır (salt-okunur rozet/filtre). `durum='overdue'` enum değeri hâlâ var ve `status-actions.tsx`'teki durum seçiciden manuel olarak seçilebilir, ama bu iki kavram (hesaplanan "gecikmiş" vs. elle seçilen "Süresi Geçti" durumu) birbirinden bağımsızdır; otomatik bir arka plan job'u/cron yoktur (böyle bir altyapı projede yok).
- **`/anasayfa` artık gerçek bir dashboard:** 5 özet kart (aktif işletme, tamamlanan denetim, taslak denetim, açık uygunsuzluk, gecikmiş uygunsuzluk — hepsi tıklanabilir, ilgili filtrelenmiş listeye gider) + "Takip Gerektiren Uygunsuzluklar" tablosu (en yakın/geçmiş termin tarihine göre sıralı ilk 10 açık bulgu).
- **`/uygunsuzluklar` listesine "Yalnızca gecikmiş" anahtarı eklendi** (`finding-filters.tsx`, `?gecikmis=1`) — mevcut durum/risk filtreleriyle birlikte çalışır, ayrıca listedeki her satırda gecikmiş bulgular kırmızı "(Gecikti)" etiketiyle işaretlenir (filtre açık olmasa bile).
- **Cross-referencing — "bir sonraki denetimde önceki açık uygunsuzluklar otomatik gösterilmeli":** `previous-open-findings-card.tsx`, denetim doldurma ekranının en üstünde (varsa) aynı işletmenin **başka** denetimlerinden kalan açık bulguları listeler (`findings.company_id` eşleşir, `inspection_id` farklı, `deleted_at is null`). Bu **yalnızca görüntüler** — hiçbir otomatik kapama/taşıma/bağlama yapmaz; `findings.parent_finding_id` alanı hâlâ kullanılmıyor (şemada ayrılmış, gelecekte "bu bulgu önceki bulgunun devamıdır" ilişkisini elle kurmak için kullanılabilir, ama bu teslimde o karar kullanıcıya bırakıldı).

## PWA ve Çevrimdışı Taslak (Teslim 11)

- **`@ducanh2912/next-pwa` denendi ve elendi — kritik bulgu:** Bu paket (ve genel olarak next-pwa/workbox ailesi) service worker'ı `next.config`'in `webpack()` fonksiyonuna eklenen bir plugin ile üretir. Next.js 16'da **Turbopack** hem `dev` hem `build` için varsayılan derleyicidir ve `webpack()` fonksiyonunu hiç çalıştırmaz — bu paket kurulup yapılandırılsa bile service worker sessizce üretilmeyecekti (sahte/çalışmayan bir "PWA" özelliği). Paket kaldırıldı; bunun yerine **elle yazılmış** `public/sw.js` kullanılıyor (workbox'a bağımlı değil, sade `fetch`/`install`/`activate` event'leriyle çalışır). Gelecekte bir PWA paketi denenecekse önce Turbopack uyumluluğu doğrulanmalı.
- **El yazımı service worker'ın kapsamı bilinçli olarak dar:** Yalnızca statik varlıkları (`_next/static`, `/icons`, `/brand`) önbelleğe alır ve daha önce ziyaret edilmiş sayfaların çevrimdışı yeniden yüklenmesini sağlar (`network-first` + cache fallback + `/offline.html`). POST istekleri (server action'lar) hiç dokunulmadan geçirilir. Bu SW, aşağıdaki asıl "çevrimdışı taslak" özelliğine **bağımlı değildir** — o tamamen ayrı, saf IndexedDB tabanlı bir mekanizmadır.
- **Kritik proxy/middleware bulgusu:** `src/proxy.ts`'nin matcher'ı yalnızca `_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/` yollarını hariç tutuyordu; `/sw.js`, `/manifest.json`, `/icons/*`, `/offline.html` bu listede yoktu ve oturum yenileme middleware'i tarafından yakalanıp (oturumsuz istekte) `/giris`'e **redirect** ediliyordu. Tarayıcılar, bir service worker script'inin redirect ile servis edilmesine izin vermiyor (`SecurityError: The script resource is behind a redirect`) — bu yüzden kayıt tamamen başarısız oluyordu. Matcher'a bu dört yol da eklendi. **Yeni bir statik dosya/route public'e eklenirse bu matcher'ın güncellenmesi unutulmamalı.**
- **Asıl özellik — çevrimdışı taslak (madde cevabı + uygunsuzluk kuyruğu):** `src/lib/offline/db.ts` (`idb` paketiyle) tarayıcıda `mesmer-isg360-offline` adlı bir IndexedDB açar, `pending_mutations` object store'unda bekleyen değişiklikleri tutar. `denetimler/[inspectionId]/offline-sync-provider.tsx` (React Context + hook `useOfflineSync()`) denetim doldurma ekranını sarmalar:
  - `navigator.onLine` `false` ise (veya sunucu çağrısı `TypeError` ile başarısız olursa — gerçek ağ hatası, iş kuralı hatasından ayırt edilir) `updateResponseAction`/`markNonCompliantAction` çağrılmadan doğrudan IndexedDB'ye kuyruklanır ve UI **iyimser (optimistic)** olarak güncellenir (`response-item.tsx`'teki `localSonuc`/`localHasFinding` state'leri).
  - `online` event'inde veya sayfa yüklendiğinde otomatik olarak kuyruk sırayla (created_at) tekrar oynatılır; gerçek bir iş kuralı hatası (örn. yetki hatası) alınırsa o noktada durur ve kalan öğeleri korur — sessizce tekrar tekrar denenmez.
  - `offline-sync-banner.tsx`, çevrimdışı durumunu ve bekleyen değişiklik sayısını gösterir, manuel "Şimdi Dene" butonu sunar (sahte değil — gerçekten `retrySync()`'i tetikler).
  - **Kapsam kasıtlı olarak dar:** Yalnızca zaten açık olan denetim doldurma sayfasındaki madde cevapları + "Uygun Değil" ile uygunsuzluk oluşturma bu mekanizmayı kullanır. Fotoğraf yükleme, rapor oluşturma, e-posta gönderme gibi diğer mutasyonlar çevrimdışı kuyruklanmaz (bunlar zaten aktif bağlantı/binary transfer gerektirir, gerçekçi bir çevrimdışı senaryoya uymaz).
  - **Gerçek test yöntemi notu:** Bu ortamda gerçek ağ kesintisi simüle edilemediğinden, `navigator.onLine`'ı `Object.defineProperty` ile geçici olarak override edip `online`/`offline` event'lerini elle tetikleyerek test edildi — kodun kendisi bu API'leri okuduğu için bu, gerçek bir ağ kesintisiyle aynı davranışı üretir (yalnızca gerçek bir `fetch` başarısızlığını simüle etmez, ama `navigator.onLine` kontrolü zaten fail-fast olarak ağ denemesini tamamen atlıyor).
- **PWA kurulabilirlik:** `public/manifest.json` + `src/lib/pdf` dışında `public/icons/` altında `mesmer-symbol.png`'den `sharp` ile üretilmiş 192/512/maskable ikonlar (kaynak dosya zaten beyaz zeminli — CLAUDE.md Kurumsal Kimlik bölümündeki kısıtla tutarlı, yeniden çizim yok). `layout.tsx`'e `metadata.manifest` ve `appleWebApp` eklendi, `ServiceWorkerRegister` (`src/components/pwa/sw-register.tsx`) `sw.js`'i kaydeder.

## Testler ve Güvenlik Kontrolü (Teslim 12)

- **Vitest (birim testler):** `vitest.config.ts`, `src/**/*.test.ts`. Kapsam kasıtlı olarak framework'ten bağımsız saf mantık ile sınırlı: `src/lib/utils/date.ts`, `src/lib/utils/enums.ts` (her enum değerinin bir Türkçe etiketi olduğunu doğrulayan eksiksizlik testi — yeni bir enum değeri eklenip etiketi unutulursa bu test kırılır), `src/lib/utils/html.ts`, `src/lib/validation/{auth,inspection,finding}.ts`. React bileşenleri veya Supabase'e bağımlı kod (RSC'ler, server action'lar) birim testte **değil**, Playwright e2e'de kapsanıyor — bu ayrım kasıtlı (mocklamak yerine gerçek DB'ye karşı test etmek, bkz. proje genelinde benimsenen "gerçek ortamda doğrula" pratiği).
- **Playwright (e2e):** `playwright.config.ts` + `e2e/`. `global-setup.ts`/`global-teardown.ts` her koşuda kendi test kullanıcısını (`e2e-test@mesmermym.local`) ve `E2E TEST -` önekli test verisini oluşturup/temizliyor — DB her zaman 2 gerçek admin hesabıyla baseline'a dönüyor (`npm run test:e2e` sonrası doğrulandı). `auth.spec.ts` (giriş başarı/başarısızlık, korumalı rota guard'ı) + `full-flow.spec.ts` (işletme → şube → denetim oluşturma → madde cevaplama → "Uygun Değil" ile uygunsuzluk → denetimi tamamlama → uygunsuzluğun listede ve ana sayfada görünmesi) — projenin en kritik iş akışının uçtan uca regresyon testi. base-ui Select bileşenleriyle gerçek `page.click()` sorunsuz çalıştı (bu konuda önceki teslimlerde preview_eval ile yapılan pointerdown/keydown workaround'ları Playwright'ta gerekmedi — Playwright'ın click implementasyonu zaten tam pointer event dizisi gönderiyor).
- **Güvenlik taraması sırasında bulunan ve düzeltilen üç gerçek hata:**
  1. **HTML enjeksiyonu (e-posta gövdeleri):** `send-report` route'u ve MYK dahili bildirimi, işletme adı/yetkili adı/bulgu başlığı gibi kullanıcı tarafından girilebilen metinleri HTML e-posta gövdesine escape etmeden gömüyordu — bir işletme adına `<script>`/HTML içeriği yazılırsa e-postaya enjekte olabilirdi. `src/lib/utils/html.ts` → `escapeHtml()` eklendi, her iki e-posta şablonunda da kullanıcı girdisi geçen her yere uygulandı.
  2. **`checklist_categories` silme işlemi sessizce hiçbir şey yapmıyordu (Teslim 5'ten beri):** `deleteCategoryAction` gerçek bir SQL `DELETE` çalıştırıyordu ama bu tablo için hiçbir RLS delete politikası **yoktu** — RLS politikasız DELETE'i hata vermeden 0 satır etkileyerek "başarıyla" engelliyor, action da `error` alanı boş döndüğü için kullanıcıya sahte bir başarı gösteriyordu. `0013_checklist_categories_delete_policy.sql` migration'ı ile hem eksik RLS politikası hem de (bkz. madde 3) eksik GRANT eklendi; tarayıcıda gerçek bir kategori silinerek doğrulandı.
  3. **0012'deki rol GRANT'leri `authenticated` rolüne hiçbir tabloda DELETE vermiyordu** ("soft delete kullanılır, DELETE hiç kullanılmaz" kuralı) — bu kural genel olarak doğru ama `checklist_categories`'in tek istisnasını (madde 2) unutmuştu. En az yetki ilkesi korunarak yalnızca bu tabloya dar bir `grant delete` eklendi (bkz. migration 0013).
- **Diğer güvenlik bulguları (temiz çıktı):** `SUPABASE_SERVICE_ROLE_KEY` yalnızca `src/lib/supabase/admin.ts`'de okunuyor (grep ile doğrulandı); `dangerouslySetInnerHTML`/`eval(` hiç kullanılmıyor; 21 tenant tablosunun tamamında RLS etkin ve `select`/`insert`/`update` politikaları eksiksiz; immutable tablolarda (`reports`, `report_snapshots`, `audit_logs`, `email_logs`, `corrective_actions`, `finding_photos`) kasıtlı olarak update/delete politikası yok; her `(app)` sayfası `requireUserContext()` ile korunuyor. `next.config.ts`'e temel güvenlik başlıkları eklendi (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, kamerayı yalnızca same-origin'e izin veren `Permissions-Policy` — `PhotoUpload`'ın `capture="environment"` kullanımıyla uyumlu).
- **Bilinen, kapsam dışı bırakılan bulgu:** Bir madde "Uygun Değil" ile uygunsuzluk oluşturduktan sonra tekrar "Uygun" seçilirse ilişkili bulgu kaydı yetim kalıyor (bkz. Teslim 9 sonunda ayrı görev olarak işaretlendi, `task_807ee7e3`) — bu bir güvenlik açığı değil, bir veri tutarlılığı boşluğu; bilinçli olarak bu teslimin kapsamı dışında tutuldu.

## Ayarlar ve Kullanıcı Davet (12 teslimlik plan tamamlandıktan sonra eklendi)

12 teslimlik planın kendisi tamamlandıktan sonra yapılan bir eksiklik taraması, onaylı mimari planın klasör yapısında yer alan ama hiçbir teslimde açıkça uygulanmayan iki boşluğu ortaya çıkardı: (1) `notification_settings`/`organizations` tablolarını düzenleyecek hiçbir ekran yoktu (yalnızca doğrudan SQL ile değiştirilebiliyordu), (2) yeni kullanıcı davet etmenin **hiçbir** uygulaması yoktu (`inviteUserByEmail`'i çağıran tek bir satır kod bile yoktu — CLAUDE.md'de yalnızca teorik olarak anlatılmıştı). İkisi de kod tamamlama işiydi, yeni bir mimari karar değildi (plan dokümanının rota taslağında `ayarlar` zaten vardı) — bu yüzden onay beklenmeden dolduruldu.

- **`/ayarlar`** (yalnızca `organization_admin`; sayfa seviyesinde `redirect` + `UserMenu`'de koşullu link ile iki katmanlı korunuyor, ana nav'a değil kullanıcı menüsüne eklendi — mobil alt navigasyon zaten 7 öğeyle doluydu, admin-only bir öğe için 8. sıraya taşınmadı):
  - **Kuruluş Bilgileri**: `organizations.{display_name,phone,email,website,address}`. Logo/marka renkleri kasıtlı olarak **düzenlenemez** — CLAUDE.md'nin Kurumsal Kimlik bölümündeki "gerçek beyaz/SVG dosyalar gelene kadar" kısıtıyla tutarlı, bir form alanı bu süreci atlayamaz.
  - **Bildirim Ayarları**: `notification_settings.{gonderen_adi,yanit_adresi,default_cc}` — `default_cc` virgül/satır ile ayrılmış e-posta listesi olarak girilip diziye çevriliyor (`src/lib/validation/organization.ts`). Satır yoksa `upsert` ile oluşturuluyor. (`myk_firsat_bildirim_alicilari` alanı bilerek burada **yok** — bkz. aşağıdaki "MYK belgelendirme fırsatı bildirimi" bölümü, bu artık platform seviyesinde sabit.)
  - **Kullanıcılar**: liste + "Kullanıcı Davet Et" diyaloğu + aktif/pasif toggle (`ActiveToggleButton` yeniden kullanıldı). `organization_members.user_id -> auth.users` ile `profiles.id -> auth.users` arasında doğrudan FK olmadığından (Denetim modülündeki `uzman_user_id` ile aynı PostgREST kısıtı) isimler ayrı sorguyla eşleştiriliyor; e-postalar ise yeni bir RLS yardımcı fonksiyonuyla (`organization_member_emails`, migration `0014`) çözülüyor — `profiles`'a e-posta kolonu eklemek yerine (senkron sürüklenme riski) `auth.users`'ı `security definer` ile, yalnızca çağıranın zaten üyesi olduğu kuruluş için okuyan dar bir fonksiyon tercih edildi.
- **Kullanıcı davet akışı** (`inviteUserAction`, `src/app/(app)/ayarlar/actions.ts`): `createAdminClient()` ile `inviteUserByEmail()` çağrılır (yalnızca bu adım için service-role gerekir — Teslim 9'daki "route.ts içinde" kuralının server action'lara esnetilmesiyle aynı kasıtlı tercih), ardından RLS'e tabi client ile `organization_members` satırı eklenir. Aynı kuruluşta zaten üye olan bir e-posta tekrar davet edilmeye çalışılırsa (`organization_member_emails` ile önceden kontrol edilir) net bir hata döner. **E-posta şablonu zaten Teslim 1'den beri doğruydu** (`supabase/templates/invite.html`, `/auth/confirm?...&type=invite&next=/sifre-sifirla`'ya yönlendiriyor) — eksik olan yalnızca bu şablonu tetikleyecek UI/action'dı. Gerçek uçtan uca doğrulandı: davet gönderildi → Mailpit'te doğru bağlantılı e-posta yakalandı → bağlantıya gidildi → `/sifre-sifirla`'da gerçek oturum kuruldu → şifre belirlenip `/anasayfa`'ya giriş yapıldı.

## Herkese açık kayıt ve self-service kuruluş oluşturma (12 teslimlik plan + Ayarlar'dan sonra, 2026-07-02)

Kullanıcının "biz bunu İSG işi yapan bütün herkese dağıtacağız" açıklamasıyla ürünün çerçevesi değişti (bkz. dosyanın en üstündeki "Ne inşa ediliyor" notu) — artık gerçekten herkese açık, self-service bir kayıt akışı var:

- **`/kayit`** (`src/app/(auth)/kayit/`) — Ad Soyad, Firma/Kuruluş Adı, E-posta, Şifre alan bir form. `src/lib/supabase/middleware.ts`'deki `PUBLIC_ONLY_ROUTES`'a eklendi (yoksa route guard oturumsuz isteği `/giris`'e redirect ediyordu — davet linkine tıklarken yaşanan sw.js/manifest.json redirect sorununun (Teslim 11) aynı kategorisi, her yeni public route eklendiğinde bu listenin güncellenmesi unutulmamalı).
- **`signUpAction`** (`src/app/(auth)/kayit/actions.ts`): önce normal (RLS'e tabi) client ile `supabase.auth.signUp()` çağrılır (auth.users satırı + `handle_new_user` trigger'ıyla otomatik `profiles` satırı oluşur), sonra **`createAdminClient()` ile** (yalnızca bu adım için service-role — yeni kullanıcı henüz hiçbir kuruluşun üyesi olmadığından normal RLS'e tabi client `organizations`'a INSERT yapamaz, "civciv-yumurta" durumu, `inviteUserAction`'daki gerekçenin aynısı): yeni bir `organizations` satırı + `organization_members` (`role='organization_admin'`) satırı oluşturulur, `profiles.default_organization_id` set edilir.
- **`cloneStarterContent`** (`src/lib/onboarding/clone-starter-content.ts`): yeni kuruluşun sıfırdan başlamaması için MESMER'in kendi kuruluşundaki (`organization_id='00000000-0000-0000-0000-000000000001'`, sabit sabit kodlanmış — bu satır silinirse/ID değişirse bu dosya da güncellenmeli) güncel (`is_active`/`is_current`) mevzuat + regulation_versions + checklist_templates + checklist_template_versions + checklist_categories + checklist_items **kopyalanır**. `createNewVersionAction`'daki (Teslim 5) aynı ID-remap deseni kullanılır (`Map<eskiId, yeniId>`) ama burada ek olarak `regulations`/`regulation_versions` da kopyalandığından `checklist_items.regulation_version_id` de yeni kuruluştaki karşılığına remap edilir — orijinal koddan farkı budur. Yalnızca `is_current=true`/`is_active=true` satırlar kopyalanır (geçmiş/pasif versiyonlar taşınmaz, yeni kuruluşun henüz denetim geçmişi olmadığından ihtiyaç yoktur).
- **E-posta doğrulama şu an KAPALI** (`config.toml` → `[auth.email] enable_confirmations = false`, önceki teslimlerden kalma ayar) — kayıt olan kullanıcı anında oturum açmış olarak `/anasayfa`'ya yönlendirilir, e-posta linkine tıklaması gerekmez. Bu, herkese açık bir kayıt formu için spam/sahte hesap riski taşır — **kullanıcıya bildirildi ama henüz karar verilmedi**, `enable_confirmations=true` yapılırsa `supabase/templates/`'e bir `signup` şablonu eklenmesi ve production Supabase panelinde aynı ayarın yapılması gerekir (`/auth/confirm` route'u `type=signup`'ı zaten generic olarak destekliyor, ek kod gerekmez).
- **MYK bildirimi kasıtlı olarak kuruluşlar arası (cross-tenant):** İlk yazıldığında burada "her kuruluş kendi MYK alıcılarını girer" deniyordu — bu **yanlıştı**, kullanıcı düzeltti: MYK bildirimi her zaman MESMER'e (sabit kodlanmış iki adrese) gider, hangi kuruluşta tetiklenirse tetiklensin. Ayrıntı için aşağıdaki "MYK belgelendirme fırsatı bildirimi" bölümüne bakın.
- **Yalnızca yerelde doğrulandı**, production'da denenmedi: kayıt ol → yeni izole kuruluş (0 işletme/denetim) → gerçek mevzuat (6+2+1 madde) ve örnek kontrol listesi (kategoriler + maddeler + madde↔mevzuat eşleşmesi) doğru kopyalandı → aynı e-postayla tekrar kayıt denemesi net Türkçe hata verdi → test verileri temizlendi.

## Supabase yerel geliştirme

Docker Desktop + WSL2 bu makinede kurulu. Yerel stack:

```bash
npx supabase start          # yerel Postgres+Auth+Storage+Studio ayağa kalkar
npx supabase migration up   # bekleyen migration'ları uygular (db reset KULLANILMAZ, bkz. çalışma kısıtları)
npx supabase status         # URL/anahtarları gösterir (asla chat'e yapıştırılmaz, doğrudan .env.local'e yazılır)
```

RLS deseni: her tenant tablosunda `organization_id`; `current_organization_ids()` / `can_write_in_org()` / `is_org_admin()` güvenlik tanımlayıcı (security definer) fonksiyonları `0009_rls_helper_functions.sql`'de. **Önemli:** Bu tablolar Supabase'in kendi şablon migration'ları olmadan sıfırdan oluşturulduğundan, RLS politikaları yetmez — `anon`/`authenticated`/`service_role` rollerine `0012_role_grants.sql`'deki gibi açık SQL GRANT de verilmelidir, yoksa politika var olsa bile erişim tamamen reddedilir.

Mevzuat metinleri (seed.sql): kanun/yönetmelik madde metinleri mevzuat.gov.tr'den birebir alınmıştır (uydurulmamıştır, FSEK m.2 gereği bu metinler eser sayılmaz); kontrol listesi SORULARI ise bu araç için yazılmış özgün örnek sorulardır.

## MYK belgelendirme fırsatı bildirimi (2026-07-02'de platform seviyesine taşındı)

**Bu bölüm daha önce yanlış bir varsayımla ("MESMER'in kendi kuruluşu, kendi `notification_settings`'i") yazılmıştı — düzeltildi.** Ürünün gerçek çerçevesi netleşince (bkz. dosyanın başındaki "Ne inşa ediliyor" notu: MESMER, MYK onaylı bir belgelendirme kuruluşu ve bu uygulamayı **tüm bağımsız İSG uzmanlarına** dağıtıyor), bu bildirimin **kuruluşa özel değil, platform seviyesinde sabit** olması gerektiği ortaya çıktı:

- `checklist_items.is_certification_opportunity boolean default false` — bir kontrol maddesinin bu türden olduğunu şablon yazarı işaretler (değişmedi).
- Böyle bir maddeden **hangi kuruluşta (hangi bağımsız İSG uzmanının denetiminde) olursa olsun** "Uygun Değil" ile uygunsuzluk oluştuğunda, **sabit kodlanmış** iki adrese (`info@mesmermym.com`, `orhun@mesmermym.com` — `MYK_OPPORTUNITY_NOTIFICATION_RECIPIENTS`, `src/app/(app)/denetimler/[inspectionId]/actions.ts`) anlık e-posta gider. **`notification_settings`'ten OKUNMAZ** — o tablo kuruluşa özeldir, bu bildirim değildir.
- E-posta gövdesine hangi kuruluşun (hangi bağımsız uzmanın) denetimi yaptığı da eklenir (`organizations.display_name`) — MESMER için iş zekası/bağlam amaçlı.
- Ayarlar ekranındaki eski "MYK Belgelendirme Fırsatı Bildirim Alıcıları" alanı **kaldırıldı** (artık kullanıcı tarafından yapılandırılamadığından, o alanı bırakmak sahte/yanıltıcı bir UI olurdu — bkz. CLAUDE.md kural 9). `notification_settings.myk_firsat_bildirim_alicilari` DB kolonu geriye dönük uyumluluk için şemada bırakıldı ama hiçbir kod tarafından okunmuyor/yazılmıyor.
- `email_logs.finding_id` (nullable) doldurulur, `inspection_id`/`report_id` null kalır — bu bildirim rapora/denetime değil doğrudan bulguya bağlanır.
- Bu, işletme yetkilisine giden normal rapor e-postasından **ayrı** bir akıştır; ikisi karıştırılmaz.
- **Doğrulandı:** Farklı bir test kuruluşundan (MESMER'in kendi kuruluşu değil, `/kayit` ile oluşturulmuş bağımsız bir tenant) MYK işaretli bir maddeden uygunsuzluk oluşturuldu, `email_logs`'da alıcıların gerçekten `info@mesmermym.com`/`orhun@mesmermym.com` olduğu ve gövdede denetimi yapan kuruluşun adının doğru göründüğü doğrulandı.

## Komutlar

```bash
npm run dev         # geliştirme sunucusu
npm run build       # üretim derlemesi
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```

Node.js (`OpenJS.NodeJS.LTS`, v24) ve Docker Desktop bu makinede winget ile kuruldu; WSL2 etkinleştirildi. Bash/PowerShell araçları her çağrıda PATH'i yeniden okumuyor; `node`/`npm`/`docker`/`npx supabase` çalıştırmadan önce gerekirse ekleyin:
```bash
export PATH="$PATH:/c/Program Files/nodejs:/c/Program Files/Docker/Docker/resources/bin"
```
