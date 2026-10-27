import { RichText } from "@/components/ui/RichText";
import type { Opportunity } from "@/lib/types/content";
import {
  daysUntil,
  formatDateTr,
  getDeadlineStatus,
} from "@/lib/utils/date";
import { getCountryByCode } from "@/lib/repositories/countryRepository";
import { getCategoryBySlug } from "@/lib/repositories/categoryRepository";

export function OpportunityDetail({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const country = getCountryByCode(opportunity.country);
  const category = getCategoryBySlug(opportunity.category);
  const status = getDeadlineStatus(opportunity.deadline);
  const closed = status === "closed";

  const meta = [
    { k: "Son tarih", v: formatDateTr(opportunity.deadline) },
    {
      k: "Durum",
      v: closed
        ? "Süresi doldu"
        : `${daysUntil(opportunity.deadline)} gün kaldı`,
      tone: closed ? "muted" : status === "soon" ? "warn" : "ok",
    },
    { k: "Ülke", v: country?.name },
    { k: "Kategori", v: category?.title },
  ];

  return (
    <article>
      <header className="max-w-3xl">
        <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-[#f4f5fa] sm:text-5xl">
          {opportunity.title}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">
          {opportunity.shortDescription}
        </p>
      </header>

      <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-white/10 py-6 md:grid-cols-4">
        {meta.map((m) => (
          <div key={m.k}>
            <dt className="text-[13px] text-white/45">{m.k}</dt>
            <dd
              className={[
                "mt-1 text-lg font-medium",
                m.tone === "muted"
                  ? "text-white/55"
                  : m.tone === "warn"
                    ? "text-amber-400"
                    : "text-white",
              ].join(" ")}
            >
              {m.v}
            </dd>
          </div>
        ))}
      </dl>

      {closed && (
        <p className="mt-8 max-w-2xl border-l-2 border-amber-400 pl-4 text-[15px] leading-relaxed text-white/75">
          Bu çağrının başvuru süresi doldu. Aşağıdaki bilgiler arşiv amaçlıdır;
          bir sonraki dönem için resmi kaynağı takip et.
        </p>
      )}

      <RichText
        text={opportunity.fullDescription}
        className="mt-10 max-w-2xl space-y-5 text-lg leading-relaxed text-white/75"
      />

      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
        <a
          href={opportunity.externalLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
        >
          {closed ? "Çağrı sayfasını gör" : "Başvuru sayfasına git"}{" "}
          <span aria-hidden>↗</span>
        </a>
        <p className="max-w-xs text-[13px] leading-relaxed text-white/45">
          Başvurmadan önce koşulları ve son tarihi kaynak sayfada kontrol et.
        </p>
      </div>
    </article>
  );
}
