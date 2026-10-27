import { SITE_DEFAULTS, type SiteSettings } from "@/lib/site";
import { getMemoryMap } from "@/lib/store/createStore";
import { storeMode } from "@/lib/db/mode";
import { db } from "@/lib/db/driver";

/** Local-development backend (see db/mode.ts). Starts from the placeholder defaults in lib/site.ts. */
const memory = () => getMemoryMap<SiteSettings>("settings", () => [["site", { ...SITE_DEFAULTS }]]);

/** Stored values over the defaults; a database without a settings row serves the defaults. */
export async function getSettingsRecord(): Promise<SiteSettings> {
  if (storeMode() === "memory") return memory().get("site") ?? { ...SITE_DEFAULTS };
  const rows = await db().query(`select value from site_settings where key = 'site'`);
  return { ...SITE_DEFAULTS, ...((rows[0]?.value as Partial<SiteSettings> | undefined) ?? {}) };
}

export async function putSettingsRecord(s: SiteSettings): Promise<void> {
  if (storeMode() === "memory") {
    memory().set("site", s);
    return;
  }
  await db().query(
    `insert into site_settings (key, value, updated_at) values ('site', $1::jsonb, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify(s)]
  );
}
