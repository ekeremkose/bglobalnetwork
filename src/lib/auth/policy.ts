import { ADMIN_EMAILS } from "@/lib/config/admin";

export type Identity = { email?: string | null; emailVerified?: boolean | null };

export function isAllowListed(email: string | null | undefined): boolean {
  return typeof email === "string" && ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/** The single authorization rule: an allow-listed email that Google reports as verified. */
export function isAdminIdentity({ email, emailVerified }: Identity): boolean {
  return emailVerified === true && isAllowListed(email);
}
