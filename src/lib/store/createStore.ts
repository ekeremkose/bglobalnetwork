/**
 * Temporary in-memory storage shared by every module graph of the server
 * process (Next bundles pages and server actions separately, so the map lives
 * on globalThis). Records are lost when the server restarts.
 *
 * Replace the internals with a database before production; callers only use
 * the functions exported by the individual stores.
 */
type GlobalStores = typeof globalThis & {
  __bglobalStores?: Record<string, Map<string, unknown>>;
};

export function getMemoryMap<T>(key: string, seed: () => [string, T][]): Map<string, T> {
  const g = globalThis as GlobalStores;
  g.__bglobalStores ??= {};
  if (!g.__bglobalStores[key]) {
    g.__bglobalStores[key] = new Map(seed()) as Map<string, unknown>;
  }
  return g.__bglobalStores[key] as Map<string, T>;
}
