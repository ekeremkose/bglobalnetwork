import { neon } from "@neondatabase/serverless";
import { StoreConfigError } from "@/lib/db/mode";

export type Row = Record<string, unknown>;

/** The only thing the stores need from a database: one parameterised statement per call. */
export interface DbDriver {
  query(text: string, params?: unknown[]): Promise<Row[]>;
}

type Globals = typeof globalThis & { __bglobalDbDriver?: DbDriver; __bglobalNeon?: { url: string; driver: DbDriver } };

/** Tests and scripts only: route every query to an in-process database. */
export function setDbDriver(driver: DbDriver | undefined) {
  (globalThis as Globals).__bglobalDbDriver = driver;
}

export function db(): DbDriver {
  const g = globalThis as Globals;
  if (g.__bglobalDbDriver) return g.__bglobalDbDriver;
  const url = process.env.DATABASE_URL;
  if (!url) throw new StoreConfigError("DATABASE_URL tanımlı değil.");
  if (!g.__bglobalNeon || g.__bglobalNeon.url !== url) {
    const sql = neon(url);
    g.__bglobalNeon = { url, driver: { query: async (text, params = []) => (await sql.query(text, params)) as Row[] } };
  }
  return g.__bglobalNeon.driver;
}

/** Postgres unique_violation, with the constraint that fired. */
export function uniqueViolation(err: unknown): string | null {
  const e = err as { code?: string; constraint?: string; message?: string } | null;
  if (e?.code !== "23505") return null;
  return e.constraint ?? e.message ?? "unique";
}
