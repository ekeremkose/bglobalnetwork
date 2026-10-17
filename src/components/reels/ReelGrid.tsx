import type { Reel } from "@/lib/types/content";
import { ReelCard } from "@/components/reels/ReelCard";

export function ReelGrid({ reels }: { reels: Reel[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reels.map((r) => (
        <ReelCard key={r.id} reel={r} />
      ))}
    </div>
  );
}

