// Black-box authorization checks against a RUNNING server (default http://localhost:3000).
//
//   node --env-file=.env.local scripts/authz-probe.mjs [baseUrl]
//
// Needs AUTH_SECRET and ADMIN_BASE_PATH from the same environment the server uses. Session cookies are
// minted locally with the server's secret (no Google involved), which is exactly what a real sign-in
// would store, so this exercises the server-side checks and not a test shortcut. Prints no secret values
// and masks the admin path in output.
import { encode } from "@auth/core/jwt";
import sharp from "sharp";

const origin = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const secret = process.env.AUTH_SECRET;
const base = (process.env.ADMIN_BASE_PATH ?? "").replace(/^\/+|\/+$/g, "");
if (!secret || !base) {
  console.error("AUTH_SECRET ve ADMIN_BASE_PATH gerekli.");
  process.exit(2);
}
const COOKIE = origin.startsWith("https") ? "__Secure-authjs.session-token" : "authjs.session-token";
const mask = (s) => s.replaceAll(base, "<BASE>");

async function session(claims, { key = secret, maxAge = 3600 } = {}) {
  const token = await encode({ token: { sub: "t", ...claims }, secret: key, salt: COOKIE, maxAge });
  return `${COOKIE}=${token}`;
}
async function call(method, path, { cookie, body, headers } = {}) {
  const res = await fetch(origin + path, { method, redirect: "manual", body, headers: { ...(cookie ? { cookie } : {}), ...headers } });
  const text = await res.text();
  return { status: res.status, location: res.headers.get("location") ?? "", text, headers: res.headers };
}

