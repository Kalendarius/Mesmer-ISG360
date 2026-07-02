# MESMER İSG360

**İSG Denetim ve Uygunsuzluk Takip Sistemi** — MESMER Mesleki Yeterlilik Belgelendirme Merkezi A.Ş. için geliştirilen, çok kiracılı, mobil öncelikli iş sağlığı ve güvenliği denetim platformu.

> Bu proje aşamalı olarak geliştiriliyor. Mevcut durum ve yol haritası için bkz. [CLAUDE.md](./CLAUDE.md) ve onaylı mimari plan (`C:\Users\utkuk\.claude\plans\serialized-humming-oasis.md`).

## Teknoloji Yığını

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme`, ayrı `tailwind.config.ts` yok)
- **shadcn/ui**
- **Supabase** — Postgres, Auth, Storage, Row Level Security
- **Zod** + **React Hook Form**
- **@react-pdf/renderer** (sunucu taraflı PDF üretimi)
- **Resend** (sunucu taraflı e-posta)
- **Vitest** (unit) + **Playwright** (e2e)

## Ön Koşullar

- Node.js 20+ (bu makinede `winget install OpenJS.NodeJS.LTS` ile kuruldu, v24)
- Docker Desktop + WSL2 (yerel Supabase stack'i için; bu makinede kurulu)
- Bir Resend hesabı ve doğrulanmış gönderici domaini (e-posta gönderimi için, Teslim 9)

## Kurulum

```bash
npm install
npx supabase start          # yerel Postgres+Auth+Storage+Studio'yu ayağa kaldırır
npx supabase migration up   # supabase/migrations altındaki şemayı uygular
cp .env.example .env.local
# .env.local içine `npx supabase status` çıktısındaki URL/anahtarları girin
npm run dev
```

Uygulama <http://localhost:3000> adresinde açılır. Supabase Studio (yerel) <http://127.0.0.1:54323> adresinde açılır.

Örnek veriyi (MESMER kuruluşu, gerçek mevzuat metinleri, örnek kontrol listesi) yüklemek için:

```bash
# Docker container adını `docker ps` ile doğrulayın (supabase_db_<proje>)
docker exec -i <db-container-adi> psql -U postgres -d postgres < supabase/seed.sql
```

## Ortam Değişkenleri

Bkz. [.env.example](./.env.example). Özellikle:

- `SUPABASE_SERVICE_ROLE_KEY` yalnızca sunucu tarafında kullanılır, hiçbir zaman `NEXT_PUBLIC_` öneki almaz ve client'a gönderilmez.
- `.env.local` dosyası `.gitignore` ile hariç tutulmuştur, asla commit edilmemelidir.

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run start` | Üretim sunucusunu çalıştırır (build sonrası) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest birim testleri |
| `npm run test:watch` | Vitest, izleme modunda |
| `npm run test:e2e` | Playwright e2e testleri (yerel Supabase + `npm run dev` çalışıyor olmalı; sunucu yoksa Playwright kendisi başlatır) |

E2e testleri kendi test kullanıcısını ve verisini (`E2E TEST -` önekli) her koşuda oluşturup temizler; gerçek admin hesaplarını etkilemez.

## Auth ve Kullanıcı Davet

Herkese açık kayıt ekranı yoktur (B2B, davet usulü). Yeni kullanıcılar `/ayarlar` → "Kullanıcı Davet Et" ile eklenir (yalnızca `organization_admin` rolü bu ekranı görür). İlk kuruluş yöneticisi henüz yoksa (örn. taze bir kurulumda) Supabase Admin API ile elle eklenmelidir:

```js
const { data } = await supabaseAdmin.auth.admin.inviteUserByEmail("kullanici@ornek.com");
await supabaseAdmin.from("organization_members").insert({
  organization_id: "<kuruluş-id>",
  user_id: data.user.id,
  role: "organization_admin",
});
```

Yerel geliştirmede gönderilen e-postalar (davet, şifre sıfırlama) gerçekten iletilmez, Mailpit'te (<http://127.0.0.1:54324>) yakalanır — davet bağlantısı oradan alınıp tarayıcıda açılabilir.

## Kurumsal Kimlik

Logo ve renk kaynağı, kullanım kısıtları ve marka bileşeni için bkz. [CLAUDE.md → Kurumsal Kimlik](./CLAUDE.md#kurumsal-kimlik).

## Proje Durumu

Geliştirme aşamalı (teslim teslim) ilerliyor:

- [x] Teslim 1 — Proje iskeleti, marka varlıkları, dokümantasyon
- [x] Teslim 2 — Supabase migration + RLS + örnek veri
- [x] Teslim 3 — Auth, profil, rol/kuruluş context
- [x] Teslim 4 — İşletme/şube/yetkili yönetimi
- [x] Teslim 5 — Mevzuat ve kontrol listesi şablonları
- [x] Teslim 6 — Denetim ekranı
- [x] Teslim 7 — Uygunsuzluk ve fotoğraf yönetimi
- [x] Teslim 8 — PDF raporlama
- [x] Teslim 9 — E-posta gönderimi
- [x] Teslim 10 — Düzeltici faaliyet takibi + ana sayfa
- [x] Teslim 11 — PWA ve çevrimdışı taslak
- [x] Teslim 12 — Testler, tip/lint temizliği, güvenlik kontrolü
