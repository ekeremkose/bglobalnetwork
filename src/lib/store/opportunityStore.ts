import type { Opportunity } from "@/lib/types/content";
import { opportunities as mockOpportunities } from "@/lib/data/opportunities";

/**
 * Full CRUD in-memory store for opportunities.
 * Initialized from static mock on first access.
 * Uses globalThis to persist across Next.js dev hot reloads.
 * Replace internals with DB/CMS calls when backend is ready.
 */

type GlobalStore = typeof globalThis & {
  __opportunities?: Map<string, Opportunity>;
};

function getStore(): Map<string, Opportunity> {
  const g = globalThis as GlobalStore;
  if (!g.__opportunities) {
    g.__opportunities = new Map(mockOpportunities.map((o) => [o.id, o]));
  }
  return g.__opportunities;
}

export function getAllOpportunities(): Opportunity[] {
  return Array.from(getStore().values()).sort((a, b) => {
    const at = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    if (at !== bt) return bt - at;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

export function addOpportunity(o: Opportunity): void {
  getStore().set(o.id, o);
}

export function updateOpportunity(o: Opportunity): void {
  getStore().set(o.id, o);
}

export function removeOpportunity(id: string): void {
  getStore().delete(id);
}
