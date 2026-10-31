import { NextResponse, type NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { ADMIN_RETURN_COOKIE, adminBasePath } from "@/lib/config/admin";
import { maintenanceOn, maintenanceResponse } from "@/lib/config/maintenance";

/**
 * Auth.js is used only for Google's OAuth callback. Its other endpoints (providers, csrf,
 * session, signin, signout, error) are not exposed: sign-in and sign-out run as server
 * actions on the concealed admin path, so nothing here serves session data.
 *
 * The callback redirects into the admin path (to the panel on success, to the sign-in page on
 * failure). A stranger who calls it directly must not learn that path, so a redirect into it is
 * only passed on for a browser carrying the cookie that signInAction set (whose value is the path).
 */
const CALLBACK = /^\/api\/auth\/callback\/google\/?$/;
const notFound = () => new NextResponse(null, { status: 404, headers: { "cache-control": "no-store" } });

export async function GET(request: NextRequest) {
  if (maintenanceOn()) return maintenanceResponse(request.method) as NextResponse;
  if (!CALLBACK.test(request.nextUrl.pathname)) return notFound();
  const base = adminBasePath();
  if (!base || request.cookies.get(ADMIN_RETURN_COOKIE)?.value !== base) return notFound();
  return handlers.GET(request);
}

export async function POST() {
  return notFound();
}
