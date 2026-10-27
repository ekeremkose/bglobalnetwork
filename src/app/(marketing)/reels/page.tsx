import { ReelsPageClient } from "@/components/pages/ReelsPageClient";
import { getReels } from "@/lib/repositories/reelRepository";

export const revalidate = 3600;

export default async function ReelsPage() {
  const reels = await getReels();
  return <ReelsPageClient reels={reels} />;
}

