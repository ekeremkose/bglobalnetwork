import Link from "next/link";
import type { Reel } from "@/lib/types/content";
import { ReelTile } from "@/components/reels/ReelTile";

const SUPPORT_COL = ["lg:col-start-2", "lg:col-start-3", "lg:col-start-4"];

export function HomeReels({ lead, more }: { lead: Reel; more: Reel[] }) {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-y-10 lg:grid-cols-[1.25fr_1fr_1fr_1fr] lg:gap-x-6">
          <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-t border-ink/40 pt-3 lg:col-span-3 lg:col-start-2 lg:row-start-1 lg:self-start">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                İçerik
              </h2>
              <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-soft">
                Instagram&apos;da yayınladığımız Reels videoları.
              </p>
            </div>
            <Link
              href="/reels"
              className="text-[15px] underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink"
            >
              Tüm içerikler →
            </Link>
          </header>

          <ul className="-mx-4 flex snap-x scroll-pl-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-pl-6 sm:px-6 lg:contents">
            <li className="w-[64vw] max-w-[17.5rem] shrink-0 snap-start lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:w-auto lg:max-w-none">
              <ReelTile
                reel={lead}
                variant={0}
                surface="light"
                size="lead"
                showDescription
                sizes="(max-width: 1024px) 64vw, 300px"
              />
            </li>
            {more.map((r, i) => (
              <li
                key={r.id}
                className={`w-[46vw] max-w-[13.5rem] shrink-0 snap-start lg:row-start-2 lg:w-auto lg:max-w-none lg:self-end ${SUPPORT_COL[i]}`}
              >
                <ReelTile
                  reel={r}
                  variant={i + 1}
                  surface="light"
                  sizes="(max-width: 1024px) 46vw, 232px"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
