"use client";

import { useEffect, useState } from "react";
import type { Opportunity } from "@/lib/types/content";
import { slugify } from "@/lib/utils/slug";

type Props = {
  item: Opportunity | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Opportunity) => void;
  categoryOptions: { value: string; label: string }[];
  countryOptions: { value: string; label: string }[];
};

function emptyOpportunity(): Opportunity {
  return {
    id: `opp-${Date.now()}`,
    slug: "",
    title: "",
    shortDescription: "",
    fullDescription: "",
    externalLink: "",
    country: "",
    category: "",
    deadline: "",
    publishedAt: new Date().toISOString().split("T")[0],
    featured: false,
  };
}

export function OpportunityFormModal({
  item,
  open,
  onClose,
  onSave,
  categoryOptions,
  countryOptions,
}: Props) {
  const [draft, setDraft] = useState<Opportunity>(emptyOpportunity);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(item ? { ...item } : emptyOpportunity());
      setSlugTouched(!!item);
    }
  }, [open, item]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleTitleChange(title: string) {
    setDraft((d) => ({
      ...d,
      title,
      slug: slugTouched ? d.slug : slugify(title),
    }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="opp-form-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="opp-form-title" className="text-lg font-semibold text-slate-900">
            {item ? "Fırsatı Düzenle" : "Yeni Fırsat"}
          </h2>
        </div>

        <form
          className="space-y-4 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(draft);
            onClose();
          }}
        >
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Başlık <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={draft.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-xs font-semibold text-slate-600">Slug</label>
            <input
              required
              value={draft.slug}
              onChange={(e) => { setSlugTouched(true); setDraft((d) => ({ ...d, slug: e.target.value })); }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm text-slate-500"
            />
          </div>

          {/* Short description */}
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Kısa açıklama <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={draft.shortDescription}
              onChange={(e) => setDraft((d) => ({ ...d, shortDescription: e.target.value }))}
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed"
            />
          </div>

          {/* Full description */}
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Tam açıklama <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={7}
              value={draft.fullDescription}
              onChange={(e) => setDraft((d) => ({ ...d, fullDescription: e.target.value }))}
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed"
            />
          </div>

          {/* External link */}
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Bağlantı URL <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="url"
              value={draft.externalLink}
              onChange={(e) => setDraft((d) => ({ ...d, externalLink: e.target.value }))}
              placeholder="https://"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          {/* Country / Category / Deadline */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Ülke <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={draft.country}
                onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="">—</option>
                {countryOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="">—</option>
                {categoryOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Son tarih <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="date"
                value={draft.deadline}
                onChange={(e) => setDraft((d) => ({ ...d, deadline: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Kapak görseli URL (opsiyonel)
            </label>
            <input
              type="url"
              value={draft.coverImage ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, coverImage: e.target.value || undefined }))}
              placeholder="https://"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <input
              id="opp-featured"
              type="checkbox"
              checked={draft.featured ?? false}
              onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 accent-brand-700"
            />
            <label htmlFor="opp-featured" className="text-sm font-medium text-slate-700">
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
