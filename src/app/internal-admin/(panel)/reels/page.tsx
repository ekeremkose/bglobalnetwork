import { ReelsAdminClient } from "@/components/admin/ReelsAdminClient";
import { adminListReels } from "@/lib/repositories/adminRepository";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "İçerik (Reels) — Yönetim" };

export default async function AdminReelsPage() {
  await requireAdminPage();
  return <ReelsAdminClient initialItems={await adminListReels()} />;
}
