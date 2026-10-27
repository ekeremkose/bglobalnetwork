import type { SiteSettings } from "@/lib/site";
import { cachedRead } from "@/lib/cache";
import { getSettingsRecord } from "@/lib/store/settingsStore";

/** Current site-wide settings (community form, social links, contact details). */
export const getSiteSettings = cachedRead(async (): Promise<SiteSettings> => getSettingsRecord(), ["site-settings"]);
