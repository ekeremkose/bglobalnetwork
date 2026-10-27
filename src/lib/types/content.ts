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

/** Taslak records are only visible in the admin; Yayında records are on the public site. */
export type PublishStatus = "draft" | "published";

/** Seed content predates publication state; it is loaded as published. */
export type Seed<T extends { status: PublishStatus }> = Omit<T, "status"> & {
  status?: PublishStatus;
};

export type Opportunity = {
  id: string;
  status: PublishStatus;
  /** ISO timestamp of the last admin save (set by the server). */
  updatedAt?: string;
  slug: string;
  title: string;
  country: Country["code"];
  category: Category["slug"];
  publishedAt?: string; // ISO date string (CMS-ready)
  /** ISO date (YYYY-MM-DD). Empty only while the record is a draft. */
  deadline: string;
  shortDescription: string;
  fullDescription: string;
  externalLink: string;
  featured?: boolean;
  coverImage?: string;
  relatedReelIds?: string[];
};

export type Reel = {
  id: string;
  status: PublishStatus;
  updatedAt?: string;
  slug: string;
  title: string;
  shortDescription: string;
  instagramUrl: string;
  /** Real cover image (portrait works best). While empty, a typographic placeholder is shown. */
  thumbnail?: string;
  tag: string;
  featured?: boolean;
  publishedAt: string; // ISO date string
  relatedOpportunityIds?: string[];
};

export type Announcement = {
  id: string;
  status: PublishStatus;
  updatedAt?: string;
  slug: string;
  title: string;
  content: string;       // zengin metin, uzun içerik
  publishedAt: string;   // ISO date string
  featured?: boolean;
  coverImage?: string;
  link?: string;         // opsiyonel dış bağlantı
};

export type DeadlineStatus = "active" | "soon" | "closed";

