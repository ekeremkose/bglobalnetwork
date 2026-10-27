import { cachedRead } from "@/lib/cache";
import { getAllReels } from "@/lib/store/reelStore";

/** Public read path: only published Reels (see opportunityRepository). */
const published = cachedRead(
  async () => (await getAllReels()).filter((r) => r.status === "published"),
  ["public-reels"]
);

export async function getReels() {
  return published();
}

export async function getFeaturedReels(limit = 6) {
  return (await published()).filter((r) => r.featured).slice(0, limit);
}

export async function getReelsByIds(ids: string[]) {
  const set = new Set(ids);
  return (await published()).filter((r) => set.has(r.id));
}

export async function getReelTags() {
  const tags = Array.from(new Set((await published()).map((r) => r.tag)));
  return tags.sort((a, b) => a.localeCompare(b, "tr"));
}
