import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth/guard";
import { adminBasePath } from "@/lib/config/admin";

export default async function AdminIndexPage() {
  await requireAdminPage();
  redirect(`${adminBasePath()}/opportunities`);
}
