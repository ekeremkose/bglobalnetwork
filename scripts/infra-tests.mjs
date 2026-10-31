// Tests for the production plumbing that does not need network access or real accounts:
// authorization policy, storage-mode safety, the Postgres code path (PGlite + the real migrations),
// upload validation, blob clean-up and image-host rules.
//   npm run test:infra
import assert from "node:assert/strict";
import fs from "node:fs";
import sharp from "sharp";

process.env.BGLOBAL_NO_NEXT_CACHE = "1";
for (const k of ["DATABASE_URL", "ALLOW_MEMORY_STORE", "VERCEL", "ADMIN_BASE_PATH"]) delete process.env[k];

const load = (p) => import(new URL(`../src/lib/${p}`, import.meta.url).href);
let pass = 0;
const failures = [];
async function test(name, fn) {
  try { await fn(); pass++; console.log("PASS  " + name); }
  catch (e) { failures.push(name); console.log("FAIL  " + name + "\n      " + String(e.stack ?? e.message).split("\n").slice(0, 5).join("\n      ")); }
}

// ---- authorization policy -------------------------------------------------------------------
const { isAdminIdentity } = await load("auth/policy.ts");
await test("policy: only the verified allow-listed email is an admin", () => {
  assert.equal(isAdminIdentity({ email: "pr.bglobalnetwork@gmail.com", emailVerified: true }), true);
  assert.equal(isAdminIdentity({ email: " PR.BGlobalNetwork@Gmail.com ", emailVerified: true }), true);
  assert.equal(isAdminIdentity({ email: "pr.bglobalnetwork@gmail.com", emailVerified: false }), false);
  assert.equal(isAdminIdentity({ email: "pr.bglobalnetwork@gmail.com" }), false);
  assert.equal(isAdminIdentity({ email: "pr.bglobalnetwork@gmail.com", emailVerified: "true" }), false);
  assert.equal(isAdminIdentity({ email: "pr.bglobalnetwork@gmail.com.evil.test", emailVerified: true }), false);
  assert.equal(isAdminIdentity({ email: "x+pr.bglobalnetwork@gmail.com", emailVerified: true }), false);
  assert.equal(isAdminIdentity({ email: "someone@gmail.com", emailVerified: true }), false);
  assert.equal(isAdminIdentity({ email: null, emailVerified: true }), false);
  assert.equal(isAdminIdentity({}), false);
});

// ---- admin path configuration ----------------------------------------------------------------
const { adminBasePath, FORMER_ADMIN_PATH, isInternalAdminPath } = await load("config/admin.ts");
await test("admin path: unset or guessable values keep the admin switched off", () => {
  for (const bad of [undefined, "", "admin", "yonetim", "short-path", "has space in it 123456", "UPPERCASE-LETTERS-12345", "a/b/cccccccccccccccc", "../../etc/passwd-padding"]) {
    if (bad === undefined) delete process.env.ADMIN_BASE_PATH; else process.env.ADMIN_BASE_PATH = bad;
    assert.equal(adminBasePath(), null, `accepted ${bad}`);
  }
  process.env.ADMIN_BASE_PATH = "/0123456789abcdef0123456789abcdef/";
  assert.equal(adminBasePath(), "/0123456789abcdef0123456789abcdef");
  delete process.env.ADMIN_BASE_PATH;
});
await test("admin path: former and internal prefixes are matched", () => {
  for (const p of ["/admin", "/admin/", "/admin/review", "/ADMIN/opportunities", "//admin"]) assert.ok(FORMER_ADMIN_PATH.test(p), p);
  for (const p of ["/administrator", "/adminx", "/opportunities"]) assert.ok(!FORMER_ADMIN_PATH.test(p), p);
  assert.ok(isInternalAdminPath("/internal-admin") && isInternalAdminPath("/internal-admin/reels") && !isInternalAdminPath("/internal-adminx"));
});

