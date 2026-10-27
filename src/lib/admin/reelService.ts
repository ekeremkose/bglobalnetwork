import fs from "node:fs";
import path from "node:path";
import { SlugTakenError } from "@/lib/store/pgUtil";
import type { Reel } from "@/lib/types/content";
import {
  deleteReelRecord,
  getAllReels,
  getReelRecord,
  putReelRecord,
} from "@/lib/store/reelStore";
import { getAllOpportunities, putOpportunityRecord } from "@/lib/store/opportunityStore";
import { releaseCover } from "@/lib/admin/mediaCleanup";
import { adminListReels } from "@/lib/repositories/adminRepository";
import { checkCover, validateDate, validateInstagramUrl } from "@/lib/utils/validate";
import {
  type FieldErrors,
  type MutationResult,
  type SaveIntent,
  type SaveResult,
  storageSuffix,
  isSaveIntent,
  longText,
  nowIso,
  resolveSlug,
  resolveStatus,
  summarizeErrors,
  text,
  todayIso,
  validId,
} from "@/lib/admin/common";

export type ReelFields = {
  title: string;
  slug: string;
  shortDescription: string;
  instagramUrl: string;
  tag: string;
  publishedAt: string;
  thumbnail: string;
  featured: boolean;
};

export type ReelInput = {
  id: string;
  mode: "create" | "update";
  intent: SaveIntent;
  fields: ReelFields;
};

const LABELS: Record<string, string> = {
  title: "Başlık",
  shortDescription: "Açıklama",
  instagramUrl: "Instagram bağlantısı",
  tag: "Etiket",
  publishedAt: "Yayın tarihi",
};

/** A root-relative cover must exist under public/ before the Reel goes live. */
function localCoverExists(cover: string) {
  const file = path.join(process.cwd(), "public", cover);
  return file.startsWith(path.join(process.cwd(), "public") + path.sep) && fs.existsSync(file);
}

export function validateReel(f: ReelFields, publishing: boolean): FieldErrors {
  const e: FieldErrors = {};
  if (!f.title) e.title = "Başlık gerekli.";
  else if (f.title.length > 160) e.title = "Başlık en fazla 160 karakter olabilir.";

  if (publishing) {
    for (const key of ["shortDescription", "instagramUrl", "tag", "publishedAt"] as const) {
      if (!f[key]) e[key] = `${LABELS[key]} yayımlamak için gerekli.`;
    }
  }
  if (f.instagramUrl) {
    const err = validateInstagramUrl(f.instagramUrl);
    if (err) e.instagramUrl = err;
  }
  if (f.publishedAt) {
    const err = validateDate(f.publishedAt);
    if (err) e.publishedAt = err;
  }
  if (f.tag.length > 40) e.tag = "Etiket en fazla 40 karakter olabilir.";
  if (f.shortDescription.length > 400) e.shortDescription = "Açıklama en fazla 400 karakter olabilir.";

  const cover = checkCover(f.thumbnail);
  if (!cover.ok) e.thumbnail = cover.message;
  else if (publishing && cover.kind === "local" && !localCoverExists(f.thumbnail)) {
    e.thumbnail = `public${f.thumbnail} dosyası bulunamadı. Görseli o klasöre koyun ya da kapağı boş bırakıp yer tutucuyu kullanın.`;
  }
  return e;
}

function readFields(raw: unknown): ReelFields | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    title: text(r.title, 400),
    slug: text(r.slug, 200),
    shortDescription: longText(r.shortDescription, 2000),
    instagramUrl: text(r.instagramUrl, 2100),
    tag: text(r.tag, 100),
    publishedAt: text(r.publishedAt, 20),
    thumbnail: text(r.thumbnail, 2100),
    featured: r.featured === true,
  };
}

export const listReels = async () => await adminListReels();

