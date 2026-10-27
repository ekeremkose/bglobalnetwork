import { storeMode } from "@/lib/db/mode";
import type { PublishStatus } from "@/lib/types/content";
import { slugify } from "@/lib/utils/slug";
import { validateSlug } from "@/lib/utils/validate";

/** Keys are form field names; values are Turkish messages shown next to the field. */
export type FieldErrors = Record<string, string>;

/**
 * What the editor asks for:
 * - draft:     "Taslağı kaydet"            (record stays/becomes Taslak)
 * - publish:   "Yayımla"                    (full validation, becomes Yayında)
 * - save:      "Değişiklikleri kaydet"      (keeps the current state)
 * - unpublish: "Yayından kaldır"            (saves the form as Taslak)
 */
export type SaveIntent = "draft" | "publish" | "save" | "unpublish";
export const SAVE_INTENTS: SaveIntent[] = ["draft", "publish", "save", "unpublish"];

export type SaveResult<T> =
  | { ok: true; item: T; items: T[]; message: string }
  | { ok: false; message: string; fieldErrors?: FieldErrors; items?: T[] };

export type MutationResult<T> =
  | { ok: true; items: T[]; message: string }
  | { ok: false; message: string; items?: T[] };

/** Only the local in-memory store is temporary; the database is the real thing. */
export function storageSuffix() {
  return storeMode() === "memory" ? " Geçici depolama: sunucu yeniden başlayınca sıfırlanır." : "";
}

export const nowIso = () => new Date().toISOString();
export const todayIso = () => new Date().toISOString().slice(0, 10);

/** Coerces untrusted action input to a trimmed string (never throws). */
export function text(value: unknown, max = 100000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Keeps line breaks (descriptions/body) but trims the ends. */
export function longText(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim().slice(0, max) : "";
}

export function isSaveIntent(v: unknown): v is SaveIntent {
  return typeof v === "string" && (SAVE_INTENTS as string[]).includes(v);
}

/**
 * Id shape accepted for a request.
 * - "create": must look like an id the editor generates (`prefix-<uuid>`), so a create request can never
 *   target a short legacy id and overwrite a seed record.
 * - "update": any well-formed id; legacy ids such as `opp-1` exist, and a missing record is reported
 *   separately as "kayıt artık yok".
 */
export function validId(prefix: string, v: unknown, mode: "create" | "update"): v is string {
  if (typeof v !== "string") return false;
  const length = mode === "create" ? "{6,60}" : "{1,60}";
  return new RegExp(`^${prefix}-[A-Za-z0-9-]${length}$`).test(v);
}

export function resolveStatus(
  existing: { status: PublishStatus } | undefined,
  intent: SaveIntent
): { status: PublishStatus } | { error: string } {
  switch (intent) {
    case "publish":
      return { status: "published" };
    case "draft":
      return existing?.status === "published"
        ? { error: "Yayındaki içerik taslak olarak kaydedilemez. Önce “Yayından kaldır”ı kullanın." }
        : { status: "draft" };
    case "unpublish":
      return existing ? { status: "draft" } : { error: "Henüz kaydedilmemiş içerik yayından kaldırılamaz." };
    case "save":
      return { status: existing?.status ?? "draft" };
  }
}

/**
 * Picks the address of a record.
 * - an explicit address must be well-formed and unused by another record of the same type
 * - without one, an existing record keeps its address; a new one is derived from the title
 * - a published record's address never changes while it stays published
 */
export function resolveSlug(opts: {
  requested: string;
  title: string;
  existing?: { slug: string; status: PublishStatus };
  nextStatus: PublishStatus;
  isTaken: (slug: string) => boolean;
}): { slug: string } | { error: string } {
  const { requested, title, existing, nextStatus, isTaken } = opts;
  let slug = requested;

  if (slug) {
    const err = validateSlug(slug);
    if (err) return { error: err };
    if (isTaken(slug)) return { error: "Bu adres başka bir kayıtta kullanılıyor. Farklı bir adres yazın." };
  } else if (existing?.slug) {
    slug = existing.slug;
  } else {
    const base = slugify(title);
    if (!base) return { error: "Başlıktan adres üretilemedi; adresi elle yazın." };
    slug = base.slice(0, 120);
    for (let i = 2; isTaken(slug); i++) slug = `${base.slice(0, 110)}-${i}`;
  }

  if (existing?.status === "published" && nextStatus === "published" && slug !== existing.slug) {
    return {
      error:
        "Yayındaki içeriğin adresi değiştirilemez; mevcut bağlantılar bozulur. Değiştirmek için önce yayından kaldırın.",
    };
  }
  return { slug };
}

export function summarizeErrors(fieldErrors: FieldErrors, publishing: boolean): string {
  const n = Object.keys(fieldErrors).length;
  return `${publishing ? "Yayımlanamadı" : "Kaydedilemedi"}: ${n} alan düzeltilmeli.`;
}
