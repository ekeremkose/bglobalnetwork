import type { Category } from "@/lib/types/content";

export const categories: Category[] = [
  {
    id: "cat-erasmus",
    slug: "erasmus-plus",
    title: "Erasmus+ / ESC",
    description:
      "Değişim, gençlik projeleri ve Avrupa Dayanışma Programı (ESC) gönüllülüğü.",
    icon: "globe"
  },
  {
    id: "cat-internship",
    slug: "staj",
    title: "Staj / Trainee",
    description:
      "Avrupa’daki şirket ve kurumlarda kısa/uzun dönem staj ve trainee ilanları.",
    icon: "briefcase"
  },
  {
    id: "cat-scholarship",
    slug: "burs",
    title: "Burs",
    description:
      "Lisans, yüksek lisans ve araştırma bursları; başvuru çağrıları ve ipuçları.",
    icon: "graduation"
  },
  {
    id: "cat-summerschool",
    slug: "yaz-okulu",
    title: "Yaz Okulu",
    description: "Kısa süreli akademik programlar, sertifika ve networking fırsatları.",
    icon: "sparkles"
  },
  {
    id: "cat-volunteering",
    slug: "gonulluluk",
    title: "Gönüllülük",
    description:
      "Toplumsal etki odaklı projeler; konaklama/harçlık destekli gönüllülük programları.",
    icon: "heart"
  }
];