export async function saveReel(input: unknown): Promise<SaveResult<Reel>> {
  const raw = (input ?? {}) as Partial<ReelInput>;
  const fields = readFields(raw.fields);
  if (!fields || !isSaveIntent(raw.intent) || (raw.mode !== "create" && raw.mode !== "update") || !validId("reel", raw.id, raw.mode)) {
    return { ok: false, message: "Geçersiz istek. Sayfayı yenileyip tekrar deneyin." };
  }
  const { id, mode, intent } = raw as ReelInput;
  const existing = await getReelRecord(id);

  if (mode === "update" && !existing) {
    return {
      ok: false,
      message: "Bu kayıt artık yok (silinmiş olabilir). Liste yenilendi; girdileriniz formda duruyor.",
      items: await listReels(),
    };
  }

  const st = resolveStatus(existing, intent);
  if ("error" in st) return { ok: false, message: st.error };
  const publishing = st.status === "published";

  const fieldErrors = validateReel(fields, publishing);
  const takenSlugs = new Set((await getAllReels()).filter((x) => x.id !== id).map((x) => x.slug));
  const slug = resolveSlug({
    requested: fields.slug,
    title: fields.title,
    existing,
    nextStatus: st.status,
    isTaken: (s) => takenSlugs.has(s),
  });
  if ("error" in slug) fieldErrors.slug = slug.error;

  if (Object.keys(fieldErrors).length > 0 || "error" in slug) {
    return { ok: false, message: summarizeErrors(fieldErrors, publishing), fieldErrors };
  }

  const item: Reel = {
    ...(existing ?? {}),
    id,
    status: st.status,
    slug: slug.slug,
    title: fields.title,
    shortDescription: fields.shortDescription,
    instagramUrl: fields.instagramUrl,
    tag: fields.tag,
    publishedAt: fields.publishedAt || existing?.publishedAt || todayIso(),
    thumbnail: fields.thumbnail || undefined,
    featured: fields.featured,
    updatedAt: nowIso(),
  };
  try {
    await putReelRecord(item);
  } catch (err) {
    if (err instanceof SlugTakenError) {
      const fieldErrors = { slug: "Bu adres başka bir kayıtta kullanılıyor. Farklı bir adres yazın." };
      return { ok: false, message: summarizeErrors(fieldErrors, publishing), fieldErrors };
    }
    throw err;
  }
  // A cover we uploaded earlier and that this save replaced or cleared is no longer referenced.
  if (existing?.thumbnail && existing.thumbnail !== item.thumbnail) await releaseCover(existing.thumbnail);

  const message =
    intent === "publish"
      ? "Yayımlandı. Site güncellendi."
      : intent === "unpublish"
        ? "Yayından kaldırıldı; kayıt taslak olarak duruyor."
        : item.status === "published"
          ? "Değişiklikler kaydedildi ve sitede güncellendi."
          : "Taslak kaydedildi (sitede görünmez).";
  return { ok: true, item, items: await listReels(), message: `${message}${storageSuffix()}` };
}

export async function setReelStatus(id: unknown, status: unknown): Promise<SaveResult<Reel>> {
  const existing = typeof id === "string" ? await getReelRecord(id) : undefined;
  if (!existing) return { ok: false, message: "Kayıt bulunamadı.", items: await listReels() };
  if (status === "draft") {
    const item = { ...existing, status: "draft" as const, updatedAt: nowIso() };
    await putReelRecord(item);
    return { ok: true, item, items: await listReels(), message: `“${item.title}” yayından kaldırıldı; taslak olarak duruyor.` };
  }
  if (status === "published") {
    const errors = validateReel(
      {
        title: existing.title,
        slug: existing.slug,
        shortDescription: existing.shortDescription,
        instagramUrl: existing.instagramUrl,
        tag: existing.tag,
        publishedAt: existing.publishedAt,
        thumbnail: existing.thumbnail ?? "",
        featured: !!existing.featured,
      },
      true
    );
    if (Object.keys(errors).length > 0) {
      const names = Object.keys(errors).map((k) => LABELS[k] ?? (k === "thumbnail" ? "Kapak" : k)).join(", ");
      return { ok: false, message: `“${existing.title}” yayımlanamadı. Eksik veya hatalı: ${names}. Düzenleyip tekrar deneyin.`, items: await listReels() };
    }
    const item = { ...existing, status: "published" as const, updatedAt: nowIso() };
    await putReelRecord(item);
    return { ok: true, item, items: await listReels(), message: `“${item.title}” yayımlandı.` };
  }
  return { ok: false, message: "Geçersiz istek." };
}

export async function removeReel(id: unknown): Promise<MutationResult<Reel>> {
  const existing = typeof id === "string" ? await getReelRecord(id) : undefined;
  if (!existing) {
    return { ok: false, message: "Bu kayıt zaten yok. Liste yenilendi.", items: await listReels() };
  }
  await deleteReelRecord(existing.id);
  await releaseCover(existing.thumbnail);
  // Keep opportunities from pointing at a deleted Reel.
  for (const o of await getAllOpportunities()) {
    if (o.relatedReelIds?.includes(existing.id)) {
      await putOpportunityRecord({ ...o, relatedReelIds: o.relatedReelIds.filter((x) => x !== existing.id) });
    }
  }
  return { ok: true, items: await listReels(), message: `“${existing.title}” silindi.` };
}
