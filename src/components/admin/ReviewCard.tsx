"use client";

import type { FoundOpportunityCandidate } from "@/lib/types/foundOpportunity";
import { getReviewWarnings } from "@/lib/utils/foundOpportunityReview";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDateTr } from "@/lib/utils/date";
import { getCountryByCode } from "@/lib/repositories/countryRepository";
import { getCategoryBySlug } from "@/lib/repositories/categoryRepository";

type Props = {
  item: FoundOpportunityCandidate;
  onEdit: () => void;
  onOpenPublish: () => void;
  onSetStatus: (id: string, status: FoundOpportunityCandidate["status"]) => void;
};

function formatConfidence(c?: number): string | null {
  if (c === undefined || Number.isNaN(c)) return null;
  const pct = c <= 1 ? Math.round(c * 100) : Math.round(c);
  return `%${pct}`;
}

export function ReviewCard({ item, onEdit, onOpenPublish, onSetStatus }: Props) {
  const warnings = getReviewWarnings(item);
  const countryName = item.country
    ? getCountryByCode(item.country)?.name ?? item.country
    : null;
  const categoryTitle =
    getCategoryBySlug(item.category)?.title ?? item.category;

  const conf = formatConfidence(item.confidence);

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold leading-snug text-slate-900">{item.sourceTitle}</h3>
            <p className="mt-1 text-sm text-slate-500">{item.sourceDomain}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />
            {conf ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Güven: {conf}
              </span>
            ) : null}
          </div>
        </div>

        <dl className="mt-4 grid gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ülke
            </dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              {countryName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Kategori
            </dt>
            <dd className="mt-0.5 font-medium text-slate-900">{categoryTitle}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Son tarih
            </dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              {item.deadline ? formatDateTr(item.deadline) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Kaynak adı
            </dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              {item.sourceName ?? "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            AI özeti
          </div>
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-700">
            {item.aiSummary}
          </p>
        </div>

        {warnings.length > 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="text-xs font-semibold text-amber-900">Uyarılar</div>
            <ul className="mt-2 list-inside list-disc text-sm text-amber-950">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Kaynağı aç
          </a>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Düzenle
          </button>
          <button
            type="button"
            onClick={onOpenPublish}
            disabled={item.status === "approved"}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Onayla
          </button>
          <button
            type="button"
            onClick={() => onSetStatus(item.id, "rejected")}
            disabled={item.status === "rejected"}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reddet
          </button>
        </div>
      </article>
  );
}
