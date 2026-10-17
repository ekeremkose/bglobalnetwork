import { ReelsPageClient } from "@/components/pages/ReelsPageClient";
import { getReels } from "@/lib/repositories/reelRepository";

export default function ReelsPage() {
  const reels = getReels();
  return <ReelsPageClient reels={reels} />;
}

