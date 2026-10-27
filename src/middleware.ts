import { NextResponse, type NextRequest } from "next/server";
import { FORMER_ADMIN_PATH, INTERNAL_ADMIN_PREFIX, adminBasePath, isInternalAdminPath } from "@/lib/config/admin";

/**
 * - The former /admin URLs and the internal route folder look like any other missing page and
 *   never mention the real admin path.
 * - The concealed admin path is rewritten onto the internal folder. Authorization is NOT done
 *   here: every page, action and endpoint checks the session itself (src/lib/auth/guard.ts).
 * - Public pages are left alone, whatever the method.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (FORMER_ADMIN_PATH.test(pathname) || isInternalAdminPath(pathname)) {
    // Posts (old server-action calls) get a bare 404; reads get the site's ordinary 404 page.
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new NextResponse(null, { status: 404, headers: { "cache-control": "no-store" } });
    }
    const res = NextResponse.rewrite(new URL("/__not_found__", request.url));
    res.headers.set("cache-control", "no-store");
    return res;
  }

  const base = adminBasePath();
  if (base && (pathname === base || pathname.startsWith(base + "/"))) {
    const url = request.nextUrl.clone();
    url.pathname = INTERNAL_ADMIN_PREFIX + pathname.slice(base.length);
    const res = NextResponse.rewrite(url);
    res.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    res.headers.set("cache-control", "no-store");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
