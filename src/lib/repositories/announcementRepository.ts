import { getAllAnnouncements } from "@/lib/store/announcementStore";

export function getAnnouncements() {
  return getAllAnnouncements();
}

export function getFeaturedAnnouncements(limit = 6) {
  return getAllAnnouncements().filter((a) => a.featured).slice(0, limit);
}

export function getAnnouncementBySlug(slug: string) {
  return getAllAnnouncements().find((a) => a.slug === slug);
}
