import { BlogAdminClient } from "@/components/admin/BlogAdminClient";
import { adminListAnnouncements } from "@/lib/repositories/adminRepository";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Blog — Yönetim" };

export default async function AdminBlogPage() {
  await requireAdminPage();
  return <BlogAdminClient initialItems={await adminListAnnouncements()} />;
}
