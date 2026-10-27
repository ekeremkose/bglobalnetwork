import type { Opportunity } from "@/lib/types/content";
import { opportunities as seed } from "@/lib/data/opportunities";
import { getMemoryMap } from "@/lib/store/createStore";
import { storeMode } from "@/lib/db/mode";
import { db, uniqueViolation, type Row } from "@/lib/db/driver";
import { iso, orUndef, SlugTakenError } from "@/lib/store/pgUtil";

/** Local-development backend (see db/mode.ts). Seed content starts as published. */
const memory = () =>
  getMemoryMap<Opportunity>("opportunities", () =>
    seed.map((o): [string, Opportunity] => [o.id, { ...o, status: o.status ?? "published" }])
  );

const byFreshness = (a: Opportunity, b: Opportunity) => {
  const at = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
  const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
  if (at !== bt) return bt - at;
  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
};

const SELECT = `select o.*, coalesce(
  (select array_agg(r.reel_id order by r.position) from opportunity_reels r where r.opportunity_id = o.id),
  '{}') as related_reel_ids from opportunities o`;

function fromRow(r: Row): Opportunity {
  return {
    id: r.id as string,
    status: r.status as Opportunity["status"],
    updatedAt: iso(r.updated_at),
    slug: r.slug as string,
    title: r.title as string,
    country: r.country as string,
    category: r.category as string,
    publishedAt: orUndef(r.published_at as string | null),
    deadline: r.deadline as string,
    shortDescription: r.short_description as string,
    fullDescription: r.full_description as string,
    externalLink: r.external_link as string,
    featured: orUndef(r.featured as boolean | null),
    coverImage: orUndef(r.cover_image as string | null),
    relatedReelIds: (r.related_reel_ids as string[]) ?? [],
  };
}

/** Every record, drafts included. Public code must use the repository, not this. */
export async function getAllOpportunities(): Promise<Opportunity[]> {
  if (storeMode() === "memory") return Array.from(memory().values()).sort(byFreshness);
  return (await db().query(SELECT)).map(fromRow).sort(byFreshness);
}

export async function getOpportunityRecord(id: string): Promise<Opportunity | undefined> {
  if (storeMode() === "memory") return memory().get(id);
  const rows = await db().query(`${SELECT} where o.id = $1`, [id]);
  return rows[0] ? fromRow(rows[0]) : undefined;
}

/** Inserts or replaces a record and its related-Reel list in one statement. Throws SlugTakenError. */
export async function putOpportunityRecord(o: Opportunity): Promise<void> {
  if (storeMode() === "memory") {
    memory().set(o.id, o);
    return;
  }
  const related = Array.from(new Set(o.relatedReelIds ?? []));
  try {
    await db().query(
      `with up as (
         insert into opportunities (id, slug, status, title, country, category, published_at, deadline,
                                    short_description, full_description, external_link, featured, cover_image, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         on conflict (id) do update set
           slug = excluded.slug, status = excluded.status, title = excluded.title, country = excluded.country,
           category = excluded.category, published_at = excluded.published_at, deadline = excluded.deadline,
           short_description = excluded.short_description, full_description = excluded.full_description,
           external_link = excluded.external_link, featured = excluded.featured, cover_image = excluded.cover_image,
           updated_at = excluded.updated_at
         returning id),
       del as (
         delete from opportunity_reels where opportunity_id = $1 and reel_id <> all($15::text[])),
       ins as (
         insert into opportunity_reels (opportunity_id, reel_id, position)
         select $1, t.rid, t.ord - 1
         from unnest($15::text[]) with ordinality as t(rid, ord)
         where exists (select 1 from reels where id = t.rid)
         on conflict (opportunity_id, reel_id) do update set position = excluded.position)
       select id from up`,
      [
        o.id, o.slug, o.status, o.title, o.country, o.category, o.publishedAt ?? null, o.deadline,
        o.shortDescription, o.fullDescription, o.externalLink, o.featured ?? null, o.coverImage ?? null,
        o.updatedAt ?? null, related,
      ]
    );
  } catch (err) {
    if (uniqueViolation(err)?.includes("slug")) throw new SlugTakenError();
    throw err;
  }
}

export async function deleteOpportunityRecord(id: string): Promise<boolean> {
  if (storeMode() === "memory") return memory().delete(id);
  return (await db().query(`delete from opportunities where id = $1 returning id`, [id])).length > 0;
}
