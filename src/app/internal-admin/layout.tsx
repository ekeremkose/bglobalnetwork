// Admin screens always read the live store and the live session; never a prerendered copy.
export const dynamic = "force-dynamic";

export const metadata = { title: "Yönetim", robots: { index: false, follow: false, nocache: true } };

export default function InternalAdminRoot({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
