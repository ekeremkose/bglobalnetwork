import { initialFoundOpportunities } from "@data/found-opportunities";
import type { FoundOpportunityCandidate } from "@/lib/types/foundOpportunity";
import { getCandidateStatuses } from "@/lib/store/foundOpportunityStore";

/**
 * Data access for AI-discovered candidates.
 * Today: static mock. Later: Sanity / DB fetch — keep this API stable.
 */
export function getFoundOpportunityCandidates(): FoundOpportunityCandidate[] {
  const overrides = getCandidateStatuses();
  return initialFoundOpportunities.map((item) =>
    overrides.has(item.id) ? { ...item, status: overrides.get(item.id)! } : item
  );
}
