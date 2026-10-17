import type { Opportunity } from "@/lib/types/content";
import { getAllOpportunities } from "@/lib/store/opportunityStore";

export function getOpportunities() {
  return getAllOpportunities();
}

export function getFeaturedOpportunities(limit = 6) {
  return getAllOpportunities().filter((o) => o.featured).slice(0, limit);
}

export function getLatestOpportunities(limit = 4) {
  return getAllOpportunities().slice(0, limit);
}

export function getOpportunityBySlug(slug: string) {
  return getAllOpportunities().find((o) => o.slug === slug);
}

export function getRelatedOpportunities(opportunity: Opportunity, limit = 6) {
  const pool = getAllOpportunities().filter((o) => o.id !== opportunity.id);
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
