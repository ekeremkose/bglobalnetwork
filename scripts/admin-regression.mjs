// Regression test for the manual admin save services, run against the SEEDED records
// (legacy ids such as opp-1 / reel-1 / ann-1), plus newly created ones.
// Runs in its own process, so no data outside this process is touched.
//   npm run test:admin                 -> in-memory stores
//   BACKEND=pglite npm run test:admin  -> the same checks against the Postgres code path
//                                         (in-process PGlite with db/migrations applied; no network, no real database)
import assert from "node:assert/strict";
import fs from "node:fs";

process.env.BGLOBAL_NO_NEXT_CACHE = "1";
const BACKEND = process.env.BACKEND === "pglite" ? "pglite" : "memory";
if (BACKEND === "memory") process.env.ALLOW_MEMORY_STORE = "1";

const load = (p) => import(new URL(`../src/lib/${p}`, import.meta.url).href);
if (BACKEND === "pglite") {
  const { PGlite } = await import("@electric-sql/pglite");
  const { setDbDriver } = await load("db/driver.ts");
  const pg = new PGlite();
  for (const f of fs.readdirSync(new URL("../db/migrations/", import.meta.url)).sort()) {
    await pg.exec(fs.readFileSync(new URL(`../db/migrations/${f}`, import.meta.url), "utf8"));
  }
  setDbDriver({ query: async (text, params) => (await pg.query(text, params)).rows });
}
const { saveOpportunity } = await load("admin/opportunityService.ts");
const { saveReel } = await load("admin/reelService.ts");
const { savePost } = await load("admin/blogService.ts");
const { getAllOpportunities } = await load("store/opportunityStore.ts");
const { getAllReels } = await load("store/reelStore.ts");
const { getAllAnnouncements } = await load("store/announcementStore.ts");
const pubOpp = await load("repositories/opportunityRepository.ts");
const pubReel = await load("repositories/reelRepository.ts");
const pubAnn = await load("repositories/announcementRepository.ts");

if (BACKEND === "pglite") {
  // The database starts empty; load the example records as the memory store would have them (published).
  const { opportunities } = await load("data/opportunities.ts");
  const { reels } = await load("data/reels.ts");
  const { announcements } = await load("data/announcements.ts");
  const { putReelRecord } = await load("store/reelStore.ts");
  const { putOpportunityRecord } = await load("store/opportunityStore.ts");
  const { putAnnouncementRecord } = await load("store/announcementStore.ts");
  for (const r of reels) await putReelRecord({ ...r, status: r.status ?? "published" });
  for (const o of opportunities) await putOpportunityRecord({ ...o, status: o.status ?? "published" });
  for (const a of announcements) await putAnnouncementRecord({ ...a, status: a.status ?? "published" });
}
console.log(`backend: ${BACKEND}`);

let pass = 0;
const failures = [];
async function test(name, fn) {
  try { await fn(); pass++; console.log("PASS  " + name); }
  catch (e) { failures.push(name); console.log("FAIL  " + name + "\n      " + String(e.message).split("\n").slice(0, 4).join("\n      ")); }
}
const ok = (r, what) => assert.equal(r.ok, true, `${what}: ${r.message} ${JSON.stringify(r.fieldErrors ?? {})}`);

// What the editor sends for an existing record (its form values).
const oppFields = (o, patch = {}) => ({
  title: o.title, slug: o.slug, shortDescription: o.shortDescription, fullDescription: o.fullDescription,
  country: o.country, category: o.category, deadline: o.deadline, externalLink: o.externalLink,
  relatedReelIds: o.relatedReelIds ?? [], ...patch,
});
const reelFields = (r, patch = {}) => ({
  title: r.title, slug: r.slug, shortDescription: r.shortDescription, instagramUrl: r.instagramUrl,
  tag: r.tag, publishedAt: r.publishedAt, thumbnail: r.thumbnail ?? "", featured: !!r.featured, ...patch,
});
const postFields = (p, patch = {}) => ({
  title: p.title, slug: p.slug, content: p.content, publishedAt: p.publishedAt, link: p.link ?? "", ...patch,
});

const SUITES = [
  {
    label: "Fırsat", id: "opp-1", prefix: "opp",
    save: saveOpportunity, all: getAllOpportunities, fields: oppFields,
    visible: async (it) => (await pubOpp.getOpportunityBySlug(it.slug))?.id === it.id,
    legacy: ["coverImage", "featured", "relatedReelIds"],
  },
  {
    label: "Reel", id: "reel-1", prefix: "reel",
    save: saveReel, all: getAllReels, fields: reelFields,
    visible: async (it) => (await pubReel.getReels()).some((r) => r.id === it.id),
    legacy: ["relatedOpportunityIds"],
  },
  {
    label: "Blog", id: "ann-1", prefix: "ann",
    save: savePost, all: getAllAnnouncements, fields: postFields,
    visible: async (it) => (await pubAnn.getAnnouncementBySlug(it.slug))?.id === it.id,
    legacy: ["coverImage", "featured"],
  },
];

