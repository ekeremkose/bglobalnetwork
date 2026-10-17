import Image from "next/image";
import Link from "next/link";
import type { Reel } from "@/lib/types/content";

export function HomeReelsPreview({ reels }: { reels: Reel[] }) {
  return (
    <section className="py-14 sm:py-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-bold text-white sm:text-xl">
          B-Global İçerik
        </h2>
        <Link
          href="/reels"
          className="group shrink-0 text-sm text-white/40 transition hover:text-white"
        >
          Tüm içerikleri gör{" "}
          <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {reels.map((reel) => (
          <a
            key={reel.id}
            href={reel.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col overflow-hidden rounded-md border border-white/[0.07] transition hover:border-white/20"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-white/5">
              {reel.thumbnail ? (
                <Image
                  src={reel.thumbnail}
                  alt={reel.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs font-bold text-white/15">IG</span>
                </div>
              )}
              {/* Tag overlay */}
              <div className="absolute bottom-2 left-2">
                <span className="rounded-sm bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                  {reel.tag}
                </span>
              </div>
            </div>

            {/* Başlık + aksiyon */}
            <div className="flex flex-1 flex-col justify-between p-3">
              <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-white sm:text-sm">
                {reel.title}
              </h3>
              <p className="mt-2 text-[10px] font-semibold text-brand-300 transition group-hover:text-brand-200">
                Instagram →
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