let failed = 0;
function expect(name, ok, detail = "") {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + mask(detail)}`);
}
const redirectsToSignIn = (r) => r.status >= 300 && r.status < 400 && r.location.endsWith(`/${base}/giris`);

const admin = await session({ email: "pr.bglobalnetwork@gmail.com", emailVerified: true });
const other = await session({ email: "someone.else@gmail.com", emailVerified: true });
const unverified = await session({ email: "pr.bglobalnetwork@gmail.com", emailVerified: false });
const noFlag = await session({ email: "pr.bglobalnetwork@gmail.com" });
const forged = await session({ email: "pr.bglobalnetwork@gmail.com", emailVerified: true }, { key: "not-the-real-secret-0123456789abcdef" });
const upper = await session({ email: "PR.BGlobalNetwork@Gmail.com", emailVerified: true });
const lookalike = await session({ email: "pr.bglobalnetwork@gmail.com.evil.test", emailVerified: true });

// Former admin URLs: ordinary 404, nothing about the new path.
for (const [m, p] of [["GET", "/admin"], ["GET", "/admin/opportunities"], ["GET", "/admin/review"], ["GET", "/admin/reels"], ["POST", "/admin/opportunities"], ["GET", "/internal-admin"], ["GET", "/internal-admin/opportunities"], ["POST", "/internal-admin/yukle"]]) {
  for (const c of [undefined, admin]) {
    const r = await call(m, p, { cookie: c });
    expect(`${m} ${p}${c ? " (even as admin)" : ""} is a plain 404`, r.status === 404 && !r.text.includes(base) && !r.location.includes(base), `${r.status}`);
  }
}
// A guess is not the path.
expect("a wrong guess at the admin path is 404", (await call("GET", "/aaaaaaaaaaaaaaaaaaaa/opportunities")).status === 404);

// Auth.js endpoints other than the OAuth callback are not exposed.
for (const [m, p] of [["GET", "/api/auth/session"], ["GET", "/api/auth/providers"], ["GET", "/api/auth/csrf"], ["POST", "/api/auth/signin/google"], ["POST", "/api/auth/signout"], ["GET", "/api/auth/signin"], ["GET", "/api/auth/error"]]) {
  const r = await call(m, p, { cookie: admin });
  expect(`${m} ${p} is 404`, r.status === 404 && !r.text.includes(base), `${r.status}`);
}
const cb = await call("GET", "/api/auth/callback/google?code=x&state=y");
expect("OAuth callback from a stranger is 404 and discloses nothing", cb.status === 404 && !cb.location, `${cb.status} ${cb.location}`);

// Sign-in page: reachable, not indexable, no admin data.
const gi = await call("GET", `/${base}/giris`);
expect("sign-in page is reachable and says noindex", gi.status === 200 && /noindex/i.test(gi.headers.get("x-robots-tag") ?? "") && !gi.headers.get("cache-control")?.includes("public"), `${gi.status}`);
expect("sign-in page lists no content", !/Projeler|Reels|Blog yaz/.test(gi.text));

// Every protected page, per identity.
const pages = ["", "/opportunities", "/reels", "/duyurular", "/ayarlar"];
for (const p of pages) {
  for (const [label, c] of [["no cookie", undefined], ["other Google account", other], ["unverified email", unverified], ["missing verified flag", noFlag], ["forged signature", forged], ["look-alike email", lookalike]]) {
    const r = await call("GET", `/${base}${p}`, { cookie: c });
    expect(`page ${p || "/"} with ${label} -> sign-in, no data`, redirectsToSignIn(r) && !/<h1|Yeni|taslak/i.test(r.text), `${r.status} ${r.location}`);
  }
  const ok = await call("GET", `/${base}${p}`, { cookie: admin });
  const good = p === "" ? ok.status >= 300 && ok.status < 400 && ok.location.endsWith(`/${base}/opportunities`) : ok.status === 200 && /noindex/i.test(ok.headers.get("x-robots-tag") ?? "") && /noindex/i.test(ok.text);
  expect(`page ${p || "/"} with the allow-listed admin`, good, `${ok.status} ${ok.location}`);
  if (p) {
    const up = await call("GET", `/${base}${p}`, { cookie: upper });
    expect(`page ${p} accepts the admin email in any letter case`, up.status === 200, `${up.status}`);
  }
}

// Upload endpoint.
const png = await sharp({ create: { width: 40, height: 70, channels: 3, background: "#336" } }).png().toBuffer();
const form = (bytes, name = "a.png", type = "image/png") => { const f = new FormData(); f.set("file", new Blob([bytes], { type }), name); return f; };
for (const [label, c] of [["no cookie", undefined], ["other Google account", other], ["unverified email", unverified], ["forged signature", forged]]) {
  const r = await call("POST", `/${base}/yukle`, { cookie: c, body: form(png) });
  expect(`upload with ${label} is 404`, r.status === 404 && r.text === "", `${r.status}`);
}
const xo = await call("POST", `/${base}/yukle`, { cookie: admin, body: form(png), headers: { origin: "https://evil.example" } });
expect("upload from another origin is refused", xo.status === 404, `${xo.status}`);
const notImg = await call("POST", `/${base}/yukle`, { cookie: admin, body: form(Buffer.from("<svg onload=alert(1)>"), "a.png", "image/png") });
expect("upload of a non-image is rejected (422)", notImg.status === 422, `${notImg.status} ${notImg.text}`);
const svg = await call("POST", `/${base}/yukle`, { cookie: admin, body: form(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5"/>'), "a.svg", "image/svg+xml") });
expect("upload of an SVG is rejected (422)", svg.status === 422, `${svg.status}`);
const empty = await call("POST", `/${base}/yukle`, { cookie: admin, body: new FormData() });
expect("upload without a file is rejected (400)", empty.status === 400, `${empty.status}`);
const big = await call("POST", `/${base}/yukle`, { cookie: admin, body: form(Buffer.alloc(6 * 1024 * 1024, 1)) });
expect("upload over 5 MB is rejected (413/422)", big.status === 413 || big.status === 422, `${big.status}`);
const good = await call("POST", `/${base}/yukle`, { cookie: admin, body: form(png) });
expect("valid image by the admin reaches storage (201 with storage, 503 when none is configured)", good.status === 201 || good.status === 503, `${good.status}`);
if (good.status === 201 && process.env.BLOB_READ_WRITE_TOKEN) {
  // Leave a real Blob store as we found it: remove only the file this probe just created.
  const { del } = await import("@vercel/blob");
  const url = JSON.parse(good.text).url;
  if (typeof url === "string" && url.includes("/reels/cover")) await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
}

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exit(failed ? 1 : 0);