for (const S of SUITES) {
  const get = async () => (await S.all()).find((x) => x.id === S.id);
  const before = structuredClone(await get());
  const send = async (intent, patch = {}, id = S.id, mode = "update") =>
    S.save({ id, mode, intent, fields: S.fields((await get()) ?? before, patch) });

  await test(`${S.label}: seed record ${S.id} starts published and visible`, async () => {
    assert.equal(before.status, "published");
    assert.ok(await await S.visible(before));
  });

  await test(`${S.label}: editing seed record ${S.id} and saving works; id, slug, legacy fields stay`, async () => {
    const r = await send("save", { title: before.title + " (düzenlendi)" });
    ok(r, "save");
    const now = await get();
    assert.equal(now.id, S.id);
    assert.equal(now.slug, before.slug);
    assert.equal(now.status, "published");
    assert.equal(now.title, before.title + " (düzenlendi)");
    for (const k of S.legacy) assert.deepEqual(now[k], before[k], `legacy field ${k} changed`);
    assert.ok(await S.visible(now));
  });

  await test(`${S.label}: unpublish from the editor → draft, hidden publicly, record kept`, async () => {
    const r = await send("unpublish");
    ok(r, "unpublish");
    const now = await get();
    assert.equal(now.status, "draft");
    assert.equal(now.id, S.id);
    assert.equal(now.slug, before.slug);
    assert.ok(!await S.visible(now), "draft is still public");
    assert.equal((await S.all()).filter((x) => x.id === S.id).length, 1);
  });

  await test(`${S.label}: editing the resulting draft (incl. an incomplete one) works`, async () => {
    ok(await send("draft", { title: before.title + " (taslak)" }), "draft edit");
    assert.equal((await get()).status, "draft");
    assert.ok(!await S.visible((await get())));
  });

  await test(`${S.label}: republish with valid fields → published, same id/slug/relations, visible`, async () => {
    const r = await send("publish", { title: before.title });
    ok(r, "republish");
    const now = await get();
    assert.equal(now.status, "published");
    assert.equal(now.id, S.id);
    assert.equal(now.slug, before.slug);
    for (const k of S.legacy) assert.deepEqual(now[k], before[k], `legacy field ${k} changed`);
    assert.ok(await S.visible(now));
  });

  await test(`${S.label}: update of a missing legacy-shaped id reports 'artık yok', creates nothing`, async () => {
    const n = (await S.all()).length;
    const r = await send("save", {}, `${S.prefix}-9999`);
    assert.equal(r.ok, false);
    assert.match(r.message, /artık yok/);
    assert.equal((await S.all()).length, n);
  });

  await test(`${S.label}: 'create' may not target a legacy id (cannot overwrite ${S.id})`, async () => {
    const snap = JSON.stringify((await get()));
    const r = await send("save", { title: "Ele geçirme denemesi" }, S.id, "create");
    assert.equal(r.ok, false);
    assert.match(r.message, /Geçersiz istek/);
    assert.equal(JSON.stringify((await get())), snap);
  });

  await test(`${S.label}: malformed ids are rejected`, async () => {
    for (const bad of [undefined, null, 5, "", `${S.prefix}-`, `${S.prefix}-a/b`, `x-1`, `${S.prefix}-${"a".repeat(80)}`]) {
      const r = await S.save({ id: bad, mode: "update", intent: "save", fields: S.fields((await get()), {}) });
      assert.equal(r.ok, false, `accepted ${String(bad)}`);
    }
  });

  await test(`${S.label}: new record via create with uuid id; retry is idempotent (no duplicate)`, async () => {
    const id = `${S.prefix}-${crypto.randomUUID()}`;
    const fields = S.fields(before, { title: `[TEST] ${S.label} yeni`, slug: `test-${S.prefix}-yeni` });
    const first = await S.save({ id, mode: "create", intent: "draft", fields });
    ok(first, "create");
    const second = await S.save({ id, mode: "create", intent: "draft", fields });
    ok(second, "retry");
    assert.equal((await S.all()).filter((x) => x.id === id).length, 1);
    assert.equal((await S.all()).filter((x) => x.slug === `test-${S.prefix}-yeni`).length, 1);
    assert.equal((await S.all()).find((x) => x.id === id).status, "draft");
  });
}

// Relationships across types.
await test("Relations: opp-1 keeps relatedReelIds while reel-1 is a draft; public related content hides it, then shows it again", async () => {
  const opp = async () => (await getAllOpportunities()).find((o) => o.id === "opp-1");
  const reel = async () => (await getAllReels()).find((r) => r.id === "reel-1");
  const relBefore = [...(await opp()).relatedReelIds];
  assert.ok(relBefore.includes("reel-1"));
  ok(await saveReel({ id: "reel-1", mode: "update", intent: "unpublish", fields: reelFields(await reel()) }), "unpublish reel");
  assert.deepEqual((await opp()).relatedReelIds, relBefore, "relationship was rewritten");
  assert.ok(!(await pubReel.getReelsByIds((await opp()).relatedReelIds)).some((r) => r.id === "reel-1"), "draft reel leaked into related content");
  ok(await saveReel({ id: "reel-1", mode: "update", intent: "publish", fields: reelFields(await reel()) }), "republish reel");
  assert.ok((await pubReel.getReelsByIds((await opp()).relatedReelIds)).some((r) => r.id === "reel-1"), "related reel not restored");
  // saving the opportunity (legacy id) with its relations unchanged keeps them
  ok(await saveOpportunity({ id: "opp-1", mode: "update", intent: "save", fields: oppFields(await opp()) }), "save opp");
  assert.deepEqual((await opp()).relatedReelIds, relBefore);
});

await test("Public counts follow publication status for seeded opportunities", async () => {
  const total = (await pubOpp.getOpportunities()).length;
  const find = async () => (await getAllOpportunities()).find((x) => x.id === "opp-2");
  ok(await saveOpportunity({ id: "opp-2", mode: "update", intent: "unpublish", fields: oppFields(await find()) }), "unpublish");
  assert.equal((await pubOpp.getOpportunities()).length, total - 1);
  ok(await saveOpportunity({ id: "opp-2", mode: "update", intent: "publish", fields: oppFields(await find()) }), "publish");
  assert.equal((await pubOpp.getOpportunities()).length, total);
});

console.log(`\n${pass} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
