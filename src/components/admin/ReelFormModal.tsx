"use client";

import { useEffect, useState } from "react";
import type { Reel } from "@/lib/types/content";
import { slugify } from "@/lib/utils/slug";
import { fetchInstagramThumbnail } from "@/app/admin/reels/actions";

type Props = {
  item: Reel | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Reel) => void;
};

type FetchState = "idle" | "loading" | "success" | "error";

function emptyReel(): Reel {
  return {
    id: `reel-${Date.now()}`,
    slug: "",
    title: "",
    shortDescription: "",
    instagramUrl: "",
    tag: "",
    featured: false,
    publishedAt: new Date().toISOString().split("T")[0],
  };
}

export function ReelFormModal({ item, open, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Reel>(emptyReel);
  const [slugTouched, setSlugTouched] = useState(false);
  const [fetchState, setFetchState] = useState<FetchState>("idle");

  useEffect(() => {
    if (open) {
      setDraft(item ? { ...item } : emptyReel());
      setSlugTouched(!!item);
      setFetchState("idle");
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

  async function handleFetchThumbnail() {
    if (!draft.instagramUrl) return;
    setFetchState("loading");
    const url = await fetchInstagramThumbnail(draft.instagramUrl);
    if (url) {
      setDraft((d) => ({ ...d, thumbnail: url }));
      setFetchState("success");
    } else {
      setFetchState("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reel-form-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="reel-form-title" className="text-lg font-semibold text-slate-900">
            {item ? "Reel'i Düzenle" : "Yeni Reel"}
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
              Kısa açıklama <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={draft.shortDescription}
              onChange={(e) => setDraft((d) => ({ ...d, shortDescription: e.target.value }))}
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed"
            />
          </div>

          {/* Instagram URL + thumbnail fetch */}
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Instagram URL <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="url"
              value={draft.instagramUrl}
              onChange={(e) => {
                setDraft((d) => ({ ...d, instagramUrl: e.target.value }));
                setFetchState("idle");
              }}
              placeholder="https://www.instagram.com/reel/..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-600">Thumbnail</label>
              <button
                type="button"
                disabled={!draft.instagramUrl || fetchState === "loading"}
                onClick={handleFetchThumbnail}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {fetchState === "loading" ? "Getiriliyor…" : "Instagram'dan Getir"}
              </button>
            </div>
            <input
              type="url"
              value={draft.thumbnail ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, thumbnail: e.target.value || undefined }))}
              placeholder="https:// — otomatik doldurulur veya manuel girin"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
            {fetchState === "success" && (
              <p className="mt-1 text-xs font-medium text-emerald-600">✓ Thumbnail getirildi</p>
            )}
            {fetchState === "error" && (
              <p className="mt-1 text-xs text-amber-600">Instagram thumbnail alınamadı &mdash; lütfen URL&apos;yi manuel girin.</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Etiket <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={draft.tag}
                onChange={(e) => setDraft((d) => ({ ...d, tag: e.target.value }))}
                placeholder="Erasmus+, Staj, Burs..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
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
          </div>

          <div className="flex items-center gap-3">
            <input
              id="reel-featured"
              type="checkbox"
              checked={draft.featured ?? false}
              onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 accent-brand-700"
            />
            <label htmlFor="reel-featured" className="text-sm font-medium text-slate-700">
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
