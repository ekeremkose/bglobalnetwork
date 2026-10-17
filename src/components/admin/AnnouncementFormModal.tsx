"use client";

import { useEffect, useState } from "react";
import type { Announcement } from "@/lib/types/content";
import { slugify } from "@/lib/utils/slug";

type Props = {
  item: Announcement | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Announcement) => void;
};

function emptyAnnouncement(): Announcement {
  return {
    id: `ann-${Date.now()}`,
    slug: "",
    title: "",
    content: "",
    publishedAt: new Date().toISOString().split("T")[0],
    featured: false,
  };
}

export function AnnouncementFormModal({ item, open, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Announcement>(emptyAnnouncement);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(item ? { ...item } : emptyAnnouncement());
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
      aria-labelledby="ann-form-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="ann-form-title" className="text-lg font-semibold text-slate-900">
            {item ? "Duyuruyu Düzenle" : "Yeni Duyuru"}
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

          <div>
            <label className="text-xs font-semibold text-slate-600">Slug</label>
            <input
              required
              value={draft.slug}
              onChange={(e) => { setSlugTouched(true); setDraft((d) => ({ ...d, slug: e.target.value })); }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm text-slate-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              İçerik <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={10}
              value={draft.content}
              onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Yayın tarihi <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="date"
                value={draft.publishedAt}
                onChange={(e) => setDraft((d) => ({ ...d, publishedAt: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Dış bağlantı (opsiyonel)
              </label>
              <input
                type="url"
                value={draft.link ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, link: e.target.value || undefined }))}
                placeholder="https://"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

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

          <div className="flex items-center gap-3">
            <input
              id="ann-featured"
              type="checkbox"
              checked={draft.featured ?? false}
              onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 accent-brand-700"
            />
            <label htmlFor="ann-featured" className="text-sm font-medium text-slate-700">
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