// ---- storage mode: never a silent in-memory fallback -----------------------------------------
const { storeMode, StoreConfigError } = await load("db/mode.ts");
await test("store mode: refuses to run without an explicit backend", () => {
  assert.throws(() => storeMode(), StoreConfigError);
  process.env.ALLOW_MEMORY_STORE = "1";
  assert.equal(storeMode(), "memory");
  process.env.VERCEL = "1";
  assert.throws(() => storeMode(), StoreConfigError, "memory allowed on Vercel");
  process.env.DATABASE_URL = "postgres://user:pw@example.invalid/db";
  assert.equal(storeMode(), "postgres");
  delete process.env.DATABASE_URL; delete process.env.VERCEL; delete process.env.ALLOW_MEMORY_STORE;
});
await test("store mode: reads fail loudly (no empty/seed content) when unconfigured", async () => {
  const { getAllOpportunities } = await load("store/opportunityStore.ts");
  await assert.rejects(() => getAllOpportunities(), StoreConfigError);
});

// ---- Postgres path ----------------------------------------------------------------------------
const { PGlite } = await import("@electric-sql/pglite");
const { setDbDriver } = await load("db/driver.ts");
const pg = new PGlite();
const migrations = fs.readdirSync(new URL("../db/migrations/", import.meta.url)).filter((f) => f.endsWith(".sql")).sort();
for (const f of migrations) await pg.exec(fs.readFileSync(new URL(`../db/migrations/${f}`, import.meta.url), "utf8"));
setDbDriver({ query: async (text, params) => (await pg.query(text, params)).rows });

const O = await load("store/opportunityStore.ts");
const R = await load("store/reelStore.ts");
const A = await load("store/announcementStore.ts");
const S = await load("store/settingsStore.ts");
const { SlugTakenError } = await load("store/pgUtil.ts");
const reelSvc = await load("admin/reelService.ts");
const oppSvc = await load("admin/opportunityService.ts");
const pubOpp = await load("repositories/opportunityRepository.ts");

const reel = (id, slug, extra = {}) => ({ id, slug, status: "draft", title: `Reel ${id}`, shortDescription: "d", instagramUrl: "https://www.instagram.com/reel/AAA/", tag: "t", publishedAt: "2026-01-02", ...extra });
const opp = (id, slug, extra = {}) => ({ id, slug, status: "draft", title: `Fırsat ${id}`, country: "TR", category: "Burs", deadline: "2026-12-31", shortDescription: "s", fullDescription: "f", externalLink: "https://example.com/", relatedReelIds: [], ...extra });

