/** Small helpers shared by the Postgres stores. */
export const iso = (v: unknown): string | undefined =>
  v == null || v === "" ? undefined : new Date(v as string | number | Date).toISOString();

export const orUndef = <T>(v: T | null | undefined): T | undefined => (v == null ? undefined : v);

export class SlugTakenError extends Error {
  constructor() {
    super("slug_taken");
    this.name = "SlugTakenError";
  }
}
