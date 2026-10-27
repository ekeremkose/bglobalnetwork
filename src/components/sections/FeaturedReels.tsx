import Link from "next/link";
import { getFeaturedReels } from "@/lib/repositories/reelRepository";
import { ReelGrid } from "@/components/reels/ReelGrid";

export async function FeaturedReels() {
  const featured = await getFeaturedReels(6);
  return (
    <section className="py-16 sm:py-20">
      <div className="mb-10 flex items-center gap-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
          Reels & Duyurular
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
        <Link
          href="/reels"
          className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25 transition hover:text-white/60"
        >
          Tümü →
        </Link>
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Kısa içerikler,<br className="sm:hidden" /> hızlı aksiyon
      </h2>

      <div className="mt-10">
        <ReelGrid reels={featured} />
      </div>
    </section>
  );
}
