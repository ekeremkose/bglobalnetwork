import Link from "next/link";
import type { Opportunity } from "@/lib/types/content";
import { formatDateTr, getDeadlineStatus } from "@/lib/utils/date";
import { getCategoryBySlug } from "@/lib/repositories/categoryRepository";
import { getCountryByCode } from "@/lib/repositories/countryRepository";

export function HomeFeaturedOpportunities({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  return (
    <section className="py-14 sm:py-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-bold text-white sm:text-xl">
          Öne Çıkan Projeler
        </h2>
        <Link
          href="/opportunities"
          className="group shrink-0 text-sm text-white/40 transition hover:text-white"
        >
          Tüm projeleri gör{" "}
          <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      <div className="mt-5">
        {opportunities.map((opp) => {
          const category = getCategoryBySlug(opp.category);
          const country = getCountryByCode(opp.country);
          const status = getDeadlineStatus(opp.deadline);
          const isSoon = status === "soon";

          return (
            <Link
              key={opp.id}
              href={`/opportunities/${opp.slug}`}
              className="group flex items-center gap-4 border-t border-white/[0.06] py-4 transition hover:bg-white/[0.025] sm:gap-6 sm:py-5"
            >
              {/* Kategori etiketi */}
              <div className="hidden w-28 shrink-0 sm:block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/35">
                  {category?.title ?? "—"}
                </span>
              </div>

              {/* Başlık */}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/30 sm:hidden">
                  {category?.title}
                </p>
                <h3 className="truncate text-sm font-semibold text-white transition group-hover:text-brand-200 sm:text-base">
                  {opp.title}
                </h3>
              </div>

              {/* Ülke */}
              <div className="hidden shrink-0 sm:block">
                <span className="text-xs text-white/40">
                  {country?.name ?? "—"}
                </span>
              </div>

              {/* Son tarih */}
              <div className="shrink-0 text-right">
                <span
                  className={[
                    "text-xs",
                    isSoon ? "font-semibold text-amber-400" : "text-white/35",
                  ].join(" ")}
                >
                  {formatDateTr(opp.deadline)}
                </span>
              </div>

              {/* Ok */}
              <div className="shrink-0 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-brand-300">
                →
              </div>
            </Link>
          );
        })}
        <div className="border-t border-white/[0.06]" />
      </div>
    </section>
  );
}
