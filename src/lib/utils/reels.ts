import type { Reel } from "@/lib/types/content";

const time = (iso: string) => new Date(iso).getTime() || 0;

/**
 * The order Reels appear in on the site: an explicit "öne çıkar" choice first,
 * then the newest publication date. The first item is the large lead cover on
 * the homepage.
 */
export function sortReelsForSite<T extends Pick<Reel, "featured" | "publishedAt">>(reels: T[]) {
  return reels
    .slice()
    .sort(
      (a, b) =>
        Number(!!b.featured) - Number(!!a.featured) ||
        time(b.publishedAt) - time(a.publishedAt)
    );
}

/** The lead Reel among the given (published) Reels, if any. */
export function pickLeadReel<T extends Pick<Reel, "featured" | "publishedAt">>(reels: T[]) {
  return sortReelsForSite(reels)[0];
}
