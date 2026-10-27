import { unstable_cache } from "next/cache";

/** Every public read is tagged, so one revalidateTag() after an admin change refreshes them all. */
export const CONTENT_TAG = "content";

/**
 * Caches a public (draft-free) read in Next's data cache. Pages that use it
 * can be prerendered and served from the edge; admin changes call refreshSite()
 * to drop the cache, and the hourly expiry covers anything time-based.
 * Scripts that run outside Next set BGLOBAL_NO_NEXT_CACHE=1 to call straight through.
 */
export function cachedRead<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyParts: string[]
): (...args: A) => Promise<R> {
  if (process.env.BGLOBAL_NO_NEXT_CACHE === "1") return fn;
  return unstable_cache(fn, keyParts, { tags: [CONTENT_TAG], revalidate: 3600 });
}
