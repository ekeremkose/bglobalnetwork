"use client";

import { useEffect, useState } from "react";
import type { FoundOpportunityCandidate, PublishDraft } from "@/lib/types/foundOpportunity";

type Props = {
  item: FoundOpportunityCandidate | null;
  open: boolean;
  onClose: () => void;
  onPublish: (candidate: FoundOpportunityCandidate, draft: PublishDraft) => void;
};

function initDraft(item: FoundOpportunityCandidate): PublishDraft {
  return {
    title: item.sourceTitle,
    shortDescription: item.aiSummary,
    fullDescription: item.aiSummary,
    featured: false,
    coverImage: undefined,
  };
}

export function PublishModal({ item, open, onClose, onPublish }: Props) {
  const [draft, setDraft] = useState<PublishDraft | null>(null);

  useEffect(() => {
    if (item) setDraft(initDraft(item));
  }, [item]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item || !draft) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="publish-modal-title" className="text-lg font-semibold text-slate-900">
            Yayınla
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Bu fırsat onaylandıktan sonra sitede yayınlanacak.
          </p>
        </div>

        <form
          className="space-y-4 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            onPublish(item, draft);
            onClose();
          }}
        >
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Başlık <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              Kısa açıklama <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={draft.shortDescription}
              onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              Tam açıklama <span className="text-red-500">*</span>
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              Sitede gösterilecek detaylı açıklama. Başvuru şartları, tarihler ve bağlantıları buraya ekle.
            </p>
            <textarea
              required
              rows={7}
              value={draft.fullDescription}
              onChange={(e) => setDraft({ ...draft, fullDescription: e.target.value })}
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              Kapak görseli URL (opsiyonel)
            </label>
            <input
              type="url"
              value={draft.coverImage ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, coverImage: e.target.value || undefined })
              }
              placeholder="https://..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="publish-featured"
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
            />
            <label htmlFor="publish-featured" className="text-sm font-medium text-slate-700">
              Öne çıkar
            </label>
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
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Onayla ve Yayınla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
