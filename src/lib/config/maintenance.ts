/**
 * Maintenance mode: one switch, read from the environment on every request.
 *
 *   MAINTENANCE_MODE=1                      -> every request gets a minimal 503 page (middleware)
 *   MAINTENANCE_RETRY_AFTER_SECONDS=3600    -> optional; Retry-After value, clamped to 60..86400
 *
 * It exists as a fallback that needs no code change and no database: set the variable, redeploy,
 * and the site answers 503 while content and accounts stay untouched. The page below is
 * self-contained (inline CSS, no scripts, no images, no external requests, no store access).
 * Admin reads and mutations are ALSO refused where they are served (guard.ts, the upload and
 * auth routes), so a request that somehow bypassed the middleware still gets nothing.
 */
export function maintenanceOn(): boolean {
  const v = (process.env.MAINTENANCE_MODE ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "on";
}

export function retryAfterSeconds(): number {
  const n = Number.parseInt(process.env.MAINTENANCE_RETRY_AFTER_SECONDS ?? "", 10);
  return Number.isFinite(n) ? Math.min(86400, Math.max(60, n)) : 3600;
}

/** Shown to the administrator when an action is attempted during maintenance. */
export const MAINTENANCE_ACTION_MESSAGE = "Site bakım modunda: bu işlem şu an yapılamıyor. Bakım bitince tekrar deneyin.";

const PAGE = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Bakımdayız | B-Global Network</title>
<style>
html{color-scheme:dark}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b0b14;color:#f4f5fa;font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:30rem;padding:2rem}
p.k{margin:0 0 .5rem;font-size:.85rem;letter-spacing:.08em;text-transform:uppercase;color:rgba(244,245,250,.5)}
h1{margin:0 0 1rem;font-size:2rem;line-height:1.2;font-weight:600}
p{margin:0;color:rgba(244,245,250,.7)}
</style>
</head>
<body>
<main>
<p class="k">B-Global Network</p>
<h1>Kısa bir bakımdayız.</h1>
<p>Siteyi kısa süreliğine güncelliyoruz. Lütfen biraz sonra tekrar dene.</p>
</main>
</body>
</html>
`;

/** The 503 answer. HEAD gets the headers only. */
export function maintenanceResponse(method = "GET"): Response {
  return new Response(method === "HEAD" ? null : PAGE, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "retry-after": String(retryAfterSeconds()),
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
