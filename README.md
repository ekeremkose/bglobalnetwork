# B-Global Network

Öğrenciler için uluslararası fırsatları (Erasmus+, staj, gönüllülük, burs, yaz okulu vb.) derleyen; Reels/Duyuru içerikleriyle destekleyen modern, responsive web sitesi.

Bu repo şu an **tamamen mock/dummy data** ile çalışır ve ileride bir CMS (örn. Sanity) ile kolayca entegre edilecek şekilde yapılandırılmıştır.

## Proje yapısı

- `src/app/`: Next.js App Router sayfaları
  - `page.tsx`: Ana sayfa
  - `opportunities/page.tsx`: Fırsatlar (arama + filtre)
  - `opportunities/[slug]/page.tsx`: Fırsat detay
  - `reels/page.tsx`: Reels / Duyurular
  - `contact/page.tsx`: İletişim
- `src/components/`: UI ve sayfa bileşenleri
  - `site/`: `SiteNavbar`, `SiteFooter`
  - `sections/`: Ana sayfa bölümleri
  - `opportunities/`: kart, grid, detay
  - `reels/`: kart, grid
  - `pages/`: client filtre/arama sayfaları
  - `ui/`: ortak küçük bileşenler (`Badge`, `SectionHeading`)
- `src/lib/`: veri katmanı (CMS-ready)
  - `types/`: içerik modelleri (`Opportunity`, `Reel`, `Category`, `Country`)
  - `data/`: mock data dosyaları
  - `repositories/`: UI’dan bağımsız “data access” fonksiyonları
  - `utils/`: tarih/slug vb.
- `src/styles/`: global css + tailwind

## Mock data nerede?

- `src/lib/data/opportunities.ts`
- `src/lib/data/reels.ts`
- `src/lib/data/categories.ts`
- `src/lib/data/countries.ts`

UI katmanı bu dosyaları direkt okumaz; `src/lib/repositories/*` üzerinden erişir. Böylece ileride CMS’ye geçiş kolay olur.

## Lokal çalıştırma

1) Node.js (LTS) kurulu olmalı.
2) Proje klasöründe:

```bash
npm install
npm run dev
```

Sonra `http://localhost:3000` üzerinden aç.

## Sanity gibi bir CMS’e nasıl bağlanır?

Bu repo “repository” katmanı ile hazır:

- Bugün: `getOpportunities()` → local `src/lib/data/opportunities.ts`
- Yarın: `getOpportunities()` → Sanity client ile GROQ query / REST fetch

Yapılacak değişiklikler:

- `src/lib/repositories/*` içinde `data/*.ts` importlarını kaldırıp yerine API/CMS çağrısı ekle
- Gerekirse `Opportunity`, `Reel` tiplerini CMS şemasına göre genişlet
- UI bileşenleri aynı kalır (sayfalar veri odaklı olduğu için)

