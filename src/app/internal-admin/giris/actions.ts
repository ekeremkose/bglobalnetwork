"use server";

import { cookies } from "next/headers";
import { signIn, signOut } from "@/lib/auth";
import { ADMIN_RETURN_COOKIE, adminBasePath } from "@/lib/config/admin";
import { maintenanceOn } from "@/lib/config/maintenance";

/** Starts the Google flow. Anyone may press the button; only the allow-listed account is let in afterwards. */
export async function signInAction() {
  const base = adminBasePath();
  if (!base || maintenanceOn()) return;
  // Proves, on the way back from Google, that this browser started the flow on the admin path
  // (see /api/auth route): it is what lets the callback redirect to the path without disclosing it to strangers.
  (await cookies()).set(ADMIN_RETURN_COOKIE, base, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: 600,
  });
  await signIn("google", { redirectTo: base });
}

export async function signOutAction() {
  const base = adminBasePath();
  if (!base) return;
  await signOut({ redirectTo: `${base}/giris` });
}
