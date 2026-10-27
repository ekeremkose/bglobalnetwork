import type { Reel, Seed } from "@/lib/types/content";

export const reels: Seed<Reel>[] = [
  {
    id: "reel-1",
    slug: "erasmus-plus-basvuruya-hazirlik-checklist",
    title: "Erasmus+ Başvuruya Hazırlık Checklist",
    shortDescription:
      "Motivasyon mektubu, dil belgesi ve transkript sürecini doğru sırayla planla.",
    instagramUrl: "https://www.instagram.com/reel/EXAMPLE1/",
    tag: "Erasmus+",
    featured: true,
    publishedAt: "2026-03-15",
    relatedOpportunityIds: ["opp-1", "opp-2"]
  },
  {
    id: "reel-2",
    slug: "avrupa-stajlarinda-cv-ipuclari",
    title: "Avrupa Stajlarında CV İpuçları (1 Dakika)",
    shortDescription:
      "ATS uyumlu CV, doğru anahtar kelimeler ve deneyim anlatımı için 5 hızlı öneri.",
    instagramUrl: "https://www.instagram.com/reel/EXAMPLE2/",
    tag: "Staj",
    featured: true,
    publishedAt: "2026-03-10",
    relatedOpportunityIds: ["opp-4", "opp-5"]
  },
  {
    id: "reel-3",
    slug: "esc-gonulluluk-konaklama-harclik",
    title: "ESC Gönüllülük: Konaklama + Harçlık Nasıl Oluyor?",
    shortDescription:
      "ESC projelerinde destek kalemleri, sorumluluklar ve sık yapılan hatalar.",
    instagramUrl: "https://www.instagram.com/reel/EXAMPLE3/",
    tag: "Gönüllülük",
    publishedAt: "2026-02-28",
    relatedOpportunityIds: ["opp-3"]
  },
  {
    id: "reel-4",
    slug: "yaz-okulu-basvurularinda-motivasyon",
    title: "Yaz Okulu Başvurularında Motivasyon",
    shortDescription:
      "Kısa ama etkili niyet mektubu: amaç, plan ve programla uyum.",
    instagramUrl: "https://www.instagram.com/reel/EXAMPLE4/",
    tag: "Yaz Okulu",
    publishedAt: "2026-02-20",
    relatedOpportunityIds: ["opp-6"]
  }
];

