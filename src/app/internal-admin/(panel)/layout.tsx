import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdminPage } from "@/lib/auth/guard";
import { adminBasePath } from "@/lib/config/admin";
import { signOutAction } from "@/app/internal-admin/giris/actions";
import { storeMode } from "@/lib/db/mode";

export default async function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  // Pages repeat this check themselves: layouts are not re-run on client-side navigation.
  const admin = await requireAdminPage();
  const temporary = storeMode() === "memory";
  return (
    <div className="flex min-h-dvh flex-col bg-slate-100 text-slate-900 md:flex-row">
      <AdminSidebar base={adminBasePath()!} email={admin.email} signOut={signOutAction} />
      <main className="min-w-0 flex-1">
        {temporary && (
          <div
            role="note"
            className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-amber-900 sm:px-6 lg:px-8"
          >
            <strong>Geçici depolama (yalnızca yerel geliştirme).</strong> Kayıtlar sunucu belleğinde tutulur ve sunucu yeniden
            başlayınca sıfırlanır. Canlı ortamda kalıcı veritabanı kullanılır.
          </div>
        )}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
