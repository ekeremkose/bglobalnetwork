import { SlugTakenError } from "@/lib/store/pgUtil";
import type { Opportunity } from "@/lib/types/content";
import {
  deleteOpportunityRecord,
  getAllOpportunities,
  getOpportunityRecord,
  putOpportunityRecord,
} from "@/lib/store/opportunityStore";
import { getAllReels, putReelRecord } from "@/lib/store/reelStore";
import { getCategoryBySlug } from "@/lib/repositories/categoryRepository";
import { getCountryByCode } from "@/lib/repositories/countryRepository";
import { adminListOpportunities } from "@/lib/repositories/adminRepository";
import { validateDate, validateHttpUrl } from "@/lib/utils/validate";
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

export type OpportunityFields = {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  country: string;
  category: string;
  deadline: string;
  externalLink: string;
  relatedReelIds: string[];
};

export type OpportunityInput = {
  id: string;
  mode: "create" | "update";
  intent: SaveIntent;
  fields: OpportunityFields;
};

const LABELS: Record<string, string> = {
  title: "Başlık",
  shortDescription: "Kısa açıklama",
  fullDescription: "Tam açıklama",
  country: "Ülke",
  category: "Kategori",
  deadline: "Son tarih",
  externalLink: "Başvuru bağlantısı",
};

/** Required-for-publishing and format checks. Drafts only need a title. */
export function validateOpportunity(f: OpportunityFields, publishing: boolean): FieldErrors {
  const e: FieldErrors = {};
  const need = (key: keyof OpportunityFields) => {
    if (!f[key]) e[key] = `${LABELS[key]} yayımlamak için gerekli.`;
  };

  if (!f.title) e.title = "Başlık gerekli.";
  else if (f.title.length > 160) e.title = "Başlık en fazla 160 karakter olabilir.";

  if (publishing) (["shortDescription", "fullDescription", "country", "category", "deadline", "externalLink"] as const).forEach(need);

  if (f.country && !getCountryByCode(f.country)) e.country = "Listedeki ülkelerden birini seçin.";
  if (f.category && !getCategoryBySlug(f.category)) e.category = "Listedeki kategorilerden birini seçin.";
  if (f.deadline) {
    const err = validateDate(f.deadline);
    if (err) e.deadline = err;
  }
  if (f.externalLink) {
    const err = validateHttpUrl(f.externalLink);
    if (err) e.externalLink = err;
  }
  if (f.shortDescription.length > 400) e.shortDescription = "Kısa açıklama en fazla 400 karakter olabilir.";
  if (f.fullDescription.length > 10000) e.fullDescription = "Tam açıklama en fazla 10.000 karakter olabilir.";
  return e;
}

function readFields(raw: unknown): OpportunityFields | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const related = Array.isArray(r.relatedReelIds) ? r.relatedReelIds : [];
  return {
    title: text(r.title, 400),
    slug: text(r.slug, 200),
    shortDescription: longText(r.shortDescription, 2000),
    fullDescription: longText(r.fullDescription, 20000),
    country: text(r.country, 10),
    category: text(r.category, 60),
    deadline: text(r.deadline, 20),
    externalLink: text(r.externalLink, 2100),
    relatedReelIds: related.filter((x): x is string => typeof x === "string").slice(0, 50),
  };
}

export async function listOpportunities() {
  return await adminListOpportunities();
}

