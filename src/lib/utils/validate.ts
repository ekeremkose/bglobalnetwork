import mediaHosts from "@/lib/mediaHosts.json";

const { remoteImageHosts } = mediaHosts;

/** Pure validators shared by the admin forms and the server actions. Each returns an error message or null. */

export const MAX_URL_LENGTH = 2000;

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function validateDate(value: string): string | null {
  return isIsoDate(value) ? null : "Geçerli bir tarih girin (GG.AA.YYYY).";
}

/** Only absolute http(s) URLs: no javascript:, data:, blob: or credentials in the URL. */
export function validateHttpUrl(value: string): string | null {
  if (value.length > MAX_URL_LENGTH) return "Bağlantı çok uzun.";
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "Geçerli bir bağlantı girin (https://… ile başlamalı).";
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return "Bağlantı http:// veya https:// ile başlamalı.";
  }
  if (url.username || url.password) return "Bağlantıda kullanıcı adı/parola olamaz.";
  return null;
}

/** An Instagram post/Reel address, e.g. https://www.instagram.com/reel/XXXX/. */
export function validateInstagramUrl(value: string): string | null {
  const err = validateHttpUrl(value);
  if (err) return err;
  const url = new URL(value);
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "instagram.com") return "Instagram bağlantısı (instagram.com) girin.";
  if (!/^\/(reel|reels|p)\/[^/]+/.test(url.pathname)) {
    return "Bağlantı bir Reel/gönderi adresi olmalı (…/reel/XXXX/).";
  }
  return null;
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSlug(value: string): string | null {
  if (value.length > 120) return "Adres en fazla 120 karakter olabilir.";
  if (!SLUG_PATTERN.test(value)) {
    return "Adres yalnızca küçük harf, rakam ve tire içerebilir (örn. erasmus-staj-2026).";
  }
  return null;
}

export function validateEmail(value: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 200
    ? null
    : "Geçerli bir e-posta adresi girin.";
}

export const COVER_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "gif"];
export const ALLOWED_COVER_HOSTS: string[] = remoteImageHosts;

/** Exact host, or "*.suffix" for exactly one label in front of the suffix (the same rule next/image uses). */
export function hostAllowed(hostname: string, pattern: string): boolean {
  if (!pattern.startsWith("*.")) return hostname === pattern;
  const suffix = pattern.slice(1);
  return hostname.endsWith(suffix) && !hostname.slice(0, -suffix.length).includes(".") && hostname.length > suffix.length;
}

export type CoverKind = "none" | "local" | "remote";

/**
 * Covers are either a root-relative file under public/ ("/reels/ornek.jpg") or
 * an https URL on an allowed host (next.config.js allows exactly these hosts;
 * anything else would crash next/image on the public page).
 */
export function checkCover(
  value: string
): { ok: true; kind: CoverKind } | { ok: false; message: string } {
  const v = value.trim();
  if (!v) return { ok: true, kind: "none" };
  if (/^(blob|data|file|javascript):/i.test(v)) {
    return {
      ok: false,
      message:
        "Tarayıcıda oluşturulan (blob/data) veya yerel dosya adresleri kullanılamaz. Görseli /reels/ klasörüne koyup /reels/dosya.jpg yazın ya da izinli bir sunucudan https bağlantısı girin.",
    };
  }
  if (v.startsWith("/")) {
    if (v.startsWith("//") || v.includes("..") || v.includes("\\") || /[?#]/.test(v)) {
      return { ok: false, message: "Yerel görsel yolu /reels/dosya.jpg biçiminde olmalı." };
    }
    if (!/^\/[A-Za-z0-9._\-/]+$/.test(v)) {
      return { ok: false, message: "Yerel görsel yolu yalnızca harf, rakam, ., _, - ve / içerebilir." };
    }
    const ext = v.split(".").pop()?.toLowerCase() ?? "";
    if (!COVER_EXTENSIONS.includes(ext)) {
      return { ok: false, message: `Desteklenen görsel türleri: ${COVER_EXTENSIONS.join(", ")}.` };
    }
    return { ok: true, kind: "local" };
  }
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return { ok: false, message: "Kapak, /reels/dosya.jpg gibi bir yol ya da https:// bağlantısı olmalı." };
  }
  if (url.protocol !== "https:") return { ok: false, message: "Uzak kapak bağlantısı https:// olmalı." };
  if (v.length > MAX_URL_LENGTH) return { ok: false, message: "Bağlantı çok uzun." };
  if (!ALLOWED_COVER_HOSTS.some((p) => hostAllowed(url.hostname, p))) {
    return {
      ok: false,
      message: `“${url.hostname}” sunucusundan görsel kullanılamıyor. İzinli sunucular: ${ALLOWED_COVER_HOSTS.join(", ")}. Başka bir kaynak için görseli /reels/ klasörüne koyup yolunu yazın ya da sunucuyu next.config.js’e ekletin.`,
    };
  }
  return { ok: true, kind: "remote" };
}

export function validateCover(value: string): string | null {
  const r = checkCover(value);
  return r.ok ? null : r.message;
}