await test("db: starts empty (no demo content in a fresh database)", async () => {
  assert.equal((await O.getAllOpportunities()).length, 0);
  assert.equal((await R.getAllReels()).length, 0);
  assert.equal((await A.getAllAnnouncements()).length, 0);
  const { SITE_DEFAULTS } = await load("site.ts");
  assert.deepEqual(await S.getSettingsRecord(), SITE_DEFAULTS, "no settings row serves the documented defaults");
});
await test("db: unique slugs are enforced and reported as SlugTakenError", async () => {
  await R.putReelRecord(reel("reel-aaaaaa", "ayni-adres"));
  await assert.rejects(() => R.putReelRecord(reel("reel-bbbbbb", "ayni-adres")), SlugTakenError);
  await O.putOpportunityRecord(opp("opp-aaaaaa", "ayni-adres"));
  await assert.rejects(() => O.putOpportunityRecord(opp("opp-bbbbbb", "ayni-adres")), SlugTakenError);
});
await test("db: a service save that loses a slug race returns a field error, not a crash", async () => {
  // The in-service pre-check passes (slug looks free), but the database refuses at write time.
  const orig = R.getAllReels;
  const r = await reelSvc.saveReel({
    id: "reel-cccccc", mode: "create", intent: "draft",
    fields: { title: "Yarış", slug: "ayni-adres", shortDescription: "", instagramUrl: "", tag: "", publishedAt: "", thumbnail: "", featured: false },
  });
  assert.equal(r.ok, false);
  assert.ok(r.fieldErrors?.slug, JSON.stringify(r));
  assert.equal(orig, R.getAllReels);
  assert.equal((await R.getReelRecord("reel-cccccc")), undefined);
});
await test("db: related Reels keep their order, are replaced atomically and cascade on Reel deletion", async () => {
  await R.putReelRecord(reel("reel-111111", "r1"));
  await R.putReelRecord(reel("reel-222222", "r2"));
  await R.putReelRecord(reel("reel-333333", "r3"));
  await O.putOpportunityRecord(opp("opp-rel111", "rel", { relatedReelIds: ["reel-333333", "reel-111111", "reel-222222"] }));
  assert.deepEqual((await O.getOpportunityRecord("opp-rel111")).relatedReelIds, ["reel-333333", "reel-111111", "reel-222222"]);
  await O.putOpportunityRecord(opp("opp-rel111", "rel", { relatedReelIds: ["reel-222222", "reel-333333"] }));
  assert.deepEqual((await O.getOpportunityRecord("opp-rel111")).relatedReelIds, ["reel-222222", "reel-333333"]);
  assert.equal(await R.deleteReelRecord("reel-222222"), true);
  assert.deepEqual((await O.getOpportunityRecord("opp-rel111")).relatedReelIds, ["reel-333333"]);
  assert.equal(await R.deleteReelRecord("reel-222222"), false);
});
await test("db: a relation to a Reel that does not exist is dropped, the rest is saved", async () => {
  await O.putOpportunityRecord(opp("opp-bad111", "bad-rel", { relatedReelIds: ["reel-yok999", "reel-333333"] }));
  assert.deepEqual((await O.getOpportunityRecord("opp-bad111")).relatedReelIds, ["reel-333333"]);
});
await test("db: publication state is stored and public reads exclude drafts", async () => {
  await O.putOpportunityRecord(opp("opp-pub111", "yayinda", { status: "published", publishedAt: "2026-02-01" }));
  const slugs = (await pubOpp.getOpportunities()).map((o) => o.slug);
  assert.ok(slugs.includes("yayinda"));
  assert.ok(!slugs.includes("rel"), "draft leaked");
  await oppSvc.setOpportunityStatus("opp-pub111", "draft");
  assert.ok(!(await pubOpp.getOpportunities()).some((o) => o.slug === "yayinda"));
});
await test("db: site settings round-trip", async () => {
  const { SITE_DEFAULTS } = await load("site.ts");
  await S.putSettingsRecord({ ...SITE_DEFAULTS, communityFormUrl: "https://forms.gle/gercek" });
  assert.equal((await S.getSettingsRecord()).communityFormUrl, "https://forms.gle/gercek");
  await S.putSettingsRecord({ ...SITE_DEFAULTS, communityFormUrl: "https://forms.gle/ikinci" });
  assert.equal((await S.getSettingsRecord()).communityFormUrl, "https://forms.gle/ikinci");
});
await test("db: migration file is the schema the stores need (re-running it fails instead of corrupting)", async () => {
  await assert.rejects(() => pg.exec(fs.readFileSync(new URL(`../db/migrations/${migrations[0]}`, import.meta.url), "utf8")));
});
setDbDriver(undefined);