export async function saveOpportunity(input: unknown): Promise<SaveResult<Opportunity>> {
  const raw = (input ?? {}) as Partial<OpportunityInput>;
  const fields = readFields(raw.fields);
  if (!fields || !isSaveIntent(raw.intent) || (raw.mode !== "create" && raw.mode !== "update") || !validId("opp", raw.id, raw.mode)) {
    return { ok: false, message: "Geçersiz istek. Sayfayı yenileyip tekrar deneyin." };
  }
  const { id, mode, intent } = raw as OpportunityInput;
  const existing = await getOpportunityRecord(id);

  if (mode === "update" && !existing) {
    return {
      ok: false,
      message: "Bu kayıt artık yok (silinmiş olabilir). Liste yenilendi; girdileriniz formda duruyor.",
      items: await listOpportunities(),
    };
  }

  const st = resolveStatus(existing, intent);
  if ("error" in st) return { ok: false, message: st.error };
  const publishing = st.status === "published";

  const fieldErrors = validateOpportunity(fields, publishing);

  const knownReels = new Set((await getAllReels()).map((r) => r.id));
  const related = Array.from(new Set(fields.relatedReelIds));
  if (related.some((rid) => !knownReels.has(rid))) {
    fieldErrors.relatedReelIds = "Seçilen Reels'lerden biri artık yok. Seçimi güncelleyin.";
  }

  const takenSlugs = new Set((await getAllOpportunities()).filter((x) => x.id !== id).map((x) => x.slug));
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

  const item: Opportunity = {
    ...(existing ?? {}),
    id,
    status: st.status,
    slug: slug.slug,
    title: fields.title,
    shortDescription: fields.shortDescription,
    fullDescription: fields.fullDescription,
    country: fields.country,
    category: fields.category,
    deadline: fields.deadline,
    externalLink: fields.externalLink,
    relatedReelIds: related,
    publishedAt: existing?.publishedAt ?? todayIso(),
    updatedAt: nowIso(),
  };
  try {
    await putOpportunityRecord(item);
  } catch (err) {
    if (err instanceof SlugTakenError) {
      const fieldErrors = { slug: "Bu adres başka bir kayıtta kullanılıyor. Farklı bir adres yazın." };
      return { ok: false, message: summarizeErrors(fieldErrors, publishing), fieldErrors };
    }
    throw err;
  }

  const message =
    intent === "publish"
      ? "Yayımlandı. Site güncellendi."
      : intent === "unpublish"
        ? "Yayından kaldırıldı; kayıt taslak olarak duruyor."
        : item.status === "published"
          ? "Değişiklikler kaydedildi ve sitede güncellendi."
          : "Taslak kaydedildi (sitede görünmez).";
  return { ok: true, item, items: await listOpportunities(), message: `${message}${storageSuffix()}` };
}

export async function setOpportunityStatus(id: unknown, status: unknown): Promise<SaveResult<Opportunity>> {
  const existing = typeof id === "string" ? await getOpportunityRecord(id) : undefined;
  if (!existing) return { ok: false, message: "Kayıt bulunamadı.", items: await listOpportunities() };
  if (status === "draft") {
    const item = { ...existing, status: "draft" as const, updatedAt: nowIso() };
    await putOpportunityRecord(item);
    return { ok: true, item, items: await listOpportunities(), message: `“${item.title}” yayından kaldırıldı; taslak olarak duruyor.` };
  }
  if (status === "published") {
    const fields: OpportunityFields = {
      title: existing.title,
      slug: existing.slug,
      shortDescription: existing.shortDescription,
      fullDescription: existing.fullDescription,
      country: existing.country,
      category: existing.category,
      deadline: existing.deadline,
      externalLink: existing.externalLink,
      relatedReelIds: existing.relatedReelIds ?? [],
    };
    const errors = validateOpportunity(fields, true);
    if (Object.keys(errors).length > 0) {
      const names = Object.keys(errors).map((k) => LABELS[k] ?? k).join(", ");
      return { ok: false, message: `“${existing.title}” yayımlanamadı. Eksik veya hatalı: ${names}. Düzenleyip tekrar deneyin.`, items: await listOpportunities() };
    }
    const item = { ...existing, status: "published" as const, updatedAt: nowIso() };
    await putOpportunityRecord(item);
    return { ok: true, item, items: await listOpportunities(), message: `“${item.title}” yayımlandı.` };
  }
  return { ok: false, message: "Geçersiz istek." };
}

export async function removeOpportunity(id: unknown): Promise<MutationResult<Opportunity>> {
  const existing = typeof id === "string" ? await getOpportunityRecord(id) : undefined;
  if (!existing) {
    return { ok: false, message: "Bu kayıt zaten yok. Liste yenilendi.", items: await listOpportunities() };
  }
  await deleteOpportunityRecord(existing.id);
  // Keep Reels from pointing at a deleted opportunity.
  for (const reel of await getAllReels()) {
    if (reel.relatedOpportunityIds?.includes(existing.id)) {
      await putReelRecord({ ...reel, relatedOpportunityIds: reel.relatedOpportunityIds.filter((x) => x !== existing.id) });
    }
  }
  return { ok: true, items: await listOpportunities(), message: `“${existing.title}” silindi.` };
}

