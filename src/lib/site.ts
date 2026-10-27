/**
 * Public destinations used across the site.
 *
 * These are the DEFAULTS the editable "Site ayarları" start from. Every value
 * is a PLACEHOLDER and must be replaced with the real destination before
 * production (from /admin/ayarlar, or here when the settings storage is made
 * durable). The UI never hides these elements when a value is a placeholder.
 */
export type SiteSettings = {
  communityFormUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  contactEmail: string;
  location: string;
};

export const SITE_DEFAULTS: SiteSettings = {
  /** PLACEHOLDER: real Google Form / sign-up URL for "Topluluğa Katıl". */
  communityFormUrl: "https://forms.gle/PLACEHOLDER",
  /** PLACEHOLDER: real Instagram profile URL. */
  instagramUrl: "https://www.instagram.com/",
  /** PLACEHOLDER: real LinkedIn page URL. */
  linkedinUrl: "https://www.linkedin.com/",
  /** PLACEHOLDER: real contact address (the domain is not confirmed). */
  contactEmail: "info@bglobal.network",
  /** PLACEHOLDER: confirm the public location line. */
  location: "İstanbul",
};
