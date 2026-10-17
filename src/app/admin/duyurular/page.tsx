import { AnnouncementsAdminClient } from "@/components/admin/AnnouncementsAdminClient";
import { getAnnouncements } from "@/lib/repositories/announcementRepository";

export const metadata = { title: "Duyurular — Admin" };

export default function AdminDuyurularPage() {
  const items = getAnnouncements();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <AnnouncementsAdminClient initialItems={items} />
    </div>
  );
}
