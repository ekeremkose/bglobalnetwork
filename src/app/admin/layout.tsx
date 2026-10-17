import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh bg-slate-100 text-slate-900">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
