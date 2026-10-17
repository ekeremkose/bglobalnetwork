import type { FoundOpportunityCandidate } from "@/lib/types/foundOpportunity";

/**
 * Mock data: AI-discovered opportunity candidates (not published).
 * Replace with API/CMS fetch in repository layer later.
 */
export const initialFoundOpportunities: FoundOpportunityCandidate[] = [
  {
    id: "fo-1",
    status: "pending",
    sourceTitle: "Erasmus+ Öğrenci Hareketliliği 2026 – Partner Üniversite Listesi",
    sourceUrl: "https://example.edu/international/erasmus-2026",
    sourceDomain: "example.edu",
    sourceName: "Örnek Üniversite Uluslararası Ofis",
    country: "NL",
    category: "erasmus-plus",
    deadline: "2026-05-15",
    confidence: 0.88,
    aiSummary:
      "2026 Erasmus+ öğrenci hareketliliği için partner üniversite kontenjanları ve başvuru takvimi duyurulmuş. Başvuru üniversite uluslararası ofisi üzerinden yapılır; dil ve transkript şartları kuruma göre değişebilir."
  },
  {
    id: "fo-2",
    status: "pending",
    sourceTitle: "European Solidarity Corps – Youth Volunteering (Poland)",
    sourceUrl: "https://youth.europa.eu/solidarity/example-project",
    sourceDomain: "youth.europa.eu",
    sourceName: "European Youth Portal",
    country: "PL",
    category: "gonulluluk",
    deadline: "2026-04-22",
    confidence: 0.72,
    aiSummary:
      "Polonya merkezli ESC gönüllülük projesi; konaklama ve harçlık desteği vurgulanmış. Başvuru yaş aralığı ve proje süresi ilan metninde netleştirilmeli."
  },
  {
    id: "fo-3",
    status: "approved",
    sourceTitle: "Summer School – Sustainability & Climate (Italy)",
    sourceUrl: "https://summerschool.example.it/climate-2026",
    sourceDomain: "summerschool.example.it",
    country: "IT",
    category: "yaz-okulu",
    deadline: "2026-03-30",
    confidence: 0.91,
    aiSummary:
      "İtalya’da sürdürülebilirlik ve iklim temalı bir haftalık yaz okulu. Sertifika ve konaklama seçenekleri belirtilmiş; erken başvuru avantajı olabilir."
  },
  {
    id: "fo-4",
    status: "rejected",
    sourceTitle: "Internship – Tech Startup (remote)",
    sourceUrl: "https://jobs.example-startup.de/intern-2026",
    sourceDomain: "jobs.example-startup.de",
    sourceName: "Example Startup GmbH",
    country: "DE",
    category: "staj",
    deadline: "2026-06-01",
    confidence: 0.45,
    aiSummary:
      "Teknoloji staj ilanı; uzaktan veya hibrit çalışma imkânı geçiyor. Başvuru için CV ve kısa motivasyon istenmiş."
  },
  {
    id: "fo-5",
    status: "pending",
    sourceTitle: "Master Scholarship Call – France (partial funding)",
    sourceUrl: "https://scholarships.example.fr/masters-2026",
    sourceDomain: "scholarships.example.fr",
    country: "FR",
    category: "burs",
    confidence: 0.63,
    aiSummary:
      "Fransa’da yüksek lisans için kısmi burs çağrısı. Akademik başarı ve dil yeterliliği ön planda; referans mektupları gerekebilir."
  },
  {
    id: "fo-6",
    status: "pending",
    sourceTitle: "Youth Exchange – Social Innovation (Spain)",
    sourceUrl: "https://ngo.example.es/youth-exchange",
    sourceDomain: "ngo.example.es",
    category: "erasmus-plus",
    deadline: "2026-04-10",
    confidence: 0.79,
    aiSummary:
      "İspanya’da sosyal inovasyon odaklı gençlik değişimi; grup başvurusu veya bireysel kontenjan detayları kaynak sitede kontrol edilmeli."
  }
];
