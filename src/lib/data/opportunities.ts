import type { Opportunity, Seed } from "@/lib/types/content";

export const opportunities: Seed<Opportunity>[] = [
  {
    id: "opp-1",
    slug: "erasmus-plus-kisa-donem-ogrenci-hareketliligi-avrupa-2026",
    title: "Erasmus+ Kısa Dönem Öğrenci Hareketliliği (2026) – Avrupa",
    country: "NL",
    category: "erasmus-plus",
    publishedAt: "2026-04-01",
    deadline: "2026-05-20",
    shortDescription:
      "Partner üniversitelerde 2–5 ay eğitim; hibeli kontenjanlar ve akademik tanınma.",
    fullDescription:
      "Bu fırsat, Erasmus+ kapsamında kısa dönem öğrenci hareketliliği hedefleyen öğrenciler için örnek bir çağrıdır.\n\nKimler için?\n- Lisans / yüksek lisans öğrencileri\n- Minimum \(B1\) seviyesinde dil yeterliliği olanlar (kuruma göre değişebilir)\n\nSüreç özeti:\n- Üniversitenin uluslararası ofisi üzerinden başvuru\n- Transkript, niyet mektubu ve dil belgesi\n- Seçim sonrası Learning Agreement ve hibe sözleşmesi\n\nİpucu:\n- Ders eşleştirmelerini erken yap; son hafta belge trafiği stresli olur.\n\nNot: Bu içerik mock/dummy örnektir. Gerçek başvurular için kurum duyurularını kontrol et.",
    externalLink: "https://example.com/erasmus-application",
    featured: true,
    coverImage: "https://picsum.photos/seed/bglobal-opp-1/1200/800",
    relatedReelIds: ["reel-1"]
  },
  {
    id: "opp-2",
    slug: "erasmus-plus-yaz-donemi-kisa-program-sosyal-inovasyon",
    title: "Erasmus+ Yaz Dönemi Kısa Program: Sosyal İnovasyon",
    country: "ES",
    category: "erasmus-plus",
    publishedAt: "2026-03-29",
    deadline: "2026-04-30",
    shortDescription:
      "Atölye + proje geliştirme; çok uluslu ekiplerle sosyal etki odaklı çalışma.",
    fullDescription:
      "Yaz dönemi kısa programı; sosyal inovasyon, girişimcilik ve toplumsal etki temalarında yoğunlaştırılmış eğitim sunar.\n\nBeklenen çıktı:\n- Takım projesi ve final sunumu\n- Katılım sertifikası\n\nGereklilikler:\n- İngilizce iletişim\n- Takım çalışmasına yatkınlık\n\nNot: Bu içerik mock/dummy örnektir.",
    externalLink: "https://example.com/summer-program",
    coverImage: "https://picsum.photos/seed/bglobal-opp-2/1200/800",
    relatedReelIds: ["reel-1"]
  },
  {
    id: "opp-3",
    slug: "esc-gonulluluk-polonya-kultur-sanat-projesi",
    title: "ESC Gönüllülük (Polonya): Kültür & Sanat Projesi",
    country: "PL",
    category: "gonulluluk",
    publishedAt: "2026-03-27",
    deadline: "2026-04-18",
    shortDescription:
      "Konaklama + harçlık destekli; yerel etkinliklerde organizasyon ve içerik üretimi.",
    fullDescription:
      "Avrupa Dayanışma Programı (ESC) kapsamında 6 ay süreli gönüllülük projesi.\n\nDestekler (örnek):\n- Konaklama\n- Aylık harçlık\n- Yerel ulaşım\n\nGörevler:\n- Etkinlik organizasyonu\n- Sosyal medya içerik desteği\n- Gençlik atölyeleri\n\nNot: Bu içerik mock/dummy örnektir.",
    externalLink: "https://example.com/esc-volunteering",
    featured: true,
    coverImage: "https://picsum.photos/seed/bglobal-opp-3/1200/800",
    relatedReelIds: ["reel-3"]
  },
  {
    id: "opp-4",
    slug: "almanya-teknoloji-staji-remote-hibrit-2026",
    title: "Almanya Teknoloji Stajı (Remote/Hibrit) – 2026",
    country: "DE",
    category: "staj",
    publishedAt: "2026-03-25",
    deadline: "2026-06-05",
    shortDescription:
      "Web geliştirme / veri analizi rolleri; mentorluk ve proje bazlı öğrenme.",
    fullDescription:
      "Örnek bir teknoloji staj ilanı: ürün ekipleriyle birlikte görev alır, sprint süreçlerini deneyimlersin.\n\nArananlar:\n- Temel web teknolojileri veya veri analizi bilgisi\n- İngilizce iletişim\n- Takım çalışması\n\nNot: Bu içerik mock/dummy örnektir.",
    externalLink: "https://example.com/germany-internship",
    coverImage: "https://picsum.photos/seed/bglobal-opp-4/1200/800",
    relatedReelIds: ["reel-2"]
  },
  {
    id: "opp-5",
    slug: "hollanda-startup-trainee-program",
    title: "Hollanda Startup Trainee Programı",
    country: "NL",
    category: "staj",
    publishedAt: "2026-03-23",
    deadline: "2026-04-08",
    shortDescription:
      "3 ay hızlandırılmış trainee: ürün, pazarlama ve growth rotasyonları.",
    fullDescription:
      "Startup ekosistemini deneyimlemek isteyen öğrenciler için örnek trainee programı.\n\nProgram:\n- 4 hafta onboarding\n- 8 hafta proje rotasyonu\n- Demo day\n\nNot: Bu içerik mock/dummy örnektir.",
    externalLink: "https://example.com/trainee",
    featured: true,
    coverImage: "https://picsum.photos/seed/bglobal-opp-5/1200/800",
    relatedReelIds: ["reel-2"]
  },
  {
    id: "opp-6",
    slug: "italya-yaz-okulu-surdurulebilirlik-iklim",
    title: "İtalya Yaz Okulu: Sürdürülebilirlik & İklim",
    country: "IT",
    category: "yaz-okulu",
    publishedAt: "2026-03-20",
    deadline: "2026-03-28",
    shortDescription:
      "1 hafta yoğun program; konuşmacılar, saha ziyareti ve sertifika.",
    fullDescription:
      "Sürdürülebilirlik ve iklim alanında yoğunlaştırılmış yaz okulu.\n\nDahil olanlar (örnek):\n- Dersler ve atölyeler\n- Saha ziyareti\n- Sertifika\n\nNot: Bu içerik mock/dummy örnektir.",
    externalLink: "https://example.com/summer-school",
    coverImage: "https://picsum.photos/seed/bglobal-opp-6/1200/800",
    relatedReelIds: ["reel-4"]
  },
  {
    id: "opp-7",
    slug: "fransa-yuksek-lisans-burs-cagrisi",
    title: "Fransa Yüksek Lisans Burs Çağrısı (Örnek)",
    country: "FR",
    category: "burs",
    publishedAt: "2026-03-18",
    deadline: "2026-05-01",
    shortDescription:
      "Yüksek lisans öğrenim desteği; başarı odaklı değerlendirme ve dil şartı.",
    fullDescription:
      "Örnek burs duyurusu: değerlendirme akademik başarı, niyet mektubu ve referanslar üzerinden yapılır.\n\nGerekli belgeler:\n- CV\n- Niyet mektubu\n- Referans\n- Dil belgesi\n\nNot: Bu içerik mock/dummy örnektir.",
    externalLink: "https://example.com/scholarship",
    coverImage: "https://picsum.photos/seed/bglobal-opp-7/1200/800"
  },
  {
    id: "opp-8",
    slug: "esc-gonulluluk-portekiz-genclik-merkezi",
    title: "ESC Gönüllülük (Portekiz): Gençlik Merkezi Projesi",
    country: "PT",
    category: "gonulluluk",
    publishedAt: "2026-10-15",
    deadline: "2026-11-14",
    shortDescription:
      "Lizbon’da 6 ay; konaklama ve harçlık destekli, gençlik atölyeleri ve etkinlik desteği.",
    fullDescription:
      "Lizbon’da 6 ay; konaklama ve harçlık destekli, gençlik atölyeleri ve etkinlik desteği.\n\nNot: Bu içerik mock/dummy örnektir. Gerçek başvurular için kurum duyurularını kontrol et.",
    externalLink: "https://example.com/esc-gonulluluk-portekiz-genclik-merkezi",
    coverImage: "https://picsum.photos/seed/bglobal-opp-8/1200/800"
  },
  {
    id: "opp-9",
    slug: "erasmus-plus-genclik-degisimi-italya",
    title: "Erasmus+ Gençlik Değişimi: Dijital Vatandaşlık",
    country: "IT",
    category: "erasmus-plus",
    publishedAt: "2026-10-12",
    deadline: "2026-11-21",
    shortDescription:
      "10 günlük çok uluslu gençlik değişimi; yol ve konaklama masrafları karşılanır.",
    fullDescription:
      "10 günlük çok uluslu gençlik değişimi; yol ve konaklama masrafları karşılanır.\n\nNot: Bu içerik mock/dummy örnektir. Gerçek başvurular için kurum duyurularını kontrol et.",
    externalLink: "https://example.com/erasmus-plus-genclik-degisimi-italya",
    coverImage: "https://picsum.photos/seed/bglobal-opp-9/1200/800"
  },
  {
    id: "opp-10",
    slug: "berlin-kis-okulu-veri-bilimi",
    title: "Berlin Kış Okulu: Veri Bilimi & Yapay Zekâ",
    country: "DE",
    category: "yaz-okulu",
    publishedAt: "2026-10-10",
    deadline: "2026-12-02",
    shortDescription:
      "2 hafta yoğun program; uygulamalı projeler, konuşmacılar ve sertifika.",
    fullDescription:
      "2 hafta yoğun program; uygulamalı projeler, konuşmacılar ve sertifika.\n\nNot: Bu içerik mock/dummy örnektir. Gerçek başvurular için kurum duyurularını kontrol et.",
    externalLink: "https://example.com/berlin-kis-okulu-veri-bilimi",
    coverImage: "https://picsum.photos/seed/bglobal-opp-10/1200/800"
  },
  {
    id: "opp-11",
    slug: "isvec-arastirma-staji-2027",
    title: "İsveç Araştırma Stajı – 2027 Bahar",
    country: "SE",
    category: "staj",
    publishedAt: "2026-10-08",
    deadline: "2026-12-15",
    shortDescription:
      "Üniversite laboratuvarlarında 3 ay; mentorluk ve aylık destek bursu.",
    fullDescription:
      "Üniversite laboratuvarlarında 3 ay; mentorluk ve aylık destek bursu.\n\nNot: Bu içerik mock/dummy örnektir. Gerçek başvurular için kurum duyurularını kontrol et.",
    externalLink: "https://example.com/isvec-arastirma-staji-2027",
    coverImage: "https://picsum.photos/seed/bglobal-opp-11/1200/800"
  }
];
