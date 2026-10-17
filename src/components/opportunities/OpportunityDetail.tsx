import Image from "next/image";
import type { Opportunity } from "@/lib/types/content";
import { Badge } from "@/components/ui/Badge";
import { formatDateTr, getDeadlineStatus } from "@/lib/utils/date";
import { getCountryByCode } from "@/lib/repositories/countryRepository";
import { getCategoryBySlug } from "@/lib/repositories/categoryRepository";

export function OpportunityDetail({ opportunity }: { opportunity: Opportunity }) {
  const country = getCountryByCode(opportunity.country);
  const category = getCategoryBySlug(opportunity.category);
  const status = getDeadlineStatus(opportunity.deadline);

  const statusText =
    status === "closed" ? "Süre doldu" : status === "soon" ? "Son günler" : "Açık";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="relative h-56 w-full bg-slate-100 sm:h-72">
        {opportunity.coverImage ? (
          <Image
            alt={opportunity.title}
            src={opportunity.coverImage}
            fill
            className="object-cover"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
          {opportunity.featured ? <Badge tone="brand">Öne çıkan</Badge> : null}
          <Badge tone={status === "active" ? "success" : "warning"}>{statusText}</Badge>
          {category ? <Badge>{category.title}</Badge> : null}
          {country ? <Badge tone="slate">{country.name}</Badge> : null}
        </div>
      </div>

      <div className="space-y-5 p-6 sm:p-8">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {opportunity.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            <span className="font-semibold text-ink">Son tarih:</span>{" "}
            {formatDateTr(opportunity.deadline)}
          </p>
        </div>

        <div className="max-w-none space-y-1">
          {opportunity.fullDescription.split("\n").map((line, idx) => {
            if (!line.trim()) return <div key={idx} className="h-3" />;
            return (
              <p key={idx} className="text-sm leading-relaxed text-slate-700 sm:text-base">
                {line}
              </p>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={opportunity.externalLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Başvuru linkine git
          </a>
          <div className="text-xs text-slate-600">
            Link örnek/placeholder olabilir. Gerçek duyuru için resmi kaynağı
            doğrulayın.
          </div>
        </div>
      </div>
    </section>
  );
}

