"use client";

import { useEffect, useState } from "react";
import type { FoundOpportunityCandidate } from "@/lib/types/foundOpportunity";

type Props = {
  item: FoundOpportunityCandidate | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: FoundOpportunityCandidate) => void;
  categoryOptions: { value: string; label: string }[];
  countryOptions: { value: string; label: string }[];
};

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function EditReviewModal({
  item,
  open,
  onClose,
  onSave,
  categoryOptions,
  countryOptions
}: Props) {
  const [draft, setDraft] = useState<FoundOpportunityCandidate | null>(null);

  useEffect(() => {
    if (item) setDraft({ ...item });
  }, [item]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !draft) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-review-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="edit-review-title" className="text-lg font-semibold text-slate-900">
            Düzenle
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Kayıt silinmez; sadece alanlar güncellenir.
          </p>
        </div>

        <form
          className="space-y-4 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            const url = draft.sourceUrl.trim();
            const domain = domainFromUrl(url) || draft.sourceDomain;
            onSave({ ...draft, sourceUrl: url, sourceDomain: domain });
            onClose();
          }}
        >
          <div>
            <label className="text-xs font-semibold text-slate-600">Kaynak başlığı</label>
            <input
              required
              value={draft.sourceTitle}
              onChange={(e) => setDraft({ ...draft, sourceTitle: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Kaynak URL</label>
            <input
              required
              type="url"
              value={draft.sourceUrl}
              onChange={(e) => {
                const u = e.target.value;
                setDraft({
                  ...draft,
                  sourceUrl: u,
                  sourceDomain: domainFromUrl(u) || draft.sourceDomain
                });
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Kaynak adı (opsiyonel)
            </label>
            <input
              value={draft.sourceName ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, sourceName: e.target.value || undefined })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Ülke</label>
              <select
                value={draft.country ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, country: e.target.value || undefined })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="">—</option>
                {countryOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Kategori</label>
              <select
                required
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                {categoryOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Son tarih</label>
            <input
              type="date"
              value={draft.deadline ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, deadline: e.target.value || undefined })
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">AI özeti (TR)</label>
            <textarea
              required
              rows={5}
              value={draft.aiSummary}
              onChange={(e) => setDraft({ ...draft, aiSummary: e.target.value })}
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
