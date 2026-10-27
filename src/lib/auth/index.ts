import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { adminBasePath } from "@/lib/config/admin";
import { isAdminIdentity, isAllowListed } from "@/lib/auth/policy";

const base = adminBasePath();
const SESSION_HOURS = 8;

/**
 * Google is the only sign-in method. Reading AUTH_SECRET, AUTH_GOOGLE_ID and
 * AUTH_GOOGLE_SECRET from the environment is Auth.js's default; nothing secret is in the code.
 * No database adapter: the session is a signed, httpOnly cookie, and every protected call
 * re-checks it against the allow-list (see guard.ts), so removing an email revokes access.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google({ authorization: { params: { prompt: "select_account" } } })],
  session: { strategy: "jwt", maxAge: SESSION_HOURS * 60 * 60 },
  trustHost: true,
  pages: base ? { signIn: `${base}/giris`, error: `${base}/giris` } : undefined,
  callbacks: {
    // Refuses the sign-in itself, so a non-admin Google account never receives a session.
    signIn({ profile }) {
      const identity = { email: profile?.email, emailVerified: profile?.email_verified };
      const allowed = isAdminIdentity(identity);
      // Reason only, never the address: lets a refused sign-in be diagnosed from the server log.
      if (!allowed) console.warn("[auth] sign-in refused", { emailVerified: identity.emailVerified === true, allowListed: isAllowListed(identity.email) });
      return allowed;
    },
    jwt({ token, profile }) {
      if (profile) {
        token.email = profile.email;
        token.emailVerified = profile.email_verified === true;
      }
      return token;
    },
    session({ session, token }) {
      (session as unknown as { emailVerified: boolean }).emailVerified = token.emailVerified === true;
      return session;
    },
  },
});
