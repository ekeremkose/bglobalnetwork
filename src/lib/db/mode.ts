export type StoreMode = "postgres" | "memory";

export class StoreConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreConfigError";
  }
}

/** Test code injects its own driver (see driver.ts); that counts as a configured database. */
export function hasInjectedDriver() {
  return !!(globalThis as { __bglobalDbDriver?: unknown }).__bglobalDbDriver;
}

/**
 * Which backend holds the content.
 * - DATABASE_URL (or an injected test driver) → Postgres.
 * - ALLOW_MEMORY_STORE=1 → process memory, for local development, tests and the
 *   local build check only. Refused on Vercel, so a missing DATABASE_URL in
 *   preview/production fails loudly instead of serving (and losing) seed data.
 * - anything else → error.
 */
export function storeMode(): StoreMode {
  if (process.env.DATABASE_URL || hasInjectedDriver()) return "postgres";
  if (process.env.ALLOW_MEMORY_STORE === "1" && !process.env.VERCEL) return "memory";
  throw new StoreConfigError(
    process.env.VERCEL
      ? "DATABASE_URL tanımlı değil. Vercel ortamında bellek içi depolama kullanılamaz."
      : "DATABASE_URL tanımlı değil. Yerel geliştirme için .env.local içine ALLOW_MEMORY_STORE=1 yazın ya da bir DATABASE_URL verin."
  );
}
