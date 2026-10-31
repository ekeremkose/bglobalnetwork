import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminIdentity } from "@/lib/auth/policy";
import { adminBasePath } from "@/lib/config/admin";
import { maintenanceOn } from "@/lib/config/maintenance";

export type AdminSession = { email: string };

/**
 * The signed-in administrator, or null. Calls Auth.js, which verifies the cookie signature,
 * then re-applies the allow-list and the verified-email rule on every call. Any failure
 * (missing secret, bad cookie, other Google account) is "not an admin".
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  // During maintenance nobody is an administrator, whatever cookie they hold.
  if (maintenanceOn()) return null;
  try {
    const session = await auth();
    const email = session?.user?.email;
    const emailVerified = (session as unknown as { emailVerified?: boolean } | null)?.emailVerified;
    if (email && isAdminIdentity({ email, emailVerified })) return { email: email.toLowerCase() };
  } catch {
    // fall through
  }
  return null;
}

/** For admin pages and layouts: anyone else is sent to the sign-in page (which shows no data). */
export async function requireAdminPage(): Promise<AdminSession> {
  const base = adminBasePath();
  if (!base || maintenanceOn()) notFound();
  const admin = await getAdminSession();
  if (!admin) redirect(`${base}/giris`);
  return admin;
}
