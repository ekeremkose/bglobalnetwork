import type { FoundOpportunityCandidate, PublishDraft } from "@/lib/types/foundOpportunity";
import type { Opportunity } from "@/lib/types/content";
import { slugify } from "@/lib/utils/slug";

export type ReviewFilters = {
  search: string;
  status: "all" | FoundOpportunityCandidate["status"];
  category: string;
  country: string;
};

export function filterFoundOpportunities(
  items: FoundOpportunityCandidate[],
  filters: ReviewFilters
): FoundOpportunityCandidate[] {
  const q = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.status !== "all" && item.status !== filters.status) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.country && item.country !== filters.country) return false;

    if (!q) return true;
    const inTitle = item.sourceTitle.toLowerCase().includes(q);
    const inDomain = item.sourceDomain.toLowerCase().includes(q);
    const inSourceName = (item.sourceName ?? "").toLowerCase().includes(q);
    return inTitle || inDomain || inSourceName;
  });
}

export function countByStatus(
  items: FoundOpportunityCandidate[]
): Record<FoundOpportunityCandidate["status"], number> {
  return items.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 }
  );
}

export function getReviewWarnings(item: FoundOpportunityCandidate): string[] {
  const warnings: string[] = [];
  if (!item.deadline) warnings.push("Son tarih eksik");
  if (!item.country) warnings.push("Ülke bilgisi eksik");
  if (item.confidence !== undefined && item.confidence < 0.6) {
    warnings.push("Düşük güven skoru");
  }
  return warnings;
}

export function createOpportunityFromCandidate(
  candidate: FoundOpportunityCandidate,
  draft: PublishDraft
): Opportunity {
  return {
    id: `opp-${candidate.id}`,
    slug: slugify(draft.title),
    title: draft.title,
    shortDescription: draft.shortDescription,
    fullDescription: draft.fullDescription,
    externalLink: candidate.sourceUrl,
    country: candidate.country ?? "",
    category: candidate.category,
    deadline: candidate.deadline ?? "",
    publishedAt: new Date().toISOString().split("T")[0],
    featured: draft.featured,
    coverImage: draft.coverImage,
  };
}
