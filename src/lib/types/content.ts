export type Category = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  icon?: "globe" | "graduation" | "briefcase" | "heart" | "sparkles";
};

export type Country = {
  code: string;
  name: string;
  region?: "Avrupa" | "Asya" | "Amerika" | "Afrika" | "Okyanusya";
};

export type Opportunity = {
  id: string;
  slug: string;
  title: string;
  country: Country["code"];
  category: Category["slug"];
  publishedAt?: string; // ISO date string (CMS-ready)
  deadline: string; // ISO date string
  shortDescription: string;
  fullDescription: string;
  externalLink: string;
  featured?: boolean;
  coverImage?: string;
  relatedReelIds?: string[];
};

export type Reel = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  instagramUrl: string;
  thumbnail?: string;
  tag: string;
  featured?: boolean;
  publishedAt: string; // ISO date string
  relatedOpportunityIds?: string[];
};

export type Announcement = {
  id: string;
  slug: string;
  title: string;
  content: string;       // zengin metin, uzun içerik
  publishedAt: string;   // ISO date string
  featured?: boolean;
  coverImage?: string;
  link?: string;         // opsiyonel dış bağlantı
};

export type DeadlineStatus = "active" | "soon" | "closed";

