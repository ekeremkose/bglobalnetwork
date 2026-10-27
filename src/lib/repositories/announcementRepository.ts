import { cachedRead } from "@/lib/cache";
import { getAllAnnouncements } from "@/lib/store/announcementStore";

/** Public read path: only published posts (see opportunityRepository). */
const published = cachedRead(
  async () => (await getAllAnnouncements()).filter((a) => a.status === "published"),
  ["public-announcements"]
);

export async function getAnnouncements() {
  return published();
}

export async function getFeaturedAnnouncements(limit = 6) {
  return (await published()).filter((a) => a.featured).slice(0, limit);
}

export async function getAnnouncementBySlug(slug: string) {
  return (await published()).find((a) => a.slug === slug);
}
