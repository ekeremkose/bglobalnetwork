import { getAllReels } from "@/lib/store/reelStore";

export function getReels() {
  return getAllReels();
}

export function getFeaturedReels(limit = 6) {
  return getAllReels().filter((r) => r.featured).slice(0, limit);
}

export function getReelsByIds(ids: string[]) {
  const set = new Set(ids);
  return getAllReels().filter((r) => set.has(r.id));
}

export function getReelTags() {
  const tags = Array.from(new Set(getAllReels().map((r) => r.tag)));
  return tags.sort((a, b) => a.localeCompare(b, "tr"));
}
