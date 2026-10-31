import { revalidatePath, revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/cache";
import { getAdminSession } from "@/lib/auth/guard";
import { MAINTENANCE_ACTION_MESSAGE, maintenanceOn } from "@/lib/config/maintenance";

/**
 * Drops every cached content read and re-renders the public pages after a change,
 * so lists, counts, detail pages, related content and the navbar/footer settings
 * never serve a stale copy.
 */
export function refreshSite() {
  revalidateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

const FAILED = "Sunucu hatası: işlem tamamlanamadı. Girdileriniz korundu, tekrar deneyin.";
const UNAUTHORIZED = "Oturumunuz sona ermiş ya da bu işlem için yetkiniz yok. Sayfayı yenileyip yeniden giriş yapın.";

/**
 * Every admin server action runs through here: the caller must be the signed-in,
 * allow-listed administrator *before* the service runs. Unexpected errors become a normal
 * failure result instead of a crash.
 */
export async function guard<R extends { ok: boolean }>(
  run: () => Promise<R>,
  fallback: (message: string) => R
): Promise<R> {
  // The service must not even start during maintenance, session or not.
  if (maintenanceOn()) return fallback(MAINTENANCE_ACTION_MESSAGE);
  if (!(await getAdminSession())) return fallback(UNAUTHORIZED);
  try {
    const result = await run();
    if (result.ok) refreshSite();
    return result;
  } catch (err) {
    console.error("[admin action]", err);
    return fallback(FAILED);
  }
}
