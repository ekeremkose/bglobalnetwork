import type { Announcement } from "@/lib/types/content";
import { announcements as seed } from "@/lib/data/announcements";
import { getMemoryMap } from "@/lib/store/createStore";
import { storeMode } from "@/lib/db/mode";
import { db, uniqueViolation, type Row } from "@/lib/db/driver";
import { iso, orUndef, SlugTakenError } from "@/lib/store/pgUtil";

/** Local-development backend (see db/mode.ts). Seed content starts as published. */
const memory = () =>
  getMemoryMap<Announcement>("announcements", () =>
    seed.map((a): [string, Announcement] => [a.id, { ...a, status: a.status ?? "published" }])
  );

const byDate = (a: Announcement, b: Announcement) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

function fromRow(r: Row): Announcement {
  return {
    id: r.id as string,
    status: r.status as Announcement["status"],
    updatedAt: iso(r.updated_at),
    slug: r.slug as string,
    title: r.title as string,
    content: r.content as string,
    publishedAt: r.published_at as string,
    featured: orUndef(r.featured as boolean | null),
    coverImage: orUndef(r.cover_image as string | null),
    link: orUndef(r.link as string | null),
  };
}

/** Every record, drafts included. Public code must use the repository, not this. */
export async function getAllAnnouncements(): Promise<Announcement[]> {
  if (storeMode() === "memory") return Array.from(memory().values()).sort(byDate);
  return (await db().query(`select * from announcements`)).map(fromRow).sort(byDate);
}

export async function getAnnouncementRecord(id: string): Promise<Announcement | undefined> {
  if (storeMode() === "memory") return memory().get(id);
  const rows = await db().query(`select * from announcements where id = $1`, [id]);
  return rows[0] ? fromRow(rows[0]) : undefined;
}

/** Inserts or replaces a record. Throws SlugTakenError. */
export async function putAnnouncementRecord(a: Announcement): Promise<void> {
  if (storeMode() === "memory") {
    memory().set(a.id, a);
    return;
  }
  try {
    await db().query(
      `insert into announcements (id, slug, status, title, content, published_at, featured, cover_image, link, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (id) do update set
         slug = excluded.slug, status = excluded.status, title = excluded.title, content = excluded.content,
         published_at = excluded.published_at, featured = excluded.featured, cover_image = excluded.cover_image,
         link = excluded.link, updated_at = excluded.updated_at`,
      [a.id, a.slug, a.status, a.title, a.content, a.publishedAt, a.featured ?? null, a.coverImage ?? null, a.link ?? null, a.updatedAt ?? null]
    );
  } catch (err) {
    if (uniqueViolation(err)?.includes("slug")) throw new SlugTakenError();
    throw err;
  }
}

export async function deleteAnnouncementRecord(id: string): Promise<boolean> {
  if (storeMode() === "memory") return memory().delete(id);
  return (await db().query(`delete from announcements where id = $1 returning id`, [id])).length > 0;
}