// ---- media -----------------------------------------------------------------------------------
const { processCoverImage, MAX_UPLOAD_BYTES } = await load("media/coverImage.ts");
const png = (w, h) => sharp({ create: { width: w, height: h, channels: 3, background: "#468" } }).png().toBuffer();
await test("upload: a real image is re-encoded to a bounded WebP", async () => {
  const r = await processCoverImage(await png(3000, 5000));
  assert.ok(r.ok, r.message);
  assert.equal(r.contentType, "image/webp");
  assert.ok(r.width <= 1080 && r.height <= 1920);
  assert.equal((await sharp(r.bytes).metadata()).format, "webp");
  const small = await processCoverImage(await png(40, 70));
  assert.ok(small.ok && small.width === 40, "must not upscale");
});
await test("upload: EXIF/metadata is dropped", async () => {
  const withExif = await sharp(await png(50, 80)).withExif({ IFD0: { Copyright: "secret-location-marker" } }).jpeg().toBuffer();
  const r = await processCoverImage(withExif);
  assert.ok(r.ok);
  assert.ok(!r.bytes.includes(Buffer.from("secret-location-marker")));
  assert.equal((await sharp(r.bytes).metadata()).exif, undefined);
});
await test("upload: SVG, HTML, text, truncated and empty files are rejected", async () => {
  for (const [name, bytes] of [
    ["svg", Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5"><script>alert(1)</script></svg>')],
    ["html", Buffer.from("<html><script>alert(1)</script></html>")],
    ["text", Buffer.from("hello")],
    ["truncated png", (await png(200, 200)).subarray(0, 60)],
    ["empty", Buffer.alloc(0)],
  ]) {
    const r = await processCoverImage(bytes);
    assert.equal(r.ok, false, `${name} accepted`);
  }
});
await test("upload: oversized files and decompression bombs are rejected", async () => {
  assert.equal((await processCoverImage(Buffer.alloc(MAX_UPLOAD_BYTES + 1, 1))).ok, false);
  const bomb = await sharp({ create: { width: 9000, height: 9000, channels: 3, background: "#000" } }).png({ compressionLevel: 9 }).toBuffer();
  assert.ok(bomb.length < MAX_UPLOAD_BYTES, "test image should be small on disk");
  assert.equal((await processCoverImage(bomb)).ok, false);
});

const { setBlobDriver, isManagedBlobUrl, deleteManagedBlob, blob, MediaConfigError } = await load("media/blob.ts");
await test("blob: no token means a clear error, never a local-disk fallback", async () => {
  delete process.env.BLOB_READ_WRITE_TOKEN;
  setBlobDriver(null);
  assert.throws(() => blob(), MediaConfigError);
});
await test("blob: only our own Blob URLs are managed", () => {
  assert.ok(isManagedBlobUrl("https://abc123.public.blob.vercel-storage.com/reels/x.webp"));
  for (const v of ["http://abc.public.blob.vercel-storage.com/x", "https://evil.example/x", "https://public.blob.vercel-storage.com.evil.example/x", "/reels/x.jpg", "", undefined])
    assert.ok(!isManagedBlobUrl(v), String(v));
});
await test("covers: Blob host wildcard allows exactly one label", async () => {
  const { checkCover } = await load("utils/validate.ts");
  assert.ok(checkCover("https://abc123.public.blob.vercel-storage.com/reels/x.webp").ok);
  assert.ok(!checkCover("https://a.b.public.blob.vercel-storage.com/reels/x.webp").ok);
  assert.ok(!checkCover("https://public.blob.vercel-storage.com/reels/x.webp").ok);
  assert.ok(!checkCover("https://public.blob.vercel-storage.com.attacker.example/reels/x.webp").ok);
  assert.ok(!checkCover("https://evilpublic.blob.vercel-storage.com/x.webp").ok);
  assert.ok(checkCover("https://images.unsplash.com/photo.jpg").ok);
});
await test("covers: replacing or deleting a Reel removes the uploaded file it no longer uses", async () => {
  process.env.ALLOW_MEMORY_STORE = "1";
  const deleted = [];
  setBlobDriver({ put: async () => "x", del: async (u) => { deleted.push(u); } });
  const a = "https://s1.public.blob.vercel-storage.com/reels/cover-a1.webp";
  const b = "https://s1.public.blob.vercel-storage.com/reels/cover-b2.webp";
  const fields = (thumbnail) => ({ title: "Kapaklı", slug: "kapakli-test", shortDescription: "d", instagramUrl: "https://www.instagram.com/reel/AAA/", tag: "t", publishedAt: "2026-01-02", thumbnail, featured: false });
  const id = "reel-cover1";
  assert.ok((await reelSvc.saveReel({ id, mode: "create", intent: "draft", fields: fields(a) })).ok);
  assert.deepEqual(deleted, []);
  assert.ok((await reelSvc.saveReel({ id, mode: "update", intent: "draft", fields: fields(a) })).ok);
  assert.deepEqual(deleted, [], "unchanged cover must be kept");
  assert.ok((await reelSvc.saveReel({ id, mode: "update", intent: "draft", fields: fields(b) })).ok);
  assert.deepEqual(deleted, [a]);
  assert.ok((await reelSvc.removeReel(id)).ok);
  assert.deepEqual(deleted, [a, b]);
  await deleteManagedBlob("/reels/local.jpg");
  await deleteManagedBlob("https://elsewhere.example/x.jpg");
  assert.equal(deleted.length, 2, "foreign/local covers must never be deleted");
  setBlobDriver({ put: async () => "x", del: async () => { throw new Error("boom"); } });
  await deleteManagedBlob(a); // must not throw
  setBlobDriver(null);
  delete process.env.ALLOW_MEMORY_STORE;
});

await test("covers: a file another record still uses is never deleted; only our own cover uploads are", async () => {
  process.env.ALLOW_MEMORY_STORE = "1";
  const deleted = [];
  setBlobDriver({ put: async () => "x", del: async (u) => { deleted.push(u); } });
  const shared = "https://s1.public.blob.vercel-storage.com/reels/cover-shared.webp";
  const other = "https://s1.public.blob.vercel-storage.com/other/logo.webp"; // same store, not an upload of ours
  const fields = (slug, thumbnail) => ({ title: "T " + slug, slug, shortDescription: "d", instagramUrl: "https://www.instagram.com/reel/AAA/", tag: "t", publishedAt: "2026-01-02", thumbnail, featured: false });
  { const r = await reelSvc.saveReel({ id: "reel-share1", mode: "create", intent: "draft", fields: fields("sh-1", shared) }); assert.ok(r.ok, JSON.stringify(r).slice(0, 300)); }
  assert.ok((await reelSvc.saveReel({ id: "reel-share2", mode: "create", intent: "draft", fields: fields("sh-2", shared) })).ok);
  assert.ok((await reelSvc.removeReel("reel-share2")).ok);
  assert.deepEqual(deleted, [], "deleting one of two users of a file must keep the file");
  assert.ok((await reelSvc.saveReel({ id: "reel-share1", mode: "update", intent: "draft", fields: fields("sh-1", "") })).ok);
  assert.deepEqual(deleted, [shared], "last user gone: the file is removed");
  assert.ok((await reelSvc.saveReel({ id: "reel-share3", mode: "create", intent: "draft", fields: fields("sh-3", other) })).ok);
  assert.ok((await reelSvc.removeReel("reel-share3")).ok);
  assert.deepEqual(deleted, [shared], "files outside reels/cover are never deleted");
  assert.ok((await reelSvc.removeReel("reel-share1")).ok);
  setBlobDriver(null);
  delete process.env.ALLOW_MEMORY_STORE;
});

// ---- maintenance mode and the central noindex setting ----------------------------------------------------
{
  for (const k of ["MAINTENANCE_MODE", "MAINTENANCE_RETRY_AFTER_SECONDS", "SITE_ALLOW_INDEXING"]) delete process.env[k];
  const nextServer = await import("next/server");
  const NextRequest = nextServer.NextRequest ?? nextServer.default?.NextRequest;
  const { middleware } = await import(new URL("../src/middleware.ts", import.meta.url).href);
  const { maintenanceOn, retryAfterSeconds, maintenanceResponse, MAINTENANCE_ACTION_MESSAGE } = await load("config/maintenance.ts");
  const { indexingAllowed } = await load("config/indexing.ts");
  const req = (path, method = "GET") => new NextRequest(`https://example.test${path}`, { method });
  const PATHS = ["/", "/opportunities", "/reels", "/duyurular/x", "/contact", "/__not_found__", "/reels/demo/demo-opp-1.webp",
    "/admin", "/admin/review", "/internal-admin", "/internal-admin/giris", "/api/auth/callback/google", "/api/auth/session", "/k3x9-concealed-admin-path-0123456789", "/k3x9-concealed-admin-path-0123456789/reels", "/k3x9-concealed-admin-path-0123456789/yukle"];
  const METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"];

  await test("maintenance: only 1/true/on switch it on; Retry-After is configurable and clamped", () => {
    for (const [v, on] of [[undefined, false], ["", false], ["0", false], ["false", false], ["yes", false], ["off", false], ["1", true], [" 1 ", true], ["true", true], ["TRUE", true], ["on", true]]) {
      if (v === undefined) delete process.env.MAINTENANCE_MODE; else process.env.MAINTENANCE_MODE = v;
      assert.equal(maintenanceOn(), on, `value ${JSON.stringify(v)}`);
    }
    delete process.env.MAINTENANCE_MODE;
    assert.equal(retryAfterSeconds(), 3600);
    for (const [v, want] of [["120", 120], ["5", 60], ["999999", 86400], ["abc", 3600], ["", 3600]]) { process.env.MAINTENANCE_RETRY_AFTER_SECONDS = v; assert.equal(retryAfterSeconds(), want, v); }
    delete process.env.MAINTENANCE_RETRY_AFTER_SECONDS;
  });

  await test("maintenance: every path and method gets the 503 page with Retry-After, no store, no scripts, no external requests", async () => {
    process.env.MAINTENANCE_MODE = "1"; process.env.ADMIN_BASE_PATH = "k3x9-concealed-admin-path-0123456789";
    // DATABASE_URL and ALLOW_MEMORY_STORE are unset: any attempt to reach a store would throw StoreConfigError.
    let n = 0;
    for (const path of PATHS) for (const method of METHODS) {
      const res = await middleware(req(path, method));
      assert.equal(res.status, 503, `${method} ${path}`);
      assert.equal(res.headers.get("retry-after"), "3600");
      assert.equal(res.headers.get("cache-control"), "no-store");
      assert.match(res.headers.get("x-robots-tag") ?? "", /noindex/);
      assert.match(res.headers.get("content-type") ?? "", /^text\/html/);
      const body = await res.text();
      if (method === "HEAD") assert.equal(body, ""); else {
        assert.match(body, /Bakım|bakım/); assert.ok(!/<script|https?:\/\/|<img|<link|@import|url\(/i.test(body), "self-contained page");
        assert.ok(!body.includes("k3x9-concealed"), "never mentions the admin path");
      }
      n++;
    }
    assert.equal(n, PATHS.length * METHODS.length);
    assert.equal(maintenanceResponse("GET").status, 503);
    delete process.env.MAINTENANCE_MODE; delete process.env.ADMIN_BASE_PATH;
  });

  await test("maintenance: back to normal when the variable is removed (no residue)", async () => {
    process.env.ADMIN_BASE_PATH = "k3x9-concealed-admin-path-0123456789"; process.env.SITE_ALLOW_INDEXING = "1";
    const pub = await middleware(req("/opportunities")); assert.equal(pub.status, 200); assert.equal(pub.headers.get("retry-after"), null);
    assert.equal((await middleware(req("/admin/review"))).status, 200, "rewritten to the site's 404 page, not 503");
    assert.equal((await middleware(req("/admin/review"))).headers.get("x-middleware-rewrite")?.endsWith("/__not_found__"), true);
    const adm = await middleware(req("/k3x9-concealed-admin-path-0123456789/reels")); assert.match(adm.headers.get("x-middleware-rewrite") ?? "", /\/internal-admin\/reels$/);
    delete process.env.ADMIN_BASE_PATH; delete process.env.SITE_ALLOW_INDEXING;
  });

  await test("maintenance: admin guards refuse on their own (defence in depth, no middleware involved)", async () => {
    process.env.MAINTENANCE_MODE = "1"; process.env.ADMIN_BASE_PATH = "k3x9-concealed-admin-path-0123456789";
    const { getAdminSession, requireAdminPage } = await load("auth/guard.ts");
    const { guard } = await load("admin/revalidate.ts");
    assert.equal(await getAdminSession(), null);
    await assert.rejects(requireAdminPage(), (e) => /NEXT_HTTP_ERROR_FALLBACK|NEXT_NOT_FOUND/.test(String(e?.digest ?? e?.message)));
    let ran = false;
    const r = await guard(async () => { ran = true; return { ok: true }; }, (message) => ({ ok: false, message }));
    assert.equal(ran, false, "the service never starts"); assert.deepEqual(r, { ok: false, message: MAINTENANCE_ACTION_MESSAGE });
    const upload = await import(new URL("../src/app/internal-admin/(panel)/yukle/route.ts", import.meta.url).href);
    const up = await upload.POST(new NextRequest("https://example.test/internal-admin/yukle", { method: "POST", headers: { origin: "https://example.test" } }));
    assert.equal(up.status, 503); assert.match((await up.json()).message, /bakım/i);
    const cb = await import(new URL("../src/app/api/auth/[...nextauth]/route.ts", import.meta.url).href);
    const cbr = await cb.GET(new NextRequest("https://example.test/api/auth/callback/google?code=x", { headers: { cookie: "bg_admin_return=/k3x9-concealed-admin-path-0123456789" } }));
    assert.equal(cbr.status, 503, "the OAuth callback does not run during maintenance");
    const { signInAction } = await import(new URL("../src/app/internal-admin/giris/actions.ts", import.meta.url).href);
    assert.equal(await signInAction(), undefined, "sign-in does not start");
    delete process.env.MAINTENANCE_MODE; delete process.env.ADMIN_BASE_PATH;
  });

  await test("indexing: default is noindex everywhere on the public site; SITE_ALLOW_INDEXING=1 is the single reversible switch", async () => {
    delete process.env.SITE_ALLOW_INDEXING;
    assert.equal(indexingAllowed(), false);
    for (const v of ["", "0", "true", "yes", "on", "2"]) { process.env.SITE_ALLOW_INDEXING = v; assert.equal(indexingAllowed(), false, `value ${JSON.stringify(v)} must not allow indexing`); }
    delete process.env.SITE_ALLOW_INDEXING;
    for (const path of ["/", "/opportunities", "/reels", "/duyurular/x", "/contact", "/reels/demo/demo-opp-1.webp", "/does-not-exist", "/admin/review", "/internal-admin"]) {
      for (const method of ["GET", "HEAD", "POST"]) {
        const res = await middleware(req(path, method));
        assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow", `${method} ${path}`);
      }
    }
    process.env.SITE_ALLOW_INDEXING = "1"; assert.equal(indexingAllowed(), true);
    for (const path of ["/", "/opportunities", "/reels/demo/demo-opp-1.webp", "/does-not-exist"]) assert.equal((await middleware(req(path))).headers.get("x-robots-tag"), null, path);
    delete process.env.SITE_ALLOW_INDEXING;
  });

  await test("indexing: the root layout uses the same setting, robots.txt never disallows, the admin stays noindex regardless", () => {
    const layout = fs.readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
    assert.match(layout, /indexingAllowed\(\)/); assert.match(layout, /robots: NOINDEX_ROBOTS/);
    for (const f of ["../public/robots.txt", "../src/app/robots.ts", "../src/app/robots.tsx", "../src/app/robots.txt"]) {
      const file = new URL(f, import.meta.url);
      if (fs.existsSync(file)) assert.ok(!/^\s*disallow:\s*\S/im.test(fs.readFileSync(file, "utf8")), `${f} must not disallow crawling`);
    }
    assert.match(fs.readFileSync(new URL("../src/app/internal-admin/layout.tsx", import.meta.url), "utf8"), /robots: \{ index: false, follow: false, nocache: true \}/);
  });
}

console.log(`\n${pass} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
