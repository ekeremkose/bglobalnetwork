import Link from "next/link";
import type { Opportunity } from "@/lib/types/content";
import { daysUntil } from "@/lib/utils/date";
import { getCategoryBySlug } from "@/lib/repositories/categoryRepository";
import { getCountryByCode } from "@/lib/repositories/countryRepository";

const monthLong = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { month: "long", timeZone: "UTC" }).format(
    new Date(iso)
  );

export function HomeHero({
  open,
  closedCount,
  dateline,
}: {
  open: Opportunity[];
  closedCount: number;
  dateline: string;
}) {
  const next = open[0];
  const left = next ? daysUntil(next.deadline) : 0;

  return (
    <section className="pb-14 pt-8 sm:pb-20 sm:pt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-white/25 pt-3 text-sm text-white/60">
        <span>{dateline}</span>
        <span>
          {open.length} program açık
          {closedCount > 0 && <>, {closedCount} arşivde</>}
        </span>
      </div>

      <div className="mt-10 grid gap-14 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-8">
          <h1 className="font-serif text-[3.2rem] leading-[0.96] tracking-[-0.015em] text-[#f4f5fa] sm:text-6xl lg:text-[5.5rem]">
            Yurt dışındaki fırsatları kaçırma.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-white/65">
            Erasmus+, staj, burs, gönüllülük ve yaz okulu programları. Son
            tarihe göre sıralı, başvuru adımlarıyla birlikte.
          </p>
          <Link
            href="#acik"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
          >
            Açık programlara bak <span aria-hidden>↓</span>
          </Link>
        </div>

        <div className="lg:col-span-4">
          <p className="border-b border-white/20 pb-3 text-sm text-white/60">
            Sıradaki son tarih
          </p>
          {next ? (
            <Link
              href={`/opportunities/${next.slug}`}
              className="group mt-6 block"
            >
              <span className="flex items-end gap-5">
                <span className="relative inline-block px-6 py-2 sm:px-8">
                  <svg
                    aria-hidden
                    viewBox="0 0 170 110"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full text-brand-300"
                  >
                    <path
                      d="M18 70 C 6 38, 52 8, 98 9 C 146 10, 168 40, 150 74 C 132 106, 56 106, 28 88 C 10 76, 14 52, 40 36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <span className="relative block font-serif text-[6.5rem] leading-[0.95] text-white sm:text-[7.5rem]">
                    {new Date(next.deadline).getUTCDate()}
                  </span>
                </span>
                <span className="pb-3">
                  <span className="block font-serif text-4xl leading-none text-white">
                    {monthLong(next.deadline)}
                  </span>
                  <span className="mt-2 block text-[15px] text-brand-300">
                    {left} gün kaldı
                  </span>
                </span>
              </span>
              <span className="mt-6 block text-pretty text-xl font-medium leading-snug text-white underline decoration-white/0 underline-offset-4 transition group-hover:decoration-white/50">
                {next.title}
              </span>
              <span className="mt-1.5 block text-[15px] text-white/55">
                {[
                  getCountryByCode(next.country)?.name,
                  getCategoryBySlug(next.category)?.title,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </Link>
          ) : (
            <p className="mt-6 max-w-xs text-lg text-white/65">
              Şu an başvuruya açık program yok. Süresi dolanlar arşivde.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
