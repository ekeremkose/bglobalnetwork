import type { Reel } from "@/lib/types/content";
import { reels as mockReels } from "@/lib/data/reels";

/**
 * Full CRUD in-memory store for reels.
 * Initialized from static mock on first access.
 * Uses globalThis to persist across Next.js dev hot reloads.
 * Replace internals with DB/CMS calls when backend is ready.
 */

type GlobalStore = typeof globalThis & {
  __reels?: Map<string, Reel>;
};

function getStore(): Map<string, Reel> {
  const g = globalThis as GlobalStore;
  if (!g.__reels) {
    g.__reels = new Map(mockReels.map((r) => [r.id, r]));
  }
  return g.__reels;
}

export function getAllReels(): Reel[] {
  return Array.from(getStore().values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function addReel(r: Reel): void {
  getStore().set(r.id, r);
}

export function updateReel(r: Reel): void {
  getStore().set(r.id, r);
}

export function removeReel(id: string): void {
  getStore().delete(id);
}
