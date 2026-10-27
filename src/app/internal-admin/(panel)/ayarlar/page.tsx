import { SettingsAdminClient } from "@/components/admin/SettingsAdminClient";
import { SITE_DEFAULTS } from "@/lib/site";
import { getSiteSettings } from "@/lib/repositories/settingsRepository";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Site ayarları — Yönetim" };

export default async function AdminSettingsPage() {
  await requireAdminPage();
  return <SettingsAdminClient initial={await getSiteSettings()} defaults={SITE_DEFAULTS} />;
}
