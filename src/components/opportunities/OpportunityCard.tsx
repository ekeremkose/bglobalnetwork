import Image from "next/image";
import Link from "next/link";
import type { Opportunity } from "@/lib/types/content";
import { formatDateTr, getDeadlineStatus } from "@/lib/utils/date";
import { getCountryByCode } from "@/lib/repositories/countryRepository";
import { getCategoryBySlug } from "@/lib/repositories/categoryRepository";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const country = getCountryByCode(opportunity.country);
  const category = getCategoryBySlug(opportunity.category);
  const status = getDeadlineStatus(opportunity.deadline);

  const statusLabel =
    status === "closed" ? "Süre doldu" : status === "soon" ? "Son günler" : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-white/8 bg-white transition hover:border-white/15">
      <div className="relative aspect-[5/3] w-full shrink-0 bg-slate-100">
        {opportunity.coverImage ? (
          <Image
            alt={opportunity.title}
            src={opportunity.coverImage}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {opportunity.featured ? (
            <span className="rounded-sm bg-brand-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Öne çıkan
            </span>
          ) : null}
          {statusLabel ? (
            <span className="rounded-sm bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              {statusLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            {category?.title}
            {country ? ` · ${country.name}` : ""}
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-snug text-ink">
            {opportunity.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {opportunity.shortDescription}
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="text-[10px] text-slate-400">
            {formatDateTr(opportunity.deadline)}
          </div>
          <Link
            href={`/opportunities/${opportunity.slug}`}
            className="text-xs font-semibold text-brand-700 transition hover:text-brand-800"
          >
            Detay →
          </Link>
        </div>
      </div>
    </article>
  );
}
