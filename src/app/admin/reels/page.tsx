import { ReelsAdminClient } from "@/components/admin/ReelsAdminClient";
import { getReels } from "@/lib/repositories/reelRepository";

export const metadata = { title: "Reels — Admin" };

export default function AdminReelsPage() {
  const items = getReels();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ReelsAdminClient initialItems={items} />
    </div>
  );
}
