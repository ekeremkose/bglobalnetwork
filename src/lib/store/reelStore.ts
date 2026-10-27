import type { Reel } from "@/lib/types/content";
import { reels as seed } from "@/lib/data/reels";
import { getMemoryMap } from "@/lib/store/createStore";
import { storeMode } from "@/lib/db/mode";
import { db, uniqueViolation, type Row } from "@/lib/db/driver";
import { iso, orUndef, SlugTakenError } from "@/lib/store/pgUtil";

/** Local-development backend (see db/mode.ts). Seed content starts as published. */
const memory = () =>
  getMemoryMap<Reel>("reels", () =>
    seed.map((r): [string, Reel] => [r.id, { ...r, status: r.status ?? "published" }])
  );

const byDate = (a: Reel, b: Reel) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

function fromRow(r: Row): Reel {
  return {
    id: r.id as string,
    status: r.status as Reel["status"],
    updatedAt: iso(r.updated_at),
    slug: r.slug as string,
    title: r.title as string,
    shortDescription: r.short_description as string,
    instagramUrl: r.instagram_url as string,
    thumbnail: orUndef(r.thumbnail as string | null),
    tag: r.tag as string,
    featured: orUndef(r.featured as boolean | null),
    publishedAt: r.published_at as string,
    relatedOpportunityIds: orUndef(r.legacy_related_opportunity_ids as string[] | null),
  };
}

/** Every record, drafts included. Public code must use the repository, not this. */
export async function getAllReels(): Promise<Reel[]> {
  if (storeMode() === "memory") return Array.from(memory().values()).sort(byDate);
  return (await db().query(`select * from reels`)).map(fromRow).sort(byDate);
}

export async function getReelRecord(id: string): Promise<Reel | undefined> {
  if (storeMode() === "memory") return memory().get(id);
  const rows = await db().query(`select * from reels where id = $1`, [id]);
  return rows[0] ? fromRow(rows[0]) : undefined;
}

/** Inserts or replaces a record. Throws SlugTakenError. */
export async function putReelRecord(r: Reel): Promise<void> {
  if (storeMode() === "memory") {
    memory().set(r.id, r);
    return;
  }
  try {
    await db().query(
      `insert into reels (id, slug, status, title, short_description, instagram_url, thumbnail, tag, featured,
                          published_at, legacy_related_opportunity_ids, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       on conflict (id) do update set
         slug = excluded.slug, status = excluded.status, title = excluded.title,
         short_description = excluded.short_description, instagram_url = excluded.instagram_url,
         thumbnail = excluded.thumbnail, tag = excluded.tag, featured = excluded.featured,
         published_at = excluded.published_at,
         legacy_related_opportunity_ids = excluded.legacy_related_opportunity_ids,
         updated_at = excluded.updated_at`,
      [
        r.id, r.slug, r.status, r.title, r.shortDescription, r.instagramUrl, r.thumbnail ?? null, r.tag,
        r.featured ?? null, r.publishedAt, r.relatedOpportunityIds ?? null, r.updatedAt ?? null,
      ]
    );
  } catch (err) {
    if (uniqueViolation(err)?.includes("slug")) throw new SlugTakenError();
    throw err;
  }
}

/** Related-Reel links of opportunities disappear with the Reel (foreign key cascade). */
export async function deleteReelRecord(id: string): Promise<boolean> {
  if (storeMode() === "memory") return memory().delete(id);
  return (await db().query(`delete from reels where id = $1 returning id`, [id])).length > 0;
}
