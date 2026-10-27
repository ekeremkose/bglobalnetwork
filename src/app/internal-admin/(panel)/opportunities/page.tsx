import { OpportunitiesAdminClient } from "@/components/admin/OpportunitiesAdminClient";
import { adminListOpportunities, adminListReels } from "@/lib/repositories/adminRepository";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Projeler — Yönetim" };

export default async function AdminOpportunitiesPage() {
  await requireAdminPage();
  const [items, reels] = await Promise.all([adminListOpportunities(), adminListReels()]);
  return <OpportunitiesAdminClient initialItems={items} reels={reels} />;
}
