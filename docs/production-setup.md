# Canlıya hazırlık: hesap kurulumu ve yapılandırma

Bu belge, yönetim panelinin canlıda çalışması için gereken dış hesapları ve ayarları sırayla anlatır.
Kodun tarafı hazırdır; aşağıdaki adımlar **sizin hesaplarınızda** yapılır. Hiçbir adımda Google şifrenizi
paylaşmanız gerekmez ve gizli değerleri (secret, token, bağlantı dizesi) sohbete yazmayın: yalnızca
`.env.local` dosyasına (yerel) ya da Vercel → Settings → Environment Variables alanına (canlı/staging) girilir.

## Ortamları ayrı tutma kuralı

| | Yerel | Staging (deneme) | Production (canlı) |
|---|---|---|---|
| Google OAuth istemcisi | Staging ile aynı olabilir | **Ayrı istemci** | **Ayrı istemci** |
| Neon veritabanı | Yok (bellek) ya da dev branch | **Ayrı proje/branch** | **Ayrı proje** |
| Vercel Blob deposu | Yok | **Ayrı depo** | **Ayrı depo** |
| `AUTH_SECRET`, `ADMIN_BASE_PATH` | `.env.local` (hazır) | Kendi değerleri | Kendi değerleri |

Vercel'de her değişkeni yalnızca ilgili ortama (Production / Preview) atayın; aynı `DATABASE_URL` hiçbir zaman
iki ortamda birden bulunmasın. Vercel üzerinde `DATABASE_URL` yoksa site bellek içi depolamaya **düşmez**:
okuma/yazma açık bir hatayla durur (`ALLOW_MEMORY_STORE` Vercel'de yok sayılır).

## Sıra

### 1. Google OAuth istemcisi (ilk adım)

1. <https://console.cloud.google.com> adresinde, yönetici hesabınızla (pr.bglobalnetwork@gmail.com) oturum açın.
2. Üstteki proje seçiciden **Yeni proje** → ad: `bglobal-admin`.
3. **APIs & Services → OAuth consent screen** (Google Auth Platform → Branding):
   - Kullanıcı türü **External**; uygulama adı `B-Global Yönetim`; destek e-postası ve geliştirici e-postası: yönetici hesabı.
   - Kapsamlar yalnızca varsayılanlar: `openid`, `email`, `profile` (ek kapsam eklemeyin).
   - Yayın durumu **Testing** kalabilir; **Test users** listesine yalnızca pr.bglobalnetwork@gmail.com ekleyin.
     (Kodda ayrıca sunucu tarafı izin listesi vardır; bu liste ikinci bir kilittir.)
4. **Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**, ad: `bglobal-admin-staging` (canlı için ayrıca `bglobal-admin-production`).
   - **Authorized redirect URIs** (tam olarak, sonda eğik çizgi olmadan):
     - Yerel: `http://localhost:3000/api/auth/callback/google`
     - Staging: `https://<staging-alan-adı>/api/auth/callback/google`
     - Canlı: `https://www.bglobalnetwork.com/api/auth/callback/google`
   - **Authorized JavaScript origins** boş kalabilir.
5. Oluşan **Client ID** ve **Client secret** değerlerini:
   - yerelde `.env.local` içindeki `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` alanlarına,
   - Vercel'de ilgili ortamın aynı adlı değişkenlerine yazın.
   Client secret'ı sohbete, e-postaya ya da git'e koymayın.

Bittiğinde bana yalnızca "Google istemcisi hazır" demeniz yeterli; yerel girişi birlikte deneriz.

### 2. Neon Postgres

1. <https://neon.tech> → hesap → **Create project** (bölge: `AWS Frankfurt (eu-central-1)` Türkiye'ye yakın).
2. Staging ve production için ayrı proje (ya da en az ayrı branch + ayrı bağlantı dizesi) açın.
3. **Connection details → Pooled connection** dizesini kopyalayın → `DATABASE_URL`.
4. Şemayı kurun (önce yalnızca ne yapacağını gösterir, sonra uygular):

```bash
npm run db:migrate
```

```bash
npm run db:migrate -- --apply
```

   Komut hedef sunucu adını (şifresiz) yazdırır; doğru ortam olduğundan emin olduktan sonra `--apply` verin.
5. Veritabanı boş başlar: sitede örnek içerik **yoktur**. Yalnızca staging'de tıklayıp denemek isterseniz örnek
   kayıtlar taslak olarak aktarılabilir (`npm run db:seed`, varsayılan olarak yalnızca listeler; `-- --apply` ile yazar).
   Canlıda kullanmayın.

### 3. Vercel Blob (Reel kapak yüklemeleri)

1. Vercel → proje → **Storage → Create → Blob**; staging ve production için ayrı depo.
2. Depoyu projeye bağlayın ve yalnızca ilgili ortama atayın. Vercel `BLOB_READ_WRITE_TOKEN` değişkenini kendisi ekler.
3. Yüklenen görseller `https://<depo-kimliği>.public.blob.vercel-storage.com/...` adresinden sunulur (`next.config.js`
   bu ana makineye zaten izin verir).

### 4. Vercel ortam değişkenleri

Her ortam için (Production ve Preview ayrı ayrı): `AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_GOOGLE_ID`,
`AUTH_GOOGLE_SECRET`, `ADMIN_BASE_PATH` (`openssl rand -hex 16`), `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`.
`ALLOW_MEMORY_STORE` Vercel'de **tanımlanmaz**. `DATABASE_URL` derleme sırasında da gerekir (genel sayfalar
derleme/yenileme sırasında veritabanından okunur); bu yüzden Build ortamında da tanımlı olmalıdır.

