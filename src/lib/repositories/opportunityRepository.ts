import type { Opportunity } from "@/lib/types/content";
import { cachedRead } from "@/lib/cache";
import { getAllOpportunities } from "@/lib/store/opportunityStore";

/**
 * Public read path: only published opportunities. Drafts must never be
 * returned from here, so every public list, count, detail page and
 * related-content block stays draft-free. Admin screens use adminRepository.
 */
const published = cachedRead(
  async () => (await getAllOpportunities()).filter((o) => o.status === "published"),
  ["public-opportunities"]
);

export async function getOpportunities() {
  return published();
}

export async function getFeaturedOpportunities(limit = 6) {
  return (await published()).filter((o) => o.featured).slice(0, limit);
}

export async function getLatestOpportunities(limit = 4) {
  return (await published()).slice(0, limit);
}

export async function getOpportunityBySlug(slug: string) {
  return (await published()).find((o) => o.slug === slug);
}

export async function getRelatedOpportunities(opportunity: Opportunity, limit = 6) {
  const pool = (await published()).filter((o) => o.id !== opportunity.id);
  const sameCategory = pool.filter((o) => o.category === opportunity.category);
  const sameCountry = pool.filter((o) => o.country === opportunity.country);

  const out: Opportunity[] = [];
  for (const o of [...sameCategory, ...sameCountry, ...pool]) {
    if (out.some((x) => x.id === o.id)) continue;
    out.push(o);
    if (out.length >= limit) break;
  }
  return out;
}
