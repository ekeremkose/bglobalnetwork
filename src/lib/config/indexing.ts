/**
 * Search-engine indexing of the public site, decided in one place.
 *
 * The default is NOT indexable: a missing or mistyped variable can never expose demo or draft-quality
 * content. Set SITE_ALLOW_INDEXING=1 on the deployment (and redeploy) when real content is live.
 *
 * Applied twice so every public response says the same thing: a robots meta tag from the root layout
 * (see app/layout.tsx) and an X-Robots-Tag header from the middleware (covers pages, the 404 page and
 * static files). robots.txt must NOT disallow anything: a crawler that is not allowed to fetch a page
 * never sees its noindex. This is a request to well-behaved crawlers, not access control.
 */
export const NOINDEX_VALUE = "noindex, nofollow";
export const NOINDEX_ROBOTS = { index: false, follow: false } as const;

export function indexingAllowed(): boolean {
  return (process.env.SITE_ALLOW_INDEXING ?? "").trim() === "1";
}
