// One-off import of the repository's example content (src/lib/data/*) into the database, as DRAFTS.
//
//   npm run db:seed              -> lists what would be inserted (changes nothing)
//   npm run db:seed -- --apply   -> inserts it
//
// Never publishes anything and never overwrites: a record whose id or slug already exists is skipped.
// Example content is not meant to go live; this exists for a staging database you want to click around in.
import { opportunities } from "../src/lib/data/opportunities.ts";
import { reels } from "../src/lib/data/reels.ts";
import { announcements } from "../src/lib/data/announcements.ts";
import { getAllOpportunities, putOpportunityRecord } from "../src/lib/store/opportunityStore.ts";
import { getAllReels, putReelRecord } from "../src/lib/store/reelStore.ts";
import { getAllAnnouncements, putAnnouncementRecord } from "../src/lib/store/announcementStore.ts";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL tanımlı değil; örnek içerik yalnızca veritabanına aktarılır.");
  process.exit(1);
}
const apply = process.argv.includes("--apply");
console.log(`Hedef: ${new URL(process.env.DATABASE_URL).hostname}`);

async function importAll(label, seed, existing, put) {
  const have = await existing();
  const ids = new Set(have.map((x) => x.id));
  const slugs = new Set(have.map((x) => x.slug));
  let added = 0;
  for (const item of seed) {
    if (ids.has(item.id) || slugs.has(item.slug)) continue;
    added += 1;
    if (apply) await put({ ...item, status: "draft" });
  }
  console.log(`${label}: ${added} eklenecek/eklendi, ${seed.length - added} atlandı`);
}

// Reels first: opportunities reference them.
await importAll("Reels", reels, getAllReels, putReelRecord);
await importAll("Fırsatlar", opportunities, getAllOpportunities, putOpportunityRecord);
await importAll("Blog", announcements, getAllAnnouncements, putAnnouncementRecord);
if (!apply) console.log("Uygulamak için: npm run db:seed -- --apply");