Yönetim adresi: `https://<alan-adı>/<ADMIN_BASE_PATH>` — bu adresi hiçbir yerde paylaşmayın, bağlantı vermeyin.

### 5. Staging alan adı

Production'a dokunmadan denemek için ayrı bir adres kullanın (örn. `staging.bglobalnetwork.com` → Vercel'de
`staging` dalına atanmış bir alan adı). Bu adresi 1. adımdaki staging OAuth istemcisinin redirect listesine ekleyin.
**Bu adımlar yapılmadan canlı siteye (`main` dalı) hiçbir şey gönderilmemelidir**: eski sürümdeki korumasız `/admin`
bu geçişle birlikte kapanır, ama yeni sürüm yayına alınana kadar eski sürüm olduğu gibi çalışmaya devam eder.

## Yayından önce kontrol listesi

- [ ] Staging'de Google ile giriş: yalnızca pr.bglobalnetwork@gmail.com girebiliyor; başka bir Google hesabı reddediliyor.
- [ ] `/admin`, `/admin/review` → 404; eski adreslerde yeni yol görünmüyor.
- [ ] Yeni kayıt → taslak → yayımla → genel sayfalar anında güncelleniyor; yayından kaldır → kayboluyor.
- [ ] Reel kapak yükleme: dosya Blob'a gidiyor, genel sayfada görünüyor, Reel silinince dosya da siliniyor.
- [ ] Sunucu yeniden başlatılsa/yeniden dağıtılsa da kayıtlar duruyor (veritabanı kalıcı).
- [ ] `robots.txt`/sitemap yönetim yolunu içermiyor (zaten hiçbir şeyde yer almıyor).
- [ ] Production `DATABASE_URL` / `BLOB_READ_WRITE_TOKEN` staging'dekilerden farklı.

## Bilinen sınırlar

- Oturum çerezi imzalı JWT'dir (8 saat). İzin listesinden bir e-posta çıkarılıp yeniden dağıtıldığında erişim
  bir sonraki istekte düşer; ancak `AUTH_SECRET` değiştirilmedikçe çalınmış bir çerez süresi dolana kadar
  geçerlidir. Şüphe halinde `AUTH_SECRET` değiştirilir.
- Kapak yüklenip kayıt kaydedilmeden editör kapatılırsa (ya da kayıt başarısız olursa) Blob'da sahipsiz dosya kalır
  (küçük, WebP'ye çevrilmiş; gerçek Blob ile doğrulandı). Silinen/değiştirilen kayıtların kapakları otomatik temizlenir;
  yalnızca uygulamanın yüklediği `reels/cover-…` dosyaları ve yalnızca hiçbir kayıt (Reel, proje, blog) onlara
  bağlı değilse silinir. Sahipsiz dosyalar için otomatik temizlik yoktur; Vercel panelinden elle silinebilir.
- Hobby planında Blob kotası (1 GB, 2.000 yazma işlemi) aşılırsa ek ücret çıkmaz, ancak Blob 30 gün erişilemez olur.
  Canlıda kullanımı izleyin; Vercel'in Hobby planı ticari olmayan kullanım içindir.
- Giriş denemelerine hız sınırı yoktur; kimlik doğrulama Google'dadır ve yalnızca tek hesap yetkilidir.
- Auth.js v5 hâlâ "beta" sürümündedir (`next-auth@5.0.0-beta.32`); sürüm sabitlenmiştir.
