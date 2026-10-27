import type { SiteSettings } from "@/lib/site";
import { getSettingsRecord, putSettingsRecord } from "@/lib/store/settingsStore";
import { validateEmail, validateHttpUrl } from "@/lib/utils/validate";
import { type FieldErrors, storageSuffix, text } from "@/lib/admin/common";

export type SettingsResult =
  | { ok: true; settings: SiteSettings; message: string }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export async function readSettings(): Promise<SiteSettings> {
  return await getSettingsRecord();
}

/** All five values stay required so the community/social elements are never emptied out. */
export async function saveSettings(input: unknown): Promise<SettingsResult> {
  const r = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const s: SiteSettings = {
    communityFormUrl: text(r.communityFormUrl, 2100),
    instagramUrl: text(r.instagramUrl, 2100),
    linkedinUrl: text(r.linkedinUrl, 2100),
    contactEmail: text(r.contactEmail, 300),
    location: text(r.location, 300),
  };
  const e: FieldErrors = {};
  for (const key of ["communityFormUrl", "instagramUrl", "linkedinUrl"] as const) {
    e[key] = s[key] ? (validateHttpUrl(s[key]) ?? "") : "Bu alan boş bırakılamaz.";
    if (!e[key]) delete e[key];
  }
  if (!s.contactEmail) e.contactEmail = "Bu alan boş bırakılamaz.";
  else {
    const err = validateEmail(s.contactEmail);
    if (err) e.contactEmail = err;
  }
  if (!s.location) e.location = "Bu alan boş bırakılamaz.";
  else if (s.location.length > 100) e.location = "Konum en fazla 100 karakter olabilir.";

  if (Object.keys(e).length > 0) {
    return { ok: false, message: `Kaydedilemedi: ${Object.keys(e).length} alan düzeltilmeli.`, fieldErrors: e };
  }
  await putSettingsRecord(s);
  return { ok: true, settings: s, message: `Ayarlar kaydedildi; navigasyon, topluluk daveti, alt bilgi ve iletişim sayfası güncellendi.${storageSuffix()}` };
}
