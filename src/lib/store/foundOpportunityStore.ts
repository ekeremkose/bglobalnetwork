import type { ReviewStatus } from "@/lib/types/foundOpportunity";

/**
 * In-memory store for candidate status overrides.
 * Mock phase only — persists across Next.js dev hot reloads via globalThis.
 * Replace with DB/CMS write when backend is ready.
 */

type GlobalStore = typeof globalThis & {
  __candidateStatuses?: Map<string, ReviewStatus>;
};

function getStore(): Map<string, ReviewStatus> {
  const g = globalThis as GlobalStore;
  if (!g.__candidateStatuses) {
    g.__candidateStatuses = new Map();
  }
  return g.__candidateStatuses;
}

export function setCandidateStatus(id: string, status: ReviewStatus): void {
  getStore().set(id, status);
}

export function getCandidateStatuses(): Map<string, ReviewStatus> {
  return new Map(getStore());
}
