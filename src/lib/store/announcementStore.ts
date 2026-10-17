import type { Announcement } from "@/lib/types/content";
import { announcements as mockAnnouncements } from "@/lib/data/announcements";

/**
 * Full CRUD in-memory store for announcements.
 * Initialized from static mock on first access.
 * Uses globalThis to persist across Next.js dev hot reloads.
 * Replace internals with DB/CMS calls when backend is ready.
 */

type GlobalStore = typeof globalThis & {
  __announcements?: Map<string, Announcement>;
};

function getStore(): Map<string, Announcement> {
  const g = globalThis as GlobalStore;
  if (!g.__announcements) {
    g.__announcements = new Map(mockAnnouncements.map((a) => [a.id, a]));
  }
  return g.__announcements;
}

export function getAllAnnouncements(): Announcement[] {
  return Array.from(getStore().values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function addAnnouncement(a: Announcement): void {
  getStore().set(a.id, a);
}

export function updateAnnouncement(a: Announcement): void {
  getStore().set(a.id, a);
}

export function removeAnnouncement(id: string): void {
  getStore().delete(id);
}
