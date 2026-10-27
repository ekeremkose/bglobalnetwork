import type { Reel } from "@/lib/types/content";
import { PageIntro } from "@/components/ui/PageIntro";
import { ReelTile } from "@/components/reels/ReelTile";
import { sortReelsForSite } from "@/lib/utils/reels";

export function ReelsPageClient({ reels }: { reels: Reel[] }) {
  // Explicit featured choice first, then newest.
  const sorted = sortReelsForSite(reels);

  return (
    <div className="pb-24">
      <PageIntro
        title="İçerik"
        description="Instagram'da yayınladığımız Reels videoları. Bir videoya tıklayınca Instagram'da açılır."
      />

      {sorted.length === 0 ? (
        <p className="border-t border-white/10 pt-10 text-lg text-white/65">
          Henüz içerik yok.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 border-t border-white/10 pt-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {sorted.map((r, i) => (
            <li key={r.id}>
              <ReelTile
                reel={r}
                variant={i}
                showDescription
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
