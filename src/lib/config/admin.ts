/**
 * The one place that decides who may administer the site and where the admin lives.
 * Nothing else may hard-code either.
 */

/** Google accounts allowed into the admin. Compared case-insensitively, and only when Google says the email is verified. */
export const ADMIN_EMAILS: readonly string[] = ["pr.bglobalnetwork@gmail.com"];

/**
 * Internal route folder that holds the admin pages (src/app/internal-admin). It is
 * never served directly: middleware rewrites the concealed public path onto it and
 * answers 404 to anyone who asks for this prefix or for the former /admin URLs.
 */
export const INTERNAL_ADMIN_PREFIX = "/internal-admin";

const SLUG = /^[a-z0-9][a-z0-9-]{14,62}[a-z0-9]$/;

/**
 * The concealed public path of the admin, e.g. "/k3x9-…". It comes from ADMIN_BASE_PATH
 * (set per environment, never committed, not linked anywhere). Anything shorter than 16
 * characters or with odd characters counts as "not configured", which keeps the admin
 * switched off rather than falling back to a guessable default.
 */
export function adminBasePath(): string | null {
  const raw = (process.env.ADMIN_BASE_PATH ?? "").trim().replace(/^\/+|\/+$/g, "");
  return SLUG.test(raw) ? `/${raw}` : null;
}

/** Former admin URLs that must look like any other missing page. */
export const FORMER_ADMIN_PATH = /^\/+admin(\/|$)/i;

export function isInternalAdminPath(pathname: string) {
  return pathname === INTERNAL_ADMIN_PREFIX || pathname.startsWith(INTERNAL_ADMIN_PREFIX + "/");
}

/** Short-lived cookie set when sign-in starts; the OAuth callback only redirects into the admin path for a browser that has it. */
export const ADMIN_RETURN_COOKIE = "bg_admin_return";
