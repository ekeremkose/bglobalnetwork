import { SlugTakenError } from "@/lib/store/pgUtil";
import type { Announcement } from "@/lib/types/content";
import {
  deleteAnnouncementRecord,
  getAllAnnouncements,
  getAnnouncementRecord,
  putAnnouncementRecord,
} from "@/lib/store/announcementStore";
import { adminListAnnouncements } from "@/lib/repositories/adminRepository";
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

export type BlogFields = {
  title: string;
  slug: string;
  content: string;
  publishedAt: string;
  link: string;
};

export type BlogInput = {
  id: string;
  mode: "create" | "update";
  intent: SaveIntent;
  fields: BlogFields;
};

const LABELS: Record<string, string> = {
  title: "Başlık",
  content: "Yazı metni",
  publishedAt: "Yayın tarihi",
};

export function validateBlog(f: BlogFields, publishing: boolean): FieldErrors {
  const e: FieldErrors = {};
  if (!f.title) e.title = "Başlık gerekli.";
  else if (f.title.length > 160) e.title = "Başlık en fazla 160 karakter olabilir.";

  if (publishing) {
    if (!f.content) e.content = "Yazı metni yayımlamak için gerekli.";
    if (!f.publishedAt) e.publishedAt = "Yayın tarihi yayımlamak için gerekli.";
  }
  if (f.content.length > 30000) e.content = "Yazı en fazla 30.000 karakter olabilir.";
  if (f.publishedAt) {
    const err = validateDate(f.publishedAt);
    if (err) e.publishedAt = err;
  }
  if (f.link) {
    const err = validateHttpUrl(f.link);
    if (err) e.link = err;
  }
  return e;
}

function readFields(raw: unknown): BlogFields | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    title: text(r.title, 400),
    slug: text(r.slug, 200),
    content: longText(r.content, 40000),
    publishedAt: text(r.publishedAt, 20),
    link: text(r.link, 2100),
  };
}

export const listPosts = async () => await adminListAnnouncements();

export async function savePost(input: unknown): Promise<SaveResult<Announcement>> {
  const raw = (input ?? {}) as Partial<BlogInput>;
  const fields = readFields(raw.fields);
  if (!fields || !isSaveIntent(raw.intent) || (raw.mode !== "create" && raw.mode !== "update") || !validId("ann", raw.id, raw.mode)) {
    return { ok: false, message: "Geçersiz istek. Sayfayı yenileyip tekrar deneyin." };
  }
  const { id, mode, intent } = raw as BlogInput;
  const existing = await getAnnouncementRecord(id);

  if (mode === "update" && !existing) {
    return {
      ok: false,
      message: "Bu yazı artık yok (silinmiş olabilir). Liste yenilendi; girdileriniz formda duruyor.",
      items: await listPosts(),
    };
  }

  const st = resolveStatus(existing, intent);
  if ("error" in st) return { ok: false, message: st.error };
  const publishing = st.status === "published";

  const fieldErrors = validateBlog(fields, publishing);
  const takenSlugs = new Set((await getAllAnnouncements()).filter((x) => x.id !== id).map((x) => x.slug));
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

  const item: Announcement = {
    ...(existing ?? {}),
    id,
    status: st.status,
    slug: slug.slug,
    title: fields.title,
    content: fields.content,
    publishedAt: fields.publishedAt || existing?.publishedAt || todayIso(),
    link: fields.link || undefined,
    updatedAt: nowIso(),
  };
  try {
    await putAnnouncementRecord(item);
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
        ? "Yayından kaldırıldı; yazı taslak olarak duruyor."
        : item.status === "published"
          ? "Değişiklikler kaydedildi ve sitede güncellendi."
          : "Taslak kaydedildi (sitede görünmez).";
  return { ok: true, item, items: await listPosts(), message: `${message}${storageSuffix()}` };
}

export async function setPostStatus(id: unknown, status: unknown): Promise<SaveResult<Announcement>> {
  const existing = typeof id === "string" ? await getAnnouncementRecord(id) : undefined;
  if (!existing) return { ok: false, message: "Yazı bulunamadı.", items: await listPosts() };
  if (status === "draft") {
    const item = { ...existing, status: "draft" as const, updatedAt: nowIso() };
    await putAnnouncementRecord(item);
    return { ok: true, item, items: await listPosts(), message: `“${item.title}” yayından kaldırıldı; taslak olarak duruyor.` };
  }
  if (status === "published") {
    const errors = validateBlog(
      {
        title: existing.title,
        slug: existing.slug,
        content: existing.content,
        publishedAt: existing.publishedAt,
        link: existing.link ?? "",
      },
      true
    );
    if (Object.keys(errors).length > 0) {
      const names = Object.keys(errors).map((k) => LABELS[k] ?? (k === "link" ? "Kaynak bağlantısı" : k)).join(", ");
      return { ok: false, message: `“${existing.title}” yayımlanamadı. Eksik veya hatalı: ${names}. Düzenleyip tekrar deneyin.`, items: await listPosts() };
    }
    const item = { ...existing, status: "published" as const, updatedAt: nowIso() };
    await putAnnouncementRecord(item);
    return { ok: true, item, items: await listPosts(), message: `“${item.title}” yayımlandı.` };
  }
  return { ok: false, message: "Geçersiz istek." };
}

export async function removePost(id: unknown): Promise<MutationResult<Announcement>> {
  const existing = typeof id === "string" ? await getAnnouncementRecord(id) : undefined;
  if (!existing) {
    return { ok: false, message: "Bu yazı zaten yok. Liste yenilendi.", items: await listPosts() };
  }
  await deleteAnnouncementRecord(existing.id);
  return { ok: true, items: await listPosts(), message: `“${existing.title}” silindi.` };
}
