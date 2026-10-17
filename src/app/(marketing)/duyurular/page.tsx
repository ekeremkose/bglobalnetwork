import { DuyurularPageClient } from "@/components/pages/DuyurularPageClient";
import { getAnnouncements } from "@/lib/repositories/announcementRepository";

export const metadata = { title: "Duyurular — B-Global Network" };

export default function DuyurularPage() {
  const announcements = getAnnouncements();
  return <DuyurularPageClient announcements={announcements} />;
}
