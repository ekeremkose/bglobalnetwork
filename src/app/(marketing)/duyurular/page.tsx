import { DuyurularPageClient } from "@/components/pages/DuyurularPageClient";
import { getAnnouncements } from "@/lib/repositories/announcementRepository";

export const metadata = { title: "Blog — B-Global Network" };

export const revalidate = 3600;

export default async function DuyurularPage() {
  const announcements = await getAnnouncements();
  return <DuyurularPageClient announcements={announcements} />;
}
